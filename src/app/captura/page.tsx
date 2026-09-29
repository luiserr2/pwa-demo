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
  { id: 1, tipoEquipo: 'CAMARA', nombre: 'C├ímara Domo Perimetral', fotoAntes: null, fotoDespues: null },
  { id: 2, tipoEquipo: 'PIR', nombre: 'Sensor PIR Infrarrojo', fotoAntes: null, fotoDespues: null },
  { id: 3, tipoEquipo: 'BOTON', nombre: 'Bot├│n de P├ínico Baliza', fotoAntes: null, fotoDespues: null },
  { id: 4, tipoEquipo: 'TECLADO', nombre: 'Teclado de Alarma y Acceso', fotoAntes: null, fotoDespues: null },
  { id: 5, tipoEquipo: 'DVR', nombre: 'DVR / Grabador NVR', fotoAntes: null, fotoDespues: null },
  { id: 6, tipoEquipo: 'TABLERO', nombre: 'Tablero El├®ctrico Principal', fotoAntes: null, fotoDespues: null },
];

const DESCRIPCIONES_ZONAS_DEFAULT = [
  'Cerco Perimetral Norte', 'Cerco Perimetral Sur', 'Cerco Perimetral Este', 'Cerco Perimetral Oeste',
  'Puerta de Ingreso Principal', 'Port├│n Vehicular', 'Sensor S├¡smico Torre Base', 'Sensor S├¡smico M├ístil',
  'PIR Gabinete Bater├¡as', 'PIR Shelter Principal', 'Detector Humo Shelter', 'Detector Inundaci├│n Fosa',
  'Tamper Gabinete Rectificadores', 'Tamper Caja Distribuci├│n AC', 'Tamper Tablero Transferencia', 'Sensor Apertura Rack 1',
  'Sensor Apertura Rack 2', 'Sensor Apertura Rack 3', 'Bot├│n P├ínico Caseta', 'Bot├│n P├ínico Port├│n',
  'Microondas Enlace Principal', 'Microondas Backup', 'Baliza Obstrucci├│n Aeron├íutica L1', 'Baliza Obstrucci├│n L2',
  'C├ímara PTZ Domo 1', 'C├ímara Fija Perimetral 2', 'C├ímara Entrada Shelter', 'C├ímara Panor├ímica Torre',
  'Monitoreo Generador Diesel', 'Sensor Nivel Combustible', 'Sensor Temperatura Shelter', 'Sensor Flujo Aire Acondicionado',
  'Sensor Puesta a Tierra Torre', 'Sensor Descargador Sobretensi├│n', 'Alarma Falla Red Comercial', 'Alarma Bater├¡a Baja',
  'Sensor Vibraci├│n Escalerilla', 'Tamper Climatizador 1', 'Tamper Climatizador 2', 'Detector Rotura Vidrio',
  'Sensor Infrarrojo Barrera 1', 'Sensor Infrarrojo Barrera 2', 'Contacto Magn├®tico Escotilla', 'Sirena Exterior Torre',
  'Sirena Interior Shelter', 'Estrobosc├│pica Baliza', 'Luz Emergencia LED', 'Cierre Electromagn├®tico Acceso'
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
      descripcion: DESCRIPCIONES_ZONAS_DEFAULT[i] || `Zona T├®cnica ${i + 1}`,
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

    setSlots((prev) =>
      prev.map((s, idx) => ({
        ...s,
        fotoAntes: fotosDemo[idx]?.antes || s.fotoAntes,
        fotoDespues: fotosDemo[idx]?.despues || s.fotoDespues,
        tamanoAntes: '185.4 KB WebP',
        tamanoDespues: '192.1 KB WebP',
      }))
    );

    setMensajeExito('Fotos de demostraci├│n cargadas. Ahora puede probar la exportaci├│n independiente.');
    setTimeout(() => setMensajeExito(null), 4000);
  };

  const toggleEstadoZona = (numero: number) => {
    setZonas((prev) =>
      prev.map((z) => {
        if (z.numero === numero) {
          const proximoEstado: Record<string, 'NORMAL' | 'OBSERVADO' | 'NO_APLICA'> = {
            NORMAL: 'OBSERVADO',
            OBSERVADO: 'NO_APLICA',
            NO_APLICA: 'NORMAL',
          };
          return { ...z, estado: proximoEstado[z.estado] };
        }
        return z;
      })
    );
  };

  const certificarTodasZonasNormales = () => {
    setZonas((prev) => prev.map((z) => ({ ...z, estado: 'NORMAL' })));
    setMensajeExito('Todas las 48 zonas marcadas en estado NORMAL.');
    setTimeout(() => setMensajeExito(null), 3000);
  };

  const finalizarYEnviarReporte = async (tipo: 'FOTOGRAFICO' | 'TECNICO' | 'UNIFICADO' = 'UNIFICADO') => {
    if (tipo === 'FOTOGRAFICO') {
      const totalFotos = slots.filter((s) => s.fotoAntes).length;
      if (totalFotos === 0) {
        alert('Debe registrar al menos una foto de evidencia para el Reporte Fotogr├ífico.');
        return;
      }
    }

    setTipoReporteGuardado(tipo);
    setEnviando(true);
    try {
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
    <div className={`min-h-screen w-full pb-36 lg:pb-12 ${modoSol ? 'bg-black text-amber-300' : 'bg-slate-50 text-slate-800'}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 w-full lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: SIDEBAR EN PC */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-4 mb-4 lg:mb-0">
        
        {/* BARRA SUPERIOR DE CONECTIVIDAD & MODO SOL */}
        <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl mb-3 text-xs border ${
          modoSol ? 'bg-zinc-950 border-amber-500/40 text-amber-300' : 'bg-white border-slate-200 text-slate-600 shadow-xs'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="font-mono text-[11px] font-medium">{isOnline ? 'En l├¡nea (4G/5G)' : 'Almacenamiento Local (Offline)'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModoSol(!modoSol)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer active:translate-y-[1px] ${
                modoSol ? 'bg-amber-400 text-black border-amber-300 font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {modoSol ? 'Modo Sol Activo' : 'Modo Sol'}
            </button>
            <Link
              href="/campo"
              className="text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors flex items-center gap-1"
            >
              &larr; Asignaciones
            </Link>
          </div>
        </div>

        {/* CABECERA VINCULADA DEL SITIO (CONTINUIDAD DE CONTEXTO) */}
        <div className={`p-5 rounded-xl mb-4 border ${
          modoSol ? 'bg-zinc-950 border-amber-500/30' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                {siteCodigo}
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                {siteNombre}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-medium">Orden: {reporteId}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
            <span className="text-slate-500 text-[11px]">
              T├®cnico: <strong className="text-slate-800 font-semibold">Gerson Mart├¡nez</strong>
            </span>
            <button
              onClick={cargarEjemploCompleto}
              className="min-h-[36px] text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 active:translate-y-[1px]"
            >
              <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Fotos Demo</span>
            </button>
          </div>
        </div>

        {/* SELECTOR DE PESTA├æAS (FOTOS VS 48 ZONAS) */}
        <div className="flex gap-2 p-1 bg-slate-200/60 border border-slate-200 rounded-xl mb-4">
          <button
            onClick={() => setTabActiva('FOTOS')}
            className={`flex-1 min-h-[44px] py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tabActiva === 'FOTOS'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>Fotos Antes / Despu├®s</span>
            <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
              {fotosCompletas}/6
            </span>
          </button>

          <button
            onClick={() => setTabActiva('ZONAS')}
            className={`flex-1 min-h-[44px] py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tabActiva === 'ZONAS'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span>Matriz 48 Zonas</span>
            <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
              {zonasNormales}/48
            </span>
          </button>
        </div>

        {/* MENSAJES Y COMPRESI├ôN */}
        {mensajeExito && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-medium shadow-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{mensajeExito}</span>
          </div>
        )}

        {comprimiendo && (
          <div className="mb-4 bg-blue-50 text-blue-900 p-3.5 rounded-xl text-xs font-medium border border-blue-200 shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span>Comprimiendo imagen en navegador a WebP (&lt; 250 KB)...</span>
          </div>
        )}

        {/* PESTA├æA 1: SLOTS FOTOGR├üFICOS */}
        {tabActiva === 'FOTOS' && (
          <div className="space-y-4">
            {slots.map((slot) => {
              const antesListo = Boolean(slot.fotoAntes);

              return (
    <div
                  key={slot.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    modoSol
                      ? 'bg-zinc-950 border-amber-500/30 text-white'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center">
                        #{slot.id}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">{slot.nombre}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {slot.tipoEquipo}
                    </span>
                  </div>

                  {/* CUADRICULA DUAL ANTES / DESPU├ëS */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* FOTO ANTES */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded">
                          ANTES
                        </span>
                        {slot.tamanoAntes && (
                          <span className="text-[9px] font-mono text-emerald-700">{slot.tamanoAntes}</span>
                        )}
                      </div>

                      {slot.fotoAntes ? (
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black flex items-center justify-center">
                          <img
                            src={slot.fotoAntes}
                            alt={`Antes ${slot.nombre}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <label className="min-h-[48px] flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg cursor-pointer bg-white hover:bg-blue-50/40 transition-colors p-2 text-center active:translate-y-[1px]">
                          <svg className="w-6 h-6 text-slate-400 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          <span className="text-[11px] font-medium text-slate-600">Capturar Antes</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            aria-label={`Capturar fotograf├¡a estado Antes para slot ${slot.id}: ${slot.nombre}`}
                            className="hidden"
                            onChange={(e) => handleCapture(slot.id, 'ANTES', e)}
                          />
                        </label>
                      )}
                    </div>

                    {/* FOTO DESPU├ëS (CON BLOQUEO REACTIVO) */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded">
                          DESPU├ëS
                        </span>
                        {slot.tamanoDespues && (
                          <span className="text-[9px] font-mono text-emerald-700">{slot.tamanoDespues}</span>
                        )}
                      </div>

                      {slot.fotoDespues ? (
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black flex items-center justify-center">
                          <img
                            src={slot.fotoDespues}
                            alt={`Despu├®s ${slot.nombre}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : antesListo ? (
                        <label className="min-h-[48px] flex flex-col items-center justify-center aspect-video border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-lg cursor-pointer bg-emerald-50/40 hover:bg-emerald-50/80 transition-colors p-2 text-center active:translate-y-[1px]">
                          <svg className="w-6 h-6 text-emerald-600 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          <span className="text-[11px] font-medium text-emerald-700">Capturar Despu├®s</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            aria-label={`Capturar fotograf├¡a estado Despu├®s para slot ${slot.id}: ${slot.nombre}`}
                            className="hidden"
                            onChange={(e) => handleCapture(slot.id, 'DESPUES', e)}
                          />
                        </label>
                      ) : (
                        <div className="flex flex-col items-center justify-center aspect-video border border-slate-200 rounded-lg bg-slate-100/70 text-slate-400 text-center p-2">
                          <svg className="w-5 h-5 text-slate-400 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
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

        {/* PESTA├æA 2: MATRIZ DE 48 ZONAS */}
        {tabActiva === 'ZONAS' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">Inspecci├│n de 48 Zonas Fijas</h3>
                <p className="text-[11px] text-slate-500">Toque cualquier zona para alternar su estado operativo.</p>
              </div>
              <button
                onClick={certificarTodasZonasNormales}
                className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:translate-y-[1px]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Certificar 48 Zonas Normales</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {zonas.map((z) => (
                <div
                  key={z.numero}
                  onClick={() => toggleEstadoZona(z.numero)}
                  className={`min-h-[44px] p-3 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all active:translate-y-[1px] ${
                    z.estado === 'NORMAL'
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      : z.estado === 'OBSERVADO'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[10px] text-slate-500 w-5">
                      #{z.numero}
                    </span>
                    <span className="font-medium text-[11px] leading-tight text-slate-800">
                      {z.descripcion}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                      z.estado === 'NORMAL'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : z.estado === 'OBSERVADO'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
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

      </div>

{/* BARRA INFERIOR FIJA DE ACCI├ôN (TOUCH TARGETS ERGON├ôMICOS >= 48PX) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 z-40 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="text-xs leading-tight">
            <span className="text-slate-500 text-[11px] block">Progreso T├®cnico:</span>
            <span className="font-bold text-slate-900 font-mono">
              {fotosCompletas}/6 fotos &middot; {zonasNormales}/48 zonas
            </span>
          </div>

          <div className="flex items-center gap-2">
            {tabActiva === 'FOTOS' ? (
              <>
                <button
                  onClick={() => finalizarYEnviarReporte('FOTOGRAFICO')}
                  disabled={enviando || slots.filter((s) => s.fotoAntes).length === 0}
                  className="min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>{enviando ? 'Guardando...' : 'Guardar Reporte Fotos'}</span>
                </button>
                <button
                  onClick={() => finalizarYEnviarReporte('UNIFICADO')}
                  disabled={enviando}
                  className="min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium text-xs px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 hidden sm:flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
                  title="Guardar expediente completo (Fotos + Zonas)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  <span>Guardar Todo</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => finalizarYEnviarReporte('TECNICO')}
                  disabled={enviando}
                  className="min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{enviando ? 'Guardando...' : 'Guardar Ficha T├®cnica'}</span>
                </button>
                <button
                  onClick={() => finalizarYEnviarReporte('UNIFICADO')}
                  disabled={enviando}
                  className="min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium text-xs px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 hidden sm:flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
                  title="Guardar expediente completo (Fotos + Zonas)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  <span>Guardar Todo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE ├ëXITO OPERATIVO (SHEET CLARA MODAL) */}
      {modalCompletado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-exito-title"
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900 text-center animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h3 id="modal-exito-title" className="font-bold text-base text-slate-900 mb-1">
              {tipoReporteGuardado === 'FOTOGRAFICO'
                ? 'Reporte Fotogr├ífico Guardado'
                : tipoReporteGuardado === 'TECNICO'
                ? 'Ficha T├®cnica Guardada'
                : 'Informe Unificado Guardado'}
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              La entrega para <strong className="text-slate-900">{siteNombre}</strong> ({siteCodigo}) ha sido registrada con ├®xito. Estado: <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">COMPLETADO</span>.
            </p>

            <div className="space-y-2">
              <Link
                href={`/reportes/${reporteId}/pdf?vista=${tipoReporteGuardado === 'FOTOGRAFICO' ? 'FOTOS' : tipoReporteGuardado === 'TECNICO' ? 'TECNICO' : 'UNIFICADO'}`}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 active:translate-y-[1px]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>Ver este Entregable (PDF)</span>
              </Link>

              <Link
                href={`/reportes/${reporteId}/pdf?vista=UNIFICADO`}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200 active:translate-y-[1px]"
              >
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span>Ver Informe Unificado Completo</span>
              </Link>

              <Link
                href="/campo"
                className="w-full min-h-[44px] py-2.5 px-4 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>&larr; Volver a Mis Asignaciones</span>
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
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-6 text-center text-xs text-slate-500 font-mono">Cargando terminal de torre...</div>}>
      <MobileContent />
    </Suspense>
  );
}
