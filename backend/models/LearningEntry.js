// Un LearningEntry = une phrase ou expression apprise lors d'une session
// Chaque entrée est liée à un utilisateur, une langue et un scénario

const mongoose = require('mongoose')

const learningEntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phrase: { type: String, required: true },
    traduction: { type: String, required: true },
    langue: { type: String, required: true },
    niveau: { type: String, default: 'A1' },
    theme: { type: String, default: 'Général' },
    scenarioTitre: { type: String },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null },
    source: { type: String, enum: ['auto', 'manuel'], default: 'auto' },

    // Pattern grammatical — ex: "I'm sorry to hear...", "Could you...?"
    // Permet de regrouper les phrases par structure dans la MindMap
    pattern: { type: String, default: 'Général' },

}, { timestamps: true })

module.exports = mongoose.model('LearningEntry', learningEntrySchema)