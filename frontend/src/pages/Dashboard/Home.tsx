import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const OLLAMA_BASE = import.meta.env.VITE_OLLAMA_BASE;
const CHAT_ENDPOINT = `${OLLAMA_BASE}/api/chat`;
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL;

export default function Chat() {
  const [messages, setMessages] = useState(() => {
    // 👇 cargar historial de localStorage al iniciar
    const saved = localStorage.getItem("chat.messages");
    return saved
      ? JSON.parse(saved)
      : [{ from: "bot", text: "¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte?" }];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const scrollRef = useRef(null);

  // auto-scroll al final cuando llegan mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // guardar historial en localStorage cada vez que cambien los mensajes
  useEffect(() => {
    localStorage.setItem("chat.messages", JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || loading) return;

    // si había una respuesta en curso, cancelar
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    // agregar el mensaje del usuario
    setMessages((prev) => [...prev, { from: "user", text: content }]);
    setInput("");

    // preparar el historial en formato Ollama
    const ollamaMessages = [
      ...messages.map((m) => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content },
    ];

    // crear un placeholder del bot para ir haciendo streaming
    const botIndex = messages.length + 1;
    setMessages((prev) => [...prev, { from: "bot", text: "" }]);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: ollamaMessages,
          stream: true,
          options: { temperature: 0.7 },
        }),
      });

      if (!res.ok || !res.body) {
        const fallback = `Error HTTP ${res.status}. Revisa que Ollama esté corriendo en ${OLLAMA_BASE} y el modelo "${OLLAMA_MODEL}" esté disponible.`;
        setMessages((prev) =>
          prev.map((m, i) => (i === botIndex ? { ...m, text: fallback } : m))
        );
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accum = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (accum + chunk).split("\n");
        accum = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            const piece = data?.message?.content || "";

            if (piece) {
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === botIndex ? { ...m, text: m.text + piece } : m
                )
              );
            }
          } catch {
            // ignora líneas malformadas
          }
        }
      }

      if (accum.trim()) {
        try {
          const data = JSON.parse(accum);
          const piece = data?.message?.content || "";
          if (piece) {
            setMessages((prev) =>
              prev.map((m, i) =>
                i === botIndex ? { ...m, text: m.text + piece } : m
              )
            );
          }
        } catch {
          // ignora
        }
      }
    } catch (err) {
      const reason =
        err?.name === "AbortError"
          ? "Respuesta anterior cancelada."
          : `No se pudo conectar con Ollama en ${OLLAMA_BASE}. ¿Está activo?`;
      setMessages((prev) =>
        prev.map((m, i) => (i === botIndex ? { ...m, text: reason } : m))
      );
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <div>
      <PageMeta title="Chat" description="Asistente IA en vivo" />
      <PageBreadcrumb pageTitle="Asistente IA" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5">
        <div className="mx-auto w-full flex flex-col h-[75vh]">
          {/* Área de mensajes */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto border rounded-xl p-4 space-y-3 bg-gray-50 w-full"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 max-w-[75%] whitespace-pre-wrap rounded-lg prose prose-sm ${
                  msg.from === "user"
                    ? "ml-auto bg-green-600 text-white prose-invert"
                    : "mr-auto bg-gray-200 text-gray-800"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            ))}
            {loading && (
              <div className="mr-auto bg-gray-200 text-gray-600 p-3 rounded-lg inline-flex items-center gap-2">
                <span className="animate-pulse">Generando respuesta…</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="mt-4 flex w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded-l-xl px-4 py-2 focus:outline-none focus:ring focus:ring-green-400"
              placeholder="Escribe un mensaje y presiona Enter…"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-5 py-2 bg-green-600 text-white rounded-r-xl hover:bg-green-700 disabled:opacity-60"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}