import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            // Get specific quiz details
            const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
            if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 });

            // Get Join details
            const details = db.prepare(`
                SELECT qd.*, q.content, q.options, q.correct_answers 
                FROM quiz_details qd
                JOIN questions q ON qd.question_id = q.id
                WHERE qd.quiz_id = ?
            `).all(id);

            const parsedDetails = details.map((d: any) => ({
                ...d,
                user_answers: JSON.parse(d.user_answers),
                options: JSON.parse(d.options),
                correct_answers: JSON.parse(d.correct_answers),
                is_correct: Boolean(d.is_correct)
            }));

            return NextResponse.json({ quiz, details: parsedDetails });
        } else {
            // List all quizzes
            const quizzes = db.prepare('SELECT * FROM quizzes ORDER BY completed_at DESC').all();
            return NextResponse.json(quizzes);
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
