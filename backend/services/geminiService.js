// Service qui gere toute la communication avec l'API Gemini

const { GoogleGenerativeAI } = require('@google/generative-ai')

// Initialisation du client Gemini avec notre clé API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Fonction principale — envoie un message à Gemini et reçoit la réponse
// Paramètres :
//   - systemPrompt : le rôle que joue l'IA (défini dans le scénario)
//   - historique   : tableau de tous les messages précédents
//   - messageUser  : le nouveau message de l'utilisateur
const envoyerMessage = async (systemPrompt, historique, messageUser) =>
{

    // On utilise gemini-1.5-flash — rapide et gratuit
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
    })

    // Gemini attend l'historique dans ce format :
    // [{ role: "user", parts: [{ text: "..." }] },
    //  { role: "model", parts: [{ text: "..." }] }, ...]
    const historiqueFormate = historique.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.contenu }],
    }))

    // On démarre une session de chat avec l'historique existant
    const chat = model.startChat({ history: historiqueFormate })

    // On envoie le nouveau message
    const result = await chat.sendMessage(messageUser)
    const response = result.response.text()

    return response
}

module.exports = { envoyerMessage }