const User = require('../models/User')
const jwt  = require('jsonwebtoken')

// Fonction utilitaire pour générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// ── POST /api/auth/register ──
const register = async (req, res) => {
  const { nom, email, password, languesCibles, niveau } = req.body

  // Validation des champs requis
  if (!nom || !email || !password) {
    return res.status(400).json({ message: 'Nom, email et mot de passe sont requis' })
  }

  try {
    // 1. Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' })
    }

    // 2. Créer le nouvel utilisateur
    const user = new User({
      nom,
      email,
      password,
      languesCibles: languesCibles || [],
      niveau: niveau || 'A1',
    })

    await user.save() // le middleware bcrypt hache le mot de passe ici

    // 3. Générer le token JWT
    const token = generateToken(user._id)

    // 4. Retourner la réponse (sans le mot de passe !)
    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id:            user._id,
        nom:           user.nom,
        email:         user.email,
        niveau:        user.niveau,
        languesCibles: user.languesCibles,
        role:          user.role,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// ── POST /api/auth/login ──
const login = async (req, res) => {
  const { email, password } = req.body

  // Validation des champs requis
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis' })
  }

  try {
    // 1. Trouver l'utilisateur par email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    // 2. Vérifier le mot de passe
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    // 3. Générer le token JWT
    const token = generateToken(user._id)

    // 4. Retourner la réponse
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id:            user._id,
        nom:           user.nom,
        email:         user.email,
        niveau:        user.niveau,
        languesCibles: user.languesCibles,
        role:          user.role,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

module.exports = { register, login }