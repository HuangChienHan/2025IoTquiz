"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, PlusCircle, History, PlayCircle } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

const navItems = [
    { name: "首頁", href: "/", icon: LayoutDashboard },
    { name: "開始測驗", href: "/quiz/setup", icon: PlayCircle },
    { name: "題庫清單", href: "/questions", icon: List },
    { name: "建立題庫", href: "/questions/create", icon: PlusCircle },
    { name: "歷史紀錄", href: "/history", icon: History },
];

export default function Sidebar() {
    const pathname = usePathname();

    const activeItem = navItems
        .filter((item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
        .sort((a, b) => b.href.length - a.href.length)[0];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white p-6 shadow-xl z-50">
            <div className="flex items-center gap-3 mb-10">
                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">
                    Q
                </div>
                <h1 className="text-2xl font-bold tracking-wider">QuizMaster</h1>
            </div>

            <nav className="space-y-2">
                {navItems.map((item) => {
                    const isActive = activeItem?.href === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="font-medium">{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-6 left-6 right-6 text-xs text-slate-500 text-center">
                &copy; 2025 Quiz App
            </div>
        </aside>
    );
}
