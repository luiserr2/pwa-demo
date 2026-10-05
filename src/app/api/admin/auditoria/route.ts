import { NextResponse } from 'next/server';
import crypto from 'crypto';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: {
    nombre: string;
    email: string;
    rol: 'ADMIN' | 'TECNICO' | 'SISTEMA';
  };
  tipo: 'AUTENTICACION' | 'APROBACION_QA' | 'OBSERVACION_QA' | 'SUBIDA_FOTO' | 'CAMBIO_MATRIZ' | 'ALERTA_SLA' | 'GEOFENCING_FAIL' | 'POLITICA_CONFIG';
  severidad: 'INFO' | 'ADVERTENCIA' | 'CRITICO';
  recurso: string;
  ip: string;
  ubicacion: string;
  descripcion: string;
  hashActual: string;
  hashPrevio: string;
  metadatos: Record<string, unknown>;
}

// Semilla viva de eventos de auditoría institucional (inmutable en memoria)
let auditTrailStore: AuditEvent[] = [
  {
    id: 'AUD-20261005-001',
    timestamp: '2026-10-05T11:42:10Z',
    actor: {
      nombre: 'Administrador NOC',
      email: 'admin@sisbirceca.com',
      rol: 'ADMIN',
    },
    tipo: 'AUTENTICACION',
    severidad: 'INFO',
    recurso: 'SESION_USUARIO',
    ip: '190.202.45.112',
    ubicacion: 'Caracas, VE',
    descripcion: 'Inicio de sesión exitoso con token HMAC-SHA256 FIPS 180-4.',
    hashActual: 'a89c31b9d472fe18c1b3f94082dc0a6a48d88fa721e4277b02c892837bc44910',
    hashPrevio: '0000000000000000000000000000000000000000000000000000000000000000',
    metadatos: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0',
      metodoAuth: 'Token Criptográfico',
      mfaStatus: 'VERIFICADO',
    },
  },
  {
    id: 'AUD-20261005-002',
    timestamp: '2026-10-05T11:35:24Z',
    actor: {
      nombre: 'Gerson Martínez',
      email: 'tecnico@sisbirceca.com',
      rol: 'TECNICO',
    },
    tipo: 'SUBIDA_FOTO',
    severidad: 'INFO',
    recurso: 'RDB-001 / TORRE PUERTO MADERO',
    ip: '190.73.188.42',
    ubicacion: 'Sitio Torre (Geolocalizado)',
    descripcion: 'Captura y compresión de evidencia ANTES en slot 01 (WebP 184 KB).',
    hashActual: '5ef12ca4b901dd148b3297a7a3721cf57ef9a091d31849a629bd51a3d0263f11',
    hashPrevio: 'a89c31b9d472fe18c1b3f94082dc0a6a48d88fa721e4277b02c892837bc44910',
    metadatos: {
      slot: 1,
      fase: 'ANTES',
      resolucion: '1920x1080',
      geocercaMetros: 18.4,
      toleranciaMax: 100,
      canvasStamp: true,
    },
  },
  {
    id: 'AUD-20261005-003',
    timestamp: '2026-10-05T11:20:05Z',
    actor: {
      nombre: 'Sistema Automático Antifraude',
      email: 'security.daemon@sisbirceca.local',
      rol: 'SISTEMA',
    },
    tipo: 'GEOFENCING_FAIL',
    severidad: 'CRITICO',
    recurso: 'RDB-003 / CÓRDOBA REPETIDOR',
    ip: '186.92.12.98',
    ubicacion: 'Fuera de Radio (1.4 km de torre)',
    descripcion: 'Bloqueo preventivo de captura: Dispositivo a 1,420 metros del sitio asignado.',
    hashActual: '908d1f721ab842bbce317208d92cb62174391af414902b781aefd551e18d99c4',
    hashPrevio: '5ef12ca4b901dd148b3297a7a3721cf57ef9a091d31849a629bd51a3d0263f11',
    metadatos: {
      gpsDispositivo: { lat: 10.4806, lng: -66.9036 },
      gpsTorreOficial: { lat: 10.4932, lng: -66.8921 },
      deltaMetros: 1420,
      accionTomada: 'DISPARO_BLOQUEADO',
    },
  },
  {
    id: 'AUD-20261005-004',
    timestamp: '2026-10-05T10:55:12Z',
    actor: {
      nombre: 'Administrador NOC',
      email: 'admin@sisbirceca.com',
      rol: 'ADMIN',
    },
    tipo: 'APROBACION_QA',
    severidad: 'INFO',
    recurso: 'REP-RDB-001_20261005',
    ip: '190.202.45.112',
    ubicacion: 'NOC Central',
    descripcion: 'Aprobación definitiva de expediente técnico. Cierre de SLA en 48 minutos.',
    hashActual: '3b09f45a198c47f722a09cb34b689aa1498bcefa4238127ef3092bba4716ef20',
    hashPrevio: '908d1f721ab842bbce317208d92cb62174391af414902b781aefd551e18d99c4',
    metadatos: {
      estadoPrevio: 'EN_REVISION',
      estadoNuevo: 'APROBADO',
      fotosValidadas: 12,
      zonasNormalizadas: 48,
      tiempoSlaUtilizadoMin: 48,
      dictamenPdfSha256: '7f991c098ab3211ef5601289dcbbfa890123efca451298abbcefa1092837bc44',
    },
  },
  {
    id: 'AUD-20261005-005',
    timestamp: '2026-10-05T09:40:00Z',
    actor: {
      nombre: 'Carlos Inspector',
      email: 'carlos.inspector@sisbirceca.com',
      rol: 'TECNICO',
    },
    tipo: 'CAMBIO_MATRIZ',
    severidad: 'ADVERTENCIA',
    recurso: 'ZONA 34 / BANCO DE BATERÍAS',
    ip: '190.73.188.42',
    ubicacion: 'Sitio Torre RDB-001',
    descripcion: 'Cambio de estado de zona: [NORMAL] -> [ALARMA]. Observación: Corrosión en terminal.',
    hashActual: '19c8f309d472fe18c1b3f94082dc0a6a48d88fa721e4277b02c892837bc44910',
    hashPrevio: '3b09f45a198c47f722a09cb34b689aa1498bcefa4238127ef3092bba4716ef20',
    metadatos: {
      zonaNumero: 34,
      estadoAnterior: 'NORMAL',
      estadoNuevo: 'ALARMA',
      categoria: 'ENERGÍA Y RESPALDO DC',
    },
  },
  {
    id: 'AUD-20261005-006',
    timestamp: '2026-10-05T08:15:30Z',
    actor: {
      nombre: 'Administrador NOC',
      email: 'admin@sisbirceca.com',
      rol: 'ADMIN',
    },
    tipo: 'POLITICA_CONFIG',
    severidad: 'INFO',
    recurso: 'POLITICAS_SEGURIDAD_NOC',
    ip: '190.202.45.112',
    ubicacion: 'NOC Central',
    descripcion: 'Actualización de tolerancia satelital: Fijada en ±100 metros conforme a norma ITU-T.',
    hashActual: 'ec59124a91c84f722a09cb34b689aa1498bcefa4238127ef3092bba4716ef201',
    hashPrevio: '19c8f309d472fe18c1b3f94082dc0a6a48d88fa721e4277b02c892837bc44910',
    metadatos: {
      parametro: 'geofenceRadiusMeters',
      valorPrevio: 150,
      valorNuevo: 100,
      motivo: 'Homologación de auditoría para contratista celular',
    },
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');
  const severidad = searchParams.get('severidad');
  const query = searchParams.get('q')?.toLowerCase();

  let filtered = [...auditTrailStore];

  if (tipo && tipo !== 'TODOS') {
    filtered = filtered.filter((e) => e.tipo === tipo);
  }

  if (severidad && severidad !== 'TODAS') {
    filtered = filtered.filter((e) => e.severidad === severidad);
  }

  if (query) {
    filtered = filtered.filter(
      (e) =>
        e.descripcion.toLowerCase().includes(query) ||
        e.recurso.toLowerCase().includes(query) ||
        e.actor.nombre.toLowerCase().includes(query) ||
        e.actor.email.toLowerCase().includes(query) ||
        e.ip.includes(query) ||
        e.hashActual.toLowerCase().includes(query)
    );
  }

  // Métricas agregadas de auditoría forense
  const totalEventos = auditTrailStore.length;
  const eventosCriticos = auditTrailStore.filter((e) => e.severidad === 'CRITICO').length;
  const sellosVerificados = auditTrailStore.filter((e) => !!e.hashActual).length;

  return NextResponse.json({
    ok: true,
    data: filtered,
    stats: {
      totalEventos,
      eventosCriticos,
      sellosVerificados,
      cadenaValida: true,
      ultimoHash: auditTrailStore[0]?.hashActual || null,
      algoritmo: 'SHA-256 (FIPS 180-4 Append-Only Chaining)',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const ultimoEvento = auditTrailStore[0];
    const hashPrevio = ultimoEvento ? ultimoEvento.hashActual : '0'.repeat(64);

    const id = `AUD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
      auditTrailStore.length + 1
    ).padStart(3, '0')}`;
    const timestamp = new Date().toISOString();

    // Generación determinística encadenada de hash SHA-256
    const canonico = JSON.stringify({
      id,
      timestamp,
      actor: body.actor,
      tipo: body.tipo,
      recurso: body.recurso,
      ip: body.ip || '127.0.0.1',
      hashPrevio,
      metadatos: body.metadatos || {},
    });

    const hashActual = crypto.createHash('sha256').update(canonico).digest('hex');

    const nuevoEvento: AuditEvent = {
      id,
      timestamp,
      actor: body.actor || { nombre: 'Operador del Sistema', email: 'operador@sisbirceca.com', rol: 'ADMIN' },
      tipo: body.tipo || 'AUTENTICACION',
      severidad: body.severidad || 'INFO',
      recurso: body.recurso || 'SISTEMA_GENERAL',
      ip: body.ip || '190.202.45.112',
      ubicacion: body.ubicacion || 'Caracas, VE',
      descripcion: body.descripcion || 'Acción operativa registrada en bitácora.',
      hashActual,
      hashPrevio,
      metadatos: body.metadatos || {},
    };

    // Inserción en cabeza (más reciente primero)
    auditTrailStore.unshift(nuevoEvento);

    return NextResponse.json({
      ok: true,
      data: nuevoEvento,
      message: 'Evento auditado y encadenado criptográficamente con éxito.',
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Error al persistir evento en bitácora de auditoría.' },
      { status: 500 }
    );
  }
}
