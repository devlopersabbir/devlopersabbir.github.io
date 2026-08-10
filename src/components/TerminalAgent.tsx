import React, { useState, useEffect, useRef } from "react";
import {
  executeStaticCommand,
  fetchAiResponse,
  type HistoryItem,
} from "../services/terminal-agent-service";
import { TerminalHeader } from "./terminal/TerminalHeader";
import { TerminalBody } from "./terminal/TerminalBody";
import { TerminalInput } from "./terminal/TerminalInput";
import { TerminalTrigger } from "./terminal/TerminalTrigger";

export const TerminalAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      type: "system",
      text: `Sabbir OS v2.5.0 (x86_64-pc-linux-gnu)\nType 'help' for available commands or ask any question to chat with Virtual Sabbir.`,
    },
  ]);

  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdIndex, setCmdIndex] = useState<number>(-1);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isK = e.key?.toLowerCase() === "k" || e.code === "KeyK";
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (isK && (e.metaKey || e.ctrlKey || !isInput)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
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
    try {
      const reply = await fetchAiResponse(trimmed);
      setHistory((prev) => [...prev, { type: "response", text: reply }]);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
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
