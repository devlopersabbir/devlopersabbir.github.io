import { sabbirBio } from "../constants/sabbir-persona";
import { executeInSandbox } from "./sandbox-service";

export interface HistoryItem {
  type: "command" | "response" | "system" | "error";
  text: string;
}

export const executeStaticCommand = (cmdString: string): HistoryItem | null => {
  const lower = cmdString.trim().toLowerCase();

  if (lower === "help") {
    return {
      type: "response",
      text: `Available Built-in Commands:
  • help       - Show this help menu
  • about      - Brief bio about Sabbir
  • skills     - List technical skills & tech stack
  • projects   - List featured projects
  • contact    - Get email & social links
  • sudo hire  - Navigate to hire me page
  • clear      - Clear terminal screen

Or simply ask any question to chat with Virtual Sabbir!`,
    };
  }

  if (lower === "about" || lower === "whoami") {
    return {
      type: "response",
      text: `It's me Sabbir here...\n\n${sabbirBio.name} (@${sabbirBio.handle})\nRole: ${sabbirBio.role}\nLocation: ${sabbirBio.location}\n\n${sabbirBio.bio}`,
    };
  }

  if (lower === "skills") {
    return {
      type: "response",
      text: `Technical Stack & Expertise:\n${sabbirBio.skills.slice(0, 35).map((s: string) => ` • ${s}`).join("\n")}\n ...and 100+ more across DevOps, cloud & backend engineering.`,
    };
  }

  if (lower === "projects") {
    return {
      type: "response",
      text: `Featured Projects:\n${sabbirBio.projects
        .slice(0, 6)
        .map((p: { name: string; description: string; url: string }) => `🚀 ${p.name}\n   ${p.description}\n   URL: ${p.url}`)
        .join("\n\n")}`,
    };
  }

  if (lower === "contact") {
    return {
      type: "response",
      text: `Contact & Social Links:\n ✉️ Email: ${sabbirBio.socials.email}\n 🐙 GitHub: ${sabbirBio.socials.github}\n 💼 LinkedIn: ${sabbirBio.socials.linkedin}\n 🎥 YouTube: ${sabbirBio.socials.youtube}`,
    };
  }

  return null;
};

const getKnowledgeFallback = (prompt: string): string => {
  return `It's me Sabbir here...\n\n${sabbirBio.name} (@${sabbirBio.handle}) is a ${sabbirBio.role} based in ${sabbirBio.location}.\n\nBio: ${sabbirBio.bio}\n\nGitHub: ${sabbirBio.socials.github}\nYouTube: ${sabbirBio.socials.youtube}`;
};

// ----------------------------------------------------
// Memory & Continuous Session Learning System
// ----------------------------------------------------
const MEMORY_STORAGE_KEY = "sabbir_ai_learned_memories";

export const getLearnedMemories = (): string[] => {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLearnedMemory = (insight: string): void => {
  if (!insight || insight.trim().length === 0) return;
  try {
    const memories = getLearnedMemories();
    const cleanInsight = insight.trim();
    if (!memories.includes(cleanInsight)) {
      memories.push(cleanInsight);
      if (memories.length > 20) memories.shift();
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
    }
  } catch (e) {
    console.warn("Could not save AI memory", e);
  }
};

interface PlanningDecision {
  thought_process: string;
  enhanced_prompt: string;
  requires_code: boolean;
  code?: string;
  learned_insight?: string;
}

/**
 * Step 1: Intelligent Planner & Learning Engine
 */
const planAndEnhancePrompt = async (
  prompt: string,
  historyMessages: { role: "user" | "assistant"; content: string }[],
  groqApiKey: string
): Promise<PlanningDecision> => {
  const existingMemories = getLearnedMemories();

  const plannerSystemPrompt = `
You are an advanced AI Agent Planner, Prompt Enhancer, and Code Generator.

Tasks:
1. Analyze user prompt and history.
2. Determine if fetching real-time external data (via JS fetch) is required ("requires_code": true|false).
   - Set "requires_code": true whenever the user asks for real-time external information such as YouTube channel stats, playlists, videos, GitHub user metrics, public IP, weather, currency, or live web data.
3. If external data is needed, generate executable async JS fetch code ("code") returning JSON or structured object.
   Example for YouTube / GitHub / Public APIs:
   const res = await fetch("https://api.github.com/users/devlopersabbir/events/public");
   const data = await res.json();
   return data;
4. NEVER generate curl commands, shell commands, or pseudo code. Output ONLY valid executable JavaScript fetch code inside "code".
5. If prompt is a simple chat/greeting (e.g., "hi", "hello", "who are you"), set "requires_code": false.
6. If the user provides feedback, preferences, or corrections (e.g. "my name is Alex", "be more concise"), extract a short summary in "learned_insight".

${existingMemories.length > 0 ? `Currently Learned Memories / Preferences:\n${existingMemories.map(m => `- ${m}`).join("\n")}\n` : ""}

Output Format: Strictly valid JSON matching this schema:
{
  "thought_process": "Brief interpretation",
  "enhanced_prompt": "Refined query or original prompt for simple chat",
  "requires_code": true|false,
  "code": "Async fetch JS code if needed, else omit",
  "learned_insight": "Extracted user feedback or preference rule if present, else omit"
}
`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: plannerSystemPrompt },
          ...historyMessages,
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      return {
        thought_process: "Direct prompt processing",
        enhanced_prompt: prompt,
        requires_code: false,
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        thought_process: "Direct prompt processing",
        enhanced_prompt: prompt,
        requires_code: false,
      };
    }

    const parsed: PlanningDecision = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.warn("Planner step error:", err);
    return {
      thought_process: "Direct prompt processing",
      enhanced_prompt: prompt,
      requires_code: false,
    };
  }
};

/**
 * Main Interactive Autonomous Agent Loop
 */
export const fetchAiResponseStream = async (
  prompt: string,
  history: HistoryItem[],
  onChunk: (chunkText: string) => void
): Promise<void> => {
  const groqApiKey = import.meta.env.PUBLIC_GROQ_API_KEY || import.meta.env.PUBLIC_OPENAI_API_KEY;

  const conversationMessages = history
    .filter((h) => (h.type === "command" || h.type === "response") && h.text.trim().length > 0)
    .slice(-8)
    .map((h) => ({
      role: h.type === "command" ? ("user" as const) : ("assistant" as const),
      content: h.text,
    }));

  if (!groqApiKey) {
    onChunk(getKnowledgeFallback(prompt));
    return;
  }

  // Step 1: Decision & Prompt Planning Phase
  const plan = await planAndEnhancePrompt(prompt, conversationMessages, groqApiKey);

  if (plan.learned_insight) {
    saveLearnedMemory(plan.learned_insight);
  }

  const existingMemories = getLearnedMemories();

  let agentTraceHtml = "";
  let toolExecutionSummary = "";

  // Check if query is about YouTube/GitHub and planner missed code generation
  const lowerPrompt = prompt.toLowerCase();
  let codeToRun = plan.code;
  let forceCodeExec = plan.requires_code;

  if (!forceCodeExec && (lowerPrompt.includes("youtube") || lowerPrompt.includes("playlist") || lowerPrompt.includes("video") || lowerPrompt.includes("github"))) {
    forceCodeExec = true;
    if (lowerPrompt.includes("github")) {
      codeToRun = `
        const res = await fetch("https://api.github.com/users/devlopersabbir/repos?sort=updated&per_page=10");
        const data = await res.json();
        return Array.isArray(data) ? data.map(r => ({ name: r.name, stars: r.stargazers_count, url: r.html_url })) : data;
      `;
    } else {
      codeToRun = `
        const res = await fetch("https://api.github.com/users/devlopersabbir/events/public");
        const data = await res.json();
        return Array.isArray(data) ? data.slice(0, 5).map(e => ({ type: e.type, repo: e.repo?.name, created_at: e.created_at })) : { channel: "ST Sabbir", url: "https://youtube.com/stsabbir" };
      `;
    }
  }

  // Step 2: Execute Sandbox Code if external data is required
  if (forceCodeExec && codeToRun) {
    const executionResult = await executeInSandbox(codeToRun, 5000);

    const formattedData = executionResult.success
      ? (typeof executionResult.data === "object" ? JSON.stringify(executionResult.data, null, 2) : String(executionResult.data))
      : executionResult.error;

    toolExecutionSummary = executionResult.success
      ? `[SANDBOX DATA PAYLOAD]:\n${formattedData}\n`
      : `[SANDBOX EXECUTION ERROR]:\n${executionResult.error}\n`;

    // Collapsible trace box contains ALL code, fetch details, and raw JSON payload
    agentTraceHtml = `
<details class="my-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono transition-all">
  <summary class="cursor-pointer font-semibold text-emerald-400 hover:text-emerald-300 select-none flex items-center justify-between">
    <span>🔍 <strong>AI Agent Execution Trace & Sandbox Data Pipeline</strong></span>
    <span class="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">${executionResult.executionTimeMs || 0}ms</span>
  </summary>
  
  <div class="mt-3 space-y-2 border-t border-zinc-800/80 pt-2 text-zinc-300">
    <div>
      <span class="text-purple-400 font-semibold">🧠 Thought Process:</span>
      <p class="text-zinc-400 mt-0.5">${plan.thought_process || "Fetching external live data for query."}</p>
    </div>
    
    <div>
      <span class="text-blue-400 font-semibold">🎯 Enhanced Prompt:</span>
      <p class="text-zinc-300 italic mt-0.5">"${plan.enhanced_prompt || prompt}"</p>
    </div>
    
    <div>
      <span class="text-yellow-400 font-semibold">⚡ Executed Sandbox JS Fetch Code:</span>
      <pre class="mt-1 bg-zinc-900 p-2 rounded text-amber-300 border border-zinc-800 overflow-x-auto"><code>${codeToRun.trim()}</code></pre>
    </div>

    <div>
      <span class="${executionResult.success ? "text-emerald-400" : "text-red-400"} font-semibold">
        ${executionResult.success ? "✅ Sandbox Output Data Payload:" : "❌ Sandbox Execution Error:"}
      </span>
      <pre class="mt-1 bg-zinc-900 p-2 rounded text-zinc-200 border border-zinc-800 overflow-x-auto max-h-48"><code>${formattedData}</code></pre>
    </div>
  </div>
</details>

`;
  }

  // Step 3: Single Clean Human-Readable Output Generation
  const systemMessage = `
You are Virtual Sabbir (Sabbir Hossain Shuvo), an autonomous AI clone of Sabbir Hossain Shuvo (@devlopersabbir).
You are operating inside an interactive Linux-flavored terminal interface on Sabbir's official portfolio.

Key Knowledge Base:
- Full Name: ${sabbirBio.name} (@${sabbirBio.handle})
- Role: ${sabbirBio.role}
- Location: ${sabbirBio.location}
- Bio: ${sabbirBio.bio}
- Official YouTube Channel: ST Sabbir (${sabbirBio.socials.youtube}) - Topics: DevOps, Docker, Kubernetes, AWS CI/CD, Go, Hono, Python APIs, System Design.
- Official GitHub: ${sabbirBio.socials.github}
- Key Stack: ${sabbirBio.skills.slice(0, 30).join(", ")}

${existingMemories.length > 0 ? `Learned User Preferences & Session Memory:\n${existingMemories.map(m => `- ${m}`).join("\n")}\n` : ""}
${toolExecutionSummary ? `Sandbox Dynamic Data Context:\n${toolExecutionSummary}\n` : ""}

CRITICAL OUTPUT RULES:
1. Always respond in the first person ("I", "my", "me"). You ARE Sabbir.
2. If the user provides any greeting or introduction query (such as "hi", "hello", "hey", "who are you", "who r u", "whoami"), ALWAYS start your response directly with "It's me Sabbir here...".
3. STRICT OUTPUT RULE: DO NOT write curl commands, shell scripts, fake terminal outputs, jq commands, or raw JSON snippets in your final output text! All technical execution traces belong strictly inside the sandbox trace pipeline above.
4. Convert any Sandbox Dynamic Data Context or knowledge base facts into a single, beautifully structured, human-readable natural response.
5. Adhere strictly to any Learned User Preferences listed above.
6. Be concise, engineering-focused, friendly, and natural.
`;

  const finalMessages = [
    { role: "system" as const, content: systemMessage },
    ...conversationMessages,
    { role: "user" as const, content: forceCodeExec ? (plan.enhanced_prompt || prompt) : prompt },
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
        temperature: 0.5,
        max_tokens: 450,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      onChunk(agentTraceHtml + getKnowledgeFallback(prompt));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = agentTraceHtml;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim().startsWith("data: "));

      for (const line of lines) {
        const jsonStr = line.replace(/^data:\s*/, "").trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content;
          if (delta) {
            fullText += delta;
            onChunk(fullText);
          }
        } catch (e) {
          // Ignore partial chunk parse error
        }
      }
    }

    if (!fullText || fullText === agentTraceHtml) {
      onChunk(agentTraceHtml + getKnowledgeFallback(prompt));
    }
  } catch (err) {
    onChunk(agentTraceHtml + getKnowledgeFallback(prompt));
  }
};
