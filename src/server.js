import express from 'express'
import 'dotenv/config' 
import authRoutes from './routes/authRoutes.js'
import path from 'node:path'
import { fileURLToPath } from 'url'
import authMiddleware from '../middleware/authMiddleware.js'

const app = express()
const PORT = process.env.PORT || 2345
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


app.use(express.json())
app.use('/auth', authRoutes)

app.use(express.static(path.join(__dirname,'..' ,'public')))
console.log(path.join(__dirname, '..', 'public'))

app.get('/register', authRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})