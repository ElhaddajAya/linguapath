// Import des modules necessaires
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialisation de l'appli Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Route test pour vérifier que le serveur tourne
app.get('/', (req, res) =>
{
    res.json({ message: 'LinguaPath Backend is running ✅' });
});

// Démarrage serveur sur port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
{
    console.log(`Server running on port ${PORT} ✅`);
});