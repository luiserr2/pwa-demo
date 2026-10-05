# PROPUESTA TÉCNICO-COMERCIAL Y CONTRATO DE LICENCIAMIENTO

**SISTEMA SISBIRCECA** &mdash; *Plataforma de Supervisión, Matriz Técnica de 48 Zonas y Certificación Forense de Radiobases*  
**REFERENCIA:** PROP-SISB-2026-01  
**MODALIDAD:** Implementación, Bolsa de Adecuaciones y Licenciamiento Comercial (B2B)  
**FECHA:** Octubre de 2026  
**VALIDEZ DE OFERTA:** 15 Días Continuos  

---

## 1. RESUMEN EJECUTIVO (EL CASO DE NEGOCIO)

Las empresas contratistas de mantenimiento e infraestructura en telecomunicaciones sufren con frecuencia pérdidas financieras entre un **15% y un 25% de su facturación bruta** debido a:
* **Glosa y rechazo de actas:** Fotografías borrosas, desactualizadas o sin trazabilidad geográfica exigida por las operadoras (Digitel, Movistar, Cantv).
* **Retrasos de pago:** Semanas perdidas compilando fotos de WhatsApp en archivos de Word y hojas de cálculo de Excel.
* **Falta de respaldo técnico:** Ausencia de evidencia fehaciente cuando la operadora objeta un servicio ejecutado en torre.

**SISBIRCECA** soluciona esta fricción estandarizando todo el flujo operativo en una plataforma integrada de tres perfiles de usuario.

---

## 2. ESTRUCTURA DE LA SOLUCIÓN POR MÓDULOS Y ROLES DE USUARIO

La plataforma se compone de cuatro (4) módulos diseñados para la función exacta de cada miembro de la organización:

### A. MÓDULO DE CAMPO (TÉCNICO EN TORRE / OPERACIONES EN SITIO)
*Diseñado para técnicos de campo, cuadrillas de mantenimiento e instaladores.*

* **1. PWA Offline-First (Sin Conexión):** Base de datos local indexada `IndexedDB (Dexie.js)`. Permite realizar levantamientos íntegros sin cobertura celular en zonas rurales o shelters apantallados. Cero riesgo de pantallas en blanco o pérdida de sesión.
* **2. Sincronización Automática Bidireccional:** Detección de conectividad (3G/4G/Wi-Fi) con reintentos exponenciales y cola visual de sincronización en segundo plano para asegurar que ningún reporte quede atrapado en el teléfono.
* **3. Matriz Técnica Homologada de 48 Zonas:** Formulario secuencial guiado para los 5 subsistemas normativos (Torre, Shelter, Energía DC, Microondas y Puesta a Tierra). Evaluación (`NORMAL`, `ALARMA`, `FALLA`) con notas de campo obligatorias.
* **4. Motor Fotográfico Adaptativo por Tipo de Misión:** Soporta flujo de **Evidencia Única** para obras nuevas, swaps o auditorías, y flujo dual **Antes / Después** para mantenimientos correctivos. Compresión automática WebP (< 250 KB por foto).
* **5. Modo Sol:** Interfaz de alto contraste y botones táctiles sobredimensionados (≥ 48px) para operar bajo luz solar intensa y con guantes de seguridad.

---

### B. MÓDULO DE SEGUIMIENTO (COORDINACIÓN, VISADO Y HES)
*Diseñado para la persona de seguimiento, coordinadores de operaciones y control de facturación técnica.*

* **1. Carga de Órdenes desde Excel:** Importación rápida de órdenes de salida o trabajo mediante una plantilla estándar en Excel (código de radiobase, tipo de servicio, fecha y cuadrilla asignada), evitando la carga manual individual.
* **2. Pipeline de Seguimiento Operativo:** Tablero visual para monitorear el estatus de cada orden a lo largo de su ciclo: `SIN_EMPEZAR` &rarr; `EN_VISITA` &rarr; `ELABORANDO_INFORME` &rarr; `REVISION_INTERNA` &rarr; `ENVIADO_AL_CLIENTE` &rarr; `VISADO` &rarr; `HES_SOLICITADA` &rarr; `FACTURADO`.
* **3. Revisión y Control de Calidad (QA):** Bandeja de auditoría interna para revisar las 48 zonas y la calidad de las fotos cargadas por el técnico, con potestad de aprobar el informe o solicitar subsanaciones inmediatas a la cuadrilla.
* **4. Seguimiento de Entrega y Radicación:** Registro del estado de entrega del informe al cliente (`ENVIADO_AL_CLIENTE`), documentando canal de entrega, número de ticket y tiempos de respuesta del inspector de la operadora.
* **5. Visado del Cliente y Gestión de HES:** Registro del visto bueno del cliente (`VISADO`), bloqueo del informe para impedir modificaciones y registro de la Hoja de Entrada de Servicios (`HES_SOLICITADA` en SAP) para habilitar el cobro.
* **6. Historial de Modificaciones y Auditoría:** Bitácora organizada que registra quién editó el documento, fecha y hora, y el cambio puntual realizado (dato anterior vs. nuevo), garantizando total control antes de la entrega final.

---

### C. MÓDULO ADMINISTRATIVO (GERENCIA, AUDITORÍA Y COMPLIANCE)
*Diseñado para directores generales, gerentes de operaciones y auditores corporativos.*

* **1. Dashboard Ejecutivo y Telemetría Operativa:** Métricas en tiempo real: volumen mensual de radiobases atendidas, tasa de rechazo interno vs. cliente, sitios con mayor recurrencia de alarmas críticas y cumplimiento de metas contractuales.
* **2. Gestión Centralizada del Parque de Radiobases:** Catálogo maestro de estaciones celulares con código único, región geográfica, coordenadas satelitales oficiales, tipo de estructura y tecnología instalada (4G/LTE, 5G, Microondas).
* **3. Directorio de Cuadrillas y Seguridad RBAC:** Administración de usuarios y segregación estricta de roles (Técnico, Seguimiento, Administrador). Seguridad Zero-Trust con tokens de sesión criptográficos HMAC-SHA256.
* **4. Generador de Actas Técnicas PDF A4 Homologadas:** Compilación a 1 clic de expedientes técnicos en formato A4 listos para cobrar, con membrete corporativo, resumen de 48 zonas, galería en alta resolución y código QR de validación.
* **5. Bitácora Forense y Auditoría Criptográfica SHA-256:** Libro mayor inmutable *append-only* (FIPS 180-4) con hashes encadenados. Verificación matemática de integridad al 100% y descarga en CSV/JSON para peritajes judiciales o auditorías externas.
* **6. Configuración Global del Sistema y Políticas NOC:** Calibración de tolerancias de geocerca en metros por región geográfica, políticas de retención documental, reglas de validación técnica y notificaciones automáticas del sistema.

---

### D. MÓDULO DE PLANTILLAS (FORMULARIOS Y REPORTES PDF)
*Diseñado para administradores y coordinadores de operaciones.*

* **1. Plantillas de Formularios:** Configuración de los campos, preguntas y datos básicos que debe completar el técnico en su teléfono según el tipo de servicio o trabajo a realizar.
* **2. Plantilla del Informe PDF:** Generación del reporte en PDF a partir de los datos cargados en el formulario, incluyendo logos de la empresa y la información organizada en tablas legibles.
* **3. Requerimiento de Fotos:** Definición de las evidencias fotográficas necesarias para el reporte (foto individual para instalaciones o fotos de antes y después para mantenimientos).

---

## 3. BOLSA DE HORAS Y ADECUACIONES INCLUIDAS EN EL SETUP

Para asegurar una transición sin fricción con los formatos existentes de su empresa, **la tarifa de Setup NO es un producto rígido cerrado**, sino que **incluye una bolsa de 20 horas de ingeniería y personalización dedicada** (valor comercial bonificado de **$800.00 USD**):

| Ítem de Adecuación Incluida | Alcance Garantizado |
| :--- | :--- |
| **1. Adaptación de Planilla de 48 Zonas** | Personalización de los nombres técnicos, categorías o preguntas específicas según el estándar de su operadora cliente. |
| **2. Identidad y Maquetación del Acta PDF** | Incorporación de logotipo corporativo, datos fiscales, tipografías y orden de firmas exigido por su cliente. |
| **3. Carga Inicial de Catálogos de Sitios** | Importación y normalización de la lista de radiobases oficiales con sus coordenadas satelitales oficiales. |
| **4. Calibración de Geocercas Satelitales** | Ajuste fino del radio de tolerancia en metros por región geográfica para evitar falsos positivos de bloqueo. |

---

## 4. INFRAESTRUCTURA EN LA NUBE (GOOGLE CLOUD PLATFORM)

Para garantizar un **99.9% de disponibilidad operativa**, respaldo diario y soberanía sobre los datos, la solución se despliega en centros de datos Tier-3 de **Google Cloud Platform (GCP)** en Estados Unidos (Iowa / Carolina del Sur). 

A continuación se transparenta la estructura real de costos de la infraestructura y el valor del servicio gestionado:

| Componente Google Cloud (GCP) | Métrica de Consumo Mensual | Función en la Plataforma | Costo Neto GCP |
| :--- | :--- | :--- | :---: |
| **Google Cloud Run (Serverless)** | 1 vCPU, 1 GB RAM, ~100k peticiones/mes | Ejecución de Next.js PWA, API REST y compilador de PDFs | **$15.00 USD** |
| **Google Cloud SQL for PostgreSQL** | Instancia db-f1-micro / e2-micro (20 GB SSD) | Base de datos relacional ACID con backups diarios automáticos | **$18.50 USD** |
| **Google Cloud Storage (GCS Bucket)** | Multi-Regional Standard (~3.5 GB para 15k fotos WebP) | Almacenamiento redundante de evidencias fotográficas | **$2.50 USD** |
| **Cloud Armor, Cloud DNS y Red Saliente** | Zona Cloud DNS + Tráfico saliente (< 20 GB/mes) | Dominio institucional y certificados TLS 1.3 gestionados | **$2.50 USD** |
| **Cloud Logging & Monitoring** | Retención a 30 días (< 50 GB log allowance) | Telemetría SRE, detección de caídas y alertas al NOC | **$1.50 USD** |
| **SUBTOTAL INFRAESTRUCTURA DIRECTA GOOGLE CLOUD:** | **Consumo neto de servidores de grado industrial** | | **$40.00 USD** |
| **Servicio Gestionado DevOps, Mantenimiento y Soporte L2:** | **Administración 24/7, parches de seguridad, optimización de consultas y soporte técnico.** | | **$80.00 USD** |
| **CANON MENSUAL INTEGRAL FACTURADO A LA EMPRESA:** | **Tarifa plana mensual todo incluido** | | **$120.00 USD / mes** |

> **CLÁUSULA DE SALVAGUARDA DE COSTOS CLOUD:** La tarifa mensual de $120.00 USD ampara con holgura hasta diez (10) técnicos concurrentes, 15,000 fotografías activas en la nube y 20 GB de transferencia mensual. En el supuesto de que **LA EMPRESA** aumente significativamente su flota de cuadrillas o exceda dichos umbrales operativos, el costo excedente de Google Cloud será facturado de manera transparente al costo neto estipulado en la factura oficial de GCP más un quince por ciento (15%) por concepto de gastos administrativos y de gestión.

---

## 5. CUADRO RESUMEN EJECUTIVO DE LA PROPUESTA

| Concepto | Detalle de Entregables | Condición / Forma de Pago | Inversión (USD) |
| :--- | :--- | :--- | :---: |
| **1. Setup e Implementación Base** | Despliegue de los 4 Módulos (Campo, Seguimiento, Administración y Gestor de Plantillas), configuración de catálogos y capacitación de personal. | 3 pagos fraccionados de **$550.00 USD**:<br>&bull; 33.3% Firma / Kick-off<br>&bull; 33.3% Demostración Staging<br>&bull; 33.4% Pase a Producción | **$1,650.00 USD**<br>*(Pago Único)* |
| **2. Bolsa de Adecuaciones Libres** | **20 horas hombre de ingeniería** para personalizar planillas de 48 zonas, diseño del PDF con logo y tolerancias GPS. | **100% Bonificado** dentro del Setup inicial. | **INCLUIDO**<br>*(Valor: $800 USD)* |
| **3. Canon Mensual de Servicio y Nube** | Servidores Google Cloud, 15,000 fotos, licencias para 10 usuarios y soporte técnico Nivel 2. | Mes vencido a partir de la entrega final.<br>*(Primeros 30 días con garantía técnica gratuita).* | **$120.00 USD / mes**<br>*(Tarifa Plana)* |
| **4. Soporte Ad-Hoc (Si no hay canon)** | Intervenciones técnicas bajo demanda en caso de rescindir el servicio mensual gestionado. | Bajo demanda con cargo mínimo de 2 horas (SLA de 24 a 48 horas laborables). | **$40.00 / h (Estándar)**<br>**$50.00 / h (Emergencia)** |
| **5. Tiempo de Ejecución Total** | Despliegue, parametrización, pruebas en campo y 2 sesiones formales de capacitación al personal. | Cronograma cerrado de **3 a 4 semanas** desde el anticipo inicial. | **Garantizado** |
| **6. Blindaje Contractual B2B** | Licencia de uso comercial (EULA), reserva de código fuente y límite máximo indemnizatorio ($1,650 USD). | Protección jurídica mutua para ambas entidades. | **Incluido** |

---

## 6. RÉGIMEN LEGAL Y RESERVA DE DERECHOS

1. **Licencia de Uso Comercial (EULA):** EL PROVEEDOR otorga a LA EMPRESA una licencia de uso no exclusiva, temporal e intransferible para operar el sistema en sus labores ordinarias internas de telecomunicaciones.
2. **Reserva Absoluta de Propiedad Intelectual:** La totalidad del código fuente, arquitectura, algoritmos de compresión y derechos de autor son y continuarán siendo de la **propiedad única y exclusiva del PROVEEDOR**. El presente acuerdo no constituye venta de software ni entrega de repositorios.
3. **Exoneración por Manipulación No Autorizada:** Cualquier manipulación externa de la base de datos o contenedores por parte de personal ajeno al PROVEEDOR anulará de inmediato toda garantía técnica y soporte.
4. **Límite Indemnizatorio (Liability Cap):** La responsabilidad patrimonial máxima acumulada del PROVEEDOR ante cualquier eventualidad estará expresamente limitada al monto efectivamente percibido por concepto de la tarifa inicial de Setup ($1,650.00 USD).

---

## 7. CONFORMIDAD Y FIRMAS

En señal de aceptación de los términos técnicos y económicos descritos en la presente propuesta, las partes suscriben:

```
___________________________________           ___________________________________
POR EL PROVEEDOR TECNOLÓGICO                  POR LA EMPRESA CONTRATANTE
Nombre: ___________________________           Razón Social: _____________________
C.I. / RIF: _______________________           RIF / Registro: ___________________
Cargo: Titular & Arquitecto SISBIRCECA        Representante: ____________________
                                              C.I.: _____________________________
```
