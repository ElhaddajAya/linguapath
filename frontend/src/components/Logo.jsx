// Logo.jsx
// Composant réutilisable du logo LinguaPath.
// Props :
//   - size="full"   → logo complet avec tagline (pages Auth)
//   - size="navbar" → version compacte pour la Navbar

export default function Logo({ size = "navbar" }) {
  // ── Dégradé partagé — jaune → orange ──
  const GradientDefs = () => (
    <defs>
      <linearGradient
        id='iconGrad'
        x1='0%'
        y1='0%'
        x2='100%'
        y2='100%'
      >
        <stop
          offset='0%'
          stopColor='#F59E0B'
        />
        <stop
          offset='100%'
          stopColor='#EA580C'
        />
      </linearGradient>
    </defs>
  );

  // ── Texte "LinguaPath" avec dégradé sur "Path" ──
  const Wordmark = ({ size: s }) => (
    <div
      className={s === "full" ? "text-4xl" : "text-xl"}
      style={{
        fontFamily: "Georgia, serif",
        fontWeight: 700,
        letterSpacing: "-0.5px",
      }}
    >
      <span className='text-base-content'>Lingua</span>
      <span
        style={{
          background: "linear-gradient(to right, #F59E0B, #EA580C)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Path
      </span>
    </div>
  );

  // ══════════════════════════════════════
  // VERSION NAVBAR — icône 36x36 + texte
  // ══════════════════════════════════════
  if (size === "navbar") {
    return (
      <div className='flex items-center gap-2'>
        {/* Icône 36x36 */}
        <svg
          width='36'
          height='36'
          viewBox='0 0 36 36'
          xmlns='http://www.w3.org/2000/svg'
        >
          <GradientDefs />
          {/* Carré arrondi */}
          <rect
            width='36'
            height='36'
            rx='8'
            fill='url(#iconGrad)'
          />

          {/* "A" — ancré au centre x=18, légèrement décalé à gauche visuellement */}
          <text
            x='14'
            y='27'
            fontFamily='Georgia, serif'
            fontSize='21'
            fontWeight='700'
            fill='white'
            textAnchor='middle'
          >
            A
          </text>

          {/* "語" — superposé à droite */}
          <text
            x='24'
            y='25'
            fontFamily='serif'
            fontSize='13'
            fill='white'
            opacity='0.55'
            textAnchor='middle'
          >
            語
          </text>
        </svg>

        <Wordmark size='navbar' />
      </div>
    );
  }

  // ══════════════════════════════════════
  // VERSION FULL — icône 88x88 + wordmark + tagline
  // ══════════════════════════════════════
  return (
    <div className='flex flex-col items-center gap-2'>
      {/* Icône 88x88 */}
      <svg
        width='88'
        height='88'
        viewBox='0 0 88 88'
        xmlns='http://www.w3.org/2000/svg'
      >
        <GradientDefs />
        <rect
          width='88'
          height='88'
          rx='20'
          fill='url(#iconGrad)'
        />

        {/* "A" centré légèrement gauche */}
        <text
          x='37'
          y='67'
          fontFamily='Georgia, serif'
          fontSize='58'
          fontWeight='700'
          fill='white'
          textAnchor='middle'
        >
          A
        </text>

        {/* "語" superposé droite */}
        <text
          x='62'
          y='64'
          fontFamily='serif'
          fontSize='34'
          fill='white'
          opacity='0.52'
          textAnchor='middle'
        >
          語
        </text>
      </svg>

      <Wordmark size='full' />

      {/* Tagline */}
      <p className='text-xs font-medium tracking-widest text-base-content/40'>
        LEARN · SPEAK · GROW
      </p>
    </div>
  );
}
