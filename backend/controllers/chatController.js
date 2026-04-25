// Gère l'envoi et la réception des messages dans une conversation.
// À chaque message, on envoie TOUT l'historique à Groq
// pour qu'il garde le contexte de la conversation.

const Scenario = require('../models/Scenario')
const { envoyerMessage } = require('../services/groqService')

// ──────────────────────────────────────────────────────────────
// Instructions de niveau CECRL — une entrée par niveau
// Chaque niveau définit ce qui est AUTORISÉ et ce qui est INTERDIT
// Ces règles s'appliquent à TOUTES les langues sans exception
// ──────────────────────────────────────────────────────────────
const niveauInstructions = {

    'A1': `NIVEAU A1 — DÉBUTANT ABSOLU — RÈGLES STRICTES :
✅ AUTORISÉ :
- Phrases très courtes : 3 à 6 mots maximum par phrase
- Vocabulaire ultra basique : salutations, chiffres simples, couleurs, objets courants
- Présent simple UNIQUEMENT — aucun autre temps verbal
- Questions simples avec des mots interrogatifs basiques (quoi, où, combien)
✅ STRUCTURE TYPE : [sujet] + [verbe simple] + [complément court]
❌ INTERDIT ABSOLUMENT :
- Conditionnel, subjonctif, imparfait, futur, passé composé
- Expressions idiomatiques ou figurées
- Phrases subordonnées complexes
- Vocabulaire peu courant ou technique
⚠️ Si l'utilisateur ne comprend pas, réponds avec des mots encore plus simples et courts.`,

    'A2': `NIVEAU A2 — ÉLÉMENTAIRE — RÈGLES STRICTES :
✅ AUTORISÉ :
- Phrases simples, maximum 12 à 15 mots
- Vocabulaire du quotidien courant et familier
- Temps autorisés : présent, passé récent (passé composé simple), futur proche
- Connecteurs simples : et, mais, parce que, alors, après
- Questions courantes de la vie quotidienne
✅ STRUCTURE TYPE : phrases simples reliées par des connecteurs basiques
❌ INTERDIT ABSOLUMENT :
- Subjonctif, conditionnel, imparfait narratif
- Expressions idiomatiques complexes
- Phrases trop longues ou avec plusieurs subordonnées
- Vocabulaire rare ou spécialisé`,

    'B1': `NIVEAU B1 — INTERMÉDIAIRE — RÈGLES STRICTES :
✅ AUTORISÉ :
- Phrases de longueur normale, bien construites
- Vocabulaire varié et courant, accessible à un apprenant intermédiaire
- Temps autorisés : présent, passé, futur, conditionnel présent simple
- Subjonctif présent uniquement dans les structures très courantes
- Quelques expressions idiomatiques très connues et fréquentes
- Connecteurs logiques : bien que, même si, cependant, pourtant
✅ STRUCTURE TYPE : phrases complexes mais claires, avec une ou deux subordonnées
❌ INTERDIT :
- Subjonctif imparfait ou plus-que-parfait
- Vocabulaire littéraire, académique ou très spécialisé
- Structures grammaticales rares ou complexes`,

    'B2': `NIVEAU B2 — INTERMÉDIAIRE AVANCÉ — RÈGLES STRICTES :
✅ AUTORISÉ :
- Phrases complexes et bien structurées
- Vocabulaire riche mais toujours courant — pas de termes rares
- Tous les temps courants autorisés y compris le subjonctif présent
- Expressions idiomatiques naturelles et fréquentes
- Nuances de sens et registres légèrement variés
✅ STRUCTURE TYPE : langue fluide et naturelle, proche d'un locuteur natif courant
❌ INTERDIT :
- Registre littéraire ou académique soutenu
- Vocabulaire rare, archaïque ou ultra-spécialisé
- Subjonctif imparfait
- Structures grammaticales très complexes ou peu usitées`,

    'C1': `NIVEAU C1 — AVANCÉ :
✅ AUTORISÉ :
- Langue naturelle, fluide et précise
- Vocabulaire riche, précis et nuancé
- Toutes les structures grammaticales y compris les plus complexes
- Expressions idiomatiques, jeux de mots subtils, registres variés
- Langage soutenu quand c'est naturellement approprié au contexte`,

    'C2': `NIVEAU C2 — MAÎTRISE :
✅ Aucune restriction. Utilise la langue comme un locuteur natif cultivé.
- Vocabulaire et grammaire sans aucune limite
- Registres littéraires, académiques, familiers selon le contexte
- Toutes les nuances, sous-entendus et finesses linguistiques`,
}

// ── POST /api/chat/message ──
// Reçoit un message de l'utilisateur, construit le prompt complet,
// l'envoie à Groq avec tout l'historique, et retourne la réponse + suggestions
const envoyerMessageChat = async (req, res) =>
{
    const { scenarioId, historique, message } = req.body

    if (!scenarioId || !message)
    {
        return res.status(400).json({ message: 'scenarioId et message sont requis' })
    }

    try
    {
        // 1. Récupérer le scénario pour avoir le system prompt du personnage
        const scenario = await Scenario.findById(scenarioId)
        if (!scenario)
        {
            return res.status(404).json({ message: 'Scénario introuvable' })
        }

        // 2. Récupérer le niveau de l'utilisateur pour cette langue
        const user = req.user
        const langueUser = user.langues?.find(l => l.langue === scenario.langue)
        const niveauUser = langueUser?.niveau || 'A1'

        // 3. Construire le system prompt complet
        // IMPORTANT : pas d'indentation dans le template string —
        // les espaces en début de ligne sont inclus dans le prompt et perturbent le JSON
        const systemPromptComplet = `${scenario.systemPrompt}

══════════════════════════════════════════════════════════════
RÈGLE PRIORITAIRE N°1 — ADAPTATION STRICTE AU NIVEAU
══════════════════════════════════════════════════════════════
L'utilisateur a le niveau ${niveauUser} dans cette langue.
Tu dois OBLIGATOIREMENT respecter les règles ci-dessous pour CHAQUE phrase que tu écris.
Ces règles s'appliquent à cette langue et à toutes les langues sans exception.

${niveauInstructions[niveauUser] || niveauInstructions['A1']}

⚠️ RAPPEL CRITIQUE : utiliser un vocabulaire ou une structure grammaticale
au-dessus du niveau ${niveauUser} est une ERREUR GRAVE qui nuit à l'apprentissage.
Vérifie chaque phrase avant de l'écrire.

══════════════════════════════════════════════════════════════
RÈGLE PRIORITAIRE N°2 — LANGUE DU SCÉNARIO
══════════════════════════════════════════════════════════════
Tu réponds UNIQUEMENT dans la langue du scénario, jamais dans une autre langue.
Tu ne sors JAMAIS du personnage défini dans ton rôle.

Règles d'alphabet strictes — une seule violation = réponse incorrecte :
- Scénario en Coréen  → UNIQUEMENT Hangul (한글). Zéro caractère japonais ou chinois.
- Scénario en Japonais → UNIQUEMENT Hiragana + Katakana + Kanji japonais. Zéro Hangul.
- Scénario en Chinois  → UNIQUEMENT Hanzi simplifié. Zéro Hangul, zéro Kana.
- Scénario en Arabe   → UNIQUEMENT alphabet arabe.
- Autres langues      → alphabet latin uniquement.

══════════════════════════════════════════════════════════════
RÈGLE PRIORITAIRE N°3 — CORRECTION PÉDAGOGIQUE DES FAUTES
══════════════════════════════════════════════════════════════
Tu joues un double rôle : personnage du scénario ET professeur de langue.

FAUTES À DÉTECTER ET CORRIGER OBLIGATOIREMENT :
- Faute d'orthographe : lettre en trop, lettre manquante, mauvaise lettre
- Faute de grammaire : mauvaise conjugaison, mauvais accord en genre ou nombre
- Mauvais temps verbal utilisé dans le contexte
- Mot inventé ou inexistant dans la langue

COMPORTEMENT ATTENDU :
→ Si l'utilisateur n'a PAS fait de faute :
  Réponds normalement dans ton rôle. Aucune mention de correction.

→ Si l'utilisateur a fait UNE OU PLUSIEURS fautes :
  1. Réponds D'ABORD normalement dans ton rôle (continue la conversation).
  2. Ajoute ENSUITE à la fin de ta réponse, sur une nouvelle ligne :
     💡 Correction : [mot ou phrase fautif] → [forme correcte]
  Note importante : la correction est dans la langue du scénario uniquement.
  Si plusieurs fautes, liste-les toutes séparées par " | "

══════════════════════════════════════════════════════════════
FORMAT DE RÉPONSE — OBLIGATOIRE ET NON NÉGOCIABLE
══════════════════════════════════════════════════════════════
Retourne UNIQUEMENT un objet JSON valide sur UNE SEULE LIGNE.
Aucun texte avant. Aucun texte après. Aucun markdown. Aucun commentaire.

Format exact :
{"reponse":"[ta réponse dans la langue du scénario, correction incluse si nécessaire]","suggestions":["[suggestion 1]","[suggestion 2]","[suggestion 3]"]}

══════════════════════════════════════════════════════════════
RÈGLES POUR LES SUGGESTIONS
══════════════════════════════════════════════════════════════
Les suggestions sont 3 répliques COMPLÈTES que l'utilisateur pourrait envoyer
en réponse à ton dernier message. Elles doivent :
- Être des phrases complètes avec sujet + verbe (jamais un seul mot ou un sujet vague)
- Être rédigées UNIQUEMENT dans la langue du scénario (Hangul pour coréen, etc.)
- Respecter EXACTEMENT le niveau ${niveauUser} de l'utilisateur
- Être naturelles, variées, et adaptées au contexte précis de la conversation
- Faire 1 à 2 phrases maximum chacune`

        // 4. Envoyer à Groq avec tout l'historique de la conversation
        const reponseRaw = await envoyerMessage(
            systemPromptComplet,
            historique || [],
            message
        )

        // 5. Parser le JSON retourné par Groq
        let reponseIA = ''
        let suggestions = []

        try
        {
            // Nettoyer les éventuels blocs ```json ... ``` ajoutés par le modèle
            const clean = reponseRaw
                .replace(/```json/gi, '')
                .replace(/```/g, '')
                .trim()

            // Tentative 1 : parsing JSON direct
            let data
            try
            {
                data = JSON.parse(clean)
            } catch
            {
                // Tentative 2 : extraire le JSON avec regex si du texte l'entoure
                const match = clean.match(/\{[\s\S]*"reponse"[\s\S]*\}/)
                if (match) data = JSON.parse(match[0])
            }

            if (data)
            {
                reponseIA = data.reponse || reponseRaw
                suggestions = Array.isArray(data.suggestions) ? data.suggestions : []
            } else
            {
                // Fallback : afficher le texte brut si le JSON est non récupérable
                reponseIA = reponseRaw
                suggestions = []
            }

        } catch (parseErr)
        {
            console.warn('Parsing JSON échoué, fallback texte brut :', parseErr.message)
            reponseIA = reponseRaw
            suggestions = []
        }

        // 6. Retourner la réponse et les suggestions au frontend
        res.json({
            reponse: reponseIA,
            suggestions,
            nouveauMessage: {
                role: 'assistant',
                contenu: reponseIA,
            }
        })

    } catch (err)
    {
        console.error('Erreur Groq :', err.message)
        res.status(500).json({ message: "Erreur lors de la communication avec l'IA" })
    }
}

module.exports = { envoyerMessageChat }