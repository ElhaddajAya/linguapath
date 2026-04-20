// Gère l'envoi et la réception des messages dans une conversation.
// À chaque message, on envoie TOUT l'historique à Groq
// pour qu'il garde le contexte de la conversation.

const Scenario = require('../models/Scenario')
const { envoyerMessage } = require('../services/groqService')

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
        // On ajoute le niveau de l'utilisateur pour adapter la difficulté
        const user = req.user
        const langueUser = user.langues?.find(l => l.langue === scenario.langue)
        const niveauUser = langueUser?.niveau || 'A1'

        // IMPORTANT : pas d'indentation dans le template string
        // Les espaces en début de ligne font partie du prompt et perturbent le JSON attendu
        const systemPromptComplet = `${scenario.systemPrompt}

IMPORTANT — Niveau de l'utilisateur : ${niveauUser}.
Adapte la complexité de ton vocabulaire et tes phrases à ce niveau.
Ne jamais sortir du personnage. Répondre uniquement dans la langue du scénario.

LANGUE STRICTE : Écris UNIQUEMENT en ${scenario.langue}. 
N'utilise JAMAIS d'autres systèmes d'écriture. 
Pour le Coréen : uniquement Hangul (한글). 
Pour le Japonais : uniquement Hiragana/Katakana/Kanji. 
Pour le Chinois : uniquement Hanzi. 
Pour l'Arabe : uniquement l'alphabet arabe.

RÈGLES DE CORRECTION :
- Tu ne te corriges JAMAIS toi-même. Tes propres phrases sont toujours correctes.
- Tu corriges UNIQUEMENT si l'utilisateur fait une faute de grammaire ou de vocabulaire.
- Si l'utilisateur ne fait PAS de faute → tu réponds normalement, SANS aucune correction.
- La correction se place uniquement à la FIN de ta réponse, après ta réponse normale.
- Format de correction : "💡 [mot natif pour 'correction'] : [phrase corrigée]"
- Si aucune faute → aucune mention de correction, aucun commentaire là-dessus.

FORMAT DE RÉPONSE OBLIGATOIRE :
Tu dois TOUJOURS retourner UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après.
Structure exacte à respecter :
{"reponse":"ta réponse dans la langue du scénario","suggestions":["suggestion 1","suggestion 2","suggestion 3"]}

Règles pour les suggestions :
- Exactement 3 suggestions
- Dans la langue du scénario
- Courtes : 5 à 10 mots maximum
- Contextuelles : logiques par rapport à la conversation en cours
- Adaptées au niveau ${niveauUser}

RAPPEL : Retourner SEULEMENT le JSON. Aucun texte, aucun markdown, aucune explication.`

        // 3. Envoyer à Groq avec tout l'historique
        const reponseRaw = await envoyerMessage(
            systemPromptComplet,
            historique || [],
            message
        )

        // 4. Parser le JSON retourné par Groq
        // On nettoie la réponse au cas où Groq ajouterait des balises markdown
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
            // Cela peut arriver si Groq ignore les instructions de format
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