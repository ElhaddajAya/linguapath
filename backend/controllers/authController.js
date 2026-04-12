const User = require('../models/User')
const jwt = require('jsonwebtoken')

const generateToken = (userId) =>
{
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// ── POST /api/auth/register ──
const register = async (req, res) =>
{
  const { nom, email, password } = req.body

  if (!nom || !email || !password)
  {
    return res.status(400).json({ message: 'Nom, email et mot de passe sont requis' })
  }

  try
  {
    const existingUser = await User.findOne({ email })
    if (existingUser)
    {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' })
    }

    const user = new User({ nom, email, password })
    await user.save()

    const token = generateToken(user._id)

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        langues: user.langues,  // tableau vide au départ
        role: user.role,
      },
    })
  } catch (err)
  {
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// ── POST /api/auth/login ──
const login = async (req, res) =>
{
  const { email, password } = req.body

  if (!email || !password)
  {
    return res.status(400).json({ message: 'Email et mot de passe sont requis' })
  }

  try
  {
    const user = await User.findOne({ email })
    if (!user)
    {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch)
    {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    const token = generateToken(user._id)

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        langues: user.langues,  // [ { langue, niveau } ]
        role: user.role,
      },
    })
  } catch (err)
  {
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

module.exports = { register, login }