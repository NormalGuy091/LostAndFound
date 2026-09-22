import express from 'express'
import 'dotenv/config' 
import authRoutes from './routes/authRoutes.js'
import pageRoutes from './routes/pageRoutes.js'
import lostandfoundRoutes from './routes/lostandfoundRoutes.js'
import path from 'node:path'
import { fileURLToPath } from 'url'
import authMiddleware from '../middleware/authMiddleware.js'

const app = express()
const PORT = process.env.PORT || 2345


const __filename = fileURLToPath(import.meta.url)
const __dirname =  path.dirname(__filename)
const publicDirectory = path.join(__dirname, '..', 'public')

app.use(express.json())
app.use('/auth', authRoutes)
app.use('/items', authMiddleware, lostandfoundRoutes)
app.use(pageRoutes)

app.use(express.static(publicDirectory))

// Page-related requests
app.use('/register', pageRoutes)
app.get('/' ,(req, res) => {
    res.sendFile(path.join(publicDirectory, 'dashboard', 'index.html'))
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)

})