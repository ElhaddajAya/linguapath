// index.js — point d'entrée du serveur Express
// On configure le serveur, la connexion à la BDD, les routes et les middlewares.

const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const quizRoutes = require('./routes/quiz')
const scenarioRoutes = require('./routes/scenarios')
const chatRoutes = require('./routes/chat')
const traductionRoutes = require('./routes/traduction')
const conversationRoutes = require('./routes/conversations')
const learningLogRoutes = require('./routes/learningLog')
const mindmapRoutes = require('./routes/mindmap')         // ← LIN-38 ajouté

const { protect } = require('./middleware/authMiddleware')

const app = express()
connectDB()

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/scenarios', scenarioRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/traduction', traductionRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/learning-log', learningLogRoutes)
app.use('/api/mindmap', mindmapRoutes)                   // ← LIN-38 ajouté

app.get('/', (req, res) =>
{
  res.json({ message: 'LinguaPath Backend is running ✅' })
})

// Route protégée de test
app.get('/api/protected', protect, (req, res) =>
{
  res.json({
    message: 'Accès autorisé !',
    user: req.user,
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
{
  console.log(`Server running on port ${PORT} ✅`)
})
