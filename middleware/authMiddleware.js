import express from 'express'
import db from '../services/mysql.js'
import jwt from 'jsonwebtoken'

async function authMiddleware(req, res, next){
    const token = req.headers['authorization']
    if (!token) {
        return res.status(403).json({message: "No token provided."})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
        req.userId = decoded.userId
        next()
    } catch (err) {
        return res.status(401).json({message: "Invalid Token."})
    }
}

export default authMiddleware