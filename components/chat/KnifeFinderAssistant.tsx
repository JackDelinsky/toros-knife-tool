"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  processUserInput,
  START_QUICK_REPLIES,
  WELCOME_MESSAGE,
  type FinderContext,
  type FinderStep,
} from "@/lib/knife-finder-demo";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatMessageText(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-toros-parchment">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function ChatIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 9.5h10M7 13h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5 5.5h14a2 2 0 012 2v7.5a2 2 0 01-2 2h-3.5l-3 2.5-3-2.5H5a2 2 0 01-2-2V7.5a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KnifeFinderAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: createId(), role: "assistant", text: WELCOME_MESSAGE },
  ]);
  const [quickReplies, setQuickReplies] = useState<string[]>([...START_QUICK_REPLIES]);
  const [step, setStep] = useState<FinderStep>("idle");
  const [context, setContext] = useState<FinderContext>({});
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  function openChat() {
    setOpen(true);
  }

  useEffect(() => {
    if (open) {
      scrollToBottom();
      const timer = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(timer);
    }
  }, [open, messages, quickReplies, scrollToBottom]);

  function pushAssistantMessages(texts: string[]) {
    setMessages((prev) => [
      ...prev,
      ...texts.map((text) => ({ id: createId(), role: "assistant" as const, text })),
    ]);
  }

  function handleUserMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setMessages((prev) => [...prev, { id: createId(), role: "user", text: trimmed }]);
    setInput("");
    setTyping(true);

    window.setTimeout(() => {
      const turn = processUserInput(trimmed, step, context);
      pushAssistantMessages(turn.assistantMessages);
      setQuickReplies(turn.quickReplies);
      setStep(turn.nextStep);
      setContext(turn.context);
      setTyping(false);
    }, 450);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleUserMessage(input);
  }

  return (
    <>
      {!open && (
        <div
          className="knife-finder-launcher group fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6 sm:flex-row sm:items-center sm:gap-3"
        >
          <div
            className="knife-finder-hint pointer-events-none relative max-w-[13.5rem] rounded-2xl rounded-br-sm border border-toros-brass/30 bg-toros-elevated/95 px-3.5 py-2.5 text-left opacity-0 shadow-[0_8px_28px_rgba(0,0,0,0.45),0_0_20px_rgba(168,137,74,0.12)] backdrop-blur-sm transition-all duration-200 translate-y-1 scale-95 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:visible sm:max-w-[15rem]"
            aria-hidden="true"
          >
            <p className="text-[11px] font-semibold leading-snug text-toros-parchment">
              Not sure which knife to choose?
            </p>
            <p className="mt-0.5 text-[10px] leading-snug text-toros-steel">
              I&apos;ll match use, budget &amp; blade style for you.
            </p>
            <span className="knife-finder-hint-tail" aria-hidden="true" />
            <span className="knife-finder-hint-dot knife-finder-hint-dot--1" aria-hidden="true" />
            <span className="knife-finder-hint-dot knife-finder-hint-dot--2" aria-hidden="true" />
          </div>

          <button
            type="button"
            onClick={openChat}
            className="knife-finder-fab flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-toros-brass/40 bg-toros-charcoal text-toros-brass-light shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(168,137,74,0.2)] transition-all duration-300 hover:border-toros-brass/60 hover:bg-toros-elevated hover:text-toros-parchment hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_32px_rgba(168,137,74,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-toros-brass"
            aria-label="Open Knife Finder Assistant — help choosing a knife"
          >
            <ChatIcon />
          </button>
        </div>
      )}

      {open && (
        <div
          className="knife-finder-panel fixed bottom-5 right-5 z-[90] flex h-[min(32rem,calc(100vh-5.5rem))] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-sm border border-toros-border bg-toros-charcoal shadow-[0_24px_64px_rgba(0,0,0,0.55),0_0_40px_rgba(168,137,74,0.08)] sm:bottom-6 sm:right-6 sm:h-[min(34rem,calc(100vh-6rem))] sm:w-[24rem]"
          role="dialog"
          aria-labelledby="knife-finder-title"
          aria-modal="true"
        >
          <header className="relative border-b border-toros-border/80 bg-toros-surface/90 px-4 py-3.5">
            <div className="pointer-events-none absolute inset-0 pattern-mosaic opacity-[0.08]" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-toros-brass">
                  Toros Guide
                </p>
                <h2
                  id="knife-finder-title"
                  className="font-display text-lg font-semibold leading-tight text-toros-parchment"
                >
                  Knife Finder Assistant
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-toros-steel transition-colors hover:bg-toros-elevated hover:text-toros-parchment"
                aria-label="Close chat"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col bg-toros-black/40">
            <div className="knife-finder-messages flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[88%] rounded-sm rounded-br-none border border-toros-brass/25 bg-toros-brass/15 px-3.5 py-2.5 text-sm leading-relaxed text-toros-parchment"
                        : "max-w-[92%] rounded-sm rounded-bl-none border border-toros-border/70 bg-toros-surface/90 px-3.5 py-2.5 text-sm leading-relaxed text-toros-sand/90"
                    }
                  >
                    <p className="whitespace-pre-line">{formatMessageText(message.text)}</p>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-sm border border-toros-border/70 bg-toros-surface/90 px-3.5 py-3">
                    <div className="flex gap-1">
                      <span className="knife-finder-dot" />
                      <span className="knife-finder-dot knife-finder-dot--2" />
                      <span className="knife-finder-dot knife-finder-dot--3" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {quickReplies.length > 0 && (
              <div className="border-t border-toros-border/50 px-3 py-2.5">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-toros-steel">
                  Quick replies
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      disabled={typing}
                      onClick={() => handleUserMessage(reply)}
                      className="rounded-sm border border-toros-border bg-toros-elevated/80 px-2.5 py-1.5 text-left text-[11px] leading-snug text-toros-sand transition-colors hover:border-toros-brass/40 hover:text-toros-brass-light disabled:opacity-50"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="border-t border-toros-border/80 bg-toros-charcoal px-3 py-3"
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                  disabled={typing}
                  className="min-w-0 flex-1 rounded-sm border border-toros-border bg-toros-surface px-3 py-2.5 text-sm text-toros-parchment placeholder:text-toros-steel focus:border-toros-brass/50 focus:outline-none focus:ring-1 focus:ring-toros-brass/30 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={typing || !input.trim()}
                  className="rounded-sm bg-toros-brass px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-toros-black transition-colors hover:bg-toros-brass-light disabled:opacity-40"
                >
                  Send
                </button>
              </div>
              <p className="mt-2 text-center text-[9px] text-toros-steel-dark">
                Demo assistant ·{" "}
                <Link href="/shop" className="text-toros-brass/80 hover:text-toros-brass-light">
                  Browse shop
                </Link>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
