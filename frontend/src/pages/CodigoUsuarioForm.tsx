import { useEffect, useState } from "react";
export default function CodigoUsuarioForm({ API_BASE, userId, token }) {
  const [loading, setLoading] = useState(true);
  const [codigoId, setCodigoId] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    (async () => {
      try {
        if (!userId) {
          setError("No hay usuario en sesión.");
          setLoading(false);
          return;
        }
        const url = `${API_BASE}codigos/?usuario=${userId}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const item = data[0];
          setCodigoId(item.id);
          setCodigo(item.codigo || "");
        } else {
          console.log("ℹ️ No hay código registrado para este usuario.");
        }
      } catch (e) {
        console.error(e);
        setError("Error al consultar el código.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!codigo?.trim()) {
      setError("Ingresa un código válido.");
      return;
    }
    try {
      setLoading(true);
      if (codigoId) {
        // UPDATE
        const url = `${API_BASE}codigos/${codigoId}/`;
        const res = await fetch(url, {
          method: "PUT",
          headers,
          body: JSON.stringify({ usuario: userId, codigo }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMsg("Código actualizado correctamente.");
        setCodigoId(data.id);
      } else {
        // CREATE
        const url = `${API_BASE}codigos/`;
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ usuario: userId, codigo }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMsg("Código guardado correctamente.");
        setCodigoId(data.id);
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar el código.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Cargando…</p>}
      {!loading && (
        <>
          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {msg && (
            <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
              {msg}
            </div>
          )}

          <form onSubmit={handleGuardar}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {codigoId
                ? "Actualizar código Investigador Minciencias"
                : "Registrar código Investigador Minciencias"}
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej. 123456"
                className="w-40 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
              >
                {codigoId ? "Actualizar" : "Guardar"}
              </button>
            </div>

            <p className="text-xs text-gray-500">
              {codigoId
                ? "Se cargó un código existente."
                : "No se encontró código; puedes registrar uno nuevo."}
            </p>
          </form>
        </>
      )}
    </div>
  );
}