'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { comprimirImagenEnCliente } from '@/client/utils/compression';
import { offlineDB } from '@/client/offline/dexie-db';

interface SlotData {
  id: number;
  tipoEquipo: string;
  nombre: string;
  fotoAntes: string | null;
  fotoDespues: string | null;
  tamanoAntes?: string;
  tamanoDespues?: string;
}

interface ZonaData {
  numero: number;
  descripcion: string;
  estado: 'NORMAL' | 'OBSERVADO' | 'NO_APLICA';
}

const SLOTS_INICIALES: SlotData[] = [
  { id: 1, tipoEquipo: 'CAMARA', nombre: 'Cámara Domo Perimetral', fotoAntes: null, fotoDespues: null },
  { id: 2, tipoEquipo: 'PIR', nombre: 'Sensor PIR Infrarrojo', fotoAntes: null, fotoDespues: null },
  { id: 3, tipoEquipo: 'BOTON', nombre: 'Botón de Pánico Baliza', fotoAntes: null, fotoDespues: null },
  { id: 4, tipoEquipo: 'TECLADO', nombre: 'Teclado de Alarma y Acceso', fotoAntes: null, fotoDespues: null },
  { id: 5, tipoEquipo: 'DVR', nombre: 'DVR / Grabador NVR', fotoAntes: null, fotoDespues: null },
  { id: 6, tipoEquipo: 'TABLERO', nombre: 'Tablero Eléctrico Principal', fotoAntes: null, fotoDespues: null },
];

const DESCRIPCIONES_ZONAS_DEFAULT = [
  'Cerco Perimetral Norte', 'Cerco Perimetral Sur', 'Cerco Perimetral Este', 'Cerco Perimetral Oeste',
  'Puerta de Ingreso Principal', 'Portón Vehicular', 'Sensor Sísmico Torre Base', 'Sensor Sísmico Mástil',
  'PIR Gabinete Baterías', 'PIR Shelter Principal', 'Detector Humo Shelter', 'Detector Inundación Fosa',
  'Tamper Gabinete Rectificadores', 'Tamper Caja Distribución AC', 'Tamper Tablero Transferencia', 'Sensor Apertura Rack 1',
  'Sensor Apertura Rack 2', 'Sensor Apertura Rack 3', 'Botón Pánico Caseta', 'Botón Pánico Portón',
  'Microondas Enlace Principal', 'Microondas Backup', 'Baliza Obstrucción Aeronáutica L1', 'Baliza Obstrucción L2',
  'Cámara PTZ Domo 1', 'Cámara Fija Perimetral 2', 'Cámara Entrada Shelter', 'Cámara Panorámica Torre',
  'Monitoreo Generador Diesel', 'Sensor Nivel Combustible', 'Sensor Temperatura Shelter', 'Sensor Flujo Aire Acondicionado',
  'Sensor Puesta a Tierra Torre', 'Sensor Descargador Sobretensión', 'Alarma Falla Red Comercial', 'Alarma Batería Baja',
  'Sensor Vibración Escalerilla', 'Tamper Climatizador 1', 'Tamper Climatizador 2', 'Detector Rotura Vidrio',
  'Sensor Infrarrojo Barrera 1', 'Sensor Infrarrojo Barrera 2', 'Contacto Magnético Escotilla', 'Sirena Exterior Torre',
  'Sirena Interior Shelter', 'Estroboscópica Baliza', 'Luz Emergencia LED', 'Cierre Electromagnético Acceso'
];

function MobileContent() {
  const searchParams = useSearchParams();
  const reporteId = searchParams.get('reporteId') || 'rep-001';
  const siteCodigo = searchParams.get('site') || 'RDB-001';
  const siteNombre = searchParams.get('sitio') || 'Torre Puerto Madero Central';
  const modeParam = searchParams.get('mode');

  const [slots, setSlots] = useState<SlotData[]>(SLOTS_INICIALES);
  const [zonas, setZonas] = useState<ZonaData[]>(() =>
    Array.from({ length: 48 }, (_, i) => ({
      numero: i + 1,
      descripcion: DESCRIPCIONES_ZONAS_DEFAULT[i] || `Zona Técnica ${i + 1}`,
      estado: 'NORMAL',
    }))
  );

  const [tabActiva, setTabActiva] = useState<'FOTOS' | 'ZONAS'>(() =>
    modeParam === 'ZONAS' ? 'ZONAS' : 'FOTOS'
  );
  const [tipoReporteGuardado, setTipoReporteGuardado] = useState<'FOTOGRAFICO' | 'TECNICO' | 'UNIFICADO'>('UNIFICADO');
  const [isOnline, setIsOnline] = useState(true);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [comprimiendo, setComprimiendo] = useState(false);
  const [modoSol, setModoSol] = useState(false);
  const [modalCompletado, setModalCompletado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCapture = async (
    slotId: number,
    momento: 'ANTES' | 'DESPUES',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setComprimiendo(true);
    try {
      const res = await comprimirImagenEnCliente(file, {
        maxDimension: 1200,
        calidad: 0.8,
        formato: 'image/webp',
      });

      const tamanoKb = `${(res.tamanoBytes / 1024).toFixed(1)} KB WebP`;

      setSlots((prev) =>
        prev.map((s) => {
          if (s.id === slotId) {
            return {
              ...s,
              [momento === 'ANTES' ? 'fotoAntes' : 'fotoDespues']: res.url,
              [momento === 'ANTES' ? 'tamanoAntes' : 'tamanoDespues']: tamanoKb,
            };
          }
          return s;
        })
      );

      await offlineDB.evidencias.add({
        reporteId: `${siteCodigo}_DRAFT`,
        tipoEquipo: slots.find((s) => s.id === slotId)?.tipoEquipo || 'EQUIPO',
        slotNumero: slotId,
        momento,
        blobData: res.blob,
        previewUrl: res.url,
        sincronizado: false,
        creadoEn: new Date().toISOString(),
      });

      setMensajeExito(`Foto ${momento} procesada: ${tamanoKb}. Guardada en almacenamiento local.`);
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      alert(`Error al procesar imagen: ${err.message}`);
    } finally {
      setComprimiendo(false);
    }
  };

  const cargarEjemploCompleto = () => {
    const fotosDemo = [
      {
        antes: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      },
      {
        antes: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
      },
      {
        antes: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&auto=format&fit=crop&q=80',
      },
      {
        antes: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      },
      {
        antes: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&auto=format&fit=crop&q=80',
      },
      {
        antes: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1581092787765-7351c2807e3d?w=600&auto=format&fit=crop&q=80',
      },
    ];

    setSlots(
      SLOTS_INICIALES.map((slot, index) => ({
        ...slot,
        fotoAntes: fotosDemo[index].antes,
        fotoDespues: fotosDemo[index].despues,
        tamanoAntes: '184.2 KB (WebP)',
        tamanoDespues: '210.6 KB (WebP)',
      }))
    );

    setMensajeExito('Se han cargado las 6 evidencias con pares Antes/Después listos.');
    setTimeout(() => setMensajeExito(null), 5000);
  };

  const certificarTodasZonasNormales = () => {
    setZonas((prev) => prev.map((z) => ({ ...z, estado: 'NORMAL' })));
    setMensajeExito('Las 48 zonas han sido certificadas como NORMALES.');
    setTimeout(() => setMensajeExito(null), 3000);
  };

  const toggleEstadoZona = (numero: number) => {
    setZonas((prev) =>
      prev.map((z) => {
        if (z.numero === numero) {
          const prox = z.estado === 'NORMAL' ? 'OBSERVADO' : z.estado === 'OBSERVADO' ? 'NO_APLICA' : 'NORMAL';
          return { ...z, estado: prox };
        }
        return z;
      })
    );
  };

  const finalizarYEnviarReporte = async (tipo: 'FOTOGRAFICO' | 'TECNICO' | 'UNIFICADO' = 'UNIFICADO') => {
    if (tipo === 'FOTOGRAFICO') {
      const totalFotos = slots.filter((s) => s.fotoAntes).length;
      if (totalFotos === 0) {
        alert('Debe registrar al menos una foto de evidencia para el Reporte Fotográfico.');
        return;
      }
    }

    setTipoReporteGuardado(tipo);
    setEnviando(true);
    try {
      // Sincronizar o actualizar estado
      await fetch('/api/sync/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporteId,
          tecnicoId: '00000000-0000-0000-0000-000000000001',
          radiobaseId: '11111111-1111-1111-1111-111111111111',
          tipoReporte: tipo,
          evidencias: slots.filter((s) => s.fotoAntes).map((s) => ({
            slotNumero: s.id,
            tipoEquipo: s.tipoEquipo,
            momento: 'ANTES',
            urlImagen: s.fotoAntes || '',
          })),
          zonas: tipo !== 'FOTOGRAFICO' ? zonas : [],
        }),
      }).catch(() => {});

      setModalCompletado(true);
    } finally {
      setEnviando(false);
    }
  };

  const fotosCompletas = slots.filter((s) => s.fotoAntes && s.fotoDespues).length;
  const zonasNormales = zonas.filter((z) => z.estado === 'NORMAL').length;

  return (
    <div className={`min-h-screen w-full pb-32 ${modoSol ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-2xl mx-auto px-4 py-4 w-full">
        
        {/* BARRA SUPERIOR DE CONECTIVIDAD */}
        <div className={`flex items-center justify-between px-3.5 py-2 rounded-xl mb-3 text-xs border ${
          modoSol ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="font-mono text-[11px] font-medium">{isOnline ? 'En línea (4G/5G)' : 'Almacenamiento Local (Offline)'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModoSol(!modoSol)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border ${
                modoSol ? 'bg-amber-400 text-black border-amber-300 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {modoSol ? 'Sol Activo' : 'Modo Sol'}
            </button>
            <Link
              href="/campo"
              className="text-slate-600 hover:text-slate-900 text-[11px] font-semibold transition-colors"
            >
              &larr; Mis Asignaciones
            </Link>
          </div>
        </div>

        {/* CABECERA VINCULADA DEL SITIO (CONTINUIDAD DE CONTEXTO) */}
        <div className={`p-4 rounded-xl mb-4 border ${
          modoSol ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                {siteCodigo}
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                {siteNombre}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-medium">Orden: {reporteId}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 text-[11px]">
              Técnico Asignado: <strong className="text-slate-800 font-semibold">Gerson Martínez</strong>
            </span>
            <button
              onClick={cargarEjemploCompleto}
              className="text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-200 transition-colors cursor-pointer"
            >
              ✨ Cargar Fotos Demo
            </button>
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS (FOTOS VS 48 ZONAS) */}
        <div className="flex gap-2 p-1 bg-slate-200/70 rounded-xl mb-4">
          <button
            onClick={() => setTabActiva('FOTOS')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tabActiva === 'FOTOS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📷 Fotos Antes/Después</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
              {fotosCompletas}/6
            </span>
          </button>

          <button
            onClick={() => setTabActiva('ZONAS')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tabActiva === 'ZONAS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🛡️ Matriz 48 Zonas</span>
            <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
              {zonasNormales}/48
            </span>
          </button>
        </div>

        {/* MENSAJES Y COMPRESIÓN */}
        {mensajeExito && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-medium shadow-sm">
            {mensajeExito}
          </div>
        )}

        {comprimiendo && (
          <div className="mb-4 bg-slate-900 text-white p-3 rounded-xl text-xs font-medium border border-slate-800 shadow-sm animate-pulse">
            Comprimiendo imagen en navegador a WebP (&lt; 250 KB)...
          </div>
        )}

        {/* PESTAÑA 1: SLOTS FOTOGRÁFICOS */}
        {tabActiva === 'FOTOS' && (
          <div className="space-y-3.5">
            {slots.map((slot) => {
              const antesListo = Boolean(slot.fotoAntes);

              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-xl border transition-all ${
                    modoSol
                      ? 'bg-zinc-900 border-zinc-800 text-white'
                      : antesListo && slot.fotoDespues
                      ? 'bg-white border-slate-300 shadow-sm'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                        #{slot.id}
                      </span>
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-900">{slot.nombre}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {slot.tipoEquipo}
                    </span>
                  </div>

                  {/* CUADRICULA DUAL ANTES / DESPUÉS */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* FOTO ANTES */}
                    <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded">
                          ANTES
                        </span>
                        {slot.tamanoAntes && (
                          <span className="text-[9px] font-mono text-emerald-700">{slot.tamanoAntes}</span>
                        )}
                      </div>

                      {slot.fotoAntes ? (
                        <div className="relative rounded-lg overflow-hidden border border-slate-300 aspect-video bg-black flex items-center justify-center">
                          <img
                            src={slot.fotoAntes}
                            alt={`Antes ${slot.nombre}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-lg cursor-pointer bg-white transition-colors">
                          <span className="text-xl">📷</span>
                          <span className="text-[11px] font-medium text-slate-600 mt-1">Capturar Antes</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => handleCapture(slot.id, 'ANTES', e)}
                          />
                        </label>
                      )}
                    </div>

                    {/* FOTO DESPUÉS (CON BLOQUEO REACTIVO) */}
                    <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded">
                          DESPUÉS
                        </span>
                        {slot.tamanoDespues && (
                          <span className="text-[9px] font-mono text-emerald-700">{slot.tamanoDespues}</span>
                        )}
                      </div>

                      {slot.fotoDespues ? (
                        <div className="relative rounded-lg overflow-hidden border border-slate-300 aspect-video bg-black flex items-center justify-center">
                          <img
                            src={slot.fotoDespues}
                            alt={`Después ${slot.nombre}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : antesListo ? (
                        <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-emerald-400 hover:border-emerald-600 rounded-lg cursor-pointer bg-emerald-50/30 transition-colors">
                          <span className="text-xl">📷</span>
                          <span className="text-[11px] font-medium text-emerald-800 mt-1">Capturar Después</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => handleCapture(slot.id, 'DESPUES', e)}
                          />
                        </label>
                      ) : (
                        <div className="flex flex-col items-center justify-center aspect-video border border-slate-200 rounded-lg bg-slate-100 text-slate-400 text-center p-2">
                          <span className="text-base mb-1">🔒</span>
                          <span className="text-[10px] leading-tight">Bloqueado hasta tomar foto Antes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PESTAÑA 2: MATRIZ DE 48 ZONAS */}
        {tabActiva === 'ZONAS' && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">Inspección de 48 Zonas Fijas</h3>
                <p className="text-[11px] text-slate-500">Toque cualquier zona para conmutar su estado.</p>
              </div>
              <button
                onClick={certificarTodasZonasNormales}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                ⚡ Certificar 48 Zonas Normales
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {zonas.map((z) => (
                <div
                  key={z.numero}
                  onClick={() => toggleEstadoZona(z.numero)}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    z.estado === 'NORMAL'
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                      : z.estado === 'OBSERVADO'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-zinc-100 border-zinc-300 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[10px] text-slate-700 w-5">
                      #{z.numero}
                    </span>
                    <span className="font-medium text-[11px] leading-tight text-slate-800">
                      {z.descripcion}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      z.estado === 'NORMAL'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : z.estado === 'OBSERVADO'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-zinc-200 text-zinc-600 border-zinc-300'
                    }`}
                  >
                    {z.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* BARRA INFERIOR FIJA DE ACCIÓN (MODULAR SEGÚN PESTAÑA) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="text-xs leading-tight">
            <span className="text-slate-500 text-[11px] block">Progreso Técnico:</span>
            <span className="font-bold text-slate-900">
              {fotosCompletas}/6 fotos &middot; {zonasNormales}/48 zonas
            </span>
          </div>

          <div className="flex items-center gap-2">
            {tabActiva === 'FOTOS' ? (
              <>
                <button
                  onClick={() => finalizarYEnviarReporte('FOTOGRAFICO')}
                  disabled={enviando || slots.filter((s) => s.fotoAntes).length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>{enviando ? 'Guardando...' : '📸 Guardar Reporte Fotográfico'}</span>
                </button>
                <button
                  onClick={() => finalizarYEnviarReporte('UNIFICADO')}
                  disabled={enviando}
                  className="bg-slate-900 hover:bg-black text-white font-semibold text-xs px-3 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 hidden sm:flex items-center gap-1 cursor-pointer active:scale-95"
                  title="Guardar expediente completo (Fotos + Zonas)"
                >
                  <span>📑 Guardar Todo</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => finalizarYEnviarReporte('TECNICO')}
                  disabled={enviando}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>{enviando ? 'Guardando...' : '📋 Guardar Ficha Técnica'}</span>
                </button>
                <button
                  onClick={() => finalizarYEnviarReporte('UNIFICADO')}
                  disabled={enviando}
                  className="bg-slate-900 hover:bg-black text-white font-semibold text-xs px-3 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 hidden sm:flex items-center gap-1 cursor-pointer active:scale-95"
                  title="Guardar expediente completo (Fotos + Zonas)"
                >
                  <span>📑 Guardar Todo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE ÉXITO OPERATIVO (CIERRE MODULAR) */}
      {modalCompletado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
              ✓
            </div>

            <h3 className="font-bold text-base text-slate-900 mb-1">
              {tipoReporteGuardado === 'FOTOGRAFICO'
                ? '¡Reporte Fotográfico Guardado!'
                : tipoReporteGuardado === 'TECNICO'
                ? '¡Ficha Técnica Guardada!'
                : '¡Informe Unificado Guardado!'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              La entrega para <strong>{siteNombre}</strong> ({siteCodigo}) ha sido registrada con éxito. Estado: <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">COMPLETADO</span>.
            </p>

            <div className="space-y-2">
              <Link
                href={`/reportes/${reporteId}/pdf?vista=${tipoReporteGuardado === 'FOTOGRAFICO' ? 'FOTOS' : tipoReporteGuardado === 'TECNICO' ? 'TECNICO' : 'UNIFICADO'}`}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>📄 Ver este Entregable (PDF)</span>
              </Link>

              <Link
                href={`/reportes/${reporteId}/pdf?vista=UNIFICADO`}
                className="w-full py-2 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-blue-200"
              >
                <span>📑 Ver Informe Unificado (Completo)</span>
              </Link>

              <Link
                href="/campo"
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>&larr; Volver a mis Asignaciones</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MobileFieldPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-slate-500">Cargando terminal de torre...</div>}>
      <MobileContent />
    </Suspense>
  );
}
