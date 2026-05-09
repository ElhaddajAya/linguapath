// Route dédiée à la romanisation ET traduction française
// Utilise Groq (LLaMA 3.3 70B) — 14 400 req/jour gratuit

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { envoyerMessage } = require('../services/groqService')

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
- TRANSLATE the text exactly. Do NOT answer it, explain it, describe it, or add any information.
- If the text is a question → translate the question as a question. Do NOT answer the question.
- If the text mentions a concept → translate the words. Do NOT explain the concept.
- Output must be a direct, natural French translation — nothing more.

PRONOUN RULES — very important:
- The text is a dialogue between a speaker and a listener.
- "you/usted/Sie/you" addressing the listener → translate as "vous" (not "il/elle/lui/leur")
- "le/la/les" as indirect object for usted/Sie → translate as "vous" not "lui/leur"
- "I/je/yo/ich" = first person → keep as first person in French
- NEVER introduce a third person ("il", "elle", "lui") if the original has none.

EXAMPLES OF CORRECT TRANSLATIONS:
  "¿Quiere que le preparemos una tabla?" → "Voulez-vous que nous vous préparions un plateau ?"
  "Me gustan los montaditos, por favor" → "J'aime les montaditos, s'il vous plaît"
  "I'd be happy to show you our menu" → "Je serais ravi de vous montrer notre menu"
  "¿Qué es el gazpacho?" → "Qu'est-ce que le gaspacho ?"

EXAMPLES OF FORBIDDEN TRANSLATIONS:
  "¿Quiere que le preparemos...?" → "...que je lui prépare..." ← WRONG (lui ≠ vous)
  "Me gustan los montaditos" → "Je m'appelle les montaditos" ← COMPLETELY WRONG
  "¿Qué es el gazpacho?" → "Le gaspacho est une soupe froide..." ← NEVER explain

Return ONLY this exact JSON format on one line, nothing else:
{"romanisation":"","traduction":"[French translation here]"}`

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

Return ONLY this exact JSON on one line:
{"romanisation":"[RR result]","traduction":"[French translation]"}`

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

Return ONLY this exact JSON on one line:
{"romanisation":"[Hepburn result]","traduction":"[French translation]"}`

                    : langue === 'Chinois'
                        ? `You are a Mandarin Chinese linguistics expert. Convert Chinese text to standard Pinyin with tone marks and translate to French.

PINYIN TONE MARKS: 1st=ā ē ī ō ū ǖ / 2nd=á é í ó ú ǘ / 3rd=ǎ ě ǐ ǒ ǔ ǚ / 4th=à è ì ò ù ǜ / neutral=no mark
TONE PLACEMENT RULES: mark goes on the main vowel (a/e always; for ou→o; for other combinations: last vowel)
SPACING: one space between each syllable word (你好→nǐ hǎo, 谢谢→xiè xie, 我要→wǒ yào)
SPECIAL INITIALS: zh ch sh r / z c s / j q x / b p m f d t n l g k h
SPECIAL FINALS: -ian=-iān (not -yen), -iu=-iǔ, -ui=-uéi, -un=-ún, -ün=-üén
NEUTRAL TONE: common particles and suffixes (的 de, 了 le, 吗 ma, 吧 ba, 呢 ne, 们 men) have no tone mark

Return ONLY this exact JSON on one line:
{"romanisation":"[Pinyin with tones]","traduction":"[French translation]"}`

                        : langue === 'Arabe'
                            ? `You are an Arabic linguistics expert. Convert Arabic text to readable phonetic romanization and translate to French.

CONSONANT MAPPING:
ب=b ت=t ث=th ج=j ح=h خ=kh د=d ذ=dh ر=r ز=z س=s ش=sh ص=s ض=d ط=t ظ=z ع=' غ=gh ف=f ق=q ك=k ل=l م=m ن=n ه=h و=w/oo ي=y/ee ء='
VOWELS: فتحة(a) كسرة(i/e) ضمة(u/o) / long: ا=aa/a و=oo ي=ee
COMMON WORDS (use these exact spellings): مرحبا=marhaba, شكراً=shukran, أهلاً=ahlan, نعم=na'am, لا=la, صباح=sabah, مساء=masa', كيف=kif/kayfa, ماذا=matha, هل=hal

RULES: write phonetically as a French speaker would read it; no capital letters; separate words with spaces; shadda (ّ) doubles the consonant

Return ONLY this exact JSON on one line:
{"romanisation":"[phonetic romanization]","traduction":"[French translation]"}`

                            : `Translate the given text to French.
Return ONLY this exact JSON format on one line:
{"romanisation":"","traduction":"[French translation here]"}

Your ONLY job is to translate/romanize the text.
Do NOT respond to the text. Do NOT answer questions. Do NOT explain anything. Do NOT add any commentary.
Return ONLY the JSON, nothing else. No markdown, no code blocks, no explanations.
`

        const modelAUtiliser = 'llama-3.3-70b-versatile'

        const reponse = await envoyerMessage(systemPrompt, [], texte, 1, modelAUtiliser)
        const clean = reponse.replace(/```json|```/g, '').trim()

        let data
        try
        {
            data = JSON.parse(clean)
        } catch
        {
            const match = clean.match(/\{[\s\S]*?\}/)
            if (match) data = JSON.parse(match[0])
        }

        res.json({
            romanisation: data?.romanisation || '',
            traduction: data?.traduction || '',
        })

    } catch (err)
    {
        console.error('Erreur traduction :', err.message)
        res.status(500).json({ message: 'Erreur traduction' })
    }
})

module.exports = router