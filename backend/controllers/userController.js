const User = require('../models/User')

/**
 * GET /api/users/me
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

/**
 * PUT /api/users/me
 * Body: { nom, avatar, currentPassword?, newPassword? }
 */
const updateProfile = async (req, res) => {
  try {
    const { nom, avatar, currentPassword, newPassword } = req.body

    if (!nom || nom.trim() === '') {
      return res.status(400).json({ message: 'Le nom ne peut pas être vide.' })
    }

    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })

    // Changement de mot de passe
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Le mot de passe actuel est requis.' })
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' })
      }
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({ message: 'Mot de passe actuel incorrect.' })
      }
      user.password = newPassword // haché par pre-save hook
    }

    user.nom    = nom.trim()
    user.avatar = avatar || ''
    await user.save()

    const updatedUser = await User.findById(user._id).select('-password')
    res.json({ message: 'Profil mis à jour avec succès.', user: updatedUser })

  } catch (err) {
    console.error('updateProfile :', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

module.exports = { getProfile, updateProfile }