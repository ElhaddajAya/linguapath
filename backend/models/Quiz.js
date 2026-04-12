// Modèle pour les questions du test d'évaluation.
// Chaque question appartient à une langue et un niveau CECRL.
// On stocke toutes les questions en BDD et on les filtre par langue au moment du test.

const mongoose = require('mongoose')

const QuizSchema = new mongoose.Schema({

    // La langue concernée par cette question
    // Ex: "Anglais", "Espagnol", "Coréen"
    langue: {
        type: String,
        required: true,
        trim: true,
    },

    // Niveau CECRL de la question — détermine la difficulté
    niveau: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        required: true,
    },

    // La question posée à l'utilisateur
    question: {
        type: String,
        required: true,
    },

    // Les 4 choix de réponse
    options: {
        type: [String],
        validate: [arr => arr.length === 4, 'Il faut exactement 4 options'],
        required: true,
    },

    // Index de la bonne réponse dans le tableau options (0, 1, 2 ou 3)
    reponseCorrecte: {
        type: Number,
        min: 0,
        max: 3,
        required: true,
    },

}, { timestamps: true })

module.exports = mongoose.model('Quiz', QuizSchema)