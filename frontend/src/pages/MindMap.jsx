// Page MindMap — visualise les phrases apprises sous forme de carte mentale
// Utilise React Flow pour le rendu interactif (zoom, drag, clic sur nœud)
//
// Structure de l'arbre :
//   LinguaPath (racine)
//     └── Langue
//           └── Thème
//                 └── Phrase

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import Navbar from "../components/NavBar";
import api from "../services/api";

// ── Emojis par langue ─────────────────────────────────────────────────────
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

// Couleurs par niveau CECRL
const NIVEAU_COLOR = {
  A1: "#10B981",
  A2: "#34D399",
  B1: "#F59E0B",
  B2: "#F97316",
  C1: "#EF4444",
  C2: "#7C3AED",
};

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
        cursor: "default",
        border: "3px solid rgba(255,255,255,0.3)",
      }}
    >
      <span style={{ fontSize: 26 }}>🌍</span>
      <span
        style={{
          color: "white",
          fontWeight: 700,
          fontSize: 11,
          marginTop: 4,
          letterSpacing: 0.5,
        }}
      >
        LinguaPath
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
      style={{
        background: "white",
        border: "2px solid #F59E0B",
        borderRadius: 16,
        padding: "10px 18px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 4px 16px rgba(245,158,11,0.15)",
        minWidth: 130,
        cursor: "default",
      }}
    >
      <span style={{ fontSize: 20 }}>
        {LANGUE_EMOJI[data.label] || "🌍"}
      </span>
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "#1C1917",
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
      style={{
        background: "#FFF7ED",
        border: "1.5px solid #FED7AA",
        borderRadius: 12,
        padding: "7px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        boxShadow: "0 2px 8px rgba(234,88,12,0.1)",
        cursor: "default",
      }}
    >
      <span style={{ fontSize: 14 }}>📂</span>
      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 12,
            color: "#EA580C",
          }}
        >
          {data.label}
        </div>
        <div style={{ fontSize: 10, color: "#9A3412" }}>
          {data.count} phrase{data.count > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

// ── Nœud Phrase ──────────────────────────────────────────────────────────
// Cliquable — ouvre le panel de détail à droite
function PhraseNode({ data, selected }) {
  const niveauColor = NIVEAU_COLOR[data.niveau] || "#9CA3AF";

  return (
    <div
      style={{
        background: selected ? "#FFFBEB" : "white",
        border: selected ? `2px solid #F59E0B` : "1.5px solid #E7E5E4",
        borderRadius: 10,
        padding: "8px 12px",
        maxWidth: 160,
        boxShadow: selected
          ? "0 4px 16px rgba(245,158,11,0.25)"
          : "0 2px 6px rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {/* Phrase dans la langue cible */}
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

      {/* Traduction */}
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

      {/* Badges niveau + source */}
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
          {data.source === "auto" ? "🤖" : "✍️"}
        </span>
      </div>
    </div>
  );
}

// ── Types de nœuds — passé à React Flow ───────────────────────────────────
const nodeTypes = {
  rootNode: RootNode,
  langueNode: LangueNode,
  themeNode: ThemeNode,
  phraseNode: PhraseNode,
};

// ── Composant principal ───────────────────────────────────────────────────
export default function MindMap() {
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [totalEntries, setTotalEntries] = useState(0);
  const [selectedPhrase, setSelectedPhrase] = useState(null); // détail affiché à droite

  // Filtres
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const languesUser = user.langues?.map((l) => l.langue) || [];
  const [filtreLangue, setFiltreLangue] = useState("");

  // ── Chargement des données ─────────────────────────────────────────────
  const chargerMindMap = useCallback(async () => {
    setLoading(true);
    setSelectedPhrase(null);
    try {
      const params = {};
      if (filtreLangue) params.langue = filtreLangue;

      const res = await api.get("/mindmap", { params });
      setNodes(res.data.nodes);
      setEdges(res.data.edges);
      setTotalEntries(res.data.totalEntries || 0);
    } catch (err) {
      console.error("Erreur chargement MindMap :", err.message);
    } finally {
      setLoading(false);
    }
  }, [filtreLangue]);

  useEffect(() => {
    chargerMindMap();
  }, [chargerMindMap]);

  // ── Clic sur un nœud — LIN-40 ─────────────────────────────────────────
  const onNodeClick = useCallback((event, node) => {
    if (node.type === "phraseNode") {
      setSelectedPhrase(node.data);
    } else {
      setSelectedPhrase(null);
    }
  }, []);

  // ── Rendu ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="px-6 md:px-10 py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-warm-900">
            🗺️ MindMap
          </h1>
          <p className="text-warm-500 text-sm mt-1">
            {totalEntries} phrase{totalEntries !== 1 ? "s" : ""} visualisée
            {totalEntries !== 1 ? "s" : ""} sous forme d'arbre
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtre langue */}
          {languesUser.length > 1 && (
            <select
              value={filtreLangue}
              onChange={(e) => setFiltreLangue(e.target.value)}
              className="px-3 py-2 rounded-xl border border-warm-200
                         text-sm text-warm-700 bg-white
                         focus:outline-none focus:border-orange-300"
            >
              <option value="">Toutes les langues</option>
              {languesUser.map((l) => (
                <option key={l} value={l}>
                  {LANGUE_EMOJI[l]} {l}
                </option>
              ))}
            </select>
          )}

          {/* Bouton vers le Learning Log */}
          <button
            onClick={() => navigate("/learning-log")}
            className="px-4 py-2 rounded-xl text-sm border border-warm-200
                       text-warm-600 hover:border-orange-300 hover:text-orange-500
                       transition-colors bg-white"
          >
            📖 Learning Log
          </button>
        </div>
      </div>

      {/* Zone principale */}
      <div className="flex flex-1 px-6 md:px-10 pb-8 gap-4">
        {/* Canvas React Flow */}
        <div
          className="flex-1 bg-white rounded-2xl border border-warm-200
                     shadow-soft overflow-hidden"
          style={{ minHeight: 550 }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div
                  className="w-10 h-10 border-2 border-orange-300
                               border-t-orange-500 rounded-full animate-spin mx-auto mb-4"
                />
                <p className="text-warm-400 text-sm">
                  Construction de la MindMap...
                </p>
              </div>
            </div>
          ) : nodes.length === 0 ? (
            /* État vide */
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-5xl mb-4">🗺️</p>
                <p className="text-warm-600 font-medium mb-2">
                  Aucune phrase à visualiser
                </p>
                <p className="text-warm-400 text-sm mb-6">
                  Lance une conversation pour commencer à apprendre !
                </p>
                <button
                  onClick={() => navigate("/scenarios")}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold
                             text-white hover:opacity-90 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                  }}
                >
                  Choisir un scénario
                </button>
              </div>
            </div>
          ) : (
            /* React Flow — LIN-37 + LIN-40 */
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              minZoom={0.2}
              maxZoom={2}
              defaultEdgeOptions={{
                type: "smoothstep",
              }}
            >
              {/* Fond quadrillé */}
              <Background color="#F5F5F4" gap={20} size={1} />

              {/* Contrôles zoom (LIN-40) */}
              <Controls
                showInteractive={false}
                style={{
                  borderRadius: 12,
                  border: "1px solid #E7E5E4",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />

              {/* Mini-carte (LIN-40) */}
              <MiniMap
                nodeColor={(node) => {
                  if (node.type === "rootNode") return "#F59E0B";
                  if (node.type === "langueNode") return "#FCD34D";
                  if (node.type === "themeNode") return "#FED7AA";
                  return "#E7E5E4";
                }}
                style={{
                  borderRadius: 12,
                  border: "1px solid #E7E5E4",
                  overflow: "hidden",
                }}
                maskColor="rgba(245,245,244,0.7)"
              />

              {/* Légende */}
              <Panel position="top-left">
                <div
                  className="bg-white rounded-xl border border-warm-200
                               shadow-soft p-3 text-xs text-warm-600 flex flex-col gap-2"
                >
                  <div className="font-semibold text-warm-800 mb-1">
                    Légende
                  </div>
                  {[
                    { color: "#F59E0B", label: "Racine" },
                    { color: "#FCD34D", label: "Langue" },
                    { color: "#FED7AA", label: "Thème" },
                    { color: "#E7E5E4", label: "Phrase" },
                  ].map(({ color, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2"
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
                  <div className="border-t border-warm-100 pt-2 text-warm-400">
                    Clique sur une phrase pour voir les détails
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          )}
        </div>

        {/* Panel de détail — s'affiche quand une phrase est sélectionnée (LIN-40) */}
        {selectedPhrase && (
          <div
            className="w-72 bg-white rounded-2xl border border-warm-200
                       shadow-soft p-5 flex flex-col gap-4 self-start"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-warm-900 text-sm">
                📌 Phrase sélectionnée
              </h3>
              <button
                onClick={() => setSelectedPhrase(null)}
                className="text-warm-400 hover:text-warm-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Phrase dans la langue cible */}
            <div className="bg-warm-50 rounded-xl p-3">
              <p className="text-warm-900 font-semibold text-base leading-relaxed">
                {selectedPhrase.label}
              </p>
            </div>

            {/* Traduction */}
            <div>
              <p className="text-xs font-medium text-warm-500 mb-1">
                Traduction
              </p>
              <p className="text-warm-700 italic text-sm">
                {selectedPhrase.traduction}
              </p>
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              <span
                style={{
                  background:
                    (NIVEAU_COLOR[selectedPhrase.niveau] || "#9CA3AF") + "20",
                  color: NIVEAU_COLOR[selectedPhrase.niveau] || "#9CA3AF",
                }}
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
              >
                Niveau {selectedPhrase.niveau}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full ${
                  selectedPhrase.source === "auto"
                    ? "bg-blue-50 text-blue-500"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {selectedPhrase.source === "auto"
                  ? "🤖 Extrait auto"
                  : "✍️ Ajout manuel"}
              </span>
            </div>

            {/* Bouton voir dans le learning log */}
            <button
              onClick={() => navigate("/learning-log")}
              className="w-full py-2.5 rounded-xl text-xs font-semibold
                         text-white hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              }}
            >
              Voir dans le Learning Log →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
