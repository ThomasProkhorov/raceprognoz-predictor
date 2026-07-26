import type { Metadata } from "next";
import { Inter, Titillium_Web, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const titillium = Titillium_Web({
  variable: "--font-titillium",
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RacePrognoz Predictor",
  description: "F1 predictor standings and live race comparison",
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/predictions", label: "Predictions" },
  { href: "/standings", label: "Standings" },
  { href: "/live", label: "Live" },
  { href: "/live-standings", label: "Live Standings" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${titillium.variable} ${jetbrainsMono.variable} dark h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#000] text-[#fff] antialiased">
        <header className="border-b border-[#2a2a2a]">
          <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-8 px-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.04em] text-[#e10600]"
            >
              <span className="text-base">RacePrognoz</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#8d8d8d] transition-colors hover:text-[#fff]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1320px] flex-1 px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
