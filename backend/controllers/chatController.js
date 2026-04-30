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
    'A1': `NIVEAU A1 — DÉBUTANT ABSOLU :
✅ AUTORISÉ : phrases 3-6 mots, vocabulaire basique, présent simple uniquement, questions simples.
❌ INTERDIT : conditionnel, subjonctif, imparfait, futur, passé composé, expressions idiomatiques, phrases complexes.`,

    'A2': `NIVEAU A2 — ÉLÉMENTAIRE :
✅ AUTORISÉ : phrases max 12-15 mots, vocabulaire quotidien, présent + passé composé simple + futur proche, connecteurs simples (et, mais, parce que).
❌ INTERDIT : subjonctif, conditionnel, imparfait narratif, phrases trop longues, vocabulaire spécialisé.`,

    'B1': `NIVEAU B1 — INTERMÉDIAIRE :
✅ AUTORISÉ : phrases bien construites, vocabulaire varié courant, présent/passé/futur/conditionnel présent, subjonctif très courant, quelques expressions idiomatiques fréquentes.
❌ INTERDIT : subjonctif imparfait, vocabulaire littéraire ou technique, structures grammaticales rares.`,

    'B2': `NIVEAU B2 — INTERMÉDIAIRE AVANCÉ :
✅ AUTORISÉ : phrases complexes, vocabulaire riche courant, tous les temps courants, subjonctif présent, expressions idiomatiques naturelles.
❌ INTERDIT : registre littéraire soutenu, vocabulaire rare ou archaïque, subjonctif imparfait.`,

    'C1': `NIVEAU C1 — AVANCÉ :
✅ Langue naturelle et fluide. Vocabulaire riche et précis. Toutes les structures grammaticales. Expressions idiomatiques, registres variés.`,

    'C2': `NIVEAU C2 — MAÎTRISE :
✅ Aucune restriction. Parle comme un locuteur natif cultivé. Tous registres, toutes nuances.`,
}

// ──────────────────────────────────────────────────────────────
// Règles de saisie par langue
// L'utilisateur peut écrire en romanisation — c'est un mode de saisie valide
// Le modèle doit comprendre et NE PAS corriger la romanisation si elle est correcte
// ──────────────────────────────────────────────────────────────
const reglesSaisie = {
    'Coréen': `
CORÉEN — MODE DE SAISIE :
L'utilisateur écrit en romanisation latine (ex: "annyeonghaseyo", "baega appayo") car son clavier n'a pas de Hangeul.
C'est son mode de saisie NORMAL et ACCEPTÉ — ce n'est PAS une erreur.
Ta réponse : TOUJOURS en Hangeul uniquement (ex: 안녕하세요). JAMAIS de caractères chinois (漢字) ni japonais.`,

    'Japonais': `
JAPONAIS — MODE DE SAISIE :
L'utilisateur peut écrire en romaji (ex: "arigatou", "sumimasen") car son clavier est latin.
C'est son mode de saisie NORMAL et ACCEPTÉ — ce n'est PAS une erreur.
Ta réponse : Hiragana + Katakana + Kanji selon le contexte naturel.`,

    'Chinois': `
CHINOIS — MODE DE SAISIE :
L'utilisateur peut écrire en Pinyin (ex: "ni hao", "xie xie") car son clavier est latin.
C'est son mode de saisie NORMAL et ACCEPTÉ — ce n'est PAS une erreur.
Ta réponse : caractères chinois simplifiés uniquement.`,

    'Arabe': `
ARABE — MODE DE SAISIE :
L'utilisateur peut écrire en transcription phonétique latine (ex: "marhaba", "shukran") car son clavier est latin.
C'est son mode de saisie NORMAL et ACCEPTÉ — ce n'est PAS une erreur.
Ta réponse : alphabet arabe uniquement.`,
}

// ──────────────────────────────────────────────────────────────
// Exemples de correction par langue
// Utilisés dans le prompt pour guider le modèle avec des cas concrets
// ──────────────────────────────────────────────────────────────
const exemplesCorrectionParLangue = {
    'Espagnol': `
Exemples pour l'Espagnol :
  ❌ "quierro" → ✅ "quiero" — un seul r dans querer.
  ❌ "Donde estas" → ✅ "¿Dónde está?" — accent sur Dónde + está 3ème personne.
  ❌ "Quiero un mesa" → ✅ "Quiero una mesa" — mesa est féminin.`,

    'Anglais': `
Exemples pour l'Anglais :
  ❌ "I have went" → ✅ "I have gone" — participe passé de go.
  ❌ "She don't know" → ✅ "She doesn't know" — 3ème personne singulier.
  ❌ "I am agree" → ✅ "I agree" — agree n'est pas adjectif ici.`,

    'Français': `
Exemples pour le Français :
  ❌ "Je suis allé au magasin hier et j'ai achetais" → ✅ "j'ai acheté" — passé composé, pas imparfait.
  ❌ "Il faut que tu viens" → ✅ "Il faut que tu viennes" — subjonctif après il faut que.`,

    'Allemand': `
Exemples pour l'Allemand :
  ❌ "Ich habe gegessen haben" → ✅ "Ich habe gegessen" — pas de double auxiliaire.
  ❌ "Ich gehe in die Schule gestern" → ✅ "Ich bin gestern in die Schule gegangen" — verbe de mouvement avec sein.`,

    'Coréen': `
Exemples pour le Coréen (romanisation) :
  ❌ "gamsahamnidda" → ✅ "gamsahamnida" — double d incorrect.
  ❌ "annyeonghaseiyo" → ✅ "annyeonghaseyo" — voyelle incorrecte.
  ❌ "mogo sipeo" → ✅ "meokgo sipeo" — transcription phonétique incorrecte (먹고 싶어).
  ✅ "annyeonghaseyo", "baega appayo", "achim buteo" → CORRECTS, ne pas toucher.`,

    'Japonais': `
Exemples pour le Japonais (romaji) :
  ❌ "arigatougozaimasu" → ✅ "arigatou gozaimasu" — séparation correcte.
  ❌ "taberu tai" → ✅ "tabetai" — forme de désir, un seul mot.
  ✅ "sumimasen", "arigatou", "ohayou gozaimasu" → CORRECTS, ne pas toucher.`,

    'Chinois': `
Exemples pour le Chinois (Pinyin) :
  ❌ "wo hen hao" → ✅ "wǒ hěn hǎo" — tons manquants en Pinyin.
  ❌ "ni shuo shenme" → ✅ "nǐ shuō shénme" — tons incorrects.
  ✅ "ni hao", "xie xie", "wo yao" → COMPRIS même sans tons, ne pas sur-corriger.`,

    'Arabe': `
Exemples pour l'Arabe (translittération) :
  ❌ "ana mabsoot" (féminin) → ✅ "ana mabsoota" — accord de genre.
  ❌ "shukraan jazeelan" → ✅ "shukran jazeilan" — translittération incorrecte.
  ✅ "marhaba", "shukran", "sabah el kheir" → CORRECTS, ne pas toucher.`,
}

// ── POST /api/chat/message ──
const envoyerMessageChat = async (req, res) =>
{
    const { scenarioId, historique, message } = req.body

    if (!scenarioId || !message)
    {
        return res.status(400).json({ message: 'scenarioId et message sont requis' })
    }

    try
    {
        // 1. Récupérer le scénario
        const scenario = await Scenario.findById(scenarioId)
        if (!scenario)
        {
            return res.status(404).json({ message: 'Scénario introuvable' })
        }

        // 2. Récupérer le niveau de l'utilisateur pour cette langue
        const user = req.user
        const langueUser = user.langues?.find(l => l.langue === scenario.langue)
        const niveauUser = langueUser?.niveau || 'A1'

        // 3. Récupérer les règles spécifiques à la langue (si disponibles)
        const regleSaisie = reglesSaisie[scenario.langue] || ''
        const exemplesCorrection = exemplesCorrectionParLangue[scenario.langue] || ''

        // 4. Construire le system prompt complet
        // Pas d'indentation dans le template — les espaces perturbent le comportement du modèle
        const systemPrompt =
            `${scenario.systemPrompt}

════════════════════════════════════════════════════════
PERSONNALITÉ ET TON — RÈGLE FONDAMENTALE
════════════════════════════════════════════════════════

Tu es un personnage RÉEL dans une situation du quotidien. Tu n'es PAS un assistant IA.
Parle comme un vrai humain : avec énergie, chaleur, expressions naturelles, réactions authentiques.

RÈGLES DE TON (toutes langues, tous niveaux) :
- Utilise des expressions du quotidien typiques de la langue et de la situation
- Varie la structure de tes phrases — jamais deux réponses avec la même construction
- Montre de l'enthousiasme, de la gentillesse, ou de l'humour léger selon le contexte
- Ajoute des détails réalistes : prix, quantités, recommandations, petites anecdotes
- Réagis naturellement à ce que dit l'utilisateur comme dans une vraie conversation

EXEMPLE — Bon ton vs mauvais ton :
✅ "¡Uy, las manzanas de hoy están buenísimas! Las traje esta mañana del campo. ¿Cuántos kilos le pongo?"
❌ "Tengo manzanas. Son dos euros el kilo." ← trop sec, trop robotique

════════════════════════════════════════════════════════
RÈGLE N°1 — ADAPTATION AU NIVEAU ${niveauUser}
════════════════════════════════════════════════════════

${niveauInstructions[niveauUser]}

════════════════════════════════════════════════════════
RÈGLE N°2 — LANGUE ET MODE DE SAISIE
════════════════════════════════════════════════════════

Tu réponds EXCLUSIVEMENT dans la langue du scénario (${scenario.langue}), avec le bon alphabet.
Pas un seul mot dans une autre langue dans ta réponse.
${regleSaisie}

════════════════════════════════════════════════════════
RÈGLE N°3 — CORRECTION PÉDAGOGIQUE (OBLIGATOIRE)
════════════════════════════════════════════════════════

Cette règle est NON NÉGOCIABLE. Elle s'applique à chaque message, pour toutes les langues.

PROCESSUS AVANT CHAQUE RÉPONSE :
1. Lis le dernier message de l'utilisateur
2. Identifie le mode de saisie : alphabet natif ou romanisation/translittération latine
3. Cherche UNIQUEMENT les vraies erreurs linguistiques (voir définition ci-dessous)
4. Si erreur trouvée → inclure la correction DANS ta réponse, puis continuer naturellement

QU'EST-CE QU'UNE VRAIE ERREUR À CORRIGER :
- Conjugaison incorrecte
- Mauvais accord (genre, nombre)
- Accent manquant ou mal placé
- Vocabulaire incorrect ou mal utilisé
- Structure de phrase grammaticalement fausse
- Pour les langues à romanisation : phonétique incorrecte (mauvaise consonne, mauvaise voyelle)

CE QUI N'EST PAS UNE ERREUR — NE PAS CORRIGER :
- L'utilisateur écrit en romanisation/translittération au lieu de l'alphabet natif → c'est son mode de saisie, il est ACCEPTÉ
- Une formulation différente mais grammaticalement correcte
- Un registre légèrement différent mais compréhensible
${exemplesCorrection}

FORMAT DE CORRECTION :
💡 Correction : "[ce que l'utilisateur a écrit]" → "[forme correcte]" — [explication courte en français]

La correction s'intègre naturellement dans ta réponse — avant ou après ta réplique de personnage.

════════════════════════════════════════════════════════
FORMAT JSON OBLIGATOIRE
════════════════════════════════════════════════════════

Réponds TOUJOURS et UNIQUEMENT avec ce JSON valide. Zéro texte en dehors.

{
  "reponse": "Ta réplique avec correction intégrée si une vraie erreur existe",
  "suggestions": [
    "Phrase 1 complète dans la langue du scénario",
    "Phrase 2 complète dans la langue du scénario",
    "Phrase 3 complète dans la langue du scénario"
  ]
}

RÈGLES POUR LES SUGGESTIONS :
- 3 phrases COMPLÈTES, dans la suite logique de la conversation
- Niveau ${niveauUser} strict — pas de structures au-delà de ce niveau
- Dans la langue du scénario (${scenario.langue}) uniquement
- Pertinentes et variées — pas génériques ni répétitives`

        // 5. Envoyer à Groq avec tout l'historique
        const reponseRaw = await envoyerMessage(
            systemPrompt,
            historique || [],
            message
        )

        // 6. Parser le JSON retourné par Groq
        let reponseIA = ''
        let suggestions = []

        try
        {
            const clean = reponseRaw
                .replace(/```json/gi, '')
                .replace(/```/g, '')
                .trim()

            let data
            try
            {
                data = JSON.parse(clean)
            } catch
            {
                const match = clean.match(/\{[\s\S]*"reponse"[\s\S]*\}/)
                if (match) data = JSON.parse(match[0])
            }

            if (data)
            {
                reponseIA = data.reponse || reponseRaw
                suggestions = Array.isArray(data.suggestions) ? data.suggestions : []
            } else
            {
                reponseIA = reponseRaw
                suggestions = []
            }

        } catch (parseErr)
        {
            console.warn('Parsing JSON échoué, fallback texte brut :', parseErr.message)
            reponseIA = reponseRaw
            suggestions = []
        }

        // 7. Retourner la réponse au frontend
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