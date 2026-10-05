'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  CloudOff,
  CloudUpload,
  FileText,
  Loader2,
  Lock,
  Send,
  X,
} from 'lucide-react';
import { useAuth } from '@/client/context/AuthContext';
import { comprimirImagenEnCliente, liberarUrlImagen } from '@/client/utils/compression';
import { useOnlineStatus } from '@/client/hooks/useOnlineStatus';
import { esUuidValido, solicitarApi } from '@/client/components/campo/api-campo';
import {
  blobADataUrl,
  cargarEvidenciasLocales,
  cargarZonasLocales,
  formatearTamano,
  fusionarZonas,
  guardarEvidenciaLocal,
  guardarZonasLocales,
  marcarEvidenciasSincronizadas,
  zonasDesdeCatalogo,
  type MomentoEvidencia,
  type ZonaEstadoLocal,
} from '@/client/components/campo/persistencia-campo';
import {
  SlotEvidenciaCard,
  type FotoSlot,
  type RechazoSlot,
  type SlotEquipo,
} from '@/client/components/campo/SlotEvidenciaCard';
import { ZonaInspeccionCard, zonaIncompleta } from '@/client/components/campo/ZonaInspeccionCard';
import type { EvidenciaOffline } from '@/client/offline/dexie-db';
import { EstadoZona, TOTAL_ZONAS, normalizarEstadoZona, zonaRequiereObservacion } from '@/shared/catalogo-zonas';
import { ESTADOS_CONTENIDO_BLOQUEADO, ETIQUETAS_ESTADO, EstadoReporte } from '@/shared/flujo-reporte';
import type {
  CambiarEstadoPayload,
  EvidenciaApi,
  ReporteBaseApi,
  ReporteDetalleApi,
  SyncOfflinePayload,
  SyncOfflineRespuestaApi,
} from '@/shared/tipos-api';

// ─────────────────────────────────────────────────────────────────────────────
// Definiciones fijas
// ─────────────────────────────────────────────────────────────────────────────

const SLOTS_BASE: ReadonlyArray<{ id: number; tipoEquipo: string; nombre: string }> = [
  { id: 1, tipoEquipo: 'CAMARA', nombre: 'Cámara Domo Perimetral' },
  { id: 2, tipoEquipo: 'PIR', nombre: 'Sensor PIR Infrarrojo' },
  { id: 3, tipoEquipo: 'BOTON', nombre: 'Botón de Pánico Baliza' },
  { id: 4, tipoEquipo: 'TECLADO', nombre: 'Teclado de Alarma y Acceso' },
  { id: 5, tipoEquipo: 'DVR', nombre: 'DVR / Grabador NVR' },
  { id: 6, tipoEquipo: 'TABLERO', nombre: 'Tablero Eléctrico Principal' },
];

const ESTADOS_EDITABLES_CAMPO: readonly EstadoReporte[] = [
  EstadoReporte.SIN_EMPEZAR,
  EstadoReporte.EN_VISITA,
  EstadoReporte.ELABORANDO_INFORME,
  EstadoReporte.OBSERVADO,
];

type TabCaptura = 'FOTOS' | 'ZONAS';
type Operacion = 'NINGUNA' | 'SINCRONIZANDO' | 'ENTREGANDO';
type EvidenciaRechazadaSync = SyncOfflineRespuestaApi['evidenciasRechazadas'][number];

interface Aviso {
  tipo: 'exito' | 'error' | 'pendiente';
  texto: string;
}

interface ExpedienteServidor {
  codigo: string;
  estado: EstadoReporte;
  bloqueado: boolean;
  radiobaseId: string | null;
  radiobaseCodigo: string | null;
  radiobaseNombre: string | null;
  motivoRechazo: string | null;
}

interface ResultadoOperacion {
  tipo: 'SINCRONIZADO' | 'ENTREGADO';
  reporteId: string;
  codigo: string;
  estado: EstadoReporte;
  evidenciasProcesadas: number;
  evidenciasRechazadas: number;
}

const HEADERS_JSON: HeadersInit = { 'Content-Type': 'application/json' };

function claveSlot(slotNumero: number, momento: MomentoEvidencia): string {
  return `${slotNumero}:${momento}`;
}

function slotsVacios(): SlotEquipo[] {
  return SLOTS_BASE.map((s) => ({ ...s, antes: null, despues: null }));
}

function mensajeDeError(err: unknown): string {
  return err instanceof Error ? err.message : 'Error desconocido.';
}

/** Transiciones necesarias (PATCH) para dejar el expediente en REVISION_INTERNA. null = no entregable. */
function rutaHaciaRevision(estado: EstadoReporte): EstadoReporte[] | null {
  switch (estado) {
    case EstadoReporte.SIN_EMPEZAR:
      return [EstadoReporte.EN_VISITA, EstadoReporte.ELABORANDO_INFORME, EstadoReporte.REVISION_INTERNA];
    case EstadoReporte.EN_VISITA:
      return [EstadoReporte.ELABORANDO_INFORME, EstadoReporte.REVISION_INTERNA];
    case EstadoReporte.ELABORANDO_INFORME:
    case EstadoReporte.OBSERVADO:
      return [EstadoReporte.REVISION_INTERNA];
    case EstadoReporte.REVISION_INTERNA:
      return [];
    default:
      return null;
  }
}

function fotoDesdeServidor(evidencias: readonly EvidenciaApi[], slot: SlotEquipo, momento: MomentoEvidencia): FotoSlot | null {
  const ev = evidencias.find(
    (e) => e.slotNumero === slot.id && e.tipoEquipo === slot.tipoEquipo && e.momento === momento && e.urlImagen
  );
  return ev ? { url: ev.urlImagen, origen: 'SERVIDOR', sincronizado: true, tamano: null } : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Expediente de captura (reporteId ya validado como UUID)
// ─────────────────────────────────────────────────────────────────────────────

interface CapturaExpedienteProps {
  reporteId: string;
  siteCodigo: string;
  siteNombre: string;
  tabInicial: TabCaptura;
}

function CapturaExpediente({ reporteId, siteCodigo, siteNombre, tabInicial }: CapturaExpedienteProps) {
  const { user } = useAuth();
  const enLinea = useOnlineStatus();

  const [slots, setSlots] = useState<SlotEquipo[]>(slotsVacios);
  const [zonas, setZonas] = useState<ZonaEstadoLocal[]>(zonasDesdeCatalogo);
  const [zonasPendientes, setZonasPendientes] = useState(false);
  const [cargandoLocal, setCargandoLocal] = useState(true);
  const [expediente, setExpediente] = useState<ExpedienteServidor | null>(null);
  const [evidenciasServidor, setEvidenciasServidor] = useState<EvidenciaApi[]>([]);
  const [tabActiva, setTabActiva] = useState<TabCaptura>(tabInicial);
  const [modoSol, setModoSol] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [comprimiendo, setComprimiendo] = useState(false);
  const [operacion, setOperacion] = useState<Operacion>('NINGUNA');
  const [rechazosSync, setRechazosSync] = useState<EvidenciaRechazadaSync[]>([]);
  const [resultado, setResultado] = useState<ResultadoOperacion | null>(null);
  const [soloIncompletas, setSoloIncompletas] = useState(false);

  const urlsCreadasRef = useRef<Set<string>>(new Set());
  const zonasTocadasRef = useRef(false);
  const avisoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrarAviso = useCallback((nuevo: Aviso) => {
    if (avisoTimerRef.current) clearTimeout(avisoTimerRef.current);
    setAviso(nuevo);
    if (nuevo.tipo === 'exito') {
      avisoTimerRef.current = setTimeout(() => setAviso(null), 4000);
    }
  }, []);

  // Liberar object URLs al desmontar (memoria limitada en equipos de campo).
  useEffect(() => {
    const urls = urlsCreadasRef.current;
    return () => {
      urls.forEach((u) => liberarUrlImagen(u));
      urls.clear();
      if (avisoTimerRef.current) clearTimeout(avisoTimerRef.current);
    };
  }, []);

  // Restauración: Dexie primero (fuente de verdad sin señal) y luego el expediente del servidor si hay red.
  useEffect(() => {
    let cancelado = false;

    const restaurar = async () => {
      let hayZonasLocales = false;
      try {
        const [zonasLocales, evidenciasLocales] = await Promise.all([
          cargarZonasLocales(reporteId),
          cargarEvidenciasLocales(reporteId),
        ]);
        if (cancelado) return;

        hayZonasLocales = zonasLocales.length > 0;
        if (hayZonasLocales) {
          setZonas(
            fusionarZonas(
              zonasLocales.map((z) => ({
                numeroZona: z.numeroZona,
                estado: normalizarEstadoZona(z.estado),
                observacion: z.observacion,
              }))
            )
          );
          setZonasPendientes(zonasLocales.some((z) => !z.sincronizado));
        }

        const porClave = new Map<string, EvidenciaOffline>(
          evidenciasLocales.map((ev) => [claveSlot(ev.slotNumero, ev.momento), ev])
        );
        const aFoto = (ev: EvidenciaOffline | undefined): FotoSlot | null => {
          if (!ev) return null;
          const url = URL.createObjectURL(ev.blobData);
          urlsCreadasRef.current.add(url);
          return { url, origen: 'LOCAL', sincronizado: ev.sincronizado, tamano: formatearTamano(ev.blobData.size) };
        };
        setSlots(
          slotsVacios().map((s) => ({
            ...s,
            antes: aFoto(porClave.get(claveSlot(s.id, 'ANTES'))),
            despues: aFoto(porClave.get(claveSlot(s.id, 'DESPUES'))),
          }))
        );
      } catch (err) {
        if (!cancelado) {
          mostrarAviso({ tipo: 'error', texto: `No se pudo leer el almacenamiento local: ${mensajeDeError(err)}` });
        }
      } finally {
        if (!cancelado) setCargandoLocal(false);
      }

      if (cancelado || !navigator.onLine) return;

      // 404 = expediente nuevo aún no sincronizado: se crea en la primera sincronización.
      const res = await solicitarApi<ReporteDetalleApi>(`/api/reportes/${reporteId}`);
      if (cancelado || !res.ok) return;
      const det = res.data;

      setExpediente({
        codigo: det.codigo,
        estado: det.estado,
        bloqueado: det.bloqueadoEdicion || ESTADOS_CONTENIDO_BLOQUEADO.includes(det.estado),
        radiobaseId: det.radiobaseId,
        radiobaseCodigo: det.radiobase?.codigo ?? null,
        radiobaseNombre: det.radiobase?.nombre ?? null,
        motivoRechazo: det.motivoRechazo,
      });
      setEvidenciasServidor(det.evidencias);

      // Sin estado local: adoptar la matriz del servidor para no pisarla con 48 NORMAL.
      if (!hayZonasLocales && !zonasTocadasRef.current && det.zonas.length > 0) {
        const fusion = fusionarZonas(
          det.zonas.map((z) => ({
            numeroZona: z.numeroZona,
            estado: normalizarEstadoZona(z.estado),
            observacion: z.observacion,
          }))
        );
        setZonas(fusion);
        try {
          await guardarZonasLocales(reporteId, fusion, true);
        } catch (err) {
          if (!cancelado) {
            mostrarAviso({ tipo: 'error', texto: `No se pudo copiar la matriz al dispositivo: ${mensajeDeError(err)}` });
          }
        }
      }

      if (cancelado) return;
      setSlots((prev) =>
        prev.map((s) => ({
          ...s,
          antes: s.antes ?? fotoDesdeServidor(det.evidencias, s, 'ANTES'),
          despues: s.despues ?? fotoDesdeServidor(det.evidencias, s, 'DESPUES'),
        }))
      );
    };

    void restaurar();
    return () => {
      cancelado = true;
    };
  }, [reporteId, mostrarAviso]);

  // ───────────────────────────── Derivados ─────────────────────────────
  const bloqueado = expediente?.bloqueado ?? false;
  const operando = operacion !== 'NINGUNA';
  const edicionDeshabilitada = bloqueado || operando || cargandoLocal;

  const fotosCompletas = slots.filter((s) => s.antes && s.despues).length;
  const fotosPendientes = slots.reduce(
    (acc, s) => acc + (s.antes && !s.antes.sincronizado ? 1 : 0) + (s.despues && !s.despues.sincronizado ? 1 : 0),
    0
  );
  const zonasIncompletas = useMemo(() => zonas.filter(zonaIncompleta), [zonas]);
  const conteoZonas = useMemo(() => {
    const conteo: Record<EstadoZona, number> = { [EstadoZona.NORMAL]: 0, [EstadoZona.ALARMA]: 0, [EstadoZona.FALLA]: 0 };
    zonas.forEach((z) => {
      conteo[z.estado] += 1;
    });
    return conteo;
  }, [zonas]);
  const zonasVisibles = soloIncompletas ? zonasIncompletas : zonas;

  const codigoSitio = siteCodigo || expediente?.radiobaseCodigo || '';
  const nombreSitio = siteNombre || expediente?.radiobaseNombre || '';
  const hayPendientes = fotosPendientes > 0 || zonasPendientes;

  const rechazosPorSlot = useMemo(() => {
    const mapa = new Map<number, RechazoSlot[]>();
    const agregar = (slotNumero: number, rechazo: RechazoSlot) => {
      mapa.set(slotNumero, [...(mapa.get(slotNumero) ?? []), rechazo]);
    };
    rechazosSync.forEach((r) => agregar(r.slotNumero, { momento: r.momento, motivo: r.motivo }));
    // Rechazos del supervisor sobre fotos aún no repetidas en el dispositivo.
    slots.forEach((s) => {
      (['ANTES', 'DESPUES'] as const).forEach((momento) => {
        const foto = momento === 'ANTES' ? s.antes : s.despues;
        if (foto?.origen !== 'SERVIDOR') return;
        const ev = evidenciasServidor.find(
          (e) => e.slotNumero === s.id && e.tipoEquipo === s.tipoEquipo && e.momento === momento
        );
        if (ev?.estadoValidacion === 'RECHAZADO') {
          agregar(s.id, { momento, motivo: `Supervisor: ${ev.observacionRechazo ?? 'sin detalle'}. Repita la foto.` });
        }
      });
    });
    return mapa;
  }, [rechazosSync, slots, evidenciasServidor]);

  const tema = modoSol
    ? {
        pagina: 'bg-black text-amber-300',
        panel: 'bg-zinc-950 border-amber-500/30',
        titulo: 'text-amber-50',
        texto: 'text-amber-200/80',
        barra: 'bg-black/95 border-amber-500/40',
        tabs: 'bg-zinc-900 border-amber-500/30',
        tabInactiva: 'text-amber-200 hover:text-amber-50',
      }
    : {
        pagina: 'bg-slate-50 text-slate-800',
        panel: 'bg-white border-slate-200 shadow-xs',
        titulo: 'text-slate-900',
        texto: 'text-slate-500',
        barra: 'bg-white/95 border-slate-200',
        tabs: 'bg-slate-200/60 border-slate-200',
        tabInactiva: 'text-slate-600 hover:text-slate-900',
      };

  // ───────────────────────────── Fotos ─────────────────────────────
  const capturarFoto = async (slotId: number, momento: MomentoEvidencia, archivo: File) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || edicionDeshabilitada) return;
    if (momento === 'DESPUES' && !slot.antes) {
      mostrarAviso({ tipo: 'error', texto: 'Primero capture la foto ANTES de este equipo.' });
      return;
    }

    setComprimiendo(true);
    try {
      const res = await comprimirImagenEnCliente(archivo, { maxDimension: 1200, calidad: 0.8, formato: 'image/webp' });
      urlsCreadasRef.current.add(res.url);
      await guardarEvidenciaLocal({
        reporteId,
        slotNumero: slot.id,
        tipoEquipo: slot.tipoEquipo,
        momento,
        blob: res.blob,
        previewUrl: res.url,
      });

      const anterior = momento === 'ANTES' ? slot.antes : slot.despues;
      if (anterior?.origen === 'LOCAL') {
        liberarUrlImagen(anterior.url);
        urlsCreadasRef.current.delete(anterior.url);
      }

      const formato = res.blob.type.replace('image/', '').toUpperCase();
      const foto: FotoSlot = {
        url: res.url,
        origen: 'LOCAL',
        sincronizado: false,
        tamano: `${formatearTamano(res.tamanoBytes)} ${formato}`,
      };
      setSlots((prev) =>
        prev.map((s) => (s.id !== slotId ? s : momento === 'ANTES' ? { ...s, antes: foto } : { ...s, despues: foto }))
      );
      setRechazosSync((prev) => prev.filter((r) => !(r.slotNumero === slotId && r.momento === momento)));
      mostrarAviso({
        tipo: 'exito',
        texto: `Foto ${momento === 'ANTES' ? 'Antes' : 'Después'} de ${slot.nombre} guardada en el dispositivo (${foto.tamano}).`,
      });
    } catch (err) {
      mostrarAviso({ tipo: 'error', texto: `Error al procesar la imagen: ${mensajeDeError(err)}` });
    } finally {
      setComprimiendo(false);
    }
  };

  // ───────────────────────────── Zonas ─────────────────────────────
  const persistirZonas = useCallback(
    (cambios: ZonaEstadoLocal[]) => {
      zonasTocadasRef.current = true;
      setZonasPendientes(true);
      guardarZonasLocales(reporteId, cambios, false).catch((err: unknown) => {
        mostrarAviso({ tipo: 'error', texto: `No se pudo guardar la matriz en el dispositivo: ${mensajeDeError(err)}` });
      });
    },
    [reporteId, mostrarAviso]
  );

  const cambiarEstadoZona = (numeroZona: number, estado: EstadoZona) => {
    const zona = zonas.find((z) => z.numeroZona === numeroZona);
    if (!zona || zona.estado === estado) return;
    const nueva: ZonaEstadoLocal = { ...zona, estado };
    setZonas((prev) => prev.map((z) => (z.numeroZona === numeroZona ? { ...z, estado } : z)));
    persistirZonas([nueva]);
  };

  const cambiarObservacionZona = (numeroZona: number, observacion: string) => {
    const zona = zonas.find((z) => z.numeroZona === numeroZona);
    if (!zona) return;
    const nueva: ZonaEstadoLocal = { ...zona, observacion };
    setZonas((prev) => prev.map((z) => (z.numeroZona === numeroZona ? { ...z, observacion } : z)));
    persistirZonas([nueva]);
  };

  const certificarTodasNormales = () => {
    const conNovedad = zonas.filter((z) => z.estado !== EstadoZona.NORMAL).length;
    if (
      conNovedad > 0 &&
      !window.confirm(`Hay ${conNovedad} zona(s) en Alarma/Falla. ¿Marcar las ${TOTAL_ZONAS} zonas como NORMAL?`)
    ) {
      return;
    }
    const todas = zonas.map((z) => ({ ...z, estado: EstadoZona.NORMAL }));
    setZonas(todas);
    setSoloIncompletas(false);
    persistirZonas(todas);
    mostrarAviso({ tipo: 'exito', texto: `Las ${TOTAL_ZONAS} zonas quedaron en estado NORMAL (guardado en el dispositivo).` });
  };

  // ───────────────────────────── Sincronización ─────────────────────────────
  const sincronizar = async (): Promise<SyncOfflineRespuestaApi | null> => {
    if (zonasIncompletas.length > 0) {
      setTabActiva('ZONAS');
      setSoloIncompletas(true);
      mostrarAviso({
        tipo: 'error',
        texto: `${zonasIncompletas.length} zona(s) en Alarma/Falla sin observación. Complételas antes de sincronizar.`,
      });
      return null;
    }

    const identificacionRadiobase: Pick<SyncOfflinePayload, 'radiobaseCodigo' | 'radiobaseId'> | null = siteCodigo
      ? { radiobaseCodigo: siteCodigo }
      : expediente?.radiobaseId
      ? { radiobaseId: expediente.radiobaseId }
      : null;
    if (!identificacionRadiobase) {
      mostrarAviso({
        tipo: 'error',
        texto: 'El expediente no tiene radiobase asociada. Abra la captura desde Mis Asignaciones eligiendo la radiobase.',
      });
      return null;
    }

    if (!navigator.onLine) {
      mostrarAviso({ tipo: 'pendiente', texto: 'Sin señal. Todo quedó guardado en el dispositivo: pendiente de sincronizar.' });
      return null;
    }

    let enviadas: Array<{ localId: number | undefined; item: SyncOfflinePayload['evidencias'][number] }>;
    try {
      const pendientes = (await cargarEvidenciasLocales(reporteId)).filter((ev) => !ev.sincronizado);
      enviadas = await Promise.all(
        pendientes.map(async (ev) => ({
          localId: ev.localId,
          item: {
            slotNumero: ev.slotNumero,
            tipoEquipo: ev.tipoEquipo,
            momento: ev.momento,
            urlImagen: await blobADataUrl(ev.blobData),
            creadoEn: ev.creadoEn,
          },
        }))
      );
    } catch (err) {
      mostrarAviso({ tipo: 'error', texto: `No se pudieron preparar las fotos locales: ${mensajeDeError(err)}` });
      return null;
    }

    // ANTES primero: el backend exige el ANTES registrado para aceptar el DESPUÉS del mismo slot.
    enviadas.sort((a, b) =>
      a.item.momento === b.item.momento
        ? a.item.slotNumero - b.item.slotNumero
        : a.item.momento === 'ANTES'
        ? -1
        : 1
    );

    const zonasEnviadas = zonas.map((z) => ({ ...z }));
    const payload: SyncOfflinePayload = {
      reporteId,
      ...identificacionRadiobase,
      tipoReporte: 'UNIFICADO',
      evidencias: enviadas.map((e) => e.item),
      zonas: zonasEnviadas.map((z) => ({
        numeroZona: z.numeroZona,
        descripcion: z.descripcion,
        estado: z.estado,
        observacion: zonaRequiereObservacion(z.estado) ? z.observacion.trim() : null,
      })),
    };

    const res = await solicitarApi<SyncOfflineRespuestaApi>('/api/sync/offline', {
      method: 'POST',
      headers: HEADERS_JSON,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      if (res.reintentable) {
        mostrarAviso({
          tipo: 'pendiente',
          texto: `${res.error} Todo quedó guardado en el dispositivo: pendiente de sincronizar.`,
        });
      } else {
        mostrarAviso({ tipo: 'error', texto: `Sincronización rechazada (HTTP ${res.status}): ${res.error}` });
      }
      return null;
    }

    const data = res.data;
    const clavesRechazadas = new Set(data.evidenciasRechazadas.map((r) => claveSlot(r.slotNumero, r.momento)));
    const aceptadas = enviadas.filter((e) => !clavesRechazadas.has(claveSlot(e.item.slotNumero, e.item.momento)));
    const idsAceptados = aceptadas.map((e) => e.localId).filter((id): id is number => id !== undefined);
    const clavesAceptadas = new Set(aceptadas.map((e) => claveSlot(e.item.slotNumero, e.item.momento)));

    try {
      await marcarEvidenciasSincronizadas(idsAceptados);
      await guardarZonasLocales(reporteId, zonasEnviadas, true);
      setZonasPendientes(false);
    } catch (err) {
      mostrarAviso({
        tipo: 'error',
        texto: `Sincronizado en servidor, pero no se pudo actualizar el estado local: ${mensajeDeError(err)}`,
      });
    }

    setSlots((prev) =>
      prev.map((s) => ({
        ...s,
        antes: s.antes && clavesAceptadas.has(claveSlot(s.id, 'ANTES')) ? { ...s.antes, sincronizado: true } : s.antes,
        despues:
          s.despues && clavesAceptadas.has(claveSlot(s.id, 'DESPUES')) ? { ...s.despues, sincronizado: true } : s.despues,
      }))
    );
    setRechazosSync(data.evidenciasRechazadas);
    setExpediente((prev) => ({
      codigo: data.codigo,
      estado: data.estado,
      bloqueado: prev?.bloqueado ?? false,
      radiobaseId: prev?.radiobaseId ?? null,
      radiobaseCodigo: prev?.radiobaseCodigo ?? (siteCodigo || null),
      radiobaseNombre: prev?.radiobaseNombre ?? (siteNombre || null),
      motivoRechazo: prev?.motivoRechazo ?? null,
    }));
    return data;
  };

  const manejarSincronizar = async () => {
    setOperacion('SINCRONIZANDO');
    try {
      const data = await sincronizar();
      if (!data) return;
      setResultado({
        tipo: 'SINCRONIZADO',
        reporteId: data.reporteId,
        codigo: data.codigo,
        estado: data.estado,
        evidenciasProcesadas: data.evidenciasProcesadas,
        evidenciasRechazadas: data.evidenciasRechazadas.length,
      });
    } finally {
      setOperacion('NINGUNA');
    }
  };

  const manejarEntregar = async () => {
    if (
      !window.confirm(
        '¿Entregar a Coordinación? Se sincronizará todo y el expediente pasará a Revisión interna; ya no podrá editarlo salvo que sea observado.'
      )
    ) {
      return;
    }

    setOperacion('ENTREGANDO');
    try {
      const data = await sincronizar();
      if (!data) return;

      if (data.evidenciasRechazadas.length > 0) {
        setTabActiva('FOTOS');
        mostrarAviso({
          tipo: 'error',
          texto: `Sincronizado, pero ${data.evidenciasRechazadas.length} evidencia(s) fueron rechazadas. Corríjalas antes de entregar.`,
        });
        return;
      }

      const ruta = rutaHaciaRevision(data.estado);
      if (ruta === null) {
        mostrarAviso({
          tipo: 'error',
          texto: `El expediente está en "${ETIQUETAS_ESTADO[data.estado]}" y no puede entregarse desde campo.`,
        });
        return;
      }

      let estadoActual = data.estado;
      for (const destino of ruta) {
        const cuerpo: CambiarEstadoPayload = { nuevoEstado: destino };
        const res = await solicitarApi<ReporteBaseApi>(`/api/reportes/${data.reporteId}`, {
          method: 'PATCH',
          headers: HEADERS_JSON,
          body: JSON.stringify(cuerpo),
        });
        if (!res.ok) {
          const estadoFinal = estadoActual;
          setExpediente((prev) => (prev ? { ...prev, estado: estadoFinal } : prev));
          mostrarAviso({
            tipo: res.reintentable ? 'pendiente' : 'error',
            texto: `Datos sincronizados, pero la entrega falló al pasar a "${ETIQUETAS_ESTADO[destino]}" (HTTP ${res.status}): ${res.error}`,
          });
          return;
        }
        estadoActual = res.data.estado ?? destino;
      }

      const estadoEntregado = estadoActual;
      setExpediente((prev) => (prev ? { ...prev, estado: estadoEntregado } : prev));
      setResultado({
        tipo: 'ENTREGADO',
        reporteId: data.reporteId,
        codigo: data.codigo,
        estado: estadoEntregado,
        evidenciasProcesadas: data.evidenciasProcesadas,
        evidenciasRechazadas: 0,
      });
    } finally {
      setOperacion('NINGUNA');
    }
  };

  const puedeEntregar =
    !bloqueado && (expediente === null || ESTADOS_EDITABLES_CAMPO.includes(expediente.estado));

  // ───────────────────────────── Render ─────────────────────────────
  return (
    <div className={`min-h-screen w-full pb-36 ${tema.pagina}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 w-full lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* COLUMNA IZQUIERDA: CONTEXTO, PESTAÑAS Y AVISOS */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-4 mb-4 lg:mb-0">
          {/* BARRA DE CONECTIVIDAD & MODO SOL */}
          <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs border ${tema.panel}`}>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${enLinea ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
                aria-hidden="true"
              />
              <span className="font-mono text-[11px] font-medium" role="status">
                {enLinea ? 'En línea' : 'Sin señal · guardando en el dispositivo'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModoSol((v) => !v)}
                aria-pressed={modoSol}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer active:translate-y-[1px] ${
                  modoSol
                    ? 'bg-amber-400 text-black border-amber-300 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {modoSol ? 'Modo Sol Activo' : 'Modo Sol'}
              </button>
              <Link
                href="/campo"
                className={`min-h-[36px] text-xs font-medium transition-colors flex items-center gap-1 ${
                  modoSol ? 'text-amber-200 hover:text-amber-50' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Asignaciones
              </Link>
            </div>
          </div>

          {/* CABECERA DEL SITIO */}
          <div className={`p-5 rounded-xl border ${tema.panel}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded shrink-0">
                  {codigoSitio || 'SIN RADIOBASE'}
                </span>
                <h2 className={`text-sm font-bold truncate ${tema.titulo}`}>{nombreSitio || 'Radiobase no indicada'}</h2>
              </div>
              {expediente && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                    expediente.estado === EstadoReporte.OBSERVADO
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {ETIQUETAS_ESTADO[expediente.estado]}
                </span>
              )}
            </div>

            <p className={`text-[10px] font-mono font-medium mb-2.5 break-all ${tema.texto}`}>
              Expediente: {expediente?.codigo ?? `${reporteId} (nuevo, aún no sincronizado)`}
            </p>

            <div
              className={`flex items-center justify-between text-xs pt-2.5 border-t ${
                modoSol ? 'border-amber-500/20' : 'border-slate-100'
              }`}
            >
              <span className={`text-[11px] ${tema.texto}`}>
                Técnico:{' '}
                {user ? (
                  <strong className={`font-semibold ${tema.titulo}`}>{user.nombre}</strong>
                ) : (
                  <Link href="/login" className="font-semibold text-red-600 underline">
                    Sesión no iniciada
                  </Link>
                )}
              </span>
              <span
                className={`text-[10px] font-mono flex items-center gap-1 ${
                  hayPendientes ? (modoSol ? 'text-amber-300' : 'text-amber-700') : modoSol ? 'text-emerald-300' : 'text-emerald-700'
                }`}
              >
                {hayPendientes ? <CloudOff className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {hayPendientes
                  ? `${fotosPendientes} foto(s)${zonasPendientes ? ' + matriz' : ''} sin sincronizar`
                  : 'Todo sincronizado'}
              </span>
            </div>
          </div>

          {/* BANNERS DE ESTADO DEL EXPEDIENTE */}
          {bloqueado && (
            <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs font-medium flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-px" />
              <span>Expediente visado y bloqueado para edición. Solo lectura.</span>
            </div>
          )}
          {expediente?.estado === EstadoReporte.OBSERVADO && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-px text-red-600" />
              <span>
                <strong className="block mb-0.5">Observado por coordinación</strong>
                {expediente.motivoRechazo ?? 'Sin motivo registrado.'}
              </span>
            </div>
          )}

          {/* SELECTOR DE PESTAÑAS */}
          <div className={`flex gap-2 p-1 border rounded-xl ${tema.tabs}`} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tabActiva === 'FOTOS'}
              onClick={() => setTabActiva('FOTOS')}
              className={`flex-1 min-h-[44px] py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tabActiva === 'FOTOS' ? 'bg-blue-600 text-white font-semibold shadow-xs' : tema.tabInactiva
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Fotos Antes / Después</span>
              <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded">{fotosCompletas}/6</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={tabActiva === 'ZONAS'}
              onClick={() => setTabActiva('ZONAS')}
              className={`flex-1 min-h-[44px] py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tabActiva === 'ZONAS' ? 'bg-blue-600 text-white font-semibold shadow-xs' : tema.tabInactiva
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Matriz 48 Zonas</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                  zonasIncompletas.length > 0
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {zonasIncompletas.length > 0 ? `${zonasIncompletas.length} incompl.` : `${conteoZonas[EstadoZona.NORMAL]}/48`}
              </span>
            </button>
          </div>

          {/* AVISOS */}
          {aviso && (
            <div
              role={aviso.tipo === 'error' ? 'alert' : 'status'}
              className={`p-3.5 rounded-xl text-xs font-medium shadow-xs flex items-start gap-2 border ${
                aviso.tipo === 'exito'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : aviso.tipo === 'pendiente'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {aviso.tipo === 'exito' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : aviso.tipo === 'pendiente' ? (
                <CloudOff className="w-4 h-4 shrink-0 text-amber-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span className="flex-1">{aviso.texto}</span>
              <button
                type="button"
                onClick={() => setAviso(null)}
                aria-label="Cerrar aviso"
                className="shrink-0 p-1 -m-1 rounded hover:bg-black/5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {comprimiendo && (
            <div className="bg-blue-50 text-blue-900 p-3.5 rounded-xl text-xs font-medium border border-blue-200 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Comprimiendo imagen en el navegador (&lt; 250 KB)...</span>
            </div>
          )}

          {rechazosSync.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs">
              <strong className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                {rechazosSync.length} evidencia(s) rechazada(s) por el servidor
              </strong>
              <ul className="space-y-1 list-disc pl-5">
                {rechazosSync.map((r) => (
                  <li key={`${r.slotNumero}-${r.momento}`}>
                    {SLOTS_BASE.find((s) => s.id === r.slotNumero)?.nombre ?? `${r.tipoEquipo} #${r.slotNumero}`} (
                    {r.momento === 'ANTES' ? 'Antes' : 'Después'}): {r.motivo}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: CONTENIDO DE LA PESTAÑA */}
        <div className="lg:col-span-8">
          {cargandoLocal ? (
            <div className={`p-8 rounded-xl border text-center text-xs font-mono ${tema.panel} ${tema.texto}`}>
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Restaurando la captura guardada en el dispositivo...
            </div>
          ) : tabActiva === 'FOTOS' ? (
            <div className="space-y-4">
              {slots.map((slot) => (
                <SlotEvidenciaCard
                  key={slot.id}
                  slot={slot}
                  modoSol={modoSol}
                  deshabilitado={edicionDeshabilitada || comprimiendo}
                  rechazos={rechazosPorSlot.get(slot.id) ?? []}
                  onCapturar={(id, momento, archivo) => void capturarFoto(id, momento, archivo)}
                />
              ))}
            </div>
          ) : (
            <div className={`rounded-xl border p-4 sm:p-5 ${tema.panel}`}>
              <div
                className={`flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b ${
                  modoSol ? 'border-amber-500/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <h3 className={`font-bold text-xs sm:text-sm ${tema.titulo}`}>Inspección de 48 Zonas Fijas</h3>
                  <p className={`text-[11px] ${tema.texto}`}>
                    Alarma o Falla exigen observación técnica. Cada cambio se guarda al instante en el dispositivo.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2 font-mono text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                      Normal {conteoZonas[EstadoZona.NORMAL]}
                    </span>
                    <span className="px-2 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-200">
                      Alarma {conteoZonas[EstadoZona.ALARMA]}
                    </span>
                    <span className="px-2 py-0.5 rounded border bg-red-50 text-red-800 border-red-200">
                      Falla {conteoZonas[EstadoZona.FALLA]}
                    </span>
                    {zonasIncompletas.length > 0 && (
                      <span className="px-2 py-0.5 rounded border bg-red-600 text-white border-red-600">
                        Sin observación {zonasIncompletas.length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(zonasIncompletas.length > 0 || soloIncompletas) && (
                    <button
                      type="button"
                      onClick={() => setSoloIncompletas((v) => !v)}
                      aria-pressed={soloIncompletas}
                      className="min-h-[44px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-medium text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer active:translate-y-[1px]"
                    >
                      {soloIncompletas ? 'Ver todas' : `Ver incompletas (${zonasIncompletas.length})`}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={certificarTodasNormales}
                    disabled={edicionDeshabilitada}
                    className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Certificar 48 Zonas Normales</span>
                  </button>
                </div>
              </div>

              {zonasVisibles.length === 0 ? (
                <p className={`text-xs text-center py-6 ${tema.texto}`}>Todas las zonas con novedad tienen observación.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {zonasVisibles.map((z) => (
                    <ZonaInspeccionCard
                      key={z.numeroZona}
                      zona={z}
                      modoSol={modoSol}
                      deshabilitado={edicionDeshabilitada}
                      onCambiarEstado={cambiarEstadoZona}
                      onCambiarObservacion={cambiarObservacionZona}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BARRA INFERIOR FIJA DE ACCIÓN (TOUCH TARGETS >= 48PX) */}
      <div className={`fixed bottom-0 inset-x-0 backdrop-blur-md border-t p-3 sm:p-4 z-40 shadow-lg ${tema.barra}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="text-xs leading-tight min-w-0">
            <span className={`text-[11px] block ${tema.texto}`}>Progreso técnico:</span>
            <span className={`font-bold font-mono ${tema.titulo}`}>
              {fotosCompletas}/6 equipos &middot; {conteoZonas[EstadoZona.ALARMA] + conteoZonas[EstadoZona.FALLA]} novedades
            </span>
            {zonasIncompletas.length > 0 && (
              <span className="block text-[10px] font-semibold text-red-600">
                {zonasIncompletas.length} zona(s) sin observación
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void manejarSincronizar()}
              disabled={operando || comprimiendo || cargandoLocal || bloqueado}
              className="min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
            >
              {operacion === 'SINCRONIZANDO' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
              <span>
                {operacion === 'SINCRONIZANDO'
                  ? 'Sincronizando...'
                  : fotosPendientes > 0
                  ? `Sincronizar (${fotosPendientes})`
                  : 'Sincronizar'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void manejarEntregar()}
              disabled={operando || comprimiendo || cargandoLocal || !puedeEntregar}
              title={puedeEntregar ? 'Entregar a Coordinación' : 'El expediente ya fue entregado o está bloqueado'}
              className="min-h-[48px] bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer active:translate-y-[1px] shadow-sm"
            >
              {operacion === 'ENTREGANDO' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{operacion === 'ENTREGANDO' ? 'Entregando...' : 'Entregar a Coordinación'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE ÉXITO */}
      {resultado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-exito-title"
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900 text-center animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 id="modal-exito-title" className="font-bold text-base text-slate-900 mb-1">
              {resultado.tipo === 'ENTREGADO' ? 'Entregado a Coordinación' : 'Expediente sincronizado'}
            </h3>
            <p className="text-xs text-slate-600 mb-2">
              {resultado.codigo} · {nombreSitio || codigoSitio || 'Radiobase'}
              {codigoSitio && nombreSitio ? ` (${codigoSitio})` : ''}
            </p>
            <p className="text-xs text-slate-600 mb-1">
              Estado:{' '}
              <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                {ETIQUETAS_ESTADO[resultado.estado]}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 mb-4">
              {resultado.evidenciasProcesadas} foto(s) recibidas por el servidor
              {resultado.evidenciasRechazadas > 0 ? ` · ${resultado.evidenciasRechazadas} rechazada(s)` : ''}.
            </p>

            <div className="space-y-2">
              <Link
                href={`/reportes/${resultado.reporteId}/pdf?vista=UNIFICADO`}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 active:translate-y-[1px]"
              >
                <FileText className="w-4 h-4" />
                <span>Ver Informe Unificado (PDF)</span>
              </Link>

              {resultado.tipo === 'SINCRONIZADO' && (
                <button
                  type="button"
                  onClick={() => setResultado(null)}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200 cursor-pointer active:translate-y-[1px]"
                >
                  Seguir capturando
                </button>
              )}

              <Link
                href="/campo"
                className="w-full min-h-[44px] py-2.5 px-4 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Mis Asignaciones</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entrada: validación de parámetros
// ─────────────────────────────────────────────────────────────────────────────

function ReporteInvalido() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div role="alert" className="bg-white border border-red-200 rounded-2xl max-w-sm w-full p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="font-bold text-base text-slate-900 mb-1">Expediente no identificado</h1>
        <p className="text-xs text-slate-600 mb-4">
          Falta el parámetro <code className="font-mono">reporteId</code> o no es un UUID válido. Inicie la captura desde Mis
          Asignaciones eligiendo una radiobase.
        </p>
        <Link
          href="/campo"
          className="w-full min-h-[48px] py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Ir a Mis Asignaciones
        </Link>
      </div>
    </div>
  );
}

function MobileContent() {
  const searchParams = useSearchParams();
  const reporteId = searchParams.get('reporteId');
  const siteCodigo = searchParams.get('site')?.trim() ?? '';
  const siteNombre = searchParams.get('sitio')?.trim() ?? '';
  const tabInicial: TabCaptura = searchParams.get('mode') === 'ZONAS' ? 'ZONAS' : 'FOTOS';

  if (!esUuidValido(reporteId)) {
    return <ReporteInvalido />;
  }

  return (
    <CapturaExpediente
      key={reporteId}
      reporteId={reporteId}
      siteCodigo={siteCodigo}
      siteNombre={siteNombre}
      tabInicial={tabInicial}
    />
  );
}

export default function MobileFieldPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 p-6 text-center text-xs text-slate-500 font-mono">
          Cargando terminal de torre...
        </div>
      }
    >
      <MobileContent />
    </Suspense>
  );
}
