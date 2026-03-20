import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aether | 实验性工具站",
  description: "Aether - 一个极简且具有冲击力的多页面工具网站",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
    >
      <body className="min-h-screen bg-background text-foreground selection:bg-accent-cyan/30">
        <div className="aether-bg">
          <div className="flux-orb orb-1 w-[800px] h-[800px] bg-accent-violet top-[-200px] left-[-100px]" />
          <div className="flux-orb orb-2 w-[600px] h-[600px] bg-accent-cyan bottom-[-100px] right-[-100px]" />
          <div className="flux-orb orb-3 w-[500px] h-[500px] bg-accent-violet top-[40%] right-[10%]" />
        </div>
        
        <main className="relative z-10 pt-10 pb-32 px-6 max-w-7xl mx-auto min-h-screen">
          {children}
          
          <footer className="mt-20 py-8 border-t border-white/5 text-center">
            <p className="text-white/20 text-xs font-mono tracking-[0.2em] uppercase">
              Aether Tool Collection © 2026.
            </p>
          </footer>
        </main>

        <Navbar />
      </body>
    </html>
  );
}
