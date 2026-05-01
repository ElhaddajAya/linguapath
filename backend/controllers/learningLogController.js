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
        const systemPrompt = `You are a language learning assistant. Extract SHORT, reusable phrases from this conversation.

RULES — all mandatory, no exceptions :
- Extract ONLY phrases said by the AI character, never the user
- MAXIMUM 4 phrases total
- Each phrase : 2 to 6 words ONLY — count the words, if more than 6 → SKIP IT
- The phrase must be reusable in many different situations, not just this specific conversation
- NEVER extract questions with medical details, diagnoses, or technical terms
- NEVER extract phrases longer than 6 words, even if they seem useful
- Identify the grammatical pattern : replace the variable part with "..."

GOOD examples (2-6 words, reusable) :
  "I'm sorry to hear that." → pattern: "I'm sorry to hear..."
  "I see." → pattern: "I see."
  "How are you feeling?" → pattern: "How are you...?"
  "That makes sense." → pattern: "That makes sense."

BAD examples — NEVER extract these :
  "On a scale of 1 to 10, how would you rate the soreness?" → 16 words, too long
  "Are you currently taking any medication or have any known allergies?" → 11 words, too long

If no phrase respects the 2-6 word rule → return []

Return ONLY a valid JSON array, no markdown :
[{"phrase":"...","traduction":"...","pattern":"..."}]`

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
            // On nettoie les caractères problématiques avant de parser
            const clean = reponseRaw
                .replace(/```json|```/g, '')
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // caractères de contrôle
                .trim()

            try
            {
                phrasesExtraites = JSON.parse(clean)
            } catch
            {
                // Tentative avec regex si le JSON est mal formé
                const match = clean.match(/\[[\s\S]*\]/)
                if (match)
                {
                    try { phrasesExtraites = JSON.parse(match[0]) } catch { }
                }
            }

            if (!Array.isArray(phrasesExtraites)) phrasesExtraites = []

        } catch (err)
        {
            console.warn('Parsing extraction échoué :', err.message)
            phrasesExtraites = []
        }

        // 5. Dédupliquer — éviter les phrases déjà existantes en BDD
        const entries = []

        for (const p of phrasesExtraites.filter(p => p.phrase && p.traduction))
        {
            // On vérifie si cette phrase existe déjà pour cet utilisateur + langue
            const existe = await LearningEntry.findOne({
                userId: req.user._id,
                langue,
                phrase: p.phrase.trim(),
            })

            // Si elle existe déjà → on la saute
            if (existe) continue

            entries.push({
                userId: req.user._id,
                phrase: p.phrase.trim(),
                traduction: p.traduction.trim(),
                langue,
                niveau: niveau || 'A1',
                theme: scenario.theme,
                scenarioTitre: scenario.titre,
                conversationId: conversationId || null,
                source: 'auto',
                pattern: p.pattern?.trim() || 'Général', // Si pas de pattern, on met "Général"
            })
        }

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