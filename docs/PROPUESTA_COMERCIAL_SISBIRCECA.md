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
* **Falta de blindaje legal:** Ausencia de evidencia inmutable cuando la operadora desconoce un servicio ejecutado en torre.

**SISBIRCECA** soluciona esta fricción estandarizando todo el flujo operativo en una plataforma integrada de tres perfiles de usuario.

---

## 2. ESTRUCTURA DE LA SOLUCIÓN POR MÓDULOS Y ROLES DE USUARIO

La plataforma se organiza en tres (3) módulos diseñados para la función exacta de cada miembro de la organización:

### A. MÓDULO DE CAMPO (TÉCNICO EN TORRE)
*Diseñado para técnicos e inspectores que operan en condiciones severas de campo.*

* **Funcionalidad A — PWA Offline-First (Sin Conexión):**
  Desarrollada bajo tecnología Web Progresiva con base de datos local `IndexedDB (Dexie.js)`. Permite realizar inspecciones completas en zonas rurales o dentro de shelters metálicos sin señal celular. Los datos y fotos se guardan en el dispositivo y se sincronizan automáticamente en segundo plano al recuperar señal 3G/4G o Wi-Fi.
* **Funcionalidad B — Matriz Técnica Homologada de 48 Zonas:**
  Formulario secuencial guiado para los 5 subsistemas normativos (Torre y Estructura, Shelter y Clima, Energía DC y Bancos de Baterías, Radiofrecuencia y Enlaces, y Sistema de Aterramiento). Evaluación ágil mediante estados: `NORMAL`, `ALARMA` o `FALLA` con notas de campo obligatorias.
* **Funcionalidad C — Motor Fotográfico Adaptativo por Tipo de Misión:**
  Soporta flujo de **Evidencia Única** para obras nuevas, swaps o puestas en marcha donde solo se requiere la fotografía final de instalación, y flujo dual **Antes / Después** para mantenimientos correctivos. Comprime automáticamente en formato **WebP (< 250 KB)** con estampado indeleble de telemetría (Coordenadas GPS satelitales, fecha/hora atómica, código de torre y técnico responsable).

---

### B. MÓDULO DE SEGUIMIENTO (COORDINACIÓN, VISADO Y HES)
*Diseñado para la persona de seguimiento, coordinadores de operaciones y control de facturación técnica.*

* **Funcionalidad A — Revisión Interna de Informes y Control de Calidad (QA):**
  Bandeja de recepción de informes entregados por las cuadrillas de campo (`REVISION_INTERNA`). Auditoría técnica de las 48 zonas y verificación fotográfica antes de emitir el documento hacia el cliente. En caso de inconsistencias, se devuelve de inmediato a la cuadrilla con observaciones; si está conforme, se aprueba internamente para radicación.
* **Funcionalidad B — Gestión de Pipeline y Envío al Cliente (Digitel / Operadora):**
  Tablero de control del ciclo de vida operativo: avance de la orden a `ENVIADO_AL_CLIENTE`. Monitoreo continuo de los tiempos de respuesta del inspector de la operadora, solventando comentarios u observaciones hasta lograr el `VISADO` formal (Aprobación definitiva del cliente).
* **Funcionalidad C — Tramitación de HES (Hoja de Entrada de Servicios) y Pase a Facturación:**
  Una vez obtenido el visado de la operadora, registro y seguimiento de la solicitud de HES (`HES_SOLICITADA`) en el sistema del cliente (ej. SAP Digitel). Aprobada la HES, se marca el expediente como `FACTURADO` y se traslada a administración para el cobro correspondiente.

---

### C. MÓDULO ADMINISTRATIVO (GERENCIA Y CONTROL)
*Diseñado para directores generales, gerentes de operaciones y auditores corporativos.*

* **Funcionalidad A — Dashboard Ejecutivo y Telemetría Operativa:**
  Indicadores clave de rendimiento (KPIs) en tiempo real: volumen mensual de radiobases inspeccionadas, tasa de rechazo por cuadrilla, radiobases con mayor recurrencia de alarmas críticas y porcentaje de cumplimiento de metas contractuales.
* **Funcionalidad B — Gestión Centralizada de Sitios, Cuadrillas y Accesos (RBAC):**
  Administración del catálogo de radiobases georreferenciadas, altas y bajas de personal técnico/supervisor, y control de seguridad mediante tokens criptográficos de sesión.
* **Funcionalidad C — Generador de Actas Técnicas PDF y Bitácora Forense SHA-256:**
  * Compilación a un solo clic de actas homologadas en formato A4 listas para radicar y facturar ante la operadora (con membrete de la empresa, firmas y códigos QR).
  * Libro mayor inmutable *append-only* (FIPS 180-4) con verificación matemática de integridad para peritajes judiciales o resolución de disputas comerciales.

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
| **Servicio Gestionado DevOps, Mantenimiento y Soporte L2:** | **Administración 24/7, parches de seguridad, rotación de claves criptográficas, auditoría de respaldos off-site y soporte técnico.** | | **$80.00 USD** |
| **CANON MENSUAL INTEGRAL FACTURADO A LA EMPRESA:** | **Tarifa plana mensual todo incluido** | | **$120.00 USD / mes** |

> **CLÁUSULA DE SALVAGUARDA DE COSTOS CLOUD:** La tarifa mensual de $120.00 USD ampara con holgura hasta diez (10) técnicos concurrentes, 15,000 fotografías activas en la nube y 20 GB de transferencia mensual. En el supuesto de que **LA EMPRESA** aumente significativamente su flota de cuadrillas o exceda dichos umbrales operativos, el costo excedente de Google Cloud será facturado de manera transparente al costo neto estipulado en la factura oficial de GCP más un quince por ciento (15%) por concepto de gastos administrativos y de gestión.

---

## 5. CUADRO RESUMEN EJECUTIVO DE LA PROPUESTA

| Concepto | Detalle de Entregables | Condición / Forma de Pago | Inversión (USD) |
| :--- | :--- | :--- | :---: |
| **1. Setup e Implementación Base** | Despliegue de los 3 Módulos (Campo, Seguimiento, Administración), configuración de catálogos y capacitación de personal. | 3 pagos fraccionados de **$550.00 USD**:<br>&bull; 33.3% Firma / Kick-off<br>&bull; 33.3% Demostración Staging<br>&bull; 33.4% Pase a Producción | **$1,650.00 USD**<br>*(Pago Único)* |
| **2. Bolsa de Adecuaciones Libres** | **20 horas hombre de ingeniería** para personalizar planillas de 48 zonas, diseño del PDF con logo y tolerancias GPS. | **100% Bonificado** dentro del Setup inicial. | **INCLUIDO**<br>*(Valor: $800 USD)* |
| **3. Canon Mensual de Servicio y Nube** | Servidores Google Cloud, 15,000 fotos, respaldos diarios off-site, licencias para 10 usuarios y soporte técnico Nivel 2. | Mes vencido a partir de la entrega final.<br>*(Primeros 30 días con garantía técnica gratuita).* | **$120.00 USD / mes**<br>*(Tarifa Plana)* |
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
