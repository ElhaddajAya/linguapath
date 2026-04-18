const mongoose = require('mongoose')

const connectDB = async () =>
{
  try
  {
    // On ajoute des options de connexion pour Mongoose 9 + Atlas
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // timeout si Atlas ne répond pas en 5s
    })
    console.log('MongoDB Atlas connecté ✅')
  } catch (err)
  {
    console.error('Erreur MongoDB :', err.message)
    process.exit(1)
  }
}

module.exports = connectDB