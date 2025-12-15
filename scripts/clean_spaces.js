const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'quiz.db');
const db = new Database(dbPath);

console.log('Cleaning spaces from questions...');

const stmt = db.prepare('SELECT id, content, options FROM questions');
const updateStmt = db.prepare('UPDATE questions SET content = ?, options = ? WHERE id = ?');

const questions = stmt.all();

let updatedCount = 0;

db.transaction(() => {
    for (const q of questions) {
        // Remove all whitespace from content
        const newContent = q.content.replace(/\s+/g, '');

        // Parse options, remove whitespace, and stringify
        let newOptions = q.options;
        try {
            const parsedOptions = JSON.parse(q.options);
            if (Array.isArray(parsedOptions)) {
                const cleanedOptions = parsedOptions.map(opt => String(opt).replace(/\s+/g, ''));
                newOptions = JSON.stringify(cleanedOptions);
            }
        } catch (error) {
            console.warn(`Failed to parse options for question id ${q.id}: ${error.message}`);
        }

        if (newContent !== q.content || newOptions !== q.options) {
            updateStmt.run(newContent, newOptions, q.id);
            updatedCount++;
        }
    }
})();

console.log(`Finished. Updated ${updatedCount} questions.`);
