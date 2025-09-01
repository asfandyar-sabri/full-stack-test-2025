"use client";
import RequireAuth from "@/components/RequireAuth";
import { useMessages, useSendMessage } from "@/queries/chats";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChatDetail() {
  return (
    <RequireAuth>
      <ChatDetailInner />
    </RequireAuth>
  );
}

function useTypewriter() {
  const [text, setText] = useState("");
  const [running, setRunning] = useState(false);
  const run = async (full: string, speed = 18) => {
    setText("");
    setRunning(true);
    for (let i = 0; i <= full.length; i++) {
      setText(full.slice(0, i));
      await new Promise((r) => setTimeout(r, speed));
    }
    setRunning(false);
  };
  return { text, running, run, reset: () => setText("") };
}

function ChatDetailInner() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  if (typeof id !== "string" || id.length === 0) {
    return <div className="p-6 text-[var(--muted)]">Invalid chat.</div>;
  }

  const { data = [], isLoading } = useMessages(id);
  const send = useSendMessage(id);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const { text: typing, running, run, reset } = useTypewriter();

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // always keep scrolled to bottom (newest at end)
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [data.length, thinking, typing, running]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || send.isPending) return;

    setInput("");
    setThinking(true);
    reset();

    try {
      const res = await send.mutateAsync(prompt);
      // animate the assistant we just created
      const assistantText = res?.assistant?.content as string | undefined;
      if (assistantText) await run(assistantText);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-3rem)] grid grid-rows-[1fr_auto] overflow-hidden">
      <div
        ref={listRef}
        className="overflow-y-auto px-6 py-4 space-y-3 scrollbar-none"
      >
        {isLoading && <div className="text-[var(--muted)]">Loading…</div>}

        {!isLoading && data.length === 0 && !thinking && !running && (
          <div className="text-[var(--muted)] text-sm">
            No messages yet. Send one to start the conversation.
          </div>
        )}

        {data.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id ?? `${m.created_at}-${m.role}-${i}`}
              className={[
                "max-w-[820px] rounded-2xl px-4 py-3",
                isUser
                  ? "ml-auto bg-[var(--bubble-user)] text-[var(--bubble-user-text)]"
                  : "mr-auto bg-[var(--bubble-assistant)] text-[var(--fg)]",
              ].join(" ")}
            >
              {m.content}
            </div>
          );
        })}

        {(running || typing) && (
          <div className="max-w-[820px] rounded-2xl px-4 py-3 bg-[var(--bubble-assistant)] text-[var(--fg)]">
            {typing}
            <span className="animate-pulse">▍</span>
          </div>
        )}

        {thinking && !running && !typing && (
          <div className="max-w-[820px] rounded-2xl px-4 py-3 bg-[var(--bubble-assistant)] text-[var(--fg)] opacity-70">
            Thinking…
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="sticky bottom-0 p-4 border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--bg) 90%,black)]/80 backdrop-blur"
      >
        <div className="relative w-full max-w-[840px] mx-auto">
          <input
            className="w-full h-[46px] rounded-full bg-[var(--input)] px-10 text-sm outline-none placeholder-[var(--muted)]"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg)]/80">
            +
          </span>
          <button
            type="submit"
            disabled={!input.trim() || send.isPending}
            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full border border-[var(--border)] text-[var(--muted)] disabled:opacity-50"
            aria-label="Send"
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}
