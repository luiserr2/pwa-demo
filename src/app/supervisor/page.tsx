'use client';

import React, { useState } from 'react';

interface FotoValidacion {
  id: string;
  tipoEquipo: string;
  slotNumero: number;
  nombre: string;
  urlAntes: string;
  urlDespues: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  observacionRechazo?: string;
}

const REPORTES_DEMO = [
  {
    id: 'rep-001',
    codigo: 'RDB-001_20260922',
    radiobase: 'Torre Puerto Madero (CABA)',
    tecnico: 'Gerson Martínez',
    fecha: '2026-09-22',
    estado: 'EN_REVISION' as 'EN_REVISION' | 'OBSERVADO' | 'APROBADO',
  },
  {
    id: 'rep-002',
    codigo: 'RDB-002_20260922',
    radiobase: 'Cerro Catedral Repetidor',
    tecnico: 'Carlos Gómez',
    fecha: '2026-09-22',
    estado: 'OBSERVADO' as 'EN_REVISION' | 'OBSERVADO' | 'APROBADO',
  },
];

const FOTOS_INICIALES: FotoValidacion[] = [
  {
    id: 'f-1',
    tipoEquipo: 'CAMARA',
    slotNumero: 1,
    nombre: 'Cámara Domo Perimetral',
    urlAntes: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=700&auto=format&fit=crop&q=80',
    urlDespues: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&auto=format&fit=crop&q=80',
    estado: 'APROBADO',
  },
  {
    id: 'f-2',
    tipoEquipo: 'PIR',
    slotNumero: 2,
    nombre: 'Sensor PIR Infrarrojo',
    urlAntes: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700&auto=format&fit=crop&q=80',
    urlDespues: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=700&auto=format&fit=crop&q=80',
    estado: 'PENDIENTE',
  },
  {
    id: 'f-3',
    tipoEquipo: 'BOTON',
    slotNumero: 3,
    nombre: 'Botón de Pánico Baliza',
    urlAntes: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=700&auto=format&fit=crop&q=80',
    urlDespues: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=700&auto=format&fit=crop&q=80',
    estado: 'PENDIENTE',
  },
  {
    id: 'f-4',
    tipoEquipo: 'TECLADO',
    slotNumero: 4,
    nombre: 'Teclado de Alarma y Acceso',
    urlAntes: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=700&auto=format&fit=crop&q=80',
    urlDespues: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&auto=format&fit=crop&q=80',
    estado: 'PENDIENTE',
  },
  {
    id: 'f-5',
    tipoEquipo: 'DVR',
    slotNumero: 5,
    nombre: 'DVR / Grabador NVR',
    urlAntes: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=700&auto=format&fit=crop&q=80',
    urlDespues: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=700&auto=format&fit=crop&q=80',
    estado: 'PENDIENTE',
  },
  {
    id: 'f-6',
    tipoEquipo: 'TABLERO',
    slotNumero: 6,
    nombre: 'Tablero Eléctrico Principal',
    urlAntes: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&auto=format&fit=crop&q=80',
    urlDespues: 'https://images.unsplash.com/photo-1581092787765-7351c2807e3d?w=700&auto=format&fit=crop&q=80',
    estado: 'PENDIENTE',
  },
];

export default function SupervisorPage() {
  const [reporteActivo, setReporteActivo] = useState(REPORTES_DEMO[0]);
  const [fotos, setFotos] = useState<FotoValidacion[]>(FOTOS_INICIALES);
  const [notificacion, setNotificacion] = useState<{ tipo: 'ok' | 'err'; msg: string } | null>(null);
  const [modalRechazo, setModalRechazo] = useState<{ id: string; nombre: string } | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('Foto desenfocada / falta de iluminación');

  const handleAprobarFoto = (id: string) => {
    setFotos((prev) =>
      prev.map((f) => (f.id === id ? { ...f, estado: 'APROBADO', observacionRechazo: undefined } : f))
    );
  };

  const handleConfirmarRechazo = () => {
    if (!modalRechazo) return;
    setFotos((prev) =>
      prev.map((f) =>
        f.id === modalRechazo.id
          ? { ...f, estado: 'RECHAZADO', observacionRechazo: motivoRechazo }
          : f
      )
    );
    setModalRechazo(null);
  };

  const totalAprobadas = fotos.filter((f) => f.estado === 'APROBADO').length;
  const hayRechazadas = fotos.some((f) => f.estado === 'RECHAZADO');
  const todasRevisadas = fotos.every((f) => f.estado !== 'PENDIENTE');

  const certificarReporte = () => {
    if (hayRechazadas) {
      setNotificacion({
        tipo: 'err',
        msg: 'No se puede certificar el reporte con evidencias en estado RECHAZADO.',
      });
      return;
    }
    if (!todasRevisadas) {
      setNotificacion({
        tipo: 'err',
        msg: 'Debe revisar y aprobar visualmente todas las evidencias antes de certificar.',
      });
      return;
    }

    setReporteActivo((prev) => ({ ...prev, estado: 'APROBADO' }));
    setNotificacion({
      tipo: 'ok',
      msg: '¡Reporte certificado y aprobado exitosamente! Se generó el sello inmutable de auditoría.',
    });
  };

  const devolverConObservaciones = () => {
    setReporteActivo((prev) => ({ ...prev, estado: 'OBSERVADO' }));
    setNotificacion({
      tipo: 'ok',
      msg: "Reporte devuelto al técnico en estado 'OBSERVADO' para corrección de fotos rechazadas.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* BANNER SUPERVISOR INSTITUCIONAL EN #30235F */}
      <div className="bg-[#30235F] text-white rounded-2xl p-6 mb-8 border border-purple-900 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#009444] text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded shadow">
                Módulo Oficial de Calidad & QA
              </span>
              <span className="text-xs font-semibold text-purple-200">
                Supervisor Técnico Asignado: Ing. Roberto Silva
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Bandeja de Validación Visual de Evidencias
            </h1>
            <p className="text-purple-200/90 text-xs sm:text-sm mt-1">
              Inspección comparativa lado a lado de fotografías técnicas tomadas en campo antes y después de la intervención.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border shadow ${
                reporteActivo.estado === 'APROBADO'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                  : reporteActivo.estado === 'OBSERVADO'
                  ? 'bg-amber-950 text-amber-300 border-amber-500'
                  : 'bg-purple-950 text-purple-200 border-purple-400 animate-pulse'
              }`}
            >
              Estado: {reporteActivo.estado}
            </span>
          </div>
        </div>
      </div>

      {notificacion && (
        <div
          className={`p-4 rounded-xl text-sm font-bold mb-6 border shadow-sm ${
            notificacion.tipo === 'ok'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          {notificacion.tipo === 'ok' ? '✅ ' : '⚠️ '}
          {notificacion.msg}
        </div>
      )}

      {/* METRICS & QUICK ACTION BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="block text-[10px] font-extrabold uppercase text-[#30235F]">Reporte</span>
            <span className="font-mono font-bold text-sm text-slate-800">{reporteActivo.codigo}</span>
          </div>
          <div>
            <span className="block text-[10px] font-extrabold uppercase text-[#30235F]">Radiobase</span>
            <span className="font-bold text-sm text-slate-800">{reporteActivo.radiobase}</span>
          </div>
          <div>
            <span className="block text-[10px] font-extrabold uppercase text-[#30235F]">Técnico</span>
            <span className="font-bold text-sm text-slate-800">{reporteActivo.tecnico}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <span className="text-xs font-black text-[#30235F]">
              {totalAprobadas} de {fotos.length}
            </span>
            <span className="text-xs text-slate-400 ml-1">aprobadas</span>
          </div>

          <button
            onClick={devolverConObservaciones}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            ⚠️ Devolver Observado
          </button>

          <button
            onClick={certificarReporte}
            disabled={hayRechazadas || !todasRevisadas}
            className={`text-xs font-black px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow ${
              hayRechazadas || !todasRevisadas
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#009444] hover:bg-[#007d3a] text-white'
            }`}
          >
            <span>🎖️</span>
            <span>Certificar y Aprobar</span>
          </button>
        </div>
      </div>

      {/* SIDE BY SIDE PHOTO MATRIX */}
      <div className="space-y-6">
        {fotos.map((foto) => (
          <div
            key={foto.id}
            className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
              foto.estado === 'APROBADO'
                ? 'border-emerald-300 bg-emerald-50/20'
                : foto.estado === 'RECHAZADO'
                ? 'border-rose-300 bg-rose-50/20'
                : 'border-slate-200'
            }`}
          >
            {/* CARD HEADER */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-purple-100 text-[#30235F] font-black text-xs flex items-center justify-center">
                  #{foto.slotNumero}
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{foto.nombre}</h3>
                  <span className="text-xs text-slate-500 font-mono">Tipo: {foto.tipoEquipo}</span>
                </div>
              </div>

              {/* STATUS PILL */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    foto.estado === 'APROBADO'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : foto.estado === 'RECHAZADO'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-purple-50 text-[#30235F] border border-purple-200'
                  }`}
                >
                  {foto.estado === 'APROBADO' && '✅ Aprobado'}
                  {foto.estado === 'RECHAZADO' && '❌ Rechazado'}
                  {foto.estado === 'PENDIENTE' && '⏳ Pendiente de Revisión'}
                </span>
              </div>
            </div>

            {/* SIDE BY SIDE COMPARISON */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* ANTES */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-[#30235F] uppercase">
                    Estado Anterior (Antes)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">22/09/2026 09:15</span>
                </div>
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                  <img
                    src={foto.urlAntes}
                    alt={`${foto.nombre} Antes`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    ANTES
                  </div>
                </div>
              </div>

              {/* DESPUES */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-[#009444] uppercase">
                    Estado Final (Después)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">22/09/2026 11:40</span>
                </div>
                <div className="relative aspect-video rounded-lg overflow-hidden border border-emerald-400 bg-slate-900">
                  <img
                    src={foto.urlDespues}
                    alt={`${foto.nombre} Después`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-[#009444] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    DESPUES
                  </div>
                </div>
              </div>
            </div>

            {/* REJECTION REASON DISPLAY */}
            {foto.observacionRechazo && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-lg mb-4 text-xs text-rose-800">
                <strong>Motivo de Rechazo Visual:</strong> {foto.observacionRechazo}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModalRechazo({ id: foto.id, nombre: foto.nombre })}
                className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>❌</span>
                <span>Rechazar Evidencia</span>
              </button>

              <button
                onClick={() => handleAprobarFoto(foto.id)}
                className="bg-[#009444] hover:bg-[#007d3a] text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
              >
                <span>✅</span>
                <span>Aprobar Evidencia</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL RECHAZO VISUAL */}
      {modalRechazo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Rechazar Evidencia: {modalRechazo.nombre}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Seleccione o escriba la observación técnica visual para que el técnico en campo realice la recaptura:
            </p>

            <div className="space-y-2 mb-4">
              {[
                'Foto desenfocada / falta de iluminación',
                'Ángulo incorrecto (no se observa la instalación completa)',
                'Tapa del equipo sin cerrar / cableado desordenado',
                'Obstrucción visual frente a la lente',
              ].map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  onClick={() => setMotivoRechazo(opcion)}
                  className={`w-full text-left text-xs p-2.5 rounded-lg border transition-colors ${
                    motivoRechazo === opcion
                      ? 'border-rose-500 bg-rose-50 font-bold text-rose-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {opcion}
                </button>
              ))}
            </div>

            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg mb-4 text-slate-800"
              rows={2}
              placeholder="Detalle adicional..."
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setModalRechazo(null)}
                className="text-xs font-bold text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarRechazo}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
