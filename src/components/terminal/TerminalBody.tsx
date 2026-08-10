import React, { useRef, useState, type RefObject } from "react";
import type { HistoryItem } from "../../services/terminal-agent-service";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface TerminalBodyProps {
  history: HistoryItem[];
  loading: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
}

/** Tiny copy button for pre/code trace blocks */
const TraceCopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-all duration-150 cursor-pointer
        ${copied
          ? "bg-emerald-900/80 border-emerald-600 text-emerald-300"
          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
        }`}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
};

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
            <div className="space-y-2">
              {item.trace && (
                <details className="p-2.5 bg-zinc-950/90 border border-zinc-800/90 rounded-md text-xs font-mono group transition-all" open>
                  <summary className="cursor-pointer font-medium text-emerald-400 hover:text-emerald-300 select-none flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="transition-transform duration-200 group-open:rotate-90 inline-block text-[10px] text-zinc-400">▶</span>
                      <span>🔍 <strong>AI Thinking Process &amp; Sandbox Pipeline</strong></span>
                    </span>
                    <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {item.trace.executionTimeMs || 0}ms
                    </span>
                  </summary>

                  <div className="mt-2.5 space-y-2 border-t border-zinc-800/80 pt-2 text-zinc-300">
                    {item.trace.thought && (
                      <div>
                        <span className="text-purple-400 font-semibold">💭 Thinking Process:</span>
                        <p className="text-zinc-400 mt-0.5">{item.trace.thought}</p>
                      </div>
                    )}

                    {item.trace.code && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-yellow-400 font-semibold">⚡ Executed Sandbox JS Code:</span>
                          <TraceCopyButton text={item.trace.code} />
                        </div>
                        <pre className="bg-zinc-900 p-2 rounded text-amber-300 border border-zinc-800 overflow-x-auto whitespace-pre-wrap">
                          <code>{item.trace.code}</code>
                        </pre>
                      </div>
                    )}

                    {item.trace.payload && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={item.trace.success !== false ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                            {item.trace.success !== false ? "✅ Sandbox Payload Data:" : "❌ Sandbox Execution Error:"}
                          </span>
                          <TraceCopyButton text={item.trace.payload} />
                        </div>
                        <pre className="bg-zinc-900 p-2 rounded text-zinc-200 border border-zinc-800 overflow-x-auto max-h-48 whitespace-pre-wrap">
                          <code>{item.trace.payload}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {item.text && <MarkdownRenderer content={item.text} />}
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
