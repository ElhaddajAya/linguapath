const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  let token

  // 1. Vérifier si le token est dans les headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]
    // "Bearer eyJhbG..." → on prend juste "eyJhbG..."
  }

  // 2. Si pas de token → accès refusé
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' })
  }

  try {
    // 3. Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // decoded = { id: "userId", iat: ..., exp: ... }

    // 4. Récupérer l'utilisateur depuis la BDD
    req.user = await User.findById(decoded.id).select('-password')
    // On attache le user à req pour que les routes suivantes y aient accès
    // 5. Passer à la route suivante
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' })
  }
}

// Middleware pour vérifier si l'utilisateur est admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Accès réservé aux administrateurs.' })
  }
}

module.exports = { protect, adminOnly }