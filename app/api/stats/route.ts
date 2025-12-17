import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getQuestionStats, isMastered, isInWrongPool } from '@/lib/quiz-helper';

export async function GET() {
    try {
        const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
        const quizCount = db.prepare('SELECT COUNT(*) as count FROM quizzes').get() as { count: number };

        // Calculate total correct answers vs total questions attempted
        const totalAttempted = db.prepare('SELECT SUM(total_questions) as count FROM quizzes').get() as { count: number | null };
        const totalCorrect = db.prepare('SELECT SUM(correct_count) as count FROM quizzes').get() as { count: number | null };

        const accuracy = totalAttempted?.count ? (totalCorrect!.count! / totalAttempted.count) * 100 : 0;

        // Calculate Wrong Pool and Mastered counts using shared helper
        const questionStats = getQuestionStats();

        let wrongQuestionsCount = 0;
        let masteredQuestionsCount = 0;

        questionStats.forEach((stats) => {
            if (isMastered(stats)) {
                masteredQuestionsCount++;
            } else if (isInWrongPool(stats)) {
                wrongQuestionsCount++;
            }
        });

        return NextResponse.json({
            totalQuestions: questionCount.count,
            totalQuizzes: quizCount.count,
            totalAnswered: totalAttempted?.count || 0,
            accuracy: accuracy.toFixed(1),
            wrongQuestionsCount,
            masteredQuestionsCount
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
