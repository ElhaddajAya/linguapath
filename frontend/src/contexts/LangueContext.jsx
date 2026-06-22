// src/contexts/LangueContext.jsx
// Contexte global pour la langue de l'interface (FR / EN)
// Utilisation dans n'importe quel composant :
//   const { t, langue, toggleLangue } = useLangue()
//   t('nav.home') → 'Accueil' ou 'Home' selon la langue active

import { createContext, useContext, useState } from 'react'
import translations from '../i18n/translations'

// Créer le contexte
const LangueContext = createContext()

// Provider — entoure toute l'application dans App.jsx
export function LangueProvider({ children })
{

    // Langue par défaut : récupérée depuis localStorage, sinon 'fr'
    const [langue, setLangue] = useState(
        () => localStorage.getItem('interfaceLangue') || 'fr'
    )

    // Fonction de traduction — accède aux clés imbriquées
    // Exemple : t('nav.home') → cherche translations.nav.home[langue]
    const t = (key) =>
    {
        const parts = key.split('.')
        let current = translations
        for (const part of parts)
        {
            if (!current[part]) return key  // clé introuvable → retourne la clé brute
            current = current[part]
        }
        return current[langue] || current['fr'] || key
    }

    // Switcher la langue et la sauvegarder dans localStorage
    const toggleLangue = () =>
    {
        const nouvelle = langue === 'fr' ? 'en' : 'fr'
        setLangue(nouvelle)
        localStorage.setItem('interfaceLangue', nouvelle)
    }

    return (
        <LangueContext.Provider value={{ t, langue, toggleLangue }}>
            {children}
        </LangueContext.Provider>
    )
}

// Hook personnalisé pour utiliser le contexte facilement
export function useLangue()
{
    return useContext(LangueContext)
}