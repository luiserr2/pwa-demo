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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
            >
              &larr; Volver al Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Catálogo Maestro de Radiobases y Torres
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Base de datos homologada de sitios telecom para asignación en campo.
          </p>
        </div>

        <button
          onClick={() => setModalNuevo(true)}
          className="bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-2"
        >
          <span>+</span>
          <span>Dar de Alta Radiobase</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código o nombre de sitio..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Región:</span>
          {['TODAS', 'AMBA / CABA', 'Patagonia Norte', 'Centro', 'Cuyo'].map((reg) => (
            <button
              key={reg}
              onClick={() => setFiltroRegion(reg)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                filtroRegion === reg
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
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
          <tbody className="divide-y divide-slate-100">
            {filtradas.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5 pl-5 font-mono font-bold text-slate-900">{r.codigo}</td>
                <td className="p-3.5 font-bold text-slate-900">{r.nombre}</td>
                <td className="p-3.5 text-slate-600 font-medium">{r.region}</td>
                <td className="p-3.5 font-semibold text-slate-800">{r.tecnologia}</td>
                <td className="p-3.5 text-slate-500">{r.tipoTorre}</td>
                <td className="p-3.5 font-mono text-[10px] text-slate-400">{r.coordenadas}</td>
                <td className="p-3.5 pr-5 text-center">
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                      r.estado === 'ACTIVA'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
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

      {/* MODAL ALTA NUEVA RADIOBASE */}
      {modalNuevo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Dar de Alta Nueva Radiobase
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ingrese la ficha técnica del nuevo sitio para homologación en la base de datos:
            </p>

            <form onSubmit={handleCrearRadiobase} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Código Único (Ej: RDB-042)</label>
                <input
                  type="text"
                  required
                  value={nuevoCodigo}
                  onChange={(e) => setNuevoCodigo(e.target.value)}
                  placeholder="RDB-042"
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Oficial del Sitio</label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Torre San Telmo Central"
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Región Operativa</label>
                <select
                  value={nuevaRegion}
                  onChange={(e) => setNuevaRegion(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="AMBA / CABA">AMBA / CABA</option>
                  <option value="Patagonia Norte">Patagonia Norte</option>
                  <option value="Centro">Centro</option>
                  <option value="Cuyo">Cuyo</option>
                  <option value="Litoral">Litoral</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tecnología Predominante</label>
                <select
                  value={nuevaTecnologia}
                  onChange={(e) => setNuevaTecnologia(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="4G / 5G LTE Dual">4G / 5G LTE Dual</option>
                  <option value="5G Ready Standalone">5G Ready Standalone</option>
                  <option value="Small Cell 5G">Small Cell 5G</option>
                  <option value="Microondas / Enlace Rural">Microondas / Enlace Rural</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalNuevo(false)}
                  className="px-3 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-black text-white px-4 py-2 font-semibold rounded-lg shadow-sm"
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
