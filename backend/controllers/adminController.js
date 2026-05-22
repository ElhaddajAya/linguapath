const User     = require('../models/User')
const Scenario = require('../models/Scenario')

// ─────────────────────────────────────────────────────────────
//  GESTION DES UTILISATEURS
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * Retourne tous les utilisateurs (sans leur mot de passe)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })

    res.json({ users })
  } catch (err) {
    console.error('getAllUsers :', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

/**
 * PATCH /api/admin/users/:id/toggle
 * Active ou désactive un compte utilisateur.
 * Ajoute isActive: false au user si pas encore défini (valeur par défaut true).
 */
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' })
    }

    // Empêcher l'admin de se désactiver lui-même
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas désactiver votre propre compte.' })
    }

    // Toggle : si isActive n'existe pas encore → considéré comme true → on passe à false
    user.isActive = user.isActive === false ? true : false
    await user.save()

    res.json({
      message: `Compte ${user.isActive ? 'activé' : 'désactivé'} avec succès.`,
      user,
    })
  } catch (err) {
    console.error('toggleUserStatus :', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// ─────────────────────────────────────────────────────────────
//  GESTION DES SCÉNARIOS
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/scenarios
 * Retourne tous les scénarios sans filtre de niveau
 */
const getAllScenariosAdmin = async (req, res) => {
  try {
    const scenarios = await Scenario.find({}).sort({ createdAt: -1 })
    res.json({ scenarios })
  } catch (err) {
    console.error('getAllScenariosAdmin :', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

/**
 * POST /api/admin/scenarios
 * Crée un nouveau scénario
 * Body: { title, theme, description, langue, minLevel, maxLevel, emoji, systemPrompt }
 * Note: le frontend envoie title/minLevel/maxLevel — on mappe vers les noms du modèle (titre/niveauMin/niveauMax)
 */
const createScenario = async (req, res) => {
  try {
    const { title, theme, description, langue, minLevel, maxLevel, emoji, systemPrompt } = req.body

    if (!title || !theme || !description || !langue || !minLevel || !maxLevel || !systemPrompt) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' })
    }

    const scenario = await Scenario.create({
      titre: title,
      theme,
      description,
      langue,
      niveauMin: minLevel,
      niveauMax: maxLevel,
      systemPrompt,
      emoji: emoji || '💬',
    })

    res.status(201).json({ message: 'Scénario créé avec succès.', scenario })
  } catch (err) {
    console.error('createScenario :', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

/**
 * PUT /api/admin/scenarios/:id
 * Modifie un scénario existant
 * Même mapping titre/niveauMin/niveauMax que pour la création
 */
const updateScenario = async (req, res) => {
  try {
    const { title, theme, description, langue, minLevel, maxLevel, emoji, systemPrompt } = req.body

    const update = { theme, description, langue, emoji }
    if (title) update.titre = title
    if (minLevel) update.niveauMin = minLevel
    if (maxLevel) update.niveauMax = maxLevel
    if (systemPrompt !== undefined) update.systemPrompt = systemPrompt

    const scenario = await Scenario.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    )

    if (!scenario) {
      return res.status(404).json({ message: 'Scénario introuvable.' })
    }

    res.json({ message: 'Scénario modifié avec succès.', scenario })
  } catch (err) {
    console.error('updateScenario :', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

/**
 * DELETE /api/admin/scenarios/:id
 * Supprime un scénario
 */
const deleteScenario = async (req, res) => {
  try {
    const scenario = await Scenario.findByIdAndDelete(req.params.id)

    if (!scenario) {
      return res.status(404).json({ message: 'Scénario introuvable.' })
    }

    res.json({ message: 'Scénario supprimé avec succès.' })
  } catch (err) {
    console.error('deleteScenario :', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

module.exports = {
  getAllUsers,
  toggleUserStatus,
  getAllScenariosAdmin,
  createScenario,
  updateScenario,
  deleteScenario,
}