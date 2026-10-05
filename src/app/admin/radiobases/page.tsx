'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { solicitarApi } from '@/client/components/campo/api-campo';
import type { RadiobaseApi } from '@/shared/tipos-api';

/** Refleja la entidad Radiobase serializada (createdAt llega como ISO-8601). */
interface RadiobaseItem extends RadiobaseApi {
  createdAt?: string;
}

interface ErrorCarga {
  mensaje: string;
  status: number;
}

const TECNOLOGIAS: readonly string[] = [
  '4G / 5G LTE Dual',
  '5G Ready Standalone',
  'Small Cell 5G',
  'Microondas / Enlace Rural',
];

function formatearFecha(iso: string | undefined): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminRadiobasesPage() {
  const [radiobases, setRadiobases] = useState<RadiobaseItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<ErrorCarga | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRegion, setFiltroRegion] = useState('TODAS');
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaRegion, setNuevaRegion] = useState('');
  const [nuevaTecnologia, setNuevaTecnologia] = useState<string>(TECNOLOGIAS[0] ?? '');
  const [nuevoTipoTorre, setNuevoTipoTorre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorAlta, setErrorAlta] = useState<string | null>(null);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);

  const cargarRadiobases = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    const resultado = await solicitarApi<RadiobaseItem[]>('/api/radiobases');
    if (resultado.ok) {
      setRadiobases(Array.isArray(resultado.data) ? resultado.data : []);
    } else {
      setRadiobases([]);
      setErrorCarga({ mensaje: resultado.error, status: resultado.status });
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    void cargarRadiobases();
  }, [cargarRadiobases]);

  const regiones = useMemo(
    () => Array.from(new Set(radiobases.map((r) => r.region).filter((r) => r.trim() !== ''))).sort(),
    [radiobases]
  );

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return radiobases.filter((r) => {
      const matchTxt =
        termino === '' ||
        r.nombre.toLowerCase().includes(termino) ||
        r.codigo.toLowerCase().includes(termino);
      const matchReg = filtroRegion === 'TODAS' || r.region === filtroRegion;
      return matchTxt && matchReg;
    });
  }, [radiobases, busqueda, filtroRegion]);

  const cerrarModal = () => {
    setModalNuevo(false);
    setErrorAlta(null);
  };

  const handleCrearRadiobase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCodigo.trim() || !nuevoNombre.trim() || !nuevaRegion.trim()) {
      setErrorAlta('Código, nombre y región son obligatorios.');
      return;
    }

    setGuardando(true);
    setErrorAlta(null);
    const resultado = await solicitarApi<RadiobaseItem>('/api/radiobases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: nuevoCodigo.trim().toUpperCase(),
        nombre: nuevoNombre.trim(),
        region: nuevaRegion.trim(),
        tecnologia: nuevaTecnologia,
        ...(nuevoTipoTorre.trim() !== '' ? { tipoTorre: nuevoTipoTorre.trim() } : {}),
      }),
    });

    if (resultado.ok) {
      setMensajeOk(`Radiobase ${resultado.data.codigo} registrada.`);
      setModalNuevo(false);
      setNuevoCodigo('');
      setNuevoNombre('');
      setNuevaRegion('');
      setNuevoTipoTorre('');
      await cargarRadiobases();
    } else {
      setErrorAlta(`HTTP ${resultado.status}: ${resultado.error}`);
    }
    setGuardando(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/dashboard"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 group"
            >
              <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Volver al Dashboard</span>
            </Link>
            <span className="text-slate-300">&middot;</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border border-slate-200 font-semibold tracking-wider">
              Catálogo de Infraestructura
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Catálogo Maestro de Radiobases y Torres
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Sitios registrados para asignación e inspección en campo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => void cargarRadiobases()}
            disabled={cargando}
            className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            <span>Actualizar</span>
          </button>
          <button
            onClick={() => {
              setErrorAlta(null);
              setModalNuevo(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Dar de Alta Radiobase</span>
          </button>
        </div>
      </div>

      {mensajeOk && (
        <div className="mb-6 p-4 rounded-xl text-xs font-medium flex items-center justify-between border bg-emerald-50 text-emerald-800 border-emerald-200">
          <span>{mensajeOk}</span>
          <button
            onClick={() => setMensajeOk(null)}
            aria-label="Cerrar aviso"
            className="text-xs p-1 rounded-md hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-7 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código o nombre de sitio..."
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 px-2 tracking-wider">Región:</span>
          {['TODAS', ...regiones].map((reg) => (
            <button
              key={reg}
              onClick={() => setFiltroRegion(reg)}
              className={`text-xs font-medium px-3 py-1 rounded-md transition-all cursor-pointer ${
                filtroRegion === reg
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {reg === 'TODAS' ? 'Todas' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Sitios e Infraestructura Registrada
            </h2>
            <p className="text-xs text-slate-500">
              Ubicaciones disponibles para reportes técnicos y relevamiento fotográfico.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded border border-slate-200">
            {filtradas.length} / {radiobases.length} Sitios
          </span>
        </div>

        {cargando ? (
          <div className="p-10 text-center text-xs text-slate-500">Cargando radiobases...</div>
        ) : errorCarga ? (
          <div className="p-6">
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs space-y-3">
              <div>
                <div className="font-bold">
                  {errorCarga.status > 0 ? `Error HTTP ${errorCarga.status}` : 'Sin conexión'}
                </div>
                <p className="mt-0.5">{errorCarga.mensaje}</p>
              </div>
              <button
                type="button"
                onClick={() => void cargarRadiobases()}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            {radiobases.length === 0
              ? 'No hay radiobases registradas.'
              : 'Ninguna radiobase coincide con la búsqueda o la región seleccionada.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-5">Código</th>
                  <th className="p-3.5">Nombre de la Torre</th>
                  <th className="p-3.5">Región</th>
                  <th className="p-3.5">Tecnología</th>
                  <th className="p-3.5">Tipo de Estructura</th>
                  <th className="p-3.5 pr-5">Fecha de Alta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtradas.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-slate-900 text-xs">{r.codigo}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.nombre}</td>
                    <td className="p-3.5 text-slate-700 font-medium">{r.region}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-600">{r.tecnologia}</td>
                    <td className="p-3.5 text-slate-500">{r.tipoTorre}</td>
                    <td className="p-3.5 pr-5 font-mono text-[11px] text-slate-500">{formatearFecha(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL ALTA NUEVA RADIOBASE */}
      {modalNuevo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-radiobase-title"
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 id="modal-radiobase-title" className="text-sm font-bold text-slate-900 tracking-tight">
                  Dar de Alta Nueva Radiobase
                </h3>
                <p className="text-xs text-slate-500">
                  Ingrese la ficha técnica del nuevo sitio:
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                aria-label="Cerrar ventana modal"
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {errorAlta && (
              <div className="mb-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
                {errorAlta}
              </div>
            )}

            <form onSubmit={handleCrearRadiobase} className="space-y-4 text-xs">
              <div>
                <label htmlFor="radiobase-codigo" className="block text-[11px] font-semibold text-slate-700 uppercase mb-1 tracking-wider">
                  Código Único (Ej: RDB-042) *
                </label>
                <input
                  id="radiobase-codigo"
                  type="text"
                  required
                  minLength={3}
                  maxLength={50}
                  value={nuevoCodigo}
                  onChange={(e) => setNuevoCodigo(e.target.value)}
                  placeholder="RDB-042"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 font-mono font-bold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs transition-all uppercase"
                />
              </div>

              <div>
                <label htmlFor="radiobase-nombre" className="block text-[11px] font-semibold text-slate-700 uppercase mb-1 tracking-wider">
                  Nombre Oficial del Sitio *
                </label>
                <input
                  id="radiobase-nombre"
                  type="text"
                  required
                  minLength={3}
                  maxLength={150}
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Nombre del sitio"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs transition-all"
                />
              </div>

              <div>
                <label htmlFor="radiobase-region" className="block text-[11px] font-semibold text-slate-700 uppercase mb-1 tracking-wider">
                  Región Operativa *
                </label>
                <input
                  id="radiobase-region"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  list="radiobase-regiones"
                  value={nuevaRegion}
                  onChange={(e) => setNuevaRegion(e.target.value)}
                  placeholder="Región del sitio"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-medium"
                />
                <datalist id="radiobase-regiones">
                  {regiones.map((reg) => (
                    <option key={reg} value={reg} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="radiobase-tecnologia" className="block text-[11px] font-semibold text-slate-700 uppercase mb-1 tracking-wider">
                  Tecnología Predominante *
                </label>
                <select
                  id="radiobase-tecnologia"
                  value={nuevaTecnologia}
                  onChange={(e) => setNuevaTecnologia(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-medium"
                >
                  {TECNOLOGIAS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="radiobase-tipo-torre" className="block text-[11px] font-semibold text-slate-700 uppercase mb-1 tracking-wider">
                  Tipo de Estructura (Opcional)
                </label>
                <input
                  id="radiobase-tipo-torre"
                  type="text"
                  maxLength={100}
                  value={nuevoTipoTorre}
                  onChange={(e) => setNuevoTipoTorre(e.target.value)}
                  placeholder="Ej. Torre arriostrada"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-2 rounded-lg shadow-sm transition-all cursor-pointer active:translate-y-[1px] disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar Radiobase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
