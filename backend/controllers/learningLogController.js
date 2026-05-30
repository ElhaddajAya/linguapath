// Gère l'extraction automatique des phrases apprises
// et la récupération du Learning Log de l'utilisateur

const LearningEntry = require('../models/LearningEntry')
const Scenario = require('../models/Scenario')
const { envoyerMessage } = require('../services/openaiService')

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

═══════════════════════════════════════════════
EXTRACTION THRESHOLD — read this first
═══════════════════════════════════════════════
Returning [] is a VALID and EXPECTED output.
NEVER force an extraction just to fill the list.
A short, basic, or off-topic conversation → return [].
Only extract if a phrase genuinely passes ALL criteria below.

Quality over quantity : 1 truly useful phrase is better than 5 mediocre ones.

═══════════════════════════════════════════════
WHAT TO EXTRACT
═══════════════════════════════════════════════
Your goal : find phrases a learner can REUSE in a real-life situation similar to this scenario.
Source doesn't matter — extract from LEARNER or AI CHARACTER, whichever is more useful.

A phrase is worth extracting ONLY if ALL of these are true :
  ✅ Useful in real life — a stranger could say this in a similar situation tomorrow
  ✅ Contains specific vocabulary tied to the scenario theme (medical, work, shopping, travel...)
  ✅ Grammatically correct — NEVER extract a phrase with any error
  ✅ Natural and complete — a real person would say it exactly as-is
  ✅ Reusable — not tied to the specific details of this exact exchange

A phrase is NOT worth extracting if ANY of these apply :
  ❌ Too basic : "Hello", "Thank you", "Yes", "No", "Okay", "I understand"
  ❌ Too personal / too specific to this person or this exchange
     Ex: "I'm co-developing a website for learning languages." → too specific, skip
     Ex: "I'm a student in the fourth year at EMSI." → too personal, skip
     Ex: "We're using React.js for the front-end." → too project-specific, skip
  ❌ Too vague : usable in ANY situation without scenario-specific vocabulary
  ❌ Contains a grammar or spelling error (even from the learner)

REAL-LIFE USEFULNESS TEST — mandatory before each extraction :
Ask : "If a complete stranger goes to a [doctor / interview / shop] tomorrow,
       would this EXACT phrase help them — not just this learner, but anyone?"
→ YES + scenario-specific vocabulary → extract it
→ NO, too personal, or too generic → skip it, return [] if nothing qualifies

GOOD extractions — job interview scenario :
  ✅ "I encountered a bug that was tricky to fix." — concrete, reusable in any tech interview
  ✅ "I'd be happy to walk you through my approach." — natural interview phrase
  ❌ "I'm co-developing a website for learning languages." — too specific to this person
  ❌ "We're using React.js for the front-end." — too project-specific

GOOD extractions — medical scenario :
  ✅ "It comes and goes, especially when I bend over." — specific symptom, reusable
  ✅ "I'd like to get a referral to a specialist." — useful administrative phrase
  ❌ "Yes it does." — too basic
  ❌ "Hello doctor." — too basic

- Maximum 5 phrases — but [] is perfectly valid if nothing qualifies
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
A pattern is OPTIONAL — only create one if the phrase has a genuinely reusable grammatical frame.

DOES THIS PHRASE NEED A PATTERN ?
Ask : "Can I replace the variable part to make 3+ different natural phrases?"
→ YES → create a pattern
→ NO  → assign "Général"

${patternsConnus.length > 0 ? `EXISTING PATTERNS IN DATABASE — reuse them first :
${patternsConnus.map(p => `  "${p}"`).join('\n')}

For each extracted phrase :
1. Check if it fits one of the EXISTING patterns above
2. If YES → copy the EXACT pattern string (character for character)
3. If NO → create a NEW pattern ONLY if the phrase has a clear reusable frame

` : ''}
PATTERN vs PHRASE — the pattern is DERIVED FROM the phrase, never the reverse :
  Phrase : "I'm sorry to hear that."       → Pattern : "I'm sorry to..."
  Phrase : "Can I get a referral?"         → Pattern : "Can I...?"
  Phrase : "I have had a headache."        → Pattern : "I have..."
  Phrase : "I encountered a bug."         → Pattern : "Général" (no reusable frame)

PATTERN RULES :
- Use "..." where the variable part goes
- Broad enough that 3+ different phrases could match it
- Keep it short : 2 to 4 words maximum including "..."

GOOD patterns :
  English  : "I have...", "I've been...", "Can I...?", "Could you...?", "I'd like...", "I think..."
  Spanish  : "Tengo...", "¿Puede...?", "Me duele...", "Quisiera..."
  Korean   : "...고 싶어요", "...주세요", "...있나요?", "...것 같아요"
  Japanese : "...をください", "...はありますか?", "...たいです"
  Arabic   : "...أريد", "هل يمكنني...?", "...من فضلك"

WHEN TO USE "Général" :
  - Useful phrase but no reusable grammatical frame
  - Scenario-specific and doesn't generalize well
  Examples : "I see.", "I encountered a bug that was tricky to fix.", "That makes sense."

BAD patterns — NEVER create these :
  ❌ "We're using... for the..."   → meaningless truncation, use "Général"
  ❌ "I'm co-developing a..."     → too specific, use "Général"
  ❌ "I'm a student in the..."    → too specific, use "Général"
  ❌ "I have been having"         → too specific, use "I have..." instead
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
            'gpt-4o-mini'
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