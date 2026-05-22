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

const adminRoutes = require('./routes/adminRoutes')


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true)
    // Allow localhost and any local network IP on any port
    const localPattern = /^http:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|22\.10\.\d+\.\d+)(:\d+)?$/
    if (localPattern.test(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
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
app.use('/api/mindmap', mindmapRoutes)                
app.use('/api/admin', adminRoutes)

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
app.listen(PORT, '0.0.0.0', () =>
{
  console.log(`Server running on port ${PORT} ✅`)
})
