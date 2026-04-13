// Chat.jsx — traduction + romanisation + barre de saisie fixée

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

// ──────────────────────────────────────
// Composant Message
// ──────────────────────────────────────
function Message({ msg, scenarioId }) {
  const [data, setData] = useState(null); // { romanisation, traduction }
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const afficher = async () => {
    // Toggle si déjà chargé
    if (data) {
      setShow(!show);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/traduction", { texte: msg.contenu });
      setData({
        romanisation: res.data.romanisation,
        traduction: res.data.traduction,
      });
      setShow(true);
    } catch (err) {
      setData({ romanisation: "—", traduction: "Indisponible." });
      setShow(true);
    } finally {
      setLoading(false);
    }
  };

  // Message utilisateur — bulle orange simple
  if (msg.role === "user") {
    return (
      <div className='flex justify-end'>
        <div
          className='max-w-[75%] px-4 py-3 rounded-2xl rounded-br-sm
                                text-sm text-white leading-relaxed whitespace-pre-wrap'
          style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
        >
          {msg.contenu}
        </div>
      </div>
    );
  }

  // Message IA — bulle blanche + romanisation + traduction
  return (
    <div className='flex justify-start'>
      <div className='max-w-[75%] flex flex-col gap-1'>
        {/* Bulle principale */}
        <div
          className='px-4 py-3 rounded-2xl rounded-bl-sm bg-white
                                border border-warm-200 text-warm-800 text-sm
                                leading-relaxed whitespace-pre-wrap'
        >
          {msg.contenu}
        </div>

        {/* Panneau romanisation + traduction */}
        {show && data && (
          <div
            className='flex flex-col gap-1.5 px-4 py-3 rounded-xl
                                    bg-orange-50 border border-orange-100 text-xs'
          >
            {/* Romanisation */}
            <div className='flex gap-2 items-start'>
              <span className='text-orange-400 font-semibold shrink-0'>🔤</span>
              <span className='text-warm-600 font-mono leading-relaxed'>
                {data.romanisation}
              </span>
            </div>

            {/* Séparateur */}
            <div className='border-t border-orange-200' />

            {/* Traduction française */}
            <div className='flex gap-2 items-start'>
              <span className='text-orange-400 font-semibold shrink-0'>🇫🇷</span>
              <span className='text-warm-600 leading-relaxed italic'>
                {data.traduction}
              </span>
            </div>
          </div>
        )}

        {/* Bouton toggle */}
        <button
          onClick={afficher}
          disabled={loading}
          className='self-start text-xs text-warm-400 hover:text-orange-500
                               transition-colors px-1'
        >
          {loading
            ? "⏳ Chargement..."
            : show
              ? "🙈 Masquer"
              : "🔤 Romanisation & traduction"}
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────
// Page Chat
// ──────────────────────────────────────
export default function Chat() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();

  const [scenario, setScenario] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingScenario, setLoadingScenario] = useState(true);

  const bottomRef = useRef(null);

  useEffect(() => {
    chargerScenario();
  }, [scenarioId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historique]);

  const chargerScenario = async () => {
    try {
      const res = await api.get(`/scenarios/${scenarioId}`);
      setScenario(res.data.scenario);

      const intro = await api.post("/chat/message", {
        scenarioId,
        historique: [],
        message: `Start the conversation with a SHORT greeting (2-3 sentences max).
Introduce yourself briefly in your role, then ask ONE simple opening question.
Be warm but concise. Do not write long paragraphs.`,
      });

      setHistorique([{ role: "assistant", contenu: intro.data.reponse }]);
    } catch (err) {
      console.error(err);
      setHistorique([
        {
          role: "assistant",
          contenu: "👋 Bonjour ! Je suis prêt(e) pour notre conversation.",
        },
      ]);
    } finally {
      setLoadingScenario(false);
    }
  };

  const envoyerMessage = async () => {
    if (!message.trim() || loading) return;

    const messageUser = message.trim();
    setMessage("");

    const nouvelHistorique = [
      ...historique,
      { role: "user", contenu: messageUser },
    ];
    setHistorique(nouvelHistorique);
    setLoading(true);

    try {
      const res = await api.post("/chat/message", {
        scenarioId,
        historique: nouvelHistorique,
        message: messageUser,
      });
      setHistorique((prev) => [
        ...prev,
        { role: "assistant", contenu: res.data.reponse },
      ]);
    } catch (err) {
      setHistorique((prev) => [
        ...prev,
        {
          role: "assistant",
          contenu: "❌ Erreur de connexion. Réessaie.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyerMessage();
    }
  };

  if (loadingScenario) {
    return (
      <div className='min-h-screen bg-warm-50 flex flex-col items-center justify-center gap-4'>
        <div className='flex gap-2'>
          <div
            className='w-3 h-3 rounded-full bg-orange-400 animate-bounce'
            style={{ animationDelay: "0ms" }}
          />
          <div
            className='w-3 h-3 rounded-full bg-orange-400 animate-bounce'
            style={{ animationDelay: "150ms" }}
          />
          <div
            className='w-3 h-3 rounded-full bg-orange-400 animate-bounce'
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <p className='text-warm-400 text-sm'>
          Préparation de la conversation...
        </p>
      </div>
    );
  }

  return (
    // Layout fixé — header + messages scrollables + barre de saisie toujours visible
    <div className='h-screen bg-warm-50 flex flex-col overflow-hidden'>
      {/* ── Header ── */}
      <div
        className='bg-white border-b border-warm-200 shadow-soft px-6 py-4
                            flex items-center justify-between shrink-0'
      >
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate("/scenarios")}
            className='text-warm-400 hover:text-warm-700 transition-colors mr-1'
          >
            ←
          </button>
          <span className='text-2xl'>{scenario?.emoji}</span>
          <div>
            <h1 className='font-semibold text-warm-900 text-sm'>
              {scenario?.titre}
            </h1>
            <p className='text-xs text-warm-400'>{scenario?.langue}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/scenarios")}
          className='px-4 py-1.5 rounded-xl text-xs font-semibold
                               text-warm-600 border border-warm-200 hover:bg-warm-100 transition-colors'
        >
          Terminer
        </button>
      </div>

      {/* ── Messages — zone scrollable ── */}
      {/* flex-1 + overflow-y-auto → cette zone prend tout l'espace disponible et scroll */}
      <div className='flex-1 overflow-y-auto px-6 py-6'>
        <div className='max-w-3xl mx-auto flex flex-col gap-4'>
          {historique.map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              scenarioId={scenarioId}
            />
          ))}

          {/* Indicateur "l'IA écrit..." */}
          {loading && (
            <div className='flex justify-start'>
              <div className='bg-white border border-warm-200 rounded-2xl rounded-bl-sm px-4 py-3'>
                <div className='flex gap-1.5 items-center'>
                  <div
                    className='w-2 h-2 rounded-full bg-warm-300 animate-bounce'
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className='w-2 h-2 rounded-full bg-warm-300 animate-bounce'
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className='w-2 h-2 rounded-full bg-warm-300 animate-bounce'
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Barre de saisie — toujours visible en bas ── */}
      {/* shrink-0 → empêche cette barre de rétrécir quand les messages débordent */}
      <div className='bg-white border-t border-warm-200 px-6 py-4 shrink-0'>
        <div className='max-w-3xl mx-auto flex gap-3'>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Écris ton message... (Entrée pour envoyer)'
            rows={1}
            className='flex-1 px-4 py-3 rounded-xl border border-warm-200
                                   bg-warm-50 text-warm-900 text-sm resize-none
                                   focus:outline-none focus:border-orange-500
                                   focus:ring-2 focus:ring-orange-500/10 transition-all'
          />
          <button
            onClick={envoyerMessage}
            disabled={!message.trim() || loading}
            className='px-5 py-3 rounded-xl font-semibold text-white text-sm
                                   transition-opacity disabled:opacity-40 hover:opacity-90'
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
