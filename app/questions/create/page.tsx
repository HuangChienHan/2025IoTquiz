"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertCircle, FileText, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateQuestions() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const parseText = () => {
        const lines = input.split('\n');
        const questions: any[] = [];
        let currentBlock: string[] = [];

        // Helper to process a block
        const processBlock = (blockLines: string[]) => {
            if (blockLines.length === 0) return;
            const fullText = blockLines.join(' ');

            // Regex to match "Answer[tab/space]Number. Content (A)OptionA (B)OptionB..."
            // Improved regex to handle the format: ^([A-Z,]+)\s+(\d+\..*)$
            // And then extract options from the content.

            const match = fullText.match(/^([A-Z,]+)\s+(\d+\.)\s*(.*)$/);

            if (match) {
                const answerRaw = match[1];
                // match[2] is the number (e.g. "89."), match[3] is the rest of content
                const fullContent = match[3];

                // Extract correct answers
                const correctAnswers = answerRaw.split(',').map(s => s.trim());

                // Extract Options: (A)... (B)... (C)... (D)...
                // We look for patterns like (A), (B), etc.
                const options: string[] = [];
                let cleanContent = fullContent;

                // Split by (A), (B), etc.
                // A tricky part involves identifying where options start. 
                // Strategy: specific split by regex `\([A-Z]\)`

                const optionParts = fullContent.split(/\([A-HS]\)/); // A-H just in case, usually A-D.
                // optionParts[0] is the question body.
                // optionParts[1] is content for first option matched, but we need to know WHICH option it was.

                // Better strategy: Match all occurrences of `([A-Z])`
                const optionMatches = [...fullContent.matchAll(/\(([A-Z])\)([^()]+)/g)];

                if (optionMatches.length >= 2) { // At least 2 options
                    // The question body is everything before the first option
                    const firstIndex = optionMatches[0].index!;
                    cleanContent = fullContent.substring(0, firstIndex).trim();

                    optionMatches.forEach(m => {
                        options.push(m[2].trim());
                    });
                }

                questions.push({
                    content: cleanContent,
                    options: options,
                    correct_answers: correctAnswers,
                    cleanAnswers: correctAnswers // normalized
                });
            }
        };

        lines.forEach(line => {
            const trimLine = line.trim();
            // If line starts with "A" or "A,B" type char followed by number, it's a new question start.
            // Check pattern: ^[A-Z,]+\s+\d+\.
            if (/^[A-Z,]+\s+\d+\./.test(trimLine)) {
                // Process previous block
                if (currentBlock.length > 0) processBlock(currentBlock);
                currentBlock = [trimLine];
            } else if (/^（\d+\s*,\s*\d+則/.test(trimLine)) {
                // Ignore metadata line
            } else {
                if (currentBlock.length > 0 && trimLine) {
                    currentBlock.push(trimLine);
                }
            }
        });
        // Process last block
        if (currentBlock.length > 0) processBlock(currentBlock);

        setParsedQuestions(questions);
        setShowPreview(true);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: parsedQuestions })
            });
            if (res.ok) {
                router.push('/questions');
            } else {
                alert('儲存失敗');
            }
        } catch (e) {
            console.error(e);
            alert('發生錯誤');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                建立題庫
            </h1>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <label className="block text-sm font-medium text-slate-600 mb-2">
                    貼上題目內容 (格式：答案 [Tab/Space] 題號. 題目 (A)選項...)
                </label>
                <textarea
                    className="w-full h-96 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
                    placeholder={`範例：\nA\t4. 下列哪一種感測器... (A)電子羅盤 (B)陀螺儀...\n（2087929 , 0則）`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                <div className="flex justify-end mt-4">
                    <button
                        onClick={parseText}
                        disabled={!input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check className="w-4 h-4" />
                        解析題目
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showPreview && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800">
                                    預覽解析結果 ({parsedQuestions.length} 題)
                                </h2>
                                <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-6 bg-slate-50">
                                {parsedQuestions.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>無法解析題目，請檢查格式是否正確。</p>
                                    </div>
                                ) : (
                                    parsedQuestions.map((q, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                            <div className="flex gap-3 mb-3">
                                                <span className="bg-blue-100 text-blue-700 font-mono text-sm px-2 py-1 rounded">
                                                    #{idx + 1}
                                                </span>
                                                <h3 className="font-medium text-slate-800 leading-relaxed">
                                                    {q.content}
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12 mb-4">
                                                {q.options.map((opt: string, i: number) => {
                                                    const label = String.fromCharCode(65 + i); // A, B...
                                                    const isCorrect = q.correct_answers.includes(label);
                                                    return (
                                                        <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                                                            <span className={`font-bold w-6 ${isCorrect ? 'text-green-600' : 'text-slate-400'}`}>
                                                                ({label})
                                                            </span>
                                                            <span className={`${isCorrect ? 'text-green-900' : 'text-slate-600'}`}>
                                                                {opt}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="pl-12 text-sm text-slate-400">
                                                參考答案: <span className="font-bold text-slate-700">{q.correct_answers.join(', ')}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    取消修改
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSubmitting || parsedQuestions.length === 0}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSubmitting ? '儲存中...' : '確認新增'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
