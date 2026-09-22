import {DatabaseSync} from 'node:sqlite'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

// Create the DB

const db = new DatabaseSync('database.db')

// Execute SQL 
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
    )
`)

db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
    todo_id INTEGER,
    user_id INTEGER,
    task TEXT,
    completed BOOLEAN DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES USERS(id)
    )
`)

export default db