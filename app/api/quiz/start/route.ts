import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const count = body.count || 10;

        // Get all questions
        const allQuestions = db.prepare('SELECT id, content, options, correct_answers FROM questions').all();
        if (allQuestions.length === 0) {
            return NextResponse.json([]);
        }

        // Get history for classification
        // We want to know for each question: 
        // 1. Is it never attempted?
        // 2. Was it ever answered incorrectly?
        const attempts = db.prepare('SELECT question_id, is_correct FROM quiz_details').all() as { question_id: number, is_correct: number }[];

        const attemptsMap = new Map<number, { attempted: boolean, hasWrong: boolean }>();

        attempts.forEach(a => {
            const current = attemptsMap.get(a.question_id) || { attempted: false, hasWrong: false };
            current.attempted = true;
            if (a.is_correct === 0) {
                current.hasWrong = true;
            }
            attemptsMap.set(a.question_id, current);
        });

        // Categorize questions
        const unseen: any[] = [];
        const wrong: any[] = [];
        const others: any[] = [];

        allQuestions.forEach((q: any) => {
            const status = attemptsMap.get(q.id);

            const parsedQ = {
                ...q,
                options: JSON.parse(q.options),
                correct_answers: JSON.parse(q.correct_answers)
            };

            if (!status || !status.attempted) {
                unseen.push(parsedQ);
            } else if (status.hasWrong) {
                wrong.push(parsedQ);
            } else {
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

        // Return without revealing answers? Use case says "History record...".
        // For check during quiz? "Quiz screen... multiple choice... four options".
        // Usually client logic might need to know if multi-choice vs single choice?
        // User says "Possible multi-choice".
        // The `correct_answers` array length tells us that.
        // I will include `correct_answers` in the response but FE should hide it from user view until result?
        // Or simpler: Send it, let FE handle validation strictly for UI feedback if needed, 
        // BUT actual scoring happens on submit at backend.

        return NextResponse.json(result);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
