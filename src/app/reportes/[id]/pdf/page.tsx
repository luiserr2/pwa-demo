'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ReporteDetalleApi, RespuestaApi } from '@/shared/tipos-api';
import { ETIQUETAS_ESTADO } from '@/shared/flujo-reporte';
import {
  SIN_DATO,
  TONO_ESTADO_REPORTE,
  camposRedInformados,
  equipoPresentable,
  formatearFecha,
} from '@/client/components/expediente/formato-expediente';
import { MatrizZonasDocumento } from '@/client/components/expediente/MatrizZonasDocumento';
import { EvidenciasDocumento } from '@/client/components/expediente/EvidenciasDocumento';
import { TrazabilidadDocumento } from '@/client/components/expediente/TrazabilidadDocumento';

type Vista = 'UNIFICADO' | 'FOTOS' | 'TECNICO';

const VISTAS: readonly Vista[] = ['UNIFICADO', 'FOTOS', 'TECNICO'];

function esVista(valor: string | null): valor is Vista {
  return valor !== null && (VISTAS as readonly string[]).includes(valor);
}

type EstadoCarga =
  | { fase: 'cargando' }
  | { fase: 'error'; titulo: string; mensaje: string }
  | { fase: 'ok'; reporte: ReporteDetalleApi };

type SeccionId = 'RED' | 'EQUIPOS' | 'OBSERVACIONES' | 'EVIDENCIAS' | 'ZONAS' | 'TRAZABILIDAD';

const TITULO_ERROR_POR_STATUS: Record<number, string> = {
  400: 'Identificador de expediente inválido',
  401: 'Sesión requerida',
  403: 'Acceso denegado',
  404: 'Expediente no encontrado',
  503: 'Servicio no disponible',
};

async function leerRespuesta(res: Response): Promise<RespuestaApi<ReporteDetalleApi> | null> {
  try {
    const cuerpo: unknown = await res.json();
    if (typeof cuerpo === 'object' && cuerpo !== null && 'ok' in cuerpo) {
      return cuerpo as RespuestaApi<ReporteDetalleApi>;
    }
    return null;
  } catch {
    return null;
  }
}

function DatoCabecera({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle?: string }) {
  return (
    <div>
      <span className="block text-[10px] font-bold text-slate-500 uppercase">{etiqueta}</span>
      <span className="font-bold text-slate-900">{valor}</span>
      {detalle && <span className="block text-[10px] font-mono text-slate-500">{detalle}</span>}
    </div>
  );
}

function BotonVista({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
        activa ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}

function ReportePDFContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const parametroVista = searchParams.get('vista');
  const [vista, setVista] = useState<Vista>(esVista(parametroVista) ? parametroVista : 'UNIFICADO');
  const [estado, setEstado] = useState<EstadoCarga>({ fase: 'cargando' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    setEstado({ fase: 'cargando' });

    fetch(`/api/reportes/${encodeURIComponent(id)}`, {
      signal: controlador.signal,
      cache: 'no-store',
      credentials: 'same-origin',
    })
      .then(async (res) => {
        const cuerpo = await leerRespuesta(res);
        if (res.ok && cuerpo?.ok && cuerpo.data) {
          setEstado({ fase: 'ok', reporte: cuerpo.data });
          return;
        }
        setEstado({
          fase: 'error',
          titulo: TITULO_ERROR_POR_STATUS[res.status] ?? 'No se pudo cargar el expediente',
          mensaje: cuerpo?.error ?? `El servidor respondió HTTP ${res.status}.`,
        });
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return;
        setEstado({
          fase: 'error',
          titulo: 'Sin conexión con el servidor',
          mensaje: error instanceof Error ? error.message : 'Error de red desconocido.',
        });
      });

    return () => controlador.abort();
  }, [id, intento]);

  const cambiarVista = useCallback(
    (nueva: Vista) => {
      setVista(nueva);
      const params = new URLSearchParams(searchParams.toString());
      params.set('vista', nueva);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const volver = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/campo';
  };

  if (estado.fase === 'cargando') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
          <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" aria-hidden="true" />
          Cargando expediente técnico...
        </div>
      </div>
    );
  }

  if (estado.fase === 'error') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div role="alert" className="max-w-md w-full bg-white border border-rose-200 rounded-xl shadow-sm p-6 text-center">
          <span className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded mb-3">VERTEX</span>
          <h1 className="text-lg font-bold text-slate-900 mb-1">{estado.titulo}</h1>
          <p className="text-xs text-slate-600 mb-5">{estado.mensaje}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={volver}
              className="min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              &larr; Volver
            </button>
            <button
              type="button"
              onClick={() => setIntento((n) => n + 1)}
              className="min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { reporte } = estado;
  const camposRed = camposRedInformados(reporte.datosRed);
  const equipos = reporte.equipos.map(equipoPresentable);
  const observaciones = reporte.observaciones?.trim() ?? '';
  const incluyeFicha = vista === 'UNIFICADO' || vista === 'TECNICO';
  const incluyeFotos = vista === 'UNIFICADO' || vista === 'FOTOS';

  const secciones: SeccionId[] = [];
  if (incluyeFicha && camposRed.length > 0) secciones.push('RED');
  if (incluyeFicha && equipos.length > 0) secciones.push('EQUIPOS');
  if (incluyeFicha && observaciones !== '') secciones.push('OBSERVACIONES');
  if (incluyeFotos) secciones.push('EVIDENCIAS');
  if (incluyeFicha) secciones.push('ZONAS');
  secciones.push('TRAZABILIDAD');
  const numero = (seccion: SeccionId): number => secciones.indexOf(seccion) + 1;

  const radiobase = reporte.radiobase;
  const tecnico = reporte.tecnico;
  const supervisor = reporte.supervisor;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 py-6 px-4 print:bg-white print:text-black print:p-0">
      <style>{'@page { size: A4; margin: 12mm; }'}</style>

      {/* BARRA DE CONTROL SUPERIOR (OCULTA AL IMPRIMIR) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={volver}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
        >
          &larr; Volver
        </button>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <BotonVista activa={vista === 'UNIFICADO'} onClick={() => cambiarVista('UNIFICADO')}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Informe Unificado</span>
          </BotonVista>
          <BotonVista activa={vista === 'FOTOS'} onClick={() => cambiarVista('FOTOS')}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>Solo Fotos</span>
          </BotonVista>
          <BotonVista activa={vista === 'TECNICO'} onClick={() => cambiarVista('TECNICO')}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>Solo Ficha</span>
          </BotonVista>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-[40px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          <span>Imprimir / Exportar A4</span>
        </button>
      </div>

      {/* DOCUMENTO FORMAL A4 */}
      <article className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-none">
        {/* HEADER INSTITUCIONAL */}
        <header className="border-b border-slate-200 pb-6 mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">VERTEX</span>
              <span className="text-xs font-bold text-blue-700 tracking-wider uppercase font-mono">
                {vista === 'UNIFICADO'
                  ? 'Expediente Oficial Integrado'
                  : vista === 'FOTOS'
                  ? 'Álbum Fotográfico Oficial'
                  : 'Ficha Técnica Oficial'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {vista === 'UNIFICADO'
                ? 'Reporte Integral de Intervención Técnica en Radiobase'
                : vista === 'FOTOS'
                ? 'Reporte Fotográfico de Evidencias (Antes vs Después)'
                : 'Ficha Técnica de Inspección de Zonas'}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Código: {reporte.codigo} &middot; Visita: {formatearFecha(reporte.fechaVisita)} &middot; Modo: {vista}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 border text-xs font-bold uppercase px-3 py-1 rounded-md mb-1 font-mono ${TONO_ESTADO_REPORTE[reporte.estado]}`}
            >
              {ETIQUETAS_ESTADO[reporte.estado]}
            </span>
            {reporte.hashSha256 && (
              <div className="text-[10px] text-slate-500 font-mono" title="Huella SHA-256 de integridad del contenido visado">
                SHA-256: {reporte.hashSha256.substring(0, 16)}…
              </div>
            )}
          </div>
        </header>

        {/* METADATOS DEL SITIO Y PERSONAL */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs">
          <DatoCabecera etiqueta="Radiobase" valor={radiobase?.nombre ?? SIN_DATO} detalle={radiobase?.codigo} />
          <DatoCabecera etiqueta="Región" valor={radiobase?.region || SIN_DATO} />
          <DatoCabecera etiqueta="Tecnología" valor={radiobase?.tecnologia || SIN_DATO} />
          <DatoCabecera etiqueta="Tipo de torre" valor={radiobase?.tipoTorre || SIN_DATO} />
          <DatoCabecera
            etiqueta="Técnico"
            valor={tecnico?.nombre ?? SIN_DATO}
            detalle={tecnico?.cedula ? `C.I. ${tecnico.cedula}` : undefined}
          />
          {supervisor && (
            <DatoCabecera
              etiqueta="Supervisor"
              valor={supervisor.nombre}
              detalle={supervisor.cedula ? `C.I. ${supervisor.cedula}` : undefined}
            />
          )}
          <DatoCabecera etiqueta="Fecha de visita" valor={formatearFecha(reporte.fechaVisita)} />
          <DatoCabecera etiqueta="Estado" valor={ETIQUETAS_ESTADO[reporte.estado]} />
        </div>

        {secciones.includes('RED') && (
          <section className="mb-6">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              {numero('RED')}. Parámetros de Conectividad &amp; Red
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
              {camposRed.map((campo) => (
                <div key={campo.etiqueta} className="p-2 border border-slate-200 rounded bg-slate-50">
                  <span className="block text-[9px] text-slate-500 font-bold uppercase">{campo.etiqueta}</span>
                  <span className="font-mono font-bold text-slate-800 break-all">{campo.valor}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {secciones.includes('EQUIPOS') && (
          <section className="mb-8">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              {numero('EQUIPOS')}. Inventario de Equipos Instalados
            </h2>
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-2 text-left">Descripción del equipo</th>
                  <th className="p-2 text-left">Modelo</th>
                  <th className="p-2 text-left">Serial</th>
                  <th className="p-2 text-center">Cant.</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map((eq) => (
                  <tr key={eq.id} className="border-b border-slate-200 break-inside-avoid">
                    <td className="p-2 font-bold text-slate-800">{eq.descripcion}</td>
                    <td className="p-2 font-mono text-slate-600">{eq.modelo}</td>
                    <td className="p-2 font-mono text-slate-600">{eq.serial}</td>
                    <td className="p-2 text-center font-bold">{eq.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {secciones.includes('OBSERVACIONES') && (
          <section className="mb-8">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              {numero('OBSERVACIONES')}. Observaciones Generales
            </h2>
            <p className="text-xs text-slate-700 whitespace-pre-line border border-slate-200 rounded bg-slate-50 p-3">
              {observaciones}
            </p>
          </section>
        )}

        {secciones.includes('EVIDENCIAS') && (
          <EvidenciasDocumento evidencias={reporte.evidencias} numeroSeccion={numero('EVIDENCIAS')} />
        )}

        {secciones.includes('ZONAS') && <MatrizZonasDocumento zonas={reporte.zonas} numeroSeccion={numero('ZONAS')} />}

        <TrazabilidadDocumento reporte={reporte} numeroSeccion={numero('TRAZABILIDAD')} />

        {/* FIRMAS */}
        <div
          className={`mt-10 grid grid-cols-1 gap-8 text-center text-xs break-inside-avoid ${
            supervisor ? 'sm:grid-cols-2 print:grid-cols-2' : ''
          }`}
        >
          <div className="flex flex-col items-center justify-end">
            <div className="w-56 h-10 border-b-2 border-slate-400 mb-2" />
            <span className="font-extrabold text-slate-900">{tecnico?.nombre ?? SIN_DATO}</span>
            <span className="text-[10px] text-slate-500">
              Técnico responsable{tecnico?.cedula ? ` · C.I. ${tecnico.cedula}` : ''}
            </span>
          </div>
          {supervisor && (
            <div className="flex flex-col items-center justify-end">
              <div className="w-56 h-10 border-b-2 border-slate-400 mb-2" />
              <span className="font-extrabold text-slate-900">{supervisor.nombre}</span>
              <span className="text-[10px] text-slate-500">
                Supervisor{supervisor.cedula ? ` · C.I. ${supervisor.cedula}` : ''}
              </span>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

export default function ReportePDFPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 p-8 text-center text-xs text-slate-500 font-mono">
          Cargando documento técnico...
        </div>
      }
    >
      <ReportePDFContent id={params.id} />
    </Suspense>
  );
}
