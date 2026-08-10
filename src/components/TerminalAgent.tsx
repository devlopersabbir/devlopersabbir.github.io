import React, { useState, useEffect, useRef } from "react";
import {
  executeStaticCommand,
  fetchAiResponseStream,
} from "../services/terminal-agent-service";
import { TerminalHeader } from "./terminal/TerminalHeader";
import { TerminalBody } from "./terminal/TerminalBody";
import { TerminalInput } from "./terminal/TerminalInput";
import { TerminalTrigger } from "./terminal/TerminalTrigger";
import { useTerminalSession } from "./terminal/useTerminalSession";

export const TerminalAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const {
    history,
    setHistory,
    cmdHistory,
    setCmdHistory,
    cmdIndex,
    setCmdIndex,
    resetSession,
  } = useTerminalSession();

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable;

      const isK = e.key?.toLowerCase() === "k" || e.code === "KeyK";

      if (isK && ((e.metaKey || e.ctrlKey) || !isInput)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const executeCommand = async (cmdString: string) => {
    const trimmed = cmdString.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [...prev, trimmed]);
    setCmdIndex(-1);
    setHistory((prev) => [...prev, { type: "command", text: trimmed }]);
    setInput("");

    const lower = trimmed.toLowerCase();

    if (lower === "clear") {
      setHistory([]);
      return;
    }

    if (lower === "sudo hire" || lower === "hire") {
      setHistory((prev) => [
        ...prev,
        { type: "system", text: "Redirecting to Hire Me page..." },
      ]);
      setTimeout(() => {
        window.location.href = "/hire-me";
      }, 1000);
      return;
    }

    const staticResult = executeStaticCommand(trimmed);
    if (staticResult) {
      setHistory((prev) => [...prev, staticResult]);
      return;
    }

    setLoading(true);
    setHistory((prev) => [...prev, { type: "response", text: "" }]);

    try {
      await fetchAiResponseStream(trimmed, history, (chunkText, trace) => {
        setHistory((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx]?.type === "response") {
            updated[lastIdx] = { type: "response", text: chunkText, trace };
          }
          return updated;
        });
      });
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        { type: "error", text: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIndex =
        cmdIndex === -1 ? cmdHistory.length - 1 : Math.max(0, cmdIndex - 1);
      setCmdIndex(nextIndex);
      setInput(cmdHistory[nextIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cmdIndex === -1) return;
      const nextIndex = cmdIndex + 1;
      if (nextIndex >= cmdHistory.length) {
        setCmdIndex(-1);
        setInput("");
      } else {
        setCmdIndex(nextIndex);
        setInput(cmdHistory[nextIndex] || "");
      }
    }
  };

  return (
    <>
      <TerminalTrigger isMac={isMac} onClick={() => setIsOpen(true)} />

      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`flex flex-col bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden transition-all duration-200 ${
              isMaximized
                ? "w-full h-full"
                : "w-full max-w-3xl h-[600px] max-h-[85vh]"
            }`}
          >
            <TerminalHeader
              isMaximized={isMaximized}
              onClose={() => setIsOpen(false)}
              onToggleMaximize={() => setIsMaximized(!isMaximized)}
              onResetSession={resetSession}
            />

            <TerminalBody
              history={history}
              loading={loading}
              bottomRef={bottomRef}
            />

            <TerminalInput
              input={input}
              loading={loading}
              inputRef={inputRef}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onSubmit={() => executeCommand(input)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TerminalAgent;
