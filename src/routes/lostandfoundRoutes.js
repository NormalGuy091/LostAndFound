import express from 'express'
import { createReport, getAllReports, getReport, editReport, deleteReport } from '../../controllers/lostandfoundControllers.js'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import reportLimitMiddleware from '../middleware/reportLimitMiddleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const upload = multer({dest: path.join(__dirname,'..', '..', 'uploads')})

const router = express.Router()

router.post('/', reportLimitMiddleware, upload.single('image'), createReport)
router.get('/', getAllReports)
router.get('/:id', getReport)
router.patch('/:id', editReport)
router.delete('/:id', deleteReport)

export default router