"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, ArrowLeft, Calendar, FileText, Award, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HistoryPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const quizId = searchParams.get("id");

    const [historyList, setHistoryList] = useState<any[]>([]);
    const [quizDetails, setQuizDetails] = useState<any | null>(null);
    const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(true);

    useEffect(() => {
        if (quizId) {
            fetchDetails(quizId);
        } else {
            fetchList();
        }
    }, [quizId]);

    const fetchList = async () => {
        const res = await fetch("/api/history");
        if (res.ok) setHistoryList(await res.json());
    };

    const fetchDetails = async (id: string) => {
        const res = await fetch(`/api/history?id=${id}`);
        if (res.ok) setQuizDetails(await res.json());
    };

    const handleDeleteHistory = async () => {
        if (!confirm("確定要刪除所有歷史測驗紀錄嗎？此動作無法復原。")) return;

        try {
            const res = await fetch("/api/history", { method: "DELETE" });
            if (res.ok) {
                setHistoryList([]);
            } else {
                alert("刪除失敗");
            }
        } catch (error) {
            console.error("Failed to delete history:", error);
            alert("發生錯誤");
        }
    };

    const formatDate = (dateStr: string) => {
        // SQLite stores dates in UTC ("YYYY-MM-DD HH:MM:SS")
        // We append 'Z' to treat it as UTC, then convert to Taipei time
        const utcDateStr = dateStr.replace(' ', 'T') + 'Z';
        return new Date(utcDateStr).toLocaleString('zh-TW', {
            timeZone: 'Asia/Taipei',
            hour12: false
        });
    };

    if (quizId && quizDetails) {
        const { quiz, details } = quizDetails;
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <button
                    onClick={() => router.push('/history')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> 返回列表
                </button>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">測驗結果</h1>
                        <div className="flex gap-4 text-slate-500 text-sm">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(quiz.completed_at)}</span>
                            <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {quiz.total_questions} 題</span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase ${quiz.mode === 'endless' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                                {quiz.mode === 'endless' ? '無盡模式' : '標準模式'}
                            </span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-1">{Math.round(quiz.score)}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Score</div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        答題詳情
                    </h2>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setShowOnlyIncorrect(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${showOnlyIncorrect
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <XCircle className="w-4 h-4" />
                            僅顯示錯題
                        </button>
                        <button
                            onClick={() => setShowOnlyIncorrect(false)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${!showOnlyIncorrect
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            顯示全部
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {(() => {
                        const processedDetails = details.map((q: any, idx: number) => ({ ...q, originalIndex: idx + 1 }));
                        const visibleQuestions = showOnlyIncorrect
                            ? processedDetails.filter((q: any) => !q.is_correct)
                            : processedDetails;

                        if (visibleQuestions.length === 0) {
                            return (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <div className="flex justify-center mb-4">
                                        <Award className="w-16 h-16 text-yellow-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">太棒了！</h3>
                                    <p className="text-slate-500">
                                        {showOnlyIncorrect && details.some((q: any) => q.is_correct)
                                            ? "您在本次測驗中全部答對，沒有錯題！"
                                            : "沒有符合條件的題目。"}
                                    </p>
                                    {showOnlyIncorrect && details.some((q: any) => q.is_correct) && (
                                        <button
                                            onClick={() => setShowOnlyIncorrect(false)}
                                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm underline underline-offset-4"
                                        >
                                            查看全部題目
                                        </button>
                                    )}
                                </div>
                            );
                        }

                        return visibleQuestions.map((q: any) => (
                            <div key={q.originalIndex} className={`bg-white rounded-xl border-l-4 p-6 shadow-sm ${q.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-slate-800 flex-1">{q.originalIndex}. {q.content}</h3>
                                    {q.is_correct ? <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" /> : <XCircle className="text-red-500 w-6 h-6 flex-shrink-0" />}
                                </div>

                                <div className="space-y-2 pl-4 border-l-2 border-slate-100 ml-1">
                                    {q.options.map((opt: string, i: number) => {
                                        const label = String.fromCharCode(65 + i);
                                        const isUserSelected = q.user_answers.includes(label);
                                        const isCorrect = q.correct_answers.includes(label);

                                        let style = "p-2 rounded flex items-center gap-2 transition-colors ";
                                        if (isCorrect) {
                                            if (isUserSelected) {
                                                style += "bg-green-100 text-green-800 font-bold border border-green-200";
                                            } else {
                                                style += "bg-white text-green-600 font-medium border-2 border-green-100 border-dashed";
                                            }
                                        } else if (isUserSelected) {
                                            style += "bg-red-50 text-red-700 font-medium border border-red-200 line-through";
                                        } else {
                                            style += "text-slate-500 hover:bg-slate-50";
                                        }

                                        return (
                                            <div key={i} className={style}>
                                                <span className="w-6 font-mono font-bold">({label})</span>
                                                <span className="flex-1">
                                                    {opt}
                                                    {isUserSelected && <span className="ml-2 text-xs bg-slate-800 text-white px-1.5 py-0.5 rounded">您的選擇</span>}
                                                    {!isUserSelected && isCorrect && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">未選正確答案</span>}
                                                </span>
                                                {isCorrect && (isUserSelected ? <CheckCircle className="w-5 h-5 text-green-600" /> : <div className="w-5 h-5 rounded-full border-2 border-green-300" />)}
                                                {isUserSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                                            </div>
                                        );
                                    })}
                                </div>
                                {!q.is_correct && (
                                    <div className="mt-4 text-sm text-slate-500">
                                        正確答案: <span className="font-bold text-green-600">{q.correct_answers.join(", ")}</span>
                                    </div>
                                )}
                            </div>
                        ));
                    })()}
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Award className="w-8 h-8 text-orange-500" />
                    歷史紀錄
                </h1>
                {historyList.length > 0 && (
                    <button
                        onClick={handleDeleteHistory}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
                    >
                        <Trash2 className="w-4 h-4" />
                        刪除歷史紀錄
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 font-medium text-slate-500">日期</th>
                            <th className="p-4 font-medium text-slate-500">模式</th>
                            <th className="p-4 font-medium text-slate-500">總分數</th>
                            <th className="p-4 font-medium text-slate-500">答對題數</th>
                            <th className="p-4 font-medium text-slate-500 text-right">詳情</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {historyList.map((h) => (
                            <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-700">{formatDate(h.completed_at)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${h.mode === 'endless' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {h.mode === 'endless' ? '無盡模式' : '標準模式'}
                                    </span>
                                </td>
                                <td className="p-4 font-bold text-blue-600">{Math.round(h.score)} 分</td>
                                <td className="p-4 text-slate-600">{h.correct_count} / {h.total_questions}</td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => router.push(`/history?id=${h.id}`)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        查看
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {historyList.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400">
                                    目前沒有測驗紀錄，快去練習吧！
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
