const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getProfile, updateProfile } = require('../controllers/userController')

// GET  /api/users/me       → récupérer le profil complet
// PUT  /api/users/me       → modifier nom et/ou avatar
router.get('/me', protect, getProfile)
router.put('/me', protect, updateProfile)

module.exports = router