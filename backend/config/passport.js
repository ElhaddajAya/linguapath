// config/passport.js
// Configuration de Passport.js pour l'authentification Google OAuth

const passport      = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User          = require('../models/User')

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Vérifier si l'utilisateur existe déjà avec ce Google ID
      let user = await User.findOne({ googleId: profile.id })

      if (user) {
        // Utilisateur existant — mise à jour si nécessaire
        if (!user.avatar && profile.photos?.[0]?.value) {
          user.avatar = profile.photos[0].value
          await user.save()
        }
        return done(null, user)
      }

      // Vérifier si l'email existe déjà (compte classique)
      const email = profile.emails?.[0]?.value
      if (email) {
        user = await User.findOne({ email })
        if (user) {
          // Lier le Google ID au compte existant
          user.googleId        = profile.id
          user.isEmailVerified = true
          if (!user.avatar) user.avatar = profile.photos?.[0]?.value || ''
          await user.save()
          return done(null, user)
        }
      }

      // Créer un nouveau compte avec Google
      const nom = profile.displayName ||
        `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() ||
        'Utilisateur'

      user = await User.create({
        googleId:        profile.id,
        nom,
        email:           email || `google_${profile.id}@linguapath.app`,
        isEmailVerified: true,
        avatar:          profile.photos?.[0]?.value || '',
        isActive:        true,
      })

      return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  }
))

passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

module.exports = passport