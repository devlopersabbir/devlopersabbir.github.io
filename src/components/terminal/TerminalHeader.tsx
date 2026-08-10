import React from "react";
import { Terminal as TerminalIcon, X, Minimize2, Maximize2, RotateCcw } from "lucide-react";

interface TerminalHeaderProps {
  isMaximized: boolean;
  onClose: () => void;
  onToggleMaximize: () => void;
  onResetSession: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  isMaximized,
  onClose,
  onToggleMaximize,
  onResetSession,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 select-none">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:opacity-100"
          onClick={onClose}
          title="Close Terminal"
        />
        <div
          className="w-3 h-3 rounded-full bg-yellow-500/80 cursor-pointer hover:opacity-100"
          onClick={onToggleMaximize}
          title="Toggle Maximize"
        />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs font-mono text-zinc-400 flex items-center gap-1.5">
          <TerminalIcon className="w-3.5 h-3.5 text-green-400" />
          sabbir@agent-cli: ~
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* New Session / Reset Button */}
        <button
          onClick={onResetSession}
          className="flex items-center gap-1 px-2 py-0.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-green-400 transition text-[11px] font-mono cursor-pointer border border-zinc-800 hover:border-zinc-700"
          title="Start New Session (Clear Chat Memory)"
        >
          <RotateCcw className="w-3 h-3" />
          <span>New Session</span>
        </button>

        <button
          onClick={onToggleMaximize}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition cursor-pointer"
          title="Maximize / Restore"
        >
          {isMaximized ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
        <button
          onClick={onClose}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition cursor-pointer"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
