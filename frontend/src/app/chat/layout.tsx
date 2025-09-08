"use client";

import { supabase } from "@/lib/supabase-browser";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useUi } from "@/stores/ui";
import { Menu as MenuIcon, Moon, Search } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/app/providers";
import { useEffect, useMemo, useState } from "react";

/** Tiny hook: keep a reliable mobile flag and avoid SSR/hydration flicker */
function useIsMobile() {
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    setReady(true);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return { ready, isMobile };
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toggle, sidebarOpen, close, open } = useUi();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [filter, setFilter] = useState("");

  const { ready, isMobile } = useIsMobile();

  // Open by default on desktop, closed on mobile
  useEffect(() => {
    if (!ready) return;
    if (isMobile) close();
    else open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isMobile]);

  // Desktop grid column widths
  const gridCols = useMemo(
    () => (sidebarOpen ? "16rem 1fr" : "0 1fr"),
    [sidebarOpen]
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Top bar */}
      <header className="h-12 border-b border-[var(--border)] flex items-center gap-3 px-3 md:px-4">
        <div className="flex items-center gap-2">
          <button
            className="cursor-pointer p-2 rounded hover:bg-[var(--panel)]"
            onClick={toggle}
            aria-label="Toggle sidebar"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <MenuIcon size={18} />
          </button>

          <div className="relative w-6 h-6">
            <Image
              src="/TT Logo - Public.png"
              alt="Logo"
              fill
              sizes="24px"
              className="object-contain rounded-sm"
              priority
            />
          </div>
        </div>

        {/* Center search */}
        <div className="flex-1 hidden sm:block">
          <div className="relative max-w-[520px] mx-auto">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search chats…"
              className="w-full h-8 rounded-full bg-[var(--panel)] border border-[var(--border)] px-9 text-sm placeholder-[var(--muted)] outline-none"
            />
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            {filter && (
              <button
                type="button"
                onClick={() => setFilter("")}
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--fg)]"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <button
            className="cursor-pointer p-2 rounded hover:bg-[var(--panel)]"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            onClick={toggleTheme}
          >
            <Moon size={16} />
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
            className="cursor-pointer text-sm text-[var(--muted)] hover:text-[var(--fg)]"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content area. Desktop uses a grid; mobile is free layout with overlay drawer. */}
      <div
        className="relative h-[calc(100vh-3rem)] overflow-hidden md:grid"
        style={{
          gridTemplateColumns: gridCols,
          transition: "grid-template-columns 200ms ease",
        }}
      >
        {/* Mobile backdrop (render ONLY on mobile and after hydration) */}
        {ready && isMobile && sidebarOpen && (
          <div
            className="fixed left-0 right-0 top-12 bottom-0 bg-black/40 z-40 md:hidden"
            onClick={close}
            aria-hidden
          />
        )}

        {/* Sidebar — grid column on desktop, overlay drawer on mobile */}
        <Sidebar search={filter} />

        {/* Main content — always the second column on desktop */}
        <main
          key={pathname}
          className="h-full overflow-hidden md:col-start-2 md:col-end-3"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
