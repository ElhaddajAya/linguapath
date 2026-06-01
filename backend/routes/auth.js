// routes/auth.js — mis à jour avec toutes les routes d'authentification

const express  = require('express')
const router   = express.Router()
const passport = require('passport')
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  resendVerification,
  googleCallback,
} = require('../controllers/authController')

// ── Authentification classique ────────────────────────────────
router.post('/register',             register)
router.post('/login',                login)
router.get('/verify-email',          verifyEmail)
router.post('/resend-verification',  resendVerification)
router.post('/forgot-password',      forgotPassword)
router.post('/reset-password',       resetPassword)

// ── Google OAuth ──────────────────────────────────────────────
// Étape 1 : rediriger vers Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
)

// Étape 2 : callback après authentification Google
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
  }),
  googleCallback
)

module.exports = router