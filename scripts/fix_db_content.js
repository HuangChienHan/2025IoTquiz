
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../quiz.db');
const db = new Database(dbPath);

console.log('Opened database at', dbPath);

// Regex to capture the unwanted metadata at the end of the string
const METADATA_REGEX = /\s*（\d+\s*,\s*\d+則[^）]*）\s*$/;
// Regex to capture leading question numbers (e.g., "1. ", "89. ")
const QUESTION_NUMBER_REGEX = /^\d+\.\s*/;

try {
    const questions = db.prepare('SELECT id, content, options FROM questions').all();
    let updatedCount = 0;

    const updateStmt = db.prepare('UPDATE questions SET content = ?, options = ? WHERE id = ?');

    db.transaction(() => {
        for (const q of questions) {
            let options;
            try {
                options = JSON.parse(q.options);
            } catch (e) {
                console.error(`Failed to parse options for question ${q.id}:`, e);
                continue;
            }

            let modified = false;
            let newContent = q.content;

            // Clean content (remove leading number)
            if (QUESTION_NUMBER_REGEX.test(newContent)) {
                newContent = newContent.replace(QUESTION_NUMBER_REGEX, '');
                modified = true;
            }

            // Clean options
            const newOptions = options.map(opt => {
                if (METADATA_REGEX.test(opt)) {
                    modified = true;
                    return opt.replace(METADATA_REGEX, '').trim();
                }
                return opt;
            });

            if (modified) {
                updateStmt.run(newContent, JSON.stringify(newOptions), q.id);
                updatedCount++;
                // console.log(`Updated question ${q.id}`);
            }
        }
    })();

    console.log(`Successfully updated ${updatedCount} questions.`);

} catch (err) {
    console.error('Error executing cleanup:', err);
} finally {
    db.close();
}
