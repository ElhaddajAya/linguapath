const express = require('express')
const router = express.Router()
const { getQuestions, saveResult } = require('../controllers/quizController')
const { protect } = require('../middleware/authMiddleware')

// GET /api/quiz/:langue — récupère 10 questions pour une langue donnée
// Protégée — l'utilisateur doit être connecté
router.get('/:langue', protect, getQuestions)

// POST /api/quiz/result — sauvegarde le niveau calculé dans le profil
router.post('/result', protect, saveResult)

module.exports = router