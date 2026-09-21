import express from 'express'
import { createReport, getAllReports, getReport, editReport, deleteReport } from '../../controllers/lostandfoundControllers.js'

const router = express.Router()

router.post('/', createReport)
router.get('/', getAllReports)
router.get('/:id', getReport)
router.patch('/:id', editReport)
router.delete('/:id', deleteReport)

export default router