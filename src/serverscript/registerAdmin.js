import db from '../db.js'
import bcrypt from 'bcryptjs'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { hash } from 'node:crypto'

async function askUser() {
    const rl = readline.createInterface({ input, output })

    const email = await rl.question('Please input your email: ')
    const password = await rl.question('Please input your password: ')

    rl.close()

    const hashedPassword = await bcrypt.hash(password, 10)
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(email, hashedPassword, 'admin')
}
askUser()
