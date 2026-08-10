import { useState, useEffect } from "react";
import type { HistoryItem } from "../../services/terminal-agent-service";

const LEAVE_SITE_TIMEOUT_MS = 2 * 60 * 1000;

export const useTerminalSession = () => {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      type: "system",
      text: `Sabbir OS v2.5.0 (x86_64-pc-linux-gnu)\nType 'help' for available commands or ask any question to chat with Virtual Sabbir.`,
    },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdIndex, setCmdIndex] = useState<number>(-1);

  useEffect(() => {
    try {
      const lastLeaveTime = localStorage.getItem("sabbir_ai_leave_time");
      const storedHistory = localStorage.getItem("sabbir_ai_history");
      const storedCmdHistory = localStorage.getItem("sabbir_ai_cmd_history");

      if (lastLeaveTime && Date.now() - parseInt(lastLeaveTime, 10) > LEAVE_SITE_TIMEOUT_MS) {
        localStorage.removeItem("sabbir_ai_history");
        localStorage.removeItem("sabbir_ai_cmd_history");
        localStorage.removeItem("sabbir_ai_leave_time");
      } else {
        if (storedHistory) setHistory(JSON.parse(storedHistory));
        if (storedCmdHistory) setCmdHistory(JSON.parse(storedCmdHistory));
        localStorage.removeItem("sabbir_ai_leave_time");
      }
    } catch (e) {
      console.warn("Could not restore AI session", e);
    }

    const handleUnload = () => {
      localStorage.setItem("sabbir_ai_leave_time", Date.now().toString());
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("sabbir_ai_history", JSON.stringify(history));
      localStorage.setItem("sabbir_ai_cmd_history", JSON.stringify(cmdHistory));
    } catch (e) {
      console.warn("Could not persist AI session", e);
    }
  }, [history, cmdHistory]);

  const resetSession = () => {
    setHistory([
      {
        type: "system",
        text: `Sabbir OS v2.5.0 (x86_64-pc-linux-gnu)\nType 'help' for available commands or ask any question to chat with Virtual Sabbir.`,
      },
    ]);
    setCmdHistory([]);
    setCmdIndex(-1);
    try {
      localStorage.removeItem("sabbir_ai_history");
      localStorage.removeItem("sabbir_ai_cmd_history");
      localStorage.removeItem("sabbir_ai_leave_time");
    } catch (e) {
      console.warn("Could not clear AI session cache", e);
    }
  };

  return {
    history,
    setHistory,
    cmdHistory,
    setCmdHistory,
    cmdIndex,
    setCmdIndex,
    resetSession,
  };
};
