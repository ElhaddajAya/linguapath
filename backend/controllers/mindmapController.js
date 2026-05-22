// Transforme les LearningEntries d'un utilisateur en structure d'arbre
// pour alimenter la MindMap React Flow côté frontend
//
// Structure de l'arbre :
//   Root (LinguaPath)
//     └── Langue (ex: Espagnol 🇪🇸)
//           └── Thème (ex: Restaurant)
//                 └── Pattern (ex: Politesse)
//                       └── Phrase (ex: ¿Cuánto cuesta?)
//
// Comportement interactif (géré via le paramètre "vue") :
//   ?vue=root             → affiche uniquement les langues autour de la racine
//   ?vue=langue&langue=X  → affiche uniquement les thèmes de la langue X
//   ?vue=theme&langue=X&theme=Y → affiche les sous-thèmes du thème Y
//   ?vue=soustheme&langue=X&theme=Y&pattern=Z → affiche les phrases du pattern Z

const LearningEntry = require('../models/LearningEntry')

// ── Utilitaire : positionner N nœuds en cercle autour d'un centre ──
// Formule : on divise 360° en N parts égales, chaque nœud prend sa part (index/total)
// angleBase = -PI/2 pour commencer en haut (12h) plutôt qu'à droite (3h)
const positionnerEnCercle = (centre, rayon, total, index, angleBase = -Math.PI / 2) =>
{
    // Si un seul nœud, on le place directement en haut sans calcul de répartition
    const angle = total === 1
        ? angleBase
        : angleBase + (2 * Math.PI * index) / total
    return {
        x: centre.x + Math.cos(angle) * rayon,
        y: centre.y + Math.sin(angle) * rayon,
    }
}

// ── Utilitaire : positionner N nœuds en éventail autour d'un axe ──
// Utilisé pour les phrases : on étale les nœuds sur un arc de 135° (PI*0.75)
// centré sur un axe donné, au lieu d'un cercle complet
const positionnerEnEventail = (centre, rayon, total, index, angleAxe) =>
{
    if (total === 1) return {
        x: centre.x + Math.cos(angleAxe) * rayon,
        y: centre.y + Math.sin(angleAxe) * rayon,
    }
    const spread = Math.PI * 0.75  // éventail de 135°
    // index/(total-1) va de 0 à 1 → on soustrait 0.5 pour centrer l'éventail sur l'axe
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
        // On construit dynamiquement le filtre MongoDB selon les paramètres reçus
        const filtre = { userId: req.user._id }
        if (niveau) filtre.niveau = niveau
        if (langue) filtre.langue = langue
        if (theme) filtre.theme = theme
        if (pattern) filtre.pattern = pattern

        // Récupération initiale pour compter les entrées correspondantes
        const entries = await LearningEntry.find(filtre).sort({ createdAt: -1 })

        if (entries.length === 0)
        {
            return res.json({ nodes: [], edges: [], totalEntries: 0, vue })
        }

        // nodes = liste des cercles/bulles affichés par React Flow
        // edges = liste des lignes qui relient les nœuds entre eux
        const nodes = []
        const edges = []
        const CENTRE = { x: 0, y: 0 }  // point central de l'écran

        // ════════════════════════════════════════════════════════════
        // VUE ROOT — affiche toutes les langues autour de la racine
        // ════════════════════════════════════════════════════════════
        if (vue === 'root')
        {
            // On recharge TOUTES les entrées (sans filtre langue) pour cette vue globale
            const toutesEntries = await LearningEntry.find({ userId: req.user._id, ...(niveau ? { niveau } : {}) })

            // Nœud racine central — point de départ de la mindmap
            nodes.push({
                id: 'root',
                type: 'rootNode',
                data: { label: 'LinguaPath', count: toutesEntries.length },
                position: CENTRE,
            })

            // On regroupe les entrées par langue avec un simple compteur
            // ex: { Espagnol: 12, Anglais: 8 }
            const parLangue = {}
            for (const e of toutesEntries)
            {
                if (!parLangue[e.langue]) parLangue[e.langue] = 0
                parLangue[e.langue]++
            }

            // On crée un nœud par langue + une arête (ligne) vers la racine
            const langues = Object.keys(parLangue)
            langues.forEach((lang, i) =>
            {
                // Chaque langue est placée en cercle autour du centre, rayon 300px
                const pos = positionnerEnCercle(CENTRE, 300, langues.length, i)
                const id = `langue-${lang}`

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

                // Ligne entre la racine et ce nœud langue
                edges.push({
                    id: `e-root-${id}`,
                    source: 'root',
                    target: id,
                    type: 'smoothstep',       // courbe lisse (pas de ligne droite)
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

            // La racine reste visible mais en petit (mini:true) à gauche = "fil d'Ariane"
            nodes.push({
                id: 'root',
                type: 'rootNode',
                data: { label: 'LinguaPath', count: entriesLangue.length, mini: true },
                position: { x: -500, y: 0 },
            })

            // La langue sélectionnée devient le nouveau centre de la vue
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

            // Même logique que la vue root : on groupe, on compte, on place en cercle
            const parTheme = {}
            for (const e of entriesLangue)
            {
                if (!parTheme[e.theme]) parTheme[e.theme] = 0
                parTheme[e.theme]++
            }

            const themes = Object.keys(parTheme)
            themes.forEach((th, i) =>
            {
                const pos = positionnerEnCercle(CENTRE, 300, themes.length, i)
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

            // Nœud langue (anchor) — permet de remonter d'un niveau
            const langueId = `langue-${langue}`
            nodes.push({
                id: langueId,
                type: 'langueNode',
                data: { label: langue, mini: true, action: 'selectLangue', langue },
                position: { x: -500, y: 0 },
            })

            // Le thème sélectionné est maintenant au centre
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

            // Grouper par pattern — si pas de pattern, on met 'Général' par défaut
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
                // Rayon légèrement réduit (280) car les labels de pattern sont plus longs
                const pos = positionnerEnCercle(CENTRE, 280, patterns.length, i)
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
            // Ici on récupère les vraies phrases (LearningEntry complètes), pas juste des comptes
            const phrasesFiltrees = await LearningEntry.find({
                userId: req.user._id,
                langue,
                theme,
                pattern,
                ...(niveau ? { niveau } : {}),
            })

            // Nœud thème (anchor) — dernier ancêtre visible à gauche
            const themeId = `theme-${langue}-${theme}`
            nodes.push({
                id: themeId,
                type: 'themeNode',
                data: { label: theme, mini: true, action: 'selectTheme', theme, langue },
                position: { x: -500, y: 0 },
            })

            // Le pattern devient le centre — les phrases rayonnent autour de lui
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

            // Les phrases sont placées en éventail (arc) et non en cercle complet
            // car elles contiennent plus de texte et doivent être lisibles
            phrasesFiltrees.forEach((entry, i) =>
            {
                // On recalcule l'axe pour chaque phrase pour mieux répartir l'éventail
                const angleAxe = -Math.PI / 2
                const pos = positionnerEnEventail(CENTRE, 260, phrasesFiltrees.length, i, angleAxe + (2 * Math.PI * i) / phrasesFiltrees.length)
                const phraseId = `phrase-${entry._id}`

                // Le nœud phrase contient les données complètes de l'entrée
                nodes.push({
                    id: phraseId,
                    type: 'phraseNode',
                    data: {
                        label: entry.phrase,
                        traduction: entry.traduction,
                        niveau: entry.niveau,
                        source: entry.source,
                        entryId: entry._id,   // permet au frontend d'ouvrir la fiche détail
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

        // On renvoie les nodes + edges au frontend React Flow qui les dessine directement
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
