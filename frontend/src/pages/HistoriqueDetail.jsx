// Affiche une conversation complète avec tous ses messages

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import api from "../services/api";

export default function HistoriqueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    charger();
  }, [id]);

  const charger = async () => {
    try {
      const res = await api.get(`/conversations/${id}`);
      setConversation(res.data.conversation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDuree = (s) => {
    if (!s) return "—";
    return `${Math.floor(s / 60)}min ${s % 60}s`;
  };

  if (loading)
    return (
      <div className='min-h-screen bg-warm-50 flex items-center justify-center'>
        <p className='text-warm-400 text-sm'>Chargement...</p>
      </div>
    );

  if (!conversation)
    return (
      <div className='min-h-screen bg-warm-50 flex items-center justify-center'>
        <p className='text-warm-400 text-sm'>Conversation introuvable.</p>
      </div>
    );

  return (
    <div className='min-h-screen bg-warm-50'>
      <Navbar />

      <div className='max-w-3xl mx-auto px-6 py-10'>
        {/* Bouton retour */}
        <button
          onClick={() => navigate("/historique")}
          className='text-sm text-warm-500 hover:text-warm-700
                               transition-colors mb-6 flex items-center gap-1'
        >
          ← Retour à l'historique
        </button>

        {/* Header conversation */}
        <div
          className='bg-white rounded-2xl border border-warm-200
                                shadow-soft p-5 mb-6'
        >
          <div className='flex items-center gap-3 mb-3'>
            <span className='text-3xl'>{conversation.scenarioEmoji}</span>
            <div>
              <h1 className='font-semibold text-warm-900'>
                {conversation.scenarioTitre}
              </h1>
              <p className='text-sm text-warm-500'>
                {conversation.langue} · Niveau {conversation.niveau}
              </p>
            </div>
          </div>
          <div className='flex gap-4 text-xs text-warm-400 pt-3 border-t border-warm-100'>
            <span>📅 {formatDate(conversation.createdAt)}</span>
            <span>⏱ {formatDuree(conversation.duree)}</span>
            <span>💬 {conversation.messages.length} messages</span>
          </div>
        </div>

        {/* Tous les messages */}
        <div className='flex flex-col gap-3'>
          {conversation.messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm
                                           leading-relaxed whitespace-pre-wrap
                                           ${
                                             msg.role === "user"
                                               ? "text-white rounded-br-sm"
                                               : "bg-white border border-warm-200 text-warm-800 rounded-bl-sm"
                                           }`}
                style={
                  msg.role === "user"
                    ? {
                        background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                      }
                    : {}
                }
              >
                {msg.contenu}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
