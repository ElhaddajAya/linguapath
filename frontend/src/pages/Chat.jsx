import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

// ──────────────────────────────────────
// Composant Message
// ──────────────────────────────────────
function Message({ msg }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const afficher = async () => {
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
    } catch {
      setData({ romanisation: "—", traduction: "Indisponible." });
      setShow(true);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className='flex justify-start'>
      <div className='max-w-[75%] flex flex-col gap-1'>
        <div
          className='px-4 py-3 rounded-2xl rounded-bl-sm bg-white
                                border border-warm-200 text-warm-800 text-sm
                                leading-relaxed whitespace-pre-wrap'
        >
          {msg.contenu}
        </div>

        {show && data && (
          <div
            className='flex flex-col gap-1.5 px-4 py-3 rounded-xl
                                    bg-orange-50 border border-orange-100 text-xs'
          >
            <div className='flex gap-2 items-start'>
              <span className='text-orange-400 font-semibold shrink-0'>🔤</span>
              <span className='text-warm-600 font-mono leading-relaxed'>
                {data.romanisation}
              </span>
            </div>
            <div className='border-t border-orange-200' />
            <div className='flex gap-2 items-start'>
              <span className='text-orange-400 font-semibold shrink-0'>🇫🇷</span>
              <span className='text-warm-600 leading-relaxed italic'>
                {data.traduction}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={afficher}
          disabled={loading}
          className='self-start text-xs text-warm-400 hover:text-orange-500 transition-colors px-1'
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

  const [debutAt] = useState(Date.now()); // heure de début de la conversation
  const [scenario, setScenario] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingScenario, setLoadingScenario] = useState(true);
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("resume"); // null si nouvelle conv, ID si reprise

  // Suggestions de l'IA pour le prochain message
  // Chaque carte suggestion — avec texte original + romanisation au survol
  // On stocke { texte, roman, trad } pour chaque suggestion
  const [suggestionsData, setSuggestionsData] = useState([]);

  // État du micro — 'idle' | 'listening' | 'error'
  const [microState, setMicroState] = useState("idle");

  // Ref pour la reconnaissance vocale — Web Speech API
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Charger le scénario
        const resScenario = await api.get(`/scenarios/${scenarioId}`);
        setScenario(resScenario.data.scenario);

        if (resumeId) {
          const resConv = await api.get(`/conversations/${resumeId}`);
          const conv = resConv.data.conversation;

          // Convertir les messages au format attendu par le Chat
          // Dans Conversation on stocke { role, contenu } — même format que historique
          setHistorique(conv.messages); // ✅ directement, pas besoin de mapper
        } else {
          const intro = await api.post("/chat/message", {
            scenarioId,
            historique: [],
            message: `Start the conversation with a SHORT greeting (2-3 sentences max).
Introduce yourself briefly in your role, then ask ONE simple opening question.
Be warm but concise. Do not write long paragraphs.`,
          });

          setHistorique([{ role: "assistant", contenu: intro.data.reponse }]);

          if (intro.data.suggestions?.length) {
            enrichirSuggestions(intro.data.suggestions);
          }
        }
      } catch (err) {
        console.error("Erreur init chat:", err);
        // Message de fallback si erreur
        setHistorique([
          {
            role: "assistant",
            contenu: "👋 Bonjour ! Je suis prêt(e) pour notre conversation.",
          },
        ]);
      } finally {
        setLoadingScenario(false); // ✅ toujours appelé — débloque le loading screen
      }
    };

    init();
  }, [scenarioId, resumeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historique]);

  // ── Initialiser la Web Speech API ──
  useEffect(() => {
    // Vérifier si le navigateur supporte la reconnaissance vocale
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    // Langue de reconnaissance — basée sur la langue du scénario
    const langueMap = {
      Anglais: "en-US",
      Espagnol: "es-ES",
      Français: "fr-FR",
      Allemand: "de-DE",
      Coréen: "ko-KR",
      Japonais: "ja-JP",
      Chinois: "zh-CN",
      Arabe: "ar-SA",
    };
    recognition.lang = langueMap[scenario?.langue] || "fr-FR";
    recognition.continuous = false; // S'arrête après une pause
    recognition.interimResults = false; // On veut le résultat final seulement

    // Quand la parole est reconnue → on remplit le textarea
    recognition.onresult = (event) => {
      const texte = event.results[0][0].transcript;
      setMessage((prev) => prev + texte);
      setMicroState("idle");
    };

    recognition.onerror = () => setMicroState("error");
    recognition.onend = () => setMicroState("idle");

    recognitionRef.current = recognition;
  }, [scenario]);

  // ── Démarrer / arrêter le micro ──
  const toggleMicro = () => {
    if (!recognitionRef.current) return;

    if (microState === "listening") {
      recognitionRef.current.stop();
      setMicroState("idle");
    } else {
      recognitionRef.current.start();
      setMicroState("listening");
    }
  };

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
      // Afficher les premières suggestions
      if (intro.data.suggestions?.length) {
        enrichirSuggestions(intro.data.suggestions);
      }
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

  const envoyerMessage = async (texte) => {
    const messageUser = (texte || message).trim();
    if (!messageUser || loading) return;

    setMessage("");
    enrichirSuggestions([]); // On vide les suggestions pendant que l'IA réfléchit

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

      // Mettre à jour les suggestions pour le prochain tour
      if (res.data.suggestions?.length) {
        enrichirSuggestions(res.data.suggestions);
      }
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

  // Fonction pour enrichir les suggestions avec romanisation + traduction
  const enrichirSuggestions = async (suggestions) => {
    if (!suggestions?.length) return;

    try {
      // On envoie toutes les suggestions en une seule requête
      const textes = suggestions.join("\n");
      const res = await api.post("/traduction", { texte: textes });

      // Groq retourne un bloc — on split par ligne pour matcher chaque suggestion
      const romans = res.data.romanisation?.split("\n") || [];
      const trads = res.data.traduction?.split("\n") || [];

      setSuggestionsData(
        suggestions.map((texte, i) => ({
          texte,
          roman: romans[i]?.trim() || "",
          trad: trads[i]?.trim() || "",
        })),
      );
    } catch {
      // Fallback sans romanisation
      setSuggestionsData(
        suggestions.map((texte) => ({ texte, roman: "", trad: "" })),
      );
    }
  };

  // Fonction de fin de session — sauvegarde puis redirige
  const terminerConversation = async () => {
    // On ne sauvegarde que s'il y a au moins 1 message de l'utilisateur
    const messagesUser = historique.filter((m) => m.role === "user");
    if (messagesUser.length === 0) {
      navigate("/scenarios");
      return;
    }

    try {
      const duree = Math.floor((Date.now() - debutAt) / 1000); // en secondes
      await api.post("/conversations", {
        scenarioId,
        messages: historique,
        duree,
      });
    } catch (err) {
      console.error("Erreur sauvegarde :", err.message);
      // On redirige quand même même si la sauvegarde échoue
    }

    navigate("/scenarios");
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
    <div className='h-screen bg-warm-50 flex flex-col overflow-hidden'>
      {/* ── Header ── */}
      <div
        className='bg-white border-b border-warm-200 shadow-soft px-6 py-4
                            flex items-center justify-between shrink-0'
      >
        <div className='flex items-center gap-3'>
          <button
            onClick={terminerConversation}
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
          onClick={terminerConversation}
          className='px-4 py-1.5 rounded-xl text-xs font-semibold
                               text-warm-600 border border-warm-200 hover:bg-warm-100 transition-colors'
        >
          Terminer
        </button>
      </div>

      {/* ── Messages ── */}
      <div className='flex-1 overflow-y-auto px-6 py-6'>
        <div className='max-w-3xl mx-auto flex flex-col gap-4'>
          {historique.map((msg, i) => (
            <Message
              key={i}
              msg={msg}
            />
          ))}

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

      {/* ── Zone de saisie + suggestions ── */}
      <div className='bg-white border-t border-warm-200 px-6 py-4 shrink-0'>
        <div className='max-w-3xl mx-auto flex flex-col gap-3'>
          {/* Cartes de suggestions — visibles si pas en cours de chargement */}
          {suggestionsData.length > 0 && !loading && (
            <div className='flex gap-2 flex-wrap'>
              {suggestionsData.map((s, i) => (
                <button
                  key={i}
                  onClick={() => envoyerMessage(s.texte)}
                  className='flex flex-col items-start px-3 py-2 rounded-xl text-xs
                           bg-warm-100 border border-warm-200 text-left
                           hover:bg-orange-50 hover:border-orange-300
                           transition-all max-w-[180px]'
                >
                  {/* Texte original dans la langue */}
                  <span className='font-medium text-warm-800'>{s.texte}</span>
                  {/* Romanisation en dessous */}
                  {s.roman && (
                    <span className='text-warm-400 font-mono text-[10px] mt-0.5'>
                      {s.roman}
                    </span>
                  )}
                  {/* Traduction française */}
                  {s.trad && (
                    <span className='text-orange-500 italic text-[10px]'>
                      {s.trad}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Textarea + micro + envoyer */}
          <div className='flex gap-3'>
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

            {/* Bouton micro — affiché seulement si Web Speech API disponible */}
            {(window.SpeechRecognition || window.webkitSpeechRecognition) && (
              <button
                onClick={toggleMicro}
                title={microState === "listening" ? "Arrêter" : "Parler"}
                className={`px-4 py-3 rounded-xl font-semibold text-sm
                                           transition-all border
                                           ${
                                             microState === "listening"
                                               ? "bg-red-50 border-red-300 text-red-500 animate-pulse"
                                               : microState === "error"
                                                 ? "bg-red-50 border-red-200 text-red-400"
                                                 : "bg-warm-50 border-warm-200 text-warm-500 hover:border-orange-300 hover:text-orange-500"
                                           }`}
              >
                {microState === "listening" ? "🔴" : "🎙️"}
              </button>
            )}

            {/* Bouton envoyer */}
            <button
              onClick={() => envoyerMessage()}
              disabled={!message.trim() || loading}
              className='px-5 py-3 rounded-xl font-semibold text-white text-sm
                                       transition-opacity disabled:opacity-40 hover:opacity-90'
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              }}
            >
              →
            </button>
          </div>

          {/* Message d'aide micro */}
          {microState === "listening" && (
            <p className='text-xs text-red-400 text-center animate-pulse'>
              🎙️ Écoute en cours... Parle maintenant
            </p>
          )}
          {microState === "error" && (
            <p className='text-xs text-red-400 text-center'>
              ❌ Micro non disponible — vérifie les permissions du navigateur
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
