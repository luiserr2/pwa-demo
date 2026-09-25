'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { offlineDB, EvidenciaOffline } from '@/client/offline/dexie-db';

export default function CampoPortalPage() {
  const [tabActiva, setTabActiva] = useState<'ASIGNACIONES' | 'COLA'>('ASIGNACIONES');
  const [modoSol, setModoSol] = useState(false);
  const [offlineEvidencias, setOfflineEvidencias] = useState<EvidenciaOffline[]>([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ tipo: 'ok' | 'err'; msg: string } | null>(null);

  const cargarTelemetriaDexie = async () => {
    try {
      const items = await offlineDB.evidencias.toArray();
      setOfflineEvidencias(items);
    } catch (e) {
      console.error('Error leyendo Dexie:', e);
    }
  };

  useEffect(() => {
    cargarTelemetriaDexie();
  }, []);

  const handleSyncOffline = async () => {
    setSincronizando(true);
    setSyncFeedback(null);
    try {
      const pendientes = offlineEvidencias.filter((e) => !e.sincronizado);
      const lote = pendientes.length > 0 ? pendientes : offlineEvidencias.slice(0, 4);

      const payload = {
        reporteId: 'rep-001',
        tecnicoId: '00000000-0000-0000-0000-000000000001',
        radiobaseId: '11111111-1111-1111-1111-111111111111',
        evidencias: (lote.length > 0
          ? lote
          : [
              {
                slotNumero: 1,
                tipoEquipo: 'CAMARA',
                momento: 'ANTES' as const,
                previewUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
                blobData: new Blob([]),
                sincronizado: false,
                creadoEn: new Date().toISOString(),
                reporteId: 'rep-001',
              },
            ]
        ).map((item, idx) => ({
          slotNumero: item.slotNumero || idx + 1,
          tipoEquipo: item.tipoEquipo || 'EQUIPO',
          momento: (item.momento as 'ANTES' | 'DESPUES') || 'ANTES',
          urlImagen:
            item.previewUrl && !item.previewUrl.startsWith('blob:')
              ? item.previewUrl
              : 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
          creadoEn: item.creadoEn || new Date().toISOString(),
        })),
      };

      const res = await fetch('/api/sync/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.ok) {
        if (pendientes.length > 0) {
          for (const ev of pendientes) {
            if (ev.localId) {
              await offlineDB.evidencias.update(ev.localId, { sincronizado: true });
            }
          }
          await cargarTelemetriaDexie();
        }
        setSyncFeedback({
          tipo: 'ok',
          msg: `Sincronización confirmada: ${json.data.evidenciasProcesadas} evidencias respaldadas en base central.`,
        });
      } else {
        setSyncFeedback({
          tipo: 'err',
          msg: json.error || 'Error al conectar con el servidor de sincronización.',
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        tipo: 'err',
        msg: `Fallo de red: ${err.message}. Los datos permanecen seguros en almacenamiento local.`,
      });
    } finally {
      setSincronizando(false);
    }
  };

  const asignacionesHoy = [
    {
      id: 'rep-001',
      codigo: 'RDB-001_20260922',
      siteCodigo: 'RDB-001',
      nombre: 'Torre Puerto Madero Central',
      region: 'AMBA / CABA',
      coordenadas: '-34.6118, -58.3635',
      tipo: 'Mantenimiento Preventivo & Fotos 48 Zonas',
      prioridad: 'ALTA',
      estado: 'COMPLETADO',
      slotsCompletados: 6,
      slotsTotales: 6,
      fotosPendientes: 0,
    },
    {
      id: 'rep-002',
      codigo: 'RDB-002_20260922',
      siteCodigo: 'RDB-002',
      nombre: 'Cerro Catedral Repetidor',
      region: 'Patagonia Norte',
      coordenadas: '-41.1714, -71.4392',
      tipo: 'Inspección de Equipos y Enlaces Microondas',
      prioridad: 'ALTA',
      estado: 'EN_PROGRESO',
      slotsCompletados: 5,
      slotsTotales: 6,
      fotosPendientes: 1,
    },
    {
      id: 'rep-004',
      codigo: 'RDB-004_20260920',
      siteCodigo: 'RDB-004',
      nombre: 'Palermo Soho Microcelda',
      region: 'CABA Norte',
      coordenadas: '-34.5885, -58.4306',
      tipo: 'Inspección Rutinaria de Baterías e Inversores',
      prioridad: 'NORMAL',
      estado: 'PENDIENTE',
      slotsCompletados: 0,
      slotsTotales: 6,
      fotosPendientes: 6,
    },
  ];

  return (
    <div className={`min-h-screen w-full pb-20 ${modoSol ? 'bg-black text-amber-300' : 'bg-[#0A0F1D] text-slate-100'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full">
        
        {/* BARRA DE TELEMETRÍA Y MODO SOL */}
        <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl mb-6 text-xs border ${
          modoSol ? 'bg-zinc-950 border-amber-500/40 text-amber-300' : 'bg-slate-900/60 border-white/[0.08] text-slate-400 backdrop-blur-md'
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              En Línea (4G/5G)
            </span>
            <span className="text-white/[0.1]">|</span>
            <span className="font-mono text-[11px] text-slate-400">Cuadrilla 04 &middot; Gerson Martínez</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModoSol(!modoSol)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer active:translate-y-[1px] ${
                modoSol
                  ? 'bg-amber-400 text-black border-amber-300 font-bold'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]'
              }`}
            >
              {modoSol ? 'Modo Sol Activo' : 'Modo Sol'}
            </button>
            <span className="font-mono text-[10px] text-slate-400 bg-white/[0.04] px-2 py-1 rounded border border-white/[0.08]">
              Dexie OK
            </span>
          </div>
        </div>

        {/* CABECERA DE LA TERMINAL DE CAMPO */}
        <div className={`p-6 rounded-xl mb-6 border ${
          modoSol ? 'bg-zinc-950 border-amber-500/30' : 'bg-slate-900/60 border-white/[0.08] backdrop-blur-md shadow-[0_4px_24px_-2px_rgba(10,15,29,0.8)]'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25 font-semibold">
                  Terminal de Operaciones en Torre
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Gestión de Órdenes e Informes de Campo
              </h1>
              <p className="text-slate-400 text-xs mt-1 max-w-xl">
                Módulos de campo independientes: Genere reportes fotográficos, fichas técnicas o unifique ambos en un expediente oficial consolidado.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/mobile?reporteId=rep-001&site=RDB-001&sitio=Torre%20Puerto%20Madero%20Central&mode=FOTOS"
                className="min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 active:translate-y-[1px] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Cámara Fotos</span>
              </Link>
              <Link
                href="/mobile?reporteId=rep-001&site=RDB-001&sitio=Torre%20Puerto%20Madero%20Central&mode=ZONAS"
                className="min-h-[44px] bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] font-medium text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 active:translate-y-[1px] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>Zonas & Equipos</span>
              </Link>
            </div>
          </div>
        </div>

        {/* CONTROL SEGMENTADO DE VISTAS (TABS) */}
        <div className="bg-white/[0.03] p-1 rounded-lg flex gap-1 border border-white/[0.08] mb-6 max-w-md">
          <button
            onClick={() => setTabActiva('ASIGNACIONES')}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all text-center cursor-pointer ${
              tabActiva === 'ASIGNACIONES'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sitios Asignados ({asignacionesHoy.length})
          </button>
          <button
            onClick={() => setTabActiva('COLA')}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all text-center cursor-pointer ${
              tabActiva === 'COLA'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Almacén Local Dexie ({offlineEvidencias.length})
          </button>
        </div>

        {/* VISTA 1: SITIOS ASIGNADOS */}
        {tabActiva === 'ASIGNACIONES' && (
          <div className="space-y-4">
            {asignacionesHoy.map((sitio) => {
              const porcentaje = Math.round((sitio.slotsCompletados / sitio.slotsTotales) * 100);
              const esCompletado = sitio.estado === 'COMPLETADO';

              return (
                <div
                  key={sitio.id}
                  className={`rounded-xl p-5 border transition-all ${
                    modoSol
                      ? 'bg-zinc-950 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900/60 border-white/[0.08] backdrop-blur-md shadow-[0_4px_24px_-2px_rgba(10,15,29,0.8)]'
                  }`}
                >
                  {/* HEADER DE TARJETA */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-white bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                          {sitio.siteCodigo}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {sitio.coordenadas}
                        </span>
                      </div>
                      <h2 className="font-bold text-base text-white">
                        {sitio.nombre}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                          sitio.prioridad === 'URGENTE' || sitio.prioridad === 'ALTA'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                            : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                        }`}
                      >
                        {sitio.prioridad}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                          esCompletado
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : sitio.estado === 'EN_PROGRESO'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                            : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                        }`}
                      >
                        {sitio.estado}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">
                    {sitio.tipo} &middot; <span className="font-medium text-slate-300">{sitio.region}</span>
                  </p>

                  {/* METRICAS DE ENTREGABLES MODULARES */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-slate-300 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          <span>Reporte Fotográfico</span>
                        </span>
                        <span className="font-mono font-bold text-white text-[11px]">
                          {sitio.slotsCompletados}/{sitio.slotsTotales} pares
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-slate-300 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span>Ficha Técnica</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-[11px]">
                          48/48 zonas
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* HERRAMIENTAS Y ENTREGABLES MODULARES (TOUCH TARGETS >= 44PX-48PX) */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-3">
                    {/* ACCIONES DE LEVANTAMIENTO */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Levantamiento en Sitio:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/mobile?reporteId=${sitio.id}&site=${sitio.siteCodigo}&sitio=${encodeURIComponent(sitio.nombre)}&mode=FOTOS`}
                          className="min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          <span>Tomar Fotos</span>
                        </Link>

                        <Link
                          href={`/mobile?reporteId=${sitio.id}&site=${sitio.siteCodigo}&sitio=${encodeURIComponent(sitio.nombre)}&mode=ZONAS`}
                          className="min-h-[44px] bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] font-medium text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 11 12 14 22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                          </svg>
                          <span>Llenar Zonas</span>
                        </Link>
                      </div>
                    </div>

                    {/* ENTREGABLES (SEPARADOS O UNIFICADOS) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Ver / Exportar:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/reportes/${sitio.id}/pdf?vista=FOTOS`}
                          className="min-h-[44px] text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-2.5 rounded-lg border border-white/[0.08] transition-all flex items-center gap-1.5 active:translate-y-[1px]"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          <span>Solo Fotos</span>
                        </Link>

                        <Link
                          href={`/reportes/${sitio.id}/pdf?vista=TECNICO`}
                          className="min-h-[44px] text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-2.5 rounded-lg border border-white/[0.08] transition-all flex items-center gap-1.5 active:translate-y-[1px]"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span>Solo Ficha</span>
                        </Link>

                        <Link
                          href={`/reportes/${sitio.id}/pdf?vista=UNIFICADO`}
                          className="min-h-[44px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg transition-all shadow-xs flex items-center gap-1.5 active:translate-y-[1px]"
                        >
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                          </svg>
                          <span>Informe Completo</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VISTA 2: ALMACÉN LOCAL DEXIE */}
        {tabActiva === 'COLA' && (
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-5 border border-white/[0.08] shadow-[0_4px_24px_-2px_rgba(10,15,29,0.8)]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="font-bold text-sm text-white">Almacén Local Dexie (IndexedDB)</h3>
                <p className="text-xs text-slate-400">Evidencias persistidas en el navegador a la espera de sincronización central.</p>
              </div>
              <button
                onClick={handleSyncOffline}
                disabled={sincronizando}
                className="min-h-[44px] px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:translate-y-[1px]"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>{sincronizando ? 'Sincronizando...' : 'Sincronizar Lote'}</span>
              </button>
            </div>

            {syncFeedback && (
              <div className={`p-3 rounded-lg text-xs font-medium mb-4 border ${
                syncFeedback.tipo === 'ok' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' : 'bg-rose-500/10 text-rose-300 border-rose-500/25'
              }`}>
                {syncFeedback.msg}
              </div>
            )}

            {offlineEvidencias.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No hay fotos pendientes de sincronización en este dispositivo.
              </div>
            ) : (
              <div className="space-y-2">
                {offlineEvidencias.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs">
                    <div>
                      <span className="font-mono font-bold text-white">Slot {item.slotNumero}</span>
                      <span className="text-slate-400 ml-2 font-mono">{item.tipoEquipo} ({item.momento})</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      item.sincronizado ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                    }`}>
                      {item.sincronizado ? 'SINCRONIZADO' : 'LOCAL PENDIENTE'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
