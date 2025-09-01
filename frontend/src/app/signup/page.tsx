"use client";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const doSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    alert("Check your email to confirm, then log in.");
    router.replace("/login");
  };

  return (
    <main className="min-h-screen grid place-items-center">
      <form
        onSubmit={doSignup}
        className="w-full max-w-sm bg-neutral-900 p-6 rounded-xl space-y-4"
      >
        <h1 className="text-xl font-semibold">Create account</h1>
        <input
          className="w-full p-2 rounded bg-neutral-800"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 rounded bg-neutral-800"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full py-2 rounded bg-white text-black">
          Sign up
        </button>
        <p className="text-sm text-neutral-400">
          Already have an account?{" "}
          <a className="underline" href="/login">
            Login
          </a>
        </p>
      </form>
    </main>
  );
}
