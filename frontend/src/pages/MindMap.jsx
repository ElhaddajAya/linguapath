// MindMap.jsx
// Arbre 4 niveaux : Root → Langue → Thème → Pattern → Phrase
// Clic Langue   → seule cette langue + ses enfants visibles
// Clic Thème    → seul ce thème + ses patterns + phrases visible
// Clic Pattern  → seul ce pattern + ses phrases visible
// Bouton Retour → remonte d'un niveau

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  FolderOpen,
  Diamond,
  Pin,
  X,
  ArrowLeft,
  Bot,
  PenLine,
  Map,
  BookOpen,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Download,
} from "lucide-react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Panel,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  getNodesBounds,
  getViewportForBounds,
} from "reactflow";
import "reactflow/dist/style.css";
import Navbar from "../components/NavBar";
import api from "../services/api";

// ── Constantes ────────────────────────────────────────────────────────────
const LANGUE_EMOJI = {
  Anglais: "🇬🇧",
  Espagnol: "🇪🇸",
  Français: "🇫🇷",
  Allemand: "🇩🇪",
  Coréen: "🇰🇷",
  Japonais: "🇯🇵",
  Chinois: "🇨🇳",
  Arabe: "🇸🇦",
};
const NIVEAU_COLOR = {
  A1: "#10B981",
  A2: "#34D399",
  B1: "#F59E0B",
  B2: "#F97316",
  C1: "#EF4444",
  C2: "#7C3AED",
};

// ── Positionnement en cercle ──────────────────────────────────────────────
const enCercle = (cx, cy, rayon, total, index) => {
  const angle =
    total === 1 ? -Math.PI / 2 : -Math.PI / 2 + (2 * Math.PI * index) / total;
  return { x: cx + Math.cos(angle) * rayon, y: cy + Math.sin(angle) * rayon };
};

// ── Handles invisibles (nécessaires pour que React Flow trace les edges) ──
const Handles = () => (
  <>
    {[Position.Top, Position.Bottom, Position.Left, Position.Right].map(
      (pos) => (
        <Handle
          key={`t-${pos}`}
          type='target'
          position={pos}
          style={{ opacity: 0, pointerEvents: "none" }}
        />
      ),
    )}
    {[Position.Top, Position.Bottom, Position.Left, Position.Right].map(
      (pos) => (
        <Handle
          key={`s-${pos}`}
          type='source'
          position={pos}
          style={{ opacity: 0, pointerEvents: "none" }}
        />
      ),
    )}
  </>
);

// ── Nœud Racine ──────────────────────────────────────────────────────────
function RootNode({ data }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #F59E0B, #EA580C)",
        borderRadius: "50%",
        width: 110,
        height: 110,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 32px rgba(245,158,11,0.4)",
        border: "3px solid rgba(255,255,255,0.3)",
        position: "relative",
      }}
    >
      <Handles />
      <Globe
        size={26}
        color='white'
      />
      <span
        style={{ color: "white", fontWeight: 700, fontSize: 11, marginTop: 4 }}
      >
        LinguaTalk
      </span>
      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>
        {data.count} phrases
      </span>
    </div>
  );
}

// ── Nœud Langue ──────────────────────────────────────────────────────────
function LangueNode({ data }) {
  return (
    <div
      onClick={data.onClick}
      style={{
        background: data.dimmed
          ? "#F5F5F4"
          : data.selected
            ? "linear-gradient(135deg,#FEF3C7,#FDE68A)"
            : "white",
        border: `2px solid ${data.dimmed ? "#E7E5E4" : "#F59E0B"}`,
        borderRadius: 16,
        padding: "10px 18px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: data.selected
          ? "0 6px 24px rgba(245,158,11,0.35)"
          : "0 4px 16px rgba(245,158,11,0.15)",
        minWidth: 130,
        opacity: data.dimmed ? 0.3 : 1,
        cursor: data.onClick ? "pointer" : "default",
        transform: data.selected ? "scale(1.08)" : "scale(1)",
        transition: "all 0.25s ease",
        position: "relative",
      }}
    >
      <Handles />
      {LANGUE_EMOJI[data.label] ? (
        <span style={{ fontSize: 20 }}>{LANGUE_EMOJI[data.label]}</span>
      ) : (
        <Globe
          size={20}
          color={data.dimmed ? "#A8A29E" : "#F59E0B"}
        />
      )}
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: data.dimmed ? "#A8A29E" : "#1C1917",
          }}
        >
          {data.label}
        </div>
        <div style={{ fontSize: 10, color: "#78716C" }}>
          {data.count} phrase{data.count > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

// ── Nœud Thème ───────────────────────────────────────────────────────────
function ThemeNode({ data }) {
  return (
    <div
      onClick={data.onClick}
      style={{
        background: data.dimmed
          ? "#F5F5F4"
          : data.selected
            ? "#FEF3C7"
            : "#FFF7ED",
        border: `1.5px solid ${data.dimmed ? "#E7E5E4" : data.selected ? "#F59E0B" : "#FED7AA"}`,
        borderRadius: 12,
        padding: "7px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        boxShadow: data.selected
          ? "0 4px 16px rgba(245,158,11,0.3)"
          : "0 2px 8px rgba(234,88,12,0.1)",
        opacity: data.dimmed ? 0.25 : 1,
        cursor: data.onClick ? "pointer" : "default",
        transform: data.selected ? "scale(1.06)" : "scale(1)",
        transition: "all 0.25s ease",
        position: "relative",
      }}
    >
      <Handles />
      <FolderOpen
        size={14}
        color={data.dimmed ? "#A8A29E" : "#EA580C"}
      />
      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 12,
            color: data.dimmed ? "#A8A29E" : "#EA580C",
          }}
        >
          {data.label}
        </div>
        <div
          style={{ fontSize: 10, color: data.dimmed ? "#C4B5AC" : "#9A3412" }}
        >
          {data.count} phrase{data.count > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

// ── Nœud Pattern ─────────────────────────────────────────────────────────
function PatternNode({ data }) {
  return (
    <div
      onClick={data.onClick}
      style={{
        background: data.dimmed
          ? "#F5F5F4"
          : data.selected
            ? "#EDE9FE"
            : "#F5F3FF",
        border: `1.5px solid ${data.dimmed ? "#E7E5E4" : data.selected ? "#7C3AED" : "#C4B5FD"}`,
        borderRadius: 10,
        padding: "6px 12px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        boxShadow: data.selected
          ? "0 4px 16px rgba(124,58,237,0.3)"
          : "0 2px 8px rgba(124,58,237,0.1)",
        opacity: data.dimmed ? 0.25 : 1,
        cursor: data.onClick ? "pointer" : "default",
        transform: data.selected ? "scale(1.06)" : "scale(1)",
        transition: "all 0.25s ease",
        position: "relative",
        maxWidth: 160,
      }}
    >
      <Handles />
      <Diamond
        size={13}
        color={data.dimmed ? "#A8A29E" : "#7C3AED"}
      />
      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 11,
            color: data.dimmed ? "#A8A29E" : "#7C3AED",
            lineHeight: 1.3,
          }}
        >
          {data.label}
        </div>
        <div
          style={{ fontSize: 9, color: data.dimmed ? "#C4B5AC" : "#6D28D9" }}
        >
          {data.count} phrase{data.count > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

// ── Nœud Phrase ──────────────────────────────────────────────────────────
function PhraseNode({ data, selected: rfSelected }) {
  const niveauColor = NIVEAU_COLOR[data.niveau] || "#9CA3AF";
  return (
    <div
      style={{
        background: rfSelected ? "#FFFBEB" : data.dimmed ? "#FAFAF9" : "white",
        border: rfSelected
          ? "2px solid #F59E0B"
          : data.dimmed
            ? "1px solid #E7E5E4"
            : "1.5px solid #E7E5E4",
        borderRadius: 10,
        padding: "8px 12px",
        maxWidth: 160,
        boxShadow: rfSelected
          ? "0 4px 16px rgba(245,158,11,0.25)"
          : "0 2px 6px rgba(0,0,0,0.06)",
        opacity: data.dimmed ? 0.2 : 1,
        cursor: data.dimmed ? "default" : "pointer",
        transition: "all 0.25s ease",
        position: "relative",
      }}
    >
      <Handles />
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#1C1917",
          lineHeight: 1.4,
          marginBottom: 4,
        }}
      >
        {data.label}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "#78716C",
          fontStyle: "italic",
          lineHeight: 1.3,
          marginBottom: 6,
        }}
      >
        {data.traduction}
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 9,
            padding: "2px 6px",
            borderRadius: 999,
            background: niveauColor + "20",
            color: niveauColor,
            fontWeight: 600,
          }}
        >
          {data.niveau}
        </span>
        <span
          style={{
            fontSize: 9,
            padding: "2px 6px",
            borderRadius: 999,
            background: data.source === "auto" ? "#EFF6FF" : "#F0FDF4",
            color: data.source === "auto" ? "#3B82F6" : "#16A34A",
          }}
        >
          {data.source === "auto" ? <Bot size={9} /> : <PenLine size={9} />}
        </span>
      </div>
    </div>
  );
}

const nodeTypes = {
  rootNode: RootNode,
  langueNode: LangueNode,
  themeNode: ThemeNode,
  patternNode: PatternNode,
  phraseNode: PhraseNode,
};

// ════════════════════════════════════════════════════════════════════════════
// Construction de l'arbre COMPLET (4 niveaux : langue → thème → pattern → phrase)
// ════════════════════════════════════════════════════════════════════════════
function construireArbreComplet(entries) {
  const nodes = [],
    edges = [];
  const CX = 0,
    CY = 0;
  const RAYON_LANGUE = 400;
  const RAYON_THEME = 240;
  const RAYON_PATTERN = 190;
  const RAYON_PHRASE = 150;

  nodes.push({
    id: "root",
    type: "rootNode",
    data: { count: entries.length },
    position: { x: CX, y: CY },
  });

  // Grouper : langue → theme → pattern → phrases
  const arbre = {};
  for (const e of entries) {
    if (!arbre[e.langue]) arbre[e.langue] = {};
    if (!arbre[e.langue][e.theme]) arbre[e.langue][e.theme] = {};
    const pat = e.pattern || "Général";
    if (!arbre[e.langue][e.theme][pat]) arbre[e.langue][e.theme][pat] = [];
    arbre[e.langue][e.theme][pat].push(e);
  }

  const langues = Object.keys(arbre);
  langues.forEach((lang, iLang) => {
    const posLang = enCercle(CX, CY, RAYON_LANGUE, langues.length, iLang);
    const langueId = `langue-${lang}`;
    const totalLang = Object.values(arbre[lang])
      .flatMap((t) => Object.values(t))
      .flat().length;
    const angleLang =
      langues.length === 1
        ? -Math.PI / 2
        : -Math.PI / 2 + (2 * Math.PI * iLang) / langues.length;

    nodes.push({
      id: langueId,
      type: "langueNode",
      data: { label: lang, count: totalLang, langueKey: lang },
      position: posLang,
    });
    edges.push({
      id: `e-root-${langueId}`,
      source: "root",
      target: langueId,
      type: "smoothstep",
      style: { stroke: "#F59E0B", strokeWidth: 2 },
    });

    const themes = Object.keys(arbre[lang]);
    themes.forEach((theme, iTheme) => {
      const spreadTheme =
        themes.length === 1
          ? 0
          : Math.PI * 0.85 * (iTheme / (themes.length - 1) - 0.5);
      const angleTheme = angleLang + spreadTheme;
      const posTheme = {
        x: posLang.x + Math.cos(angleTheme) * RAYON_THEME,
        y: posLang.y + Math.sin(angleTheme) * RAYON_THEME,
      };
      const themeId = `theme-${lang}-${theme}`;
      const totalTheme = Object.values(arbre[lang][theme]).flat().length;

      nodes.push({
        id: themeId,
        type: "themeNode",
        data: {
          label: theme,
          count: totalTheme,
          langueKey: lang,
          themeKey: theme,
        },
        position: posTheme,
      });
      edges.push({
        id: `e-${langueId}-${themeId}`,
        source: langueId,
        target: themeId,
        type: "smoothstep",
        style: { stroke: "#EA580C", strokeWidth: 1.5 },
      });

      const patterns = Object.keys(arbre[lang][theme]);
      patterns.forEach((pat, iPat) => {
        const spreadPattern =
          patterns.length === 1
            ? 0
            : Math.PI * 0.7 * (iPat / (patterns.length - 1) - 0.5);
        const anglePattern = angleTheme + spreadPattern;
        const posPattern = {
          x: posTheme.x + Math.cos(anglePattern) * RAYON_PATTERN,
          y: posTheme.y + Math.sin(anglePattern) * RAYON_PATTERN,
        };
        const patternId = `pattern-${lang}-${theme}-${pat}`;
        const phrases = arbre[lang][theme][pat];

        nodes.push({
          id: patternId,
          type: "patternNode",
          data: {
            label: pat,
            count: phrases.length,
            langueKey: lang,
            themeKey: theme,
            patternKey: pat,
          },
          position: posPattern,
        });
        edges.push({
          id: `e-${themeId}-${patternId}`,
          source: themeId,
          target: patternId,
          type: "smoothstep",
          style: { stroke: "#7C3AED", strokeWidth: 1.5 },
        });

        phrases.forEach((entry, iPhrase) => {
          const spreadPhrase =
            phrases.length === 1
              ? 0
              : Math.PI * 0.55 * (iPhrase / (phrases.length - 1) - 0.5);
          const anglePhrase = anglePattern + spreadPhrase;
          const posPhrase = {
            x: posPattern.x + Math.cos(anglePhrase) * RAYON_PHRASE,
            y: posPattern.y + Math.sin(anglePhrase) * RAYON_PHRASE,
          };
          const phraseId = `phrase-${entry._id}`;

          nodes.push({
            id: phraseId,
            type: "phraseNode",
            data: {
              label: entry.phrase,
              traduction: entry.traduction,
              niveau: entry.niveau,
              source: entry.source,
              entryId: entry._id,
              langueKey: lang,
              themeKey: theme,
              patternKey: pat,
            },
            position: posPhrase,
          });
          edges.push({
            id: `e-${patternId}-${phraseId}`,
            source: patternId,
            target: phraseId,
            type: "smoothstep",
            style: { stroke: "#D1D5DB", strokeWidth: 1 },
          });
        });
      });
    });
  });

  return { nodes, edges };
}

// ════════════════════════════════════════════════════════════════════════════
// Applique le filtre visuel (dimmed/selected) selon la vue courante
// ════════════════════════════════════════════════════════════════════════════
function appliquerFiltre(
  nodesBase,
  edgesBase,
  vue,
  langSel,
  themeSel,
  patSel,
  onSelectLangue,
  onSelectTheme,
  onSelectPattern,
) {
  const nodesFiltrés = nodesBase.map((node) => {
    const d = node.data;
    let dimmed = false;
    let selected = false;
    let onClick = undefined;

    if (node.type === "langueNode") {
      if (vue === "root") {
        onClick = () => onSelectLangue(d.langueKey);
      } else if (vue === "langue") {
        selected = d.langueKey === langSel;
        dimmed = !selected;
      } else {
        dimmed = d.langueKey !== langSel;
      }
    }

    if (node.type === "themeNode") {
      if (vue === "root") {
        // visible, pas cliquable
      } else if (vue === "langue") {
        dimmed = d.langueKey !== langSel;
        onClick = !dimmed
          ? () => onSelectTheme(d.langueKey, d.themeKey)
          : undefined;
      } else if (vue === "theme") {
        selected = d.langueKey === langSel && d.themeKey === themeSel;
        dimmed = !selected;
      } else if (vue === "pattern") {
        dimmed = !(d.langueKey === langSel && d.themeKey === themeSel);
      }
    }

    if (node.type === "patternNode") {
      if (vue === "root") {
        // visible, pas cliquable
      } else if (vue === "langue") {
        dimmed = d.langueKey !== langSel;
      } else if (vue === "theme") {
        dimmed = !(d.langueKey === langSel && d.themeKey === themeSel);
        onClick = !dimmed
          ? () => onSelectPattern(d.langueKey, d.themeKey, d.patternKey)
          : undefined;
      } else if (vue === "pattern") {
        selected =
          d.langueKey === langSel &&
          d.themeKey === themeSel &&
          d.patternKey === patSel;
        dimmed = !selected;
      }
    }

    if (node.type === "phraseNode") {
      if (vue === "root") {
        // tout visible
      } else if (vue === "langue") {
        dimmed = d.langueKey !== langSel;
      } else if (vue === "theme") {
        dimmed = !(d.langueKey === langSel && d.themeKey === themeSel);
      } else if (vue === "pattern") {
        dimmed = !(
          d.langueKey === langSel &&
          d.themeKey === themeSel &&
          d.patternKey === patSel
        );
      }
    }

    return { ...node, data: { ...d, dimmed, selected, onClick } };
  });

  const dimmedIds = new Set(
    nodesFiltrés.filter((n) => n.data.dimmed).map((n) => n.id),
  );
  const edgesFiltrés = edgesBase.map((edge) => ({
    ...edge,
    style: {
      ...edge.style,
      opacity:
        dimmedIds.has(edge.source) || dimmedIds.has(edge.target) ? 0.15 : 1,
    },
  }));

  return { nodes: nodesFiltrés, edges: edgesFiltrés };
}

// ════════════════════════════════════════════════════════════════════════════
// Inner component
// ════════════════════════════════════════════════════════════════════════════
function MindMapInner({
  allEntries,
  loading,
  selectedPhrase,
  setSelectedPhrase,
  onExportReady,
}) {
  const navigate = useNavigate();
  const { fitView, getNodes } = useReactFlow();

  const exportPNG = useCallback(() => {
    const allNodes = getNodes();
    if (!allNodes.length) return;
    const nodesBounds = getNodesBounds(allNodes);
    const imageWidth = 1920;
    const imageHeight = 1080;
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.05,
      2,
      0.12,
    );
    const rfEl = document.querySelector(".react-flow__viewport");
    if (!rfEl) return;
    import("html-to-image").then(({ toPng }) => {
      toPng(rfEl, {
        backgroundColor: "#F7F9FC",
        width: imageWidth,
        height: imageHeight,
        style: {
          width: imageWidth + "px",
          height: imageHeight + "px",
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: "top left",
        },
      })
        .then((dataUrl) => {
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = "linguapath-mindmap.png";
          a.click();
        })
        .catch((err) => console.error("Export PNG failed:", err));
    });
  }, [getNodes]);

  useEffect(() => {
    if (onExportReady) onExportReady(() => exportPNG);
  }, [exportPNG, onExportReady]);

  const [vue, setVue] = useState("root");
  const [langue, setLangue] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pattern, setPattern] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { nodes: nodesBase, edges: edgesBase } = useMemo(
    () =>
      allEntries.length
        ? construireArbreComplet(allEntries)
        : { nodes: [], edges: [] },
    [allEntries],
  );

  const onSelectLangue = useCallback(
    (lang) => {
      setLangue(lang);
      setTheme(null);
      setPattern(null);
      setVue("langue");
      setSelectedPhrase(null);
    },
    [setSelectedPhrase],
  );

  const onSelectTheme = useCallback(
    (lang, th) => {
      setLangue(lang);
      setTheme(th);
      setPattern(null);
      setVue("theme");
      setSelectedPhrase(null);
    },
    [setSelectedPhrase],
  );

  const onSelectPattern = useCallback(
    (lang, th, pat) => {
      setLangue(lang);
      setTheme(th);
      setPattern(pat);
      setVue("pattern");
      setSelectedPhrase(null);
    },
    [setSelectedPhrase],
  );

  const retour = useCallback(() => {
    setSelectedPhrase(null);
    if (vue === "pattern") {
      setPattern(null);
      setVue("theme");
    } else if (vue === "theme") {
      setTheme(null);
      setPattern(null);
      setVue("langue");
    } else {
      setLangue(null);
      setTheme(null);
      setPattern(null);
      setVue("root");
    }
  }, [vue, setSelectedPhrase]);

  useEffect(() => {
    if (!nodesBase.length) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const { nodes: n, edges: e } = appliquerFiltre(
      nodesBase,
      edgesBase,
      vue,
      langue,
      theme,
      pattern,
      onSelectLangue,
      onSelectTheme,
      onSelectPattern,
    );
    setNodes(n);
    setEdges(e);
    setTimeout(() => fitView({ padding: 0.15, duration: 600 }), 60);
  }, [nodesBase, edgesBase, vue, langue, theme, pattern]);

  const onNodeClick = useCallback(
    (_, node) => {
      if (node.type === "phraseNode" && !node.data.dimmed) {
        setSelectedPhrase(node.data);
      }
    },
    [setSelectedPhrase],
  );

  const filAriane = useMemo(() => {
    const p = [{ label: "LinguaTalk" }];
    if (langue)
      p.push({ label: `${LANGUE_EMOJI[langue] || ""} ${langue}`.trim() });
    if (theme) p.push({ label: theme });
    if (pattern) p.push({ label: pattern });
    return p;
  }, [langue, theme, pattern]);

  const hintTexte =
    vue === "root"
      ? "— clique sur une langue pour zoomer"
      : vue === "langue"
        ? "— clique sur un thème pour voir les patterns"
        : vue === "theme"
          ? "— clique sur un pattern pour voir les phrases"
          : null;

  return (
    <div className='flex flex-col md:flex-row flex-1 px-3 md:px-10 pb-4 md:pb-8 gap-3 md:gap-4'>
      <div
        className='flex-1 bg-white rounded-2xl border border-warm-200 shadow-soft overflow-hidden'
        style={{ minHeight: 400 }}
      >
        {loading ? (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <div className='w-10 h-10 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4' />
              <p className='text-warm-400 text-sm'>
                Construction de la MindMap...
              </p>
            </div>
          </div>
        ) : !allEntries.length ? (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <Map
                size={48}
                className='text-warm-300 mx-auto mb-4'
              />
              <p className='text-warm-600 font-medium mb-2'>
                Aucune phrase à visualiser
              </p>
              <p className='text-warm-400 text-sm mb-6'>
                Lance une conversation pour commencer à apprendre !
              </p>
              <button
                onClick={() => navigate("/scenarios")}
                className='px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity'
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                }}
              >
                Choisir un scénario
              </button>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.1}
            maxZoom={2}
            nodesConnectable={false}
            defaultEdgeOptions={{ type: "smoothstep" }}
          >
            <Background
              color='#F5F5F4'
              gap={20}
              size={1}
            />
            <Controls
              showInteractive={false}
              style={{
                borderRadius: 12,
                border: "1px solid #E7E5E4",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            />
            {/* Fil d'Ariane + Retour */}
            <Panel position='top-center'>
              <div className='flex items-center gap-2 bg-white rounded-2xl border border-warm-200 shadow-soft px-4 py-2'>
                {vue !== "root" && (
                  <button
                    onClick={retour}
                    className='flex items-center gap-1 text-xs text-orange-500 font-semibold hover:text-orange-700 transition-colors mr-2'
                  >
                    <ArrowLeft size={13} /> Retour
                  </button>
                )}
                {filAriane.map((part, i) => (
                  <span
                    key={i}
                    className='flex items-center gap-1'
                  >
                    {i > 0 && <span className='text-warm-300 text-xs'>/</span>}
                    <span
                      className={`text-xs ${i === filAriane.length - 1 ? "text-warm-800 font-semibold" : "text-warm-400"}`}
                    >
                      {part.label}
                    </span>
                  </span>
                ))}
                {hintTexte && (
                  <span className='text-warm-400 text-xs ml-1'>
                    {hintTexte}
                  </span>
                )}
              </div>
            </Panel>

            {/* Légende collapsible */}
            <Panel position='top-left'>
              <div className='bg-white rounded-xl border border-warm-200 shadow-soft text-xs text-warm-600 overflow-hidden'>
                {/* En-tête : toujours visible, clic pour toggle */}
                <button
                  onClick={() => setShowLegend((v) => !v)}
                  className='w-full flex items-center justify-between px-3 py-2.5
                    text-warm-800 font-semibold hover:bg-warm-50 transition-colors'
                >
                  <span>Légende</span>
                  {showLegend ? (
                    <ChevronUp
                      size={14}
                      className='text-warm-400 ml-4'
                    />
                  ) : (
                    <ChevronDown
                      size={14}
                      className='text-warm-400 ml-4'
                    />
                  )}
                </button>

                {/* Contenu masquable */}
                {showLegend && (
                  <div className='px-3 pb-3 flex flex-col gap-2 border-t border-warm-100'>
                    {[
                      { color: "#F59E0B", label: "Racine" },
                      { color: "#FCD34D", label: "Langue (cliquable)" },
                      { color: "#FED7AA", label: "Thème (cliquable)" },
                      { color: "#C4B5FD", label: "Pattern (cliquable)" },
                      { color: "#E7E5E4", label: "Phrase" },
                    ].map(({ color, label }) => (
                      <div
                        key={label}
                        className='flex items-center gap-2 mt-2'
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 3,
                            background: color,
                            flexShrink: 0,
                          }}
                        />
                        <span>{label}</span>
                      </div>
                    ))}
                    <div className='border-t border-warm-100 pt-2 text-warm-400'>
                      Clique sur une phrase pour les détails
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          </ReactFlow>
        )}
      </div>

      {/* Panel détail phrase */}
      {selectedPhrase && (
        <div className='w-full md:w-72 bg-white rounded-2xl border border-warm-200 shadow-soft p-4 md:p-5 flex flex-col gap-3 md:gap-4 self-start'>
          <div className='flex items-start justify-between'>
            <h3 className='font-semibold text-warm-900 text-sm flex items-center gap-1.5'>
              <Pin size={13} /> Phrase sélectionnée
            </h3>
            <button
              onClick={() => setSelectedPhrase(null)}
              className='text-warm-400 hover:text-warm-700'
            >
              <X size={16} />
            </button>
          </div>
          <div className='bg-warm-50 rounded-xl p-3'>
            <p className='text-warm-900 font-semibold text-base leading-relaxed'>
              {selectedPhrase.label}
            </p>
          </div>
          <div>
            <p className='text-xs font-medium text-warm-500 mb-1'>Traduction</p>
            <p className='text-warm-700 italic text-sm'>
              {selectedPhrase.traduction}
            </p>
          </div>
          {selectedPhrase.patternKey &&
            selectedPhrase.patternKey !== "Général" && (
              <div>
                <p className='text-xs font-medium text-warm-500 mb-1'>
                  Pattern
                </p>
                <p className='text-sm font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded-lg inline-block'>
                  {selectedPhrase.patternKey}
                </p>
              </div>
            )}
          <div className='flex gap-2 flex-wrap'>
            <span
              style={{
                background:
                  (NIVEAU_COLOR[selectedPhrase.niveau] || "#9CA3AF") + "20",
                color: NIVEAU_COLOR[selectedPhrase.niveau] || "#9CA3AF",
              }}
              className='text-xs px-2.5 py-1 rounded-full font-semibold'
            >
              Niveau {selectedPhrase.niveau}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${selectedPhrase.source === "auto" ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-600"}`}
            >
              {selectedPhrase.source === "auto" ? (
                <span className='flex items-center gap-1'>
                  <Bot size={11} /> Extrait auto
                </span>
              ) : (
                <span className='flex items-center gap-1'>
                  <PenLine size={11} /> Ajout manuel
                </span>
              )}
            </span>
          </div>
          <button
            onClick={() => navigate("/learning-log")}
            className='w-full py-2.5 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity'
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
          >
            <span className='flex items-center justify-center gap-1.5'>
              Voir dans le Learning Log <ArrowRight size={13} />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Composant principal exporté
// ════════════════════════════════════════════════════════════════════════════
export default function MindMap() {
  const navigate = useNavigate();

  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhrase, setSelectedPhrase] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const languesUser = user.langues?.map((l) => l.langue) || [];
  const [filtreLangue, setFiltreLangue] = useState("");
  const [exportFn, setExportFn] = useState(null);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtreLangue) params.langue = filtreLangue;
      const res = await api.get("/learning-log", { params });
      setAllEntries(res.data.entries || res.data || []);
    } catch (err) {
      console.error("Erreur chargement MindMap :", err.message);
    } finally {
      setLoading(false);
    }
  }, [filtreLangue]);

  useEffect(() => {
    charger();
  }, [charger]);

  return (
    <div className='min-h-screen bg-warm-50 flex flex-col'>
      <Navbar />

      <div className='px-4 md:px-10 py-4 md:py-6 flex items-center justify-between flex-wrap gap-3'>
        <div>
          <h1 className='text-xl md:text-2xl font-semibold text-warm-900 flex items-center gap-2'>
            <Map size={20} className='text-orange-500' />
            MindMap
          </h1>
          <p className='text-warm-500 text-xs sm:text-sm mt-1'>
            {allEntries.length} phrase{allEntries.length !== 1 ? "s" : ""}{" "}
            organisée{allEntries.length !== 1 ? "s" : ""} par langue → thème →
            pattern
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {languesUser.length > 1 && (
            <select
              value={filtreLangue}
              onChange={(e) => setFiltreLangue(e.target.value)}
              className='px-3 py-2 rounded-xl border border-warm-200 text-sm text-warm-700 bg-white focus:outline-none focus:border-orange-300'
            >
              <option value=''>Toutes les langues</option>
              {languesUser.map((l) => (
                <option
                  key={l}
                  value={l}
                >
                  {LANGUE_EMOJI[l]} {l}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => exportFn && exportFn()()}
            disabled={!allEntries.length}
            className='px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold text-white
              hover:opacity-90 transition-opacity flex items-center gap-1.5
              disabled:opacity-40 disabled:cursor-not-allowed'
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
          >
            <Download size={15} />
            <span className='hidden sm:inline'>Exporter PNG</span>
          </button>
        </div>
      </div>

      <ReactFlowProvider>
        <MindMapInner
          allEntries={allEntries}
          loading={loading}
          selectedPhrase={selectedPhrase}
          setSelectedPhrase={setSelectedPhrase}
          onExportReady={(fn) => setExportFn(fn)}
        />
      </ReactFlowProvider>
    </div>
  );
}
