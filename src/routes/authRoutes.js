import 'dotenv/config'
import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import db from '../db.js'


const router = express.Router()

router.post('/login', (req, res) => {
    const { username, password } = req.body
    try {
        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username)
        if (!user) {return res.status(404).send({ message: "User cannot be found"})} 
        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1h'})
            res.json({token: token})
        } else {
            res.json({message: "Incorrect password."})
        }
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

router.post('/register', async (req, res) => {
    const { username, password } = req.body
    const hashedPassword =  bcrypt.hashSync(password, 8)
    // save the new user to the db
    const exist = await db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if (exist) { return res.status(401).json({message: "Account already exist."}) }
    try {
        
        const insertUser = db.prepare(`INSERT INTO users(username, password) VALUES (?, ?)`)
        const result = insertUser.run(username, hashedPassword)

        // default todos that added as user register
        const defaultTodo = `Todo Example`
        const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?,?)`)
        insertTodo.run(result.lastInsertRowid, defaultTodo)

        // create a token to confirm who they are, so people cant just modify other's todos
        const token = jwt.sign({id: result.lastInsertRowid}, process.env.JWT_SECRET, { expiresIn:'1h' })
        console.log(result.lastInsertRowid)
        res.json({ token })
        console.log(`[authRoutes] registered ${username}@${hashedPassword} to the system.`)
    } catch (err) {
        console.log(`[authRoutes] ${err.message}`)
        res.sendStatus(503)
    }

    
})

export default router