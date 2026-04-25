const express = require('express')
const router = express.Router()
const {
    extrairePhrasesApprises,
    getLearningLog,
    ajouterPhraseManuelle,
    supprimerPhrase,
} = require('../controllers/learningLogController')
const { protect } = require('../middleware/authMiddleware')

// POST /api/learning-log/extraire — extraction automatique fin de session
router.post('/extraire', protect, extrairePhrasesApprises)

// GET /api/learning-log — récupérer tout le learning log (avec filtres)
router.get('/', protect, getLearningLog)

// POST /api/learning-log — ajouter une phrase manuellement
router.post('/', protect, ajouterPhraseManuelle)

// DELETE /api/learning-log/:id — supprimer une phrase
router.delete('/:id', protect, supprimerPhrase)

module.exports = router