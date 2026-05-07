// mindmapController.js
// Transforme les LearningEntries d'un utilisateur en structure d'arbre
// pour alimenter la MindMap React Flow côté frontend
//
// Structure de l'arbre :
//   Root (LinguaPath)
//     └── Langue (ex: Espagnol 🇪🇸)
//           └── Thème (ex: Restaurant)
//                 └── Sous-thème / Pattern (ex: Politesse)
//                       └── Phrase (ex: ¿Cuánto cuesta?)
//
// Comportement interactif (géré via le paramètre "vue") :
//   ?vue=root             → affiche uniquement les langues autour de la racine
//   ?vue=langue&langue=X  → affiche uniquement les thèmes de la langue X
//   ?vue=theme&langue=X&theme=Y → affiche les sous-thèmes du thème Y
//   ?vue=soustheme&langue=X&theme=Y&pattern=Z → affiche les phrases du pattern Z

const LearningEntry = require('../models/LearningEntry')

// ── Utilitaire : positionner N nœuds en cercle autour d'un centre ──
const positionnerEnCercle = (centre, rayon, total, index, angleBase = -Math.PI / 2) =>
{
    const angle = total === 1
        ? angleBase
        : angleBase + (2 * Math.PI * index) / total
    return {
        x: centre.x + Math.cos(angle) * rayon,
        y: centre.y + Math.sin(angle) * rayon,
    }
}

// ── Utilitaire : positionner N nœuds en éventail autour d'un axe ──
const positionnerEnEventail = (centre, rayon, total, index, angleAxe) =>
{
    if (total === 1) return {
        x: centre.x + Math.cos(angleAxe) * rayon,
        y: centre.y + Math.sin(angleAxe) * rayon,
    }
    const spread = Math.PI * 0.75
    const angle = angleAxe + spread * (index / (total - 1) - 0.5)
    return {
        x: centre.x + Math.cos(angle) * rayon,
        y: centre.y + Math.sin(angle) * rayon,
    }
}

// ════════════════════════════════════════════════════════════════════
// GET /api/mindmap
// Query params :
//   vue        = 'root' | 'langue' | 'theme' | 'soustheme'  (défaut: 'root')
//   langue     = nom de la langue sélectionnée
//   theme      = nom du thème sélectionné
//   pattern    = nom du pattern sélectionné
//   niveau     = filtre optionnel A1/A2/B1/B2/C1/C2
// ════════════════════════════════════════════════════════════════════
const getMindMapData = async (req, res) =>
{
    try
    {
        const { vue = 'root', langue, theme, pattern, niveau } = req.query

        // ── Filtre de base ──
        const filtre = { userId: req.user._id }
        if (niveau) filtre.niveau = niveau
        if (langue)  filtre.langue = langue
        if (theme)   filtre.theme  = theme
        if (pattern) filtre.pattern = pattern

        const entries = await LearningEntry.find(filtre).sort({ createdAt: -1 })

        if (entries.length === 0)
        {
            return res.json({ nodes: [], edges: [], totalEntries: 0, vue })
        }

        const nodes = []
        const edges = []
        const CENTRE = { x: 0, y: 0 }

        // ════════════════════════════════════════════════════════════
        // VUE ROOT — affiche toutes les langues autour de la racine
        // ════════════════════════════════════════════════════════════
        if (vue === 'root')
        {
            // Toutes les entrées (pas de filtre langue ici)
            const toutesEntries = await LearningEntry.find({ userId: req.user._id, ...(niveau ? { niveau } : {}) })

            // Nœud racine
            nodes.push({
                id: 'root',
                type: 'rootNode',
                data: { label: 'LinguaPath', count: toutesEntries.length },
                position: CENTRE,
            })

            // Grouper par langue
            const parLangue = {}
            for (const e of toutesEntries)
            {
                if (!parLangue[e.langue]) parLangue[e.langue] = 0
                parLangue[e.langue]++
            }

            const langues = Object.keys(parLangue)
            langues.forEach((lang, i) =>
            {
                const pos = positionnerEnCercle(CENTRE, 300, langues.length, i)
                const id  = `langue-${lang}`

                nodes.push({
                    id,
                    type: 'langueNode',
                    data: {
                        label: lang,
                        count: parLangue[lang],
                        // Signal au frontend : clic → naviguer vers cette langue
                        action: 'selectLangue',
                        langue: lang,
                    },
                    position: pos,
                })

                edges.push({
                    id: `e-root-${id}`,
                    source: 'root',
                    target: id,
                    type: 'smoothstep',
                    style: { stroke: '#F59E0B', strokeWidth: 2 },
                    animated: false,
                })
            })
        }

        // ════════════════════════════════════════════════════════════
        // VUE LANGUE — affiche les thèmes de la langue sélectionnée
        // ════════════════════════════════════════════════════════════
        else if (vue === 'langue' && langue)
        {
            const entriesLangue = await LearningEntry.find({ userId: req.user._id, langue, ...(niveau ? { niveau } : {}) })

            // Nœud racine réduit (anchor)
            nodes.push({
                id: 'root',
                type: 'rootNode',
                data: { label: 'LinguaPath', count: entriesLangue.length, mini: true },
                position: { x: -500, y: 0 },
            })

            // Nœud langue sélectionnée (au centre)
            const langueId = `langue-${langue}`
            nodes.push({
                id: langueId,
                type: 'langueNode',
                data: { label: langue, count: entriesLangue.length, selected: true },
                position: CENTRE,
            })
            edges.push({
                id: `e-root-${langueId}`,
                source: 'root',
                target: langueId,
                type: 'smoothstep',
                style: { stroke: '#F59E0B', strokeWidth: 2 },
            })

            // Grouper par thème
            const parTheme = {}
            for (const e of entriesLangue)
            {
                if (!parTheme[e.theme]) parTheme[e.theme] = 0
                parTheme[e.theme]++
            }

            const themes = Object.keys(parTheme)
            themes.forEach((th, i) =>
            {
                const pos    = positionnerEnCercle(CENTRE, 300, themes.length, i)
                const themeId = `theme-${langue}-${th}`

                nodes.push({
                    id: themeId,
                    type: 'themeNode',
                    data: {
                        label: th,
                        count: parTheme[th],
                        langue,
                        action: 'selectTheme',
                        theme: th,
                    },
                    position: pos,
                })

                edges.push({
                    id: `e-${langueId}-${themeId}`,
                    source: langueId,
                    target: themeId,
                    type: 'smoothstep',
                    style: { stroke: '#EA580C', strokeWidth: 1.5 },
                })
            })
        }

        // ════════════════════════════════════════════════════════════
        // VUE THEME — affiche les patterns (sous-thèmes) du thème
        // ════════════════════════════════════════════════════════════
        else if (vue === 'theme' && langue && theme)
        {
            const entriesTheme = await LearningEntry.find({
                userId: req.user._id,
                langue,
                theme,
                ...(niveau ? { niveau } : {}),
            })

            // Nœud langue (anchor)
            const langueId = `langue-${langue}`
            nodes.push({
                id: langueId,
                type: 'langueNode',
                data: { label: langue, mini: true, action: 'selectLangue', langue },
                position: { x: -500, y: 0 },
            })

            // Nœud thème au centre
            const themeId = `theme-${langue}-${theme}`
            nodes.push({
                id: themeId,
                type: 'themeNode',
                data: { label: theme, count: entriesTheme.length, selected: true, langue },
                position: CENTRE,
            })
            edges.push({
                id: `e-${langueId}-${themeId}`,
                source: langueId,
                target: themeId,
                type: 'smoothstep',
                style: { stroke: '#EA580C', strokeWidth: 1.5 },
            })

            // Grouper par pattern
            const parPattern = {}
            for (const e of entriesTheme)
            {
                const p = e.pattern || 'Général'
                if (!parPattern[p]) parPattern[p] = 0
                parPattern[p]++
            }

            const patterns = Object.keys(parPattern)
            patterns.forEach((pat, i) =>
            {
                const pos       = positionnerEnCercle(CENTRE, 280, patterns.length, i)
                const patternId = `pattern-${langue}-${theme}-${pat}`

                nodes.push({
                    id: patternId,
                    type: 'patternNode',
                    data: {
                        label: pat,
                        count: parPattern[pat],
                        langue,
                        theme,
                        action: 'selectPattern',
                        pattern: pat,
                    },
                    position: pos,
                })

                edges.push({
                    id: `e-${themeId}-${patternId}`,
                    source: themeId,
                    target: patternId,
                    type: 'smoothstep',
                    style: { stroke: '#7C3AED', strokeWidth: 1.5 },
                })
            })
        }

        // ════════════════════════════════════════════════════════════
        // VUE SOUSTHEME — affiche les phrases du pattern sélectionné
        // ════════════════════════════════════════════════════════════
        else if (vue === 'soustheme' && langue && theme && pattern)
        {
            const phrasesFiltrees = await LearningEntry.find({
                userId: req.user._id,
                langue,
                theme,
                pattern,
                ...(niveau ? { niveau } : {}),
            })

            // Nœud thème (anchor)
            const themeId = `theme-${langue}-${theme}`
            nodes.push({
                id: themeId,
                type: 'themeNode',
                data: { label: theme, mini: true, action: 'selectTheme', theme, langue },
                position: { x: -500, y: 0 },
            })

            // Nœud pattern au centre
            const patternId = `pattern-${langue}-${theme}-${pattern}`
            nodes.push({
                id: patternId,
                type: 'patternNode',
                data: { label: pattern, count: phrasesFiltrees.length, selected: true },
                position: CENTRE,
            })
            edges.push({
                id: `e-${themeId}-${patternId}`,
                source: themeId,
                target: patternId,
                type: 'smoothstep',
                style: { stroke: '#7C3AED', strokeWidth: 1.5 },
            })

            // Phrases autour du pattern
            phrasesFiltrees.forEach((entry, i) =>
            {
                const angleAxe  = -Math.PI / 2
                const pos       = positionnerEnEventail(CENTRE, 260, phrasesFiltrees.length, i, angleAxe + (2 * Math.PI * i) / phrasesFiltrees.length)
                const phraseId  = `phrase-${entry._id}`

                nodes.push({
                    id: phraseId,
                    type: 'phraseNode',
                    data: {
                        label:      entry.phrase,
                        traduction: entry.traduction,
                        niveau:     entry.niveau,
                        source:     entry.source,
                        entryId:    entry._id,
                    },
                    position: pos,
                })

                edges.push({
                    id: `e-${patternId}-${phraseId}`,
                    source: patternId,
                    target: phraseId,
                    type: 'smoothstep',
                    style: { stroke: '#D1D5DB', strokeWidth: 1 },
                })
            })
        }
        else
        {
            return res.status(400).json({ message: "Paramètres de vue invalides." })
        }

        res.json({
            nodes,
            edges,
            totalEntries: entries.length,
            vue,
            // Contexte de navigation renvoyé au frontend pour construire le fil d'Ariane
            contexte: { langue, theme, pattern, niveau },
        })

    } catch (err)
    {
        console.error('Erreur MindMap :', err.message)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

module.exports = { getMindMapData }