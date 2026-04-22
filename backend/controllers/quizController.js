// Logique du test d'évaluation :
//   - getQuestions : récupère 10 questions aléatoires par langue
//   - saveResult   : calcule le niveau et le sauvegarde dans le profil

const Quiz = require('../models/Quiz')
const User = require('../models/User')

// ── GET /api/quiz/:langue ──
// Retourne 10 questions pour la langue demandée
// On prend des questions de chaque niveau (A1→C2) pour couvrir tout le spectre
const getQuestions = async (req, res) =>
{
    const { langue } = req.params

    try
    {
        // On récupère 2 questions par niveau — total = 12 questions max
        // On prend seulement les champs nécessaires, PAS reponseCorrecte
        // (on ne veut pas envoyer les réponses au frontend !)
        const niveaux = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        let questions = []

        for (const niveau of niveaux)
        {
            const q = await Quiz.find({ langue, niveau })
                .select('-reponseCorrecte')
                .limit(4)  // ← 4 questions par niveau
            questions = [...questions, ...q]
        }

        if (questions.length === 0)
        {
            return res.status(404).json({
                message: `Aucune question disponible pour la langue : ${langue}`
            })
        }

        // On mélange les questions pour éviter un ordre prévisible
        questions = questions.sort(() => Math.random() - 0.5)

        res.json({ questions, langue })

    } catch (err)
    {
        res.status(500).json({ message: 'Erreur serveur', error: err.message })
    }
}

// ── POST /api/quiz/result ──
// Reçoit les réponses de l'utilisateur, calcule le niveau, sauvegarde dans le profil
const saveResult = async (req, res) =>
{
    // reponses = [{ questionId, reponseChoisie (index 0-3) }]
    const { langue, reponses } = req.body

    if (!langue || !reponses?.length)
    {
        return res.status(400).json({ message: 'Langue et réponses sont requis' })
    }

    try
    {
        // 1. On récupère toutes les questions avec les bonnes réponses cette fois
        const ids = reponses.map(r => r.questionId)
        const questions = await Quiz.find({ _id: { $in: ids } })

        // 2. On calcule le score par niveau
        const scoreParNiveau = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }
        const totalParNiveau = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }

        for (const reponse of reponses)
        {
            const question = questions.find(q => q._id.toString() === reponse.questionId)
            if (!question) continue

            totalParNiveau[question.niveau]++
            if (reponse.reponseChoisie === question.reponseCorrecte)
            {
                scoreParNiveau[question.niveau]++
            }
        }

        // 3. Déterminer le niveau — approche progressive
        // On part de A1 et on monte. Dès qu'un niveau est raté --> on s'arrête.
        const niveaux = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        let niveauFinal = 'A1' // valeur par défaut si tout est raté

        for (const niveau of niveaux)
        {

            // Si pas de questions pour ce niveau → on skip sans changer le résultat
            if (totalParNiveau[niveau] === 0) continue

            const pourcentage = scoreParNiveau[niveau] / totalParNiveau[niveau]

            if (pourcentage >= 0.5)
            {
                // Niveau validé → on avance
                niveauFinal = niveau
            } else
            {
                // Niveau raté → on s'arrête immédiatement
                break
            }
        }

        // 4. Sauvegarder dans le profil utilisateur
        // Si la langue existe déjà → on met à jour le niveau
        // Sinon → on l'ajoute
        const user = await User.findById(req.user._id)
        const langueExistante = user.langues.find(l => l.langue === langue)

        if (langueExistante)
        {
            langueExistante.niveau = niveauFinal
        } else
        {
            user.langues.push({ langue, niveau: niveauFinal })
        }

        await user.save()

        // 5. Retourner le résultat
        res.json({
            message: 'Niveau sauvegardé',
            niveau: niveauFinal,
            scoreParNiveau,
            user: {
                id: user._id,
                nom: user.nom,
                email: user.email,
                langues: user.langues,
                role: user.role,
            }
        })

    } catch (err)
    {
        res.status(500).json({ message: 'Erreur serveur', error: err.message })
    }
}

module.exports = { getQuestions, saveResult }