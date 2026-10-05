# 02-BACKEND_API: ARQUITECTURA DE SERVICIOS, CONTRATOS REST Y MÁQUINA DE ESTADOS

## 1. Estado Real Detectado (Código Actual)
- **Servicios Implementados:**
  - `ReporteService`: Lógica de creación de reportes con inicialización de 48 zonas, cálculo de código estandarizado (`${CodigoRadiobase}_YYYYMMDD`), transiciones de máquina de estados (`BORRADOR -> EN_REVISION -> OBSERVADO / APROBADO`), y listado con filtros.
  - `EvidenciaService`: Implementa la Regla Crítica de Bloqueo "Antes/Después" (bloquea foto `DESPUES` si no existe `ANTES` en ese slot) y evaluación visual del supervisor (`APROBADO` o `RECHAZADO` con causa técnica obligatoria).
  - `ZonaService`: Actualización en lote (bulk) de la matriz de 48 zonas fijas.
- **Rutas API de Next.js (App Router):**
  - `GET /api/reportes`: Lista reportes por estado o técnico.
  - `POST /api/reportes`: Crea reporte con radiobase y técnico.
  - `GET /api/reportes/[id]`: Retorna reporte con relaciones completas.
  - `PATCH /api/reportes/[id]`: Ejecuta transiciones de estado.
  - `POST /api/fotos`: Registra evidencia fotográfica con regla de avance.
  - `PATCH /api/fotos`: Evalúa visualmente evidencia individual.
- **Deuda Técnica Detectada:**
  - Faltan endpoints para entidades satélite: `GET/POST /api/radiobases`, `GET /api/usuarios`, `GET /api/admin/kpis`.
  - La validación de payloads usa validaciones manuales en vez de esquemas declarativos Zod con sanitización estricta.
  - Los endpoints de mutación (`PATCH /api/reportes/[id]`, `PATCH /api/fotos`) confían ciegamente en el campo `usuarioEjecutor` o `supervisorId` recibido en el body HTTP sin verificar autenticación por token JWT/sesión firmada en cookie.

## 2. Nuevos Requerimientos a Integrar (Nuevo Brief)
- Validación declarativa de esquemas con Zod en cada ruta API.
- Endpoints dedicados para el módulo de Administración:
  - `GET /api/admin/stats`: Métricas en tiempo real para el Dashboard ejecutivo (totales, % de aprobación, tiempos medios de revisión).
  - `GET /api/radiobases` y `POST /api/radiobases`: Catálogo maestro persistido.
  - `GET /api/usuarios`: Directorio de cuadrillas y roles.
- Endpoint de exportación de expediente oficial firmado: `GET /api/reportes/[id]/expediente` con cálculo de Hash SHA-256 inmutable.
- Endpoint de sincronización masiva para el operador de campo: `POST /api/sync/offline` para procesar en lote las fotos y reportes guardados en Dexie.js tras cortes de conexión en torre.

## 3. Expectativas Arquitectónicas y Estándares de Producción
- **Arquitectura Limpia (Clean Service Layer):** Los controladores de ruta (`route.ts`) únicamente validan el DTO de entrada, delegan la ejecución al servicio de dominio correspondiente y devuelven respuestas HTTP normalizadas `{ ok: boolean, data?: any, error?: string }`.
- **Máquina de Estados Finita e Inviolable:**
  - `BORRADOR`: Técnico captura evidencias y edita matriz de zonas.
  - `EN_REVISION`: Bloqueado para el técnico. Pasa a la bandeja del Supervisor QA. Requiere ≥ 1 evidencia válida.
  - `OBSERVADO`: El Supervisor rechaza con causa técnica. Retorna al técnico con alertas visuales de corrección.
  - `APROBADO`: El Supervisor certifica. Prohibido aprobar si existe al menos 1 foto en estado `RECHAZADO`. Genera Hash inmutable y cierra el reporte contra cualquier modificación futura.
- **Definition of Done (DoD):**
  - Todos los endpoints con esquemas Zod y códigos HTTP semánticos (200, 201, 400, 401, 403, 404, 500).
  - Suite de pruebas Jest ampliada con cobertura para nuevos endpoints y sincronización en lote.

## 4. BRECHA ARQUITECTÓNICA Y NUEVOS GOALS PARA EL MASTER LOOP
- [ ] [API-01] Implementar esquemas de validación Zod (`reporte.schema.ts`, `foto.schema.ts`, `radiobase.schema.ts`). (`src/server/schemas/`)
- [ ] [API-02] Crear ruta `GET /api/radiobases` y `POST /api/radiobases` conectada al `RadiobaseService`. (`src/app/api/radiobases/route.ts`)
- [ ] [API-03] Crear ruta `GET /api/usuarios` para listar personal y roles de cuadrilla. (`src/app/api/usuarios/route.ts`)
- [ ] [API-04] Crear ruta `GET /api/admin/stats` para computar los KPIs en tiempo real desde la BD. (`src/app/api/admin/stats/route.ts`)
- [ ] [API-05] Crear endpoint `POST /api/sync/offline` para recepción en lote de paquetes Dexie.js. (`src/app/api/sync/offline/route.ts`)
- [ ] [API-06] Blindar las rutas de mutación con validación de cabecera de rol/autorización. (`src/server/middleware/auth.guard.ts`)

## 5. ESTADO VIGENTE — FLUJO OPERATIVO DE 8 FASES (2026-10-05)
> Esta sección prevalece sobre las secciones 1–4 (diagnóstico histórico).

### 5.1 Máquina de estados (`src/shared/flujo-reporte.ts`, compartida cliente/servidor)
| Origen | Destinos permitidos | Quién | Regla de fase |
|---|---|---|---|
| SIN_EMPEZAR | EN_VISITA | Técnico titular / Sup / Admin | — (el primer sync de campo lo dispara solo) |
| EN_VISITA | ELABORANDO_INFORME, SIN_EMPEZAR | Técnico titular / Sup / Admin | — |
| ELABORANDO_INFORME | REVISION_INTERNA, EN_VISITA | Técnico titular / Sup / Admin | REVISION_INTERNA exige ≥1 evidencia, 48 zonas y observación en toda zona ALARMA/FALLA |
| REVISION_INTERNA | ENVIADO_AL_CLIENTE, OBSERVADO | Sup / Admin | ENVIADO exige `canalRadicacion` ∈ {CORREO, PORTAL_CLIENTE, MESA_DE_AYUDA, FISICO} + `numeroTicketCliente`; fija `fechaEnvioCliente` |
| OBSERVADO | ELABORANDO_INFORME, REVISION_INTERNA, EN_REVISION, BORRADOR | Técnico titular / Sup / Admin | OBSERVADO exige `motivoRechazo` |
| ENVIADO_AL_CLIENTE | VISADO, OBSERVADO | Sup / Admin | VISADO: sin evidencias RECHAZADAS; `bloqueadoEdicion=true`, `fechaVisado`, `hashSha256` del contenido (zonas + evidencias) |
| VISADO | HES_SOLICITADA | Sup / Admin | `numeroHes` válido y único; `fechaHes` |
| HES_SOLICITADA | FACTURADO | Sup / Admin | Requiere HES registrada |
| FACTURADO | — (terminal) | — | — |
| BORRADOR / EN_REVISION / APROBADO | Heredados (compatibilidad de datos) | — | — |

Toda transición se ejecuta en una transacción junto con su registro en `auditoria_eventos` (hash SHA-256 encadenado, `pg_advisory_xact_lock` para evitar bifurcaciones).

### 5.2 Contratos HTTP (tipos en `src/shared/tipos-api.ts`)
- `PATCH /api/reportes/[id]` y alias `PATCH /api/reportes/[id]/estado` → handler único `src/server/http/cambiar-estado.handler.ts`. La identidad sale de la sesión firmada y se resuelve contra `usuarios` (`src/server/security/actor.ts`); `usuarioEjecutor` en el body es opcional y si no coincide con la sesión → 403.
- `GET /api/reportes` (sin binarios; `totalEvidencias` por conteo), `GET /api/reportes/[id]` (expediente completo).
- `POST /api/sync/offline`: UUID generado en el dispositivo, radiobase por `radiobaseCodigo` o `radiobaseId`, técnico desde la sesión, zonas NORMAL/ALARMA/FALLA (observación obligatoria), 409 si el expediente está visado.
- `GET /api/admin/stats`: conteo de las 8 columnas + todos los estados, validación visual, zonas por estado, por región/tecnología, serie mensual, horas promedio hasta visado.
- `GET/POST /api/admin/auditoria`: lectura DESC desde `auditoria_eventos` con verificación de cadena server-side.
- Códigos: 400 (Zod / UUID), 401 (sin sesión o usuario inexistente), 403 (rol), 404, 409 (transición inválida / visado), 422 (regla de negocio), 503 (BD caída). **Sin respuestas simuladas**: los fallbacks "resilientes" fueron eliminados.

### 5.3 Verificación
- `npm test`: unitarias de máquina de estados, zonas, auditoría encadenada.
- `tests/integration/flujo-completo.int.spec.ts`: recorrido real contra PostgreSQL (opt-in con `INTEGRATION_DATABASE_URL`, destruye el esquema).
