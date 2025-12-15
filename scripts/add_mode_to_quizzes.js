const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'quiz.db');
const db = new Database(dbPath, { verbose: console.log });

try {
  console.log('Adding mode column to quizzes table...');
  db.exec(`ALTER TABLE quizzes ADD COLUMN mode TEXT DEFAULT 'standard'`);
  console.log('Successfully added mode column.');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('Column mode already exists.');
  } else {
    console.error('Error adding column:', error);
  }
}
