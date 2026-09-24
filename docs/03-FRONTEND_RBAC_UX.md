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

## 2. Matriz de Segregación RBAC Oficial (Arquitectura Unificada de 2 Roles)
- **Matriz de Segregación RBAC Absoluta (Zero-Trust UI):**
  - **Persona 1: Operador de Campo (Gerson Martínez):**
    - Rutas permitidas: `/campo`, `/mobile`, `/perfil`.
    - Rutas prohibidas: `/admin/*`, `/supervisor`. Si intenta acceder, redirección inmediata a `/campo` con aviso de permisos.
    - UX orientada a torre: Alto contraste para luz solar directa, targets táctiles grandes (≥ 48px), modo offline resiliente sin pantallas en blanco.
  - **Persona 2: Dirección de Operaciones / Administrador (Lic. Mariana Fernández):**
    - Rutas permitidas: `/admin/dashboard`, `/admin/radiobases`, `/admin/usuarios`, `/supervisor` (Auditoría QA y validación visual), `/reportes`, `/reportes/[id]/pdf`.
    - Rutas prohibidas: Pantalla operativa de captura en torre `/mobile` (los directivos no capturan fotos en sitio).
    - UX B2B unificada: Control integral sin saltos de perfil. Acceso en 1 clic a la auditoría fotográfica Antes vs Después, aprobación/rechazo con sellado SHA-256, catálogo de radiobases y ABM completo de usuarios (creación con 2 roles y eliminación).
- **Flujo de Navegación E2E Cerrado:**
  1. `/login` -> Redirección automática según rol.
  2. Técnico en `/campo` selecciona orden de trabajo -> Redirige a `/mobile?reporteId=XYZ`.
  3. Técnico completa fotos y matriz -> Presiona "Enviar a Revisión".
  4. Supervisor en `/supervisor` ve el reporte en cola -> Evalúa visualmente -> Aprueba.
  5. Administrador en `/admin/dashboard` ve el KPI actualizado y accede a `/reportes/[id]/pdf` para emisión de acta.

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
