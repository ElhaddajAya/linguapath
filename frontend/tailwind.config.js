// tailwind.config.js
// Configuration Tailwind avec notre palette personnalisée
// Blanc chaud + Orange comme accent principal

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Blanc chaud — fond principal (inspiré de Claude AI ~#FAF9F7)
        warm: {
          50: "#FDFCFA",   // blanc très chaud — fond des pages
          100: "#F7F5F0",   // fond des cards
          200: "#EDE9E3",   // bordures légères
          300: "#D6D0C8",   // bordures visibles
          400: "#B8B0A4",   // texte très discret
          500: "#8C8278",   // texte secondaire
          600: "#5C554D",   // texte principal
          700: "#3D3830",   // texte foncé
          900: "#1A1714",   // texte très foncé
        },
        // Orange — accent principal (notre couleur logo)
        orange: {
          50: "#FFF8F0",
          100: "#FEEBD5",
          200: "#FDD0A0",
          300: "#FBB060",
          400: "#F99030",
          500: "#F59E0B",   // jaune-orange logo
          600: "#EA580C",   // orange logo
          700: "#C2410C",
          800: "#9A3412",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card': '0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}