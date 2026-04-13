const express = require('express')
const router = express.Router()
const { getScenarios, getScenarioById } = require('../controllers/scenarioController')
const { protect } = require('../middleware/authMiddleware')

// GET /api/scenarios?langue=Anglais&niveau=B1
router.get('/', protect, getScenarios)

// GET /api/scenarios/:id
router.get('/:id', protect, getScenarioById)

module.exports = router