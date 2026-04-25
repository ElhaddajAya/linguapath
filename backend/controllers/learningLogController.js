// Gère l'extraction automatique des phrases apprises
// et la récupération du Learning Log de l'utilisateur

const LearningEntry = require('../models/LearningEntry')
const Scenario = require('../models/Scenario')
const { envoyerMessage } = require('../services/groqService')

// ── POST /api/learning-log/extraire ──
// Analyse une conversation et extrait les phrases importantes
// Appelé automatiquement à la fin de chaque session (clic "Terminer")
const extrairePhrasesApprises = async (req, res) =>
{
    const { conversationId, scenarioId, messages, langue, niveau } = req.body

    if (!messages?.length || !scenarioId)
    {
        return res.status(400).json({ message: 'messages et scenarioId sont requis' })
    }

    try
    {
        // 1. Récupérer les infos du scénario
        const scenario = await Scenario.findById(scenarioId)
        if (!scenario)
        {
            return res.status(404).json({ message: 'Scénario introuvable' })
        }

        // 2. Formater l'historique pour Groq
        // On garde uniquement les messages de l'assistant (les phrases de la langue cible)
        // et les messages de l'utilisateur (pour le contexte des corrections)
        const historiqueTexte = messages
            .map(m => `${m.role === 'user' ? 'Utilisateur' : 'IA'}: ${m.contenu}`)
            .join('\n')

        // 3. Prompt d'extraction — on utilise le petit modèle (économie de tokens)
        const systemPrompt = `You are a language learning assistant specialized in extracting useful phrases from conversations.
Analyze the conversation and extract the most useful phrases, expressions, or vocabulary that the learner encountered.
Focus on phrases said by the AI (not the user) since those are the target language phrases to learn.
Include phrases that are:
- Common and reusable in real life situations
- Relevant to the scenario theme
- At an appropriate level for the learner

Return ONLY a valid JSON array. No explanation, no markdown.
Format: [{"phrase":"[phrase in target language]","traduction":"[natural French translation]"},...]
Extract between 3 and 8 phrases maximum. If the conversation is too short, extract fewer.`

        const messageUser = `Conversation in ${langue} (level ${niveau}, theme: ${scenario.theme}):\n\n${historiqueTexte}\n\nExtract the most useful phrases from this conversation.`

        // On utilise le modèle léger — la tâche est simple
        const reponseRaw = await envoyerMessage(
            systemPrompt,
            [],
            messageUser,
            1,
            'llama-3.1-8b-instant'
        )

        // 4. Parser le JSON retourné par Groq
        let phrasesExtraites = []
        try
        {
            const clean = reponseRaw.replace(/```json|```/g, '').trim()
            phrasesExtraites = JSON.parse(clean)
            // Vérification que c'est bien un tableau
            if (!Array.isArray(phrasesExtraites)) phrasesExtraites = []
        } catch
        {
            // Tentative avec regex si le JSON est mal formaté
            const match = reponseRaw.match(/\[[\s\S]*\]/)
            if (match)
            {
                try { phrasesExtraites = JSON.parse(match[0]) } catch { }
            }
        }

        // 5. Sauvegarder chaque phrase en BDD
        const entries = phrasesExtraites
            .filter(p => p.phrase && p.traduction) // garder seulement les valides
            .map(p => ({
                userId: req.user._id,
                phrase: p.phrase.trim(),
                traduction: p.traduction.trim(),
                langue,
                niveau: niveau || 'A1',
                theme: scenario.theme,
                scenarioTitre: scenario.titre,
                conversationId: conversationId || null,
                source: 'auto',
            }))

        if (entries.length > 0)
        {
            await LearningEntry.insertMany(entries)
        }

        res.status(201).json({
            message: `${entries.length} phrases extraites et sauvegardées ✅`,
            phrases: entries,
        })

    } catch (err)
    {
        console.error('Erreur extraction phrases :', err.message)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// ── GET /api/learning-log ──
// Récupère toutes les phrases apprises de l'utilisateur
// Avec filtres optionnels : langue, theme, niveau
const getLearningLog = async (req, res) =>
{
    try
    {
        const { langue, theme, niveau } = req.query

        // Construire le filtre dynamiquement selon les paramètres reçus
        const filtre = { userId: req.user._id }
        if (langue) filtre.langue = langue
        if (theme) filtre.theme = theme
        if (niveau) filtre.niveau = niveau

        const entries = await LearningEntry.find(filtre)
            .sort({ createdAt: -1 }) // Plus récentes en premier

        res.json({ entries })

    } catch (err)
    {
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// ── POST /api/learning-log ──
// Ajoute manuellement une phrase au Learning Log
const ajouterPhraseManuelle = async (req, res) =>
{
    const { phrase, traduction, langue, theme } = req.body

    if (!phrase || !traduction || !langue)
    {
        return res.status(400).json({ message: 'phrase, traduction et langue sont requis' })
    }

    try
    {
        // Récupérer le niveau de l'user pour cette langue
        const niveauUser = req.user.langues?.find(l => l.langue === langue)?.niveau || 'A1'

        const entry = new LearningEntry({
            userId: req.user._id,
            phrase: phrase.trim(),
            traduction: traduction.trim(),
            langue,
            niveau: niveauUser,
            theme: theme || 'Général',
            scenarioTitre: 'Ajout manuel',
            source: 'manuel',
        })

        await entry.save()
        res.status(201).json({ message: 'Phrase ajoutée ✅', entry })

    } catch (err)
    {
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// ── DELETE /api/learning-log/:id ──
// Supprime une entrée du Learning Log
const supprimerPhrase = async (req, res) =>
{
    try
    {
        const entry = await LearningEntry.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id, // Sécurité — seul le propriétaire peut supprimer
        })

        if (!entry)
        {
            return res.status(404).json({ message: 'Entrée introuvable' })
        }

        res.json({ message: 'Phrase supprimée ✅' })

    } catch (err)
    {
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

module.exports = {
    extrairePhrasesApprises,
    getLearningLog,
    ajouterPhraseManuelle,
    supprimerPhrase,
}