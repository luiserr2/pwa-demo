# GOAL_LOOP_MASTER: PLAN MAESTRO DE EVOLUCIÓN ARQUITECTÓNICA Y LISTO PARA EL MERCADO

Estado General: **COMPLETADO Y CERTIFICADO PARA PRODUCCIÓN (MARKET READY)**  
Metodología: Master Orchestrator Loop V4 / Zero-Conflict Swarm  
Gobernanza: Repositorio Oficial Único (`c:\Users\luiserr\Videos\gerson-sisbirceca`)  
Repositorio Legado: `c:\Users\luiserr\Videos\Gerson` (**ESTRICTAMENTE CONGELADO / READ-ONLY**)  
Identidad Corporativa: Morado Institucional `#30235F` | Verde Telecom `#009444`  
Fecha de Certificación: 23 de Septiembre de 2026  

---

## 🎯 HITOS MAESTROS Y MATRIZ DE TRAZABILIDAD BIDIRECCIONAL

### HITO 1: Cimientos, Base de Datos e Infraestructura
*Objetivo: Estabilizar el esquema relacional TypeORM, índices de alto rendimiento, inicialización atómica de datos y entorno Docker standalone.*

- [x] [HITO-1.1] Agregar columnas `hash_sha256` y `firma_digital` en entidad `Reporte` para sellado criptográfico inmutable. (Origen: docs/01-DATABASE.md)
- [x] [HITO-1.2] Crear servicio y repositorio para la entidad `Radiobase` (`RadiobaseService`) con filtrado por región y código. (Origen: docs/01-DATABASE.md)
- [x] [HITO-1.3] Crear servicio y repositorio para la entidad `User` (`UserService`) con soporte para gestión de cuadrillas. (Origen: docs/01-DATABASE.md)
- [x] [HITO-1.4] Agregar índices B-Tree compuestos en `reportes` para acelerar consultas de dashboards gerenciales. (Origen: docs/01-DATABASE.md)
- [x] [HITO-1.5] Conectar seed automático en inicio o script de migración para inicialización controlada de PostgreSQL. (Origen: docs/01-DATABASE.md)
- [x] [HITO-1.6] Habilitar modo `output: 'standalone'` y cabeceras de seguridad HTTP en `next.config.mjs`. (Origen: docs/05-DEPLOYMENT_GCP.md)
- [x] [HITO-1.7] Adaptar `data-source.ts` para soportar `INSTANCE_UNIX_SOCKET` para conexiones seguras con Google Cloud SQL. (Origen: docs/05-DEPLOYMENT_GCP.md)
- [x] [HITO-1.8] Crear script de verificación y empaquetado de contenedor Docker local `docker-test.ps1`. (Origen: docs/05-DEPLOYMENT_GCP.md)

---

### HITO 2: Backend, Lógica de Negocio y Seguridad Zero-Trust
*Objetivo: Implementar contratos de API con validación Zod, autenticación basada en cookies firmadas, middleware de autorización y generador de hash determinístico.*

- [x] [HITO-2.1] Implementar esquemas de validación Zod (`reporte.schema.ts`, `foto.schema.ts`, `radiobase.schema.ts`). (Origen: docs/02-BACKEND_API.md)
- [x] [HITO-2.2] Crear ruta `GET /api/radiobases` y `POST /api/radiobases` conectada al `RadiobaseService`. (Origen: docs/02-BACKEND_API.md)
- [x] [HITO-2.3] Crear ruta `GET /api/usuarios` para listar personal y asignación de cuadrillas. (Origen: docs/02-BACKEND_API.md)
- [x] [HITO-2.4] Crear ruta `GET /api/admin/stats` para computar métricas y KPIs operacionales en tiempo real desde PostgreSQL. (Origen: docs/02-BACKEND_API.md)
- [x] [HITO-2.5] Crear endpoint `POST /api/sync/offline` para procesamiento transaccional en lote de registros Dexie.js. (Origen: docs/02-BACKEND_API.md)
- [x] [HITO-2.6] Implementar utilitario de cookies y tokens de sesión firmados (`sisbirceca_auth`). (Origen: docs/04-SECURITY_ZERO_TRUST.md)
- [x] [HITO-2.7] Crear middleware guard de seguridad en API para rechazar peticiones sin credenciales del rol requerido. (Origen: docs/04-SECURITY_ZERO_TRUST.md)
- [x] [HITO-2.8] Implementar cálculo de Hash SHA-256 determinístico en `ReporteService.cambiarEstado` al certificar como `APROBADO`. (Origen: docs/04-SECURITY_ZERO_TRUST.md)
- [x] [HITO-2.9] Sanitizar y validar payloads en `/api/fotos` con verificación de formato WebP y tamaño máximo 500KB. (Origen: docs/04-SECURITY_ZERO_TRUST.md)
- [x] [HITO-2.10] Implementar liberación de memoria (`URL.revokeObjectURL`) en compresión de imágenes de la PWA. (Origen: docs/04-SECURITY_ZERO_TRUST.md)

---

### HITO 3: Frontend, UI/UX y Segregación Absoluta de Roles (RBAC)
*Objetivo: Cerrar la navegación por roles, conectar las vistas React con endpoints REST reales y optimizar el flujo de captura offline en sitio.*

- [x] [HITO-3.1] Crear middleware central de Next.js (`src/middleware.ts`) que bloquee físicamente el acceso cruzado entre rutas según el rol. (Origen: docs/03-FRONTEND_RBAC_UX.md)
- [x] [HITO-3.2] Redirigir reactivamente desde `/login` a la vista jurisdiccional del rol (`/campo`, `/supervisor`, `/admin/dashboard`). (Origen: docs/03-FRONTEND_RBAC_UX.md)
- [x] [HITO-3.3] Vincular selección de orden de trabajo en `/campo` con `/mobile?reporteId=[id]` para contextualizar la captura fotográfica en torre. (Origen: docs/03-FRONTEND_RBAC_UX.md)
- [x] [HITO-3.4] Conectar tabla de radiobases `/admin/radiobases` a API real `GET/POST /api/radiobases`. (Origen: docs/03-FRONTEND_RBAC_UX.md)
- [x] [HITO-3.5] Conectar directorio `/admin/usuarios` a API real `GET /api/usuarios`. (Origen: docs/03-FRONTEND_RBAC_UX.md)
- [x] [HITO-3.6] Conectar tarjetas de KPIs y distribución tecnológica del `/admin/dashboard` a `GET /api/admin/stats`. (Origen: docs/03-FRONTEND_RBAC_UX.md)
- [x] [HITO-3.7] Conectar bandeja `/supervisor` para cargar las fotos y datos del reporte real seleccionado desde `/api/reportes/[id]`. (Origen: docs/03-FRONTEND_RBAC_UX.md)
- [x] [HITO-3.8] Implementar sincronización bidireccional en `/campo` enviando el paquete local Dexie.js a `POST /api/sync/offline`. (Origen: docs/03-FRONTEND_RBAC_UX.md)
- [x] [HITO-3.9] Pulir contraste WCAG AA, estados de carga y feedback visual según directivas del Design Orchestrator e Impeccable. (Origen: docs/03-FRONTEND_RBAC_UX.md)

---

### HITO 4: Auditoría Integral, Testing Automatizado y Certificación Final
*Objetivo: Validar la integridad de los contratos, tests unitarios en Jest, auditoría de vulnerabilidades y verificación del build de producción.*

- [x] [HITO-4.1] Ampliar la suite de pruebas unitarias Jest para cubrir nuevos servicios (`RadiobaseService`, `UserService`, `AdminStats`). (Origen: docs/02-BACKEND_API.md)
- [x] [HITO-4.2] Crear tests unitarios para validación de permisos en guardias y cálculo determinístico del hash SHA-256. (Origen: docs/04-SECURITY_ZERO_TRUST.md)
- [x] [HITO-4.3] Ejecutar `npm run typecheck` y certificar 0 errores de tipado en TypeScript. (Origen: docs/03-FRONTEND_RBAC_UX.md)
- [x] [HITO-4.4] Ejecutar `npm test` y certificar 100% de tests aprobados sin regresiones. (Origen: docs/02-BACKEND_API.md)
- [x] [HITO-4.5] Ejecutar `npm run build` y certificar compilación limpia de todas las rutas y bundles standalone. (Origen: docs/05-DEPLOYMENT_GCP.md)
- [x] [HITO-4.6] Emitir acta formal de certificación de producto listo para entrega comercial y despliegue a cliente. (Origen: docs/05-DEPLOYMENT_GCP.md)
