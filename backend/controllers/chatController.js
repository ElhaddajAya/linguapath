// Gère l'envoi et la réception des messages dans une conversation.
// À chaque message, on envoie TOUT l'historique à OpenAI
// pour qu'il garde le contexte de la conversation.

const Scenario = require('../models/Scenario')

const VALID_ESCAPES = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'])
function repairJson(str)
{
    let out = ''
    let inStr = false
    for (let i = 0; i < str.length; i++)
    {
        const c = str[i]
        if (c === '\\' && inStr)
        {
            const next = str[i + 1]
            if (VALID_ESCAPES.has(next))
            {
                out += c + next
                i++
            } else
            {
                out += '\\\\'
            }
            continue
        }
        if (c === '"') inStr = !inStr
        else if (inStr && c === '\n') { out += '\\n'; continue }
        else if (inStr && c === '\r') { out += '\\r'; continue }
        else if (inStr && c === '\t') { out += '\\t'; continue }
        out += c
    }
    return out
}

const { envoyerMessage } = require('../services/openaiService')

// ──────────────────────────────────────────────────────────────
// Instructions de niveau CECRL — vocabulaire ET longueur de réponse
// ──────────────────────────────────────────────────────────────
const niveauInstructions = {
    'A1': `NIVEAU A1 — DÉBUTANT ABSOLU :
✅ AUTORISÉ : phrases 3-5 mots MAX, vocabulaire basique du quotidien, présent simple uniquement, une seule question simple.
❌ INTERDIT : conditionnel, subjonctif, imparfait, futur, passé composé, expressions idiomatiques, mots rares, phrases longues.
📏 LONGUEUR RÉPONSE : 1-2 phrases très courtes. Jamais plus de 15 mots au total.`,

    'A2': `NIVEAU A2 — ÉLÉMENTAIRE :
✅ AUTORISÉ : phrases max 10 mots, vocabulaire quotidien simple, présent + passé composé + futur proche, connecteurs basiques (and, but, because).
❌ INTERDIT : subjonctif, conditionnel, imparfait narratif, vocabulaire spécialisé ou soutenu, phrases longues.
📏 LONGUEUR RÉPONSE : 2 phrases courtes maximum. Jamais plus de 25 mots au total.`,

    'B1': `NIVEAU B1 — INTERMÉDIAIRE :
✅ AUTORISÉ : phrases bien construites, vocabulaire courant naturel, temps courants + conditionnel présent, expressions idiomatiques très fréquentes.
❌ INTERDIT : vocabulaire littéraire, technique ou médical rare, structures grammaticales rares, jargon de spécialité.
📏 LONGUEUR RÉPONSE : 2-3 phrases naturelles. Jamais plus de 40 mots au total.`,

    'B2': `NIVEAU B2 — INTERMÉDIAIRE AVANCÉ :
✅ AUTORISÉ : phrases variées et naturelles, vocabulaire riche MAIS COURANT (pas de jargon rare), tous les temps courants, expressions idiomatiques naturelles.
❌ INTERDIT : vocabulaire rare ou archaïque, jargon médical/technique non expliqué (ex: "debilitating", "alleviate" sans contexte clair), registre littéraire.
📏 LONGUEUR RÉPONSE : 2-3 phrases. Chaque phrase : max 20 mots. Total : max 50 mots.`,

    'C1': `NIVEAU C1 — AVANCÉ :
✅ Langue naturelle et fluide. Vocabulaire riche et précis. Toutes les structures. Expressions idiomatiques. Registres variés.
📏 LONGUEUR RÉPONSE : 2-3 phrases naturelles. Max 60 mots.`,

    'C2': `NIVEAU C2 — MAÎTRISE :
✅ Aucune restriction. Locuteur natif cultivé. Tous registres, toutes nuances.
📏 LONGUEUR RÉPONSE : 2-3 phrases. Max 70 mots.`,
}

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

const exemplesCorrectionParLangue = {
    'Espagnol': `
Exemples pour l'Espagnol :
  ❌ "quierro" → ✅ "quiero" — "querer" se escribe con una sola "r".
  ❌ "Donde estas" → ✅ "¿Dónde está?" — "dónde" lleva tilde y "está" es 3ª persona.
  ❌ "Quiero un mesa" → ✅ "Quiero una mesa" — "mesa" es femenino.`,

    'Anglais': `
Exemples pour l'Anglais :
  ❌ "moorning" → ✅ "morning" — only one 'o'.
  ❌ "stomache" → ✅ "stomach" — no 'e' at the end.
  ❌ "yestarday" → ✅ "yesterday" — spelling error.
  ❌ "beleive" → ✅ "believe" — 'ie' not 'ei'.
  ❌ "I have went" → ✅ "I have gone" — past participle of "go".
  ❌ "She don't know" → ✅ "She doesn't know" — 3rd person singular.
  ❌ "I am agree" → ✅ "I agree" — "agree" is a verb, not an adjective.
  ❌ "nedd" → ✅ "need" — typo, missing letter.
  ❌ "bit" (meaning "but") → ✅ "but" — typo, wrong letter.
  ❌ "thier" → ✅ "their" — spelling error.
  ❌ "i nedd" → ✅ "I need" — "i" must be capitalised + spelling error.
  NOTE: keyboard typos (wrong/missing letter) are ALWAYS spelling errors — correct them even in informal messages.`,

    'Français': `
Exemples pour le Français :
  ❌ "j'ai achetais" → ✅ "j'ai acheté" — participe passé avec "avoir".
  ❌ "Il faut que tu viens" → ✅ "Il faut que tu viennes" — subjonctif après "il faut que".`,

    'Allemand': `
Exemples pour l'Allemand :
  ❌ "Ich habe gegessen haben" → ✅ "Ich habe gegessen" — kein doppeltes Hilfsverb.
  ❌ "Ich gehe in die Schule gestern" → ✅ "Ich bin gestern in die Schule gegangen".`,

    'Coréen': `
Exemples pour le Coréen (romanisation) :
  ❌ "gamsahamnidda" → ✅ "gamsahamnida" — "다"로 끝나야 해요.
  ❌ "annyeonghaseiyo" → ✅ "annyeonghaseyo" — "세요"가 맞아요.
  ✅ "annyeonghaseyo", "baega appayo" → 맞아요, 수정하지 마세요.`,

    'Japonais': `
Exemples pour le Japonais (romaji) :
  ❌ "taberu tai" → ✅ "tabetai" — "〜たい"は一つの単語です。
  ✅ "sumimasen", "arigatou" → 正しいです、直さないでください。`,

    'Chinois': `
Exemples pour le Chinois (Pinyin) :
  ❌ "wo hen hao" → ✅ "wǒ hěn hǎo" — 声调很重要。
  ✅ "ni hao", "xie xie" → 没问题，不需要纠正。`,

    'Arabe': `
Exemples pour l'Arabe (translittération) :
  ❌ "ana mabsoot" (locutrice) → ✅ "ana mabsoota" — المؤنث يحتاج إلى "ة".
  ✅ "marhaba", "shukran" → صحيح، لا تصحح.`,
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
        const scenario = await Scenario.findById(scenarioId)
        if (!scenario)
        {
            return res.status(404).json({ message: 'Scénario introuvable' })
        }

        const user = req.user
        const langueUser = user.langues?.find(l => l.langue === scenario.langue)
        const niveauUser = langueUser?.niveau || 'A1'
        const regleSaisie = reglesSaisie[scenario.langue] || ''
        const exemplesCorrection = exemplesCorrectionParLangue[scenario.langue] || ''
        const estLangueNonLatine = ['Coréen', 'Japonais', 'Chinois', 'Arabe'].includes(scenario.langue)

        const systemPrompt =
            `${scenario.systemPrompt}

════════════════════════════════════════════════════════
TON DOUBLE RÔLE
════════════════════════════════════════════════════════

RÔLE 1 — TUTEUR : Analyse chaque message et corrige les vraies erreurs.
RÔLE 2 — PERSONNAGE : Continue la scène après la correction.

════════════════════════════════════════════════════════
ÉTAPE 1 — CORRECTION (OBLIGATOIRE AVANT TOUT)
════════════════════════════════════════════════════════

${estLangueNonLatine ? `Le message est en romanisation (lettres a-z) ou en alphabet natif ?
→ ROMANISATION : cherche uniquement les erreurs phonétiques (mauvaise consonne/voyelle).
   ❌ JAMAIS convertir la romanisation en alphabet natif.
   ❌ JAMAIS répéter le message de l'user en alphabet natif dans ta réponse.
${regleSaisie}
→ ALPHABET NATIF : cherche toutes les erreurs orthographiques et grammaticales.` :
                `Cherche les erreurs réelles dans le message.`}

QU'EST-CE QU'UNE VRAIE ERREUR ? — RÈGLE FONDAMENTALE

✅ TOUJOURS CORRIGER — sans exception :
  - Faute d'orthographe : "moorning" → "morning", "stomache" → "stomach"
  - Conjugaison incorrecte : "give" → "gave", "I have went" → "I have gone", "yesterday I go" → "I went"
  - Accord incorrect : "She don't" → "She doesn't", "un mesa" → "una mesa"
  - Majuscule manquante sur pronom : "i am" → "I am"
  - Mot grammaticalement mal utilisé

❌ NE JAMAIS CORRIGER — laisser l'apprenant s'exprimer librement :
  - Style personnel, registre informel, expressions idiomatiques
  - Phrases courtes ou elliptiques naturelles à l'oral
  - Choix de mots différent mais grammaticalement correct
  - Toute phrase qui est grammaticalement et orthographiquement correcte

RÈGLE SIMPLE : "Est-ce que cette phrase contient une faute de grammaire ou d'orthographe ?"
→ OUI → corriger TOUJOURS, même si la phrase est compréhensible.
→ NON → ne jamais corriger, même si tu préfères une autre formulation.

EXEMPLES CONCRETS :
  ❌ "my friend just give birth" → ✅ "gave" — past tense of "give". CORRIGER.
  ❌ "yesterday I go to the store" → ✅ "went" — past tense required. CORRIGER.
  ❌ "she don't like it" → ✅ "doesn't" — 3rd person singular. CORRIGER.
  ❌ "i nedd your help" → ✅ "I need" — 'i' must be 'I' + 'nedd' is a typo. CORRIGER.
  ❌ "i'd like to buy her a gift bit i'm not sure" → ✅ "but" — 'bit' is a typo for 'but'. CORRIGER.
  ✅ "yeah I wanna get something nice" → correct informal English. NE PAS CORRIGER.
  ✅ "kinda looking for baby stuff" → correct informal English. NE PAS CORRIGER.
  ✅ "I have trouble finding the right size" → grammatically correct. NE PAS CORRIGER.
${exemplesCorrection}

FORMAT CORRECTION — COURT ET PRÉCIS :
💡 Correction : "[erreur]" → "[correct]" — [explication max 8 mots en ${scenario.langue}]

❌ INTERDIT : explication longue avec "although", "whereas", "in this context", etc.
❌ INTERDIT : corriger une phrase correcte sous prétexte qu'une formulation "plus élégante" existe.
❌ INTERDIT : répondre avec seulement la correction sans continuer la scène.

RÈGLE SILENCE ABSOLUE : si aucune vraie erreur →
Ta réponse COMMENCE DIRECTEMENT par la réplique du personnage. Aucun mot avant.
❌ JAMAIS écrire : "No correction needed.", "No error.", "Correct!", "Well done.", ou TOUTE phrase similaire.
❌ JAMAIS écrire : "Correction : None.", "Correction : Aucune.", "Aucune correction.", "Aucune faute.", ou TOUTE phrase similaire.
❌ Même avec "💡" devant — si il n'y a PAS d'erreur, RIEN ne précède ta réplique.

EXEMPLE EXACT — message sans erreur : "About three days now."
✅ TA RÉPONSE (correcte) : "Is the cough painful or just annoying?"
❌ TA RÉPONSE (interdite) : "💡 No correction needed.\n\nIs the cough painful or just annoying?"
❌ TA RÉPONSE (interdite) : "No correction needed. Is the cough painful or just annoying?"

La SEULE chose qui doit apparaître avant ta réplique c'est "💡 Correction : ..." ET SEULEMENT s'il y a une vraie erreur.

════════════════════════════════════════════════════════
ÉTAPE 2 — RÉPLIQUE DU PERSONNAGE
════════════════════════════════════════════════════════

- Reste dans ton rôle. Vocabulaire naturel de ton métier.
- UNE SEULE question à la fois.
- Ne reviens pas sur un sujet déjà abordé dans l'historique.
- MÉMOIRE OBLIGATOIRE : relis TOUT l'historique depuis le début avant chaque réponse.
- Mémorise les faits importants dits par l'utilisateur : âge, taille, couleur, destination, contexte (cadeau, allergie, bébé...).
- Ces faits restent vrais pour TOUTE la conversation — ne les oublie jamais.
- AVANT de proposer quelque chose, vérifie : est-ce logique avec TOUS les faits connus ?
- ❌ INTERDIT : proposer un cabine d'essayage si le produit est pour un bébé.
- ❌ INTERDIT : proposer une taille adulte si l'utilisateur a dit "c'est pour un enfant de 5 ans".
- ❌ INTERDIT : oublier une information donnée plus tôt dans la conversation.
- CONTEXTE OBLIGATOIRE : si l'utilisateur a donné des informations importantes (ex: "c'est pour un bébé", "je suis allergique", "c'est un cadeau"), tu DOIS en tenir compte dans TOUTES tes réponses suivantes.
- EXEMPLE D'ERREUR INTERDITE : l'utilisateur dit "c'est pour le bébé de mon amie" → tu NE DOIS PAS dire "voulez-vous l'essayer en cabine". Le contexte rend cette phrase absurde.
- Si tu proposes quelque chose, vérifie d'abord que c'est logique par rapport au contexte entier de la conversation.

════════════════════════════════════════════════════════
RÈGLE NIVEAU ${niveauUser} — VOCABULAIRE ET LONGUEUR
════════════════════════════════════════════════════════

${niveauInstructions[niveauUser]}

VOCABULAIRE ADAPTÉ AU NIVEAU — exemples concrets :
❌ "debilitating", "alleviate", "rule out underlying conditions" → trop avancé pour B2 et moins
✅ "really painful", "help with the pain", "check if something is wrong" → naturel pour B2
❌ "I'd like to examine further to rule out any underlying conditions" → trop formel, trop long
✅ "Let me take a closer look. Where exactly does it hurt?" → naturel, court, efficace

════════════════════════════════════════════════════════
RÈGLE LANGUE
════════════════════════════════════════════════════════

Réplique : EXCLUSIVEMENT en ${scenario.langue}, alphabet natif.
Explication dans 💡 : en ${scenario.langue}, jamais en français.

════════════════════════════════════════════════════════
FORMAT JSON — OBLIGATOIRE
════════════════════════════════════════════════════════

Réponds UNIQUEMENT avec ce JSON. Zéro texte en dehors.

{
  "reponse": "💡 Correction : ... (seulement si vraie erreur) \n\n [réplique personnage courte]",
  "suggestions": [
    "Phrase DE L'APPRENANT — ${scenario.langue}, alphabet natif, niveau ${niveauUser}, 5-8 mots",
    "Phrase DE L'APPRENANT — ${scenario.langue}, alphabet natif, niveau ${niveauUser}, 5-8 mots",
    "Phrase DE L'APPRENANT — ${scenario.langue}, alphabet natif, niveau ${niveauUser}, 5-8 mots"
  ]
}`

        const reponseRaw = await envoyerMessage(
            systemPrompt,
            historique || [],
            message
        )

        let reponseIA = ''
        try
        {
            const cleanRaw = reponseRaw.replace(/```json|```/g, '').trim()
            const jsonMatch = cleanRaw.match(/\{[\s\S]*\}/)
            const jsonStr = jsonMatch ? jsonMatch[0] : cleanRaw
            let parsed
            try { parsed = JSON.parse(jsonStr) }
            catch { parsed = JSON.parse(repairJson(jsonStr)) }
            if (parsed.reponse)
            {
                reponseIA = parsed.reponse
            }
            else if (jsonMatch)
            {
                // Le modèle a mis le texte AVANT le bloc JSON — on l'extrait
                const textAvant = cleanRaw.slice(0, cleanRaw.indexOf(jsonMatch[0])).trim()
                reponseIA = textAvant || reponseRaw
            }
            else
            {
                reponseIA = reponseRaw
            }
        } catch { reponseIA = reponseRaw }

        // ── Filet de sécurité — supprime les variantes "aucune correction" même si le modèle les écrit ──
        reponseIA = reponseIA
            .replace(/^💡\s*(no correction needed\.?|no error[s]?\.?|no error found\.?|your sentence is correct\.?|well done\.?|good job\.?|that's correct\.?|no mistakes?\.?)\s*\n*/gi, '')
            .replace(/^(no correction needed\.?|no error[s]?\.?|your sentence is correct\.?|well done\.?|that's correct\.?)\s*\n*/gi, '')
            .replace(/^💡\s*correction\s*:\s*(none\.?|aucune\.?|aucune faute\.?|aucune erreur\.?|pas d['']erreur\.?|pas de faute\.?|no correction\.?)\s*\n*/gi, '')
            .replace(/^correction\s*:\s*(none\.?|aucune\.?|aucune faute\.?|aucune erreur\.?)\s*\n*/gi, '')
            .trim()

        let suggestions = []
        try
        {
            const langueEnAnglais = {
                'Anglais': 'English', 'Espagnol': 'Spanish', 'Français': 'French',
                'Allemand': 'German', 'Coréen': 'Korean', 'Japonais': 'Japanese',
                'Chinois': 'Chinese (Mandarin)', 'Arabe': 'Arabic'
            }
            const languePrompt = langueEnAnglais[scenario.langue] || scenario.langue

            const historiqueRecent = (historique || [])
            const contextConversation = historiqueRecent
                .map(m => `${m.role === 'user' ? 'LEARNER' : 'AI CHARACTER'}: ${m.contenu}`)
                .join('\n')

            const systemSugg =
                `You are helping a ${languePrompt} language learner (level ${niveauUser}) practice a conversation.
Write 3 short, natural replies the LEARNER could say next — directly responding to the AI's last message.

GRAMMAR — MANDATORY :
Every suggestion MUST be grammatically correct in ${languePrompt}.
Before including a suggestion, verify: "Is this phrase grammatically correct?"
→ NO → rewrite it correctly before including it.
❌ "No never had." → incomplete/incorrect
❌ "I not understand." → incorrect
✅ "No, I've never had any." → correct
✅ "I don't understand that." → correct

RULES :
- ALL phrases in ${languePrompt} native script only — NEVER in French
- 5 to 8 words each — short and natural, not textbook sentences
- Level ${niveauUser}: ${['A1', 'A2'].includes(niveauUser) ? 'very simple, common words only' : ['B1', 'B2'].includes(niveauUser) ? 'natural everyday vocabulary' : 'rich natural language'}
- NOT phrases the doctor/waiter/character would say — only the LEARNER
${estLangueNonLatine ? `- Native script ONLY. Zero Latin letters mixed in.` : ''}

Return ONLY a JSON array: ["phrase1", "phrase2", "phrase3"]`

            const triggerSugg = `${contextConversation ? `HISTORY:\n${contextConversation}\n\n` : ''}AI last message: "${reponseIA}"\n\nWrite 3 learner replies.`

            const resSugg = await envoyerMessage(systemSugg, [], triggerSugg)
            const cleanSugg = resSugg.replace(/```json|```/g, '').trim()
            const arrMatch = cleanSugg.match(/\[[\s\S]*?\]/)
            const parsed = JSON.parse(arrMatch ? arrMatch[0] : cleanSugg)
            if (Array.isArray(parsed) && parsed.length > 0) suggestions = parsed.slice(0, 3)
        } catch { suggestions = [] }

        res.json({
            reponse: reponseIA,
            suggestions,
            nouveauMessage: { role: 'assistant', contenu: reponseIA }
        })

    } catch (err)
    {
        console.error('Erreur IA :', err.message)
        res.status(500).json({ message: "Erreur lors de la communication avec l'IA", detail: err.message })
    }
}

module.exports = { envoyerMessageChat }