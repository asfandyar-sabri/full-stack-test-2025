// src/app/login/page.tsx
"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.replace("/chat");
    })();
  }, [router]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setErr(error.message);
    else router.replace("/chat");
  };

  const signInGoogle = async () => {
    setErr(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/login" },
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#101010] text-white grid place-items-center">
      <form
        onSubmit={signIn}
        className="w-full max-w-md bg-[#171717] rounded-xl p-6 shadow-xl border border-[#2a2a2a]"
      >
        <h1 className="text-xl mb-4 font-semibold">Login</h1>

        <input
          className="w-full mb-3 rounded-md bg-[#232323] px-3 py-2 outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 rounded-md bg-[#232323] px-3 py-2 outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <div className="text-red-400 text-sm mb-3">{err}</div>}

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full rounded-md bg-white text-black py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <button
          type="button"
          onClick={signInGoogle}
          className="cursor-pointer w-full mt-3 rounded-md border border-[#525252] py-2"
        >
          Continue with Google
        </button>

        {/* NEW: signup link */}
        <p className="text-sm text-neutral-400 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
