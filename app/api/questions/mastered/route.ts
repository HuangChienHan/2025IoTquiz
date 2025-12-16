import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getQuestionStats, isMastered } from '@/lib/quiz-helper';

export async function GET() {
    try {
        // Get all questions
        const allQuestions = db.prepare('SELECT id, content, options, correct_answers FROM questions').all();

        // Get stats
        const statsMap = getQuestionStats();

        // Filter for Mastered
        const masteredQuestions: any[] = [];

        allQuestions.forEach((q: any) => {
            const stats = statsMap.get(q.id);
            if (stats && isMastered(stats)) {
                masteredQuestions.push({
                    ...q,
                    options: JSON.parse(q.options),
                    correct_answers: JSON.parse(q.correct_answers)
                });
            }
        });

        return NextResponse.json(masteredQuestions);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
