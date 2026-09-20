import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const router = express.Router()

// Path code
const __filename = fileURLToPath(import.meta.url)
const __dirname =  path.dirname(__filename)
const publicDirectory = path.join(__dirname, '..', '..', 'public')

// Login Register
router.get('/register', (req, res) => {
    res.sendFile(path.join(publicDirectory, 'login', 'index.html'))
})

export default router