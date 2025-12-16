import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getQuestionStats, isMastered, isInWrongPool } from '@/lib/quiz-helper';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const count = body.count || 10;

        // Get all questions
        const allQuestions = db.prepare('SELECT id, content, options, correct_answers FROM questions').all();
        if (allQuestions.length === 0) {
            return NextResponse.json([]);
        }

        // Get stats
        const statsMap = getQuestionStats();

        // Categorize questions
        const unseen: any[] = [];
        const wrong: any[] = [];
        const others: any[] = [];

        allQuestions.forEach((q: any) => {
            const stats = statsMap.get(q.id);
            const parsedQ = {
                ...q,
                options: JSON.parse(q.options),
                correct_answers: JSON.parse(q.correct_answers)
            };

            // If Mastered, exclude completely
            if (stats && isMastered(stats)) {
                return;
            }

            if (!stats) {
                // No stats => Unseen
                unseen.push(parsedQ);
            } else if (isInWrongPool(stats)) {
                wrong.push(parsedQ);
            } else {
                // Not mastered, not wrong pool => Others (e.g. correct recently)
                others.push(parsedQ);
            }
        });

        // Shuffle helper
        const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

        // Select questions
        let selected: any[] = [];

        // 1. Unseen
        selected = [...selected, ...shuffle(unseen)];

        // 2. Wrong (if space needed)
        if (selected.length < count) {
            selected = [...selected, ...shuffle(wrong)];
        }

        // 3. Others (if space needed)
        if (selected.length < count) {
            selected = [...selected, ...shuffle(others)];
        }

        // Trim to count
        const result = selected.slice(0, count);

        return NextResponse.json(result);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
