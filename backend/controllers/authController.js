// controllers/authController.js
// Register + Login + Vérification email + Reset password + Google OAuth callback

const crypto = require('crypto')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { sendVerificationEmail, sendResetPasswordEmail } = require('../services/emailService')

// ── Helper : générer token JWT ────────────────────────────────
const generateToken = (userId) =>
{
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// ── Helper : formater user pour la réponse ────────────────────
const formatUser = (user) => ({
  id: user._id,
  nom: user.nom,
  email: user.email,
  langues: user.langues,
  role: user.role,
  avatar: user.avatar || '',
  isEmailVerified: user.isEmailVerified,
})

// ── POST /api/auth/register ───────────────────────────────────
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

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const user = new User({
      nom,
      email,
      password,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    })
    await user.save()

    // Tenter d'envoyer l'email — si ça échoue (SMTP bloqué), on vérifie auto
    try
    {
      await sendVerificationEmail(email, nom, verificationToken)
      res.status(201).json({
        message: 'Compte créé ! Vérifiez votre email pour activer votre compte.',
        emailSent: true,
      })
    } catch (emailErr)
    {
      console.error('Email non envoyé:', emailErr.message)
      // Email impossible → on vérifie le compte automatiquement
      user.isEmailVerified = true
      user.emailVerificationToken = null
      user.emailVerificationExpires = null
      await user.save()
      res.status(201).json({
        message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
        emailSent: false,
      })
    }

  } catch (err)
  {
    console.error('ERREUR REGISTER:', err)
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// ── GET /api/auth/verify-email?token=xxx ─────────────────────
const verifyEmail = async (req, res) =>
{
  const { token } = req.query

  if (!token)
  {
    return res.status(400).json({ message: 'Token manquant.' })
  }

  try
  {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    })

    if (!user)
    {
      return res.status(400).json({
        message: 'Lien de vérification invalide ou expiré.',
      })
    }

    user.isEmailVerified = true
    user.emailVerificationToken = null
    user.emailVerificationExpires = null
    await user.save()

    const jwtToken = generateToken(user._id)

    res.json({
      message: 'Email vérifié avec succès ! Vous êtes maintenant connecté.',
      token: jwtToken,
      user: formatUser(user),
    })
  } catch (err)
  {
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// ── POST /api/auth/login ──────────────────────────────────────
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

    // Compte Google sans mot de passe
    if (user.googleId && !user.password)
    {
      return res.status(400).json({
        message: 'Ce compte utilise la connexion Google. Connectez-vous avec Google.',
      })
    }

    if (user.isActive === false)
    {
      return res.status(403).json({
        message: 'Votre compte a été désactivé. Contactez un administrateur.',
      })
    }

    if (!user.isEmailVerified)
    {
      return res.status(403).json({
        message: 'Veuillez vérifier votre email avant de vous connecter.',
        emailNotVerified: true,
      })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch)
    {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    const token = generateToken(user._id)
    res.json({ message: 'Connexion réussie', token, user: formatUser(user) })
  } catch (err)
  {
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// ── POST /api/auth/forgot-password ───────────────────────────
const forgotPassword = async (req, res) =>
{
  const { email } = req.body

  if (!email)
  {
    return res.status(400).json({ message: 'Email requis.' })
  }

  try
  {
    const user = await User.findOne({ email })

    if (!user)
    {
      return res.json({
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000)

    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetExpires
    await user.save()

    // Tenter d'envoyer l'email reset — si ça échoue, on répond quand même
    try
    {
      await sendResetPasswordEmail(email, user.nom, resetToken)
    } catch (emailErr)
    {
      console.error('Email reset non envoyé:', emailErr.message)
    }

    res.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
    })
  } catch (err)
  {
    console.error('ERREUR FORGOT PASSWORD:', err)
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// ── POST /api/auth/reset-password ────────────────────────────
const resetPassword = async (req, res) =>
{
  const { token, newPassword } = req.body

  if (!token || !newPassword)
  {
    return res.status(400).json({ message: 'Token et nouveau mot de passe requis.' })
  }

  if (newPassword.length < 6)
  {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' })
  }

  try
  {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user)
    {
      return res.status(400).json({
        message: 'Lien de réinitialisation invalide ou expiré.',
      })
    }

    user.password = newPassword
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    res.json({ message: 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.' })
  } catch (err)
  {
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// ── POST /api/auth/resend-verification ───────────────────────
const resendVerification = async (req, res) =>
{
  const { email } = req.body

  try
  {
    const user = await User.findOne({ email })

    if (!user || user.isEmailVerified)
    {
      return res.json({ message: "Si cet email existe et n'est pas vérifié, un email a été renvoyé." })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    user.emailVerificationToken = verificationToken
    user.emailVerificationExpires = verificationExpires
    await user.save()

    // Tenter d'envoyer — si ça échoue, on vérifie auto
    try
    {
      await sendVerificationEmail(email, user.nom, verificationToken)
      res.json({ message: 'Email de vérification renvoyé.' })
    } catch (emailErr)
    {
      console.error('Email resend non envoyé:', emailErr.message)
      user.isEmailVerified = true
      user.emailVerificationToken = null
      user.emailVerificationExpires = null
      await user.save()
      res.json({ message: 'Compte vérifié avec succès. Vous pouvez vous connecter.' })
    }

  } catch (err)
  {
    res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// ── GET /api/auth/google/callback ────────────────────────────
const googleCallback = (req, res) =>
{
  const token = generateToken(req.user._id)
  const user = formatUser(req.user)

  const userEncoded = encodeURIComponent(JSON.stringify(user))
  res.redirect(
    `${process.env.FRONTEND_URL}/auth/google/success?token=${token}&user=${userEncoded}`
  )
}

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  resendVerification,
  googleCallback,
}