# Proyecto de Producción: SISBIRCECA (PWA Radiobases)

Sistema formal de producción para levantamiento de reportes técnicos de radiobases telecom e inspección fotográfica para comités y auditorías de calidad.

## Stack Arquitectónico Oficial
- **Frontend / PWA:** Next.js 14+ (App Router), React 18, Tailwind CSS, Dexie.js (IndexedDB Offline Store), Service Worker nativo.
- **Backend & Persistencia:** TypeORM 0.3+ con decoradores TypeScript estrictos y PostgreSQL 16 (Soporte local Docker y Google Cloud SQL).
- **Pruebas Automatizadas:** Jest con `ts-jest` para pruebas unitarias e integrales de la capa de servicios, reglas de avance y máquina de estados.
- **Validación Visual:** Flujo de inspección fotográfica lado a lado (Antes vs Después) con aprobación unitaria y observaciones de rechazo para supervisores.
- **Despliegue Cloud:** Dockerfile multi-stage listo para Google Cloud Run y Cloud SQL.

---

## Entidades TypeORM Núcleo
1. `User`: Control de acceso por roles (`TECNICO`, `SUPERVISOR`, `ADMIN`).
2. `Radiobase`: Catálogo maestro oficial de torres y celdas telecom.
3. `Reporte`: Entidad principal con máquina de estados (`BORRADOR`, `EN_REVISION`, `OBSERVADO`, `APROBADO`) y nomenclatura estándar `${CodigoRadiobase}_${Fecha}`.
4. `EvidenciaFotografica`: Slots correlativos con regla de bloqueo y estados de validación visual (`PENDIENTE`, `APROBADO`, `RECHAZADO`).
5. `ZonaMatriz`: 48 zonas fijas inicializadas atómicamente por reporte.
6. `EquipoInstalado`: Inventario de equipos con modelo, serial y cantidad.

---

## Ejecución de Pruebas de Backend
Para ejecutar la suite completa de pruebas automatizadas con Jest:
```powershell
npm test
```
*Garantiza 100% de cobertura en reglas de bloqueo, inicialización de 48 zonas y máquina de estados.*

---

## Despliegue Local con Docker Compose
1. Levantar la base de datos PostgreSQL:
```powershell
docker compose up -d postgres
```
2. Iniciar el servidor Next.js en desarrollo:
```powershell
npm run dev
```
3. Acceder al sistema:
- Portal General: `http://localhost:3000`
- PWA Móvil de Campo: `http://localhost:3000/mobile`
- Panel de Validación Visual: `http://localhost:3000/supervisor`
- Matriz de 48 Zonas: `http://localhost:3000/reportes`
