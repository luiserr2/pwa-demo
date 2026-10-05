/**
 * Flujo operativo VERTEX (8 fases) — módulo puro sin dependencias de TypeORM.
 * Lo consumen tanto el servidor (entidades, servicios, APIs) como el cliente (Kanban, PDF, captura).
 */

export enum EstadoReporte {
  // Estados de control
  BORRADOR = 'BORRADOR',
  OBSERVADO = 'OBSERVADO',

  // Estados heredados (compatibilidad con registros y pruebas existentes)
  EN_REVISION = 'EN_REVISION',
  APROBADO = 'APROBADO',

  // Pipeline operativo de 8 fases
  SIN_EMPEZAR = 'SIN_EMPEZAR',
  EN_VISITA = 'EN_VISITA',
  ELABORANDO_INFORME = 'ELABORANDO_INFORME',
  REVISION_INTERNA = 'REVISION_INTERNA',
  ENVIADO_AL_CLIENTE = 'ENVIADO_AL_CLIENTE',
  VISADO = 'VISADO',
  HES_SOLICITADA = 'HES_SOLICITADA',
  FACTURADO = 'FACTURADO',
}

/** Orden canónico de las 8 columnas del Kanban. */
export const FASES_PIPELINE: readonly EstadoReporte[] = [
  EstadoReporte.SIN_EMPEZAR,
  EstadoReporte.EN_VISITA,
  EstadoReporte.ELABORANDO_INFORME,
  EstadoReporte.REVISION_INTERNA,
  EstadoReporte.ENVIADO_AL_CLIENTE,
  EstadoReporte.VISADO,
  EstadoReporte.HES_SOLICITADA,
  EstadoReporte.FACTURADO,
] as const;

export const ETIQUETAS_ESTADO: Record<EstadoReporte, string> = {
  [EstadoReporte.BORRADOR]: 'Borrador',
  [EstadoReporte.OBSERVADO]: 'Observado',
  [EstadoReporte.EN_REVISION]: 'En revisión',
  [EstadoReporte.APROBADO]: 'Aprobado',
  [EstadoReporte.SIN_EMPEZAR]: 'Sin empezar',
  [EstadoReporte.EN_VISITA]: 'En visita',
  [EstadoReporte.ELABORANDO_INFORME]: 'Elaborando informe',
  [EstadoReporte.REVISION_INTERNA]: 'Revisión interna',
  [EstadoReporte.ENVIADO_AL_CLIENTE]: 'Enviado al cliente',
  [EstadoReporte.VISADO]: 'Visado',
  [EstadoReporte.HES_SOLICITADA]: 'HES solicitada',
  [EstadoReporte.FACTURADO]: 'Facturado',
};

/**
 * Máquina de estados. Cualquier transición no listada se rechaza.
 * Los estados heredados (BORRADOR / EN_REVISION / APROBADO) conservan sus salidas para no romper datos vivos.
 */
export const TRANSICIONES_PERMITIDAS: Record<EstadoReporte, readonly EstadoReporte[]> = {
  [EstadoReporte.SIN_EMPEZAR]: [EstadoReporte.EN_VISITA],
  [EstadoReporte.EN_VISITA]: [EstadoReporte.ELABORANDO_INFORME, EstadoReporte.SIN_EMPEZAR],
  [EstadoReporte.ELABORANDO_INFORME]: [EstadoReporte.REVISION_INTERNA, EstadoReporte.EN_VISITA],
  [EstadoReporte.REVISION_INTERNA]: [EstadoReporte.ENVIADO_AL_CLIENTE, EstadoReporte.OBSERVADO],
  [EstadoReporte.OBSERVADO]: [
    EstadoReporte.ELABORANDO_INFORME,
    EstadoReporte.REVISION_INTERNA,
    EstadoReporte.EN_REVISION,
    EstadoReporte.BORRADOR,
  ],
  [EstadoReporte.ENVIADO_AL_CLIENTE]: [EstadoReporte.VISADO, EstadoReporte.OBSERVADO],
  [EstadoReporte.VISADO]: [EstadoReporte.HES_SOLICITADA],
  [EstadoReporte.HES_SOLICITADA]: [EstadoReporte.FACTURADO],
  [EstadoReporte.FACTURADO]: [],
  [EstadoReporte.BORRADOR]: [
    EstadoReporte.EN_REVISION,
    EstadoReporte.REVISION_INTERNA,
    EstadoReporte.ELABORANDO_INFORME,
  ],
  [EstadoReporte.EN_REVISION]: [EstadoReporte.OBSERVADO, EstadoReporte.APROBADO, EstadoReporte.VISADO],
  [EstadoReporte.APROBADO]: [EstadoReporte.ENVIADO_AL_CLIENTE, EstadoReporte.VISADO],
};

export function esTransicionPermitida(origen: EstadoReporte, destino: EstadoReporte): boolean {
  return TRANSICIONES_PERMITIDAS[origen].includes(destino);
}

/** Estados que solo puede ejecutar un SUPERVISOR o ADMIN. */
export const ESTADOS_SOLO_SUPERVISION: readonly EstadoReporte[] = [
  EstadoReporte.OBSERVADO,
  EstadoReporte.APROBADO,
  EstadoReporte.ENVIADO_AL_CLIENTE,
  EstadoReporte.VISADO,
  EstadoReporte.HES_SOLICITADA,
  EstadoReporte.FACTURADO,
];

/** Estados en los que el expediente ya no admite cambios de contenido (evidencias / zonas). */
export const ESTADOS_CONTENIDO_BLOQUEADO: readonly EstadoReporte[] = [
  EstadoReporte.VISADO,
  EstadoReporte.HES_SOLICITADA,
  EstadoReporte.FACTURADO,
];

export const CANALES_RADICACION = ['CORREO', 'PORTAL_CLIENTE', 'MESA_DE_AYUDA', 'FISICO'] as const;
export type CanalRadicacion = (typeof CANALES_RADICACION)[number];

export const ETIQUETAS_CANAL: Record<CanalRadicacion, string> = {
  CORREO: 'Correo electrónico',
  PORTAL_CLIENTE: 'Portal del cliente',
  MESA_DE_AYUDA: 'Mesa de ayuda',
  FISICO: 'Radicación física',
};

export function esEstadoReporte(valor: string): valor is EstadoReporte {
  return (Object.values(EstadoReporte) as string[]).includes(valor);
}
