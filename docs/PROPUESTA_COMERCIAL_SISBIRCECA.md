# CONTRATO MARCO DE PRESTACIÓN DE SERVICIOS TECNOLÓGICOS, PARAMETRIZACIÓN Y LICENCIAMIENTO DE SOFTWARE

**REFERENCIA DOCUMENTAL:** CONTRATO-SISBIRCECA-2026-001  
**MODALIDAD:** Instrumento Privado de Licenciamiento Comercial (B2B)  
**FECHA:** Octubre de 2026  
**ESTADO:** Oficial / Vinculante  

---

Entre las partes que a continuación se identifican: por una parte, **EL PROVEEDOR TECNOLÓGICO**, en pleno ejercicio de sus derechos morales y patrimoniales de autor sobre el software **SISBIRCECA**; y por la otra parte, **LA EMPRESA CONTRATANTE**, entidad jurídica dedicada a la prestación de servicios de infraestructura y mantenimiento en telecomunicaciones, se conviene en celebrar el presente Contrato de Servicios Tecnológicos y Licenciamiento Comercial, el cual se regirá por las siguientes cláusulas:

---

### CLÁUSULA PRIMERA: OBJETO DEL CONTRATO
El presente contrato tiene por objeto regular los términos y condiciones bajo los cuales **EL PROVEEDOR** ejecutará los servicios de configuración, parametrización técnica y puesta en producción del sistema informático **SISBIRCECA** (Sistema de Información para la Supervisión y Generación de Reportes Técnicos de Radiobases), así como el otorgamiento a **LA EMPRESA** de una Licencia de Uso Comercial para su explotación operativa en inspecciones de infraestructura de telecomunicaciones.

---

### CLÁUSULA SEGUNDA: ALCANCE TÉCNICO Y MÓDULOS INCLUIDOS (CORE OPERATIVO)
El sistema aprovisionado y puesto en marcha comprende estrictamente los siguientes componentes funcionales garantizados:

1. **Aplicación Web Progresiva (PWA Móvil de Campo):** Aplicación instalable en teléfonos inteligentes con arquitectura de almacenamiento local indexado (Dexie.js / IndexedDB), diseñada para operar al 100% en zonas remotas desprovistas de cobertura celular (Modo Offline).
2. **Matriz Técnica Homologada de 48 Zonas:** Formulario técnico de inspección con registro de estados estandarizados (`NORMAL`, `ALARMA`, `FALLA`) y campo descriptivo de incidencias.
3. **Motor Fotográfico Inteligente y Regla "Antes vs. Después":** Bloqueo programático que supedita la captura de la evidencia de solución a la preexistencia obligatoria de la foto del estado inicial. Incluye algoritmo de compresión WebP en el dispositivo móvil (< 250 KB por fotografía) para minimización de consumo de datos celulares.
4. **Consola Administrativa y Bandeja QA de Supervisión:** Portal web centralizado para supervisores con flujo de validación foto por foto, emisión de observaciones técnicas y control de estados (`BORRADOR`, `EN_REVISION`, `APROBADO` y `OBSERVADO`).
5. **Motor de Emisión de Actas Oficiales en PDF:** Generación instantánea a un clic de actas técnicas homologadas y expedientes fotográficos maquetados en formato A4 listos para facturación y cobro ante el operador de telecomunicaciones contratante.
6. **Seguridad y Perfiles de Acceso (RBAC):** Control de acceso criptográfico mediante tokens de sesión y asignación de dos (2) roles canónicos: Técnicos de Campo y Administradores/Supervisores.

---

### CLÁUSULA TERCERA: RÉGIMEN DE PROPIEDAD INTELECTUAL Y RESERVA DE CÓDIGO FUENTE
Queda expresamente estipulado entre las partes que **LA TOTALIDAD DEL CÓDIGO FUENTE, ARQUITECTURA DE SOFTWARE, DISEÑO, ALGORITMOS DE COMPRESIÓN, MODELOS DE DATOS Y DERECHOS DE AUTOR MORALES Y PATRIMONIALES** de la plataforma SISBIRCECA son y continuarán siendo de la **PROPIEDAD ÚNICA Y EXCLUSIVA DEL PROVEEDOR**.

> **RESERVA EXPRESA DE DERECHOS:** En ningún momento el presente contrato constituye venta de software, cesión de activos intangibles ni transferencia de propiedad intelectual. **EL PROVEEDOR NO ENTREGARÁ CÓDIGO FUENTE** ni accesos a repositorios de desarrollo. **LA EMPRESA** se compromete a no intentar descompilar, realizar ingeniería inversa, copiar, duplicar, ceder, transferir ni comercializar el software a terceros bajo pena de indemnización por daños y perjuicios.

---

### CLÁUSULA CUARTA: OTORGAMIENTO DE LICENCIA DE USO (EULA B2B)
En virtud del cumplimiento de los pagos acordados, **EL PROVEEDOR** otorga a **LA EMPRESA** una **LICENCIA DE USO COMERCIAL, NO EXCLUSIVA, INTRANSFERIBLE Y TEMPORAL** para acceder y operar la plataforma únicamente en sus operaciones ordinarias internas, con un límite inicial de hasta diez (10) usuarios técnicos/administrativos concurrentes.

---

### CLÁUSULA QUINTA: CONDICIONES ECONÓMICAS Y FORMA DE PAGO
El régimen financiero del presente acuerdo se divide en dos conceptos claramente diferenciados:

#### A. Tarifa Única de Parametrización, Implementación y Puesta en Marcha (Setup Fee)
Por la configuración inicial, parametrización de catálogos, despliegue del servidor en la nube y capacitación del personal, **LA EMPRESA** abonará la cantidad fija de **UN MIL SEISCIENTOS CINCUENTA DÓLARES AMERICANOS ($1,650.00 USD)**, liquidada mediante el siguiente cronograma de pagos:

| Hito de Facturación | Condición de Exigibilidad | Porcentaje | Monto (USD) |
| :--- | :--- | :---: | :---: |
| **1. Anticipo Inicial de Firma** | A la firma y suscripción del presente contrato (Kick-off). | 33.33% | **$550.00** |
| **2. Entrega Funcional en Staging** | A la demostración de la PWA offline, matriz de 48 zonas y flujo Antes/Después en ambiente de pruebas. | 33.33% | **$550.00** |
| **3. Pase a Producción y Cierre** | A la activación del sistema en el servidor final en producción y culminación de las sesiones de capacitación. | 33.34% | **$550.00** |
| **TOTAL SETUP E IMPLEMENTACIÓN:** | **Listo para operar** | **100.00%** | **$1,650.00 USD** |

#### B. Canon Mensual de Servicio Integral (Licenciamiento, Nube y Soporte)
A partir de la puesta en producción y tras expirar los primeros treinta (30) días de garantía técnica gratuita, **LA EMPRESA** pagará un canon mensual vencido y no reembolsable de **CIENTO VEINTE DÓLARES AMERICANOS ($120.00 USD / mes)**, el cual ampara:
* Licencia de uso activa ininterrumpida de la PWA móvil y Consola NOC para hasta 10 usuarios.
* Costo del servidor en la nube de alta disponibilidad y bases de datos relacionales PostgreSQL.
* Respaldos automatizados diarios de datos e imágenes para contingencias ante pérdidas de información.
* Capacidad de almacenamiento en la nube de hasta 15,000 fotografías de evidencias técnicas.
* Mantenimiento preventivo de software y soporte técnico especializado Nivel 2.

#### C. Régimen de Soporte Técnico Ocasional / Bajo Demanda (Sin Póliza Mensual)
En caso de que **LA EMPRESA** decida no acogerse al Canon Mensual de Servicio Integral o este sea rescindido, el software continuará operando de manera autónoma bajo exclusiva custodia de LA EMPRESA. Cualquier requerimiento futuro de asistencia técnica, diagnóstico, restauración de respaldos, configuración o resolución de incidencias será provisto bajo la modalidad **Bajo Demanda (Ad-Hoc)**, sujeto a las siguientes condiciones:
* **Tarifa Horaria Estándar:** **CUARENTA DÓLARES AMERICANOS ($40.00 USD) por hora hombre** para intervenciones en días laborables y horario diurno (Lunes a Viernes, 8:00 AM a 5:00 PM).
* **Tarifa de Emergencia / Horario Inhábil:** **CINCUENTA DÓLARES AMERICANOS ($50.00 USD) por hora hombre** para requerimientos en horario nocturno, fines de semana o días feriados.
* **Cargo Mínimo Facturable:** Toda solicitud de intervención técnica bajo demanda devengará un cargo mínimo de **dos (2) horas de servicio** ($80.00 USD en horario hábil / $100.00 USD en horario inhábil).
* **Tiempo de Respuesta (SLA Ocasional):** Al no existir una suscripción mensual activa con disponibilidad reservada, la atención técnica estará sujeta a la agenda del PROVEEDOR, estimándose una respuesta en un lapso de **24 a 48 horas laborables**.
* **Condición de Pago:** Las solicitudes bajo demanda deberán ser canceladas de contado antes o inmediatamente después de ejecutada la intervención.

---

### CLÁUSULA SEXTA: CRONOGRAMA DE EJECUCIÓN Y ENTREGABLES
El plazo total para la puesta en marcha definitiva es de **tres (3) a cuatro (4) semanas** contadas a partir de la recepción del anticipo inicial, estructurándose en tres fases:
* **Fase I (Semana 1):** Despliegue de la infraestructura de base de datos, configuración de catálogos y parametrización de las 48 zonas.
* **Fase II (Semana 2):** Puesta a punto de la PWA móvil offline, verificación de compresión fotográfica y pruebas de sincronización.
* **Fase III (Semana 3-4):** Activación en servidor de producción con certificado SSL HTTPS, dos (2) sesiones de capacitación formal al personal y firma de recepción.

---

### CLÁUSULA SÉPTIMA: GARANTÍA TÉCNICA Y ACUERDO DE SERVICIO (SLA)
**EL PROVEEDOR** concede una **Garantía de Estabilidad de treinta (30) días continuos** a partir de la firma del acta de entrega en producción. Durante este lapso, cualquier desperfecto, error de programación (bug) o incompatibilidad demostrada con el alcance pactado será subsanado sin costo adicional. Para fallas de criticidad alta (sistema inoperativo), el tiempo máximo de respuesta técnica garantizado será menor a cuatro (4) horas laborables.

---

### CLÁUSULA OCTAVA: EXONERACIÓN TOTAL POR MANIPULACIÓN, ALTERACIÓN O INTERVENCIÓN NO AUTORIZADA
Queda expresamente convenido que si **LA EMPRESA**, sus empleados, dependientes o cualquier tercero no autorizado accede al servidor, manipula o altera los archivos de código fuente, ejecuta sentencias o modificaciones manuales en la base de datos PostgreSQL, altera las configuraciones del contenedor Docker o vulnera los componentes de la plataforma:
* **a)** Cesará de forma inmediata, automática e irrevocable toda garantía técnica y soporte ofrecido por **EL PROVEEDOR**.
* **b)** **EL PROVEEDOR quedará 100% exonerado de cualquier responsabilidad** por errores de cálculo, inconsistencias en reportes, caída del servicio, corrupción de bases de datos o pérdida parcial o total de información y fotografías.
* **c)** Cualquier asistencia técnica requerida para auditar, reparar o restablecer el sistema tras una alteración no autorizada no estará cubierta por el presente contrato y se facturará bajo tarifa técnica extraordinaria de emergencia a razón de **CINCUENTA DÓLARES AMERICANOS ($50.00 USD) por hora hombre**, previa aprobación de fondos por parte de **LA EMPRESA**.

---

### CLÁUSULA NOVENA: DESLINDE DE RESPONSABILIDAD OPERATIVA, LUCRO CESANTE Y LÍMITE MÁXIMO INDEMNIZATORIO (LIABILITY CAP)
El software SISBIRCECA se suministra como una herramienta informática de asistencia técnica y gestión de campo:
1. **Inexistencia de Responsabilidad por Sanciones Externas:** **EL PROVEEDOR** no asume responsabilidad alguna por multas, penalizaciones contractuales, retrasos de pago, cancelaciones de contratos o reclamos que terceros, operadoras de telecomunicaciones (Digitel, Movistar, Cantv, Movilnet, entre otras) o entes regulatorios gubernamentales impongan a **LA EMPRESA** con motivo de sus trabajos de campo o la presentación de sus reportes.
2. **Exclusión de Lucro Cesante:** En ningún caso **EL PROVEEDOR** responderá por lucro cesante, pérdidas comerciales, daño emergente, pérdida de ingresos o daños indirectos derivados del uso o de la imposibilidad de uso del software.
3. **Límite Máximo Indemnizatorio:** En el supuesto no consentido de que un tribunal o autoridad competente determine alguna responsabilidad imputable a **EL PROVEEDOR**, la responsabilidad patrimonial máxima acumulada frente a **LA EMPRESA** estará expresamente limitada al monto total efectivamente percibido por **EL PROVEEDOR** por concepto de la Tarifa de Setup inicial ($1,650.00 USD), renunciando **LA EMPRESA** a reclamar cualquier indemnización superior.

---

### CLÁUSULA DÉCIMA: ENTREGA DEFINITIVA, RECEPCIÓN "TAL CUAL" (AS-IS) Y CESE DE OBLIGACIONES
Una vez cumplido el plazo de garantía técnica de treinta (30) días y suscrita el Acta de Entrega y Recepción Final en producción:
> **ENTREGA DEFINITIVA Y CESE DE VINCULACIÓN:** El software se considerará formalmente aceptado a entera y total satisfacción de **LA EMPRESA** en su estado "TAL CUAL" (*AS-IS*). A partir de dicho hito, **EL PROVEEDOR se considerará completamente desvinculado de la operación técnica, comercial y laboral de LA EMPRESA**, no existiendo obligación de permanencia, asesoría, soporte ni desarrollos adicionales, salvo que las partes suscriban una adenda contractual independiente. En caso de que LA EMPRESA no contrate el servicio de hosting y soporte mensual, la custodia integral de la infraestructura, respaldos de datos y mantenimiento del servidor recaerá bajo la exclusiva y única responsabilidad de **LA EMPRESA**.

---

### CLÁUSULA UNDÉCIMA: EXCLUSIONES Y CONDICIONES DE OPERACIÓN
No forman parte de las obligaciones del PROVEEDOR: la entrega de hardware (dispositivos celulares o computadoras), la contratación de planes de datos celulares para los técnicos, la recuperación de fotos borradas voluntariamente por los técnicos en sus teléfonos móviles, ni desarrollos a la medida no tipificados en el Core Operativo.

---

### CLÁUSULA DUODÉCIMA: CONFIDENCIALIDAD DE DATOS OPERATIVOS
**EL PROVEEDOR** se compromete a guardar estricta confidencialidad respecto a la información operativa, nombres de radiobases, clientes y evidencias fotográficas ingresadas por **LA EMPRESA** en la plataforma, las cuales son de propiedad exclusiva de **LA EMPRESA**.

---

### CLÁUSULA DÉCIMO TERCERA: SUSPENSIÓN POR MORA Y RESCISIÓN
En caso de acogerse al servicio mensual de hosting y soporte, la falta de pago del canon mensual por un lapso superior a quince (15) días continuos facultará al PROVEEDOR a suspender temporalmente el acceso a la plataforma hasta tanto se subsane la morosidad, sin que ello genere responsabilidad por lucro cesante.

---

### CLÁUSULA DÉCIMO CUARTA: CONFORMIDAD Y FIRMAS
En prueba de plena conformidad con todas y cada una de las cláusulas del presente contrato, las partes lo suscriben en dos (2) ejemplares de idéntico tenor y efecto, a los ____ días del mes de Octubre del año 2026.

```
___________________________________           ___________________________________
POR EL PROVEEDOR TECNOLÓGICO                  POR LA EMPRESA CONTRATANTE
Nombre: ___________________________           Razón Social: _____________________
C.I. / RIF: _______________________           RIF / Registro: ___________________
Cargo: Titular & Arquitecto SISBIRCECA        Representante: ____________________
                                              C.I.: _____________________________
```
