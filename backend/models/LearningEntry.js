// Un LearningEntry = une phrase ou expression apprise lors d'une session
// Chaque entrée est liée à un utilisateur, une langue et un scénario

const mongoose = require('mongoose')

const LearningEntrySchema = new mongoose.Schema({

    // L'utilisateur qui a appris cette phrase
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // La phrase dans la langue cible (ex: "¿Cuánto cuesta?")
    phrase: {
        type: String,
        required: true,
        trim: true,
    },

    // Traduction française de la phrase
    traduction: {
        type: String,
        required: true,
        trim: true,
    },

    // La langue de la phrase
    langue: {
        type: String,
        required: true,
    },

    // Niveau CECRL de l'utilisateur au moment de l'apprentissage
    niveau: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        default: 'A1',
    },

    // Thème du scénario — utilisé pour organiser la MindMap
    theme: {
        type: String,
        required: true,
    },

    // Titre du scénario pour le contexte
    scenarioTitre: {
        type: String,
        required: true,
    },

    // Référence à la conversation source
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        default: null,
    },

    // Source : 'auto' = extrait automatiquement, 'manuel' = ajouté manuellement
    source: {
        type: String,
        enum: ['auto', 'manuel'],
        default: 'auto',
    },

}, { timestamps: true })

module.exports = mongoose.model('LearningEntry', LearningEntrySchema)