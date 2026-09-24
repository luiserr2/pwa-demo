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
      estado: 'EN_PROGRESO',
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
      tipo: 'Subsanación de Foto Observada por QA',
      prioridad: 'URGENTE',
      estado: 'OBSERVADO',
      slotsCompletados: 5,
      slotsTotales: 6,
      fotosPendientes: 1,
      observacionQA: 'Slot #2 (PIR): Foto desenfocada por reflejo solar. Tomar desde ángulo izquierdo.',
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
    <div className={`min-h-screen w-full pb-20 ${modoSol ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full">
        
        {/* BARRA DE TELEMETRÍA Y MODO SOL */}
        <div className={`flex items-center justify-between px-3.5 py-2 rounded-xl mb-6 text-xs border ${
          modoSol ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              En Línea (4G/5G)
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-[11px] text-slate-500">Cuadrilla 04 &middot; Gerson Martínez</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModoSol(!modoSol)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border ${
                modoSol
                  ? 'bg-amber-400 text-black border-amber-300 font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {modoSol ? 'Modo Sol Activo' : 'Modo Sol'}
            </button>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">
              Dexie OK
            </span>
          </div>
        </div>

        {/* CABECERA DE LA TERMINAL */}
        <div className={`p-6 rounded-2xl mb-6 border ${
          modoSol ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  Terminal de Operaciones en Torre
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Órdenes de Trabajo en Sitio
              </h1>
              <p className="text-slate-500 text-xs mt-1 max-w-xl">
                Flujo offline-first: Las capturas se comprimen a WebP (&lt; 250 KB) y se encolan automáticamente ante pérdida de señal en la estructura.
              </p>
            </div>

            <Link
              href="/mobile"
              className="bg-slate-900 hover:bg-black text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <span>Abrir Cámara PWA</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* CONTROL SEGMENTADO DE VISTAS (TABS) */}
        <div className="bg-slate-200/60 p-1 rounded-xl flex gap-1 border border-slate-200/80 mb-6 max-w-md">
          <button
            onClick={() => setTabActiva('ASIGNACIONES')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all text-center ${
              tabActiva === 'ASIGNACIONES'
                ? 'bg-white text-slate-900 font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sitios Asignados ({asignacionesHoy.length})
          </button>
          <button
            onClick={() => setTabActiva('COLA')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all text-center ${
              tabActiva === 'COLA'
                ? 'bg-white text-slate-900 font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Almacén Local Dexie
          </button>
        </div>

        {/* VISTA 1: SITIOS ASIGNADOS */}
        {tabActiva === 'ASIGNACIONES' && (
          <div className="space-y-4">
            {asignacionesHoy.map((sitio) => {
              const porcentaje = Math.round((sitio.slotsCompletados / sitio.slotsTotales) * 100);
              const esObservado = sitio.estado === 'OBSERVADO';

              return (
                <div
                  key={sitio.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    modoSol
                      ? 'bg-zinc-900 border-zinc-800 text-white'
                      : esObservado
                      ? 'bg-white border-amber-300 shadow-sm'
                      : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                  }`}
                >
                  {/* HEADER DE TARJETA */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {sitio.siteCodigo}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {sitio.coordenadas}
                        </span>
                      </div>
                      <h2 className="font-bold text-base text-slate-900">
                        {sitio.nombre}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                          sitio.prioridad === 'URGENTE'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {sitio.prioridad}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                          esObservado
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : sitio.estado === 'EN_PROGRESO'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {sitio.estado}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">
                    {sitio.tipo} &middot; <span className="font-medium text-slate-600">{sitio.region}</span>
                  </p>

                  {/* ALERTA DE RECHAZO TÉCNICO */}
                  {esObservado && (
                    <div className="bg-amber-50/80 border border-amber-200 text-amber-900 p-3 rounded-xl mb-4 text-xs">
                      <span className="font-semibold block mb-0.5">Observación del Supervisor QA:</span>
                      <span>{sitio.observacionQA}</span>
                    </div>
                  )}

                  {/* BARRA DE PROGRESO */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Slots fotográficos</span>
                      <span className="font-mono font-semibold text-slate-700">
                        {sitio.slotsCompletados} / {sitio.slotsTotales} ({porcentaje}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          esObservado ? 'bg-amber-600' : 'bg-slate-900'
                        }`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* ACCIÓN PRINCIPAL */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      {sitio.codigo}
                    </span>

                    <Link
                      href={`/mobile?reporteId=${sitio.id}&site=${sitio.siteCodigo}`}
                      className={`w-full sm:w-auto text-center font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                        esObservado
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-slate-900 hover:bg-black text-white'
                      }`}
                    >
                      <span>{esObservado ? 'Recapturar Foto Observada' : 'Continuar Levantamiento'}</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VISTA 2: ESTADO DEL ALMACÉN OFFLINE DEXIE */}
        {tabActiva === 'COLA' && (
          <div className={`p-6 rounded-2xl border ${modoSol ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Almacenamiento Local Resiliente (IndexedDB / Dexie)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Las imágenes de alta resolución y mediciones se guardan en el dispositivo ante cortes de señal en torre.
              </p>
            </div>

            {syncFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium mb-4 border ${
                  syncFeedback.tipo === 'ok'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {syncFeedback.msg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">En Memoria Local</span>
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {offlineEvidencias.length > 0 ? `${offlineEvidencias.length} WebP` : '12 WebP (Seed)'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {offlineEvidencias.filter((e) => !e.sincronizado).length} pendientes de subida
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Estado Sincronización</span>
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {offlineEvidencias.some((e) => !e.sincronizado) ? 'EN COLA' : 'AL DÍA'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {offlineEvidencias.filter((e) => e.sincronizado).length} respaldadas
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Cuota Navegador</span>
                <span className="text-xl font-bold text-slate-900 font-mono">98.5%</span>
                <span className="text-[10px] text-slate-500 block mt-1">Disponible</span>
              </div>
            </div>

            <button
              onClick={handleSyncOffline}
              disabled={sincronizando}
              className={`w-full text-white font-medium text-xs py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
                sincronizando ? 'bg-slate-400 cursor-wait' : 'bg-slate-900 hover:bg-black'
              }`}
            >
              <span>
                {sincronizando
                  ? 'Sincronizando lote con el servidor central...'
                  : 'Forzar Sincronización Inmediata con Base Central'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
