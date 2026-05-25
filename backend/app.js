// On sépare la création de l'app Express de son démarrage (index.js).
// Pourquoi ? Les tests ont besoin d'importer l'app SANS lancer le serveur
// et SANS se connecter à la vraie base de données MongoDB.
// Supertest se charge lui-même d'envoyer des requêtes à l'app.

const express = require('express')
const cors = require('cors')

// ── Controllers (importés directement — pas de Groq ici) ──
const { register, login } = require('./controllers/authController')
const { getScenarios, getScenarioById } = require('./controllers/scenarioController')
const { getLearningLog, ajouterPhraseManuelle, supprimerPhrase } = require('./controllers/learningLogController')
const { getQuestions, saveResult } = require('./controllers/quizController')
const { protect, adminOnly } = require('./middleware/authMiddleware')

const app = express()

// ── Middlewares globaux ──
app.use(cors())           // Autorise les requêtes cross-origin
app.use(express.json())   // Parse automatiquement le body JSON des requêtes

// ── Routes Auth ──
app.post('/api/auth/register', register)
app.post('/api/auth/login', login)

// ── Routes Scénarios (protégées) ──
app.get('/api/scenarios', protect, getScenarios)
app.get('/api/scenarios/:id', protect, getScenarioById)

// ── Routes Learning Log (protégées) ──
// Note : on n'expose PAS /extraire ici — elle appelle Groq et est testée séparément
app.get('/api/learning-log', protect, getLearningLog)
app.post('/api/learning-log', protect, ajouterPhraseManuelle)
app.delete('/api/learning-log/:id', protect, supprimerPhrase)

// ── Routes Quiz (protégées) ──
app.get('/api/quiz/:langue', protect, getQuestions)
app.post('/api/quiz/result', protect, saveResult)

// ── Route de santé — vérifie que le serveur tourne ──
app.get('/', (req, res) =>
{
  res.json({ message: 'LinguaPath Backend is running ✅' })
})

module.exports = app
