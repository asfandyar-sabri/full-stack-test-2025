"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  useChats,
  useCreateChat,
  useDeleteChat,
  useRenameChat,
} from "@/queries/chats";
import { useUi } from "@/stores/ui";
import { supabase } from "@/lib/supabase-browser";
import { ChevronLeft } from "lucide-react";

type AuthUser = {
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};
type Chat = { id: string; title: string; created_at: string; user_id: string };

export default function Sidebar({ search = "" }: { search?: string }) {
  const { data, isLoading } = useChats();
  const create = useCreateChat();
  const rename = useRenameChat();
  const remove = useDeleteChat();
  const pathname = usePathname();
  const { close, toggle, sidebarOpen } = useUi();

  const chats: Chat[] = useMemo(() => (data ?? []) as Chat[], [data]);
  const [me, setMe] = useState<AuthUser>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [{ data: userData }, { data: sessionData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);
      const user = userData.user ?? sessionData.session?.user ?? null;
      const name =
        (user?.user_metadata?.full_name as string | undefined) ??
        (user?.user_metadata?.name as string | undefined) ??
        null;
      const email = (user?.email as string | undefined) ?? null;
      const avatar_url =
        (user?.user_metadata?.avatar_url as string | undefined) ??
        (user?.user_metadata?.picture as string | undefined) ??
        null;
      if (mounted) setMe({ name, email, avatar_url });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const displayName =
    me.name ?? me.email?.split("@")[0]?.replace(/[._-]/g, " ") ?? "User";

  const onRename = async (chat: Chat) => {
    const next = window.prompt("Rename chat:", chat.title);
    if (!next || next.trim() === "" || next === chat.title) return;
    await rename.mutateAsync({ id: chat.id, title: next.trim() });
  };

  const onDelete = async (chat: Chat) => {
    if (!window.confirm("Delete this chat? This cannot be undone.")) return;
    await remove.mutateAsync(chat.id);
  };

  const q = search.trim().toLowerCase();
  const list = q
    ? chats.filter((c) => (c.title ?? "").toLowerCase().includes(q))
    : chats;

  // Slide in/out on ALL breakpoints; never participates in layout flow
  const slide = sidebarOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <aside
      className={[
        "fixed z-40 left-0 top-12", // below top bar
        "w-64 h-[calc(100vh-3rem)]",
        "bg-[var(--sidebar-bg)] border-r border-[var(--border)]",
        "p-4 space-y-4",
        "transform transition-transform duration-200",
        slide,
        "flex flex-col overflow-hidden",
      ].join(" ")}
      aria-hidden={!sidebarOpen}
    >
      {/* Header row with collapse button */}
      <div className="flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            create.mutate("New Chat");
          }}
          className="cursor-pointer w-[calc(100%-2rem)] py-2 rounded-xl bg-white text-black disabled:opacity-60"
          disabled={create.isPending}
        >
          {create.isPending ? "Creating…" : "New chat"}
        </button>

        <button
          type="button"
          onClick={toggle}
          className="ml-2 p-2 rounded hover:bg-[var(--panel)] text-[var(--muted)]"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={16} className={sidebarOpen ? "" : "rotate-180"} />
        </button>
      </div>

      <div className="pt-2 space-y-1 overflow-y-auto pr-1">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] px-2">
          Chat History
        </p>

        {isLoading && (
          <div className="text-sm text-[var(--muted)] px-2">Loading…</div>
        )}

        {!isLoading && list.length === 0 && (
          <div className="text-sm text-[var(--muted)] px-2">
            {q ? "No chats match your search." : "No chats yet."}
          </div>
        )}

        {!isLoading &&
          list.map((chat) => {
            const active = pathname === `/chat/${chat.id}`;
            return (
              <div key={chat.id} className="group relative">
                <Link
                  href={`/chat/${chat.id}`}
                  prefetch={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    close(); // close after navigation on any viewport
                  }}
                  className={[
                    "cursor-pointer block px-3 py-2 rounded-lg text-sm",
                    active
                      ? "bg-[var(--border)] text-white"
                      : "text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--fg)]",
                  ].join(" ")}
                >
                  {chat.title || "Untitled"}
                </Link>

                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRename(chat);
                    }}
                    className="cursor-pointer text-[var(--muted)] text-xs px-2 py-0.5 rounded hover:bg-[var(--panel)]"
                    title="Rename"
                  >
                    Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(chat);
                    }}
                    className="cursor-pointer text-red-400 text-xs px-2 py-0.5 rounded hover:bg-[var(--panel)]"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      <div className="mt-auto pt-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#2a2a2a] flex-shrink-0">
            {me.avatar_url ? (
              <Image
                src={me.avatar_url}
                alt="Avatar"
                fill
                sizes="32px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-xs text-[var(--muted)]">
                {(displayName?.[0] ?? "U").toUpperCase()}
              </div>
            )}
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-medium text-[var(--fg)] text-sm truncate">
              {displayName}
            </div>
            <div className="text-[var(--muted)] text-xs break-all truncate">
              {me.email ?? ""}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
