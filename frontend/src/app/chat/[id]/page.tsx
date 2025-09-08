"use client";
import RequireAuth from "@/components/RequireAuth";
import { useMessages, useSendMessage } from "@/queries/chats";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { openSSE } from "@/lib/stream";
import { supabase } from "@/lib/supabase-browser";

export default function ChatDetail() {
  return (
    <RequireAuth>
      <ChatDetailInner />
    </RequireAuth>
  );
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

  // Streaming preview state (fed by SSE)
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");

  const stopStreamRef = useRef<null | (() => void)>(null);

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [data.length, thinking, streaming, streamText]);

  // helper to stop any previous SSE
  const stopStream = () => {
    stopStreamRef.current?.();
    stopStreamRef.current = null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || send.isPending) return;

    setInput("");
    setThinking(true);
    setStreaming(false);
    setStreamText("");
    stopStream(); // ensure no previous stream is open

    try {
      // 1) Persist both user + assistant rows (server returns them)
      const res = await send.mutateAsync(prompt);

      // 2) Start SSE preview that streams the exact reply text (server-side simulated LLM)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";

      const base = process.env.NEXT_PUBLIC_BACKEND_URL!;
      // the backend stream route reads both q and access_token
      const url =
        `${base}/chats/${encodeURIComponent(id)}/messages/stream` +
        `?q=${encodeURIComponent(prompt)}&access_token=${encodeURIComponent(
          token
        )}`;

      setStreaming(true);
      setStreamText("");

      stopStreamRef.current = openSSE(
        url,
        (tok) => setStreamText((s) => (s ? s + " " : "") + tok),
        () => {
          // When streaming completes, hide the preview and keep only the server message
          setStreaming(false);
          setStreamText("");
          stopStreamRef.current = null;
        }
      );
    } finally {
      setThinking(false);
    }
  };

  // While streaming, hide the latest assistant message (it’s the same content being streamed)
  const hideLastAssistant =
    streaming && data.length > 0 && data[data.length - 1].role === "assistant";
  const visibleMessages = hideLastAssistant ? data.slice(0, -1) : data;

  // Clean up SSE on unmount or chat change
  useEffect(() => stopStream, [id]);

  return (
    <div className="h-[calc(100dvh-3rem)] grid grid-rows-[1fr_auto] overflow-hidden">
      <div
        ref={listRef}
        className="overflow-y-auto px-6 py-4 space-y-3 scrollbar-none"
      >
        {isLoading && <div className="text-[var(--muted)]">Loading…</div>}

        {!isLoading &&
          visibleMessages.length === 0 &&
          !thinking &&
          !streaming && (
            <div className="text-[var(--muted)] text-sm">
              No messages yet. Send one to start the conversation.
            </div>
          )}

        {visibleMessages.map((m, i) => {
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

        {/* Streaming preview from SSE (one bubble while streaming) */}
        {streaming && (
          <div className="max-w-[820px] rounded-2xl px-4 py-3 bg-[var(--bubble-assistant)] text-[var(--fg)]">
            {streamText}
            <span className="animate-pulse">▍</span>
          </div>
        )}

        {/* Brief placeholder before stream starts (optional) */}
        {thinking && !streaming && (
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
