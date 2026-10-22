import express from 'express'
import db from '../../services/mysql.js'

async function checkLimit(req, res, next) {
    const id = req.userId
    const [ result ] = await db.query(`SELECT report_limits FROM users WHERE id = ?`, id)
    if (result.length < 1) {
        return res.status('400').json({message: `You have exceeded the limit for reporting.`})
    }
    const [ change ] = await db.query(`UPDATE users SET report_limits = ? WHERE id = ?`, report_limits - 1, id)
    next()
}

export default checkLimit   