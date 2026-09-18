import express from 'express'
import path, {dirname} from 'path'
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js'
import todoRoutes from '../src/routes/todoRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import authMiddleware from './middleware/authMiddleware.js';
import adminMiddleware from './middleware/adminMiddleware.js'

const app = express()
const PORT = process.env.PORT ||  5959;

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url)
// Get the directory name from the file path
const __dirname = dirname(__filename)


// Middleware
app.use(express.json())
// Code below means serve files from this folder directly to the browser
app.use(express.static(path.join(__dirname, '../public')))

// Routes

app.get('/', (req, res) => {
    res.send('<h1>Mainpage</h1>')
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

app.use('/admin', authMiddleware, adminMiddleware, adminRoutes)
app.use('/auth', authRoutes)
app.use('/todos', authMiddleware, todoRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`)
})