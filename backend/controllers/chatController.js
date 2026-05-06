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
  CORÉEN — CAS CONCRETS :
  ❌ INTERDIT : "annyeonghaseyo" → "안녕하세요"  (romanisation correcte — ne pas toucher)
  ❌ INTERDIT : "gamsahamnida" → "감사합니다"    (romanisation correcte — ne pas toucher)
  ❌ INTERDIT : "yag-eul juseyo" → "약을 주세요" (romanisation correcte — ne pas toucher)
  ❌ INTERDIT : "baega appayo" → "배가 아파요"   (romanisation correcte — ne pas toucher)
  ✅ VALIDE   : "gamsahamnidda" → "gamsahamnida" — 'd' double incorrect (vraie faute phonétique)
  ✅ VALIDE   : "annyeonghaseiyo" → "annyeonghaseyo" — 'ei' incorrect (vraie faute phonétique)
  ✅ VALIDE   : "mogo sipeo" → "meokgo sipeo" — phonème 'o' au lieu de 'eo' (vraie faute phonétique)`,

    'Japonais': `
  JAPONAIS — CAS CONCRETS :
  ❌ INTERDIT : "arigatou" → "ありがとう"           (romaji correct — ne pas toucher)
  ❌ INTERDIT : "sumimasen" → "すみません"          (romaji correct — ne pas toucher)
  ❌ INTERDIT : "ohayou gozaimasu" → "おはようございます" (romaji correct — ne pas toucher)
  ✅ VALIDE   : "taberu tai" → "tabetai" — fusion incorrecte de mots (vraie faute phonétique)
  ✅ VALIDE   : "arigatougozaimasu" → "arigatou gozaimasu" — séparation manquante`,

    'Chinois': `
  CHINOIS — CAS CONCRETS :
  ❌ INTERDIT : "ni hao" → "你好"   (pinyin correct — ne pas toucher)
  ❌ INTERDIT : "xie xie" → "谢谢"  (pinyin correct — ne pas toucher)
  ❌ INTERDIT : "wo yao" → "我要"   (pinyin correct — ne pas toucher)
  ✅ VALIDE   : "wo hen hao" → "wǒ hěn hǎo" — tons manquants (vraie faute phonétique)
  ✅ VALIDE   : "ni shuo shenme" → "nǐ shuō shénme" — tons incorrects`,

    'Arabe': `
  ARABE — CAS CONCRETS :
  ❌ INTERDIT : "marhaba" → "مرحبا"         (translittération correcte — ne pas toucher)
  ❌ INTERDIT : "shukran" → "شكراً"          (translittération correcte — ne pas toucher)
  ❌ INTERDIT : "sabah el kheir" → "صباح الخير" (translittération correcte — ne pas toucher)
  ✅ VALIDE   : "ana mabsoot" (dit par une femme) → "ana mabsoota" — accord féminin manquant (vraie faute grammaticale)
  ✅ VALIDE   : "shukraan jazeelan" → "shukran jazeilan" — phonétique incorrecte`,
}

// ──────────────────────────────────────────────────────────────
// Exemples de correction par langue
// Utilisés dans le prompt pour guider le modèle avec des cas concrets
// ──────────────────────────────────────────────────────────────
const exemplesCorrectionParLangue = {
    'Espagnol': `
Exemples pour l'Espagnol :
  ❌ "quierro" → ✅ "quiero" — "querer" se escribe con una sola "r".
  ❌ "Donde estas" → ✅ "¿Dónde está?" — "dónde" lleva tilde y "está" es 3ª persona.
  ❌ "Quiero un mesa" → ✅ "Quiero una mesa" — "mesa" es femenino.`,

    'Anglais': `
Exemples pour l'Anglais :
  ❌ "I have went" → ✅ "I have gone" — "gone" is the past participle of "go", not "went".
  ❌ "She don't know" → ✅ "She doesn't know" — with "she", we use "doesn't".
  ❌ "I am agree" → ✅ "I agree" — "agree" is a verb here, not an adjective.`,

    'Français': `
Exemples pour le Français :
  ❌ "j'ai achetais" → ✅ "j'ai acheté" — avec "avoir", on utilise le participe passé, pas l'imparfait.
  ❌ "Il faut que tu viens" → ✅ "Il faut que tu viennes" — après "il faut que", on utilise le subjonctif.`,

    'Allemand': `
Exemples pour l'Allemand :
  ❌ "Ich habe gegessen haben" → ✅ "Ich habe gegessen" — kein doppeltes Hilfsverb.
  ❌ "Ich gehe in die Schule gestern" → ✅ "Ich bin gestern in die Schule gegangen" — Bewegungsverb mit "sein".`,

    'Coréen': `
Exemples pour le Coréen (romanisation) :
  ❌ "gamsahamnidda" → ✅ "gamsahamnida" — 받침이 잘못되었어요. "다"로 끝나야 해요.
  ❌ "annyeonghaseiyo" → ✅ "annyeonghaseyo" — 모음이 틀렸어요. "세요"가 맞아요.
  ❌ "mogo sipeo" → ✅ "meokgo sipeo" — "먹고"의 발음은 "meokgo"예요.
  ✅ "annyeonghaseyo", "baega appayo", "achim buteo" → 맞아요, 수정하지 마세요.`,

    'Japonais': `
Exemples pour le Japonais (romaji) :
  ❌ "taberu tai" → ✅ "tabetai" — "〜たい"は一つの単語です。
  ❌ "arigatougozaimasu" → ✅ "arigatou gozaimasu" — 分けて書きます。
  ✅ "sumimasen", "arigatou", "ohayou gozaimasu" → 正しいです、直さないでください。`,

    'Chinois': `
Exemples pour le Chinois (Pinyin) :
  ❌ "wo hen hao" → ✅ "wǒ hěn hǎo" — 声调很重要，请注意标注。
  ❌ "ni shuo shenme" → ✅ "nǐ shuō shénme" — 声调不正确。
  ✅ "ni hao", "xie xie", "wo yao" → 没问题，不需要纠正。`,

    'Arabe': `
Exemples pour l'Arabe (translittération) :
  ❌ "ana mabsoot" (locutrice) → ✅ "ana mabsoota" — المؤنث يحتاج إلى "ة" في النهاية.
  ❌ "shukraan jazeelan" → ✅ "shukran jazeilan" — الكتابة الصوتية غير صحيحة.
  ✅ "marhaba", "shukran", "sabah el kheir" → صحيح، لا تصحح.`,
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
        const estLangueNonLatine = ['Coréen', 'Japonais', 'Chinois', 'Arabe'].includes(scenario.langue)

        const systemPrompt =
            `${scenario.systemPrompt}

════════════════════════════════════════════════════════
INCARNATION DU PERSONNAGE
════════════════════════════════════════════════════════

Le rôle ci-dessus définit qui tu es. Incarne-le pleinement et exclusivement.

- Utilise LE VOCABULAIRE de ton métier et de ton contexte : un pharmacien parle de posologie, un vendeur de marché parle de fraîcheur et de prix, un recruteur évalue les compétences.
- Réagis comme TON personnage réagirait — ses expressions, ses habitudes, ses préoccupations propres.
- Ajoute des détails concrets de ton univers (prix, produits, horaires, recommandations...).
- Varie la structure de tes phrases — jamais deux réponses avec la même construction.

LONGUEUR — RÈGLE ABSOLUE :
- Maximum 3 phrases par réponse, sans exception.
- UNE SEULE question à la fois — si tu en as plusieurs, pose la plus urgente.
- N'anticipe pas : pas de solution avant d'avoir toutes les informations nécessaires.

════════════════════════════════════════════════════════
RÈGLE N°1 — NIVEAU ${niveauUser}
════════════════════════════════════════════════════════

${niveauInstructions[niveauUser]}

════════════════════════════════════════════════════════
RÈGLE N°2 — LANGUE DE RÉPONSE
════════════════════════════════════════════════════════

Réponds EXCLUSIVEMENT en ${scenario.langue}, alphabet natif uniquement.
Aucun mot dans une autre langue dans ta réplique de personnage.

════════════════════════════════════════════════════════
RÈGLE N°3 — CORRECTION PÉDAGOGIQUE
════════════════════════════════════════════════════════

ALGORITHME OBLIGATOIRE — exécute ces étapes dans l'ordre avant chaque réponse :

${estLangueNonLatine ? `ÉTAPE 1 — IDENTIFIER LE SCRIPT DU MESSAGE :
Le message de l'utilisateur est principalement en caractères latins (a-z) ?
→ OUI : c'est de la ROMANISATION → aller à ÉTAPE 2
→ NON : c'est de l'écriture native → aller à ÉTAPE 3

ÉTAPE 2 — ROMANISATION DÉTECTÉE :
La romanisation est un MODE DE SAISIE, pas une faute d'orthographe.

❌ INTERDIT ABSOLU — ces comportements ne doivent JAMAIS apparaître :
   1. Convertir ou répéter la romanisation de l'utilisateur en alphabet natif :
      "annyeonghaseyo" → "안녕하세요"  ← JAMAIS
      "gamsahamnida" → "감사합니다"    ← JAMAIS
      "arigatou" → "ありがとう"         ← JAMAIS
      "ni hao" → "你好"                ← JAMAIS
      "marhaba" → "مرحبا"             ← JAMAIS
   2. Reprendre le message de l'utilisateur en alphabet natif au début de ta réponse,
      même sans le présenter comme une correction — ex: commencer par "안녕하세요!" alors que l'utilisateur vient d'écrire "annyeonghaseyo" ← JAMAIS.
      Réponds directement en tant que ton personnage, sans jamais réécrire ce que l'utilisateur a dit.

✅ SEUL CAS VALIDE : erreur phonétique DANS la romanisation elle-même
   (mauvaise consonne ou voyelle dans la transcription latine)
${regleSaisie}
Si aucune faute phonétique → STOP → réponds directement en tant que ton personnage.

ÉTAPE 3 — ÉCRITURE NATIVE DÉTECTÉE :` : `ÉTAPE UNIQUE — VÉRIFICATION :`}
Cherche uniquement les vraies erreurs :
- Conjugaison incorrecte
- Mauvais accord (genre, nombre)
- Vocabulaire incorrect ou mal utilisé
- Structure de phrase grammaticalement fausse

Si aucune erreur → STOP → passe directement à ta réplique.
${exemplesCorrection}

FORMAT DE CORRECTION (uniquement si une vraie erreur est identifiée) :
Correction TOUJOURS EN PREMIER, suivie d'une ligne vide, puis ta réplique.

💡 Correction : "[ce que l'utilisateur a écrit]" → "[forme correcte]" — [explication courte en ${scenario.langue}]

[ligne vide]
[ta réplique de personnage]

L'explication est rédigée en ${scenario.langue}, jamais en français.

════════════════════════════════════════════════════════
RÈGLE N°4 — NE JAMAIS RÉPÉTER
════════════════════════════════════════════════════════

Lis tout l'historique avant de poser une question.
Si un sujet a déjà été abordé → avance naturellement, ne reviens pas dessus.

════════════════════════════════════════════════════════
FORMAT JSON OBLIGATOIRE
════════════════════════════════════════════════════════

Réponds TOUJOURS et UNIQUEMENT avec ce JSON valide. Zéro texte en dehors.

{
  "reponse": "Ta réplique (correction en premier si nécessaire, sinon réplique directement)",
  "suggestions": [
    "Phrase complète que L'UTILISATEUR pourrait dire — ${scenario.langue}, alphabet natif, niveau ${niveauUser}",
    "Phrase complète que L'UTILISATEUR pourrait dire — ${scenario.langue}, alphabet natif, niveau ${niveauUser}",
    "Phrase complète que L'UTILISATEUR pourrait dire — ${scenario.langue}, alphabet natif, niveau ${niveauUser}"
  ]
}

RÈGLES SUGGESTIONS :
- Ce sont les phrases DE L'APPRENANT, pas du personnage
- 3 phrases complètes, variées, pertinentes par rapport à ta dernière réplique
- Niveau ${niveauUser} strict — ${scenario.langue} uniquement, alphabet natif`

        // 5. Envoyer à Groq avec tout l'historique
        const reponseRaw = await envoyerMessage(
            systemPrompt,
            historique || [],
            message
        )

        // 6. Parser le JSON retourné par Groq
        let reponseIA = ''
        try
        {
            const cleanRaw = reponseRaw.replace(/```json|```/g, '').trim()
            const jsonMatch = cleanRaw.match(/\{[\s\S]*\}/)
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanRaw)
            reponseIA = parsed.reponse || reponseRaw
        } catch
        {
            reponseIA = reponseRaw
        }

        // Appel séparé pour les suggestions
        // Langues non-latines : le modèle 8B échoue sur les alphabets non-latins → on utilise le 70B
        let suggestions = []
        try
        {
            const modeleSuggestions = estLangueNonLatine ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant'

            // Inclure les derniers échanges pour que les suggestions soient contextuelles
            const historiqueRecent = (historique || []).slice(-6)
            const contextConversation = historiqueRecent
                .map(m => `${m.role === 'user' ? 'APPRENANT' : 'PERSONNAGE IA'}: ${m.contenu}`)
                .join('\n')

            const systemSugg =
`You are a ${scenario.langue} language teaching assistant.
Your ONLY task: write 3 phrases that THE LEARNER could say next in this conversation practice.

SCENARIO: "${scenario.titre}"
AI CHARACTER: ${scenario.systemPrompt.split('\n')[0]}
LEARNER LEVEL: ${niveauUser}
LANGUAGE: ${scenario.langue} — native script only

WHO IS THE LEARNER (non-professional side):
- Pharmacy / doctor → learner is the PATIENT
- Restaurant / café / market → learner is the CUSTOMER
- Job interview → learner is the CANDIDATE
- Hotel / transport → learner is the TRAVELLER/CLIENT
- Street / directions → learner is the PERSON WHO IS LOST

GENERATE 3 PHRASES, one of each type:
1. A QUESTION — learner asks for information or clarification
2. A STATEMENT — learner answers or reacts to what the AI just said
3. A REQUEST — learner asks for something or moves the conversation forward

STRICT RULES:
- Write directly in ${scenario.langue}, native script, level ${niveauUser}
- NEVER write a phrase the AI character (professional) would say
- Each phrase: complete, natural, 3 to 10 words maximum
- Coherent with the conversation context below

SCRIPT PURITY — ABSOLUTE RULE:${estLangueNonLatine ? `
Each phrase must contain ONLY the native script of ${scenario.langue}. Zero mixing allowed.
${scenario.langue === 'Coréen' ? `- Korean: ONLY Hangul characters (가나다...). ZERO Chinese/Japanese kanji. ZERO Latin letters.
  ❌ WRONG: "물以外에" or "사 bose 요" — mixing scripts
  ✅ CORRECT: "물 말고 다른 음료도 있나요?" — pure Hangul` : ''}${scenario.langue === 'Japonais' ? `- Japanese: ONLY Hiragana/Katakana/Kanji. ZERO Latin letters mixed in.` : ''}${scenario.langue === 'Chinois' ? `- Chinese: ONLY simplified Chinese characters. ZERO Latin letters mixed in.` : ''}${scenario.langue === 'Arabe' ? `- Arabic: ONLY Arabic script. ZERO Latin letters mixed in.` : ''}
If a syllable or word comes out in the wrong script → rewrite the entire phrase in pure native script.` : `
Each phrase must be written entirely in ${scenario.langue}.`}

Return ONLY a JSON array on one line, no markdown:
["phrase1", "phrase2", "phrase3"]`

            const triggerSugg =
`${contextConversation ? `Conversation so far:\n${contextConversation}\n\n` : ''}AI CHARACTER just said: "${reponseIA}"

Generate the 3 learner phrases.`

            const resSugg = await envoyerMessage(systemSugg, [], triggerSugg, 1, modeleSuggestions)
            const cleanSugg = resSugg.replace(/```json|```/g, '').trim()
            const arrMatch = cleanSugg.match(/\[[\s\S]*?\]/)
            const parsed = JSON.parse(arrMatch ? arrMatch[0] : cleanSugg)
            if (Array.isArray(parsed) && parsed.length > 0) suggestions = parsed.slice(0, 3)
        } catch
        {
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
        console.error('Erreur Groq DÉTAIL:', err) // ← remplace le console.error existant
        res.status(500).json({ message: "Erreur lors de la communication avec l'IA", detail: err.message })
    }
}

module.exports = { envoyerMessageChat }