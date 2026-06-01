// point d'entrée du serveur Express
// Rôle unique : démarrer le serveur et se connecter à la BDD.
// L'app Express elle-même est définie dans app.js — séparation nécessaire
// pour que les tests puissent importer l'app sans lancer le serveur.

require('dotenv').config()

const app = require('./app') // l'app Express (routes, middlewares)
const connectDB = require('./config/db') // connexion MongoDB Atlas
const userRoutes = require('./routes/userRoutes')
app.use('/api/users', userRoutes)

// Connexion à la base
connectDB()

// Démarrage du serveur sur toutes les interfaces réseau (0.0.0.0)
// pour être accessible en local ET sur le réseau local (mobile, autre machine)
const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () =>
{
  console.log(`Server running on port ${PORT} ✅`)
})