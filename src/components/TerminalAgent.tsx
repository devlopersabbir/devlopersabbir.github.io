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

  // 2 minutes (120,000 ms) timeout after completely leaving the site
  const LEAVE_SITE_TIMEOUT_MS = 2 * 60 * 1000;

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);

    try {
      const lastLeaveTime = localStorage.getItem("sabbir_ai_leave_time");
      const storedHistory = localStorage.getItem("sabbir_ai_history");
      const storedCmdHistory = localStorage.getItem("sabbir_ai_cmd_history");

      // Check if user left the site completely for more than 2 minutes
      if (lastLeaveTime && Date.now() - parseInt(lastLeaveTime, 10) > LEAVE_SITE_TIMEOUT_MS) {
        localStorage.removeItem("sabbir_ai_history");
        localStorage.removeItem("sabbir_ai_cmd_history");
        localStorage.removeItem("sabbir_ai_leave_time");
      } else {
        if (storedHistory) setHistory(JSON.parse(storedHistory));
        if (storedCmdHistory) setCmdHistory(JSON.parse(storedCmdHistory));
        // Reset leave timer since user is currently on site
        localStorage.removeItem("sabbir_ai_leave_time");
      }
    } catch (e) {
      console.warn("Could not restore AI session", e);
    }

    // When tab/browser is closed or user navigates away from domain, record leave timestamp
    const handleUnload = () => {
      localStorage.setItem("sabbir_ai_leave_time", Date.now().toString());
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // Sync active chat history to storage continuously while user is browsing portfolio
  useEffect(() => {
    try {
      localStorage.setItem("sabbir_ai_history", JSON.stringify(history));
      localStorage.setItem("sabbir_ai_cmd_history", JSON.stringify(cmdHistory));
    } catch (e) {
      console.warn("Could not persist AI session", e);
    }
  }, [history, cmdHistory]);

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
