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
      text: `Technical Stack & Expertise:\n${sabbirBio.skills
        .slice(0, 35)
        .map((s: string) => ` • ${s}`)
        .join(
          "\n",
        )}\n ...and 100+ more across DevOps, cloud & backend engineering.`,
    };
  }

  if (lower === "projects") {
    return {
      type: "response",
      text: `Featured Projects:\n${sabbirBio.projects
        .slice(0, 6)
        .map(
          (p: { name: string; description: string; url: string }) =>
            `🚀 ${p.name}\n   ${p.description}\n   URL: ${p.url}`,
        )
        .join("\n\n")}`,
    };
  }

  if (lower === "contact") {
    return {
      type: "response",
      text: `Contact & Social Links:\n ✉️ Email: ${sabbirBio.socials.email}\n 🐙 GitHub: ${sabbirBio.socials.github}\n 💼 LinkedIn: ${sabbirBio.socials.linkedin}`,
    };
  }

  return null;
};

// Smart Local Fallback Search Engine
const searchLocalKnowledge = (query: string): string => {
  const lower = query.toLowerCase();

  if (
    lower.includes("commit") ||
    lower.includes("github") ||
    lower.includes("repo") ||
    lower.includes("git")
  ) {
    return `You can check my latest code commits, active projects, and repositories on my official GitHub profile: ${sabbirBio.socials.github} (@${sabbirBio.handle}).`;
  }

  if (
    lower.includes("skill") ||
    lower.includes("tech") ||
    lower.includes("stack") ||
    lower.includes("language")
  ) {
    const topSkills = sabbirBio.skills.slice(0, 20).join(", ");
    return `My core stack includes: ${topSkills}. I focus heavily on backend architecture, DevOps, cloud infrastructure, Go, Node.js, Python, and Kubernetes.`;
  }

  if (
    lower.includes("project") ||
    lower.includes("work") ||
    lower.includes("built")
  ) {
    const featured = sabbirBio.projects
      .slice(0, 3)
      .map((p) => `• ${p.name}: ${p.description}`)
      .join("\n");
    return `Here are a few key projects I've built:\n${featured}\n\nType 'projects' for a larger list!`;
  }

  if (
    lower.includes("hire") ||
    lower.includes("contact") ||
    lower.includes("email") ||
    lower.includes("job")
  ) {
    return `You can reach out to me via email at ${sabbirBio.socials.email} or check my GitHub @${sabbirBio.handle}. You can also type 'sudo hire' to open my hire form!`;
  }

  if (
    lower.includes("who") ||
    lower.includes("sabbir") ||
    lower.includes("about") ||
    lower.includes("experience")
  ) {
    return `${sabbirBio.bio}\n\nI have over 4+ years of software engineering & technical leadership experience.`;
  }

  return `I am Virtual Sabbir (@${sabbirBio.handle}). I specialize in ${sabbirBio.role} focusing on scalable distributed systems, Docker, Kubernetes, CI/CD, Go, and TypeScript. Ask me about my skills, projects, or experience!`;
};

export const fetchAiResponse = async (prompt: string): Promise<string> => {
  const groqApiKey = import.meta.env.PUBLIC_GROQ_API_KEY;

  if (!groqApiKey) {
    return searchLocalKnowledge(prompt);
  }

  const systemMessage = `
You are Virtual Sabbir (Sabbir Hossain Shuvo), an AI clone of Sabbir Hossain Shuvo (@devlopersabbir).
You are answering visitors on Sabbir's portfolio via an interactive CLI terminal.

Identity Guidelines:
1. Always respond in the first person ("I", "my", "me"). You ARE Sabbir.
2. Maintain a friendly, technical, confident, and direct tone of a Senior Software & DevOps Engineer.
3. Keep responses concise, clear, and terminal-friendly.
4. Base your background details on:
   - Full Name: ${sabbirBio.name} (@${sabbirBio.handle})
   - Role: ${sabbirBio.role}
   - Location: ${sabbirBio.location}
   - Bio: ${sabbirBio.bio}
   - Key Skills: ${sabbirBio.skills.slice(0, 40).join(", ")}
   - Contact Email: ${sabbirBio.socials.email}
   - GitHub: ${sabbirBio.socials.github}

If asked about hiring, invite them to visit /hire-me or type 'sudo hire'.
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
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 450,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn(
        "Groq API call error, using local persona knowledge:",
        data?.error?.message,
      );
      return searchLocalKnowledge(prompt);
    }

    return data.choices?.[0]?.message?.content || searchLocalKnowledge(prompt);
  } catch (err) {
    console.warn("Groq API network error, using local persona knowledge:", err);
    return searchLocalKnowledge(prompt);
  }
};
