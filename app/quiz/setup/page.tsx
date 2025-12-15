"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Play, ChevronRight, Info } from "lucide-react";

export default function QuizSetup() {
    const router = useRouter();
    const [count, setCount] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/quiz/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count }),
            });

            if (res.ok) {
                const questions = await res.json();
                if (questions.length === 0) {
                    alert("目前沒有足夠的題目可以進行測驗，請先建立題庫。");
                    return;
                }
                // Save to session storage
                sessionStorage.setItem("currentQuiz", JSON.stringify(questions));
                router.push("/quiz/active");
            } else {
                alert("無法開始測驗，請稍後再試。");
            }
        } catch (error) {
            console.error(error);
            alert("發生錯誤");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pt-10">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="w-6 h-6 text-blue-400" />
                        <h1 className="text-2xl font-bold">測驗設定</h1>
                    </div>
                    <p className="text-slate-400">請調整本次測驗的參數</p>
                </div>

                <div className="p-8 space-y-8">
                    <div>
                        <label className="block text-slate-700 font-bold mb-4 flex justify-between">
                            <span>題目數量</span>
                            <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">{count} 題</span>
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                            <span>5</span>
                            <span>25</span>
                            <span>50</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <p>
                            系統將會自動從題庫中選題。優先選擇您從未練習過的題目，其次是過去曾經答錯的題目，最後隨機補充不足的題數。
                        </p>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            "準備中..."
                        ) : (
                            <>
                                開始測驗 <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
