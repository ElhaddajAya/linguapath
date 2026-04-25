const express = require('express')
const router = express.Router()
const {
    sauvegarderConversation,
    getConversations,
    getConversationById,
    mettreAJourConversation,
} = require('../controllers/conversationController')
const { protect } = require('../middleware/authMiddleware')

// POST /api/conversations — sauvegarder une conversation
router.post('/', protect, sauvegarderConversation)

// GET /api/conversations — récupérer toutes les conversations de l'user
router.get('/', protect, getConversations)

// GET /api/conversations/:id — récupérer une conversation complète
router.get('/:id', protect, getConversationById)

// PUT /api/conversations/:id — mettre à jour une conversation existante
router.put('/:id', protect, mettreAJourConversation)

module.exports = router