import React, { type RefObject } from "react";
import { Send } from "lucide-react";

interface TerminalInputProps {
  input: string;
  loading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  input,
  loading,
  inputRef,
  onChange,
  onKeyDown,
  onSubmit,
}) => {
  return (
    <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2 font-mono text-xs md:text-sm">
      <span className="text-green-400 shrink-0">sabbir@cli:~$</span>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Ask Virtual Sabbir anything..."
        className="flex-1 bg-transparent text-zinc-100 focus:outline-none placeholder:text-zinc-600"
      />
      <button
        onClick={onSubmit}
        disabled={loading || !input.trim()}
        className="p-1.5 text-zinc-400 hover:text-green-400 disabled:opacity-30 transition cursor-pointer"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
};
