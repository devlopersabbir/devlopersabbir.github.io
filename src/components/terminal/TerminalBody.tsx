import React, { type RefObject } from "react";
import type { HistoryItem } from "../../services/terminal-agent-service";

interface TerminalBodyProps {
  history: HistoryItem[];
  loading: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
}

export const TerminalBody: React.FC<TerminalBodyProps> = ({
  history,
  loading,
  bottomRef,
}) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs md:text-sm space-y-3 leading-relaxed">
      {history.map((item, idx) => (
        <div key={idx} className="space-y-1">
          {item.type === "command" && (
            <div className="flex items-center gap-2 text-green-400">
              <span className="text-zinc-500">sabbir@cli:~$</span>
              <span>{item.text}</span>
            </div>
          )}
          {item.type === "system" && (
            <div className="text-zinc-400 whitespace-pre-wrap">
              {item.text}
            </div>
          )}
          {item.type === "response" && (
            <div className="text-zinc-200 whitespace-pre-wrap pl-3 border-l-2 border-green-500/40 bg-zinc-900/40 py-1 rounded-r">
              {item.text}
            </div>
          )}
          {item.type === "error" && (
            <div className="text-red-400 bg-red-950/30 p-2 rounded border border-red-900/40 whitespace-pre-wrap">
              {item.text}
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
          <span>&gt;_ Virtual Sabbir is thinking...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
