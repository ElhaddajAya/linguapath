// MindMap.jsx
// Vue root  → Racine + Langues + Thèmes + Phrases (tout affiché)
// Clic Langue → seule cette langue + ses thèmes + ses phrases restent
// Clic Thème  → seul ce thème + ses phrases reste
// Bouton Retour → remonte d'un niveau

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  Panel, Handle, Position,
  useReactFlow, ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import Navbar from "../components/NavBar";
import api from "../services/api";

// ── Constantes ────────────────────────────────────────────────────────────
const LANGUE_EMOJI = {
  Anglais: "🇬🇧", Espagnol: "🇪🇸", Français: "🇫🇷",
  Allemand: "🇩🇪", Coréen: "🇰🇷", Japonais: "🇯🇵",
  Chinois: "🇨🇳", Arabe: "🇸🇦",
};
const NIVEAU_COLOR = {
  A1: "#10B981", A2: "#34D399", B1: "#F59E0B",
  B2: "#F97316", C1: "#EF4444", C2: "#7C3AED",
};

// ── Positionnement en cercle ──────────────────────────────────────────────
const enCercle = (cx, cy, rayon, total, index) => {
  const angle = total === 1
    ? -Math.PI / 2
    : -Math.PI / 2 + (2 * Math.PI * index) / total;
  return { x: cx + Math.cos(angle) * rayon, y: cy + Math.sin(angle) * rayon };
};

// ── Handles invisibles (nécessaires pour que React Flow trace les edges) ──
const Handles = () => (
  <>
    {[Position.Top, Position.Bottom, Position.Left, Position.Right].map(pos => (
      <Handle key={`t-${pos}`} type="target" position={pos} style={{ opacity: 0, pointerEvents: "none" }} />
    ))}
    {[Position.Top, Position.Bottom, Position.Left, Position.Right].map(pos => (
      <Handle key={`s-${pos}`} type="source" position={pos} style={{ opacity: 0, pointerEvents: "none" }} />
    ))}
  </>
);

// ── Nœud Racine ──────────────────────────────────────────────────────────
function RootNode({ data }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #F59E0B, #EA580C)",
      borderRadius: "50%", width: 110, height: 110,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      boxShadow: "0 8px 32px rgba(245,158,11,0.4)",
      border: "3px solid rgba(255,255,255,0.3)",
      position: "relative",
    }}>
      <Handles />
      <span style={{ fontSize: 26 }}>🌍</span>
      <span style={{ color: "white", fontWeight: 700, fontSize: 11, marginTop: 4 }}>LinguaPath</span>
      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>{data.count} phrases</span>
    </div>
  );
}

// ── Nœud Langue ──────────────────────────────────────────────────────────
function LangueNode({ data }) {
  return (
    <div onClick={data.onClick} style={{
      background: data.dimmed ? "#F5F5F4" : data.selected ? "linear-gradient(135deg,#FEF3C7,#FDE68A)" : "white",
      border: `2px solid ${data.dimmed ? "#E7E5E4" : "#F59E0B"}`,
      borderRadius: 16, padding: "10px 18px",
      display: "flex", alignItems: "center", gap: 8,
      boxShadow: data.selected ? "0 6px 24px rgba(245,158,11,0.35)" : "0 4px 16px rgba(245,158,11,0.15)",
      minWidth: 130, opacity: data.dimmed ? 0.3 : 1,
      cursor: data.onClick ? "pointer" : "default",
      transform: data.selected ? "scale(1.08)" : "scale(1)",
      transition: "all 0.25s ease", position: "relative",
    }}>
      <Handles />
      <span style={{ fontSize: 20 }}>{LANGUE_EMOJI[data.label] || "🌍"}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: data.dimmed ? "#A8A29E" : "#1C1917" }}>{data.label}</div>
        <div style={{ fontSize: 10, color: "#78716C" }}>{data.count} phrase{data.count > 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}

// ── Nœud Thème ───────────────────────────────────────────────────────────
function ThemeNode({ data }) {
  return (
    <div onClick={data.onClick} style={{
      background: data.dimmed ? "#F5F5F4" : data.selected ? "#FEF3C7" : "#FFF7ED",
      border: `1.5px solid ${data.dimmed ? "#E7E5E4" : data.selected ? "#F59E0B" : "#FED7AA"}`,
      borderRadius: 12, padding: "7px 14px",
      display: "flex", alignItems: "center", gap: 6,
      boxShadow: data.selected ? "0 4px 16px rgba(245,158,11,0.3)" : "0 2px 8px rgba(234,88,12,0.1)",
      opacity: data.dimmed ? 0.25 : 1,
      cursor: data.onClick ? "pointer" : "default",
      transform: data.selected ? "scale(1.06)" : "scale(1)",
      transition: "all 0.25s ease", position: "relative",
    }}>
      <Handles />
      <span style={{ fontSize: 14 }}>📂</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 12, color: data.dimmed ? "#A8A29E" : "#EA580C" }}>{data.label}</div>
        <div style={{ fontSize: 10, color: data.dimmed ? "#C4B5AC" : "#9A3412" }}>{data.count} phrase{data.count > 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}

// ── Nœud Phrase ──────────────────────────────────────────────────────────
function PhraseNode({ data, selected: rfSelected }) {
  const niveauColor = NIVEAU_COLOR[data.niveau] || "#9CA3AF";
  return (
    <div style={{
      background: rfSelected ? "#FFFBEB" : data.dimmed ? "#FAFAF9" : "white",
      border: rfSelected ? "2px solid #F59E0B" : data.dimmed ? "1px solid #E7E5E4" : "1.5px solid #E7E5E4",
      borderRadius: 10, padding: "8px 12px", maxWidth: 160,
      boxShadow: rfSelected ? "0 4px 16px rgba(245,158,11,0.25)" : "0 2px 6px rgba(0,0,0,0.06)",
      opacity: data.dimmed ? 0.2 : 1,
      cursor: data.dimmed ? "default" : "pointer",
      transition: "all 0.25s ease", position: "relative",
    }}>
      <Handles />
      <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1917", lineHeight: 1.4, marginBottom: 4 }}>{data.label}</div>
      <div style={{ fontSize: 10, color: "#78716C", fontStyle: "italic", lineHeight: 1.3, marginBottom: 6 }}>{data.traduction}</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 999, background: niveauColor + "20", color: niveauColor, fontWeight: 600 }}>{data.niveau}</span>
        <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 999, background: data.source === "auto" ? "#EFF6FF" : "#F0FDF4", color: data.source === "auto" ? "#3B82F6" : "#16A34A" }}>
          {data.source === "auto" ? "🤖" : "✍️"}
        </span>
      </div>
    </div>
  );
}

const nodeTypes = { rootNode: RootNode, langueNode: LangueNode, themeNode: ThemeNode, phraseNode: PhraseNode };

// ════════════════════════════════════════════════════════════════════════════
// Construction de l'arbre COMPLET (vue root = tout affiché)
// Retourne nodes + edges avec positions calculées
// ════════════════════════════════════════════════════════════════════════════
function construireArbreComplet(entries) {
  const nodes = [], edges = [];
  const CX = 0, CY = 0;
  const RAYON_LANGUE = 320;
  const RAYON_THEME  = 220;
  const RAYON_PHRASE = 170;

  nodes.push({
    id: "root", type: "rootNode",
    data: { count: entries.length },
    position: { x: CX, y: CY },
  });

  // Grouper : langue → theme → phrases
  const arbre = {};
  for (const e of entries) {
    if (!arbre[e.langue]) arbre[e.langue] = {};
    if (!arbre[e.langue][e.theme]) arbre[e.langue][e.theme] = [];
    arbre[e.langue][e.theme].push(e);
  }

  const langues = Object.keys(arbre);
  langues.forEach((lang, iLang) => {
    const posLang  = enCercle(CX, CY, RAYON_LANGUE, langues.length, iLang);
    const langueId = `langue-${lang}`;
    const totalLang = Object.values(arbre[lang]).flat().length;
    const angleLang = langues.length === 1
      ? -Math.PI / 2
      : -Math.PI / 2 + (2 * Math.PI * iLang) / langues.length;

    nodes.push({
      id: langueId, type: "langueNode",
      data: { label: lang, count: totalLang, langueKey: lang },
      position: posLang,
    });
    edges.push({
      id: `e-root-${langueId}`, source: "root", target: langueId,
      type: "smoothstep", style: { stroke: "#F59E0B", strokeWidth: 2 },
    });

    const themes = Object.keys(arbre[lang]);
    themes.forEach((theme, iTheme) => {
      const spreadAngle = themes.length === 1
        ? 0
        : (Math.PI * 0.85) * (iTheme / (themes.length - 1) - 0.5);
      const angleTheme = angleLang + spreadAngle;
      const posTheme = {
        x: posLang.x + Math.cos(angleTheme) * RAYON_THEME,
        y: posLang.y + Math.sin(angleTheme) * RAYON_THEME,
      };
      const themeId = `theme-${lang}-${theme}`;
      const phrases = arbre[lang][theme];

      nodes.push({
        id: themeId, type: "themeNode",
        data: { label: theme, count: phrases.length, langueKey: lang, themeKey: theme },
        position: posTheme,
      });
      edges.push({
        id: `e-${langueId}-${themeId}`, source: langueId, target: themeId,
        type: "smoothstep", style: { stroke: "#EA580C", strokeWidth: 1.5 },
      });

      phrases.forEach((entry, iPhrase) => {
        const spreadPhrase = phrases.length === 1
          ? 0
          : (Math.PI * 0.7) * (iPhrase / (phrases.length - 1) - 0.5);
        const anglePhrase = angleTheme + spreadPhrase;
        const posPhrase = {
          x: posTheme.x + Math.cos(anglePhrase) * RAYON_PHRASE,
          y: posTheme.y + Math.sin(anglePhrase) * RAYON_PHRASE,
        };
        const phraseId = `phrase-${entry._id}`;

        nodes.push({
          id: phraseId, type: "phraseNode",
          data: {
            label: entry.phrase, traduction: entry.traduction,
            niveau: entry.niveau, source: entry.source,
            entryId: entry._id, langueKey: lang, themeKey: theme,
          },
          position: posPhrase,
        });
        edges.push({
          id: `e-${themeId}-${phraseId}`, source: themeId, target: phraseId,
          type: "smoothstep", style: { stroke: "#D1D5DB", strokeWidth: 1 },
        });
      });
    });
  });

  return { nodes, edges };
}

// ════════════════════════════════════════════════════════════════════════════
// Applique le filtre visuel (dimmed) selon la sélection courante
// ════════════════════════════════════════════════════════════════════════════
function appliquerFiltre(nodesBase, edgesBase, vue, langueSelectionnee, themeSelectionne, onSelectLangue, onSelectTheme) {
  const nodesFiltrés = nodesBase.map(node => {
    const d = node.data;
    let dimmed    = false;
    let selected  = false;
    let onClick   = undefined;

    if (node.type === "langueNode") {
      if (vue === "root") {
        onClick = () => onSelectLangue(d.langueKey);
      } else if (vue === "langue") {
        selected = d.langueKey === langueSelectionnee;
        dimmed   = !selected;
      } else if (vue === "theme") {
        dimmed = d.langueKey !== langueSelectionnee;
      }
    }

    if (node.type === "themeNode") {
      if (vue === "root") {
        // visible mais pas cliquable directement depuis root
      } else if (vue === "langue") {
        dimmed  = d.langueKey !== langueSelectionnee;
        onClick = !dimmed ? () => onSelectTheme(d.langueKey, d.themeKey) : undefined;
      } else if (vue === "theme") {
        selected = d.langueKey === langueSelectionnee && d.themeKey === themeSelectionne;
        dimmed   = !selected;
      }
    }

    if (node.type === "phraseNode") {
      if (vue === "root") {
        // tout visible
      } else if (vue === "langue") {
        dimmed = d.langueKey !== langueSelectionnee;
      } else if (vue === "theme") {
        dimmed = !(d.langueKey === langueSelectionnee && d.themeKey === themeSelectionne);
      }
    }

    return { ...node, data: { ...d, dimmed, selected, onClick } };
  });

  // Griser les edges qui mènent vers des nœuds dimmed
  const dimmedIds = new Set(nodesFiltrés.filter(n => n.data.dimmed).map(n => n.id));
  const edgesFiltrés = edgesBase.map(edge => ({
    ...edge,
    style: {
      ...edge.style,
      opacity: (dimmedIds.has(edge.source) || dimmedIds.has(edge.target)) ? 0.15 : 1,
    },
  }));

  return { nodes: nodesFiltrés, edges: edgesFiltrés };
}

// ════════════════════════════════════════════════════════════════════════════
// Inner component
// ════════════════════════════════════════════════════════════════════════════
function MindMapInner({ allEntries, loading, selectedPhrase, setSelectedPhrase }) {
  const navigate    = useNavigate();
  const { fitView } = useReactFlow();

  const [vue,    setVue]    = useState("root");
  const [langue, setLangue] = useState(null);
  const [theme,  setTheme]  = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Arbre complet calculé une seule fois
  const { nodes: nodesBase, edges: edgesBase } = useMemo(
    () => allEntries.length ? construireArbreComplet(allEntries) : { nodes: [], edges: [] },
    [allEntries]
  );

  const onSelectLangue = useCallback((lang) => {
    setLangue(lang); setTheme(null); setVue("langue"); setSelectedPhrase(null);
  }, [setSelectedPhrase]);

  const onSelectTheme = useCallback((lang, th) => {
    setLangue(lang); setTheme(th); setVue("theme"); setSelectedPhrase(null);
  }, [setSelectedPhrase]);

  const retour = useCallback(() => {
    setSelectedPhrase(null);
    if (vue === "theme")  { setTheme(null); setVue("langue"); }
    else                  { setLangue(null); setTheme(null); setVue("root"); }
  }, [vue, setSelectedPhrase]);

  // Re-calculer le filtre visuel à chaque changement de vue
  useEffect(() => {
    if (!nodesBase.length) { setNodes([]); setEdges([]); return; }
    const { nodes: n, edges: e } = appliquerFiltre(
      nodesBase, edgesBase, vue, langue, theme, onSelectLangue, onSelectTheme
    );
    setNodes(n);
    setEdges(e);
    setTimeout(() => fitView({ padding: 0.15, duration: 600 }), 60);
  }, [nodesBase, edgesBase, vue, langue, theme]);

  const onNodeClick = useCallback((_, node) => {
    if (node.type === "phraseNode" && !node.data.dimmed) {
      setSelectedPhrase(node.data);
    }
  }, [setSelectedPhrase]);

  // Fil d'Ariane
  const filAriane = useMemo(() => {
    const p = [{ label: "🌍 LinguaPath" }];
    if (langue) p.push({ label: `${LANGUE_EMOJI[langue] || "🌍"} ${langue}` });
    if (theme)  p.push({ label: `📂 ${theme}` });
    return p;
  }, [langue, theme]);

  return (
    <div className="flex flex-1 px-6 md:px-10 pb-8 gap-4">
      <div
        className="flex-1 bg-white rounded-2xl border border-warm-200 shadow-soft overflow-hidden"
        style={{ minHeight: 550 }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-warm-400 text-sm">Construction de la MindMap...</p>
            </div>
          </div>
        ) : !allEntries.length ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-5xl mb-4">🗺️</p>
              <p className="text-warm-600 font-medium mb-2">Aucune phrase à visualiser</p>
              <p className="text-warm-400 text-sm mb-6">Lance une conversation pour commencer à apprendre !</p>
              <button onClick={() => navigate("/scenarios")}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}>
                Choisir un scénario
              </button>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick} nodeTypes={nodeTypes}
            fitView fitViewOptions={{ padding: 0.15 }}
            minZoom={0.15} maxZoom={2}
            nodesConnectable={false}
            defaultEdgeOptions={{ type: "smoothstep" }}
          >
            <Background color="#F5F5F4" gap={20} size={1} />
            <Controls showInteractive={false}
              style={{ borderRadius: 12, border: "1px solid #E7E5E4", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
            <MiniMap
              nodeColor={n => n.type === "rootNode" ? "#F59E0B" : n.type === "langueNode" ? "#FCD34D" : n.type === "themeNode" ? "#FED7AA" : "#E7E5E4"}
              style={{ borderRadius: 12, border: "1px solid #E7E5E4", overflow: "hidden" }}
              maskColor="rgba(245,245,244,0.7)" />

            {/* Fil d'Ariane + Retour */}
            <Panel position="top-center">
              <div className="flex items-center gap-2 bg-white rounded-2xl border border-warm-200 shadow-soft px-4 py-2">
                {vue !== "root" && (
                  <button onClick={retour}
                    className="flex items-center gap-1 text-xs text-orange-500 font-semibold hover:text-orange-700 transition-colors mr-2">
                    ← Retour
                  </button>
                )}
                {filAriane.map((part, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="text-warm-300 text-xs">/</span>}
                    <span className={`text-xs ${i === filAriane.length - 1 ? "text-warm-800 font-semibold" : "text-warm-400"}`}>
                      {part.label}
                    </span>
                  </span>
                ))}
                {vue === "root" && (
                  <span className="text-warm-400 text-xs ml-1">— clique sur une langue pour zoomer</span>
                )}
              </div>
            </Panel>

            {/* Légende */}
            <Panel position="top-left">
              <div className="bg-white rounded-xl border border-warm-200 shadow-soft p-3 text-xs text-warm-600 flex flex-col gap-2">
                <div className="font-semibold text-warm-800 mb-1">Légende</div>
                {[
                  { color: "#F59E0B", label: "Racine" },
                  { color: "#FCD34D", label: "Langue  (cliquable)" },
                  { color: "#FED7AA", label: "Thème  (cliquable)" },
                  { color: "#E7E5E4", label: "Phrase" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                    <span>{label}</span>
                  </div>
                ))}
                <div className="border-t border-warm-100 pt-2 text-warm-400">
                  Clique sur une phrase pour voir les détails
                </div>
              </div>
            </Panel>
          </ReactFlow>
        )}
      </div>

      {/* Panel détail phrase */}
      {selectedPhrase && (
        <div className="w-72 bg-white rounded-2xl border border-warm-200 shadow-soft p-5 flex flex-col gap-4 self-start">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-warm-900 text-sm">📌 Phrase sélectionnée</h3>
            <button onClick={() => setSelectedPhrase(null)} className="text-warm-400 hover:text-warm-700 text-lg leading-none">✕</button>
          </div>
          <div className="bg-warm-50 rounded-xl p-3">
            <p className="text-warm-900 font-semibold text-base leading-relaxed">{selectedPhrase.label}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-warm-500 mb-1">Traduction</p>
            <p className="text-warm-700 italic text-sm">{selectedPhrase.traduction}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span style={{ background: (NIVEAU_COLOR[selectedPhrase.niveau] || "#9CA3AF") + "20", color: NIVEAU_COLOR[selectedPhrase.niveau] || "#9CA3AF" }}
              className="text-xs px-2.5 py-1 rounded-full font-semibold">
              Niveau {selectedPhrase.niveau}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full ${selectedPhrase.source === "auto" ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-600"}`}>
              {selectedPhrase.source === "auto" ? "🤖 Extrait auto" : "✍️ Ajout manuel"}
            </span>
          </div>
          <button onClick={() => navigate("/learning-log")}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}>
            Voir dans le Learning Log →
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

  const [allEntries,     setAllEntries]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedPhrase, setSelectedPhrase] = useState(null);

  const user        = JSON.parse(localStorage.getItem("user") || "{}");
  const languesUser = user.langues?.map((l) => l.langue) || [];
  const [filtreLangue, setFiltreLangue] = useState("");

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

  useEffect(() => { charger(); }, [charger]);

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <Navbar />

      <div className="px-6 md:px-10 py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-warm-900">🗺️ MindMap</h1>
          <p className="text-warm-500 text-sm mt-1">
            {allEntries.length} phrase{allEntries.length !== 1 ? "s" : ""} visualisée{allEntries.length !== 1 ? "s" : ""} sous forme d'arbre
          </p>
        </div>
        <div className="flex items-center gap-3">
          {languesUser.length > 1 && (
            <select value={filtreLangue} onChange={e => setFiltreLangue(e.target.value)}
              className="px-3 py-2 rounded-xl border border-warm-200 text-sm text-warm-700 bg-white focus:outline-none focus:border-orange-300">
              <option value="">Toutes les langues</option>
              {languesUser.map(l => <option key={l} value={l}>{LANGUE_EMOJI[l]} {l}</option>)}
            </select>
          )}
          <button onClick={() => navigate("/learning-log")}
            className="px-4 py-2 rounded-xl text-sm border border-warm-200 text-warm-600 hover:border-orange-300 hover:text-orange-500 transition-colors bg-white">
            📖 Learning Log
          </button>
        </div>
      </div>

      <ReactFlowProvider>
        <MindMapInner
          allEntries={allEntries}
          loading={loading}
          selectedPhrase={selectedPhrase}
          setSelectedPhrase={setSelectedPhrase}
        />
      </ReactFlowProvider>
    </div>
  );
}