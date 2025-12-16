import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiz App",
  description: "Advanced React Quiz Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <div className="flex">
          <MobileNav />
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 ml-0 md:ml-64 min-h-screen p-4 md:p-8 bg-slate-50 pt-20 md:pt-8 h-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
