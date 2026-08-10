/**
 * AI Planner Agent
 * 
 * Determines whether user query requires live external data,
 * generates pure executable JavaScript fetch code inside sandbox context,
 * and returns strict JSON structure.
 */

import { getLearnedMemories } from "./memory-service";

export interface PlannerDecision {
  needsExecution: boolean;
  code: string | null;
  reason: string;
}

export const planAndEnhancePrompt = async (
  prompt: string,
  historyMessages: { role: "user" | "assistant"; content: string }[],
  groqApiKey: string
): Promise<PlannerDecision> => {
  const existingMemories = getLearnedMemories();

  const plannerSystemPrompt = `
You are an AI Code Execution Decision & Generation engine.
Your sole job is to decide if answering the user's prompt requires retrieving real-time / live external web data, and if so, write executable JavaScript fetch code to retrieve it.

Context Knowledge (Ground Truth — do NOT try to fetch these via RSS):
- Sabbir's official GitHub username: "devlopersabbir" (API: https://api.github.com/users/devlopersabbir)
- Sabbir's official YouTube channel: "ST Sabbir" (@STSabbir)
  Channel ID: UC-kwgB_vfZlCtI_eXijNhMw
  Channel URL: https://youtube.com/@STSabbir
  ⚠️ KNOWN LIMITATION: The YouTube public RSS feed (via rss2json.com) is HARD-CAPPED at 10 items.
     It returns EXACTLY 10 recent video items regardless of the true total.
     "video_count: 10" from RSS data does NOT mean the channel has 10 videos.
  Accurate static facts (use these directly, do NOT fetch to answer these):
    - Total videos: 175
    - Subscribers: 1.39K
- Public IP services: https://ifconfig.co/json, https://api.ipify.org?format=json, or https://ipapi.co/json

DECISION RULES:

A) SKIP EXECUTION — answer from ground-truth knowledge above (needsExecution: false):
   - "how many videos does he have?" → answer: 175 (static fact)
   - "how many subscribers?" → answer: 1.39K (static fact)
   - "what is the video count?" → answer: 175 (static fact)
   - Any question about total video count or total subscriber count on ST Sabbir's YouTube channel
   - General knowledge questions (what is docker?, greetings, identity questions, programming advice)

B) REQUIRES EXECUTION — generate live fetch code (needsExecution: true):
   - "show me latest videos" → fetch RSS to get the recent 5–10 video titles + thumbnails
   - "show most viewed video" → note: RSS does not expose view counts; generate code that fetches and returns latest items with a note
   - GitHub profile details, follower counts, repos, stars (fetch from GitHub API)
   - Public IP address, geolocation (fetch from ip services)
   - Any other genuinely live/real-time data not in the ground-truth knowledge

Rules for generated code (when needsExecution: true):
1. Set "needsExecution": true
2. Set "reason": A brief, user-safe explanation (e.g., "Fetching latest YouTube videos for ST Sabbir."). No internal CoT.
3. Set "code": Clean, multiline JavaScript with 2-space indentation, using fetch/await and explicit return { ... };
   YouTube RSS example:
   "const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.youtube.com%2Ffeeds%2Fvideos.xml%3Fchannel_id%3DUC-kwgB_vfZlCtI_eXijNhMw');\\nif (!res.ok) throw new Error(\`YouTube RSS API returned \${res.status}\`);\\nconst data = await res.json();\\nreturn {\\n  channel: data.feed?.title,\\n  latest_videos: data.items?.slice(0, 5).map(item => ({\\n    title: item.title,\\n    link: item.link,\\n    thumbnail: item.thumbnail\\n  }))\\n};"
   GitHub example:
   "const res = await fetch('https://api.github.com/users/devlopersabbir');\\nif (!res.ok) throw new Error(\`GitHub API returned \${res.status}\`);\\nconst data = await res.json();\\nreturn {\\n  followers: data.followers,\\n  public_repos: data.public_repos\\n};"

4. Output ONLY a valid JSON object:
{
  "needsExecution": boolean,
  "code": string | null,
  "reason": string
}

${existingMemories.length > 0 ? `Learned User Preferences:\n${existingMemories.map((m) => `- ${m}`).join("\n")}\n` : ""}
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
        max_tokens: 450,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.warn("Planner API request failed with status:", res.status);
      return {
        needsExecution: false,
        code: null,
        reason: "General knowledge query fallback",
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        needsExecution: false,
        code: null,
        reason: "General knowledge query fallback",
      };
    }

    console.log("[PLANNER RAW LLM RESPONSE]:", content);
    const parsed = JSON.parse(content);

    const needsExecution = Boolean(parsed.needsExecution);
    const code = typeof parsed.code === "string" && parsed.code.trim().length > 0 ? parsed.code.trim() : null;
    const reason = typeof parsed.reason === "string" ? parsed.reason : "Analyzing query";

    return {
      needsExecution: needsExecution && code !== null,
      code,
      reason,
    };
  } catch (err) {
    console.warn("Planner step error:", err);
    return {
      needsExecution: false,
      code: null,
      reason: "General knowledge query fallback",
    };
  }
};
