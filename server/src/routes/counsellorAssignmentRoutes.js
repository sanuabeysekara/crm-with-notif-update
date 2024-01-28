const express = require('express')
const counsellorAssignmentController = require('../controllers/counsellorAssignmentController')

const router = express.Router()

router.post('/counsellorAssignment', counsellorAssignmentController.assignLeadToCounsellor)

module.exports = router