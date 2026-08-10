import React from "react";
import { Terminal as TerminalIcon, X, Minimize2, Maximize2 } from "lucide-react";

interface TerminalHeaderProps {
  isMaximized: boolean;
  onClose: () => void;
  onToggleMaximize: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  isMaximized,
  onClose,
  onToggleMaximize,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 select-none">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:opacity-100"
          onClick={onClose}
        />
        <div
          className="w-3 h-3 rounded-full bg-yellow-500/80 cursor-pointer hover:opacity-100"
          onClick={onToggleMaximize}
        />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs font-mono text-zinc-400 flex items-center gap-1.5">
          <TerminalIcon className="w-3.5 h-3.5 text-green-400" />
          sabbir@agent-cli: ~
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMaximize}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
        >
          {isMaximized ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
        <button
          onClick={onClose}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
