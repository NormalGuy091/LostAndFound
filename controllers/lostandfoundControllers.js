import db from '../services/mysql.js'

const reportFields = ['type', 'title', 'description', 'category', 'location', 'date']
const reportTypes = ['lost', 'found']

function normalizeReport(row, userId) {
    return {
        ...row,
        can_edit: Number(row.user_id) === Number(userId),
        image_url: row.image_path
            ? `/uploads/${String(row.image_path).split(/[\\/]/).pop()}`
            : null
    }
}

function isValidId(id) {
    return /^\d+$/.test(String(id))
}

export async function createReport(req, res) {
    const { type, title, location, date, category, description } = req.body
    if (!reportTypes.includes(type) || !title?.trim() || !location?.trim() || !date || !category?.trim()) {
        return res.status(400).json({ message: 'Type, title, category, location, and date are required.' })
    }

    const reportDate = date.slice(0, 10)
    const imagePath = req.file?.filename ?? null

    const [result] = await db.query(
        `INSERT INTO items (user_id, type, title, description, category, location, date, image_path)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.userId, type, title.trim(), description?.trim() || null, category.trim(), location.trim(), reportDate, imagePath]
    )

    res.status(201).json({ id: result.insertId })
}

export async function getAllReports(req, res) {
    const { type, category, search } = req.query
    const conditions = []
    const values = []

    if (type) {
        if (!reportTypes.includes(type)) {
            return res.status(400).json({ message: 'Type must be either lost or found.' })
        }
        conditions.push('type = ?')
        values.push(type)
    }
    if (category) {
        conditions.push('category = ?')
        values.push(category)
    }
    if (search?.trim()) {
        conditions.push('(title LIKE ? OR description LIKE ? OR location LIKE ?)')
        const searchTerm = `%${search.trim()}%`
        values.push(searchTerm, searchTerm, searchTerm)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const [rows] = await db.query(
        `SELECT id, user_id, type, title, description, category, location, date, image_path
         FROM items ${where} ORDER BY date DESC, id DESC`,
        values
    )
    return res.json(rows.map(row => normalizeReport(row, req.userId)))
}

export async function getReport(req, res) {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid report id.' })
    }

    const [rows] = await db.query(
        `SELECT id, user_id, type, title, description, category, location, date, image_path
         FROM items WHERE id = ?`,
        [req.params.id]
    )
    if (rows.length === 0) {
        return res.status(404).json({ message: 'Report not found.' })
    }
    return res.json(normalizeReport(rows[0], req.userId))
}

export async function editReport(req, res) {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid report id.' })
    }

    const updates = []
    const values = []
    for (const field of reportFields) {
        if (req.body[field] !== undefined) {
            if (field === 'type' && !reportTypes.includes(req.body[field])) {
                return res.status(400).json({ message: 'Type must be either lost or found.' })
            }
            if (['title', 'category', 'location'].includes(field) && !String(req.body[field]).trim()) {
                return res.status(400).json({ message: `${field} cannot be empty.` })
            }
            if (field === 'date' && !String(req.body[field]).trim()) {
                return res.status(400).json({ message: 'date cannot be empty.' })
            }
            updates.push(`${field} = ?`)
            values.push(field === 'description' && req.body[field] === null
                ? null
                : field === 'date'
                    ? String(req.body[field]).slice(0, 10)
                    : String(req.body[field]).trim())
        }
    }
    if (updates.length === 0) {
        return res.status(400).json({ message: 'No editable report fields were provided.' })
    }

    values.push(req.params.id, req.userId)
    const [result] = await db.query(
        `UPDATE items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        values
    )
    if (result.affectedRows === 0) {
        const [rows] = await db.query('SELECT id FROM items WHERE id = ?', [req.params.id])
        return res.status(rows.length ? 403 : 404).json({
            message: rows.length ? 'You can only edit your own reports.' : 'Report not found.'
        })
    }
    return res.json({ message: 'Report updated successfully.' })
}

export async function deleteReport(req, res) {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid report id.' })
    }

    const [result] = await db.query(
        'DELETE FROM items WHERE id = ? AND user_id = ?',
        [req.params.id, req.userId]
    )
    if (result.affectedRows === 0) {
        const [rows] = await db.query('SELECT id FROM items WHERE id = ?', [req.params.id])
        return res.status(rows.length ? 403 : 404).json({
            message: rows.length ? 'You can only delete your own reports.' : 'Report not found.'
        })
    }
    return res.status(204).send()
}