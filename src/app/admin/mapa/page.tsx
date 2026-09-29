'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Server,
  Radio,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Layers,
  Compass,
  Building2,
} from 'lucide-react';
import type { RadiobaseUbicacion } from '@/client/components/RadiobasesMapLeaflet';

// Dynamic import with SSR disabled to prevent Leaflet window reference errors
const RadiobasesMapLeaflet = dynamic(
  () => import('@/client/components/RadiobasesMapLeaflet'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[550px] bg-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-200">
        <Compass className="w-10 h-10 animate-spin text-blue-600" />
        <span className="text-sm font-semibold text-slate-600">Cargando cartografía satelital Leaflet...</span>
      </div>
    ),
  }
);

// Directorio Maestro de Radiobases con Coordenadas Geográficas Reales
const RADIOBASES_CATALOGO: RadiobaseUbicacion[] = [
  {
    id: 'rdb-001',
    codigo: 'RDB-001',
    nombre: 'Torre Puerto Madero',
    region: 'AMBA / CABA',
    tecnologia: '4G / 5G LTE',
    tipoTorre: 'Mástil Autosoportado',
    estado: 'OPERATIVA',
    lat: -34.6037,
    lng: -58.3616,
    alturaMetros: 45,
    potenciaKw: 12.5,
    ultimoMantenimiento: '18/09/2026',
  },
  {
    id: 'rdb-002',
    codigo: 'RDB-002',
    nombre: 'Cerro Catedral Repetidor',
    region: 'Patagonia Norte',
    tecnologia: '4G LTE / Microondas',
    tipoTorre: 'Monopolo Pesado',
    estado: 'MANTENIMIENTO',
    lat: -41.1689,
    lng: -71.4392,
    alturaMetros: 60,
    potenciaKw: 18.0,
    ultimoMantenimiento: '24/09/2026',
  },
  {
    id: 'rdb-003',
    codigo: 'RDB-003',
    nombre: 'Córdoba Sierras Repetidor',
    region: 'Centro',
    tecnologia: '5G Ready',
    tipoTorre: 'Torre Arriostrada',
    estado: 'OPERATIVA',
    lat: -31.4201,
    lng: -64.1888,
    alturaMetros: 50,
    potenciaKw: 15.0,
    ultimoMantenimiento: '12/09/2026',
  },
  {
    id: 'rdb-004',
    codigo: 'RDB-004',
    nombre: 'Palermo Soho Microcelda',
    region: 'CABA Norte',
    tecnologia: 'Small Cell 5G',
    tipoTorre: 'Poste Urbano',
    estado: 'ALERTA',
    lat: -34.5885,
    lng: -58.4285,
    alturaMetros: 25,
    potenciaKw: 4.5,
    ultimoMantenimiento: '02/08/2026',
  },
  {
    id: 'rdb-005',
    codigo: 'RDB-005',
    nombre: 'Mendoza Alta Montaña',
    region: 'Cuyo',
    tecnologia: '4G LTE / Satelital',
    tipoTorre: 'Monopolo Pesado',
    estado: 'OPERATIVA',
    lat: -32.8895,
    lng: -68.8458,
    alturaMetros: 55,
    potenciaKw: 14.0,
    ultimoMantenimiento: '20/09/2026',
  },
  {
    id: 'rdb-006',
    codigo: 'RDB-006',
    nombre: 'Rosario Litoral Sur',
    region: 'Litoral',
    tecnologia: '5G Standalone',
    tipoTorre: 'Torre Arriostrada',
    estado: 'OPERATIVA',
    lat: -32.9468,
    lng: -60.6393,
    alturaMetros: 40,
    potenciaKw: 11.0,
    ultimoMantenimiento: '15/09/2026',
  },
  {
    id: 'rdb-007',
    codigo: 'RDB-007',
    nombre: 'Mar del Plata Costera',
    region: 'Costa Atlántica',
    tecnologia: '4G LTE / Microondas',
    tipoTorre: 'Mástil Autosoportado',
    estado: 'MANTENIMIENTO',
    lat: -38.0055,
    lng: -57.5562,
    alturaMetros: 35,
    potenciaKw: 9.5,
    ultimoMantenimiento: '25/09/2026',
  },
  {
    id: 'rdb-008',
    codigo: 'RDB-008',
    nombre: 'Salta Valles Calchaquíes',
    region: 'NOA',
    tecnologia: '4G LTE / Enlace',
    tipoTorre: 'Torre Arriostrada',
    estado: 'OPERATIVA',
    lat: -24.7821,
    lng: -65.4232,
    alturaMetros: 65,
    potenciaKw: 16.5,
    ultimoMantenimiento: '10/09/2026',
  },
];

export default function MapaRadiobasesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'TODAS' | 'OPERATIVA' | 'MANTENIMIENTO' | 'ALERTA'>('TODAS');
  const [selectedRadiobaseId, setSelectedRadiobaseId] = useState<string | null>(null);

  // Filtrado reactivo de sitios
  const filteredRadiobases = useMemo(() => {
    return RADIOBASES_CATALOGO.filter((rb) => {
      const matchSearch =
        rb.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rb.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rb.region.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado = filterEstado === 'TODAS' || rb.estado === filterEstado;

      return matchSearch && matchEstado;
    });
  }, [searchTerm, filterEstado]);

  const countOperativas = RADIOBASES_CATALOGO.filter((r) => r.estado === 'OPERATIVA').length;
  const countMantenimiento = RADIOBASES_CATALOGO.filter((r) => r.estado === 'MANTENIMIENTO').length;
  const countAlerta = RADIOBASES_CATALOGO.filter((r) => r.estado === 'ALERTA').length;

  const handleSelectRadiobase = (rb: RadiobaseUbicacion) => {
    setSelectedRadiobaseId(rb.id);
  };

  const handleResetView = () => {
    setSelectedRadiobaseId(null);
  };

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* HEADER DE MAPA EJECUTIVO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-semibold tracking-wider flex items-center gap-1.5 shadow-xs">
              <Radio className="w-3.5 h-3.5" />
              INFRAESTRUCTURA TELECOM
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
              Cartografía Leaflet &middot; OpenStreetMap
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Mapa de Radiobases y Nodos
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Geolocalización satelital en alta definición y estado operativo de torres de telecomunicaciones en tiempo real.
          </p>
        </div>

        {/* CONTADORES RÁPIDOS */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs text-xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600 font-medium">Operativas:</span>
            <strong className="text-slate-900 font-bold">{countOperativas}</strong>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs text-xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 font-medium">Mantenimiento:</span>
            <strong className="text-slate-900 font-bold">{countMantenimiento}</strong>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs text-xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-600 font-medium">Alerta:</span>
            <strong className="text-slate-900 font-bold">{countAlerta}</strong>
          </div>
          <button
            onClick={handleResetView}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Centrar Todas</span>
          </button>
        </div>
      </div>

      {/* GRID PRINCIPAL: LISTA LATERAL + MAPA LEAFLET */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[620px]">
        {/* PANEL LATERAL: DIRECTORIO DE RADIOBASES */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[620px]">
          {/* BUSCADOR Y FILTROS */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* CHIPS DE ESTADO */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] font-semibold">
              <button
                onClick={() => setFilterEstado('TODAS')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filterEstado === 'TODAS'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Todas ({RADIOBASES_CATALOGO.length})
              </button>
              <button
                onClick={() => setFilterEstado('OPERATIVA')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filterEstado === 'OPERATIVA'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Operativas
              </button>
              <button
                onClick={() => setFilterEstado('MANTENIMIENTO')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filterEstado === 'MANTENIMIENTO'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                En Mantenimiento
              </button>
              <button
                onClick={() => setFilterEstado('ALERTA')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filterEstado === 'ALERTA'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Alerta
              </button>
            </div>
          </div>

          {/* LISTA SCROLLABLE DE TORRES */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredRadiobases.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <MapPin className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs">No se encontraron radiobases con los filtros aplicados.</p>
              </div>
            ) : (
              filteredRadiobases.map((rb) => {
                const isSelected = selectedRadiobaseId === rb.id;
                const isOperativa = rb.estado === 'OPERATIVA';
                const isMantenimiento = rb.estado === 'MANTENIMIENTO';

                return (
                  <div
                    key={rb.id}
                    onClick={() => handleSelectRadiobase(rb)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                          {rb.codigo}
                        </span>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[150px]">
                          {rb.nombre}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          isOperativa
                            ? 'bg-emerald-100 text-emerald-700'
                            : isMantenimiento
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {rb.estado}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span className="truncate">{rb.region}</span>
                      <span className="font-mono text-slate-400">{rb.alturaMetros}m &middot; {rb.tecnologia}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* PIE DE LISTA */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex items-center justify-between font-medium">
            <span>Mostrando {filteredRadiobases.length} sitios</span>
            <span className="text-slate-400">Clic para volar al sitio</span>
          </div>
        </div>

        {/* MAPA INTERACTIVO LEAFLET EN VIVO */}
        <div className="lg:col-span-3 h-[620px] bg-slate-100 rounded-3xl overflow-hidden relative shadow-sm border border-slate-200">
          <RadiobasesMapLeaflet
            radiobases={filteredRadiobases}
            selectedId={selectedRadiobaseId}
            onSelectRadiobase={handleSelectRadiobase}
          />
        </div>
      </div>
    </div>
  );
}
