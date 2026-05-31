// Route dédiée à la romanisation ET traduction française
// Utilise Groq (LLaMA 3.3 70B) — 14 400 req/jour gratuit

const express = require('express')

// Répare le JSON malformé que les LLMs produisent parfois :
// - vrais sauts de ligne à l'intérieur des strings → \n
// - séquences d'échappement invalides (ex: \→, \—) → backslash doublé
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
                // Séquence d'échappement valide — on la garde telle quelle
                out += c + next
                i++
            } else
            {
                // Mauvais caractère échappé (ex: \→, \—) — on échappe le backslash
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
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { envoyerMessage } = require('../services/openaiService')

router.post('/', protect, async (req, res) =>
{
    const { texte, langue } = req.body
    if (!texte) return res.status(400).json({ message: 'texte requis' })

    const LANGUES_LATINES = ['Anglais', 'Espagnol', 'Français', 'Allemand']
    const estLatine = langue && LANGUES_LATINES.includes(langue)

    try
    {
        // Pour les langues latines : traduction uniquement, pas de romanisation
        // Pour les langues non-latines : romanisation stricte + traduction
        const systemPrompt = estLatine
            ? `You are a professional French translator. Your ONLY job is to translate text into French.

CRITICAL RULES:
- TRANSLATE the ENTIRE text from first word to last word. NEVER stop halfway. NEVER skip any paragraph.
- If the text has multiple paragraphs → translate ALL of them, in order, separated by a blank line.
- If a paragraph is a question → translate the question as a question. Do NOT answer it.
- Lines starting with "💡 Correction :" are grammar corrections → translate the ENTIRE line including the explanation after the dash (—).
- Do NOT answer, explain, describe, or add any information beyond the translation.

PRONOUN RULES — very important:
- The text is a dialogue between a speaker and a listener.
- "you/usted/Sie/you" addressing the listener → translate as "vous" (not "il/elle/lui/leur")
- "le/la/les" as indirect object for usted/Sie → translate as "vous" not "lui/leur"
- "I/je/yo/ich" = first person → keep as first person in French
- NEVER introduce a third person ("il", "elle", "lui") if the original has none.

EXAMPLE — input with correction + character response:
INPUT:
💡 Correction : "Ive" → "I've" — "I've" is a contraction of "I have".

How long have you been experiencing these symptoms?

CORRECT OUTPUT (translate EVERYTHING):
💡 Correction : « Ive » → « I've » — « I've » est une contraction de « I have ».

Depuis combien de temps ressentez-vous ces symptômes ?

EXAMPLES OF CORRECT TRANSLATIONS:
  "¿Quiere que le preparemos una tabla?" → "Voulez-vous que nous vous préparions un plateau ?"
  "I'd be happy to show you our menu" → "Je serais ravi de vous montrer notre menu"

EXAMPLES OF FORBIDDEN TRANSLATIONS:
  "¿Quiere que le preparemos...?" → "...que je lui prépare..." ← WRONG (lui ≠ vous)
  Stopping after the 💡 Correction line ← FORBIDDEN — translate ALL paragraphs
  "¿Qué es el gazpacho?" → "Le gaspacho est une soupe froide..." ← NEVER explain

Return ONLY this exact JSON format on one line, nothing else:
{"romanisation":"","traduction":"FRENCH_TRANSLATION_HERE"}`

            : langue === 'Coréen'
                ? `You are a Korean linguistics expert. Convert Korean text to Revised Romanization of Korean (RR / 국어의 로마자 표기법) and translate to French.

CONSONANTS — initial position: ㄱ=g ㄴ=n ㄷ=d ㄹ=r ㅁ=m ㅂ=b ㅅ=s ㅇ=(silent) ㅈ=j ㅊ=ch ㅋ=k ㅌ=t ㅍ=p ㅎ=h
CONSONANTS — final position (받침): ㄱ=k ㄴ=n ㄷ=t ㄹ=l ㅁ=m ㅂ=p ㅅ=t ㅇ=ng ㅊ=t ㅋ=k ㅌ=t ㅍ=p ㅎ=t
DOUBLE CONSONANTS: ㄲ=kk ㄸ=tt ㅃ=pp ㅆ=ss ㅉ=jj
VOWELS: ㅏ=a ㅐ=ae ㅑ=ya ㅒ=yae ㅓ=eo ㅔ=e ㅕ=yeo ㅖ=ye ㅗ=o ㅘ=wa ㅙ=wae ㅚ=oe ㅛ=yo ㅜ=u ㅝ=wo ㅞ=we ㅟ=wi ㅠ=yu ㅡ=eu ㅢ=ui ㅣ=i

CRITICAL PHONOLOGICAL RULES (apply in this order):
1. LIAISON — final consonant + syllable starting with ㅇ (silent): consonant shifts to next syllable
   약을→yageul (not yak-eul), 음악→eumak, 학원→hagwon, 있어요→isseoyo
2. ㄹ — before vowel=r, before consonant or at end=l, between vowels=ll
   달→dal, 달라→dalla, 물→mul, 물이→muri
3. NASALISATION — ㄱ+ㄴ/ㅁ→ng, ㄷ+ㄴ/ㅁ→n, ㅂ+ㄴ/ㅁ→m
   학문→hangmun, 닫는→dannneun, 합니다→hamnida
4. ㄴ+ㄹ or ㄹ+ㄴ → ll: 신라→Silla, 천리→cheolli
5. ㅎ before ㄱ/ㄷ/ㅂ/ㅈ → k/t/p/ch (aspiration): 좋다→jota, 많다→manta
6. ASSIMILATION of ㄱ/ㄷ/ㅂ before ㄴ/ㅁ: 먹는→meongneun, 국민→gungmin

Translate the ENTIRE input — ALL paragraphs from first to last. NEVER stop after the first paragraph.

💡 CORRECTION LINES — mandatory rule :
Lines starting with "💡 Correction :" MUST be translated to French like this :
  INPUT  : 💡 Correction : "chajgoisseoyo" → "chajgo isseoyo" — "있어요"가 맞아요.
  OUTPUT : 💡 Correction : "chajgoisseoyo" → "chajgo isseoyo" — « isseoyo » est la bonne orthographe.
  INPUT  : 💡 Correction : "salkkeyo" → "살게요" — "살게요"가 맞아요.
  OUTPUT : 💡 Correction : "salkkeyo" → "살게요" — « salgeyo » est la forme correcte.
Rule : keep "💡 Correction : X → Y —" exactly as-is, translate ONLY the explanation after "—" into French.

Return ONLY this exact JSON on one line:
{"romanisation":"RR_RESULT","traduction":"FRENCH_TRANSLATION_HERE"}`

                : langue === 'Japonais'
                    ? `You are a Japanese linguistics expert. Convert Japanese text to standard Hepburn romanization and translate to French.

STANDARD HEPBURN RULES:
- Basic: a i u e o / ka ki ku ke ko / sa shi su se so / ta chi tsu te to / na ni nu ne no / ha hi fu he ho / ma mi mu me mo / ya yu yo / ra ri ru re ro / wa n
- Voiced: ga gi gu ge go / za ji zu ze zo / da (di=ji, du=zu) de do / ba bi bu be bo / pa pi pu pe po
- っ/ッ → double the NEXT consonant: 学校→gakkou, 切手→kitte, 雑誌→zasshi, 一本→ippon
- Long vowels: おう/おお→ō (or ou), うう/ウウ→ū (or uu) — use macrons ō ū
- PARTICLES: は→wa, を→o, へ→e (always, regardless of kana reading)
- ん/ン: →n normally; →m before b/p/m (三味線→shamisen); add apostrophe before vowel/n (金一→kin'ichi)
- ぢ=ji, づ=zu (same as じ/ず in modern usage)

Translate the ENTIRE input — ALL paragraphs from first to last. NEVER stop after the first paragraph.

💡 CORRECTION LINES — mandatory rule :
Lines starting with "💡 Correction :" → keep "💡 Correction : X → Y —" exactly as-is,
translate ONLY the explanation after "—" into French.
  INPUT  : 💡 Correction : "taberu tai" → "tabetai" — "〜たい"は一つの単語です。
  OUTPUT : 💡 Correction : "taberu tai" → "tabetai" — «〜たい » est un seul mot.

Return ONLY this exact JSON on one line:
{"romanisation":"HEPBURN_RESULT","traduction":"FRENCH_TRANSLATION_HERE"}`

                    : langue === 'Chinois'
                        ? `You are a Mandarin Chinese linguistics expert. Convert Chinese text to standard Pinyin with tone marks and translate to French.

PINYIN TONE MARKS: 1st=ā ē ī ō ū ǖ / 2nd=á é í ó ú ǘ / 3rd=ǎ ě ǐ ǒ ǔ ǚ / 4th=à è ì ò ù ǜ / neutral=no mark
TONE PLACEMENT RULES: mark goes on the main vowel (a/e always; for ou→o; for other combinations: last vowel)
SPACING: one space between each syllable word (你好→nǐ hǎo, 谢谢→xiè xie, 我要→wǒ yào)
SPECIAL INITIALS: zh ch sh r / z c s / j q x / b p m f d t n l g k h
SPECIAL FINALS: -ian=-iān (not -yen), -iu=-iǔ, -ui=-uéi, -un=-ún, -ün=-üén
NEUTRAL TONE: common particles and suffixes (的 de, 了 le, 吗 ma, 吧 ba, 呢 ne, 们 men) have no tone mark

Translate the ENTIRE input — ALL paragraphs from first to last. NEVER stop after the first paragraph.

💡 CORRECTION LINES — mandatory rule :
Lines starting with "💡 Correction :" → keep "💡 Correction : X → Y —" exactly as-is,
translate ONLY the explanation after "—" into French.

Return ONLY this exact JSON on one line:
{"romanisation":"PINYIN_RESULT","traduction":"FRENCH_TRANSLATION_HERE"}`

                        : langue === 'Arabe'
                            ? `You are an Arabic linguistics expert. Convert Arabic text to readable phonetic romanization and translate to French.

CONSONANT MAPPING:
ب=b ت=t ث=th ج=j ح=h خ=kh د=d ذ=dh ر=r ز=z س=s ش=sh ص=s ض=d ط=t ظ=z ع=' غ=gh ف=f ق=q ك=k ل=l م=m ن=n ه=h و=w/oo ي=y/ee ء='
VOWELS: فتحة(a) كسرة(i/e) ضمة(u/o) / long: ا=aa/a و=oo ي=ee
COMMON WORDS (use these exact spellings): مرحبا=marhaba, شكراً=shukran, أهلاً=ahlan, نعم=na'am, لا=la, صباح=sabah, مساء=masa', كيف=kif/kayfa, ماذا=matha, هل=hal

RULES: write phonetically as a French speaker would read it; no capital letters; separate words with spaces; shadda (ّ) doubles the consonant

Translate the ENTIRE input — ALL paragraphs from first to last. NEVER stop after the first paragraph.

💡 CORRECTION LINES — mandatory rule :
Lines starting with "💡 Correction :" → keep "💡 Correction : X → Y —" exactly as-is,
translate ONLY the explanation after "—" into French.

Return ONLY this exact JSON on one line:
{"romanisation":"PHONETIC_RESULT","traduction":"FRENCH_TRANSLATION_HERE"}`

                            : `Translate the given text to French.
Return ONLY this exact JSON format on one line:
{"romanisation":"","traduction":"FRENCH_TRANSLATION_HERE"}

Your ONLY job is to translate/romanize the entire text from first to last word. NEVER stop halfway.
Do NOT respond to the text. Translate questions as questions. Do NOT explain anything.
Lines starting with "💡 Correction :" → keep the format, translate the explanation after the dash (—) into French.
Return ONLY the JSON, nothing else. No markdown, no code blocks, no explanations.
`

        const modelAUtiliser = 'gpt-4o-mini'

        const reponse = await envoyerMessage(systemPrompt, [], texte, 1, modelAUtiliser)
        const clean = reponse.replace(/```json|```/g, '').trim()

        let data
        try
        {
            data = JSON.parse(clean)
        } catch
        {
            const jsonStr = clean.match(/\{[\s\S]*?\}/)?.[0] || clean
            data = JSON.parse(repairJson(jsonStr))
        }

        const decodeHtml = (str) => str
            .replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
            .replace(/^\[|\]$/g, '').trim()

        let traduction = decodeHtml(data?.traduction || '')
        // Écarte le placeholder non remplacé ou les traductions hallucinées trop longues
        const PLACEHOLDERS = ['FRENCH_TRANSLATION_HERE', 'RR_RESULT', 'HEPBURN_RESULT', 'PINYIN_RESULT', 'PHONETIC_RESULT']
        if (PLACEHOLDERS.includes(traduction)) traduction = ''
        const inputMots = texte.trim().split(/\s+/).length
        const outputMots = traduction.split(/\s+/).length
        if (outputMots > inputMots * 5) traduction = ''

        let romanisation = decodeHtml(data?.romanisation || '')
        if (PLACEHOLDERS.includes(romanisation)) romanisation = ''

        res.json({ romanisation, traduction })

    } catch (err)
    {
        console.error('Erreur traduction :', err.message)
        res.status(500).json({ message: 'Erreur traduction' })
    }
})

module.exports = router