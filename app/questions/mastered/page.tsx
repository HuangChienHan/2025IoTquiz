"use client";

import { useEffect, useState } from "react";
import { Eye, X, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function MasteredQuestionsList() {
    const router = useRouter();
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await fetch("/api/questions/mastered");
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center flex-col gap-4 text-slate-600">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p>正在載入已熟悉題目...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/")} className="text-slate-500 hover:text-slate-800 transition-colors">
                        ← 返回
                    </button>
                    <h1 className="text-3xl font-bold text-slate-800">已熟悉題目</h1>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">共 {questions.length} 題</span>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 font-medium text-slate-500 w-24">解答</th>
                            <th className="p-4 font-medium text-slate-500">題目內容</th>
                            <th className="p-4 font-medium text-slate-500 w-24 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {questions.map((q) => (
                            <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono text-green-600 font-bold">
                                    {q.correct_answers.join(", ")}
                                </td>
                                <td className="p-4 text-slate-700">
                                    <div className="line-clamp-2">{q.content}</div>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => setSelectedQuestion(q)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {questions.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-12 text-center text-slate-400">
                                    目前沒有已熟悉的題目。繼續努力練習吧！
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {selectedQuestion && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-xl font-bold text-slate-800">題目詳情 (已熟悉)</h2>
                                <button onClick={() => setSelectedQuestion(null)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8">
                                <h3 className="text-lg font-medium text-slate-900 mb-6 leading-relaxed">
                                    {selectedQuestion.content}
                                </h3>
                                <div className="space-y-3">
                                    {selectedQuestion.options.map((opt: string, i: number) => {
                                        const label = String.fromCharCode(65 + i);
                                        const isCorrect = selectedQuestion.correct_answers.includes(label);
                                        return (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${isCorrect
                                                    ? 'bg-green-50 border-green-200 text-green-900'
                                                    : 'bg-white border-slate-200 text-slate-600'
                                                    }`}
                                            >
                                                <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${isCorrect ? 'bg-green-200 text-green-700' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    {label}
                                                </span>
                                                <span className="flex-1">{opt}</span>
                                                {isCorrect && <Check className="w-5 h-5 text-green-600" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 text-center">
                                <button
                                    onClick={() => setSelectedQuestion(null)}
                                    className="px-8 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50"
                                >
                                    關閉
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
