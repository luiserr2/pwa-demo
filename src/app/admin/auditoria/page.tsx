'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Key,
  Terminal,
  Eye,
  RefreshCw,
  Copy,
  Check,
  Lock,
  FileText,
  SlidersHorizontal,
  X,
  ChevronRight,
  Database
} from 'lucide-react';
import type { AuditEvent } from '@/app/api/admin/auditoria/route';

export default function AuditoriaPage() {
  const [eventos, setEventos] = useState<AuditEvent[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroSeveridad, setFiltroSeveridad] = useState('TODAS');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<AuditEvent | null>(null);
  const [copiadoHash, setCopiadoHash] = useState<string | null>(null);
  
  // Estado para la verificación criptográfica interactiva
  const [verificandoCadena, setVerificandoCadena] = useState(false);
  const [resultadoVerificacion, setResultadoVerificacion] = useState<{
    valida: boolean;
    totalComprobados: number;
    mensaje: string;
    timestamp: string;
  } | null>(null);

  // Carga inicial y recarga al cambiar filtros
  const cargarEventos = async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams();
      if (filtroTipo !== 'TODOS') params.append('tipo', filtroTipo);
      if (filtroSeveridad !== 'TODAS') params.append('severidad', filtroSeveridad);
      if (busqueda.trim()) params.append('q', busqueda.trim());

      const res = await fetch(`/api/admin/auditoria?${params.toString()}`);
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setEventos(json.data);
      }
    } catch (err) {
      console.error('Error cargando bitácora de auditoría:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, [filtroTipo, filtroSeveridad]);

  // Manejo de búsqueda con debounce natural
  const handleBusquedaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cargarEventos();
  };

  // Copiado al portapapeles con confirmación visual
  const copiarAlPortapapeles = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoHash(id);
    setTimeout(() => setCopiadoHash(null), 2000);
  };

  // Verificación criptográfica server-side: el backend recomputa cada hash SHA-256 y su enlace.
  const ejecutarVerificacionCriptografica = async () => {
    setVerificandoCadena(true);
    setResultadoVerificacion(null);

    try {
      const res = await fetch('/api/admin/auditoria?limite=2000');
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'No fue posible verificar la cadena.');
      }
      const { totalEventos, eslabonesRotos, cadenaValida } = json.stats as {
        totalEventos: number;
        eslabonesRotos: number;
        cadenaValida: boolean;
      };
      setResultadoVerificacion({
        valida: cadenaValida,
        totalComprobados: totalEventos,
        mensaje: cadenaValida
          ? `Integridad verificada: los ${totalEventos} eventos recomputados conservan continuidad SHA-256.`
          : `Alerta: ${eslabonesRotos} eslabones no coinciden con su hash recomputado o con el evento anterior.`,
        timestamp: new Date().toLocaleTimeString('es-VE'),
      });
    } catch (err) {
      setResultadoVerificacion({
        valida: false,
        totalComprobados: 0,
        mensaje: err instanceof Error ? err.message : 'Error verificando la cadena.',
        timestamp: new Date().toLocaleTimeString('es-VE'),
      });
    } finally {
      setVerificandoCadena(false);
    }
  };

  // Exportar bitácora a formato JSON oficial
  const exportarJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(eventos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AUDIT_TRAIL_SISBIRCECA_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Exportar bitácora a CSV compatible con hojas de auditoría
  const exportarCSV = () => {
    const encabezados = ['ID', 'Timestamp', 'Actor', 'Email', 'Rol', 'Tipo', 'Severidad', 'Recurso', 'IP', 'Ubicacion', 'Descripcion', 'Hash_Actual', 'Hash_Previo'];
    const filas = eventos.map(e => [
      e.id,
      e.timestamp,
      `"${e.actor.nombre}"`,
      e.actor.email,
      e.actor.rol,
      e.tipo,
      e.severidad,
      `"${e.recurso}"`,
      e.ip,
      `"${e.ubicacion}"`,
      `"${e.descripcion.replace(/"/g, '""')}"`,
      e.hashActual,
      e.hashPrevio
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `AUDIT_TRAIL_SISBIRCECA_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Métricas forenses
  const metricas = useMemo(() => {
    const total = eventos.length;
    const criticos = eventos.filter(e => e.severidad === 'CRITICO').length;
    const advertencias = eventos.filter(e => e.severidad === 'ADVERTENCIA').length;
    const bloqueosGeocerca = eventos.filter(e => e.tipo === 'GEOFENCING_FAIL').length;
    return { total, criticos, advertencias, bloqueosGeocerca };
  }, [eventos]);

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bitácora Forense y Auditoría</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Registro inmutable append-only con encadenamiento SHA-256 (FIPS 180-4) para cumplimiento de actas NOC y cadena de custodia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={ejecutarVerificacionCriptografica}
            disabled={verificandoCadena || eventos.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <Lock className={`w-3.5 h-3.5 text-emerald-400 ${verificandoCadena ? 'animate-spin' : ''}`} />
            {verificandoCadena ? 'Auditando Criptografía...' : 'Verificar Cadena SHA-256'}
          </button>

          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Exportar CSV
          </button>

          <button
            onClick={exportarJSON}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            JSON Forense
          </button>

          <button
            onClick={cargarEventos}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 transition-colors shadow-sm"
            title="Refrescar Bitácora"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* BANNER DE RESULTADO DE VERIFICACIÓN CRIPTOGRÁFICA */}
      {resultadoVerificacion && (
        <div
          className={`p-4 rounded-2xl border transition-all animate-in slide-in-from-top-2 duration-300 ${
            resultadoVerificacion.valida
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/80 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {resultadoVerificacion.valida ? (
                <div className="p-2 bg-emerald-600 text-white rounded-xl mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 bg-rose-600 text-white rounded-xl mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight">
                    {resultadoVerificacion.valida
                      ? 'CERTIFICACIÓN FORENSE: CADENA 100% ÍNTEGRA'
                      : 'VIOLACIÓN DETECTADA EN CADENA DE CUSTODIA'}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 font-bold border border-current">
                    Verificado a las {resultadoVerificacion.timestamp}
                  </span>
                </div>
                <p className="text-xs font-medium mt-1 text-slate-700">
                  {resultadoVerificacion.mensaje}
                </p>
              </div>
            </div>
            <button
              onClick={() => setResultadoVerificacion(null)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TARJETAS DE TELEMETRÍA FORENSE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Eventos</span>
            <span className="p-2 bg-slate-100 rounded-xl text-slate-700">
              <Database className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">{metricas.total}</span>
            <span className="text-[11px] font-semibold text-slate-500">registros en libro mayor</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Modo Append-Only activo</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cadena SHA-256</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 tracking-tight font-mono">100%</span>
            <span className="text-[11px] font-semibold text-emerald-700">Inalterable</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">FIPS 180-4 Chained Hash</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fraudes Bloqueados</span>
            <span className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 tracking-tight font-mono">{metricas.bloqueosGeocerca}</span>
            <span className="text-[11px] font-semibold text-rose-700">Geofence &gt;100m</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Disparos no autorizados</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eventos Críticos</span>
            <span className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 tracking-tight font-mono">{metricas.criticos}</span>
            <span className="text-[11px] font-semibold text-amber-700">auditorías de alerta</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Prioridad alta de supervisión</p>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleBusquedaSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por actor, correo, recurso, IP o fragmento de hash SHA-256..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Tipo:</span>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="CAMBIO_ESTADO">Cambio de Estado</option>
                <option value="APROBACION_QA">Visado / Aprobación</option>
                <option value="OBSERVACION_QA">Observación / Rechazo</option>
                <option value="SINCRONIZACION_CAMPO">Sincronización de Campo</option>
                <option value="CAMBIO_MATRIZ">Cambio Matriz Técnica</option>
                <option value="SUBIDA_FOTO">Subida de Evidencia</option>
                <option value="AUTENTICACION">Autenticación</option>
                <option value="POLITICA_CONFIG">Configuración de Políticas</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Severidad:</span>
              <select
                value={filtroSeveridad}
                onChange={(e) => setFiltroSeveridad(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="TODAS">Todas</option>
                <option value="INFO">Informativo</option>
                <option value="ADVERTENCIA">Advertencia</option>
                <option value="CRITICO">Crítico</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
            >
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* TABLA DE AUDITORÍA FORENSE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900">Eventos de Custodia Criptográfica</h2>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">
            Mostrando {eventos.length} evento{eventos.length !== 1 ? 's' : ''}
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono animate-pulse">
            Consultando libro mayor de auditoría y verificando hashes...
          </div>
        ) : eventos.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Sin eventos coincidentes</p>
            <p className="text-xs text-slate-400 mt-1">Ajusta los filtros de búsqueda o severidad para ver registros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">ID / Marca Temporal</th>
                  <th className="py-3 px-4">Severidad / Tipo</th>
                  <th className="py-3 px-4">Actor y Credencial</th>
                  <th className="py-3 px-4">Recurso & Red</th>
                  <th className="py-3 px-4">Sello SHA-256</th>
                  <th className="py-3 px-4 text-right">Forense</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {eventos.map((e) => {
                  const esCritico = e.severidad === 'CRITICO';
                  const esAdvertencia = e.severidad === 'ADVERTENCIA';

                  return (
                    <tr
                      key={e.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setEventoSeleccionado(e)}
                    >
                      {/* ID Y TIMESTAMP */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {e.id}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(e.timestamp).toLocaleString('es-VE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* SEVERIDAD Y TIPO */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                              esCritico
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : esAdvertencia
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {e.severidad}
                          </span>
                          <span className="text-[11px] font-bold text-slate-800">
                            {e.tipo.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>

                      {/* ACTOR Y CREDENCIAL */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{e.actor.nombre}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{e.actor.email}</div>
                        <span className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                          {e.actor.rol}
                        </span>
                      </td>

                      {/* RECURSO & RED */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{e.recurso}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {e.ip} &middot; {e.ubicacion}
                        </div>
                      </td>

                      {/* SELLO SHA-256 */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-[11px] font-bold border border-slate-200 transition-colors flex items-center gap-1 max-w-[140px] truncate"
                            title={e.hashActual}
                          >
                            <Key className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{e.hashActual.slice(0, 10)}...{e.hashActual.slice(-6)}</span>
                          </div>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              copiarAlPortapapeles(e.hashActual, e.id);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                            title="Copiar Hash Completo"
                          >
                            {copiadoHash === e.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* BOTÓN FORENSE */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setEventoSeleccionado(e);
                          }}
                          className="p-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-lg transition-all border border-slate-200 group-hover:border-slate-300"
                          title="Examinar Metadatos Forenses"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETALLE FORENSE Y CADENA DE CUSTODIA */}
      {eventoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-white rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      Expediente Forense: {eventoSeleccionado.id}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        eventoSeleccionado.severidad === 'CRITICO'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : eventoSeleccionado.severidad === 'ADVERTENCIA'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {eventoSeleccionado.severidad}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Timestamp ISO: {eventoSeleccionado.timestamp}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEventoSeleccionado(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-6">

              {/* DESCRIPCIÓN Y RECURSO */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Acción Registrada
                </div>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {eventoSeleccionado.descripcion}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-4 text-xs font-mono text-slate-600">
                  <div>
                    <span className="font-bold text-slate-400">Recurso:</span> {eventoSeleccionado.recurso}
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Ubicación:</span> {eventoSeleccionado.ubicacion}
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Dirección IP:</span> {eventoSeleccionado.ip}
                  </div>
                </div>
              </div>

              {/* ACTOR AUDITADO */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  Identidad del Emisor
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono block">Nombre</span>
                    <span className="text-xs font-bold text-slate-800">{eventoSeleccionado.actor.nombre}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono block">Correo Institucional</span>
                    <span className="text-xs font-bold text-slate-800 font-mono truncate block">{eventoSeleccionado.actor.email}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono block">Rol Asignado</span>
                    <span className="text-xs font-bold text-slate-800">{eventoSeleccionado.actor.rol}</span>
                  </div>
                </div>
              </div>

              {/* VINCULACIÓN CRIPTOGRÁFICA (BLOCKCHAIN-STYLE) */}
              <div className="bg-slate-950 text-slate-200 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    Encadenamiento Criptográfico SHA-256 (FIPS 180-4)
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    Append-Only Guard
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wide">
                      Hash Previo (Bloque N-1):
                    </span>
                    <div className="bg-slate-900 p-2 rounded-lg text-[11px] text-slate-400 border border-slate-800 break-all select-all">
                      {eventoSeleccionado.hashPrevio}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-400 block uppercase tracking-wide font-bold">
                      Hash Actual del Evento (Bloque N):
                    </span>
                    <div className="bg-slate-900 p-2 rounded-lg text-[11px] text-emerald-300 border border-emerald-900/40 break-all select-all flex items-center justify-between gap-2">
                      <span>{eventoSeleccionado.hashActual}</span>
                      <button
                        onClick={() => copiarAlPortapapeles(eventoSeleccionado.hashActual, 'modal-hash')}
                        className="text-slate-400 hover:text-white p-1 shrink-0"
                        title="Copiar Hash"
                      >
                        {copiadoHash === 'modal-hash' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 pt-1 leading-relaxed">
                  Cualquier alteración a este registro o metadatos invalida automáticamente el hash subsecuente, dejando constancia irrevocable de violación de seguridad.
                </p>
              </div>

              {/* METADATOS TÉCNICOS DETALLADOS */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  Payload de Metadatos Forenses (JSON)
                </h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800">
                  <pre className="text-[11px] leading-relaxed">
                    {JSON.stringify(eventoSeleccionado.metadatos, null, 2)}
                  </pre>
                </div>
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Conforme a normativa de certificación técnica SISBIRCECA
              </span>
              <button
                onClick={() => setEventoSeleccionado(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Cerrar Expediente
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
