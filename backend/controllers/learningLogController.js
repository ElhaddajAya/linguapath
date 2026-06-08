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

WHAT TO EXTRACT :
Your goal is to find phrases the learner can REUSE in a real-life situation similar to this scenario.
Source doesn't matter — extract from LEARNER or AI CHARACTER lines, whichever are more useful.

A phrase is worth extracting if ALL of these are true :
  ✅ Useful in real life — someone would actually say this in a similar real situation
  ✅ Contains specific vocabulary related to the scenario theme (medical, shopping, travel, work...)
  ✅ Grammatically correct — NEVER extract a phrase containing an error
     (the learner may have made mistakes — skip those phrases entirely)
  ✅ Natural and complete — a real person would say it exactly as-is

A phrase is NOT worth extracting if ANY of these apply :
  ❌ Too basic : "Hello", "Thank you", "Yes", "No", "Okay", "See you", "I understand"
  ❌ Too vague and usable in any situation without specific vocabulary
  ❌ Contains a grammar or spelling error (even if said by the learner)
  ❌ Too specific to this exact exchange (unique names, one-time specific numbers)

REAL-LIFE USEFULNESS TEST — ask yourself :
"If someone goes to a doctor / shop / interview tomorrow, would this phrase help them?"
→ YES + has specific vocabulary → extract it
→ NO or too generic → skip it

GOOD examples for a medical scenario :
  ✅ "It comes and goes, especially when I bend over." — specific symptom description
  ✅ "The pain radiates to my left leg." — medical vocabulary, reusable
  ✅ "I've been taking ibuprofen for the pain." — useful medical context
  ✅ "I'd like to get a referral to a specialist." — useful administrative phrase
  ✅ "What brings you to the clinic today?" — useful for understanding/context
  ❌ "Yes it does." — too basic
  ❌ "That sounds good." — too vague
  ❌ "Hello doctor." — too basic

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
STEP 1 — ALWAYS try to find a pattern first.
STEP 2 — Only use "Général" if truly no reusable grammatical frame exists.

HOW TO FIND A PATTERN :
Look at the beginning or end of the phrase. Is there a fixed grammatical structure
where only the middle/end changes depending on the situation?

TEST — replace the variable part with something else :
  "두 봉지 사면 9,000원 드릴게요." → Can I say "세 봉지 사면 X원 드릴게요" ? YES → Pattern : "...사면 ...드릴게요"
  "다음에 또 오세요!"              → Can I say "다음에 또 전화하세요" ?       YES → Pattern : "다음에 또..."
  "총 10,000원이에요."             → Can I say "총 X원이에요" ?               YES → Pattern : "총 ...이에요"
  "어떤 반찬을 찾고 계세요?"        → Can I say "어떤 X을 찾고 계세요?" ?      YES → Pattern : "어떤 ...을/를 찾고 계세요?"
  "I encountered a bug that was tricky to fix." → Can I generalize this? NO → "Général"

${patternsConnus.length > 0 ? `EXISTING PATTERNS IN DATABASE — check these FIRST :
${patternsConnus.map(p => `  "${p}"`).join('\n')}

For each extracted phrase :
1. Does it fit one of the EXISTING patterns above? → YES : copy it EXACTLY
2. No match → go to STEP 1 above and try to create a new pattern
3. No pattern possible → "Général"

` : ''}
PATTERN RULES :
- Write the pattern in THE SAME LANGUAGE as the phrase — NEVER in French
- If the phrase is in English → pattern in English : "I have...", "Can I...?"
- If the phrase is in Spanish → pattern in Spanish : "Tengo...", "¿Puede...?"
- If the phrase is in Korean → pattern in Korean : "...주세요", "...있나요?"
- Use "..." where the variable part goes
- Short : 2 to 5 words maximum including "..."
- Broad enough that 3+ different phrases could fit it

GOOD patterns by language :
  English  : "I have...", "I've been...", "Can I...?", "Could you...?", "I'd like...", "I'm looking for..."
  Spanish  : "Tengo...", "¿Puede...?", "Me duele...", "Quisiera...", "¿Cuánto cuesta...?"
  Korean   : "...고 싶어요", "...주세요", "...있나요?", "...이에요", "...드릴게요", "다음에...", "총 ...이에요", "어떤 ...을/를..."
  Japanese : "...をください", "...はありますか?", "...たいです", "...ですね"
  Arabic   : "...أريد", "هل يمكنني...?", "...من فضلك", "كم...؟"

USE "Général" ONLY when :
  - The phrase is a fixed expression with no variable part at all
  - The phrase is too situation-specific to generalize
  Examples : "I see.", "That makes sense.", "I encountered a bug that was tricky to fix."

NEVER do this :
  ❌ Assign "Général" without first trying STEP 1
  ❌ "We're using... for the..."  → meaningless truncation
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