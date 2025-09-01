"use client";

import { supabase } from "@/lib/supabase-browser";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const AUTH_PAGES = new Set(["/login", "/signup"]);

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.has(pathname);

  const [status, setStatus] = useState<"checking" | "authed" | "guest">(
    "checking"
  );
  const unsubRef = useRef<() => void | undefined>(undefined);

  useEffect(() => {
    let alive = true;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!alive) return;

      if (session) {
        setStatus("authed");
        // Only send authed users to /chat if they are currently on an auth page
        if (isAuthPage) router.replace("/chat");
      } else {
        setStatus("guest");
        // Only kick guests to /login if they are on a protected page
        if (!isAuthPage) router.replace("/login");
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // IMPORTANT: only redirect on explicit sign-in/out
      if (event === "SIGNED_IN") {
        setStatus("authed");
        if (AUTH_PAGES.has(window.location.pathname)) {
          router.replace("/chat");
        }
      } else if (event === "SIGNED_OUT") {
        setStatus("guest");
        if (!AUTH_PAGES.has(window.location.pathname)) {
          router.replace("/login");
        }
      }
      // Ignore INITIAL_SESSION, TOKEN_REFRESHED, USER_UPDATED, etc.
    });

    unsubRef.current = () => subscription?.unsubscribe();

    return () => {
      alive = false;
      unsubRef.current?.();
    };
  }, [router, isAuthPage]);

  // While checking, render children to avoid flicker/unmount
  if (status === "checking") return <>{children}</>;
  if (status === "guest" && !isAuthPage) return null; // redirecting to /login
  return <>{children}</>;
}
