// Une conversation = un scénario joué par un utilisateur du début à la fin.
// On sauvegarde : qui, quel scénario, quand, et tous les messages échangés.

const mongoose = require('mongoose')

const ConversationSchema = new mongoose.Schema({

    // L'utilisateur qui a joué cette conversation
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Le scénario joué — on garde l'ID + un snapshot du titre/langue
    // au cas où le scénario serait modifié ou supprimé plus tard
    scenarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scenario',
        required: true,
    },
    scenarioTitre: { type: String, required: true },
    scenarioEmoji: { type: String, default: '💬' },
    langue: { type: String, required: true },
    niveau: { type: String, default: 'A1' },

    // Tous les messages de la conversation
    // role: 'user' ou 'assistant'
    messages: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        contenu: { type: String, required: true },
        date: { type: Date, default: Date.now },
    }],

    // Durée de la conversation en secondes
    duree: { type: Number, default: 0 },

    // Date de début et fin
    debutAt: { type: Date, default: Date.now },
    finAt: { type: Date },

}, { timestamps: true })

module.exports = mongoose.model('Conversation', ConversationSchema)