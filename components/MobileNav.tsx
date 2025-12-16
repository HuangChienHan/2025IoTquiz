"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, PlusCircle, History, PlayCircle, Infinity as InfinityIcon, Flag, CheckCircle, Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { name: "首頁", href: "/", icon: LayoutDashboard },
    { name: "開始測驗", href: "/quiz/setup", icon: PlayCircle },
    { name: "錯題複習", href: "/quiz/wrong-review", icon: Flag },
    { name: "無盡模式", href: "/quiz/endless", icon: InfinityIcon },
    { name: "題庫清單", href: "/questions", icon: List },
    { name: "已熟悉題目", href: "/questions/mastered", icon: CheckCircle },
    { name: "建立題庫", href: "/questions/create", icon: PlusCircle },
    { name: "歷史紀錄", href: "/history", icon: History },
];

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const activeItem = navItems
        .filter((item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
        .sort((a, b) => b.href.length - a.href.length)[0];

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
            {/* Header / Menu Button */}
            <div className="pointer-events-auto flex justify-between items-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">Q</div>
                    <span className="font-bold text-slate-800">QuizMaster</span>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Overlay Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white p-6 pointer-events-auto shadow-2xl flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">
                                        Q
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-wider">QuizMaster</h1>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="space-y-2 flex-1 overflow-y-auto">
                                {navItems.map((item) => {
                                    const isActive = activeItem?.href === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div
                                                className={clsx(
                                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative mb-2",
                                                    isActive
                                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                                )}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="text-xs text-slate-500 text-center mt-6">
                                &copy; 2025 Quiz App
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
