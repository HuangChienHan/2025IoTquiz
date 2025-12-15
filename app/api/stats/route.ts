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

        return NextResponse.json({
            totalQuestions: questionCount.count,
            totalQuizzes: quizCount.count,
            totalAnswered: totalAttempted?.count || 0,
            accuracy: accuracy.toFixed(1)
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
