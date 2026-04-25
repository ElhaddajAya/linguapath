// Affiche toutes les conversations passées de l'utilisateur.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import api from "../services/api";

// Emoji par langue
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

// Formater la durée en mm:ss
const formatDuree = (secondes) => {
  if (!secondes) return "—";
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  return `${m}min ${s}s`;
};

// Formater la date en "il y a X jours" ou date courte
const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff < 7) return `Il y a ${diff} jours`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

export default function Historique() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null); // conversation ouverte
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerHistorique();
  }, []);

  const chargerHistorique = async () => {
    try {
      const res = await api.get("/conversations");
      setConversations(res.data.conversations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle accordion preview
  const togglePreview = async (conv) => {
    if (selected?._id === conv._id) {
      setSelected(null);
      return;
    }
    try {
      const res = await api.get(`/conversations/${conv._id}`);
      setSelected(res.data.conversation);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='min-h-screen bg-warm-50'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-10 py-10'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-semibold text-warm-900'>
            Historique des conversations
          </h1>
          <p className='text-warm-500 text-sm mt-1'>
            {conversations.length} conversation
            {conversations.length !== 1 ? "s" : ""} au total
          </p>
        </div>

        {loading ? (
          <div className='text-center py-20 text-warm-400'>Chargement...</div>
        ) : conversations.length === 0 ? (
          // Aucune conversation
          <div
            className='bg-white rounded-2xl border border-warm-200
                                    shadow-soft p-12 text-center'
          >
            <p className='text-4xl mb-4'>💬</p>
            <p className='text-warm-600 font-medium mb-2'>
              Aucune conversation pour l'instant
            </p>
            <p className='text-warm-400 text-sm mb-6'>
              Lance ton premier scénario pour commencer !
            </p>
            <button
              onClick={() => navigate("/scenarios")}
              className='px-6 py-2.5 rounded-xl text-sm font-semibold
                                       text-white hover:opacity-90 transition-opacity'
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              }}
            >
              Choisir un scénario
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {conversations.map((conv) => (
              <div key={conv._id}>
                {/* Card conversation */}
                <div
                  className={`bg-white rounded-2xl border shadow-soft p-5 transition-all
                 ${
                   selected?._id === conv._id
                     ? "border-orange-300 shadow-card"
                     : "border-warm-200 hover:border-orange-200 hover:shadow-card"
                 }`}
                >
                  <div className='flex items-start justify-between gap-3'>
                    {/* Emoji + infos */}
                    <div className='flex items-center gap-3'>
                      <span className='text-2xl'>{conv.scenarioEmoji}</span>
                      <div>
                        <p className='font-semibold text-warm-900 text-sm'>
                          {conv.scenarioTitre}
                        </p>
                        <p className='text-xs text-warm-500 mt-0.5'>
                          {LANGUE_EMOJI[conv.langue]} {conv.langue} · Niveau{" "}
                          {conv.niveau}
                        </p>
                      </div>
                    </div>

                    {/* Date + durée */}
                    <div className='text-right shrink-0'>
                      <p className='text-xs font-medium text-warm-600'>
                        {formatDate(conv.createdAt)}
                      </p>
                      <p className='text-xs text-warm-400 mt-0.5'>
                        ⏱ {formatDuree(conv.duree)}
                      </p>
                    </div>
                  </div>

                  {/* Indicateur expand */}
                  <div className='flex items-center justify-between mt-3'>
                    <p
                      className='text-xs text-orange-500 cursor-pointer'
                      onClick={() => togglePreview(conv)}
                    >
                      {selected?._id === conv._id
                        ? "▲ Masquer l'aperçu"
                        : "▼ Aperçu"}
                    </p>
                    <button
                      onClick={() =>
                        navigate(`/chat/${conv.scenarioId}?resume=${conv._id}`)
                      }
                      className='text-xs font-semibold text-white px-3 py-1.5
                   rounded-lg hover:opacity-90 transition-opacity'
                      style={{
                        background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                      }}
                    >
                      Ouvrir →
                    </button>
                  </div>
                </div>

                {/* Messages de la conversation — affichés si sélectionnée */}
                {selected?._id === conv._id && (
                  <div
                    className='mt-2 bg-white rounded-2xl border border-orange-200
                                                    shadow-soft p-5 flex flex-col gap-3 max-h-96 overflow-y-auto'
                  >
                    {selected.messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-xl text-sm
                                                               leading-relaxed whitespace-pre-wrap
                                                               ${
                                                                 msg.role ===
                                                                 "user"
                                                                   ? "text-white rounded-br-sm"
                                                                   : "bg-warm-100 text-warm-800 rounded-bl-sm"
                                                               }`}
                          style={
                            msg.role === "user"
                              ? {
                                  background:
                                    "linear-gradient(135deg, #F59E0B, #EA580C)",
                                }
                              : {}
                          }
                        >
                          {msg.contenu}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
