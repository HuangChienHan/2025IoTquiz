import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
        const quizCount = db.prepare('SELECT COUNT(*) as count FROM quizzes').get() as { count: number };

        // Calculate total correct answers vs total questions attempted
        const totalAttempted = db.prepare('SELECT SUM(total_questions) as count FROM quizzes').get() as { count: number | null };
        const totalCorrect = db.prepare('SELECT SUM(correct_count) as count FROM quizzes').get() as { count: number | null };

        const accuracy = totalAttempted?.count ? (totalCorrect!.count! / totalAttempted.count) * 100 : 0;

        // Calculate Wrong Pool and Mastered counts
        const allDetails = db.prepare('SELECT question_id, is_correct FROM quiz_details ORDER BY id ASC').all() as { question_id: number, is_correct: number }[];

        const questionStats = new Map<number, { correct: number, streak: number, everWrong: boolean }>();

        allDetails.forEach(d => {
            const s = questionStats.get(d.question_id) || { correct: 0, streak: 0, everWrong: false };
            if (d.is_correct === 1) {
                s.correct++;
                s.streak++;
            } else {
                s.streak = 0;
                s.everWrong = true;
            }
            questionStats.set(d.question_id, s);
        });

        let wrongQuestionsCount = 0;
        let masteredQuestionsCount = 0;

        questionStats.forEach((stats) => {
            const isMastered = stats.correct >= 5;
            
            if (isMastered) {
                masteredQuestionsCount++;
            } else {
                // Only consider for wrong pool if NOT mastered
                if (stats.everWrong && stats.streak < 3) {
                    wrongQuestionsCount++;
                }
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
