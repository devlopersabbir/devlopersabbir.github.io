import React, { useEffect, useRef, useState } from "react";
import { marked, type Token, type Tokens } from "marked";
import hljs from "highlight.js";

interface MarkdownRendererProps {
  content: string;
}

/** Inline copy button attached after rendering */
const CopyButton: React.FC<{ codeRef: React.RefObject<HTMLElement | null> }> = ({ codeRef }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = codeRef.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy code"
      className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-all duration-150 cursor-pointer
        ${copied
          ? "bg-emerald-900/80 border-emerald-600 text-emerald-300"
          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
        }`}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
};

/** Highlighted code block */
const CodeBlock: React.FC<{ code: string; lang: string }> = ({ code, lang }) => {
  const codeRef = useRef<HTMLElement>(null);

  let highlighted = code;
  try {
    if (lang && hljs.getLanguage(lang)) {
      highlighted = hljs.highlight(code, { language: lang }).value;
    } else {
      highlighted = hljs.highlightAuto(code).value;
    }
  } catch {
    highlighted = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  const displayLang = lang || "code";

  return (
    <div className="relative group my-3">
      {/* Language badge */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-t-md px-3 py-1">
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{displayLang}</span>
        <CopyButton codeRef={codeRef} />
      </div>
      <pre className="!mt-0 !rounded-t-none bg-zinc-950 border border-t-0 border-zinc-700 rounded-b-md overflow-x-auto p-3 text-[11px] md:text-xs leading-relaxed !m-0">
        <code
          ref={codeRef}
          className={`hljs language-${displayLang}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
};

/** Render markdown with syntax-highlighted code blocks and copy buttons */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const tokens = marked.lexer(content);

  const renderToken = (token: Token, idx: number): React.ReactNode => {
    switch (token.type) {
      case "code": {
        const t = token as Tokens.Code;
        return <CodeBlock key={idx} code={t.text} lang={t.lang ?? ""} />;
      }
      case "heading": {
        const t = token as Tokens.Heading;
        const Tag = (`h${t.depth}`) as React.ElementType;
        const cls = [
          "font-bold leading-tight mt-3 mb-1",
          t.depth === 1 ? "text-base text-zinc-100" :
          t.depth === 2 ? "text-sm text-zinc-200" :
          "text-xs text-zinc-300",
        ].join(" ");
        return <Tag key={idx} className={cls} dangerouslySetInnerHTML={{ __html: marked.parseInline(t.text) as string }} />;
      }
      case "paragraph": {
        const t = token as Tokens.Paragraph;
        return (
          <p key={idx} className="mb-2 last:mb-0 text-zinc-200 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: marked.parseInline(t.text) as string }} />
        );
      }
      case "list": {
        const t = token as Tokens.List;
        const items = t.items.map((item, i) => (
          <li key={i} className="mb-0.5" dangerouslySetInnerHTML={{ __html: marked.parseInline(item.text) as string }} />
        ));
        return t.ordered
          ? <ol key={idx} className="list-decimal list-inside my-1.5 space-y-0.5 text-zinc-200">{items}</ol>
          : <ul key={idx} className="list-disc list-inside my-1.5 space-y-0.5 text-zinc-200">{items}</ul>;
      }
      case "blockquote": {
        const t = token as Tokens.Blockquote;
        return (
          <blockquote key={idx} className="border-l-2 border-zinc-600 pl-3 my-2 text-zinc-400 italic">
            {(t.tokens ?? []).map((child, i) => renderToken(child, i))}
          </blockquote>
        );
      }
      case "hr":
        return <hr key={idx} className="border-zinc-700 my-3" />;
      case "space":
        return null;
      case "html": {
        const t = token as Tokens.HTML;
        return <span key={idx} dangerouslySetInnerHTML={{ __html: t.text }} />;
      }
      case "image": {
        const t = token as Tokens.Image;
        return (
          <a key={idx} href={t.href} target="_blank" rel="noopener noreferrer">
            <img
              src={t.href}
              alt={t.text}
              title={t.title ?? undefined}
              className="rounded-lg border border-zinc-800 max-w-[200px] shadow-md my-2 hover:opacity-90 transition-opacity"
            />
          </a>
        );
      }
      default: {
        // Fallback: render remaining token types via marked HTML
        const raw = (token as any).raw ?? "";
        if (!raw) return null;
        return <span key={idx} dangerouslySetInnerHTML={{ __html: marked.parse(raw) as string }} />;
      }
    }
  };

  return (
    <div className="text-zinc-200 pl-3 border-l-2 border-green-500/40 bg-zinc-900/40 py-2 pr-2 rounded-r text-xs md:text-sm [&_a]:text-blue-400 [&_a]:underline [&_strong]:text-zinc-100 [&_em]:text-zinc-300 [&_code:not(pre_code)]:bg-zinc-800 [&_code:not(pre_code)]:text-emerald-400 [&_code:not(pre_code)]:px-1 [&_code:not(pre_code)]:rounded [&_code:not(pre_code)]:text-[11px]">
      {tokens.map((token, idx) => renderToken(token, idx))}
    </div>
  );
};
