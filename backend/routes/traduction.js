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
            ? `You are a professional French translator.
Translate the given text into natural French.
Return ONLY this exact JSON format on one line, nothing else:
{"romanisation":"","traduction":"[French translation here]"}`

            : langue === 'Coréen'
                ? `You are a Korean language expert specializing in romanization.
Convert the Korean text to Revised Romanization of Korean (국어의 로마자 표기법).
Rules:
- ㄱ=g/k, ㄴ=n, ㄷ=d/t, ㄹ=r/l, ㅁ=m, ㅂ=b/p, ㅅ=s, ㅇ=ng, ㅈ=j, ㅊ=ch, ㅋ=k, ㅌ=t, ㅍ=p, ㅎ=h
- ㅏ=a, ㅐ=ae, ㅑ=ya, ㅒ=yae, ㅓ=eo, ㅔ=e, ㅕ=yeo, ㅖ=ye, ㅗ=o, ㅘ=wa, ㅙ=wae, ㅚ=oe, ㅛ=yo, ㅜ=u, ㅝ=wo, ㅞ=we, ㅟ=wi, ㅠ=yu, ㅡ=eu, ㅢ=ui, ㅣ=i
Also provide a natural French translation.
Return ONLY this exact JSON format on one line:
{"romanisation":"[Revised Romanization here]","traduction":"[French translation here]"}`

                : langue === 'Japonais'
                    ? `You are a Japanese language expert specializing in romanization.
Convert the Japanese text to Hepburn romanization.
Rules: use standard Hepburn (e.g., ありがとう→arigatō, すみません→sumimasen, は→wa as topic marker, を→o as object marker)
Also provide a natural French translation.
Return ONLY this exact JSON format on one line:
{"romanisation":"[Hepburn romanization here]","traduction":"[French translation here]"}`

                    : langue === 'Chinois'
                        ? `You are a Mandarin Chinese language expert specializing in Pinyin romanization.
Convert the Chinese text to standard Pinyin with tone marks.
Rules: use proper tone marks (ā á ǎ à, ē é ě è, etc.)
Also provide a natural French translation.
Return ONLY this exact JSON format on one line:
{"romanisation":"[Pinyin with tones here]","traduction":"[French translation here]"}`

                        : langue === 'Arabe'
                            ? `You are an Arabic language expert specializing in romanization.
Convert the Arabic text to simple phonetic romanization in Latin alphabet.
Rules: use simple readable phonetics (e.g., مرحبا→marhaba, شكراً→shukran)
Also provide a natural French translation.
Return ONLY this exact JSON format on one line:
{"romanisation":"[phonetic romanization here]","traduction":"[French translation here]"}`

                            : `Translate the given text to French.
Return ONLY this exact JSON format on one line:
{"romanisation":"","traduction":"[French translation here]"}`

        const modelAUtiliser = langue === 'Coréen' || langue === 'Japonais' || langue === 'Chinois' || langue === 'Arabe'
            ? 'llama-3.3-70b-versatile'
            : 'llama-3.1-8b-instant'

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