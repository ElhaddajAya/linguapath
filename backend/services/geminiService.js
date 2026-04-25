// Service qui gere toute la communication avec l'API Gemini

const { HarmCategory, GoogleGenerativeAI, HarmBlockThreshold } = require('@google/generative-ai')

// Les paramètres de sécurité : ils servent pour bloquer certains types de contenu, par exemple des messages de haine.
// Ici on choisit de ne rien bloquer (BLOCK_NONE) pour maximiser la liberté d'expression de l'IA pendant les scénarios de conversation.
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// Initialisation du client Gemini avec notre clé API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Fonction principale — envoie un message à Gemini et reçoit la réponse
// Paramètres :
//   - systemPrompt : le rôle que joue l'IA (défini dans le scénario)
//   - historique   : tableau de tous les messages précédents
//   - messageUser  : le nouveau message de l'utilisateur
//   - tentative    : numéro de tentative (pour le retry automatique en cas de 503)
const envoyerMessage = async (systemPrompt, historique, messageUser, tentative = 1) =>
{

    try
    {
        // On utilise gemini-3-flash-preview — tres proche de GPT-4o en qualité, gratuit avec quota généreux.
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: systemPrompt,
            safetySettings, // On applique les paramètres de sécurité définis plus haut
        })

        // Gemini attend l'historique dans ce format :
        // [{ role: "user", parts: [{ text: "..." }] },
        //  { role: "model", parts: [{ text: "..." }] }, ...]
        // IMPORTANT : Gemini exige que le premier message soit toujours 'user'
        // On filtre tout ce qui précède le premier message user
        const historiqueFormate = historique
            .map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.contenu }],
            }))
            .reduce((acc, msg) =>
            {
                // Si le tableau est encore vide et que ce n'est pas un message 'user' → on l'ignore
                if (acc.length === 0 && msg.role !== 'user') return acc
                return [...acc, msg]
            }, [])

        // On démarre une session de chat avec l'historique existant
        const chat = model.startChat({ history: historiqueFormate })

        // On envoie le nouveau message
        const result = await chat.sendMessage(messageUser)
        const response = result.response.text()

        return response

    } catch (err)
    {
        // Si 503 (surcharge temporaire) et moins de 3 tentatives → on réessaie après 2 secondes
        if (err.message?.includes('503') && tentative < 3)
        {
            console.log(`503 détecté — tentative ${tentative}/3, retry dans 2s...`)
            await new Promise(resolve => setTimeout(resolve, 5000))
            return envoyerMessage(systemPrompt, historique, messageUser, tentative + 1)
        }
        throw err
    }
}

module.exports = { envoyerMessage }