// src/app/chat/layout.tsx
"use client";

import { supabase } from "@/lib/supabase-browser";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useUi } from "@/stores/ui";
import { Menu as MenuIcon, Moon, Search } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/app/providers";
import { useState } from "react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toggle, sidebarOpen, close } = useUi();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // NEW: top-bar chat filter (passed down to Sidebar)
  const [filter, setFilter] = useState("");

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Top bar */}
      <header className="h-12 border-b border-[var(--border)] flex items-center gap-3 px-3 md:px-4">
        {/* Left: menu + logo */}
        <div className="flex items-center gap-2">
          <button
            className="cursor-pointer md:hidden p-2 rounded hover:bg-[var(--panel)]"
            onClick={toggle}
            aria-label="Toggle sidebar"
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

        {/* Center: search (hidden on very small screens) */}
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

        {/* Right: theme + sign out */}
        <div className="flex items-center gap-3">
          <button
            className="cursor-pointer p-2 rounded hover:bg-[var(--panel)]"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            type="button"
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
            type="button"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* App content */}
      <div className="relative grid md:grid-cols-[16rem_1fr] lg:grid-cols-[18rem_1fr] h-[calc(100vh-3rem)] overflow-hidden">
        {/* Mobile overlay to close drawer */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 md:hidden"
            onClick={close}
            aria-hidden
          />
        )}

        {/* Pass the filter down (Sidebar tweaks below) */}
        <Sidebar search={filter} />

        {/* Key by pathname so /chat and /chat/[id] swap cleanly */}
        <main key={pathname} className="h-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
