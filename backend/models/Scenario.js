// Un scénario = une situation de conversation que l'utilisateur va pratiquer
// Ex: "Commander au restaurant", "Se presenter", "Demander son chemin"
// Chaque scénario est lié à une langue et un niveau min/max.

const mongoose = require('mongoose')

const ScenarioSchema = new mongoose.Schema({

    // Titre affiché à l'utilisateur
    titre: {
        type: String,
        required: true,
        trim: true,
    },

    // Thème / catégorie — ex: "Voyage", "Travail", "Quotidien"
    theme: {
        type: String,
        required: true,
        trim: true,
    },

    // Description courte — ce que l'utilisateur va faire
    description: {
        type: String,
        required: true,
    },

    // La langue de ce scénario
    langue: {
        type: String,
        required: true,
    },

    // Niveau minimum requis pour accéder à ce scénario
    niveauMin: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        default: 'A1',
    },

    // Niveau maximum — pour ne pas proposer du A1 à un C2
    niveauMax: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        default: 'C2',
    },

    // System prompt envoyé à Gemini — définit le rôle que joue l'IA
    // Ex: "Tu es un serveur dans un restaurant parisien. Tu parles uniquement français..."
    systemPrompt: {
        type: String,
        required: true,
    },

    // Emoji représentant le scénario — pour l'UI
    emoji: {
        type: String,
        default: '💬',
    },

}, { timestamps: true })

module.exports = mongoose.model('Scenario', ScenarioSchema)