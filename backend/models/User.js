// models/User.js — mis à jour avec vérification email + reset password + Google OAuth

const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const UserSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Email invalide'],
    },
    password: {
      type: String,
      minlength: [6, 'Minimum 6 caractères'],
      // Pas required car Google OAuth n'a pas de mot de passe
    },

    // Google OAuth
    googleId: {
      type: String,
      default: null,
    },

    langues: {
      type: [
        {
          langue: { type: String, required: true },
          niveau: {
            type: String,
            enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
            default: 'A1',
          },
        }
      ],
      default: [],
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    avatar: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Vérification email ──────────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    // ── Reset mot de passe ──────────────────────────────────
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// Hacher le mot de passe avant chaque sauvegarde
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Comparer les mots de passe lors du login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', UserSchema)