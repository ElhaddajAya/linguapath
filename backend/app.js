// On sépare la création de l'app Express de son démarrage (index.js).
// Pourquoi ? Les tests ont besoin d'importer l'app SANS lancer le serveur
// et SANS se connecter à la vraie base de données MongoDB.
// Supertest se charge lui-même d'envoyer des requêtes à l'app.

const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const { getScenarios, getScenarioById } = require('./controllers/scenarioController')
const { getQuestions, saveResult } = require('./controllers/quizController')
const { protect, adminOnly } = require('./middleware/authMiddleware')

const app = express()

// ── Middlewares globaux ──
app.use(cors())
app.use(express.json())

// ── Configuration de Passport.js pour l'authentification Google OAuth ──
const passport = require('./config/passport')
app.use(passport.initialize())

// ── Routes Auth ──
app.use('/api/auth', authRoutes)

// ── Routes Scénarios (protégées) ──
app.get('/api/scenarios', protect, getScenarios)
app.get('/api/scenarios/:id', protect, getScenarioById)

// ── Routes Learning Log (protégées) ──
const learningLogRoutes = require('./routes/learningLog')
app.use('/api/learning-log', learningLogRoutes)

// ── Routes Quiz (protégées) ──
app.get('/api/quiz/:langue', protect, getQuestions)
app.post('/api/quiz/result', protect, saveResult)

// ── Routes Chat (protégées) ──
const chatRoutes = require('./routes/chat')
app.use('/api/chat', chatRoutes)

// ── Routes Traduction (protégées) ──
const traductionRoutes = require('./routes/traduction')
app.use('/api/traduction', traductionRoutes)

// ── Routes Conversations (protégées) ──
const conversationRoutes = require('./routes/conversations')
app.use('/api/conversations', conversationRoutes)

// ── Routes MindMap (protégées) ──
const mindmapRoutes = require('./routes/mindmap')
app.use('/api/mindmap', mindmapRoutes)

// ── Routes Admin (protect + adminOnly dans le router) ──
const adminRoutes = require('./routes/adminRoutes')
app.use('/api/admin', adminRoutes)

// ── Route de santé ──
app.get('/', (req, res) =>
{
  res.json({ message: 'LinguaPath Backend is running ✅' })
})

module.exports = app
