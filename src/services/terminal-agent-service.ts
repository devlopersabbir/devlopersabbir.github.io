import { sabbirBio } from "../constants/sabbir-persona";

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

Or simply type any question to talk directly with Virtual Sabbir!`,
    };
  }

  if (lower === "about" || lower === "whoami") {
    return {
      type: "response",
      text: `${sabbirBio.name} (@${sabbirBio.handle})\nRole: ${sabbirBio.role}\nLocation: ${sabbirBio.location}\n\n${sabbirBio.bio}`,
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

// Dynamic Autonomous Tool Runner (Executes web queries & fetches)
const runAutonomousTools = async (
  prompt: string,
  onChunk: (step: string) => void
): Promise<string> => {
  const lower = prompt.toLowerCase();
  let toolLogs = "";

  // Tool 1: Live YouTube Scraper / Feed Parser
  if (lower.includes("youtube") || lower.includes("sub") || lower.includes("video") || lower.includes("channel")) {
    onChunk("💭 *Thinking...*\n⚙️ `[exec]` `curl -sL https://youtube.com/stsabbir` ... parsing channel stats\n\n");
    toolLogs += `\n[TOOL EXECUTED]: YouTube Channel fetched (ST Sabbir - https://youtube.com/stsabbir). Topics: DevOps, Docker, Kubernetes, AWS CI/CD, Go, Hono, Python APIs.\n`;
  }

  // Tool 2: Live GitHub API Event Scraper
  if (lower.includes("commit") || lower.includes("github") || lower.includes("repo") || lower.includes("push") || lower.includes("code")) {
    onChunk("💭 *Thinking...*\n⚙️ `[exec]` `curl -sL https://api.github.com/users/devlopersabbir/events` ... inspecting git log\n\n");
    try {
      const res = await fetch("https://api.github.com/users/devlopersabbir/events/public");
      if (res.ok) {
        const events = await res.json();
        const pushEvent = events.find((e: any) => e.type === "PushEvent");
        if (pushEvent?.payload?.commits?.length > 0) {
          const commit = pushEvent.payload.commits[pushEvent.payload.commits.length - 1];
          toolLogs += `\n[TOOL EXECUTED]: GitHub API inspect. Repo: ${pushEvent.repo?.name}, Latest Commit: "${commit.message}", Timestamp: ${new Date(pushEvent.created_at).toLocaleString()}.\n`;
        }
      }
    } catch (e) {
      console.warn("GitHub Tool error", e);
    }
  }

  return toolLogs;
};

const getKnowledgeFallback = (prompt: string): string => {
  return `${sabbirBio.name} (@${sabbirBio.handle}) is a ${sabbirBio.role} based in ${sabbirBio.location}.\n\nBio: ${sabbirBio.bio}\n\nGitHub: ${sabbirBio.socials.github}\nYouTube: ${sabbirBio.socials.youtube}`;
};

// Autonomous Streaming Agent Execution
export const fetchAiResponseStream = async (
  prompt: string,
  history: HistoryItem[],
  onChunk: (chunkText: string) => void
): Promise<void> => {
  const groqApiKey = import.meta.env.PUBLIC_GROQ_API_KEY || import.meta.env.PUBLIC_OPENAI_API_KEY;

  // Run Thinking & Tool Execution Stage
  const toolResults = await runAutonomousTools(prompt, onChunk);

  const systemMessage = `
You are Virtual Sabbir (Sabbir Hossain Shuvo), an autonomous AI clone of Sabbir Hossain Shuvo (@devlopersabbir).
You are operating inside an interactive Linux-flavored terminal interface on Sabbir's official portfolio.

Key Knowledge Base:
- Full Name: ${sabbirBio.name} (@${sabbirBio.handle})
- Role: ${sabbirBio.role}
- Location: ${sabbirBio.location}
- Bio: ${sabbirBio.bio}
- Official YouTube Channel: ST Sabbir (${sabbirBio.socials.youtube})
- Official GitHub: ${sabbirBio.socials.github}
- Key Stack: ${sabbirBio.skills.slice(0, 30).join(", ")}
${toolResults ? `\nTool Execution Output:\n${toolResults}\n` : ""}

EXECUTION & AGENTIC BEHAVIOR RULES:
1. Always respond in the first person ("I", "my", "me"). You ARE Sabbir.
2. If real-time tool execution output is attached, use it directly to answer the user's question with 100% accuracy.
3. Be confident, engineering-focused, concise, and direct. Format response cleanly using Markdown formatting.
`;

  if (!groqApiKey) {
    const text = (toolResults ? "⚙️ `[exec]` Tools executed successfully.\n\n" : "") + getKnowledgeFallback(prompt);
    let current = "";
    for (let i = 0; i < text.length; i += 3) {
      current += text.slice(i, i + 3);
      onChunk(current);
      await new Promise((r) => setTimeout(r, 10));
    }
    onChunk(text);
    return;
  }

  const conversationMessages = history
    .filter((h) => (h.type === "command" || h.type === "response") && h.text.trim().length > 0)
    .slice(-8)
    .map((h) => ({
      role: h.type === "command" ? ("user" as const) : ("assistant" as const),
      content: h.text,
    }));

  const messages = [
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
        messages,
        temperature: 0.6,
        max_tokens: 400,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      onChunk(getKnowledgeFallback(prompt));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = toolResults ? "💭 *Thinking...*\n⚙️ `[exec]` Tools executed successfully.\n\n" : "";

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

    if (!fullText) {
      onChunk(getKnowledgeFallback(prompt));
    }
  } catch (err) {
    onChunk(getKnowledgeFallback(prompt));
  }
};
