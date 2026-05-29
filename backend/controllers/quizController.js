// Logique du quiz d'évaluation — VERSION 2
// Changements vs v1 :
//   - $sample MongoDB = tirage ALÉATOIRE (pas toujours les mêmes questions)
//   - 4 questions par niveau = 24 questions au total (même précision qu'avant)
//   - Pool de 6 questions par niveau → C(6,4) = 15 combinaisons possibles
//   - Seuil à 60% (était 50%) → niveau plus précis et crédible

const Quiz = require('../models/Quiz')
const User = require('../models/User')

// ── GET /api/quiz/:langue ──
// Retourne 24 questions pour la langue demandée (4 par niveau, tirées au hasard)
const getQuestions = async (req, res) =>
{
    const { langue } = req.params

    try
    {
        const niveaux = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        let questions = []

        for (const niveau of niveaux)
        {
            // $sample = tirage ALÉATOIRE dans le pool de questions de ce niveau
            // Avec 6 questions disponibles et size:4 → 15 combinaisons différentes par niveau
            const q = await Quiz.aggregate([
                { $match: { langue, niveau } },   // filtre par langue + niveau
                { $sample: { size: 4 } }           // tire 4 questions au hasard
            ])

            // Supprimer la bonne réponse avant d'envoyer au frontend
            // (on ne veut pas que l'utilisateur puisse la voir dans la réponse HTTP)
            q.forEach(question => delete question.reponseCorrecte)

            questions = [...questions, ...q]
        }

        if (questions.length === 0)
        {
            return res.status(404).json({
                message: `Aucune question disponible pour la langue : ${langue}`
            })
        }

        // Mélanger l'ordre global — les niveaux sont entremêlés
        // L'utilisateur ne voit pas la progression A1 → C2 clairement
        questions = questions.sort(() => Math.random() - 0.5)

        res.json({ questions, langue })

    } catch (err)
    {
        res.status(500).json({ message: 'Erreur serveur', error: err.message })
    }
}

// ── POST /api/quiz/result ──
// Reçoit les réponses, calcule le niveau CECRL, sauvegarde dans le profil
const saveResult = async (req, res) =>
{
    const { langue, reponses } = req.body

    if (!langue || !reponses?.length)
    {
        return res.status(400).json({ message: 'Langue et réponses sont requis' })
    }

    try
    {
        // 1. Récupérer les questions avec les bonnes réponses (cette fois on les inclut)
        const ids = reponses.map(r => r.questionId)
        const questions = await Quiz.find({ _id: { $in: ids } })

        // 2. Calculer le score par niveau
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

        // 3. Déterminer le niveau — approche progressive avec seuil à 60%
        // On monte de A1 vers C2 : on valide un niveau si score >= 60%
        // Au premier échec → on s'arrête (niveau trop difficile)
        // Exemple : A1 ✅ A2 ✅ B1 ✅ B2 ❌ → niveau B1
        const SEUIL_REUSSITE = 0.60  // 60% = au moins 3/4 bonnes réponses par niveau
        const niveaux = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        let niveauFinal = 'A1'  // valeur par défaut si tout est raté

        for (const niveau of niveaux)
        {
            // Aucune question pour ce niveau (ne devrait pas arriver) → on skip
            if (totalParNiveau[niveau] === 0) continue

            const pourcentage = scoreParNiveau[niveau] / totalParNiveau[niveau]

            if (pourcentage >= SEUIL_REUSSITE)
            {
                niveauFinal = niveau  // niveau validé → on monte
            } else
            {
                break  // niveau raté → on s'arrête ici
            }
        }

        // 4. Sauvegarder dans le profil utilisateur
        const user = await User.findById(req.user._id)
        const langueExistante = user.langues.find(l => l.langue === langue)

        if (langueExistante)
        {
            langueExistante.niveau = niveauFinal  // mise à jour
        } else
        {
            user.langues.push({ langue, niveau: niveauFinal })  // nouvelle langue
        }

        await user.save()

        // 5. Retourner le résultat avec le détail par niveau
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
                avatar: user.avatar || '',
            }
        })

    } catch (err)
    {
        res.status(500).json({ message: 'Erreur serveur', error: err.message })
    }
}

module.exports = { getQuestions, saveResult }