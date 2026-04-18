const Scenario = require('../models/Scenario')

// Ordre des niveaux pour la comparaison
const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// ── GET /api/scenarios?langue=Anglais&niveau=B1 ──
const getScenarios = async (req, res) =>
{
    const { langue, niveau } = req.query

    if (!langue || !niveau)
    {
        return res.status(400).json({ message: 'langue et niveau sont requis' })
    }

    try
    {
        const indexNiveau = NIVEAUX.indexOf(niveau)

        // On récupère tous les scénarios de la langue demandée
        // puis on filtre : niveauMin ≤ niveau utilisateur ≤ niveauMax
        const scenarios = await Scenario.find({ langue })

        const filtres = scenarios.filter(s =>
        {
            const indexMin = NIVEAUX.indexOf(s.niveauMin)
            const indexMax = NIVEAUX.indexOf(s.niveauMax)
            return indexNiveau >= indexMin && indexNiveau <= indexMax
        })

        res.json({ scenarios: filtres })

    } catch (err)
    {
        res.status(500).json({ message: 'Erreur serveur', error: err.message })
    }
}

// ── GET /api/scenarios/:id ──
// Récupère un seul scénario par son ID (utilisé au moment de lancer le chat)
const getScenarioById = async (req, res) =>
{
    try
    {
        const scenario = await Scenario.findById(req.params.id)
        if (!scenario)
        {
            return res.status(404).json({ message: 'Scénario introuvable' })
        }
        res.json({ scenario })
    } catch (err)
    {
        res.status(500).json({ message: 'Erreur serveur', error: err.message })
    }
}

module.exports = { getScenarios, getScenarioById }