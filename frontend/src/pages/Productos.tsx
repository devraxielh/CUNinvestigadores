import { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

// Chart.js
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [codigo, setCodigo] = useState(null);
  const [loadingCodigo, setLoadingCodigo] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState("");
  const [errorProductos, setErrorProductos] = useState("");

  // Filtros
  const [convocSel, setConvocSel] = useState("");       // global por convocatoria
  const [filtroTipologia, setFiltroTipologia] = useState(""); // local tabla
  const [filtroProducto, setFiltroProducto] = useState("");   // local tabla

  // Orden
  const [sortKey, setSortKey] = useState("nme_producto_pd");
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'

  const API_BASE = import.meta.env.VITE_API_URL;

  const auth = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const token = auth?.access || auth?.token;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Helper para mostrar "Vacío"
  const mostrar = (v) => (v && `${v}`.trim() !== "" ? v : "Vacío");

  // 1) Traer el código del usuario
  useEffect(() => {
    const fetchCodigo = async () => {
      try {
        if (!auth?.id_user) {
          setErrorCodigo("No hay usuario en sesión.");
          return;
        }
        const res = await fetch(`${API_BASE}codigos/?usuario=${auth.id_user}`, {
          headers,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const cod = Array.isArray(data) && data.length > 0 ? data[0]?.codigo : null;
        if (!cod) {
          setErrorCodigo("No se encontró código para este usuario.");
          return;
        }
        setCodigo(cod);
      } catch (err) {
        console.error(err);
        setErrorCodigo("No se pudo consultar el código.");
      } finally {
        setLoadingCodigo(false);
      }
    };
    fetchCodigo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE, auth?.id_user]);

  // 2) Con el código, traer productos
  useEffect(() => {
    const fetchProductos = async () => {
      if (!codigo) return;
      try {
        setLoadingProductos(true);
        const url = `${API_BASE}productos/?id_persona_pd=${encodeURIComponent(
          codigo
        )}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProductos(Array.isArray(data) ? data : []);
        setConvocSel(""); // reset filtro global al cargar
      } catch (err) {
        console.error(err);
        setErrorProductos("Error al cargar productos.");
      } finally {
        setLoadingProductos(false);
      }
    };
    fetchProductos();
  }, [API_BASE, codigo]); // cuando ya hay código

  // Lista única de id_convocatoria (filtro global)
  const convocatorias = useMemo(() => {
    const uniq = new Set(
      (productos || [])
        .map((p) => p.id_convocatoria)
        .filter((v) => v !== null && v !== undefined && `${v}`.trim() !== "")
    );
    return Array.from(uniq).sort((a, b) => `${a}`.localeCompare(`${b}`));
  }, [productos]);

  // Productos filtrados por convocatoria (global)
  const productosFiltradosConv = useMemo(() => {
    if (!convocSel) return productos;
    return productos.filter((p) => `${p.id_convocatoria}` === `${convocSel}`);
  }, [productos, convocSel]);

  // Tipologías únicas para Select local de tabla
  const tipologiasUnicas = useMemo(() => {
    const uniq = new Set(
      (productosFiltradosConv || [])
        .map((p) => p.nme_tipologia_pd)
        .filter((v) => v !== null && v !== undefined && `${v}`.trim() !== "")
    );
    return Array.from(uniq).sort((a, b) => `${a}`.localeCompare(`${b}`));
  }, [productosFiltradosConv]);

  // Filtro local de la tabla (tipología + producto)
  const productosTablaFiltrados = useMemo(() => {
    const texto = filtroProducto.trim().toLowerCase();
    return (productosFiltradosConv || []).filter((p) => {
      const okTip = filtroTipologia
        ? `${p.nme_tipologia_pd}` === `${filtroTipologia}`
        : true;
      const okProd = texto
        ? `${p.nme_producto_pd || ""}`.toLowerCase().includes(texto)
        : true;
      return okTip && okProd;
    });
  }, [productosFiltradosConv, filtroTipologia, filtroProducto]);

  // Ordenar la tabla
  const productosOrdenados = useMemo(() => {
    const arr = [...productosTablaFiltrados];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const va = `${a?.[sortKey] ?? ""}`.toLowerCase();
      const vb = `${b?.[sortKey] ?? ""}`.toLowerCase();
      return va.localeCompare(vb) * dir;
    });
    return arr;
  }, [productosTablaFiltrados, sortKey, sortDir]);

  // Agrupar por nme_categoria_pd (para el gráfico) sobre el set filtrado globalmente
  const categorias = useMemo(() => {
    const counts = {};
    (productosFiltradosConv || []).forEach((p) => {
      const cat = (p.nme_categoria_pd && `${p.nme_categoria_pd}`.trim()) || "Sin categoría";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [productosFiltradosConv]);

  // Datos para el pie chart
  const dataPie = useMemo(() => {
    const labels = Object.keys(categorias);
    const values = Object.values(categorias);
    return {
      labels,
      datasets: [
        {
          label: "Productos",
          data: values,
          backgroundColor: [
            "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2",
            "#2C73D2", "#FF6F91", "#4D8076", "#BDE0FE", "#80ED99",
            "#FFD6A5", "#A0C4FF",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [categorias]);

  // Opciones para full width + porcentajes
  const optionsPie = useMemo(() => {
    return {
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.raw;
              const percent = total ? ((value / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${value} (${percent}%)`;
            },
          },
        },
        datalabels: {
          color: "#fff",
          font: { weight: "bold" },
          formatter: (value, context) => {
            const ds = context.chart.data.datasets?.[0]?.data || [];
            const total = ds.reduce((a, b) => a + b, 0);
            const percent = total ? ((value / total) * 100).toFixed(1) : 0;
            return percent > 0 ? `${percent}%` : "";
          },
        },
      },
      maintainAspectRatio: false,
    };
  }, []);

  const loading = loadingCodigo || loadingProductos;
  const error = errorCodigo || errorProductos;

  // Helpers de UI: sort
  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };
  const sortArrow = (key) =>
    sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div>
      <PageMeta title="" description="" />
      <PageBreadcrumb pageTitle="Productos Evaluados Por Minciencias" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-5 xl:py-5">
        {loading && <p>Cargando…</p>}

        {!loading && error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <p className="mb-4 text-green-700">
              Tu código Minciencias es: <strong>{mostrar(codigo)}</strong>
            </p>

            {/* Filtro global por id_convocatoria */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <label className="text-sm text-gray-700">Filtrar por convocatoria:</label>
              <select
                value={convocSel}
                onChange={(e) => setConvocSel(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                disabled={convocatorias.length === 0}
              >
                <option value="">Todas</option>
                {convocatorias.map((idc) => (
                  <option key={idc} value={idc}>
                    {idc}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500">
                {productosOrdenados.length} resultado(s)
              </span>
              {convocatorias.length === 0 && (
                <span className="text-xs text-amber-600">No hay convocatorias disponibles.</span>
              )}
            </div>

            {/* Pie: distribución por categoría (full width con altura fija) */}
            <div className="my-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                Distribución por Categoría
              </h3>
              {Object.keys(categorias).length === 0 ? (
                <p className="text-sm text-gray-500">No hay datos para graficar.</p>
              ) : (
                <div className="w-full" style={{ height: "420px" }}>
                  <Pie data={dataPie} options={optionsPie} />
                </div>
              )}
            </div>

            {/* Controles de tabla: filtros locales */}
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Tipología:</label>
                <select
                  value={filtroTipologia}
                  onChange={(e) => setFiltroTipologia(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">Todas</option>
                  {tipologiasUnicas.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Producto:</label>
                <input
                  type="text"
                  value={filtroProducto}
                  onChange={(e) => setFiltroProducto(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Tabla de productos con ordenamiento */}
            {productosOrdenados.length === 0 ? (
              <p>No se encontraron productos para este filtro.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 divide-y divide-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th
                        className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                        onClick={() => toggleSort("nme_convocatoria")}
                        aria-sort={
                          sortKey === "nme_convocatoria"
                            ? (sortDir === "asc" ? "ascending" : "descending")
                            : "none"
                        }
                      >
                        Convocatoria{sortArrow("nme_convocatoria")}
                      </th>
                      <th
                        className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                        onClick={() => toggleSort("nme_producto_pd")}
                        aria-sort={
                          sortKey === "nme_producto_pd"
                            ? (sortDir === "asc" ? "ascending" : "descending")
                            : "none"
                        }
                      >
                        Producto{sortArrow("nme_producto_pd")}
                      </th>
                      <th
                        className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                        onClick={() => toggleSort("nme_categoria_pd")}
                        aria-sort={
                          sortKey === "nme_categoria_pd"
                            ? (sortDir === "asc" ? "ascending" : "descending")
                            : "none"
                        }
                      >
                        Categoría{sortArrow("nme_categoria_pd")}
                      </th>
                      <th
                        className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                        onClick={() => toggleSort("nme_tipologia_pd")}
                        aria-sort={
                          sortKey === "nme_tipologia_pd"
                            ? (sortDir === "asc" ? "ascending" : "descending")
                            : "none"
                        }
                      >
                        Tipología{sortArrow("nme_tipologia_pd")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {productosOrdenados.map((p) => (
                      <tr key={p.id || p.id_producto_pd} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-700">{mostrar(p.nme_convocatoria)}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{mostrar(p.nme_producto_pd)}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{mostrar(p.nme_categoria_pd)}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{mostrar(p.nme_tipologia_pd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}