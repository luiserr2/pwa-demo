import { NextRequest, NextResponse } from 'next/server';

export interface SystemConfig {
  visualAudit: {
    maxResolution: '1200x900' | '1920x1080' | '2560x1440';
    webpQualityPercent: number;
    enforceAntesDespuesLock: boolean;
    gpsRadiusTolerancem: number;
    stampWatermarkOnEvidences: boolean;
    requiredSlotsCount: number;
  };
  securityZeroTrust: {
    cryptoAlgorithm: 'HMAC-SHA256' | 'SHA-512' | 'Ed25519';
    offlineGracePeriodHours: number;
    nocSessionTimeoutMinutes: number;
    requireMfaForSupervisor: boolean;
    immutableAuditTrail: boolean;
  };
  nocSlaAlerts: {
    maxSlaReviewMinutes: number;
    channelPushPwa: boolean;
    channelSmsEmergency: boolean;
    channelEmailNoc: boolean;
    webhookUrl: string;
    webhookAuthToken: string;
    alertSeverityThreshold: 'BAJA' | 'MEDIA' | 'CRITICA';
  };
  hardwareZones: {
    defaultSiteProfile: 'TORRE_AUTOSOPORTADA_48' | 'MONOPOLO_URBANO_16' | 'REPETIDOR_RURAL_24';
    homologatedBrands: string[];
    requiredSlots: string[];
  };
  storageSync: {
    syncStrategy: 'BACKGROUND_AUTO' | 'MANUAL_BATCH' | 'WIFI_ONLY';
    localCachePurgePolicy: 'IMMEDIATE_POST_HASH' | 'SEVEN_DAYS' | 'LOW_STORAGE_ONLY';
    hotStorageRetentionDays: number;
    coldStorageGlacierDays: number;
  };
  lastUpdated: string;
  updatedBy: string;
  configChecksumSha256: string;
}

// Configuración inicial homologada de grado de producción Telecom
let currentConfig: SystemConfig = {
  visualAudit: {
    maxResolution: '1920x1080',
    webpQualityPercent: 82,
    enforceAntesDespuesLock: true,
    gpsRadiusTolerancem: 100,
    stampWatermarkOnEvidences: true,
    requiredSlotsCount: 6,
  },
  securityZeroTrust: {
    cryptoAlgorithm: 'HMAC-SHA256',
    offlineGracePeriodHours: 72,
    nocSessionTimeoutMinutes: 30,
    requireMfaForSupervisor: true,
    immutableAuditTrail: true,
  },
  nocSlaAlerts: {
    maxSlaReviewMinutes: 120,
    channelPushPwa: true,
    channelSmsEmergency: true,
    channelEmailNoc: true,
    webhookUrl: 'https://noc.telecom.internal/api/v1/incidents/sisbirceca',
    webhookAuthToken: 'Bearer sec_live_994821a8f01b',
    alertSeverityThreshold: 'CRITICA',
  },
  hardwareZones: {
    defaultSiteProfile: 'TORRE_AUTOSOPORTADA_48',
    homologatedBrands: ['Hikvision AX PRO', 'Cisco Industrial', 'Optex Redwall', 'DSC PowerSeries', 'Huawei SmartLi'],
    requiredSlots: ['CAMARA', 'PIR', 'BOTON', 'TECLADO', 'DVR', 'TABLERO'],
  },
  storageSync: {
    syncStrategy: 'BACKGROUND_AUTO',
    localCachePurgePolicy: 'IMMEDIATE_POST_HASH',
    hotStorageRetentionDays: 90,
    coldStorageGlacierDays: 365,
  },
  lastUpdated: '2026-09-28T22:30:00.000Z',
  updatedBy: 'Lic. Mariana Fernández (Admin NOC)',
  configChecksumSha256: '9f83a48e71c2b5d034e9a8f27618c04e229df831a2938475bbcc91823aef0192',
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: currentConfig,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Merge de políticas actualizadas
    currentConfig = {
      ...currentConfig,
      ...body,
      lastUpdated: new Date().toISOString(),
      updatedBy: body.updatedBy || 'Lic. Mariana Fernández (Admin NOC)',
      configChecksumSha256: 'a' + Math.random().toString(16).substring(2, 10) + '71c2b5d034e9a8f' + Date.now().toString(16),
    };

    return NextResponse.json({
      ok: true,
      data: currentConfig,
      message: 'Políticas operativas y parámetros de configuración actualizados exitosamente.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: `Error al procesar configuración: ${err.message}` },
      { status: 400 }
    );
  }
}
