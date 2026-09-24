# 04-SECURITY_ZERO_TRUST: SEGURIDAD OFENSIVA, CONTROL DE ACCESO Y SELLO CRIPTOGRÁFICO

## 1. Estado Real Detectado (Código Actual)
- **Control de Acceso Actual:** Sesión puramente en cliente (`localStorage`) mediante `AuthContext.tsx`. Los roles son seleccionables arbitrariamente desde el cliente.
- **Validaciones en Backend:**
  - `ReporteService`: Valida que el técnico no pueda auto-aprobarse y que el supervisor no apruebe con fotos rechazadas.
  - `EvidenciaService`: Valida que el rechazo de fotos incluya una observación obligatoria.
- **Deuda Técnica y Vulnerabilidades Detectadas (Binauditorgod Zero-Trust Audit):**
  - **[CRÍTICO - OWASP-A01: Broken Access Control]:** No hay middleware a nivel de servidor o API Gateway. Si un atacante envía una petición directa `PATCH /api/reportes/XYZ` con `{ "nuevoEstado": "APROBADO", "usuarioEjecutor": { "id": "1", "rol": "ADMIN" } }`, el backend la ejecuta sin verificar si el remitente realmente posee ese rol o una sesión válida firmada.
  - **[ALTO RIESGO - OWASP-A02: Cryptographic Failures]:** El Hash SHA-256 en `/reportes/[id]/pdf` se calcula dinámicamente en el cliente al renderizar la página con `Math.random()` simulado en lugar de un hash criptográfico determinístico computado por el backend sobre los bytes de las fotos, datos de red y firmas.
  - **[ALTO RIESGO - SPOF & Denial of Service]:** El endpoint `POST /api/fotos` acepta URLs o Data URIs sin limitar el tamaño del payload en el servidor o validar el Content-Type (posible saturación de almacenamiento en PostgreSQL).
  - **[ADVERTENCIA - Fuga de Recursos en Cliente]:** El conversor Canvas en la PWA móvil crea URLs de objeto (`URL.createObjectURL(blob)`) que deben ser liberadas explícitamente (`URL.revokeObjectURL`) para evitar fugas de memoria en teléfonos móviles de campo con RAM restringida.

## 2. Nuevos Requerimientos a Integrar (Nuevo Brief)
- **Token de Sesión Firmado / Cookie HTTPOnly:** Autenticación de sesiones mediante token criptográfico verificable en cada petición API.
- **Middleware Guard de Next.js:** Interceptación centralizada en `src/middleware.ts` para verificar permisos de ruta antes de despachar páginas o APIs.
- **Algoritmo de Sello Criptográfico Inmutable (SHA-256):**
  - Generación de hash determinístico:
    `hash = SHA256(codigoReporte + radiobaseId + tecnicoId + supervisorId + fechaAprobacion + JSON(zonas) + JSON(evidencias))`
  - El hash se almacena en la columna `hash_sha256` de la tabla `reportes` al momento de la aprobación.
  - Cualquier intento de modificar un reporte posterior a su aprobación invalida el hash y activa una alarma de manipulación.
- **Limpieza de Recursos y Sanitización de Datos:** Revocación estricta de ObjectURLs y límite de payload a 5MB con compresión WebP verificada.

## 3. Expectativas Arquitectónicas y Estándares de Producción
- **Zero-Trust Backend:** Nunca confiar en los campos de usuario enviados en el cuerpo JSON de la petición. Extraer la identidad exclusivamente del token de sesión verificado.
- **Principio de Mínimo Privilegio (PoLP):** Cada rol solo tiene permisos sobre las operaciones estrictamente requeridas para su función.
- **Definition of Done (DoD):**
  - Suite de pruebas de seguridad probando accesos indebidos (debe retornar 401 Unauthorized o 403 Forbidden).
  - Hash SHA-256 100% verificable e inmutable tras la aprobación del supervisor.

## 4. BRECHA ARQUITECTÓNICA Y NUEVOS GOALS PARA EL MASTER LOOP
- [ ] [SEC-01] Implementar cookie de sesión con firma segura (`sisbirceca_auth`) y utilitario de verificación de tokens. (`src/server/security/auth-token.ts`)
- [ ] [SEC-02] Crear guardia de seguridad en API (`src/server/security/guard.ts`) que rechace mutaciones sin sesión válida del rol requerido. (`src/server/security/guard.ts`)
- [ ] [SEC-03] Implementar generador de Hash SHA-256 determinístico en `ReporteService.cambiarEstado` al pasar a `APROBADO`. (`src/server/services/reporte.service.ts`)
- [ ] [SEC-04] Sanitizar y restringir payloads en `/api/fotos` con verificación de formato WebP y tamaño máximo de 500KB. (`src/app/api/fotos/route.ts`)
- [ ] [SEC-05] Implementar liberación de memoria (`URL.revokeObjectURL`) en el módulo de compresión de imágenes de la PWA. (`src/client/utils/compression.ts`)
