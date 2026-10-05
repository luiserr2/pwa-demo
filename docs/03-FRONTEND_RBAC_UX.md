# 03-FRONTEND_RBAC_UX: SISTEMA DE DISEÑO, SEGREGACIÓN DE ROLES Y EXPERIENCIA PWA

## 1. Estado Real Detectado (Código Actual)
- **Framework y Tokens:** Next.js 14 App Router, Tailwind CSS, iconos con Lucide React.
  - Colores corporativos: Morado Institucional `#30235F` (`brand-purple`) y Verde Telecom `#009444` (`brand-green`).
- **PWA & Offline:** Service Worker registrado (`public/sw.js`), Web App Manifest (`public/manifest.webmanifest`), y base de datos local Dexie.js (`src/client/offline/dexie-db.ts`) con tablas `reportes` y `evidencias`.
- **Estructura de Vistas Existente:**
  - `/login`: Formulario de acceso y tarjetas de cambio de rol para demostración comercial inmediata.
  - `/campo`: Portal de asignaciones del técnico con métricas de progreso de fotos y estado de cola offline Dexie.
  - `/mobile`: PWA de captura en torre con compresión en Canvas a WebP (< 250 KB) y candado reactivo en fotos 'Después'.
  - `/supervisor`: Bandeja de validación visual Antes vs. Después con botones de aprobación verde y rechazo rojo con selector de motivo.
  - `/reportes`: Matriz de 48 zonas de intrusión y catálogo de equipos.
  - `/reportes/[id]/pdf`: Expediente oficial imprimible con QR, hash SHA-256 y álbum fotográfico tabulado.
  - `/admin/dashboard`: Dashboard gerencial con 4 KPIs, distribución por tecnología (5G/LTE) y tabla de actividad.
  - `/admin/radiobases`: Catálogo de sitios con filtro por región y modal de alta.
  - `/admin/usuarios`: Directorio de cuadrillas y roles.
- **Deuda Técnica y Fricciones de UX:**
  - No existe redirección reactiva tras el Login (`/login`) hacia la ruta jurisdiccional del rol (ej: técnico directo a `/campo`).
  - Falta un middleware en Next.js (`middleware.ts`) que bloquee físicamente a un técnico de ingresar a `/admin/*` escribiendo la URL directa.
  - El portal de campo (`/campo`) no pasa el `reporteId` seleccionado como query param hacia `/mobile?reporteId=...`, provocando que la captura móvil arranque descontextualizada.
  - La sincronización Dexie en `/campo` es un botón con alert simulado en lugar de invocar una llamada real `POST /api/sync/offline`.

## 2. Matriz de Segregación RBAC Oficial (3 Roles)
> Fuente única en código: `src/shared/rbac.ts` (la consumen el middleware, el Navbar, el sidebar admin y la redirección de `/`). Las APIs aplican su propio guard (`verificarPermisosAPI`) con la sesión HMAC firmada.

| Ruta | TÉCNICO | SUPERVISOR | ADMIN |
|---|:-:|:-:|:-:|
| `/campo`, `/captura`, `/mobile` | ✅ | ❌ | ✅ |
| `/reportes` (Pipeline de 8 fases) | ❌ | ✅ | ✅ |
| `/supervisor` (Validación visual + trazabilidad) | ❌ | ✅ | ✅ |
| `/reportes/[id]/pdf` (Expediente) | ✅ | ✅ | ✅ |
| `/admin/*` (Estadísticas, usuarios, radiobases, auditoría, config) | ❌ | ❌ | ✅ |
| **Ruta de inicio** | `/campo` | `/reportes` | `/admin/dashboard` |

- **Persona 1: Técnico de Campo** (`tecnico@sisbirceca.com`)
  - Captura Antes/Después y matriz de 48 zonas (offline-first), entrega a coordinación (`REVISION_INTERNA`).
  - UX orientada a torre: alto contraste para luz solar directa, targets táctiles ≥ 48px, sin pantallas en blanco sin señal.
- **Persona 2: Supervisor de Calidad** (`supervisor@sisbirceca.com`)
  - Valida visualmente cada foto (aprobar / rechazar con motivo obligatorio) desde `/supervisor`; cada evaluación queda en la bitácora encadenada (`APROBACION_QA` / `OBSERVACION_QA`).
  - Mueve expedientes en el pipeline: Observado, Enviado al cliente (canal + ticket), Visado (bloquea contenido y genera huella SHA-256), HES, Facturado.
  - No puede visar si existen fotos rechazadas.
- **Persona 3: Administrador / Dirección de Operaciones** (`admin@sisbirceca.com`)
  - Todo lo del supervisor + estadísticas, ABM de usuarios con los 3 roles, radiobases, bitácora de auditoría y configuración.
- **Flujo de Navegación E2E Cerrado:**
  1. `/login` → redirección automática según rol firmado en la sesión.
  2. Técnico en `/campo` elige radiobase/expediente → `/captura?reporteId=UUID`.
  3. Técnico completa fotos y matriz → "Entregar a coordinación" (`REVISION_INTERNA`).
  4. Supervisor en `/supervisor` aprueba/rechaza fotos → en `/reportes` avanza o devuelve (`OBSERVADO`) el expediente.
  5. Administrador consulta KPIs en `/admin/dashboard` y el expediente en `/reportes/[id]/pdf`.

## 3. Expectativas Arquitectónicas y Estándares de Producción
- **Estándares de Diseño Impeccable:**
  - Cero gradientes en textos, cero bordes laterales decorativos arbitrarios (side-stripe borders).
  - Tipografía limpia con contraste WCAG AA (≥ 4.5:1 para texto normal, ≥ 3:1 para display).
  - Microinteracciones con transiciones suaves (ease-out-expo, 150-200ms) sin desbordamiento de contenedores.
- **Definition of Done (DoD):**
  - Ningún usuario puede ver botones o accesos a funciones que no le correspondan.
  - Manejo de carga (Skeleton loaders) y estados vacíos amigables en todas las listas.

## 4. BRECHA ARQUITECTÓNICA Y NUEVOS GOALS PARA EL MASTER LOOP
- [ ] [UX-01] Crear middleware Next.js (`middleware.ts`) para proteger rutas por rol según cookie/header de sesión. (`src/middleware.ts`)
- [ ] [UX-02] Vincular selección de orden de trabajo en `/campo` con `/mobile?reporteId=[id]` para contextualizar la captura. (`src/app/campo/page.tsx`)
- [ ] [UX-03] Conectar tabla de radiobases `/admin/radiobases` a API real `GET/POST /api/radiobases`. (`src/app/admin/radiobases/page.tsx`)
- [ ] [UX-04] Conectar directorio `/admin/usuarios` a API real `GET /api/usuarios`. (`src/app/admin/usuarios/page.tsx`)
- [ ] [UX-05] Conectar KPIs del dashboard `/admin/dashboard` a endpoint `GET /api/admin/stats`. (`src/app/admin/dashboard/page.tsx`)
- [ ] [UX-06] Conectar bandeja `/supervisor` para cargar las fotos reales del reporte seleccionado desde `/api/reportes/[id]`. (`src/app/supervisor/page.tsx`)
- [ ] [UX-07] Implementar sincronización bidireccional real en `/campo` consumiendo la base Dexie.js hacia `/api/sync/offline`. (`src/app/campo/page.tsx`)
