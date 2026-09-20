import db from '../services/mysql.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function createUser(req, res) {
    const { email, password } = req.body
    const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email])

    if (!email || !password) {
        return res.status(401).json({message: 'Please fill the required input.'})
    }

    if (result.length > 0) {
        return res.status(401).json({message: 'Email already exists.'})
    }
    const hashedPassword = await bcrypt.hash(password, 8)
    
    const [success] = await db.query('INSERT INTO users (email, password) VALUES (?,?)', [email, hashedPassword])
    const userId = success.insertId
    const token = await jwt.sign({userId}, process.env.JWT_SECRET_TOKEN, {expiresIn: '7d'})
    return res.status(200).json({token: token})
    console.log('successfully created the account')
}