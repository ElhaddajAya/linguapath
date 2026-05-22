const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/authMiddleware')
const {
  getAllUsers,
  toggleUserStatus,
  getAllScenariosAdmin,
  createScenario,
  updateScenario,
  deleteScenario,
} = require('../controllers/adminController')

// Toutes les routes admin nécessitent d'être connecté ET admin
router.use(protect, adminOnly)

// ── Gestion des utilisateurs ──────────────────────────────
// GET  /api/admin/users          → liste tous les utilisateurs
// PATCH /api/admin/users/:id/toggle → activer / désactiver un compte
router.get('/users', getAllUsers)
router.patch('/users/:id/toggle', toggleUserStatus)

// ── Gestion des scénarios ─────────────────────────────────
// GET    /api/admin/scenarios        → tous les scénarios (sans filtre)
// POST   /api/admin/scenarios        → créer un scénario
// PUT    /api/admin/scenarios/:id    → modifier un scénario
// DELETE /api/admin/scenarios/:id    → supprimer un scénario
router.get('/scenarios', getAllScenariosAdmin)
router.post('/scenarios', createScenario)
router.put('/scenarios/:id', updateScenario)
router.delete('/scenarios/:id', deleteScenario)

module.exports = router
