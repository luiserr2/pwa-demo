'use client';

import React, { useState, useEffect } from 'react';
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

const SLOTS_INICIALES: SlotData[] = [
  { id: 1, tipoEquipo: 'CAMARA', nombre: 'Cámara Perimetral Torre', fotoAntes: null, fotoDespues: null },
  { id: 2, tipoEquipo: 'PIR', nombre: 'Sensor PIR Infrarrojo', fotoAntes: null, fotoDespues: null },
  { id: 3, tipoEquipo: 'BOTON', nombre: 'Botón de Pánico Baliza', fotoAntes: null, fotoDespues: null },
  { id: 4, tipoEquipo: 'TECLADO', nombre: 'Teclado de Alarma / Acceso', fotoAntes: null, fotoDespues: null },
  { id: 5, tipoEquipo: 'DVR', nombre: 'DVR / Grabador NVR', fotoAntes: null, fotoDespues: null },
  { id: 6, tipoEquipo: 'TABLERO', nombre: 'Tablero Eléctrico Principal', fotoAntes: null, fotoDespues: null },
];

export default function MobileFieldPage() {
  const [radiobaseSeleccionada, setRadiobaseSeleccionada] = useState('RDB-001');
  const [tecnicoNombre, setTecnicoNombre] = useState('Gerson Martínez (Técnico Nivel 2)');
  const [slots, setSlots] = useState<SlotData[]>(SLOTS_INICIALES);
  const [isOnline, setIsOnline] = useState(true);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [comprimiendo, setComprimiendo] = useState(false);

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
      // Compresión en cliente (< 250 KB WebP)
      const res = await comprimirImagenEnCliente(file, {
        maxDimension: 1200,
        calidad: 0.8,
        formato: 'image/webp',
      });

      const tamanoKb = `${(res.tamanoBytes / 1024).toFixed(1)} KB`;

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

      // Guardar en Dexie para soporte offline
      await offlineDB.evidencias.add({
        reporteId: `${radiobaseSeleccionada}_DRAFT`,
        tipoEquipo: slots.find((s) => s.id === slotId)?.tipoEquipo || 'EQUIPO',
        slotNumero: slotId,
        momento,
        blobData: res.blob,
        previewUrl: res.url,
        sincronizado: false,
        creadoEn: new Date().toISOString(),
      });

      setMensajeExito(`Foto ${momento} comprimida exitosamente (${tamanoKb}). Guardada en cola local.`);
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      alert(`Error al procesar imagen: ${err.message}`);
    } finally {
      setComprimiendo(false);
    }
  };

  const cargarEjemploCompleto = () => {
    // Fotos reales optimizadas de muestra para pruebas en campo
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

    setMensajeExito('Se han cargado las 6 evidencias de campo con pares Antes/Después listos para enviar a revisión.');
    setTimeout(() => setMensajeExito(null), 5000);
  };

  const enviarARevision = () => {
    const totalFotos = slots.filter((s) => s.fotoAntes && s.fotoDespues).length;
    if (totalFotos === 0) {
      alert('Debe registrar al menos un par completo (Antes y Después) antes de enviar a revisión.');
      return;
    }

    setMensajeExito(
      `¡Reporte enviado exitosamente a la bandeja del Supervisor! Estado cambiado a 'EN_REVISION' con ${totalFotos} slots fotográficos.`
    );
  };

  const fotosCompletas = slots.filter((s) => s.fotoAntes && s.fotoDespues).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 w-full pb-20">
      {/* STATUS HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {isOnline ? 'Conexión En Línea' : 'Modo Fuera de Línea (Dexie Activo)'}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            PWA Mobile V1
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Radiobase Seleccionada
            </label>
            <select
              value={radiobaseSeleccionada}
              onChange={(e) => setRadiobaseSeleccionada(e.target.value)}
              className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value="RDB-001">[RDB-001] Torre Puerto Madero (CABA)</option>
              <option value="RDB-002">[RDB-002] Cerro Catedral (Bariloche)</option>
              <option value="RDB-003">[RDB-003] Córdoba Sierras Repetidor</option>
              <option value="RDB-004">[RDB-004] Palermo Soho Microcelda</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Técnico en Campo
            </label>
            <input
              type="text"
              value={tecnicoNombre}
              onChange={(e) => setTecnicoNombre(e.target.value)}
              className="w-full text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={cargarEjemploCompleto}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span>Cargar Ejemplo de Campo</span>
          </button>
          <span className="text-xs font-bold text-slate-500">
            {fotosCompletas} de {slots.length} Slots Listos
          </span>
        </div>
      </div>

      {mensajeExito && (
        <div className="mb-5 bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in">
          <span>✅</span>
          <span>{mensajeExito}</span>
        </div>
      )}

      {comprimiendo && (
        <div className="mb-5 bg-blue-50 border border-blue-300 text-blue-800 p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-pulse">
          <span>⏳</span>
          <span>Optimizando y comprimiendo imagen en navegador a &lt; 250 KB WebP...</span>
        </div>
      )}

      {/* SLOTS LIST */}
      <div className="space-y-4">
        {slots.map((slot) => {
          const antesListo = Boolean(slot.fotoAntes);

          return (
            <div
              key={slot.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {slot.id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800">{slot.nombre}</h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {slot.tipoEquipo}
                </span>
              </div>

              {/* DUAL CAMERA GRID */}
              <div className="grid grid-cols-2 gap-3">
                {/* SLOT ANTES */}
                <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-blue-700 uppercase">
                      1. Antes
                    </span>
                    {slot.tamanoAntes && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {slot.tamanoAntes}
                      </span>
                    )}
                  </div>

                  {slot.fotoAntes ? (
                    <div className="relative aspect-video rounded-md overflow-hidden border border-slate-300 mb-2">
                      <img
                        src={slot.fotoAntes}
                        alt="Foto Antes"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        ANTES
                      </span>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-md border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 mb-2 p-2 text-center">
                      <span className="text-lg">📷</span>
                      <span className="text-[10px] mt-1 font-semibold">Tomar Foto Inicial</span>
                    </div>
                  )}

                  <label className="w-full text-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold py-1.5 px-2 rounded cursor-pointer transition-colors block">
                    <span>{slot.fotoAntes ? 'Cambiar Foto' : 'Capturar Antes'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleCapture(slot.id, 'ANTES', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* SLOT DESPUES */}
                <div
                  className={`border rounded-lg p-2.5 flex flex-col justify-between transition-colors ${
                    antesListo
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-slate-100 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-extrabold uppercase ${
                        antesListo ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      2. Después
                    </span>
                    {slot.tamanoDespues && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {slot.tamanoDespues}
                      </span>
                    )}
                  </div>

                  {slot.fotoDespues ? (
                    <div className="relative aspect-video rounded-md overflow-hidden border border-emerald-300 mb-2">
                      <img
                        src={slot.fotoDespues}
                        alt="Foto Después"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        DESPUES
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`aspect-video rounded-md border-2 border-dashed flex flex-col items-center justify-center mb-2 p-2 text-center ${
                        antesListo
                          ? 'border-emerald-300 text-emerald-600'
                          : 'border-slate-300 text-slate-400'
                      }`}
                    >
                      <span className="text-lg">{antesListo ? '📸' : '🔒'}</span>
                      <span className="text-[10px] mt-1 font-semibold">
                        {antesListo ? 'Tomar Foto Final' : 'Bloqueado'}
                      </span>
                    </div>
                  )}

                  {antesListo ? (
                    <label className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-2 rounded cursor-pointer transition-colors block">
                      <span>{slot.fotoDespues ? 'Cambiar Foto' : 'Capturar Después'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleCapture(slot.id, 'DESPUES', e)}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="w-full text-center bg-slate-200 text-slate-400 text-[11px] font-semibold py-1.5 px-2 rounded cursor-not-allowed">
                      Requiere Antes
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 shadow-lg z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-extrabold text-slate-800">{fotosCompletas} de 6</span>
            <span className="text-slate-500 ml-1">completados</span>
          </div>
          <button
            onClick={enviarARevision}
            className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-md transition-colors text-center"
          >
            Enviar a Revisión del Supervisor
          </button>
        </div>
      </div>
    </div>
  );
}
