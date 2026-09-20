import db from '../services/mysql.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

export async function createUser(req, res) {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(401).json({message: 'Please fill the required input.'})
    }

    const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email])

    
    if (result.length > 0) {
        return res.status(401).json({message: 'Email already exists.'})
    }
    const hashedPassword = await bcrypt.hash(password, 8)
    
    const [success] = await db.query('INSERT INTO users (email, password) VALUES (?,?)', [email, hashedPassword])
    const userId = success.insertId
    const token = jwt.sign({userId}, process.env.JWT_SECRET_TOKEN, {expiresIn: '24h'})
    return res.status(200).json({token: token})
}

export async function loginUser(req, res) {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(401).json({message: 'Please fill the required input.'})
    }

    const [ dbResult ] = await db.query('SELECT id, email, password FROM users WHERE email = ?', [email])
    if (dbResult.length === 0) { return res.status(404).json({ message: 'Cannot found email.' }) }

    // If email is found in the database
    const result = bcrypt.compareSync(password, dbResult[0].password)
    console.log(result)
    if (!result) { return res.status(401).json({ message: 'Invalid password.' }) }
    const token = jwt.sign({userId: dbResult[0].id}, process.env.JWT_SECRET_TOKEN, {expiresIn: '24h'})
    return res.status(200).json({token: token})
}