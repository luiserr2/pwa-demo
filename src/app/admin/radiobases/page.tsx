'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface RadiobaseItem {
  id: string;
  codigo: string;
  nombre: string;
  region: string;
  tecnologia: string;
  tipoTorre: string;
  coordenadas: string;
  estado: 'ACTIVA' | 'MANTENIMIENTO' | 'INACTIVA';
}

const RADIOBASES_INITIAL: RadiobaseItem[] = [
  {
    id: 'rdb-1',
    codigo: 'RDB-001',
    nombre: 'Torre Puerto Madero',
    region: 'AMBA / CABA',
    tecnologia: '4G / 5G LTE Dual',
    tipoTorre: 'Mástil Autosoportado',
    coordenadas: '-34.6118, -58.3635',
    estado: 'ACTIVA',
  },
  {
    id: 'rdb-2',
    codigo: 'RDB-002',
    nombre: 'Cerro Catedral Repetidor',
    region: 'Patagonia Norte',
    tecnologia: '4G LTE / Microondas',
    tipoTorre: 'Monopolo Pesado',
    coordenadas: '-41.1714, -71.4392',
    estado: 'MANTENIMIENTO',
  },
  {
    id: 'rdb-3',
    codigo: 'RDB-003',
    nombre: 'Córdoba Sierras Repetidor',
    region: 'Centro',
    tecnologia: '5G Ready Standalone',
    tipoTorre: 'Torre Arriostrada',
    coordenadas: '-31.4201, -64.1888',
    estado: 'ACTIVA',
  },
  {
    id: 'rdb-4',
    codigo: 'RDB-004',
    nombre: 'Palermo Soho Microcelda',
    region: 'CABA Norte',
    tecnologia: 'Small Cell 5G',
    tipoTorre: 'Poste Urbano',
    coordenadas: '-34.5885, -58.4306',
    estado: 'ACTIVA',
  },
  {
    id: 'rdb-5',
    codigo: 'RDB-005',
    nombre: 'Mendoza Viñedos Nodo 2',
    region: 'Cuyo',
    tecnologia: '4G LTE Enlace Satelital',
    tipoTorre: 'Torre Arriostrada',
    coordenadas: '-32.8895, -68.8458',
    estado: 'ACTIVA',
  },
];

export default function AdminRadiobasesPage() {
  const [radiobases, setRadiobases] = useState<RadiobaseItem[]>(RADIOBASES_INITIAL);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRegion, setFiltroRegion] = useState('TODAS');
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaRegion, setNuevaRegion] = useState('AMBA / CABA');
  const [nuevaTecnologia, setNuevaTecnologia] = useState('4G / 5G LTE Dual');

  const cargarRadiobases = async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/radiobases');
      const json = await res.json();
      if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
        const mapeadas: RadiobaseItem[] = json.data.map((r: any) => ({
          id: r.id,
          codigo: r.codigo,
          nombre: r.nombre,
          region: r.region,
          tecnologia: r.tecnologia || '4G / 5G LTE Dual',
          tipoTorre: r.tipoTorre || 'Mástil Autosoportado',
          coordenadas: '-34.6037, -58.3816',
          estado: 'ACTIVA',
        }));
        setRadiobases(mapeadas);
      }
    } catch {
      // Usar lista por defecto en modo desconectado
    } finally {
      setCargando(false);
    }
  };

  React.useEffect(() => {
    cargarRadiobases();
  }, []);

  const filtradas = radiobases.filter((r) => {
    const matchTxt =
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.codigo.toLowerCase().includes(busqueda.toLowerCase());
    const matchReg = filtroRegion === 'TODAS' || r.region === filtroRegion;
    return matchTxt && matchReg;
  });

  const handleCrearRadiobase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCodigo || !nuevoNombre) return;

    try {
      const res = await fetch('/api/radiobases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: nuevoCodigo.toUpperCase(),
          nombre: nuevoNombre,
          region: nuevaRegion,
          tecnologia: nuevaTecnologia,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        await cargarRadiobases();
      } else {
        alert(json.error || 'Error al crear radiobase.');
      }
    } catch {
      // Fallback local
      const nueva: RadiobaseItem = {
        id: `rdb-${Date.now()}`,
        codigo: nuevoCodigo.toUpperCase(),
        nombre: nuevoNombre,
        region: nuevaRegion,
        tecnologia: nuevaTecnologia,
        tipoTorre: 'Mástil Autosoportado',
        coordenadas: '-34.6037, -58.3816',
        estado: 'ACTIVA',
      };
      setRadiobases([nueva, ...radiobases]);
    }

    setModalNuevo(false);
    setNuevoCodigo('');
    setNuevoNombre('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20">
      {/* HEADER (GLASS STYLE) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span> Volver al Dashboard
            </Link>
            <span className="text-slate-600">&middot;</span>
            <span className="bg-white/5 text-cyan-300 text-[10px] font-mono uppercase px-3 py-0.5 rounded-full tracking-widest border border-cyan-500/20 backdrop-blur-md font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              Catálogo de Infraestructura
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Catálogo Maestro de Radiobases y Torres
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Base de datos homologada de sitios telecom para asignación e inspección en campo.
          </p>
        </div>

        <button
          onClick={() => setModalNuevo(true)}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 hover:border-cyan-400/60"
        >
          <span className="text-base font-bold leading-none">+</span>
          <span>Dar de Alta Radiobase</span>
        </button>
      </div>

      {/* FILTER BAR (FROSTED GLASS) */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-7 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código o nombre de sitio..."
            className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none backdrop-blur-md transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs backdrop-blur-md">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">Región:</span>
          {['TODAS', 'AMBA / CABA', 'Patagonia Norte', 'Centro', 'Cuyo'].map((reg) => (
            <button
              key={reg}
              onClick={() => setFiltroRegion(reg)}
              className={`text-xs font-medium px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filtroRegion === reg
                  ? 'bg-white/20 text-white shadow-inner font-semibold border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA PRINCIPAL (FROSTED GLASS TABLE) */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Sitios e Infraestructura Homologada
            </h2>
            <p className="text-xs text-slate-400">
              Ubicaciones registradas para auditoría técnica y relevamiento de fotos.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold bg-white/5 text-slate-300 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            {filtradas.length} Sitios Visibles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/[0.03] text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10 backdrop-blur-md">
              <tr>
                <th className="p-3.5 pl-5">Código</th>
                <th className="p-3.5">Nombre de la Torre</th>
                <th className="p-3.5">Región</th>
                <th className="p-3.5">Tecnología</th>
                <th className="p-3.5">Tipo de Estructura</th>
                <th className="p-3.5">Coordenadas</th>
                <th className="p-3.5 pr-5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtradas.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="p-3.5 pl-5 font-mono font-bold text-cyan-400">{r.codigo}</td>
                  <td className="p-3.5 font-bold text-white">{r.nombre}</td>
                  <td className="p-3.5 text-slate-300 font-medium">{r.region}</td>
                  <td className="p-3.5 font-semibold text-slate-200">{r.tecnologia}</td>
                  <td className="p-3.5 text-slate-400">{r.tipoTorre}</td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">{r.coordenadas}</td>
                  <td className="p-3.5 pr-5 text-center">
                    <span
                      className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${
                        r.estado === 'ACTIVA'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                          : r.estado === 'MANTENIMIENTO'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ALTA NUEVA RADIOBASE (FROSTED GLASS MODAL) */}
      {modalNuevo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950/90 backdrop-blur-2xl rounded-2xl p-6 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Dar de Alta Nueva Radiobase
                </h3>
                <p className="text-xs text-slate-400">
                  Ingrese la ficha técnica del nuevo sitio para homologación:
                </p>
              </div>
              <button
                onClick={() => setModalNuevo(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearRadiobase} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1 tracking-wider">
                  Código Único (Ej: RDB-042) *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoCodigo}
                  onChange={(e) => setNuevoCodigo(e.target.value)}
                  placeholder="RDB-042"
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-xs backdrop-blur-md transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1 tracking-wider">
                  Nombre Oficial del Sitio *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Torre San Telmo Central"
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-xs backdrop-blur-md transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1 tracking-wider">
                  Región Operativa *
                </label>
                <select
                  value={nuevaRegion}
                  onChange={(e) => setNuevaRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-xs font-semibold backdrop-blur-md"
                >
                  <option value="AMBA / CABA" className="bg-slate-900 text-white">AMBA / CABA</option>
                  <option value="Patagonia Norte" className="bg-slate-900 text-white">Patagonia Norte</option>
                  <option value="Centro" className="bg-slate-900 text-white">Centro</option>
                  <option value="Cuyo" className="bg-slate-900 text-white">Cuyo</option>
                  <option value="Litoral" className="bg-slate-900 text-white">Litoral</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1 tracking-wider">
                  Tecnología Predominante *
                </label>
                <select
                  value={nuevaTecnologia}
                  onChange={(e) => setNuevaTecnologia(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-xs font-semibold backdrop-blur-md"
                >
                  <option value="4G / 5G LTE Dual" className="bg-slate-900 text-white">4G / 5G LTE Dual</option>
                  <option value="5G Ready Standalone" className="bg-slate-900 text-white">5G Ready Standalone</option>
                  <option value="Small Cell 5G" className="bg-slate-900 text-white">Small Cell 5G</option>
                  <option value="Microondas / Enlace Rural" className="bg-slate-900 text-white">Microondas / Enlace Rural</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNuevo(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 font-semibold text-xs transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs px-5 py-2 rounded-xl border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all cursor-pointer active:scale-95"
                >
                  Guardar Radiobase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
