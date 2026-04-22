// Gère l'envoi et la réception des messages dans une conversation.
// À chaque message, on envoie TOUT l'historique à Groq
// pour qu'il garde le contexte de la conversation.

const Scenario = require('../models/Scenario')
const { envoyerMessage } = require('../services/groqService')

// Instructions de niveau détaillées — adaptées à chaque niveau CECRL
// Groq doit adapter CHAQUE phrase à ces contraintes
const niveauInstructions = {
    'A1': `Niveau A1 — DÉBUTANT ABSOLU :
- Phrases très courtes (3 à 5 mots maximum par phrase)
- Vocabulaire ultra basique uniquement (bonjour, merci, oui, non, je veux, combien, où)
- Présent simple uniquement, aucun autre temps
- Zéro expression idiomatique, zéro subordonnée complexe
- Si l'utilisateur ne comprend pas, répète avec des mots encore plus simples`,

    'A2': `Niveau A2 — ÉLÉMENTAIRE :
- Phrases simples et courtes
- Vocabulaire courant du quotidien uniquement
- Présent, passé simple, futur proche autorisés — rien d'autre
- Pas de subjonctif, pas de conditionnel, pas de structures complexes
- Expressions très communes uniquement`,

    'B1': `Niveau B1 — INTERMÉDIAIRE :
- Phrases de longueur normale
- Vocabulaire varié mais toujours accessible et courant
- Passé, présent, futur, conditionnel présent autorisés
- Quelques expressions idiomatiques très connues
- Subjonctif présent uniquement si nécessaire et naturel`,

    'B2': `Niveau B2 — INTERMÉDIAIRE AVANCÉ :
- Phrases complexes autorisées
- Vocabulaire riche mais sans termes techniques rares ou littéraires
- Tous les temps courants autorisés
- Expressions idiomatiques naturelles et courantes
- Pas de jargon académique, pas de registre littéraire soutenu`,

    'C1': `Niveau C1 — AVANCÉ :
- Langue naturelle et fluide
- Vocabulaire riche, précis et varié
- Toutes les structures grammaticales autorisées
- Expressions idiomatiques, nuances, registres variés
- Peut utiliser un langage soutenu quand c'est naturel`,

    'C2': `Niveau C2 — MAÎTRISE :
- Langue de niveau natif, aucune restriction
- Vocabulaire et grammaire sans aucune limite
- Peut utiliser des registres littéraires, académiques ou familiers selon le contexte`,
}

// ── POST /api/chat/message ──
// Reçoit un message, l'envoie à Groq avec l'historique, retourne la réponse + suggestions
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
        const user = req.user
        const langueUser = user.langues?.find(l => l.langue === scenario.langue)
        const niveauUser = langueUser?.niveau || 'A1'

        // IMPORTANT : pas d'indentation dans le template string
        // Les espaces en début de ligne font partie du prompt et perturbent le JSON attendu
        const systemPromptComplet = `${scenario.systemPrompt}

══════════════════════════════════════════
ADAPTATION AU NIVEAU — RÈGLE ABSOLUE
══════════════════════════════════════════
${niveauInstructions[niveauUser] || niveauInstructions['A1']}

Tu dois adapter CHAQUE phrase que tu écris à ce niveau.
Si tu utilises un vocabulaire ou une structure trop avancée pour ce niveau, c'est une erreur grave.
Ne jamais sortir du personnage. Répondre uniquement dans la langue du scénario.

LANGUE STRICTE :
- Scénario en Coréen → UNIQUEMENT Hangul (한글). INTERDIT : 者, の, を, 的 ou tout caractère japonais ou chinois.
- Scénario en Japonais → UNIQUEMENT Hiragana, Katakana, Kanji japonais. Pas de Hangul.
- Scénario en Chinois → UNIQUEMENT Hanzi simplifié. Pas de Hangul, pas de Kana.
- Scénario en Arabe → UNIQUEMENT alphabet arabe.
- Autres langues → alphabet latin uniquement.
Si tu utilises un seul caractère étranger à la langue, c'est une erreur grave.

RÈGLES DE CORRECTION :
- Tu ne te corriges JAMAIS toi-même. Tes propres phrases sont toujours correctes.
- Tu corriges UNIQUEMENT si l'utilisateur fait une faute de grammaire ou de vocabulaire.
- Si l'utilisateur ne fait PAS de faute → tu réponds normalement, SANS aucune correction.
- La correction se place uniquement à la FIN de ta réponse, après ta réponse normale.
- Format de correction : "💡 [mot natif pour correction] : [phrase corrigée]"
- Si aucune faute → aucune mention de correction, aucun commentaire là-dessus.

FORMAT DE RÉPONSE OBLIGATOIRE :
Retourne UNIQUEMENT un JSON valide sur une seule ligne, sans texte avant ou après.
{"reponse":"ta réponse dans la langue du scénario","suggestions":["suggestion 1","suggestion 2","suggestion 3"]}

RÈGLES POUR LES SUGGESTIONS — TRÈS IMPORTANT :
Les suggestions sont des VRAIES RÉPLIQUES que l'utilisateur pourrait dire en réponse à ton dernier message.
Ce sont des phrases complètes, naturelles, comme dans une vraie conversation.
Exemples pour un entretien coréen après "어떤 일을 하고 싶으신가요?" :
  ✅ "저는 백엔드 개발자로 일하고 싶습니다." (Je voudrais travailler comme développeur backend.)
  ✅ "저는 팀 리더 역할에 관심이 있습니다." (Je suis intéressé par le rôle de chef d'équipe.)
  ✅ "소프트웨어 엔지니어링 분야에서 성장하고 싶습니다." (Je veux progresser dans l'ingénierie logicielle.)
  ❌ "지원 경력" (juste un sujet — INTERDIT)
  ❌ "소개" (un seul mot — INTERDIT)
Règles strictes pour les suggestions :
- Phrase complète avec sujet + verbe
- 1 à 2 phrases maximum
- Adaptées au contexte exact de la dernière réponse
- Dans la langue du scénario uniquement
- Niveau ${niveauUser} — ni trop simple, ni trop complexe

RAPPEL FINAL : Retourner SEULEMENT le JSON. Aucun texte, aucun markdown, aucune explication.`

        // 3. Envoyer à Groq avec tout l'historique
        const reponseRaw = await envoyerMessage(
            systemPromptComplet,
            historique || [],
            message
        )

        // 4. Parser le JSON retourné par Groq
        let reponseIA = ''
        let suggestions = []

        try
        {
            // Supprimer les éventuels ```json ... ``` ajoutés par le modèle
            const clean = reponseRaw
                .replace(/```json/gi, '')
                .replace(/```/g, '')
                .trim()

            const data = JSON.parse(clean)
            reponseIA = data.reponse || reponseRaw
            suggestions = Array.isArray(data.suggestions) ? data.suggestions : []

        } catch (parseErr)
        {
            // Si le parsing échoue → on affiche le texte brut sans suggestions
            console.warn('Parsing JSON échoué, fallback texte brut :', parseErr.message)
            reponseIA = reponseRaw
            suggestions = []
        }

        // 5. Retourner la réponse + les suggestions au frontend
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