'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  { id: 1, tipoEquipo: 'CAMARA', nombre: 'Cámara Domo Perimetral', fotoAntes: null, fotoDespues: null },
  { id: 2, tipoEquipo: 'PIR', nombre: 'Sensor PIR Infrarrojo', fotoAntes: null, fotoDespues: null },
  { id: 3, tipoEquipo: 'BOTON', nombre: 'Botón de Pánico Baliza', fotoAntes: null, fotoDespues: null },
  { id: 4, tipoEquipo: 'TECLADO', nombre: 'Teclado de Alarma y Acceso', fotoAntes: null, fotoDespues: null },
  { id: 5, tipoEquipo: 'DVR', nombre: 'DVR / Grabador NVR', fotoAntes: null, fotoDespues: null },
  { id: 6, tipoEquipo: 'TABLERO', nombre: 'Tablero Eléctrico Principal', fotoAntes: null, fotoDespues: null },
];

export default function MobileFieldPage() {
  const [radiobaseSeleccionada] = useState('RDB-001');
  const [tecnicoNombre] = useState('Gerson Martínez (Técnico Nivel 2)');
  const [slots, setSlots] = useState<SlotData[]>(SLOTS_INICIALES);
  const [isOnline, setIsOnline] = useState(true);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [comprimiendo, setComprimiendo] = useState(false);
  const [modoSol, setModoSol] = useState(false);

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
        reporteId: `${radiobaseSeleccionada}_DRAFT`,
        tipoEquipo: slots.find((s) => s.id === slotId)?.tipoEquipo || 'EQUIPO',
        slotNumero: slotId,
        momento,
        blobData: res.blob,
        previewUrl: res.url,
        sincronizado: false,
        creadoEn: new Date().toISOString(),
      });

      setMensajeExito(`Foto ${momento} procesada: ${tamanoKb}. Guardada en cola offline.`);
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

  const enviarARevision = () => {
    const totalFotos = slots.filter((s) => s.fotoAntes && s.fotoDespues).length;
    if (totalFotos === 0) {
      alert('Debe registrar al menos un par completo (Antes y Después) antes de enviar a revisión.');
      return;
    }

    setMensajeExito(
      `Reporte enviado a supervisión: Estado cambiado a 'EN_REVISION' con ${totalFotos} slots.`
    );
  };

  const fotosCompletas = slots.filter((s) => s.fotoAntes && s.fotoDespues).length;

  return (
    <div className={`min-h-screen w-full pb-28 ${modoSol ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-2xl mx-auto px-4 py-4 w-full">
        
        {/* BARRA SUPERIOR DE CONECTIVIDAD */}
        <div className={`flex items-center justify-between px-3.5 py-2 rounded-xl mb-4 text-xs border ${
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
              className="text-slate-600 hover:text-slate-900 text-[11px] font-medium transition-colors"
            >
              &larr; Asignaciones
            </Link>
          </div>
        </div>

        {/* FICHA TÉCNICA DEL SITIO */}
        <div className={`p-4 rounded-xl mb-4 border ${
          modoSol ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                {radiobaseSeleccionada}
              </span>
              <span className="text-xs font-semibold text-slate-900">
                Torre Puerto Madero Central
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">-34.6118, -58.3635</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">
              Operador: <strong className="text-slate-700 font-medium">{tecnicoNombre}</strong>
            </span>
            <button
              onClick={cargarEjemploCompleto}
              className="text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded border border-slate-200 transition-colors"
            >
              Cargar Demo
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
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

        {/* SLOTS FOTOGRÁFICOS CORRELATIVOS */}
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
                {/* CABECERA DEL SLOT */}
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
                  {/* FOTO 1: ANTES */}
                  <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-700 uppercase">
                        1. Antes
                      </span>
                      {slot.tamanoAntes && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {slot.tamanoAntes}
                        </span>
                      )}
                    </div>

                    {slot.fotoAntes ? (
                      <div className="relative aspect-video rounded-md overflow-hidden border border-slate-200 mb-2">
                        <img
                          src={slot.fotoAntes}
                          alt="Foto Antes"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 bg-black/75 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                          ANTES
                        </span>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-md border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 mb-2 p-2 text-center bg-white">
                        <span className="text-xs text-slate-500 font-medium">Foto Inicial</span>
                      </div>
                    )}

                    <label className="w-full text-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-medium py-2 px-2 rounded-lg cursor-pointer transition-colors shadow-sm">
                      <span>{slot.fotoAntes ? 'Reemplazar' : 'Capturar Antes'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleCapture(slot.id, 'ANTES', e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* FOTO 2: DESPUÉS */}
                  <div
                    className={`border rounded-lg p-2.5 flex flex-col justify-between transition-colors ${
                      antesListo
                        ? 'border-slate-200 bg-slate-50/50'
                        : 'border-slate-200 bg-slate-100/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-700 uppercase">
                        2. Después
                      </span>
                      {slot.tamanoDespues && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {slot.tamanoDespues}
                        </span>
                      )}
                    </div>

                    {slot.fotoDespues ? (
                      <div className="relative aspect-video rounded-md overflow-hidden border border-slate-200 mb-2">
                        <img
                          src={slot.fotoDespues}
                          alt="Foto Después"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                          DESPUES
                        </span>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-md border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 mb-2 p-2 text-center bg-white">
                        <span className="text-xs text-slate-400 font-medium">
                          {antesListo ? 'Foto Final' : 'Bloqueado'}
                        </span>
                      </div>
                    )}

                    {antesListo ? (
                      <label className="w-full text-center bg-slate-900 hover:bg-black text-white text-xs font-medium py-2 px-2 rounded-lg cursor-pointer transition-colors shadow-sm">
                        <span>{slot.fotoDespues ? 'Reemplazar' : 'Capturar Después'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleCapture(slot.id, 'DESPUES', e)}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="w-full text-center bg-slate-200/80 text-slate-500 text-[11px] font-medium py-2 px-2 rounded-lg flex items-center justify-center cursor-not-allowed">
                        <span>Requiere Foto Antes</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BARRA FLOTANTE FIJA INFERIOR */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 p-3 shadow-lg z-40">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-mono font-bold text-slate-900 text-base">{fotosCompletas}/6</span>
              <span className="text-slate-500 ml-1.5 font-medium">Pares Completados</span>
            </div>
            <button
              onClick={enviarARevision}
              className="flex-1 max-w-xs bg-slate-900 hover:bg-black text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Enviar a Revisión QA</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
