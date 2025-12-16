import db from '@/lib/db';

export interface QuestionStats {
    questionId: number;
    correct: number;
    streak: number;
    everWrong: boolean;
}

export function getQuestionStats(): Map<number, QuestionStats> {
    const allDetails = db.prepare('SELECT question_id, is_correct FROM quiz_details ORDER BY id ASC').all() as { question_id: number, is_correct: number }[];

    const questionStats = new Map<number, QuestionStats>();

    allDetails.forEach(d => {
        const s = questionStats.get(d.question_id) || { questionId: d.question_id, correct: 0, streak: 0, everWrong: false };
        if (d.is_correct === 1) {
            s.correct++;
            s.streak++;
        } else {
            s.streak = 0;
            s.everWrong = true;
        }
        questionStats.set(d.question_id, s);
    });

    return questionStats;
}

export function isMastered(stats: QuestionStats): boolean {
    return stats.correct >= 5;
}

export function isInWrongPool(stats: QuestionStats): boolean {
    if (isMastered(stats)) return false;
    return stats.everWrong && stats.streak < 3;
}
