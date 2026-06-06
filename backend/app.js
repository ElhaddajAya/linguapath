// On sépare la création de l'app Express de son démarrage (index.js).
// Pourquoi ? Les tests ont besoin d'importer l'app SANS lancer le serveur
// et SANS se connecter à la vraie base de données MongoDB.

const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit') // Protection anti-spam

const { getScenarios, getScenarioById } = require('./controllers/scenarioController')
const { getQuestions, saveResult } = require('./controllers/quizController')
const { protect, adminOnly } = require('./middleware/authMiddleware')

const app = express()

// ── Fix Render proxy — obligatoire pour express-rate-limit ──
app.set('trust proxy', 1) // fait confiance au premier proxy (Render)

// ── Middlewares globaux ──────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Rate Limiting ────────────────────────────────────────────────
// Limite générale — toutes les routes /api
const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
  max: 200,                  // max 200 requêtes par IP
  message: { message: 'Trop de requêtes. Réessayez dans quelques minutes.' },
})

// Limite stricte — le chat appelle OpenAI (payant)
const limiterChat = rateLimit({
  windowMs: 10 * 60 * 1000, // fenêtre de 10 minutes
  max: 40,                   // max 40 messages par IP
  message: { message: 'Trop de messages. Patiente quelques minutes.' },
})

// Limite sur l'auth — évite le brute force sur login/register
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
  max: 10,                   // max 10 tentatives de connexion
  message: { message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
})

// On applique les limiteurs sur les routes concernées
app.use('/api', limiterGeneral)
app.use('/api/chat', limiterChat)
app.use('/api/auth', limiterAuth)

// ── Configuration de Passport.js ────────────────────────────────
const passport = require('./config/passport')
app.use(passport.initialize())

// ── Routes Auth ─────────────────────────────────────────────────
const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes)

// ── Routes Scénarios (protégées) ────────────────────────────────
app.get('/api/scenarios', protect, getScenarios)
app.get('/api/scenarios/:id', protect, getScenarioById)

// ── Routes Learning Log (protégées) ─────────────────────────────
const learningLogRoutes = require('./routes/learningLog')
app.use('/api/learning-log', learningLogRoutes)

// ── Routes Quiz (protégées) ─────────────────────────────────────
app.get('/api/quiz/:langue', protect, getQuestions)
app.post('/api/quiz/result', protect, saveResult)

// ── Routes Chat (protégées) ─────────────────────────────────────
const chatRoutes = require('./routes/chat')
app.use('/api/chat', chatRoutes)

// ── Routes Traduction (protégées) ────────────────────────────────
const traductionRoutes = require('./routes/traduction')
app.use('/api/traduction', traductionRoutes)

// ── Routes Conversations (protégées) ────────────────────────────
const conversationRoutes = require('./routes/conversations')
app.use('/api/conversations', conversationRoutes)

// ── Routes MindMap (protégées) ───────────────────────────────────
const mindmapRoutes = require('./routes/mindmap')
app.use('/api/mindmap', mindmapRoutes)

// ── Routes Admin ─────────────────────────────────────────────────
const adminRoutes = require('./routes/adminRoutes')
app.use('/api/admin', adminRoutes)

// ── Route de santé ───────────────────────────────────────────────
app.get('/', (req, res) =>
{
  res.json({ message: 'LinguaPath Backend is running ✅' })
})

module.exports = app