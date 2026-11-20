import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextPrompt — AI prompts from any photo, video or app",
  description:
    "Turn any photo or video into ready-to-use AI prompts with the best platform to make it, and find out whether a website or app was built with AI — plus the steps and prompts to build your own.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.18),transparent_60%)]" />
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Next<span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Prompt</span>
          </Link>
          <nav className="flex gap-1 text-sm sm:gap-3">
            <Link href="/create" className="rounded-lg px-3 py-2 text-white/75 hover:bg-white/5 hover:text-white">
              Media → Prompt
            </Link>
            <Link href="/detect" className="rounded-lg px-3 py-2 text-white/75 hover:bg-white/5 hover:text-white">
              AI Site Detector
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-24">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-white/40">
          AI detection is an estimate based on public signals, never proof. © {new Date().getFullYear()} NextPrompt
        </footer>
      </body>
    </html>
  );
}
