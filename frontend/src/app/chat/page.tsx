// src/app/chat/page.tsx
"use client";

import RequireAuth from "@/components/RequireAuth";

export default function ChatHome() {
  return (
    <RequireAuth>
      <div className="h-[calc(100dvh-3rem)] w-full grid place-items-center text-[#9C9C9C]">
        Select a chat or create a new one.
      </div>
    </RequireAuth>
  );
}
