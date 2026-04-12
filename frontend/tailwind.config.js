export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleur principale — jaune chaud
        primary: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",  // ← couleur principale du logo
          600: "#D97706",
          700: "#B45309",
        },
        // Couleur accent — orange
        accent: {
          500: "#EA580C",
          600: "#C2410C",
        },
        // Gris neutres pour le texte et les backgrounds
        surface: {
          50: "#FAFAF9",   // fond des pages
          100: "#F5F5F4",   // fond des cards
          200: "#E7E5E4",   // bordures
          500: "#78716C",   // texte secondaire
          700: "#44403C",   // texte principal
          900: "#1C1917",   // texte foncé
        }
      },
      fontFamily: {
        // Police principale de l'app
        sans: ["Inter", "system-ui", "sans-serif"],
        // Police du logo et des titres
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
}