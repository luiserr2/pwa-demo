# CONTRATO MARCO DE LICENCIAMIENTO COMERCIAL, PARAMETRIZACIÓN TÉCNICA Y GESTIÓN CLOUD

**REFERENCIA DOCUMENTAL:** CONTRATO-SISBIRCECA-2026-001  
**MODALIDAD:** Instrumento Privado de Licenciamiento Comercial (B2B)  
**FECHA:** Octubre de 2026  
**ESTADO:** Oficial / Vinculante  

---

Entre las partes que a continuación se identifican: por una parte, **EL PROVEEDOR TECNOLÓGICO**, persona natural/jurídica en pleno ejercicio de sus derechos de propiedad intelectual sobre el software denominado **SISBIRCECA**; y por la otra parte, **LA EMPRESA CONTRATANTE**, entidad jurídica dedicada a la prestación de servicios de infraestructura, auditoría y mantenimiento en telecomunicaciones, se conviene en celebrar el presente Contrato de Licenciamiento Comercial y Gestión Cloud, el cual se regirá por las siguientes cláusulas:

---

### CLÁUSULA PRIMERA: OBJETO DEL CONTRATO
El presente contrato tiene por objeto regular los términos y condiciones bajo los cuales **EL PROVEEDOR** ejecutará los servicios de configuración, parametrización técnica y puesta en producción del sistema informático **SISBIRCECA** (Sistema de Información para la Supervisión y Generación de Reportes Técnicos de Radiobases), así como el otorgamiento a **LA EMPRESA** de una Licencia de Uso Comercial (EULA) para su explotación operativa en inspecciones de infraestructura de telecomunicaciones y generación de actas homologadas para operadoras móviles.

---

### CLÁUSULA SEGUNDA: ALCANCE TÉCNICO Y ESPECIFICACIÓN POR MÓDULOS

El sistema aprovisionado y puesto en marcha comprende estrictamente los siguientes seis (6) componentes funcionales garantizados:

#### 1. Módulo PWA Móvil de Campo Offline-First (Terminal de Torre)
* **Objetivo:** Garantizar la operatividad del 100% de las cuadrillas en zonas rurales o estructuras metálicas desprovistas de señal celular.
* **Arquitectura:** Aplicación Web Progresiva instalable en smartphones Android/iOS con almacenamiento indexado local en **IndexedDB (Dexie.js)**.
* **Capacidades:**
  * Registro de inspecciones y captura fotográfica sin conexión a Internet.
  * Sincronización bidireccional automática en segundo plano al recuperar señal 3G/4G/Wi-Fi.
  * Interfaz de alto contraste adaptada para visibilidad bajo luz solar extrema en torre.
  * Cero riesgo de pérdida de datos ante apagado fortuito del terminal móvil.
* **Referencia Visual:** `docs/assets/modulo1-pwa-campo.png` (Terminal de captura de órdenes de trabajo, almacén Dexie local y progreso de slots).

#### 2. Módulo Matriz Técnica Homologada de 48 Zonas de Inspección
* **Objetivo:** Estandarizar la revisión técnica exhaustiva exigida por las operadoras de telecomunicaciones (Digitel, Movistar, Cantv).
* **Alcance de los 5 Subsistemas:**
  1. *Estructura y Torre:* Verticalidad, balizamiento nocturno, anclajes, guías de onda y cableado coaxial.
  2. *Shelter y Climatización:* Sellado perimetral, estado de motocompresores y termostatos duales A/C.
  3. *Energía DC y Respaldo:* Rectificadores, inversores y bancos de baterías de ciclo profundo.
  4. *Radiofrecuencia y Transmisión:* Jumpers, antenas sectoriales, enlaces de microondas y fibra óptica.
  5. *Aterramiento y Seguridad:* Anillo de tierra perimetral, pararrayos y cerco perimetral.
* **Lógica Operativa:** Cada zona evalúa estados normalizados (`NORMAL`, `ALARMA`, `FALLA`) con campos obligatorios de justificación técnica.

#### 3. Módulo Motor Fotográfico Inteligente Antes / Después (Regla Antifraude)
* **Objetivo:** Erradicar el reciclaje fraudulento de fotografías antiguas y certificar fehacientemente la subsanación de fallas en sitio.
* **Mecanismo de Bloqueo:** El sistema bloquea de manera estricta la captura de la evidencia de solución ("DESPUÉS") hasta que exista una fotografía registrada del estado inicial ("ANTES") en ese slot específico.
* **Estampado Forense en Canvas:** Cada imagen se procesa en el cliente incrustando una marca de agua indeleble que incluye: Coordenadas GPS satelitales, fecha y hora atómica (UTC), código oficial de la radiobase y nombre del técnico.
* **Compresión WebP Ultraliviana:** Reducción automática a archivos de 150 a 250 KB por fotografía, logrando un ahorro de más del 85% de datos móviles respecto a imágenes JPEG tradicionales.

#### 4. Módulo Centro de Control NOC y Consola de Supervisión QA
* **Objetivo:** Centralizar la gestión operativa, validación de calidad y control de cuadrillas para directores y supervisores.
* **Capacidades:**
  * **Bandeja QA Foto a Foto:** Aprobación o rechazo individual motivado de cada fotografía antes de emitir actas.
  * **Geofencing Perimetral Satelital:** Validación automática de proximidad que impide o alerta disparos fotográficos a más de 100 metros del sitio oficial.
  * **Control de SLAs:** Monitoreo en vivo de tiempos de atención por orden de trabajo.
  * **Gestión de Cuadrillas:** Asignación dinámica de radiobases y permisos por técnico.

#### 5. Módulo Motor de Emisión de Actas Oficiales y Expedientes PDF Homologados
* **Objetivo:** Automatizar la generación de expedientes técnicos en formato A4 listos para radicar y cobrar de inmediato ante las operadoras.
* **Estructura Documental:**
  * Portada formal con logotipo del contratista, datos de la estación y fecha de auditoría.
  * Matriz técnica resumida de las 48 zonas con desglose de criticidades.
  * Galería fotográfica de alta resolución con disposición par Antes/Después y estampas de agua.
  * Bloque de firmas legalmente vinculante con huella digital SHA-256 del dictamen.
  * Código QR de verificación pública de autenticidad.

#### 6. Módulo Bitácora Forense y Trazabilidad Criptográfica SHA-256 (Compliance)
* **Objetivo:** Proveer un registro inmutable append-only con valor probatorio pericial ante disputas comerciales o auditorías regulatorias.
* **Arquitectura FIPS 180-4:** Cada evento operativo (login, captura, cambio de matriz, aprobación QA, bloqueo de geocerca) computa su hash encadenado al bloque previo:
  $$\text{Hash}_{\text{Actual}} = \text{SHA-256}(\text{Hash}_{\text{Previo}} + \text{Payload})$$
* **Herramientas de Auditoría:**
  * Botón interactivo de validación matemática en tiempo real (100% libre de manipulaciones).
  * Registro indeleble de disparos bloqueados por fraude de geocerca (> 100m).
  * Exportación de libros mayores en formato CSV y JSON forense.

---

### CLÁUSULA TERCERA: RÉGIMEN DE PROPIEDAD INTELECTUAL Y RESERVA DE CÓDIGO FUENTE
Queda expresamente estipulado entre las partes que **LA TOTALIDAD DEL CÓDIGO FUENTE, ARQUITECTURA DE SOFTWARE, DISEÑO, ALGORITMOS DE COMPRESIÓN, MODELOS DE DATOS Y DERECHOS DE AUTOR MORALES Y PATRIMONIALES** de la plataforma SISBIRCECA son y continuarán siendo de la **PROPIEDAD ÚNICA Y EXCLUSIVA DEL PROVEEDOR**.

> **RESERVA EXPRESA DE DERECHOS:** En ningún momento el presente contrato constituye venta de software, cesión de activos intangibles ni transferencia de propiedad intelectual. **EL PROVEEDOR NO ENTREGARÁ CÓDIGO FUENTE** ni accesos a repositorios de desarrollo. **LA EMPRESA** se compromete a no intentar descompilar, realizar ingeniería inversa, copiar, duplicar, ceder, transferir ni comercializar el software a terceros bajo pena de indemnización por daños y perjuicios.

---

### CLÁUSULA CUARTA: OTORGAMIENTO DE LICENCIA DE USO (EULA B2B)
En virtud del cumplimiento de los pagos acordados, **EL PROVEEDOR** otorga a **LA EMPRESA** una **LICENCIA DE USO COMERCIAL, NO EXCLUSIVA, INTRANSFERIBLE Y TEMPORAL** para acceder y operar la plataforma únicamente en sus operaciones ordinarias internas, con un límite inicial de hasta diez (10) usuarios técnicos/administrativos concurrentes.

---

### CLÁUSULA QUINTA: CONDICIONES ECONÓMICAS Y DESGLOSE CLOUD (GOOGLE CLOUD PLATFORM)

El régimen financiero del presente acuerdo se divide en la tarifa de implementación inicial y el canon mensual de infraestructura y soporte:

#### A. Tarifa Única de Parametrización, Implementación y Puesta en Marcha (Setup Fee)
Por la configuración inicial, parametrización de catálogos, despliegue del servidor en la nube y capacitación del personal, **LA EMPRESA** abonará la cantidad fija de **UN MIL SEISCIENTOS CINCUENTA DÓLARES AMERICANOS ($1,650.00 USD)**, liquidada mediante el siguiente cronograma de pagos:

| Hito de Facturación | Condición de Exigibilidad | Porcentaje | Monto (USD) |
| :--- | :--- | :---: | :---: |
| **1. Anticipo Inicial de Firma** | A la firma y suscripción del presente contrato (Kick-off). | 33.33% | **$550.00** |
| **2. Entrega Funcional en Staging** | A la demostración de la PWA offline, matriz de 48 zonas y flujo Antes/Después en ambiente de pruebas. | 33.33% | **$550.00** |
| **3. Pase a Producción y Cierre** | A la activación del sistema en el servidor final en producción y culminación de las sesiones de capacitación. | 33.34% | **$550.00** |
| **TOTAL SETUP E IMPLEMENTACIÓN:** | **Listo para operar** | **100.00%** | **$1,650.00 USD** |

#### B. Canon Mensual de Servicio Integral y Desglose de Google Cloud Platform (GCP)
A partir de la puesta en producción y tras expirar los primeros treinta (30) días de garantía técnica gratuita, **LA EMPRESA** pagará un canon mensual vencido y cerrado de **CIENTO VEINTE DÓLARES AMERICANOS ($120.00 USD / mes)**.

Para garantizar disponibilidad del 99.9% y soberanía sobre los datos, la plataforma se despliega en centros de datos Tier-3 de Google Cloud en Estados Unidos (Iowa / Carolina del Sur). A continuación se transparenta la matriz de costos directos de infraestructura y el servicio gestionado:

| Componente Google Cloud (GCP) | Métrica de Consumo Mensual | Función en el Sistema | Costo Nube (USD/mes) |
| :--- | :--- | :--- | :---: |
| **Google Cloud Run (Serverless)** | 1 vCPU, 1 GB RAM, ~100k requests/mes | Ejecución de Next.js PWA, API REST y generación de PDFs | **$15.00** |
| **Google Cloud SQL for PostgreSQL** | Instancia db-f1-micro / e2-micro (20 GB SSD) | Base de datos relacional ACID, 48 zonas, bitácora forense | **$18.50** |
| **Google Cloud Storage (GCS Bucket)** | Multi-Regional Standard (~3.5 GB para 15k fotos WebP) | Almacenamiento redundante de evidencias fotográficas | **$2.50** |
| **Cloud Armor, Cloud DNS y Red** | Zona DNS + Tráfico saliente (< 20 GB/mes) | Dominio institucional y certificados SSL TLS 1.3 gestionados | **$2.50** |
| **Cloud Logging & Monitoring** | Retención 30 días (< 50 GB log allowance) | Telemetría en tiempo real y alertas automáticas al NOC | **$1.50** |
| **SUBTOTAL INFRAESTRUCTURA DIRECTA GOOGLE CLOUD:** | **Consumo neto de servidores** | **Garantía de rendimiento Tier-3** | **$40.00 USD** |
| **Servicio Gestionado DevOps y Soporte L2:** | **Administración 24/7, parches de seguridad, rotación de claves criptográficas, backups off-site diarios y soporte técnico.** | | **$80.00 USD** |
| **CANON TOTAL FACTURADO A LA EMPRESA:** | **Tarifa plana mensual todo incluido** | | **$120.00 USD / mes** |

> **CLÁUSULA DE SALVAGUARDA DE COSTOS CLOUD:** La tarifa plana de $120.00 USD ampara con holgura las operaciones normales de hasta diez (10) técnicos concurrentes, 15,000 fotografías activas en la nube y 20 GB de transferencia mensual. En el supuesto de que **LA EMPRESA** aumente significativamente su flota de cuadrillas o exceda dichos umbrales operativos, el costo excedente de Google Cloud será facturado de manera transparente al costo neto estipulado en la factura oficial de GCP más un quince por ciento (15%) por concepto de gastos administrativos y de gestión.

#### C. Régimen de Soporte Técnico Ocasional / Bajo Demanda (Sin Póliza Mensual)
En caso de que **LA EMPRESA** decida no acogerse al Canon Mensual de Servicio Integral o este sea rescindido, el software continuará operando de manera autónoma bajo exclusiva custodia de LA EMPRESA. Cualquier requerimiento futuro de asistencia técnica, diagnóstico, restauración de respaldos o resolución de incidencias será provisto bajo la modalidad **Bajo Demanda (Ad-Hoc)**, sujeto a las siguientes condiciones:
* **Tarifa Horaria Estándar:** **CUARENTA DÓLARES AMERICANOS ($40.00 USD) por hora hombre** para intervenciones en días laborables y horario diurno (Lunes a Viernes, 8:00 AM a 5:00 PM).
* **Tarifa de Emergencia / Horario Inhábil:** **CINCUENTA DÓLARES AMERICANOS ($50.00 USD) por hora hombre** para requerimientos en horario nocturno, fines de semana o días feriados.
* **Cargo Mínimo Facturable:** Toda solicitud bajo demanda devengará un cargo mínimo de **dos (2) horas de servicio** ($80.00 USD en horario hábil / $100.00 USD en horario inhábil).
* **Tiempo de Respuesta (SLA Ocasional):** Al no existir disponibilidad reservada, la respuesta técnica se estima en un lapso de **24 a 48 horas laborables**.
* **Condición de Pago:** Las solicitudes bajo demanda deberán ser canceladas de contado antes o inmediatamente después de ejecutada la intervención.

---

### CLÁUSULA SEXTA: CRONOGRAMA DE EJECUCIÓN Y ENTREGABLES
El plazo total para la puesta en marcha definitiva es de **tres (3) a cuatro (4) semanas** contadas a partir de la recepción del anticipo inicial, estructurándose en tres fases:
* **Fase I (Semana 1):** Despliegue de infraestructura en Google Cloud, configuración de base de datos relacional y parametrización de catálogos y 48 zonas.
* **Fase II (Semana 2):** Puesta a punto de la PWA móvil offline, verificación de compresión fotográfica WebP y pruebas de sincronización en campo.
* **Fase III (Semana 3-4):** Activación en producción con dominio institucional y certificado SSL, dos (2) sesiones de capacitación formal al personal y firma del acta de recepción.

---

### CLÁUSULA SÉPTIMA: GARANTÍA TÉCNICA Y ACUERDO DE SERVICIO (SLA)
**EL PROVEEDOR** concede una **Garantía de Estabilidad de treinta (30) días continuos** a partir de la firma del acta de entrega en producción. Durante este lapso, cualquier desperfecto o error de programación (bug) con respecto al alcance pactado será subsanado sin costo adicional. Para fallas de criticidad alta (sistema inoperativo), el tiempo máximo de respuesta técnica garantizado será menor a cuatro (4) horas laborables.

---

### CLÁUSULA OCTAVA: EXONERACIÓN TOTAL POR MANIPULACIÓN O INTERVENCIÓN NO AUTORIZADA
Queda expresamente convenido que si **LA EMPRESA**, sus empleados o terceros no autorizados acceden al servidor, manipulan archivos de código fuente, ejecutan sentencias manuales en la base de datos PostgreSQL, alteran configuraciones del contenedor Docker o vulneran componentes de la plataforma:
* **a)** Cesará de forma automática e irrevocable toda garantía técnica y soporte ofrecido por **EL PROVEEDOR**.
* **b)** **EL PROVEEDOR quedará 100% exonerado de cualquier responsabilidad** por errores de cálculo, inconsistencias en reportes, caída del servicio o pérdida de información y fotografías.
* **c)** Cualquier asistencia técnica para auditar o restaurar el sistema tras una alteración no autorizada se facturará bajo tarifa de emergencia a razón de **CINCUENTA DÓLARES AMERICANOS ($50.00 USD) por hora hombre**, previa aprobación de fondos por parte de **LA EMPRESA**.

---

### CLÁUSULA NOVENA: DESLINDE DE RESPONSABILIDAD OPERATIVA, LUCRO CESANTE Y LÍMITE MÁXIMO INDEMNIZATORIO (LIABILITY CAP)
El software SISBIRCECA se suministra como una herramienta informática de asistencia técnica y gestión de campo:
1. **Inexistencia de Responsabilidad por Sanciones Externas:** **EL PROVEEDOR** no asume responsabilidad alguna por multas, penalizaciones contractuales, retrasos de pago o reclamos que terceros, operadoras de telefonía móvil (Digitel, Movistar, Cantv, Movilnet) o entes regulatorios impongan a **LA EMPRESA** con motivo de sus trabajos de campo o reportes.
2. **Exclusión de Lucro Cesante:** En ningún caso **EL PROVEEDOR** responderá por lucro cesante, pérdidas comerciales, daño emergente o pérdidas de ingresos derivadas del uso o imposibilidad de uso del software.
3. **Límite Máximo Indemnizatorio:** En el supuesto no consentido de que un tribunal determine alguna responsabilidad imputable a **EL PROVEEDOR**, la responsabilidad patrimonial máxima acumulada frente a **LA EMPRESA** estará expresamente limitada al monto total efectivamente percibido por la Tarifa de Setup inicial ($1,650.00 USD), renunciando **LA EMPRESA** a reclamar cualquier monto superior.

---

### CLÁUSULA DÉCIMA: ENTREGA DEFINITIVA, RECEPCIÓN "TAL CUAL" (AS-IS) Y CESE DE OBLIGACIONES
Una vez cumplido el plazo de garantía técnica de treinta (30) días y suscrita el Acta de Recepción Final en producción:
> **ENTREGA DEFINITIVA:** El software se considerará formalmente aceptado a entera satisfacción de **LA EMPRESA** en su estado "TAL CUAL" (*AS-IS*). A partir de dicho momento, **EL PROVEEDOR se considerará completamente desvinculado de la operación técnica, comercial y laboral de LA EMPRESA**, no existiendo obligación de permanencia, asesoría, soporte ni desarrollos adicionales, salvo suscripción de adendas contractuales independientes. En caso de que LA EMPRESA no contrate el servicio de hosting y soporte mensual, la custodia de la infraestructura, respaldos y mantenimiento recaerá bajo la exclusiva responsabilidad de **LA EMPRESA**.

---

### CLÁUSULA UNDÉCIMA: EXCLUSIONES Y CONDICIONES DE OPERACIÓN
No forman parte de las obligaciones del PROVEEDOR: la entrega de hardware (dispositivos celulares o computadoras), la contratación de planes de datos celulares para los técnicos, la recuperación de fotos borradas voluntariamente por los técnicos en sus teléfonos móviles, ni desarrollos a la medida no tipificados en el Core Operativo.

---

### CLÁUSULA DUODÉCIMA: CONFIDENCIALIDAD DE DATOS OPERATIVOS
**EL PROVEEDOR** se compromete a guardar estricta confidencialidad respecto a la información operativa, nombres de radiobases, clientes y evidencias fotográficas ingresadas por **LA EMPRESA** en la plataforma, las cuales son de propiedad exclusiva de **LA EMPRESA**.

---

### CLÁUSULA DÉCIMO TERCERA: CONFORMIDAD Y FIRMAS
En prueba de plena conformidad con todas y cada una de las cláusulas del presente contrato, las partes lo suscriben en dos (2) ejemplares de idéntico tenor y efecto, a los ____ días del mes de Octubre del año 2026.

```
___________________________________           ___________________________________
POR EL PROVEEDOR TECNOLÓGICO                  POR LA EMPRESA CONTRATANTE
Nombre: ___________________________           Razón Social: _____________________
C.I. / RIF: _______________________           RIF / Registro: ___________________
Cargo: Titular & Arquitecto SISBIRCECA        Representante: ____________________
                                              C.I.: _____________________________
```
