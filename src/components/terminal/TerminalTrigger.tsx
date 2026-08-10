import React from "react";
import { Terminal as TerminalIcon } from "lucide-react";

interface TerminalTriggerProps {
  isMac: boolean;
  onClick: () => void;
}

export const TerminalTrigger: React.FC<TerminalTriggerProps> = ({
  isMac,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 shadow-xl border border-zinc-700 dark:border-zinc-300 hover:scale-105 active:scale-95 transition-all text-xs font-mono group cursor-pointer"
      title={`Open Virtual Sabbir CLI AI Agent (${isMac ? "⌘K" : "Ctrl+K"})`}
    >
      <TerminalIcon className="w-4 h-4 text-green-400 dark:text-green-600 group-hover:animate-pulse" />
      <span className="font-bold tracking-tight">&gt;_ sabbir-ai</span>
      <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 bg-zinc-800 dark:bg-zinc-200 rounded border border-zinc-700 dark:border-zinc-300">
        {isMac ? "⌘K" : "Ctrl+K"}
      </kbd>
    </button>
  );
};
