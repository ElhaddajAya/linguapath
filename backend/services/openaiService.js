// Service OpenAI — remplace groqService.js
// Même interface : envoyerMessage() fonctionne exactement pareil
// Les controllers n'ont besoin de changer qu'une seule ligne d'import

const OpenAI = require('openai')

// Initialisation du client OpenAI avec la clé depuis .env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// ── Fonction principale ──────────────────────────────────────────
// Même signature que groqService pour ne rien casser
const envoyerMessage = async (
    systemPrompt,
    historique = [],
    messageUser,
    temperature = 1,
    model = 'gpt-4o-mini'   // modèle par défaut
) =>
{
    // Construire l'historique au format OpenAI
    // { role: 'user'/'assistant', content: '...' }
    const messages = [
        { role: 'system', content: systemPrompt },
        ...historique.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.contenu,
        })),
        { role: 'user', content: messageUser },
    ]

    let tentative = 0

    // Retry automatique si OpenAI est surchargé (erreur 429 ou 503)
    while (tentative < 3)
    {
        try
        {
            const completion = await openai.chat.completions.create({
                model,
                messages,
                temperature,
                max_tokens: 1000,
            })

            // Retourner uniquement le texte de la réponse
            return completion.choices[0].message.content

        } catch (err)
        {
            tentative++
            const isRetryable = err.status === 429 || err.status === 503

            // Si erreur récupérable et tentatives restantes → on réessaie
            if (isRetryable && tentative < 3)
            {
                // Attendre 1s avant de réessayer
                await new Promise(r => setTimeout(r, 1000))
                continue
            }

            // Sinon → on lance l'erreur
            throw new Error(`OpenAI error: ${err.message}`)
        }
    }
}

module.exports = { envoyerMessage }