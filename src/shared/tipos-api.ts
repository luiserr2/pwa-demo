/**
 * Contratos JSON de las APIs consumidas por el cliente. Fuente única de tipos para las vistas
 * (Kanban, PDF, Dashboard, Captura). Las fechas llegan serializadas como ISO-8601 (string).
 */
import type { EstadoReporte, CanalRadicacion } from './flujo-reporte';
import type { EstadoZona, SubsistemaZona } from './catalogo-zonas';

export type RolApi = 'TECNICO' | 'SUPERVISOR' | 'ADMIN';

export interface RespuestaApi<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface UsuarioApi {
  id: string;
  email: string;
  nombre: string;
  cedula: string;
  rol: RolApi;
  activo: boolean;
}

export interface RadiobaseApi {
  id: string;
  codigo: string;
  nombre: string;
  region: string;
  tecnologia: string;
  tipoTorre: string;
}

export interface EvidenciaApi {
  id: string;
  reporteId: string;
  tipoEquipo: string;
  slotNumero: number;
  momento: 'ANTES' | 'DESPUES';
  urlImagen: string;
  estadoValidacion: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  observacionRechazo: string | null;
  createdAt: string;
}

export interface ZonaApi {
  id: string;
  reporteId: string;
  numeroZona: number;
  descripcion: string;
  /** Filas heredadas pueden traer 'OK': normalizar con normalizarEstadoZona(). */
  estado: EstadoZona | string;
  subsistema: SubsistemaZona | null;
  observacion: string | null;
}

export interface EquipoApi {
  id: string;
  [campo: string]: unknown;
}

export interface DatosRedApi {
  ipWan?: string;
  ipLan?: string;
  gateway?: string;
  mascara?: string;
  vlanId?: string;
  dns1?: string;
  dns2?: string;
}

/** Campos escalares comunes de un reporte. */
export interface ReporteBaseApi {
  id: string;
  codigo: string;
  estado: EstadoReporte;
  radiobaseId: string;
  tecnicoId: string;
  supervisorId: string | null;
  fechaVisita: string;
  observaciones: string | null;
  datosRed: DatosRedApi | null;
  hashSha256: string | null;
  canalRadicacion: CanalRadicacion | null;
  numeroTicketCliente: string | null;
  fechaEnvioCliente: string | null;
  fechaVisado: string | null;
  bloqueadoEdicion: boolean;
  numeroHes: string | null;
  fechaHes: string | null;
  motivoRechazo: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/reportes → item del listado (sin binarios de evidencias). */
export interface ReporteListadoApi extends ReporteBaseApi {
  radiobase: RadiobaseApi | null;
  tecnico: UsuarioApi | null;
  supervisor: UsuarioApi | null;
  totalEvidencias: number;
}

/** GET /api/reportes/[id] → expediente completo. */
export interface ReporteDetalleApi extends ReporteBaseApi {
  radiobase: RadiobaseApi | null;
  tecnico: UsuarioApi | null;
  supervisor: UsuarioApi | null;
  evidencias: EvidenciaApi[];
  zonas: ZonaApi[];
  equipos: EquipoApi[];
}

/** Cuerpo de PATCH /api/reportes/[id] (alias: /api/reportes/[id]/estado). */
export interface CambiarEstadoPayload {
  nuevoEstado: EstadoReporte;
  usuarioEjecutor?: { id: string; rol: RolApi };
  observacion?: string;
  motivoRechazo?: string;
  canalRadicacion?: CanalRadicacion;
  numeroTicketCliente?: string;
  numeroHes?: string;
  fechaHes?: string;
}

/** GET /api/admin/stats */
export interface StatsApi {
  generadoEn: string;
  totalRadiobases: number;
  totalTecnicos: number;
  totalReportes: number;
  reportesPorEstado: Record<EstadoReporte, number>;
  pipeline: Array<{ estado: EstadoReporte; etiqueta: string; cantidad: number }>;
  totalEvidencias: number;
  evidenciasPorValidacion: { APROBADO: number; RECHAZADO: number; PENDIENTE: number };
  evidenciasAprobadas: number;
  /** null si ninguna evidencia ha sido evaluada todavía. */
  tasaAprobacionVisual: number | null;
  tasaAprobacionPorcentaje: string;
  zonasPorEstado: Record<EstadoZona, number>;
  reportesPorRegion: Array<{ region: string; total: number; visados: number }>;
  reportesPorTecnologia: Array<{ tecnologia: string; cantidad: number }>;
  actividadMensual: Array<{ mes: string; etiqueta: string; creados: number; visados: number }>;
  horasPromedioHastaVisado: number | null;
}

/** POST /api/sync/offline → respuesta. */
export interface SyncOfflineRespuestaApi {
  reporteId: string;
  codigo: string;
  estado: EstadoReporte;
  creado: boolean;
  evidenciasProcesadas: number;
  totalEvidenciasEnviadas: number;
  evidenciasRechazadas: Array<{ slotNumero: number; tipoEquipo: string; momento: 'ANTES' | 'DESPUES'; motivo: string }>;
  zonasRecibidas: number;
  zonasModificadas: number;
  timestamp: string;
}

/** POST /api/sync/offline → cuerpo. El técnico se toma de la sesión (cookie). */
export interface SyncOfflinePayload {
  reporteId: string;
  radiobaseId?: string;
  radiobaseCodigo?: string;
  tipoReporte?: 'FOTOGRAFICO' | 'TECNICO' | 'UNIFICADO';
  evidencias: Array<{
    slotNumero: number;
    tipoEquipo: string;
    momento: 'ANTES' | 'DESPUES';
    urlImagen: string;
    creadoEn?: string;
  }>;
  zonas?: Array<{
    numeroZona: number;
    descripcion?: string;
    estado: EstadoZona;
    observacion?: string | null;
  }>;
}
