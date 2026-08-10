/**
 * Terminal Agent Service
 * Re-exports isolated AI module services and handles static CLI commands.
 */

import { sabbirBio } from "../constants/sabbir-persona";
import type { HistoryItem } from "./ai";

export * from "./ai";

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
      text: `Contact & Social Links:\n ✉️ Email: ${sabbirBio.socials.email}\n 🐙 GitHub: ${sabbirBio.socials.github}\n 💼 LinkedIn: ${sabbirBio.socials.linkedin}\n 🎥 YouTube: ${sabbirBio.socials.youtube}`,
    };
  }

  return null;
};
