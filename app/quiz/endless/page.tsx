"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CheckCircle, XCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function EndlessQuiz() {
    const router = useRouter();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string[]>>({});
    const [results, setResults] = useState<Record<number, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState(false);
    const [loading, setLoading] = useState(true);
    const [shuffledIndices, setShuffledIndices] = useState<Record<number, number[]>>({});

    useEffect(() => {
        // Fetch a large batch of questions
        fetch("/api/quiz/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ count: 1000 }) // Fetch 1000 questions for endless mode
        })
            .then(res => res.json())
            .then(data => {
                // Generate shuffled indices
                const newShuffledIndices: Record<number, number[]> = {};
                data.forEach((q: any) => {
                    const indices = q.options.map((_: any, i: number) => i);
                    for (let i = indices.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [indices[i], indices[j]] = [indices[j], indices[i]];
                    }
                    newShuffledIndices[q.id] = indices;
                });
                setShuffledIndices(newShuffledIndices);
                setQuestions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const currentQuestion = questions[currentIndex];
    const currentAnswer = currentQuestion ? (answers[currentQuestion.id] || []) : [];
    const isCorrect = currentQuestion ? results[currentQuestion.id] : undefined;

    // Get shuffled indices
    const currentIndices = currentQuestion && shuffledIndices[currentQuestion.id]
        ? shuffledIndices[currentQuestion.id]
        : (currentQuestion ? currentQuestion.options.map((_: any, i: number) => i) : []);

    const toggleOption = (label: string) => {
        if (!currentQuestion || hasSubmittedCurrent) return;

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

    const checkAnswer = () => {
        if (!currentQuestion || currentAnswer.length === 0) return;

        const correctAnswers = currentQuestion.correct_answers;
        const isAnswerCorrect =
            correctAnswers.length === currentAnswer.length &&
            correctAnswers.every((a: string) => currentAnswer.includes(a));

        setResults({
            ...results,
            [currentQuestion.id]: isAnswerCorrect
        });
        setHasSubmittedCurrent(true);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setHasSubmittedCurrent(false);
        } else {
            alert("恭喜！你已完成所有題目。");
            handleExit();
        }
    };

    const handleExit = async () => {
        if (!confirm("確定要結束無盡模式並計算成績嗎？")) return;
        setIsSubmitting(true);

        const answeredQuestions = questions.filter(q => answers[q.id] !== undefined);

        const payload = answeredQuestions.map(q => ({
            id: q.id,
            selectedAnswers: answers[q.id] || []
        }));

        try {
            const res = await fetch("/api/quiz/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questions: payload,
                    mode: 'endless'
                })
            });

            if (res.ok) {
                const result = await res.json();
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
            if (loading || !currentQuestion) return;

            if (['1', '2', '3', '4'].includes(e.key)) {
                const visualIndex = parseInt(e.key) - 1;
                if (visualIndex < currentQuestion.options.length) {
                    const originalIndex = currentIndices[visualIndex];
                    const originalLabel = String.fromCharCode(65 + originalIndex);
                    toggleOption(originalLabel);
                }
            }

            if (e.key === 'Enter') {
                if (!hasSubmittedCurrent) {
                    checkAnswer();
                } else {
                    handleNext();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    if (loading) return <div className="flex justify-center items-center h-screen">載入中...</div>;
    if (!currentQuestion) return <div className="flex justify-center items-center h-screen">沒有題目</div>;

    return (
        <div className="max-w-3xl mx-auto pt-4 md:pt-10 h-full flex flex-col">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">無盡模式</h1>
                    <p className="text-slate-500">已回答: {Object.keys(results).length} 題</p>
                </div>
                <button
                    onClick={handleExit}
                    disabled={isSubmitting}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                    <LogOut className="w-5 h-5" /> 結束測驗
                </button>
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
                        {currentIndices.map((originalIndex: number, visualIndex: number) => {
                            const opt = currentQuestion.options[originalIndex];

                            // Visual display label (A, B, C...)
                            const visualLabel = String.fromCharCode(65 + visualIndex);

                            // Original ID label for logic (A, B, C...)
                            const originalLabel = String.fromCharCode(65 + originalIndex);

                            const isSelected = currentAnswer.includes(originalLabel);

                            // Visual feedback logic
                            let borderClass = 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600';
                            let bgClass = 'bg-white border-slate-300 text-slate-400';

                            if (hasSubmittedCurrent) {
                                const isCorrectAnswer = currentQuestion.correct_answers.includes(originalLabel);
                                if (isCorrectAnswer) {
                                    borderClass = 'border-green-500 bg-green-50 text-green-900';
                                    bgClass = 'bg-green-500 border-green-500 text-white';
                                } else if (isSelected && !isCorrectAnswer) {
                                    borderClass = 'border-red-500 bg-red-50 text-red-900';
                                    bgClass = 'bg-red-500 border-red-500 text-white';
                                } else {
                                    borderClass = 'border-slate-100 opacity-50';
                                }
                            } else if (isSelected) {
                                borderClass = 'border-blue-500 bg-blue-50 text-blue-900 shadow-md shadow-blue-500/10';
                                bgClass = 'bg-blue-500 border-blue-500 text-white';
                            }

                            return (
                                <motion.button
                                    key={originalIndex}
                                    whileHover={!hasSubmittedCurrent ? { scale: 1.01 } : {}}
                                    whileTap={!hasSubmittedCurrent ? { scale: 0.99 } : {}}
                                    onClick={() => toggleOption(originalLabel)}
                                    disabled={hasSubmittedCurrent}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${borderClass}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border ${bgClass}`}>
                                        {visualLabel}
                                    </div>
                                    <span className="text-lg">{opt}</span>
                                    {hasSubmittedCurrent && currentQuestion.correct_answers.includes(originalLabel) && (
                                        <CheckCircle className="w-6 h-6 text-green-600 ml-auto" />
                                    )}
                                    {hasSubmittedCurrent && isSelected && !currentQuestion.correct_answers.includes(originalLabel) && (
                                        <XCircle className="w-6 h-6 text-red-600 ml-auto" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Feedback & Navigation */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                    {!hasSubmittedCurrent ? (
                        <button
                            onClick={checkAnswer}
                            disabled={currentAnswer.length === 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                        >
                            送出答案
                        </button>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {isCorrect ? (
                                    <>
                                        <CheckCircle className="w-6 h-6" />
                                        <span className="font-bold">回答正確！</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-6 h-6" />
                                        <span className="font-bold">回答錯誤</span>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleNext}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                            >
                                下一題 <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200 font-mono text-xs">1-4</span> 選擇
                    <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200 font-mono text-xs">Enter</span> 送出/下一題
                </div>
            </div>
        </div>
    );
}
