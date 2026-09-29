'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Download, Filter, Search, FileArchive, CheckCircle, Clock, Calendar, MapPin, User, ChevronDown } from 'lucide-react';

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Estados de Filtros
  const [filtroTecnico, setFiltroTecnico] = useState('');
  const [filtroRegion, setFiltroRegion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    fetch('/api/reportes')
      .then(res => res.json())
      .then(json => {
        if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
          const mapeados = json.data.map((r: any) => ({
            id: r.id,
            displayId: `EXP-${r.codigo || r.id.substring(0,6).toUpperCase()}`,
            sitio: r.radiobase?.nombre || 'Radiobase Desconocida',
            codigo: r.radiobase?.codigo || 'RDB-XXX',
            region: r.radiobase?.region || 'Nacional',
            tecnico: r.tecnico?.nombre || 'Gerson Martínez',
            fecha: r.fechaVisita ? new Date(r.fechaVisita).toLocaleDateString('es-VE') : new Date().toLocaleDateString('es-VE'),
            peso: `${(Math.random() * 5 + 8).toFixed(1)} MB`, // Simulado
            estado: (r.estado === 'COMPLETADO' || r.estado === 'APROBADO') ? 'CERTIFICADO' : 'EN REVISIÓN',
            raw: r
          }));
          setExpedientes(mapeados);
        } else {
          // Fallback Mocks Vivos si la BD está vacía, para que el usuario pueda ver "plantillas"
          setExpedientes([
            { id: 'mock-1', displayId: 'EXP-2026-001', sitio: 'Torre Puerto Madero', codigo: 'RDB-001', region: 'AMBA', tecnico: 'Gerson Martínez', fecha: '22/09/2026', peso: '14.2 MB', estado: 'CERTIFICADO' },
            { id: 'mock-2', displayId: 'EXP-2026-002', sitio: 'Cerro Catedral Rep.', codigo: 'RDB-002', region: 'Patagonia', tecnico: 'Carlos Gómez', fecha: '22/09/2026', peso: '8.5 MB', estado: 'EN REVISIÓN' },
            { id: 'mock-3', displayId: 'EXP-2026-003', sitio: 'Córdoba Sierras', codigo: 'RDB-003', region: 'Centro', tecnico: 'Martín Albornoz', fecha: '21/09/2026', peso: '18.1 MB', estado: 'CERTIFICADO' },
            { id: 'mock-4', displayId: 'EXP-2026-004', sitio: 'Mendoza Base', codigo: 'RDB-004', region: 'Cuyo', tecnico: 'Gerson Martínez', fecha: '20/09/2026', peso: '11.4 MB', estado: 'CERTIFICADO' },
            { id: 'mock-5', displayId: 'EXP-2026-005', sitio: 'Rosario Central', codigo: 'RDB-005', region: 'Litoral', tecnico: 'Carlos Gómez', fecha: '19/09/2026', peso: '9.8 MB', estado: 'CERTIFICADO' },
          ]);
        }
      })
      .catch(() => {
        setExpedientes([]);
      })
      .finally(() => setCargando(false));
  }, []);

  // Lógica de Filtrado
  const filtrados = expedientes.filter(exp => {
    const matchBusqueda = exp.sitio.toLowerCase().includes(busqueda.toLowerCase()) || 
                          exp.codigo.toLowerCase().includes(busqueda.toLowerCase()) || 
                          exp.displayId.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchTecnico = filtroTecnico ? exp.tecnico.toLowerCase().includes(filtroTecnico.toLowerCase()) : true;
    const matchRegion = filtroRegion ? exp.region.toLowerCase().includes(filtroRegion.toLowerCase()) : true;
    const matchEstado = filtroEstado ? exp.estado === filtroEstado : true;

    return matchBusqueda && matchTecnico && matchRegion && matchEstado;
  });

  // Extraer valores únicos para los dropdowns
  const tecnicosUnicos = Array.from(new Set(expedientes.map(e => e.tecnico)));
  const regionesUnicas = Array.from(new Set(expedientes.map(e => e.region)));

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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Expedientes Oficiales
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Repositorio centralizado de levantamientos PWA consolidados en PDF y paquetes ZIP.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer active:translate-y-[1px]">
            <FileArchive className="w-4 h-4" />
            <span>Exportar Todo (ZIP)</span>
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
              placeholder="Buscar por código de sitio o expediente..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${mostrarFiltros ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
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
                onChange={e => setFiltroTecnico(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos los Técnicos</option>
                {tecnicosUnicos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Región / Zona
              </label>
              <select 
                value={filtroRegion} 
                onChange={e => setFiltroRegion(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todas las Regiones</option>
                {regionesUnicas.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3" /> Estado Legal
              </label>
              <select 
                value={filtroEstado} 
                onChange={e => setFiltroEstado(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos los Estados</option>
                <option value="CERTIFICADO">Certificado (Final)</option>
                <option value="EN REVISIÓN">En Revisión NOC</option>
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
                  <th className="py-4 pl-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[35%]">Documento / Expediente</th>
                  <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[20%]">Sitio</th>
                  <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[15%]">Fecha / Peso</th>
                  <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[15%]">Estado Legal</th>
                  <th className="py-4 pr-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right w-[15%]">Descarga (PDF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((exp, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">{exp.displayId}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">Generado por: {exp.tecnico}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-semibold text-xs text-slate-800">{exp.sitio}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{exp.codigo} &middot; {exp.region}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-xs text-slate-700">{exp.fecha}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{exp.peso}</div>
                    </td>
                    <td className="py-4">
                      {exp.estado === 'CERTIFICADO' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" />
                          Certificado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          En Revisión
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      {/* ACCIÓN REAL DE DESCARGA PDF */}
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
