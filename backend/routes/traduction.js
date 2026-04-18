// Route dédiée à la romanisation ET traduction française
// On utilise Gemini ici (meilleur pour les langues asiatiques)
// et Groq pour la conversation principale (quota plus généreux)

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { envoyerMessage } = require('../services/geminiService') // ← Gemini pour ça

// POST /api/traduction
// Retourne : { romanisation, traduction }
router.post('/', protect, async (req, res) =>
{
    const { texte } = req.body
    if (!texte) return res.status(400).json({ message: 'texte requis' })

    try
    {
        // On fait les deux en un seul appel — romanisation + traduction française
        const systemPrompt = `You are a language assistant. Given a text, return ONLY a JSON object with exactly two fields:
- "romanisation": the phonetic romanization in Latin alphabet
  * Korean → Revised Romanization (안녕하세요 → Annyeonghaseyo)
  * Japanese → Hepburn (ありがとう → Arigatou)
  * Chinese → Pinyin with tones (你好 → Nǐ hǎo)
  * Arabic → phonetic transliteration (مرحبا → Marhaba)
  * Latin script languages → return the original text unchanged
- "traduction": natural French translation of the text

Return ONLY valid JSON, no explanation, no markdown, no code block.
Example: {"romanisation": "Annyeonghaseyo", "traduction": "Bonjour"}`

        const reponse = await envoyerMessage(systemPrompt, [], texte)

        // On nettoie la réponse et on parse le JSON
        const clean = reponse.replace(/```json|```/g, '').trim()
        const data = JSON.parse(clean)

        res.json({
            romanisation: data.romanisation || '',
            traduction: data.traduction || '',
        })

    } catch (err)
    {
        console.error('Erreur traduction :', err.message)
        res.status(500).json({ message: 'Erreur traduction' })
    }
})

module.exports = router