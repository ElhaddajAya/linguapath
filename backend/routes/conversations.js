const express = require('express')
const router = express.Router()
const {
    sauvegarderConversation,
    getConversations,
    getConversationById,
} = require('../controllers/conversationController')
const { protect } = require('../middleware/authMiddleware')

// POST /api/conversations — sauvegarder une conversation
router.post('/', protect, sauvegarderConversation)

// GET /api/conversations — récupérer toutes les conversations de l'user
router.get('/', protect, getConversations)

// GET /api/conversations/:id — récupérer une conversation complète
router.get('/:id', protect, getConversationById)

module.exports = router