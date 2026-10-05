# PROPUESTA TÉCNICO-COMERCIAL Y CONTRATO DE LICENCIAMIENTO

**SISTEMA SISBIRCECA** &mdash; *Plataforma de Supervisión, Matriz Técnica de 48 Zonas y Certificación Forense de Radiobases*  
**REFERENCIA:** PROP-SISB-2026-01  
**MODALIDAD:** Implementación, Bolsa de Adecuaciones y Licenciamiento Comercial (B2B)  
**FECHA:** Octubre de 2026  
**VALIDEZ DE OFERTA:** 15 Días Continuos  

---

## 1. RESUMEN EJECUTIVO (EL CASO DE NEGOCIO)

Las empresas contratistas de mantenimiento e infraestructura en telecomunicaciones sufren con frecuencia pérdidas financieras entre un **15% y un 25% de su facturación bruta** debido a:
* **En Campo:** Evidencias desordenadas en chats de WhatsApp, fotos borrosas y fallas por falta de señal en torre.
* **En Coordinación:** Carga manual lenta de órdenes, descontrol de visados, retrasos en trámite de HES y falta de auditoría de cambios.
* **En Gerencia:** Días perdidos maquetando actas en Word/Excel, falta de visibilidad en tiempo real y riesgo ante reclamos de operadoras (Digitel, Movistar, Cantv).
* **En Operaciones:** Formatos rígidos difíciles de adaptar ante los cambios de exigencias técnicas de cada cliente.

**SISBIRCECA** soluciona esta fricción estandarizando el flujo operativo de punta a punta a través de cuatro (4) módulos integrados:
* **1. Campo (Técnicos):** Captura técnica 100% offline, modo sol de alto contraste y motor fotográfico adaptativo (foto única o Antes/Después).
* **2. Seguimiento (Coordinación):** Carga masiva de órdenes desde plantilla Excel, control de visado/HES y registro detallado de quién editó qué.
* **3. Administración (Gerencia):** Telemetría ejecutiva en vivo, actas PDF homologadas compiladas a 1 clic y bitácora forense SHA-256.
* **4. Plantillas (Operaciones):** Flexibilidad para configurar formularios, requerimientos fotográficos y diseño de actas sin tocar código.

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

---

### D. MÓDULO DE PLANTILLAS (FORMULARIOS Y REPORTES PDF)
*Diseñado para administradores y coordinadores de operaciones.*

* **1. Plantillas de Formularios:** Configuración de los campos, preguntas y datos básicos que debe completar el técnico en su teléfono según el tipo de servicio o trabajo a realizar.
* **2. Plantilla del Informe PDF:** Generación del reporte en PDF a partir de los datos cargados en el formulario, incluyendo logos de la empresa y la información organizada en tablas legibles.
* **3. Requerimiento de Fotos:** Definición de las evidencias fotográficas necesarias para el reporte (foto individual para instalaciones o fotos de antes y después para mantenimientos).

---

## 3. BOLSA DE HORAS Y ADECUACIONES INCLUIDAS EN EL SETUP

Para asegurar una transición sin fricción con los formatos existentes de su empresa, **la tarifa de Setup NO es un producto rígido cerrado**, sino que **incluye una bolsa de 20 horas de ingeniería y personalización dedicada** sin costo adicional:

| Ítem de Adecuación Incluida | Alcance Garantizado |
| :--- | :--- |
| **1. Adaptación de Planilla de 48 Zonas** | Personalización de los nombres técnicos, categorías o preguntas específicas según el estándar de su operadora cliente. |
| **2. Identidad y Maquetación del Acta PDF** | Incorporación de logotipo corporativo, datos fiscales, tipografías y orden de firmas exigido por su cliente. |
| **3. Carga Inicial de Catálogos de Sitios** | Importación y normalización de la lista de radiobases oficiales con sus coordenadas satelitales oficiales. |
| **4. Ajuste de Parámetros y Validaciones** | Calibración de campos obligatorios, umbrales técnicos y reglas de validación de la empresa. |

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
| **SUBTOTAL INFRAESTRUCTURA DIRECTA GOOGLE CLOUD:** | **Consumo base amparando hasta 10 técnicos, 15,000 fotos y 20 GB de tráfico.** *(El gasto en la nube aumentará proporcionalmente si el volumen de datos o tráfico supera estas cuotas).* | | **$40.00 USD / mes**<br>*(Sujeto a consumo)* |
| **Servicio Gestionado DevOps, Mantenimiento y Soporte L2 (OPCIONAL):** | **Administración 24/7, parches de seguridad, optimización de consultas y soporte técnico especializado.** | | **$80.00 USD / mes**<br>*(Opcional)* |
| **PAQUETE INTEGRAL RECOMENDADO (NUBE + DEVOPS + SOPORTE L2):** | **Tarifa plana mensual combinada.** *(Si la empresa prescinde del soporte L2, solo pagará la nube base).* | | **$120.00 USD / mes** |

> **CLÁUSULA DE ESCALABILIDAD CLOUD Y CONDICIONES DE SERVICIO:** El costo base estimado de infraestructura en Google Cloud ($40.00 USD/mes) ampara con holgura hasta diez (10) cuadrillas concurrentes, 15,000 fotografías activas en la nube y 20 GB de transferencia mensual. **El gasto en la nube aumentará si hay mayor tráfico, mayor volumen de fotos o más técnicos concurrentes del definido previamente**, facturándose de manera transparente al costo neto estipulado en la factura oficial de GCP (+ 15% de gastos de gestión administrativa en caso de facturación intermediada). Por su parte, el **Servicio Gestionado DevOps y Soporte L2 ($80.00 USD/mes) es de carácter 100% opcional**; si la empresa opta por prescindir de él, solo cubrirá el consumo real de nube y podrá requerir soporte técnico puntual bajo la modalidad Ad-Hoc por horas.

---

## 5. CUADRO RESUMEN EJECUTIVO DE LA PROPUESTA

| Concepto | Detalle de Entregables | Condición / Forma de Pago | Inversión (USD) |
| :--- | :--- | :--- | :---: |
| **1. Setup e Implementación Base** | Despliegue de los 4 Módulos (Campo, Seguimiento, Administración y Gestor de Plantillas), configuración de catálogos y capacitación de personal. | 3 pagos fraccionados de **$550.00 USD**:<br>&bull; 33.3% Firma / Kick-off<br>&bull; 33.3% Demostración Staging<br>&bull; 33.4% Pase a Producción | **$1,650.00 USD**<br>*(Pago Único)* |
| **2. Bolsa de Adecuaciones Libres** | **20 horas hombre de ingeniería** para personalizar planillas de 48 zonas, diseño del PDF con logo y reglas de validación técnica. | **100% Bonificado** dentro del Setup inicial. | **INCLUIDO** |
| **3. Infraestructura Cloud Base (Google Cloud)** | Servidores Google Cloud de alta disponibilidad, PostgreSQL y almacenamiento para 15,000 fotos.<br>*(El gasto en la nube aumentará si hay más tráfico o almacenamiento del estimado base).* | Requerido para operación en línea. Facturación a mes vencido según consumo real GCP.<br>*(Primeros 30 días con garantía técnica gratuita).* | **$40.00 USD / mes**<br>*(Base sujeta a consumo)* |
| **4. DevOps y Soporte L2 (OPCIONAL)** | Mantenimiento preventivo de infraestructura, parches de seguridad, optimización de base de datos y soporte técnico especializado continuo.<br>*(Junto a la nube conforma el paquete integral de $120.00 USD/mes).* | **Modalidad Opcional**. Contratación mensual flexible mes a mes. | **$80.00 USD / mes**<br>*(Opcional)* |
| **5. Soporte Ad-Hoc (Si no hay abono mensual)** | Intervenciones técnicas puntuales bajo demanda en caso de prescindir del servicio mensual de soporte L2. | Bajo demanda con cargo mínimo de 2 horas (SLA de 24 a 48 horas laborables). | **$40.00 / h (Estándar)**<br>**$50.00 / h (Emergencia)** |
| **6. Tiempo de Ejecución Total** | Despliegue, parametrización, pruebas en campo y 2 sesiones formales de capacitación al personal. | Cronograma cerrado de **3 a 4 semanas** desde el anticipo inicial. | **Garantizado** |
| **7. Soporte Post-Implementación** | **1 mes continuo (30 días)** de soporte de estabilización para corrección exclusiva de fallas sobre funcionalidades delimitadas en el contrato.<br>*(Cualquier modificación de fondo o cambio de alcance tras la aprobación del sistema será cotizada adicionalmente).* | A partir del pase formal a producción y entrega del sistema. | **INCLUIDO**<br>*(30 Días)* |
| **8. Licencia y Términos Contractuales** | Licencia de uso comercial perpetua (sin cobro mensual por usuario), exoneración total por modificación de código y límite de responsabilidad. | Protección jurídica mutua para ambas entidades. | **Incluido** |

---

## 6. RÉGIMEN LEGAL Y CONDICIONES DE LICENCIA

1. **Licencia de Uso Comercial Perpetua (Sin cobro recurrente por usuario):** EL PROVEEDOR concede a LA EMPRESA una licencia de uso comercial, no exclusiva e intransferible para operar la plataforma en sus labores ordinarias de telecomunicaciones. Dicha licencia queda 100% amortizada y concedida mediante el pago único de Setup inicial, sin cobros mensuales por cantidad de técnicos, cuadrillas o usuarios registrados.
2. **Garantía Técnica y Soporte Post-Implementación (Periodo de Estabilización):** A partir de la entrega formal y pase a producción del sistema, EL PROVEEDOR otorga un periodo de **soporte de estabilización y garantía técnica de un (1) mes continuo (30 días calendario)** sin costo adicional:
   * **Alcance de la Garantía:** Ampara única y exclusivamente la corrección de errores de programación (*bugs*), fallas operativas o discrepancias técnicas atribuibles a las funcionalidades expresamente delimitadas y contratadas en la presente propuesta.
   * **Exclusión de Modificaciones de Fondo:** Esta garantía no contempla el desarrollo de nuevas funcionalidades, reestructuración de bases de datos, cambios de flujo operativo ni alteraciones de diseño posteriores a la recepción conforme.
   * **Cotización de Cambios Adicionales:** Una vez aprobado el sistema por LA EMPRESA, cualquier modificación de fondo, ampliación de alcance o cambio sobre lo pactado será cotizado de forma independiente como desarrollo o servicio extraordinario.
3. **Exoneración Total por Alteración o Modificación del Código / Sistema:** Queda terminantemente prohibida la modificación, alteración, descompilación, inyección de scripts o manipulación directa del código fuente, bases de datos o infraestructura del sistema por parte de personal de LA EMPRESA o terceros ajenos al PROVEEDOR. En caso de detectarse cualquier alteración no autorizada:
   * Cesará de pleno derecho y de forma inmediata cualquier garantía técnica, acuerdo de nivel de servicio (SLA) y soporte técnico.
   * EL PROVEEDOR queda **completamente exonerado de toda responsabilidad** por pérdida de información, corrupción de datos, fallas operativas, no disponibilidad del servicio, inconsistencias ante clientes o daños y perjuicios directos o indirectos.
   * Cualquier labor técnica orientada a diagnosticar, restaurar o reparar los daños derivados de la alteración externa será cotizada como servicio extraordinario a la tarifa de soporte aplicable ($50.00 USD/h) y pagadera de forma previa a la intervención.
4. **Límite Máximo de Responsabilidad (Liability Cap):** La responsabilidad patrimonial máxima acumulada del PROVEEDOR ante cualquier reclamo o eventualidad estará expresamente limitada al monto efectivamente percibido por concepto de la tarifa inicial de Setup ($1,650.00 USD).

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
