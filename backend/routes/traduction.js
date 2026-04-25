// Route dédiée à la romanisation ET traduction française (Groq gère les deux)

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { envoyerMessage } = require('../services/groqService') // ← Groq maintenant

router.post('/', protect, async (req, res) =>
{
    const { texte, langue } = req.body
    if (!texte) return res.status(400).json({ message: 'texte requis' })

    const LANGUES_LATINES = ['Anglais', 'Espagnol', 'Français', 'Allemand']
    const estLatine = langue && LANGUES_LATINES.includes(langue)

    try
    {
        const systemPrompt = estLatine
            ? `You are a translator. Given a text, return ONLY valid JSON:
{"romanisation":"","traduction":"natural French translation"}
No explanation, no markdown, no code block.`
            : `You are a language assistant. Given a text, return ONLY valid JSON:
{"romanisation":"phonetic romanization (Korean→Revised Romanization, Japanese→Hepburn, Chinese→Pinyin with tones, Arabic→phonetic transliteration)","traduction":"natural French translation"}
No explanation, no markdown, no code block.
Example: {"romanisation":"Annyeonghaseyo","traduction":"Bonjour"}`

        const reponse = await envoyerMessage(systemPrompt, [], texte)
        const clean = reponse.replace(/```json|```/g, '').trim()

        // Extraction robuste du JSON
        let data
        try
        {
            data = JSON.parse(clean)
        } catch
        {
            const match = clean.match(/\{[\s\S]*\}/)
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