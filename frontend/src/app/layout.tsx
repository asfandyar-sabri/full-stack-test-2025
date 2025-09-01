// src/app/layout.tsx
import "./globals.css";
import Providers from "./providers";

export const metadata = { title: "GPT Clone", description: "Turing Test" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        data-gramm="false"
        className="bg-[var(--bg)] text-[var(--fg)]"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
