import express from 'express'
import { createUser, loginUser } from '../../controllers/loginregister.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.post('/register', createUser)
router.post('/login', loginUser)

export default router