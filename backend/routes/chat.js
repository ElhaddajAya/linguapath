const express = require('express')
const router = express.Router()
const { envoyerMessageChat } = require('../controllers/chatController')
const { protect } = require('../middleware/authMiddleware')

// POST /api/chat/message
router.post('/message', protect, envoyerMessageChat)

module.exports = router