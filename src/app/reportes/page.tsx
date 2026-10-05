'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Estos estados coinciden EXACTAMENTE con el nuevo enum de la BD
type EstadoReporte = 
  | 'SIN_EMPEZAR'
  | 'EN_VISITA'
  | 'ELABORANDO_INFORME'
  | 'REVISION_INTERNA'
  | 'ENVIADO_AL_CLIENTE'
  | 'VISADO'
  | 'HES_SOLICITADA'
  | 'FACTURADO';

interface ReporteItem {
  id: string;
  displayId?: string;
  radiobase?: { nombre: string, region: string };
  tecnico?: { nombre: string };
  estado: EstadoReporte;
  createdAt: string;
}

const KANBAN_COLUMNS: { id: EstadoReporte; title: string; color: string }[] = [
  { id: 'SIN_EMPEZAR', title: 'Sin Empezar', color: 'bg-slate-200 text-slate-700' },
  { id: 'EN_VISITA', title: 'En Visita (Sitio)', color: 'bg-amber-100 text-amber-700' },
  { id: 'ELABORANDO_INFORME', title: 'Elaborando Informe', color: 'bg-blue-100 text-blue-700' },
  { id: 'REVISION_INTERNA', title: 'Revisión Interna', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'ENVIADO_AL_CLIENTE', title: 'Enviado a Digitel', color: 'bg-purple-100 text-purple-700' },
  { id: 'VISADO', title: 'Visado (Aprobado)', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'HES_SOLICITADA', title: 'HES Solicitada', color: 'bg-orange-100 text-orange-700' },
  { id: 'FACTURADO', title: 'Facturado', color: 'bg-slate-800 text-slate-100' },
];

export default function KanbanPipelinePage() {
  const [reportes, setReportes] = useState<ReporteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportes = async () => {
    try {
      const res = await fetch('/api/reportes');
      const data = await res.json();
      if (Array.isArray(data)) {
        setReportes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const moveReporte = async (id: string, nuevoEstado: EstadoReporte) => {
    // Actualización optimista
    setReportes(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
    
    // Impactar en la DB
    try {
      await fetch(`/api/reportes/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado })
      });
    } catch (e) {
      console.error('Error al mover', e);
      fetchReportes(); // Revertir en caso de error
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-mono text-xs">Cargando Pipeline Operativo...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ocupación Sisbirceca (Pipeline)</h1>
        <p className="text-sm text-slate-500 mt-1">Gestión operativa estilo Notion. Arrastra las tarjetas para avanzar el proceso.</p>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-8 snap-x">
        {KANBAN_COLUMNS.map(col => {
          const columnReports = reportes.filter(r => r.estado === col.id);
          
          return (
            <div key={col.id} className="snap-start shrink-0 w-80 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full shadow-sm">
                  {columnReports.length}
                </span>
              </div>
              
              <div className="flex-1 p-3 space-y-3 min-h-[500px]">
                {columnReports.map(rep => (
                  <div key={rep.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative">
                    <div className="text-[10px] font-mono text-slate-400 mb-2">{rep.id.split('-')[0].toUpperCase()}</div>
                    <div className="font-semibold text-slate-800 text-sm mb-1 leading-tight">
                      {rep.radiobase?.nombre || 'Sitio Sin Asignar'}
                    </div>
                    <div className="text-xs text-slate-500 mb-4">
                      Técnico: <span className="font-medium text-slate-700">{rep.tecnico?.nombre || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      {/* Botón retroceder (solo UI básica de prueba, en producción sería Drag&Drop) */}
                      <button 
                        onClick={() => {
                          const currentIndex = KANBAN_COLUMNS.findIndex(c => c.id === rep.estado);
                          if (currentIndex > 0) moveReporte(rep.id, KANBAN_COLUMNS[currentIndex - 1].id);
                        }}
                        disabled={col.id === 'SIN_EMPEZAR'}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30 text-xs"
                      >
                        &larr; Atrás
                      </button>

                      <Link href={`/reportes/${rep.id}/pdf`} target="_blank" className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">
                        Ver PDF
                      </Link>

                      {/* Botón avanzar */}
                      <button 
                        onClick={() => {
                          const currentIndex = KANBAN_COLUMNS.findIndex(c => c.id === rep.estado);
                          if (currentIndex < KANBAN_COLUMNS.length - 1) moveReporte(rep.id, KANBAN_COLUMNS[currentIndex + 1].id);
                        }}
                        disabled={col.id === 'FACTURADO'}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30 text-xs font-medium"
                      >
                        Avanzar &rarr;
                      </button>
                    </div>
                  </div>
                ))}
                
                {columnReports.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium italic p-8 text-center">
                    No hay reportes en esta fase.
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
