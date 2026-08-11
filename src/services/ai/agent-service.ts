/**
 * Main AI Agent Orchestration Service
 *
 * Manages the complete dynamic agent flow:
 * User Prompt -> LLM Planner (JSON Decision & Code Generation) -> Sandbox Execution -> Groq Stream Answer
 */

import { executeInSandbox, cleanCodeString } from "./sandbox-service";
import { getLearnedMemories } from "./memory-service";
import { planAndEnhancePrompt } from "./planner-agent";
import { buildSystemPrompt, getKnowledgeFallback } from "./system-prompt";

export interface AgentTrace {
  thought: string;
  code?: string;
  payload?: string;
  executionTimeMs?: number;
  success?: boolean;
}

export interface HistoryItem {
  type: "command" | "response" | "system" | "error";
  text: string;
  trace?: AgentTrace;
}

const MAX_EXECUTION_STEPS = 3;

export const fetchAiResponseStream = async (
  prompt: string,
  history: HistoryItem[],
  onChunk: (chunkText: string, trace?: AgentTrace) => void,
): Promise<void> => {
  const groqApiKey = import.meta.env.PUBLIC_GROQ_API_KEY || "";

  // Format history safely: summarize content to max 100 chars per message to prevent payload explosion
  const conversationMessages = history
    .filter(
      (h) =>
        (h.type === "command" || h.type === "response") &&
        h.text.trim().length > 0,
    )
    .slice(-4)
    .map((h) => ({
      role: h.type === "command" ? ("user" as const) : ("assistant" as const),
      content: h.text.length > 120 ? h.text.slice(0, 120) + "..." : h.text,
    }));

  if (!groqApiKey) {
    onChunk(getKnowledgeFallback(prompt));
    return;
  }

  const existingMemories = getLearnedMemories();

  let currentTrace: AgentTrace | undefined;
  let toolExecutionSummary = "";

  // Only trigger Planner LLM execution if query specifically requests live external data
  const cleanPrompt = prompt.trim().toLowerCase();
  const requiresLiveExecution = /(latest video|recent video|youtube video|github|follower|repo|public ip|ip address|live data|fetch)/i.test(cleanPrompt);

  if (requiresLiveExecution) {
    // Step 1: Decision & Dynamic Code Execution Loop
    for (let step = 0; step < MAX_EXECUTION_STEPS; step++) {
      const plan = await planAndEnhancePrompt(
        prompt,
        conversationMessages,
        groqApiKey,
      );

      if (!plan.needsExecution || !plan.code) {
        // No external data needed, proceed directly to final response generation
        break;
      }

      const sanitizedCode = cleanCodeString(plan.code);

      currentTrace = {
        thought: plan.reason,
        code: sanitizedCode,
      };
      onChunk("", currentTrace);

      // Execute generated JavaScript inside Sandbox
      const executionResult = await executeInSandbox(sanitizedCode, 5000);

      const formattedData = executionResult.success
        ? typeof executionResult.data === "object" &&
          executionResult.data !== null
          ? JSON.stringify(executionResult.data, null, 2)
          : JSON.stringify({ result: executionResult.data }, null, 2)
        : executionResult.error || "Sandbox execution failed";

      currentTrace = {
        thought: plan.reason,
        code: sanitizedCode,
        payload: formattedData,
        executionTimeMs: executionResult.executionTimeMs || 0,
        success: executionResult.success,
      };
      onChunk("", currentTrace);

      if (!executionResult.success) {
        // CRITICAL REQUIREMENT: If execution fails, NEVER fabricate an answer or tell user to manually visit a site.
        const failureMsg = `I couldn't retrieve the live data because the external request failed: ${executionResult.error || "Execution error"}`;
        onChunk(failureMsg, currentTrace);
        return;
      }

      toolExecutionSummary = formattedData;
      break; // Obtained data payload, proceed to generate final response
    }
  }

  // Step 2: Stream Final Answer Generation
  const systemMessage = buildSystemPrompt(
    existingMemories,
    toolExecutionSummary,
  );

  const finalMessages = [
    { role: "system" as const, content: systemMessage },
    ...conversationMessages,
    { role: "user" as const, content: prompt },
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: finalMessages,
        temperature: 0.2,
        max_tokens: 700,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const statusText =
        res.status === 429 ? "Rate limit reached (429)" : `HTTP ${res.status}`;
      onChunk(
        `I'm experiencing high demand or rate limits right now (${statusText}). Please wait a few seconds and try again!\n\nIn the meantime, feel free to use standard commands like \`skills\`, \`projects\`, or \`contact\`.`,
        currentTrace,
      );
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk
        .split("\n")
        .filter((line) => line.trim().startsWith("data: "));

      for (const line of lines) {
        const jsonStr = line.replace(/^data:\s*/, "").trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta =
            parsed.choices?.[0]?.delta?.content ||
            parsed.choices?.[0]?.message?.content;
          if (delta) {
            fullText += delta;
            onChunk(fullText, currentTrace);
          }
        } catch (e) {
          // Ignore partial chunk parse error
        }
      }
    }

    if (!fullText) {
      onChunk(
        `I received an empty response from the AI backend. Please try asking your question again!`,
        currentTrace,
      );
    }
  } catch (err: any) {
    onChunk(
      `Connection error: ${err?.message || "Failed to reach AI service"}. Please check your network and try again.`,
      currentTrace,
    );
  }
};
