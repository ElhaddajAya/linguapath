// Gère la sauvegarde et la récupération des conversations

const Conversation = require('../models/Conversation')
const Scenario = require('../models/Scenario')

// ── POST /api/conversations ──
// Sauvegarde une conversation à la fin d'une session
const sauvegarderConversation = async (req, res) =>
{
    const { scenarioId, messages, duree } = req.body

    if (!scenarioId || !messages?.length)
    {
        return res.status(400).json({ message: 'scenarioId et messages sont requis' })
    }

    try
    {
        // Récupérer les infos du scénario pour le snapshot
        const scenario = await Scenario.findById(scenarioId)
        if (!scenario)
        {
            return res.status(404).json({ message: 'Scénario introuvable' })
        }

        // Niveau de l'utilisateur pour cette langue
        const langueUser = req.user.langues?.find(l => l.langue === scenario.langue)
        const niveauUser = langueUser?.niveau || 'A1'

        // Créer et sauvegarder la conversation
        const conversation = new Conversation({
            userId: req.user._id,
            scenarioId,
            scenarioTitre: scenario.titre,
            scenarioEmoji: scenario.emoji,
            langue: scenario.langue,
            niveau: niveauUser,
            messages,
            duree: duree || 0,
            finAt: new Date(),
        })

        await conversation.save()

        res.status(201).json({
            message: 'Conversation sauvegardée ✅',
            conversationId: conversation._id,
        })

    } catch (err)
    {
        console.error('Erreur sauvegarde conversation :', err.message)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// ── GET /api/conversations ──
// Récupère toutes les conversations de l'utilisateur connecté
// Triées par date décroissante (les plus récentes en premier)
const getConversations = async (req, res) =>
{
    try
    {
        const conversations = await Conversation.find({ userId: req.user._id })
            .sort({ createdAt: -1 })   // Plus récentes en premier
            .select('-messages')        // On n'envoie pas les messages dans la liste
        // pour alléger la réponse

        res.json({ conversations })

    } catch (err)
    {
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// ── GET /api/conversations/:id ──
// Récupère une conversation complète avec tous ses messages
const getConversationById = async (req, res) =>
{
    try
    {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            userId: req.user._id, // Sécurité : on vérifie que c'est bien l'utilisateur
        })

        if (!conversation)
        {
            return res.status(404).json({ message: 'Conversation introuvable' })
        }

        res.json({ conversation })

    } catch (err)
    {
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

module.exports = { sauvegarderConversation, getConversations, getConversationById }