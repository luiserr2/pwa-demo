'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  ChevronDown,
  Download,
  FileArchive,
  FileText,
  Filter,
  Lock,
  MapPin,
  Receipt,
  RefreshCw,
  Search,
  Send,
  ServerCrash,
  User,
} from 'lucide-react';
import { ETIQUETAS_CANAL, ETIQUETAS_ESTADO, EstadoReporte, esEstadoReporte } from '@/shared/flujo-reporte';
import type { ReporteListadoApi } from '@/shared/tipos-api';
import { listarReportes } from '@/client/components/pipeline/api-reportes';
import { estiloEstado, formatearFecha } from '@/client/components/pipeline/estado-visual';

interface ErrorCarga {
  mensaje: string;
  status: number;
}

function etiquetaEstado(estado: string): string {
  return esEstadoReporte(estado) ? ETIQUETAS_ESTADO[estado] : estado;
}

function etiquetaCanal(canal: string | null): string | null {
  if (!canal) return null;
  return (ETIQUETAS_CANAL as Record<string, string | undefined>)[canal] ?? canal;
}

const ESTADOS_FILTRO: readonly EstadoReporte[] = Object.values(EstadoReporte);

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<ReporteListadoApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<ErrorCarga | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de Filtros
  const [filtroTecnico, setFiltroTecnico] = useState('');
  const [filtroRegion, setFiltroRegion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const montado = useRef(true);

  const cargar = useCallback(async (modo: 'inicial' | 'refresco') => {
    if (modo === 'inicial') setCargando(true);
    else setRefrescando(true);
    const resultado = await listarReportes();
    if (!montado.current) return;
    if (resultado.ok) {
      setExpedientes(resultado.data);
      setErrorCarga(null);
    } else {
      // Sin fallback: un error del servidor se muestra tal cual, nunca se rellena con datos ficticios.
      setExpedientes([]);
      setErrorCarga({ mensaje: resultado.error, status: resultado.status });
    }
    setCargando(false);
    setRefrescando(false);
  }, []);

  useEffect(() => {
    montado.current = true;
    void cargar('inicial');
    return () => {
      montado.current = false;
    };
  }, [cargar]);

  // Lógica de Filtrado
  const termino = busqueda.trim().toLowerCase();
  const filtrados = useMemo(
    () =>
      expedientes.filter((exp) => {
        const matchBusqueda =
          !termino ||
          [exp.codigo, exp.radiobase?.nombre, exp.radiobase?.codigo, exp.numeroHes, exp.numeroTicketCliente].some(
            (valor) => typeof valor === 'string' && valor.toLowerCase().includes(termino)
          );
        const matchTecnico = filtroTecnico ? exp.tecnico?.nombre === filtroTecnico : true;
        const matchRegion = filtroRegion ? exp.radiobase?.region === filtroRegion : true;
        const matchEstado = filtroEstado ? exp.estado === filtroEstado : true;
        return matchBusqueda && matchTecnico && matchRegion && matchEstado;
      }),
    [expedientes, termino, filtroTecnico, filtroRegion, filtroEstado]
  );

  // Extraer valores únicos (solo datos reales) para los dropdowns
  const tecnicosUnicos = useMemo(
    () =>
      Array.from(
        new Set(expedientes.map((e) => e.tecnico?.nombre).filter((n): n is string => typeof n === 'string' && n !== ''))
      ).sort((a, b) => a.localeCompare(b, 'es')),
    [expedientes]
  );
  const regionesUnicas = useMemo(
    () =>
      Array.from(
        new Set(
          expedientes.map((e) => e.radiobase?.region).filter((r): r is string => typeof r === 'string' && r !== '')
        )
      ).sort((a, b) => a.localeCompare(b, 'es')),
    [expedientes]
  );

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-slate-100 text-slate-700 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border border-slate-200 font-semibold tracking-wider">
              Documentación Legal y Técnica
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Expedientes Oficiales</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Repositorio centralizado de levantamientos PWA consolidados en PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!cargando && !errorCarga && (
            <span className="text-xs text-slate-500">
              <span className="font-mono font-bold text-slate-900">{filtrados.length}</span>
              {filtrados.length !== expedientes.length && (
                <>
                  {' '}
                  de <span className="font-mono font-bold text-slate-900">{expedientes.length}</span>
                </>
              )}{' '}
              expedientes
            </span>
          )}
          <button
            type="button"
            onClick={() => void cargar('refresco')}
            disabled={cargando || refrescando}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer active:translate-y-[1px] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refrescando ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* BARRA DE HERRAMIENTAS Y BÚSQUEDA */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por expediente, sitio, ticket o HES..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              mostrarFiltros
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros Avanzados</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* PANEL DESPLEGABLE DE FILTROS */}
        {mostrarFiltros && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Técnico en Campo
              </label>
              <select
                value={filtroTecnico}
                onChange={(e) => setFiltroTecnico(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos los Técnicos</option>
                {tecnicosUnicos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Región / Zona
              </label>
              <select
                value={filtroRegion}
                onChange={(e) => setFiltroRegion(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todas las Regiones</option>
                {regionesUnicas.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3" /> Estado del Expediente
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos los Estados</option>
                {ESTADOS_FILTRO.map((estado) => (
                  <option key={estado} value={estado}>
                    {ETIQUETAS_ESTADO[estado]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* TABLA DE ARCHIVOS */}
        <div className="overflow-x-auto min-h-[400px]">
          {cargando ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
              <span className="relative flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-blue-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Base de Datos...</span>
            </div>
          ) : errorCarga ? (
            <div role="alert" className="flex flex-col items-center justify-center h-64 text-center px-6 gap-2">
              <ServerCrash className="w-12 h-12 mb-1 text-rose-500" />
              <span className="text-sm font-semibold text-slate-900">No se pudieron cargar los expedientes</span>
              <span className="text-xs text-slate-600 max-w-md">{errorCarga.mensaje}</span>
              {errorCarga.status > 0 && (
                <span className="text-[10px] font-mono text-slate-400">HTTP {errorCarga.status}</span>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => void cargar('inicial')}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Reintentar
                </button>
                {errorCarga.status === 401 && (
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          ) : expedientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <FileArchive className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-sm font-semibold">Aún no hay expedientes registrados</span>
              <span className="text-xs mt-1">Los reportes sincronizados desde campo aparecerán aquí</span>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <FileArchive className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-sm font-semibold">No se encontraron expedientes</span>
              <span className="text-xs mt-1">Ajuste los filtros o la búsqueda</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-4 pl-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[28%]">
                    Documento / Expediente
                  </th>
                  <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[20%]">Sitio</th>
                  <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[12%]">
                    Visita / Evidencias
                  </th>
                  <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[15%]">
                    Ticket / HES
                  </th>
                  <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[15%]">Estado</th>
                  <th className="py-4 pr-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right w-[10%]">
                    Descarga (PDF)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((exp) => {
                  const fecha = formatearFecha(exp.fechaVisita);
                  const canal = etiquetaCanal(exp.canalRadicacion);
                  const fechaHes = formatearFecha(exp.fechaHes);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors font-mono truncate">
                              {exp.codigo}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              {exp.tecnico ? (
                                <>Técnico: {exp.tecnico.nombre}</>
                              ) : (
                                <span className="italic text-slate-400">Sin técnico asignado</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        {exp.radiobase ? (
                          <>
                            <div className="font-semibold text-xs text-slate-800">{exp.radiobase.nombre}</div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              {exp.radiobase.codigo} &middot; {exp.radiobase.region}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs italic text-slate-400">Radiobase no vinculada</div>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-xs text-slate-700">
                          {fecha ?? <span className="italic text-slate-400">Sin fecha</span>}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          {exp.totalEvidencias}
                        </div>
                      </td>
                      <td className="py-4">
                        {exp.numeroTicketCliente || exp.numeroHes ? (
                          <div className="space-y-1">
                            {exp.numeroTicketCliente && (
                              <div
                                className="flex items-center gap-1 text-[10px] font-mono text-purple-700"
                                title={canal ? `Radicado vía ${canal}` : 'Ticket del cliente'}
                              >
                                <Send className="w-3 h-3 shrink-0" />
                                <span className="truncate">{exp.numeroTicketCliente}</span>
                              </div>
                            )}
                            {exp.numeroHes && (
                              <div
                                className="flex items-center gap-1 text-[10px] font-mono text-orange-700"
                                title={fechaHes ? `HES del ${fechaHes}` : 'Número HES'}
                              >
                                <Receipt className="w-3 h-3 shrink-0" />
                                <span className="truncate">HES {exp.numeroHes}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${estiloEstado(
                              exp.estado
                            )}`}
                          >
                            {exp.estado === EstadoReporte.OBSERVADO && <AlertTriangle className="w-3 h-3" />}
                            {etiquetaEstado(exp.estado)}
                          </span>
                          {exp.bloqueadoEdicion && (
                            <span
                              className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-slate-500"
                              title="Expediente bloqueado para edición"
                            >
                              <Lock className="w-2.5 h-2.5" />
                              Bloqueado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <Link
                          href={`/reportes/${exp.id}/pdf?vista=UNIFICADO`}
                          target="_blank"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Ver y Descargar PDF Unificado"
                        >
                          <Download className="w-4 h-4" />
                          <span>PDF</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
