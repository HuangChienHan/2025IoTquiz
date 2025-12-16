"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function WrongReviewSetup() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startReview = async () => {
            try {
                // Fetch wrong questions (default 20 or similar, user didn't specify, but review usually implies reasonable batch)
                // Let's ask for 50 max to cover most? Or standard 10?
                // The API default is 10. Let's explicitly ask for more if possible, say 20.
                const res = await fetch("/api/quiz/wrong-review", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ count: 20 })
                });

                if (!res.ok) throw new Error("Failed to fetch questions");

                const questions = await res.json();

                if (questions.length === 0) {
                    setError("目前沒有錯題需要複習！做得好！");
                    setLoading(false);
                    return;
                }

                sessionStorage.setItem("currentQuiz", JSON.stringify(questions));
                router.replace("/quiz/active");
            } catch (e) {
                console.error(e);
                setError("無法載入錯題，請稍後再試");
                setLoading(false);
            }
        };

        startReview();
    }, [router]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center flex-col gap-4 text-slate-600">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p>正在整理您的錯題...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center flex-col gap-4 text-slate-600">
                <div className="p-8 bg-white rounded-2xl shadow-xl text-center">
                    <h2 className="text-xl font-bold mb-2 text-slate-800">{error}</h2>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        回首頁
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
