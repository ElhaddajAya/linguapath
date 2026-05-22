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

        // 2. Formater l'historique — on préfixe chaque ligne par le rôle
        const historiqueTexte = messages
            .map(m => `${m.role === 'user' ? 'LEARNER' : 'AI CHARACTER'}: ${m.contenu}`)
            .join('\n')

        // 3. Récupérer les patterns déjà existants en BDD pour cette langue
        // → le modèle les réutilisera au lieu d'en créer de nouveaux à chaque fois
        const patternsExistants = await LearningEntry.distinct('pattern', {
            userId: req.user._id,
            langue,
        })
        const patternsConnus = patternsExistants.filter(p => p && p !== 'Général')

        // 4. Prompt d'extraction
        const systemPrompt = `You are a language learning expert. Extract practical, reusable phrases from this conversation.

WHAT TO EXTRACT :
- Any phrase from the conversation (said by the learner OR the AI character) that is:
  • Genuinely useful and natural to reuse in similar situations
  • Not trivially basic (not: hello, goodbye, yes, no, thank you, please, OK, I understand)
  • Not too specific to this exact exchange (not: unique proper names, specific one-time numbers)
- Maximum 5 phrases total
- Each phrase: 3 to 12 words

═══════════════════════════════════════════════
PHRASE COMPLETENESS — the first mandatory check
═══════════════════════════════════════════════
Every extracted phrase MUST be a complete, standalone utterance
that a real person would say exactly as-is in a real conversation.

✅ COMPLETE — extract these :
  "I'm sorry to hear that."
  "I'm looking forward to meeting you."
  "I have had a headache since this morning."
  "Can I get a referral?"
  "What brings you in today?"

❌ INCOMPLETE — NEVER extract these :
  "I'm looking forward to"     ← missing object, nobody says this alone
  "I have been"                ← unfinished sentence
  "Can I get"                  ← unfinished sentence
  "I'm sorry to"               ← this is a pattern, not a phrase
  "Let me"                     ← unfinished

SIMPLE TEST before extracting : would a native speaker say this phrase
exactly as-is and be fully understood? If NO → skip it.

═══════════════════════════════════════════════
TRANSLATION RULE — mandatory
═══════════════════════════════════════════════
"traduction" MUST always be in FRENCH, regardless of the conversation language.
  ✅ "traduction": "Je suis désolé d'entendre ça"
  ❌ "traduction": "I'm sorry to hear that" ← FORBIDDEN

═══════════════════════════════════════════════
PATTERN ASSIGNMENT
═══════════════════════════════════════════════
${patternsConnus.length > 0 ? `EXISTING PATTERNS IN DATABASE — reuse them first :
${patternsConnus.map(p => `  "${p}"`).join('\n')}

For each extracted phrase :
1. Check if it fits one of the EXISTING patterns above
2. If YES → copy the EXACT pattern string (character for character)
3. If NO → create a NEW pattern following the rules below

Reusing existing patterns is the priority.
` : ''}

PATTERN vs PHRASE — never confuse them :
The pattern is DERIVED FROM the phrase, never the reverse.
  Phrase : "I'm sorry to hear that."       → Pattern : "I'm sorry to..."
  Phrase : "I'm looking forward to meeting you." → Pattern : "I'm looking forward to..."
  Phrase : "Can I get a referral?"         → Pattern : "Can I...?"
  Phrase : "I have had a headache."        → Pattern : "I have..."

If a phrase IS the pattern (incomplete, ends with "to", "a", "the", preposition...) → SKIP THE PHRASE ENTIRELY.

PATTERN RULES :
- Use "..." where the variable part goes
- Make it broad enough that 3+ different phrases could match it
- Keep it short : 2 to 4 words maximum including "..."

GOOD patterns :
  English  : "I have...", "I've been...", "Can I...?", "Could you...?",
             "I'd like...", "Sorry to...", "I think...", "I'm looking forward to..."
  Spanish  : "Tengo...", "¿Puede...?", "Me duele...", "Lo siento...", "Quisiera..."
  Korean   : "...고 싶어요", "...주세요", "...있나요?", "...것 같아요"
  Japanese : "...をください", "...はありますか?", "...たいです"
  Arabic   : "...أريد", "هل يمكنني...?", "...من فضلك"

PHRASES WITHOUT A PATTERN :
Some phrases are complete and useful but have no reusable grammatical frame.
For these, assign the pattern "Général".
Examples : "I see.", "That makes sense.", "No problem at all.", "Let me think."

BAD patterns — never create these :
  ❌ "I have been having"     → too specific, use "I have..." or "I've been..."
  ❌ "Sorry to hear that"     → too specific, use "Sorry to..."
  ❌ "Can I get a referral"   → too specific, use "Can I...?"

Return ONLY a valid JSON array, no markdown :
[{"phrase":"...","traduction":"[FRENCH]","pattern":"..."}]`

        const messageUser = `Conversation in ${langue} (level ${niveau}, scenario: "${scenario.titre}", theme: "${scenario.theme}"):

${historiqueTexte}

Extract up to 5 useful phrases following all the rules above.`

        const reponseRaw = await envoyerMessage(
            systemPrompt,
            [],
            messageUser,
            1,
            'llama-3.3-70b-versatile'
        )

        // 5. Parser le JSON retourné par Groq
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

        // 6. Dédupliquer — éviter les phrases déjà existantes en BDD
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