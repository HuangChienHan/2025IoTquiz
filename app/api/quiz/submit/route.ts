import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { questions } = body; // Array of { id, selectedAnswers: [] }

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        let correctCount = 0;
        const totalQuestions = questions.length;
        const detailsToInsert: any[] = [];

        // Fetch correct answers for validation
        const questionIds = questions.map((q: any) => q.id);
        if (questionIds.length === 0) {
            return NextResponse.json({ score: 0, total: 0 });
        }

        const dbQuestions = db.prepare(`SELECT id, correct_answers FROM questions WHERE id IN (${questionIds.join(',')})`).all();
        const dbQMap = new Map(dbQuestions.map((q: any) => [q.id, JSON.parse(q.correct_answers)]));

        questions.forEach((q: any) => {
            const correctAnswers = dbQMap.get(q.id) as string[];
            const userAnswers = q.selectedAnswers || [];

            // Determine correctness
            // Logic: Exact match of arrays (ignoring order? User says "Multiple choice", typically all correct required)
            // Or set equality.
            const isCorrect =
                correctAnswers.length === userAnswers.length &&
                correctAnswers.every(a => userAnswers.includes(a));

            if (isCorrect) correctCount++;

            detailsToInsert.push({
                question_id: q.id,
                user_answers: userAnswers,
                is_correct: isCorrect ? 1 : 0
            });
        });

        const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

        // Transaction to save result
        // Insert Quiz
        const insertQuiz = db.prepare('INSERT INTO quizzes (score, total_questions, correct_count) VALUES (?, ?, ?)');
        const insertDetail = db.prepare('INSERT INTO quiz_details (quiz_id, question_id, user_answers, is_correct) VALUES (?, ?, ?, ?)');

        const result = db.transaction(() => {
            const info = insertQuiz.run(score, totalQuestions, correctCount);
            const quizId = info.lastInsertRowid;

            for (const d of detailsToInsert) {
                insertDetail.run(quizId, d.question_id, JSON.stringify(d.user_answers), d.is_correct);
            }
            return quizId;
        })();

        return NextResponse.json({ success: true, quizId: result, score, correctCount, totalQuestions });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
