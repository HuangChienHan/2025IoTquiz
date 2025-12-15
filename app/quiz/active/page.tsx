"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, CheckCircle, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ActiveQuiz() {
    const router = useRouter();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const data = sessionStorage.getItem("currentQuiz");
        if (!data) {
            router.replace("/quiz/setup");
            return;
        }
        try {
            const parsed = JSON.parse(data);
            if (parsed.length === 0) router.replace("/quiz/setup");
            setQuestions(parsed);
        } catch (e) {
            router.replace("/quiz/setup");
        }
    }, [router]);

    const currentQuestion = questions[currentIndex];
    const currentAnswer = currentQuestion ? (answers[currentQuestion.id] || []) : [];

    const toggleOption = (label: string) => {
        if (!currentQuestion) return;

        const isMulti = currentQuestion.correct_answers && currentQuestion.correct_answers.length > 1;

        let newAnswer;
        if (isMulti) {
            if (currentAnswer.includes(label)) {
                newAnswer = currentAnswer.filter(a => a !== label);
            } else {
                newAnswer = [...currentAnswer, label].sort();
            }
        } else {
            newAnswer = [label];
        }

        setAnswers({
            ...answers,
            [currentQuestion.id]: newAnswer
        });
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!confirm("確定要交卷嗎？")) return;
        setIsSubmitting(true);

        const payload = questions.map(q => ({
            id: q.id,
            selectedAnswers: answers[q.id] || []
        }));

        try {
            const res = await fetch("/api/quiz/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questions: payload })
            });

            if (res.ok) {
                const result = await res.json();
                sessionStorage.removeItem("currentQuiz");
                router.push(`/history?id=${result.quizId}`);
            } else {
                alert("提交失敗，請重試");
                setIsSubmitting(false);
            }
        } catch (e) {
            console.error(e);
            alert("提交發生錯誤");
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (questions.length === 0 || !currentQuestion) return;

            if (['1', '2', '3', '4'].includes(e.key)) {
                const index = parseInt(e.key) - 1;
                if (index < currentQuestion.options.length) {
                    const label = String.fromCharCode(65 + index);
                    toggleOption(label);
                }
            }

            if (e.key === 'Enter') {
                if (currentIndex < questions.length - 1) {
                    handleNext();
                } else {
                    handleSubmit();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    if (questions.length === 0) return null;

    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isLast = currentIndex === questions.length - 1;

    return (
        <div className="max-w-3xl mx-auto pt-4 md:pt-10 h-full flex flex-col">
            {/* Header / Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-slate-500 font-medium">Question {currentIndex + 1} of {questions.length}</span>
                    <span className="text-blue-600 font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-10 flex flex-col">
                <div className="flex-1">
                    <div className="flex gap-2 mb-4">
                        {currentQuestion.correct_answers.length > 1 && (
                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-bold uppercase">
                                多選題
                            </span>
                        )}
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-8">
                        {currentQuestion.content}
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((opt: string, i: number) => {
                            const label = String.fromCharCode(65 + i);
                            const isSelected = currentAnswer.includes(label);

                            return (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => toggleOption(label)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${isSelected
                                            ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md shadow-blue-500/10'
                                            : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border ${isSelected
                                            ? 'bg-blue-500 border-blue-500 text-white'
                                            : 'bg-white border-slate-300 text-slate-400'
                                        }`}>
                                        {label}
                                    </div>
                                    <span className="text-lg">{opt}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-8 border-t border-slate-100">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500"
                    >
                        <ChevronLeft className="w-5 h-5" /> 上一題
                    </button>

                    {isLast ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-600/30 flex items-center gap-2"
                        >
                            {isSubmitting ? '提交中...' : '交卷'} <CheckCircle className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2"
                        >
                            下一題 <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="mt-6 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200 font-mono text-xs">1-4</span> 選擇
                    <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200 font-mono text-xs">Enter</span> 下一題
                </div>
            </div>
        </div>
    );
}
