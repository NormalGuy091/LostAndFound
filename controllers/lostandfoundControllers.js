import db from '../services/mysql.js'

export async function createReport(req, res) {
    const { title, location, date, category, description } = req.body
    const reportDate = date ? date.slice(0, 10) : null
    const imagePath = req.file?.path ?? null

    const [result] = await db.query(
        `INSERT INTO items (user_id, type, title, description, category, location, date, image_path)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.userId, 'lost', title, description, category, location, reportDate, imagePath]
    )
    res.status(200)

    res.status(201).json({ id: result.insertId })
}

export function getAllReports() {

}

export function getReport() {

}

export function editReport() {

}

export function deleteReport() {
    
}