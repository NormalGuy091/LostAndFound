import jwt from 'jsonwebtoken'

function getCookieToken(cookieHeader) {
    const token = cookieHeader
        ?.split(';')
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith('token='))

    if (!token) {
        return undefined
    }

    try {
        return decodeURIComponent(token.slice('token='.length))
    } catch {
        return undefined
    }
}

function authMiddleware(req, res, next) {
    const token = getCookieToken(req.headers.cookie) || req.headers.authorization

    if (!token) {
        return res.redirect('/login')
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
        req.userId = decoded.userId
        next()
    } catch {
        return res.redirect('/login')
    }
}

export default authMiddleware
