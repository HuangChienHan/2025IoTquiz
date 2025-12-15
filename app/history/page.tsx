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
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-1">{Math.round(quiz.score)}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Score</div>
                    </div>
                </div>

                <div className="space-y-6">
                    {details.map((q: any, idx: number) => (
                        <div key={idx} className={`bg-white rounded-xl border-l-4 p-6 shadow-sm ${q.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-slate-800 flex-1">{idx + 1}. {q.content}</h3>
                                {q.is_correct ? <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" /> : <XCircle className="text-red-500 w-6 h-6 flex-shrink-0" />}
                            </div>

                            <div className="space-y-2 pl-4 border-l-2 border-slate-100 ml-1">
                                {q.options.map((opt: string, i: number) => {
                                    const label = String.fromCharCode(65 + i);
                                    const isUserSelected = q.user_answers.includes(label);
                                    const isCorrect = q.correct_answers.includes(label);

                                    let style = "text-slate-500";
                                    if (isCorrect) style = "text-green-700 font-bold bg-green-50 p-2 rounded";
                                    else if (isUserSelected && !isCorrect) style = "text-red-600 font-medium bg-red-50 p-2 rounded line-through";
                                    else if (isUserSelected && isCorrect) style = "text-green-700 font-bold bg-green-50 p-2 rounded"; // Covered above

                                    return (
                                        <div key={i} className={`flex items-center gap-2 ${style}`}>
                                            <span className="w-6 font-mono">({label})</span>
                                            <span>{opt} {isUserSelected && "(您的選擇)"}</span>
                                            {isCorrect && <CheckCircle className="w-4 h-4 ml-auto" />}
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
                    ))}
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
                            <th className="p-4 font-medium text-slate-500">總分數</th>
                            <th className="p-4 font-medium text-slate-500">答對題數</th>
                            <th className="p-4 font-medium text-slate-500 text-right">詳情</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {historyList.map((h) => (
                            <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-700">{formatDate(h.completed_at)}</td>
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
                                <td colSpan={4} className="p-12 text-center text-slate-400">
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
