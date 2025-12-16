import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getQuestionStats, isInWrongPool } from '@/lib/quiz-helper';

export async function GET() {
    try {
        // Get all questions
        const allQuestions = db.prepare('SELECT id, content, options, correct_answers FROM questions').all();

        // Get stats
        const statsMap = getQuestionStats();

        // Filter for Wrong Pool
        const wrongQuestions: any[] = [];

        allQuestions.forEach((q: any) => {
            const stats = statsMap.get(q.id);
            if (stats && isInWrongPool(stats)) {
                wrongQuestions.push({
                    ...q,
                    options: JSON.parse(q.options),
                    correct_answers: JSON.parse(q.correct_answers)
                });
            }
        });

        return NextResponse.json(wrongQuestions);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
