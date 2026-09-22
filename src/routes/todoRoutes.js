import express from 'express'
import db from '../db.js'

const router = express.Router()

// Get all todos from logged user
router.get('/', (req, res) => {
    const getTodos  = db.prepare('SELECT * FROM todos WHERE user_id = ?')
    const todos = getTodos.all(req.userId)
    res.json(todos)
})

// Create a new todos
router.post('/', (req, res) => {
    
})

// Update a todos 
router.put('/:id', (req, res) => {

})

// Delete a todos
router.delete('/:id', (req, res) => {

})

export default router