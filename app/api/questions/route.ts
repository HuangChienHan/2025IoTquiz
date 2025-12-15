import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const questions = db.prepare('SELECT * FROM questions ORDER BY created_at DESC').all();
        // Parse JSON fields
        const parsedQuestions = questions.map((q: any) => ({
            ...q,
            options: JSON.parse(q.options),
            correct_answers: JSON.parse(q.correct_answers)
        }));
        return NextResponse.json(parsedQuestions);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { questions } = body;

        if (!Array.isArray(questions)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const insert = db.prepare('INSERT INTO questions (content, options, correct_answers) VALUES (@content, @options, @correct_answers)');
        const insertMany = db.transaction((qs) => {
            for (const q of qs) {
                insert.run({
                    content: q.content,
                    options: JSON.stringify(q.options),
                    correct_answers: JSON.stringify(q.correct_answers)
                });
            }
        });

        insertMany(questions);

        return NextResponse.json({ success: true, count: questions.length });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        const stmt = db.prepare('DELETE FROM questions WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
