import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authMiddleware from '../middleware/authMiddleware.js'
const router = express.Router()

// Path code
const __filename = fileURLToPath(import.meta.url)
const __dirname =  path.dirname(__filename)
const publicDirectory = path.join(__dirname, '..', '..', 'public')


// Login and registration pages remain public.
router.get('/login', (req, res) => {
    res.sendFile(path.join(publicDirectory, 'login', 'index.html'))
})
router.get('/register', (req, res) => {
    res.sendFile(path.join(publicDirectory, 'register', 'index.html'))
})
router.get('/lost',authMiddleware, (req, res) => {
    res.sendFile(path.join(publicDirectory, 'form', 'lost', 'index.html'))
})
router.get('/found',authMiddleware, (req, res) => {
    res.sendFile(path.join(publicDirectory, 'form', 'found', 'index.html'))
})

export default router