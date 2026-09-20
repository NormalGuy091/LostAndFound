import express from 'express'
import { createUser } from '../../controllers/loginregister.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.post('/register', createUser)

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'login', 'index.html'))
})
export default router