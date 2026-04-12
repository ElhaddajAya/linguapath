// Logo.jsx
// Props :
//   - size="full"   → logo complet avec tagline (pages Auth)
//   - size="navbar" → version compacte pour la Navbar

export default function Logo({ size = "navbar" }) {
  // Dégradé orange réutilisable
  const GradDefs = ({ id }) => (
    <defs>
      <linearGradient
        id={id}
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

  // "LinguaPath" avec Path en dégradé
  const Wordmark = ({ big }) => (
    <div
      style={{
        fontFamily: "Georgia, serif",
        fontWeight: 700,
        fontSize: big ? "2.25rem" : "1.25rem",
        letterSpacing: "-0.5px",
        lineHeight: 1,
      }}
    >
      <span style={{ color: "#1A1714" }}>Lingua</span>
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

  // ── VERSION NAVBAR ──
  if (size === "navbar") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <svg
          width='38'
          height='42'
          viewBox='0 0 38 42'
          xmlns='http://www.w3.org/2000/svg'
        >
          <GradDefs id='gNav' />
          {/* Bulle de message : rect arrondi + queue bas-gauche */}
          <rect
            x='0'
            y='0'
            width='38'
            height='32'
            rx='9'
            fill='url(#gNav)'
          />
          <polygon
            points='4,32 0,42 14,32'
            fill='url(#gNav)'
          />
          {/* A + 語 centrés dans la bulle */}
          <text
            x='11'
            y='24'
            fontFamily='Georgia, serif'
            fontSize='18'
            fontWeight='700'
            fill='white'
            textAnchor='middle'
          >
            A
          </text>
          <text
            x='27'
            y='23'
            fontFamily='serif'
            fontSize='13'
            fontWeight='700'
            fill='white'
            opacity='0.9'
            textAnchor='middle'
          >
            語
          </text>
        </svg>
        <Wordmark big={false} />
      </div>
    );
  }

  // ── VERSION FULL ──
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <svg
        width='90'
        height='104'
        viewBox='0 0 90 104'
        xmlns='http://www.w3.org/2000/svg'
      >
        <GradDefs id='gFull' />
        {/* Bulle de message grande */}
        <rect
          x='0'
          y='0'
          width='90'
          height='80'
          rx='20'
          fill='url(#gFull)'
        />
        <polygon
          points='10,80 0,104 34,80'
          fill='url(#gFull)'
        />
        {/* A + 語 bien centrés et tous deux visibles */}
        <text
          x='30'
          y='58'
          fontFamily='Georgia, serif'
          fontSize='48'
          fontWeight='700'
          fill='white'
          textAnchor='middle'
        >
          A
        </text>
        <text
          x='66'
          y='55'
          fontFamily='serif'
          fontSize='32'
          fontWeight='700'
          fill='white'
          opacity='0.9'
          textAnchor='middle'
        >
          語
        </text>
      </svg>
      <Wordmark big={true} />
      <p
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.25em",
          color: "#B8B0A4",
          margin: 0,
        }}
      >
        LEARN · SPEAK · GROW
      </p>
    </div>
  );
}
