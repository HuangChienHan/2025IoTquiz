const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'quiz.db');
const db = new Database(dbPath, { verbose: console.log });

const initSql = `
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON array
    correct_answers TEXT NOT NULL, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    score REAL NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS quiz_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    user_answers TEXT NOT NULL, -- JSON array
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );
`;

console.log('Initializing database...');
db.exec(initSql);
console.log('Database initialized at ' + dbPath);
