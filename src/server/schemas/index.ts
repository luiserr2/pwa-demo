import { z } from 'zod';
import { EstadoReporte } from '../entities/Reporte';
import { RolUsuario } from '../entities/User';
import { MomentoFoto, EstadoValidacionVisual } from '../entities/EvidenciaFotografica';
import { CANALES_RADICACION } from '../../shared/flujo-reporte';
import { EstadoZona, TOTAL_ZONAS, zonaRequiereObservacion } from '../../shared/catalogo-zonas';

// Esquema para Creación de Reportes
export const CrearReporteSchema = z.object({
  radiobaseId: z.string().uuid({ message: 'radiobaseId debe ser un UUID válido.' }),
  tecnicoId: z.string().uuid({ message: 'tecnicoId debe ser un UUID válido.' }),
  fechaVisita: z.string().datetime().optional(),
  observaciones: z.string().max(1000).optional(),
  datosRed: z
    .object({
      ipWan: z.string().optional(),
      ipLan: z.string().optional(),
      gateway: z.string().optional(),
      mascara: z.string().optional(),
      vlanId: z.string().optional(),
      dns1: z.string().optional(),
      dns2: z.string().optional(),
    })
    .optional(),
});

// Esquema para Transición de Estado de Reporte.
// `usuarioEjecutor` es opcional: la identidad autoritativa SIEMPRE es la sesión; si se envía, debe coincidir.
export const CambiarEstadoReporteSchema = z.object({
  nuevoEstado: z.nativeEnum(EstadoReporte, {
    errorMap: () => ({ message: 'Estado de reporte inválido.' }),
  }),
  usuarioEjecutor: z
    .object({
      id: z.string().min(1),
      rol: z.nativeEnum(RolUsuario, {
        errorMap: () => ({ message: 'Rol de usuario ejecutor inválido.' }),
      }),
    })
    .optional(),
  observacion: z.string().trim().max(1000).optional(),
  motivoRechazo: z.string().trim().max(2000).optional(),
  canalRadicacion: z
    .enum(CANALES_RADICACION, {
      errorMap: () => ({ message: `Canal de radicación inválido (${CANALES_RADICACION.join(', ')}).` }),
    })
    .optional(),
  numeroTicketCliente: z.string().trim().min(1).max(100).optional(),
  numeroHes: z.string().trim().min(3).max(100).optional(),
  fechaHes: z.string().datetime({ message: 'fechaHes debe ser una fecha ISO-8601.' }).optional(),
});
export type CambiarEstadoReporteInput = z.infer<typeof CambiarEstadoReporteSchema>;

// Esquema para Radiobases
export const CrearRadiobaseSchema = z.object({
  codigo: z
    .string()
    .min(3, { message: 'El código de radiobase debe tener al menos 3 caracteres.' })
    .max(50),
  nombre: z.string().min(3).max(150),
  region: z.string().min(2).max(100),
  tecnologia: z.string().max(50).optional(),
  tipoTorre: z.string().max(100).optional(),
});

// Esquema para Usuarios
export const CrearUsuarioSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico corporativo inválido.' }),
  nombre: z.string().min(3).max(150),
  cedula: z.string().min(5).max(30),
  rol: z.nativeEnum(RolUsuario, {
    errorMap: () => ({ message: 'Rol inválido (debe ser TECNICO, SUPERVISOR o ADMIN).' }),
  }),
});

// Esquema para Evidencias Fotográficas
export const RegistrarEvidenciaSchema = z.object({
  reporteId: z.string(),
  tipoEquipo: z.string().min(2).max(50),
  slotNumero: z.number().int().min(1).max(48),
  momento: z.nativeEnum(MomentoFoto),
  urlImagen: z.string().min(5),
});

export const EvaluarEvidenciaSchema = z.object({
  evidenciaId: z.string().uuid(),
  estado: z.nativeEnum(EstadoValidacionVisual),
  observacionRechazo: z.string().max(500).optional(),
  supervisorId: z.string(),
});

// Esquema para Sincronización en Lote Dexie.js
// El técnico se toma de la sesión; la radiobase se identifica por UUID o por código (RDB-001).
export const ZonaSincronizacionSchema = z
  .object({
    numeroZona: z.number().int().min(1).max(TOTAL_ZONAS),
    descripcion: z.string().max(150).optional(),
    estado: z.nativeEnum(EstadoZona, {
      errorMap: () => ({ message: 'Estado de zona inválido (NORMAL, ALARMA o FALLA).' }),
    }),
    observacion: z.string().trim().max(1000).nullable().optional(),
  })
  .refine((zona) => !zonaRequiereObservacion(zona.estado) || !!zona.observacion?.trim(), {
    message: 'Las zonas en ALARMA o FALLA requieren observación técnica obligatoria.',
  });

export const SincronizarOfflineSchema = z
  .object({
    reporteId: z.string().uuid({ message: 'reporteId debe ser un UUID válido.' }),
    radiobaseId: z.string().uuid().optional(),
    radiobaseCodigo: z.string().trim().min(3).max(50).optional(),
    tipoReporte: z.enum(['FOTOGRAFICO', 'TECNICO', 'UNIFICADO']).optional(),
    evidencias: z
      .array(
        z.object({
          slotNumero: z.number().int().min(1).max(48),
          tipoEquipo: z.string().min(2).max(50),
          momento: z.nativeEnum(MomentoFoto),
          urlImagen: z.string().min(5),
          creadoEn: z.string().optional(),
        })
      )
      .max(96),
    zonas: z.array(ZonaSincronizacionSchema).max(TOTAL_ZONAS).optional(),
  })
  .refine((d) => !!d.radiobaseId || !!d.radiobaseCodigo, {
    message: 'Debe indicar radiobaseId o radiobaseCodigo.',
  });
export type SincronizarOfflineInput = z.infer<typeof SincronizarOfflineSchema>;
