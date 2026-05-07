// routes/mindmap.js
// Route pour la MindMap — récupère les données transformées en arbre
//
// Paramètres de navigation interactive :
//   GET /api/mindmap                                        → vue root (toutes les langues)
//   GET /api/mindmap?vue=langue&langue=Espagnol             → thèmes de l'Espagnol
//   GET /api/mindmap?vue=theme&langue=Espagnol&theme=Restaurant → patterns du thème Restaurant
//   GET /api/mindmap?vue=soustheme&langue=Espagnol&theme=Restaurant&pattern=Politesse → phrases
//
// Filtre optionnel supplémentaire :
//   &niveau=A1   → filtre par niveau CECRL

const express = require('express')
const router  = express.Router()
const { getMindMapData } = require('../controllers/mindmapController')
const { protect }        = require('../middleware/authMiddleware')

// GET /api/mindmap
router.get('/', protect, getMindMapData)

module.exports = router