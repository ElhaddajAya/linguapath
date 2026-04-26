// routes/mindmap.js
// Route pour la MindMap — récupère les données transformées en arbre

const express = require('express')
const router = express.Router()
const { getMindMapData } = require('../controllers/mindmapController')
const { protect } = require('../middleware/authMiddleware')

// GET /api/mindmap — données de la mindmap de l'utilisateur connecté
// Filtres optionnels via query params : ?langue=Espagnol&niveau=A1
router.get('/', protect, getMindMapData)

module.exports = router
