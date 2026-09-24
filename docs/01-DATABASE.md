# 01-DATABASE: PERSISTENCIA RELACIONAL, MODELADO Y TRANSACCIONES ACID

## 1. Estado Real Detectado (Código Actual)
- **Motor y ORM:** TypeORM 0.3.20 sobre PostgreSQL 16 con decoradores TypeScript estrictos (`reflect-metadata`).
- **Archivos Físicos:**
  - `src/server/db/data-source.ts`: Implementa patrón Singleton (`AppDataSourceManager`) tolerante al Hot-Reloading de Next.js, evitando agotamiento de conexiones en desarrollo.
  - `src/server/db/seed.ts`: Carga de datos semilla con 3 usuarios tipados (`TECNICO`, `SUPERVISOR`, `ADMIN`), 4 radiobases oficiales, 1 reporte completo con 48 zonas y 12 evidencias pareadas.
  - `src/server/entities/`:
    - `User.ts`: Entidad `usuarios` con roles ENUM (`TECNICO`, `SUPERVISOR`, `ADMIN`), cédula, email y flag `activo`.
    - `Radiobase.ts`: Entidad `radiobases` con código único, nombre, región, tecnología y tipo de torre.
    - `Reporte.ts`: Entidad central `reportes` con estados ENUM (`BORRADOR`, `EN_REVISION`, `OBSERVADO`, `APROBADO`), FKs a radiobase, técnico y supervisor, campo JSONB `datos_red`.
    - `EvidenciaFotografica.ts`: Entidad `evidencias_fotograficas` con índice compuesto de unicidad `@Unique(['reporteId', 'tipoEquipo', 'slotNumero', 'momento'])`, estados de validación visual (`PENDIENTE`, `APROBADO`, `RECHAZADO`).
    - `ZonaMatriz.ts`: Entidad `zonas_matriz` vinculada al reporte con número de zona (1 a 48) y estado.
    - `EquipoInstalado.ts`: Entidad `equipos_instalados` con tipo, modelo, serial y cantidad.
- **Deuda Técnica Detectada:**
  - Las vistas frontend (`/admin/radiobases`, `/admin/usuarios`, `/campo`) utilizan mocks en memoria (`RADIOBASES_INITIAL`, `USUARIOS_INITIAL`, `asignacionesHoy`) en lugar de consultar la BD mediante endpoints REST conectados al DataSource.
  - No existe un mecanismo de migración automática versionada (`typeorm migration:run`), sino sincronización de esquemas (`synchronize: true`), lo cual está prohibido en producción final.
  - Falta un índice B-Tree en `reportes(estado, tecnico_id)` y `reportes(radiobase_id)` para optimizar consultas de dashboards a gran escala.

## 2. Nuevos Requerimientos a Integrar (Nuevo Brief)
- Conexión 100% real entre los componentes visuales administrativos/operativos y las tablas TypeORM.
- Endpoint y servicio de alta de radiobases persistido en BD (`POST /api/radiobases`).
- Endpoint y servicio de consulta y asignación de usuarios/cuadrillas (`GET /api/usuarios`, `POST /api/usuarios`).
- Restricción estricta de integridad referencial para evitar el borrado en cascada accidental de radiobases con reportes históricos auditados.
- Persistencia de la firma digital y hash criptográfico SHA-256 en la entidad `Reporte`.

## 3. Expectativas Arquitectónicas y Estándares de Producción
- **Transaccionalidad:** Creación de reportes y sus 48 zonas atómicas bajo `dataSource.transaction`. Ningún reporte puede existir con menos de 48 zonas.
- **Concurrencia:** Connection pool configurado en `max: 20`, `idleTimeoutMillis: 30000` para Cloud SQL.
- **Definition of Done (DoD):**
  - Cero datos mockeados en memoria en las tablas del dashboard o catálogos.
  - Migraciones reproducibles sin depender de `synchronize: true` en producción.
  - Tests unitarios de repositorios ejecutando con 0 errores bajo Jest.

## 4. BRECHA ARQUITECTÓNICA Y NUEVOS GOALS PARA EL MASTER LOOP
- [ ] [DB-01] Agregar columna `hash_sha256` y `firma_digital` en entidad `Reporte.ts` para sellado criptográfico inmutable. (`src/server/entities/Reporte.ts`)
- [ ] [DB-02] Crear servicio y repositorio para entidad `Radiobase` (`RadiobaseService`) con búsqueda por región y código. (`src/server/services/radiobase.service.ts`)
- [ ] [DB-03] Crear servicio y repositorio para entidad `User` (`UserService`) para consulta de cuadrillas y roles. (`src/server/services/user.service.ts`)
- [ ] [DB-04] Agregar índices compuestos en `reportes` para acelerar filtros de KPIs: `(estado, created_at)` y `(tecnico_id, estado)`. (`src/server/entities/Reporte.ts`)
- [ ] [DB-05] Conectar seed automático en inicio o script de migración para inicialización de Cloud SQL. (`src/server/db/seed.ts`)
