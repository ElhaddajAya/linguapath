// mindmapController.js
// Transforme les LearningEntries d'un utilisateur en structure d'arbre
// pour alimenter la MindMap React Flow côté frontend

const LearningEntry = require('../models/LearningEntry')

// ── GET /api/mindmap ──
// Récupère les phrases de l'utilisateur et les transforme en arbre :
//
//  Root (LinguaPath)
//    └── Langue (ex: Espagnol 🇪🇸)
//          └── Thème (ex: Restaurant)
//                └── Phrase (ex: ¿Cuánto cuesta?)
//
const getMindMapData = async (req, res) =>
{
    try
    {
        // Filtres optionnels — même logique que le learning log
        const { langue, niveau } = req.query
        const filtre = { userId: req.user._id }
        if (langue) filtre.langue = langue
        if (niveau) filtre.niveau = niveau

        const entries = await LearningEntry.find(filtre).sort({ createdAt: -1 })

        if (entries.length === 0)
        {
            return res.json({ nodes: [], edges: [] })
        }

        // ── Algorithme de transformation en arbre ──────────────────────────
        //
        // Structure visée pour React Flow :
        //   nodes = tableau de { id, type, data, position }
        //   edges = tableau de { id, source, target }
        //
        // Stratégie de positionnement :
        //   - Nœud racine au centre
        //   - Langues disposées en cercle autour de la racine
        //   - Thèmes disposés en cercle autour de leur langue
        //   - Phrases disposées en cercle autour de leur thème

        const nodes = []
        const edges = []

        // ── 1. Nœud racine ──
        nodes.push({
            id: 'root',
            type: 'rootNode',
            data: { label: 'LinguaPath', count: entries.length },
            position: { x: 0, y: 0 },
        })

        // ── 2. Grouper par langue ──
        const parLangue = {}
        for (const entry of entries)
        {
            if (!parLangue[entry.langue]) parLangue[entry.langue] = {}
            if (!parLangue[entry.langue][entry.theme]) parLangue[entry.langue][entry.theme] = []
            parLangue[entry.langue][entry.theme].push(entry)
        }

        const langues = Object.keys(parLangue)
        const RAYON_LANGUE = 320
        const RAYON_THEME = 220
        const RAYON_PHRASE = 180

        // ── 3. Positionner les langues en cercle ──
        langues.forEach((langue, iLangue) =>
        {
            const angleLangue = (2 * Math.PI * iLangue) / langues.length - Math.PI / 2
            const xLangue = Math.cos(angleLangue) * RAYON_LANGUE
            const yLangue = Math.sin(angleLangue) * RAYON_LANGUE

            const langueId = `langue-${langue}`
            const themesLangue = parLangue[langue]
            const totalPhrasesLangue = Object.values(themesLangue).flat().length

            nodes.push({
                id: langueId,
                type: 'langueNode',
                data: { label: langue, count: totalPhrasesLangue },
                position: { x: xLangue, y: yLangue },
            })

            // Edge : racine → langue
            edges.push({
                id: `e-root-${langueId}`,
                source: 'root',
                target: langueId,
                type: 'smoothstep',
                style: { stroke: '#F59E0B', strokeWidth: 2 },
                animated: false,
            })

            // ── 4. Positionner les thèmes autour de chaque langue ──
            const themes = Object.keys(themesLangue)
            themes.forEach((theme, iTheme) =>
            {
                // Angle décalé pour ne pas superposer avec la racine
                const baseAngle = angleLangue
                const spreadAngle = themes.length === 1 ? 0 : (Math.PI * 0.8 * (iTheme / (themes.length - 1) - 0.5))
                const angleTheme = baseAngle + spreadAngle

                const xTheme = xLangue + Math.cos(angleTheme) * RAYON_THEME
                const yTheme = yLangue + Math.sin(angleTheme) * RAYON_THEME

                const themeId = `theme-${langue}-${theme}`
                const phrasesTheme = themesLangue[theme]

                nodes.push({
                    id: themeId,
                    type: 'themeNode',
                    data: { label: theme, count: phrasesTheme.length, langue },
                    position: { x: xTheme, y: yTheme },
                })

                // Edge : langue → thème
                edges.push({
                    id: `e-${langueId}-${themeId}`,
                    source: langueId,
                    target: themeId,
                    type: 'smoothstep',
                    style: { stroke: '#EA580C', strokeWidth: 1.5 },
                })

                // ── 5. Positionner les phrases autour du thème ──
                phrasesTheme.forEach((entry, iPhrase) =>
                {
                    const baseAnglePhrase = angleTheme
                    const spreadPhrase = phrasesTheme.length === 1
                        ? 0
                        : (Math.PI * 0.7 * (iPhrase / (phrasesTheme.length - 1) - 0.5))
                    const anglePhrase = baseAnglePhrase + spreadPhrase

                    const xPhrase = xTheme + Math.cos(anglePhrase) * RAYON_PHRASE
                    const yPhrase = yTheme + Math.sin(anglePhrase) * RAYON_PHRASE

                    const phraseId = `phrase-${entry._id}`

                    nodes.push({
                        id: phraseId,
                        type: 'phraseNode',
                        data: {
                            label: entry.phrase,
                            traduction: entry.traduction,
                            niveau: entry.niveau,
                            source: entry.source,
                            entryId: entry._id,
                        },
                        position: { x: xPhrase, y: yPhrase },
                    })

                    // Edge : thème → phrase
                    edges.push({
                        id: `e-${themeId}-${phraseId}`,
                        source: themeId,
                        target: phraseId,
                        type: 'smoothstep',
                        style: { stroke: '#D1D5DB', strokeWidth: 1 },
                    })
                })
            })
        })

        res.json({ nodes, edges, totalEntries: entries.length })

    } catch (err)
    {
        console.error('Erreur MindMap :', err.message)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

module.exports = { getMindMapData }
