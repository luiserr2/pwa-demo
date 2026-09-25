import { z } from 'zod';
import { EstadoReporte } from '../entities/Reporte';
import { RolUsuario } from '../entities/User';
import { MomentoFoto, EstadoValidacionVisual } from '../entities/EvidenciaFotografica';

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

// Esquema para Transición de Estado de Reporte
export const CambiarEstadoReporteSchema = z.object({
  nuevoEstado: z.nativeEnum(EstadoReporte, {
    errorMap: () => ({ message: 'Estado de reporte inválido.' }),
  }),
  usuarioEjecutor: z.object({
    id: z.string(),
    rol: z.nativeEnum(RolUsuario, {
      errorMap: () => ({ message: 'Rol de usuario ejecutor inválido.' }),
    }),
  }),
  observacion: z.string().max(1000).optional(),
});

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
export const SincronizarOfflineSchema = z.object({
  reporteId: z.string(),
  tecnicoId: z.string(),
  radiobaseId: z.string(),
  tipoReporte: z.enum(['FOTOGRAFICO', 'TECNICO', 'UNIFICADO']).optional(),
  evidencias: z.array(
    z.object({
      slotNumero: z.number().int(),
      tipoEquipo: z.string(),
      momento: z.nativeEnum(MomentoFoto),
      urlImagen: z.string(),
      creadoEn: z.string().optional(),
    })
  ),
  zonas: z
    .array(
      z.object({
        numeroZona: z.number().int(),
        descripcion: z.string(),
        estado: z.string(),
      })
    )
    .optional(),
});
