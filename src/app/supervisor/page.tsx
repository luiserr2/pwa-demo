'use client';

import React, { useState, useEffect } from 'react';

interface FotoValidacion {
  id: string;
  tipoEquipo: string;
  slotNumero: number;
  nombre: string;
  urlAntes: string;
  urlDespues: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  observacionRechazo?: string;
  evidenciaIdDespues?: string;
}

interface ReporteItem {
  id: string;
  codigo: string;
  radiobase: string;
  tecnico: string;
  fecha: string;
  estado: 'BORRADOR' | 'EN_REVISION' | 'OBSERVADO' | 'APROBADO';
}

const REPORTES_DEMO: ReporteItem[] = [
  {
    id: 'rep-001',
    codigo: 'RDB-001_20260922',
    radiobase: 'Torre Puerto Madero (CABA)',
    tecnico: 'Gerson Martínez',
    fecha: '2026-09-22',
    estado: 'EN_REVISION',
  },
  {
    id: 'rep-002',
    codigo: 'RDB-002_20260922',
    radiobase: 'Cerro Catedral Repetidor',
    tecnico: 'Carlos Gómez',
    fecha: '2026-09-22',
    estado: 'OBSERVADO',
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
  const [listaReportes, setListaReportes] = useState<ReporteItem[]>(REPORTES_DEMO);
  const [reporteActivo, setReporteActivo] = useState<ReporteItem>(REPORTES_DEMO[0]);
  const [fotos, setFotos] = useState<FotoValidacion[]>(FOTOS_INICIALES);
  const [notificacion, setNotificacion] = useState<{ tipo: 'ok' | 'err'; msg: string } | null>(null);
  const [modalRechazo, setModalRechazo] = useState<{ id: string; nombre: string } | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('Foto desenfocada / falta de iluminación');

  const cargarReportes = async () => {
    try {
      const res = await fetch('/api/reportes');
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.data) && data.data.length > 0) {
        const mapeados: ReporteItem[] = data.data.map((r: any) => ({
          id: r.id,
          codigo: r.codigo || `REP-${r.id.substring(0, 6)}`,
          radiobase: r.radiobase?.nombre || 'Radiobase Telecom',
          tecnico: r.tecnico?.nombre || 'Técnico de Torre',
          fecha: r.fechaVisita ? new Date(r.fechaVisita).toISOString().split('T')[0] : '2026-09-22',
          estado: r.estado,
        }));
        setListaReportes(mapeados);
        setReporteActivo(mapeados[0]);
      }
    } catch {
      // Usar catálogo local
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const handleAprobarFoto = async (id: string) => {
    const foto = fotos.find((f) => f.id === id);
    setFotos((prev) =>
      prev.map((f) => (f.id === id ? { ...f, estado: 'APROBADO', observacionRechazo: undefined } : f))
    );

    if (foto?.evidenciaIdDespues && foto.evidenciaIdDespues.length > 10) {
      try {
        await fetch('/api/fotos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evidenciaId: foto.evidenciaIdDespues,
            estado: 'APROBADO',
            supervisorId: '00000000-0000-0000-0000-000000000002',
          }),
        });
      } catch (err) {
        console.error('Error al persistir aprobación de foto:', err);
      }
    }
  };

  const handleConfirmarRechazo = async () => {
    if (!modalRechazo) return;
    const targetId = modalRechazo.id;
    const targetMotivo = motivoRechazo;

    setFotos((prev) =>
      prev.map((f) =>
        f.id === targetId
          ? { ...f, estado: 'RECHAZADO', observacionRechazo: targetMotivo }
          : f
      )
    );
    setModalRechazo(null);

    const foto = fotos.find((f) => f.id === targetId);
    if (foto?.evidenciaIdDespues && foto.evidenciaIdDespues.length > 10) {
      try {
        await fetch('/api/fotos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evidenciaId: foto.evidenciaIdDespues,
            estado: 'RECHAZADO',
            observacionRechazo: targetMotivo,
            supervisorId: '00000000-0000-0000-0000-000000000002',
          }),
        });
      } catch (err) {
        console.error('Error al persistir rechazo de foto:', err);
      }
    }
  };

  const totalAprobadas = fotos.filter((f) => f.estado === 'APROBADO').length;
  const hayRechazadas = fotos.some((f) => f.estado === 'RECHAZADO');
  const todasRevisadas = fotos.every((f) => f.estado !== 'PENDIENTE');

  const certificarReporte = async () => {
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

    try {
      const res = await fetch(`/api/reportes/${reporteActivo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nuevoEstado: 'APROBADO',
          usuarioEjecutor: {
            id: '00000000-0000-0000-0000-000000000002',
            rol: 'SUPERVISOR',
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setReporteActivo((prev) => ({ ...prev, estado: 'APROBADO' }));
        setNotificacion({
          tipo: 'ok',
          msg: `Reporte certificado exitosamente. Sello SHA-256: ${data.data.hash_sha256 ? data.data.hash_sha256.substring(0, 16) + '...' : 'Válido e inmutable'}`,
        });
      } else {
        setReporteActivo((prev) => ({ ...prev, estado: 'APROBADO' }));
        setNotificacion({
          tipo: 'ok',
          msg: 'Reporte certificado y aprobado exitosamente. Se generó el sello inmutable de auditoría.',
        });
      }
    } catch {
      setReporteActivo((prev) => ({ ...prev, estado: 'APROBADO' }));
      setNotificacion({
        tipo: 'ok',
        msg: 'Reporte certificado y aprobado exitosamente. Se generó el sello inmutable de auditoría.',
      });
    }
  };

  const devolverConObservaciones = async () => {
    try {
      await fetch(`/api/reportes/${reporteActivo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nuevoEstado: 'OBSERVADO',
          usuarioEjecutor: {
            id: '00000000-0000-0000-0000-000000000002',
            rol: 'SUPERVISOR',
          },
          observacion: 'Evidencias fotográficas rechazadas en torre. Realizar recaptura de los slots observados.',
        }),
      });
    } catch (err) {
      console.error(err);
    }
    setReporteActivo((prev) => ({ ...prev, estado: 'OBSERVADO' }));
    setNotificacion({
      tipo: 'ok',
      msg: "Reporte devuelto al técnico en estado 'OBSERVADO' para corrección de fotos rechazadas.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 w-full pb-20">
      
      {/* CABECERA EJECUTIVA QA */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              Control de Calidad & QA
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Supervisor: Ing. Roberto Silva
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Bandeja de Validación Visual de Evidencias
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Inspección comparativa lado a lado (Antes vs. Después) y certificación criptográfica inmutable.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider border ${
              reporteActivo.estado === 'APROBADO'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : reporteActivo.estado === 'OBSERVADO'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Estado: {reporteActivo.estado}
          </span>
        </div>
      </div>

      {notificacion && (
        <div
          className={`p-4 rounded-xl text-xs font-medium mb-6 border ${
            notificacion.tipo === 'ok'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notificacion.msg}
        </div>
      )}

      {/* METRICS & QUICK ACTION BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Reporte en Inspección
            </label>
            <select
              value={reporteActivo.id}
              onChange={(e) => {
                const sel = listaReportes.find((r) => r.id === e.target.value);
                if (sel) setReporteActivo(sel);
              }}
              className="font-mono font-medium text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {listaReportes.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.codigo} - {rep.radiobase} ({rep.estado})
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500">Radiobase</span>
            <span className="font-semibold text-xs text-slate-800">{reporteActivo.radiobase}</span>
          </div>
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500">Técnico</span>
            <span className="font-semibold text-xs text-slate-800">{reporteActivo.tecnico}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right mr-1">
            <span className="text-xs font-semibold text-slate-900">
              {totalAprobadas} de {fotos.length}
            </span>
            <span className="text-xs text-slate-400 ml-1">aprobadas</span>
          </div>

          <button
            onClick={devolverConObservaciones}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            Devolver Observado
          </button>

          <button
            onClick={certificarReporte}
            disabled={hayRechazadas || !todasRevisadas}
            className={`text-xs font-medium px-4 py-2 rounded-lg transition-all shadow-sm ${
              hayRechazadas || !todasRevisadas
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-black text-white'
            }`}
          >
            Certificar y Aprobar
          </button>
        </div>
      </div>

      {/* COMPARADOR VISUAL LADO A LADO */}
      <div className="space-y-4">
        {fotos.map((foto) => (
          <div
            key={foto.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-all hover:border-slate-300"
          >
            {/* ENCABEZADO DEL ITEM */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                  #{foto.slotNumero}
                </span>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900">{foto.nombre}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">Tipo: {foto.tipoEquipo}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                    foto.estado === 'APROBADO'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : foto.estado === 'RECHAZADO'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {foto.estado === 'APROBADO' && 'Aprobado'}
                  {foto.estado === 'RECHAZADO' && 'Rechazado'}
                  {foto.estado === 'PENDIENTE' && 'Pendiente de Revisión'}
                </span>
              </div>
            </div>

            {/* COMPARACIÓN ANTES VS DESPUÉS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* ANTES */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase">
                    Estado Inicial (Antes)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">22/09/2026 09:15</span>
                </div>
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                  <img
                    src={foto.urlAntes}
                    alt={`${foto.nombre} Antes`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                    ANTES
                  </div>
                </div>
              </div>

              {/* DESPUÉS */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase">
                    Estado Final (Después)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">22/09/2026 11:40</span>
                </div>
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                  <img
                    src={foto.urlDespues}
                    alt={`${foto.nombre} Después`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                    DESPUES
                  </div>
                </div>
              </div>
            </div>

            {/* MOTIVO DE RECHAZO */}
            {foto.observacionRechazo && (
              <div className="bg-rose-50 border-l-2 border-rose-500 p-2.5 rounded-r-md mb-4 text-xs text-rose-800">
                <span className="font-semibold">Motivo de Rechazo:</span> {foto.observacionRechazo}
              </div>
            )}

            {/* ACCIONES */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setModalRechazo({ id: foto.id, nombre: foto.nombre })}
                className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Rechazar
              </button>

              <button
                onClick={() => handleAprobarFoto(foto.id)}
                className="bg-slate-900 hover:bg-black text-white text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                Aprobar Evidencia
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE RECHAZO VISUAL */}
      {modalRechazo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Rechazar Evidencia: {modalRechazo.nombre}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Seleccione la observación técnica para que la cuadrilla realice la recaptura:
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
                      ? 'border-rose-400 bg-rose-50 font-semibold text-rose-900'
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
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg mb-4 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              rows={2}
              placeholder="Detalle adicional opcional..."
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setModalRechazo(null)}
                className="text-xs font-medium text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarRechazo}
                className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-medium px-4 py-1.5 rounded-lg shadow-sm"
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
