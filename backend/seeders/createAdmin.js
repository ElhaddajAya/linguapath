// Script à lancer UNE SEULE FOIS pour créer le compte admin
// Commande : node backend/seeders/createAdmin.js
// (depuis la racine du projet, avec le fichier .env chargé)

require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const connectDB = require('../config/db')

const createAdmin = async () =>
{
  await connectDB()

  const email = 'admin@linguapath.com'

  // Vérifie que l'admin n'existe pas déjà avant d'insérer
  const existant = await User.findOne({ email })
  if (existant)
  {
    console.log('⚠️  Un admin existe déjà avec cet email.')
    process.exit(0)
  }

  // Le hook pre('save') du modèle User hash automatiquement le mot de passe
  const admin = new User({
    nom: 'Admin',
    email,
    password: 'admin123',
    role: 'admin',
  })

  await admin.save()
  console.log('✅ Admin créé avec succès :', email)
  process.exit(0)
}

createAdmin().catch(err =>
{
  console.error('Erreur :', err.message)
  process.exit(1)
})
