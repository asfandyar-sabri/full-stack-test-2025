"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeCtx = { theme: "dark" | "light"; toggleTheme: () => void };
const ThemeContext = React.createContext<ThemeCtx | null>(null);
export const useTheme = () => useContext(ThemeContext)!;

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const [theme, setTheme] = useState<"dark" | "light">(
    (typeof window !== "undefined" &&
      (localStorage.getItem("theme") as "dark" | "light")) ||
      "dark"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const ctx = useMemo<ThemeCtx>(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={ctx}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeContext.Provider>
  );
}
