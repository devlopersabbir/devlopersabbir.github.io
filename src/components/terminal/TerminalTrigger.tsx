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
      className="
        fixed bottom-6 right-6 z-[9999]
        flex items-center gap-2.5
        px-4 py-2.5 rounded-xl
        bg-zinc-900 dark:bg-zinc-100
        text-zinc-100 dark:text-zinc-900
        border border-zinc-700 dark:border-zinc-300
        shadow-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)]
        hover:scale-105 active:scale-95
        transition-all duration-200 ease-out
        font-mono text-xs cursor-pointer group
      "
      title={`Open Virtual Sabbir CLI AI Agent (${isMac ? "⌘K" : "Ctrl+K"})`}
    >
      {/* Terminal Icon with Pulse Dot */}
      <div className="relative flex items-center justify-center">
        <TerminalIcon className="w-4 h-4 text-green-400 dark:text-green-600 group-hover:rotate-6 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>

      {/* Label */}
      <span className="font-bold tracking-tight text-sm ml-2">
        ask Sabbir's AI
      </span>

      {/* Keyboard Shortcut Badge */}
      <kbd className="hidden sm:inline-flex items-center ml-1 px-1.5 py-0.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 bg-zinc-800 dark:bg-zinc-200 rounded border border-zinc-700 dark:border-zinc-300">
        {isMac ? "⌘K" : "Ctrl+K"}
      </kbd>
    </button>
  );
};
