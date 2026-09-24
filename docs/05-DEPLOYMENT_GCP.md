# 05-DEPLOYMENT_GCP: INFRAESTRUCTURA CLOUD, DOCKER Y OPERACIONES EN PRODUCCIÓN

## 1. Estado Real Detectado (Código Actual)
- **Contenedores:**
  - `Dockerfile`: Multi-stage build para Next.js con modo `output: 'standalone'` y usuario sin privilegios `nextjs:nodejs`.
  - `docker-compose.yml`: Levanta servicio `postgres:16-alpine` mapeado al puerto 5432 con volumen persistente `postgres_data`.
- **Variables de Entorno:**
  - `.env.local`: Configuración de conexión local (`DB_HOST=localhost`, `DB_PORT=5432`, `DB_USER=sisbirceca_user`, `DB_PASS=sisbirceca_secret_2026`, `DB_NAME=sisbirceca_prod`).
  - `.env.example`: Plantilla de variables documentada.
- **Deuda Técnica Detectada:**
  - `next.config.mjs` no tiene configurado explícitamente `output: 'standalone'`, lo que puede causar que el `Dockerfile` falle en la fase de copia de `.next/standalone`.
  - No hay script de inicialización o migración automática en el arranque del contenedor (entrypoint).

## 2. Nuevos Requerimientos a Integrar (Nuevo Brief)
- Ajustar `next.config.mjs` con `output: 'standalone'` para habilitar el empaquetado mínimo para Google Cloud Run.
- Configurar soporte para Cloud SQL Socket (`/cloudsql/PROJECT:REGION:INSTANCE`) cuando se despliegue en Google Cloud Platform.
- Configurar script de despliegue automatizado `deploy-gcp.sh` / `.ps1` que compile la imagen con Google Cloud Build y la despliegue a Cloud Run con conexión gestionada a Cloud SQL.
- Configurar cabeceras de seguridad en producción (HSTS, Content Security Policy, X-Frame-Options).

## 3. Expectativas Arquitectónicas y Estándares de Producción
- **Eficiencia de Contenedores:** Imagen Docker final de < 200MB, libre de devDependencies.
- **Autoescalado en Cloud Run:** Mínimo 1 instancia lista para eliminar cold-starts, escalado hasta 10 instancias con 80 conexiones concurrentes por instancia.
- **Definition of Done (DoD):**
  - `docker build` ejecutando con éxito y produciendo un contenedor funcional.
  - Arranque limpio en puerto 8080 (Cloud Run default) o 3000 con variables de producción.

## 4. BRECHA ARQUITECTÓNICA Y NUEVOS GOALS PARA EL MASTER LOOP
- [ ] [OPS-01] Habilitar `output: 'standalone'` en `next.config.mjs`. (`next.config.mjs`)
- [ ] [OPS-02] Adaptar `data-source.ts` para soportar `host: process.env.INSTANCE_UNIX_SOCKET` para Google Cloud SQL. (`src/server/db/data-source.ts`)
- [ ] [OPS-03] Crear script de compilación y prueba local de contenedor `docker-test.ps1`. (`scripts/docker-test.ps1`)
- [ ] [OPS-04] Configurar cabeceras HTTP de seguridad en `next.config.mjs` (CSP, X-Content-Type-Options, Referrer-Policy). (`next.config.mjs`)
