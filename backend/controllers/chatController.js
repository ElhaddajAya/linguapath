// Gère l'envoi et la réception des messages dans une conversation.
// À chaque message, on envoie TOUT l'historique à Groq
// pour qu'il garde le contexte de la conversation.

const Scenario = require('../models/Scenario')
const { envoyerMessage } = require('../services/groqService') // ← Groq au lieu de Gemini

// ── POST /api/chat/message ──
// Reçoit un message, l'envoie à Groq avec l'historique, retourne la réponse
const envoyerMessageChat = async (req, res) =>
{
    const { scenarioId, historique, message } = req.body

    if (!scenarioId || !message)
    {
        return res.status(400).json({ message: 'scenarioId et message sont requis' })
    }

    try
    {
        // 1. Récupérer le scénario pour avoir le system prompt
        const scenario = await Scenario.findById(scenarioId)
        if (!scenario)
        {
            return res.status(404).json({ message: 'Scénario introuvable' })
        }

        // 2. Construire le system prompt complet
        // On ajoute le niveau de l'utilisateur au prompt pour adapter la difficulté
        const user = req.user
        const langueUser = user.langues?.find(l => l.langue === scenario.langue)
        const niveauUser = langueUser?.niveau || 'A1'

        const systemPromptComplet = `${scenario.systemPrompt}

IMPORTANT — Niveau de l'utilisateur : ${niveauUser}.
Adapte la complexité de ton vocabulaire et tes phrases à ce niveau.
Ne jamais sortir du personnage. Répondre uniquement dans la langue du scénario.`

        // 3. Envoyer à Groq avec tout l'historique
        const reponseIA = await envoyerMessage(
            systemPromptComplet,
            historique || [],
            message
        )

        // 4. Retourner la réponse
        res.json({
            reponse: reponseIA,
            nouveauMessage: {
                role: 'assistant',
                contenu: reponseIA,
            }
        })

    } catch (err)
    {
        console.error('Erreur Groq :', err.message)
        res.status(500).json({ message: 'Erreur lors de la communication avec l\'IA' })
    }
}

module.exports = { envoyerMessageChat }