import jwt from 'jsonwebtoken'
import db from '../db.js'

function adminMiddleware(req, res, next) {
    const id = req.userId
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(id)

    if (!user) {
        return res.status(401).json({message: "User not found."})
    }

    if (user.role !== "admin") {
        return res.status(403).json({
            message: "Sorry, you don't have access."
        })
    }
    next()
}

export default adminMiddleware