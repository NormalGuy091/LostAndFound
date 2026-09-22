import db from '../db.js'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const adminFolder = path.join(__dirname, '.././public/admin')


router.get('/', (req, res) => {
    const adminPage = path.join(adminFolder, 'index.html')
})

router.post('/cleardb', (req, res) => {
    const { table } = req.body;
    db.prepare(`DELETE FROM todos`).run()
    db.prepare(`DELETE FROM ${table}`).run()
    res.sendStatus(200)
})

router.post('/showtable', (req, res) => {
    const { table } = req.body
    console.log(table)
    const tableList = db.prepare(`SELECT * FROM ${table}`).all()
    res.json(tableList)
})

router.delete('/delete', (req, res) => {
    const { email } = req.body
    const { id: userId } = db.prepare(`SELECT id FROM users WHERE username = ?`).get(email)

    if (!userId) { res.status(404).json({message: "Account not found."}) }

    db.prepare(`DELETE FROM todos WHERE user_id = ?`).run(userId)
    db.prepare(`DELETE FROM users WHERE username = ?`).run(email)
    res.status(204).json({ message: "Successfully removed the account" })
})

router.post(`/test`, (req, res) => {
    const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
`).all()

    console.log(tables)
})


export default router