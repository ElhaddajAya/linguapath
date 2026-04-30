// Service qui gere toute la communication avec l'API Groq
// On utilise LLaMA 3.3 70B — qualité très proche de GPT-4o
// Free tier : 14 400 requêtes/jour (vs 20/jour pour Gemini)

const Groq = require('groq-sdk')

// Initialisation du client Groq avec notre clé API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Fonction principale — envoie un message à Groq et reçoit la réponse
// Paramètres :
//   - systemPrompt : le rôle que joue l'IA (défini dans le scénario)
//   - historique   : tableau de tous les messages précédents
//   - messageUser  : le nouveau message de l'utilisateur
//   - tentative    : numéro de tentative (retry automatique en cas de 429/503)
const envoyerMessage = async (systemPrompt, historique, messageUser, tentative = 1, model = 'openai/gpt-oss-120b') =>
{
    try
    {
        // On formate les messages au format OpenAI/Groq :
        // [{ role: "system", content: "..." },
        //  { role: "user", content: "..." },
        //  { role: "assistant", content: "..." }, ...]
        const messages = [
            // System prompt en premier — définit le rôle et le comportement de l'IA
            { role: 'system', content: systemPrompt },

            // Historique de la conversation — tous les échanges précédents
            ...historique.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.contenu,
            })),

            // Nouveau message de l'utilisateur — le dernier de la liste
            { role: 'user', content: messageUser },
        ]

        // Appel à l'API Groq avec LLaMA 3.3 70B
        const response = await groq.chat.completions.create({
            model, // Modèle llama-3.3-70b-versatile principal — très proche GPT-4o
            messages,
            temperature: 0.7,  // Créativité modérée — naturel sans être imprévisible
            max_tokens: 1024,  // Réponse max ~750 mots — suffisant pour une conversation
        })

        // On retourne uniquement le texte de la réponse
        return response.choices[0].message.content

    } catch (err)
    {
        // Si 429 (quota dépassé) ou 503 (surcharge temporaire) → on réessaie
        const isRetryable = err.message?.includes('429') || err.message?.includes('503')
        if (isRetryable && tentative < 3)
        {
            console.log(`Erreur Groq — tentative ${tentative}/3, retry dans 3s...`)
            await new Promise(resolve => setTimeout(resolve, 3000))
            return envoyerMessage(systemPrompt, historique, messageUser, tentative + 1)
        }
        throw err
    }

}

module.exports = { envoyerMessage }