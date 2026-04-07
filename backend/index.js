const express    = require('express')
const cors       = require('cors')
require('dotenv').config()

const connectDB  = require('./config/db')
const authRoutes = require('./routes/auth')
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

app.get('/', (req, res) => {
  res.json({ message: 'LinguaPath Backend is running ✅' })
})

// Route protégée de test
app.get('/api/protected', protect, (req, res) => {
  res.json({
    message: 'Accès autorisé !',
    user: req.user,
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`)
})