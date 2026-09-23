import express from 'express'
import 'dotenv/config' 
import authRoutes from './routes/authRoutes.js'
import pageRoutes from './routes/pageRoutes.js'
import lostandfoundRoutes from './routes/lostandfoundRoutes.js'
import path from 'node:path'
import { fileURLToPath } from 'url'
import authMiddleware from './middleware/authMiddleware.js'

const app = express()
const PORT = process.env.PORT || 2345


const __filename = fileURLToPath(import.meta.url)
const __dirname =  path.dirname(__filename)
const publicDirectory = path.join(__dirname, '..', 'public')
const uploadsDirectory = path.join(__dirname, '..', 'uploads')

app.use(express.json())
app.use('/auth', authRoutes)
app.use('/items', authMiddleware, lostandfoundRoutes)
app.use('/uploads', express.static(uploadsDirectory))
app.use('/login', express.static(path.join(publicDirectory, 'login')))
app.use('/register', express.static(path.join(publicDirectory, 'register')))
app.use(pageRoutes)
app.use(authMiddleware, express.static(publicDirectory))

app.get('/' , authMiddleware, (req, res) => {
    res.sendFile(path.join(publicDirectory, 'dashboard', 'index.html'))
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)

})