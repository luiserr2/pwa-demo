# PROPUESTA COMERCIAL Y TÉCNICA OFICIAL
## IMPLEMENTACIÓN DE LA PLATAFORMA PWA DE REPORTES TÉCNICOS Y GESTIÓN DE RADIOBASES (SISBIRCECA)

**Documento:** Dossier Ejecutivo Técnico-Comercial  
**Versión:** 1.0 Oficial (Producción)  
**Fecha:** Octubre 2026  
**Vigencia:** 30 Días Calendario  
**Moneda:** USD (Dólares Americanos)  

---

### 1. RESUMEN EJECUTIVO Y DIAGNÓSTICO OPERATIVO

La supervisión, mantenimiento y homologación de infraestructura en torres celulares (monopolos urbanos, torres autosoportadas y repetidores) enfrenta en la actualidad fallas operativas críticas que encarecen el costo de operación y retrasan el flujo de facturación con las operadoras de telecomunicaciones:

* **El Problema Actual:**
  * Confección manual de reportes en hojas de cálculo (Excel) susceptibles a errores de tipeo y desactualización.
  * Desorden y pérdida de evidencias fotográficas distribuidas informalmente en grupos de mensajería (WhatsApp).
  * Demora de **3 a 5 días hábiles** entre la visita técnica y la consolidación del expediente final.
  * Riesgo latente de fraude por reciclaje de fotografías antiguas o falsificación de visitas presenciales.
  * Falta de soporte probatorio formal e inmutable ante auditorías de operadoras o entes reguladores.

* **La Solución Propuesta (SISBIRCECA):**
  * Aplicación Web Progresiva (PWA) de campo con capacidad de operación **100% offline** en torres remotas sin cobertura celular.
  * Compresión inteligente en el navegador del teléfono (< 250 KB por fotografía), reduciendo el consumo de datos móviles en un 78%.
  * Validación estricta con **bloqueo matemático "Antes vs. Después"** y verificación de perímetro por geocerca GPS (±100 metros).
  * Consolidación automática del informe técnico y generación del acta oficial en PDF maquetado en **menos de 5 minutos**.
  * Blindaje criptográfico con sellos determinísticos SHA-256 (FIPS 180-4) que garantizan que el informe no ha sido alterado.

> **Impacto y ROI:** El tiempo de gestión por torre se reduce de **4 horas de oficina a 5 minutos en campo**, acelerando la aprobación de trabajos y los tiempos de cobranza.

---

### 2. ALCANCE MODULAR DE LA PLATAFORMA

El sistema se estructura en **cuatro (4) módulos funcionales** complementarios:

#### MÓDULO 1: Herramienta PWA de Captura en Campo (Operaciones en Torre)
Diseñada específicamente para smartphones con botones ergonómicos (≥48px) para manipulación con guantes de seguridad industrial:
* **Modo Offline Resiliente (Dexie.js / IndexedDB):** Permite registrar la visita, fotos y datos sin internet. Los datos quedan almacenados de forma segura en el teléfono.
* **Compresión Inteligente WebP en Dispositivo:** Transforma capturas pesadas de 10 MB a archivos ligeros de alta nitidez menores a 250 KB.
* **Matriz Técnica de 48 Zonas:** Formulario estándar con selectores inmediatos de estado (`NORMAL`, `ALARMA`, `FALLA`) y campo descriptivo.
* **Inventario de Conectividad y Hardware:** Registro de equipos, switches, marcas, modelos y números de serie.
* **Regla de Bloqueo "Antes vs. Después":** El sistema bloquea la carga de la solución si previamente no existe la evidencia del problema.
* **Sincronización Automática:** Transmisión automática por lotes al detectar señal, purgando la memoria del teléfono solo tras confirmación del servidor.

#### MÓDULO 2: Consola de Control NOC y Seguimiento en Vivo (Supervisión Central)
Panel de control para directores de operaciones, coordinadores y supervisores de calidad:
* **Dashboard Central con Métricas en Tiempo Real:** Visualización del volumen de reportes por estado (`BORRADOR`, `EN_REVISION`, `APROBADO`, `OBSERVADO`).
* **Semáforo de SLA Operativo:** Contador regresivo con alerta visual al superar los 120 minutos estándar de revisión de cuadrilla.
* **Mapa Satelital Interactivo (Leaflet):** Mapa georreferenciado con todas las radiobases del parque de antenas y códigos de color por estado.
* **Bandeja QA de Aprobación/Rechazo:** Aprobación foto por foto con capacidad de ingresar notas técnicas obligatorias ante rechazos.
* **Expedientes Históricos por Radiobase:** Consulta cronológica de todas las intervenciones realizadas en un sitio a lo largo del tiempo.

#### MÓDULO 3: Motor de Auditoría, Criptografía y Certificación Legal (Compliance)
Mecanismos de respaldo forense para auditorías de operadoras y entes regulatorios:
* **Sellado Criptográfico SHA-256 (FIPS 180-4):** Cada imagen y reporte genera una huella matemática única. Cualquier edición posterior invalida el sello.
* **Geocerca Satelital GPS (±100 m):** Validación algorítmica de proximidad física a la torre en el momento del disparo.
* **Estampado Canvas Anti-Photoshop:** Impresión gráfica indeleble en los píxeles de la foto con coordenadas, fecha, hora, usuario y estación.
* **Generador de Dictamen y Acta PDF Oficial:** Exportación a un clic de actas en formato A4 con código QR de verificación pública, firmas y maquetación formal.
* **Bitácora de Auditoría Append-Only:** Registro inmutable en base de datos de quién aprobó, observó o modificó cada registro (usuario, IP y timestamp).

#### MÓDULO 4: Carga Masiva y Gestión de Catálogo de Activos (Administración)
* **Importador Masivo de Radiobases (Excel .xlsx y CSV):** Carga del inventario completo de sitios en un solo paso con validación de geocoordenadas.
* **Escaneo de Código de Barras / QR con la Cámara:** Lectura óptica directa desde el teléfono para números de serie de radios y equipos de energía.
* **Control de Acceso Basado en Roles (RBAC):** Jurisdicciones delimitadas estrictamente para Técnicos de Campo y Administradores NOC.

---

### 3. ENTREGABLES TÉCNICOS Y CAPACITACIÓN

La contratación bajo la modalidad **"Llave en Mano"** incluye:
1. **Plataforma Desplegada y Operativa:** Servidor en producción bajo contenedor Docker, con certificado de seguridad SSL (HTTPS) y dominio corporativo configurado.
2. **Base de Datos PostgreSQL 16 Normalizada:** Esquema relacional optimizado con rutina de respaldos automáticos diarios.
3. **Código Fuente Completo:** Repositorio Git privado con código estructurado en TypeScript, sin deuda técnica y con 34 pruebas automatizadas passing.
4. **Capacitación Operativa (2 Sesiones):**
   * *Sesión 1:* Inducción técnica a cuadrillas de campo sobre el uso de la PWA offline en smartphone.
   * *Sesión 2:* Capacitación a supervisores y jefes de proyecto sobre la consola NOC, filtros y emisión de actas PDF.
5. **Manuales de Usuario en PDF:** Guía ilustrada de campo y manual de administración del sistema.

**Exclusiones del Alcance:**
* Provisión de teléfonos inteligentes, tablets o computadoras de escritorio.
* Planes de datos o conectividad celular de las cuadrillas.
* Integraciones personalizadas con ERPs legados que no cuenten con APIs REST documentadas.

---

### 4. CRONOGRAMA DE EJECUCIÓN (4 A 5 SEMANAS)

| Fase / Semana | Hito Principal | Entregables Clave |
| :--- | :--- | :--- |
| **Semana 1** | **Fase 1: Configuración & Ingesta Masiva** | Base de datos PostgreSQL, importador Excel de radiobases y esquemas de validación de coordenadas. |
| **Semana 2** | **Fase 2: PWA de Campo & Escáner QR** | Almacenamiento offline IndexedDB, compresión WebP, regla Antes/Después y lector QR de activos. |
| **Semana 3** | **Fase 3: Consola NOC & Auditoría Forense** | Dashboard con métricas, mapa satelital Leaflet, semáforo SLA, tabla de auditoría inmutable y acta PDF con QR. |
| **Semana 4 - 5** | **Fase 4: Despliegue, Piloto & Capacitación** | Instalación en servidor de producción, prueba piloto con 2 cuadrillas en torre real, capacitación formal y firma de entrega. |

---

### 5. CONDICIONES ECONÓMICAS Y FORMA DE PAGO

#### A. Inversión de Implementación (Desarrollo y Puesta en Marcha)

| Concepto / Paquete de Trabajo | Horas Est. | Tarifa Hora | Total (USD) |
| :--- | :---: | :---: | :---: |
| **Hito 1: Ingesta Masiva & Escáner QR de Activos** | 24 hrs | $35 USD | $840.00 |
| **Hito 2: Consola NOC, Filtros Dinámicos & Webhooks** | 28 hrs | $35 USD | $980.00 |
| **Hito 3: Auditoría Append-Only & Certificación PDF** | 26 hrs | $35 USD | $910.00 |
| **Hito 4: Despliegue Cloud, CI/CD, SSL & Capacitación** | 18 hrs | $35 USD | $630.00 |
| **TOTAL IMPLEMENTACIÓN LLAVE EN MANO:** | **96 hrs** | — | **$3,360.00 USD** |

#### B. Forma de Pago por Hitos de Avance
* **Anticipo Inicial (30%):** **$1,008.00 USD** al firmar la orden de servicio e iniciar la Fase 1.
* **Pago Intermedio (30%):** **$1,008.00 USD** contra demostración funcional en staging de los Hitos 1 y 2 (Semana 3).
* **Finiquito de Cierre (40%):** **$1,344.00 USD** contra entrega del sistema en producción, capacitación al personal y firma del acta de recepción (Semana 5).

#### C. Costo Operativo Mensual de Infraestructura Cloud
Para la etapa inicial de hasta 10 usuarios concurrentes, el hosting y almacenamiento cloud tienen un costo estimado de **$20.00 a $45.00 USD mensuales** (facturados directamente por el proveedor de nube AWS o Google Cloud), incluyendo respaldos automatizados diarios y alta velocidad de transferencia.

---

### 6. GARANTÍA TÉCNICA Y NIVEL DE SERVICIO (SLA)

El servicio cuenta con una **Garantía Técnica de 30 días continuos** posteriores a la puesta en marcha definitiva en producción. Durante este plazo, cualquier falla, bug o desvío respecto a las especificaciones pactadas será corregido sin costo adicional, con un tiempo de respuesta garantizado menor a 4 horas laborables para incidencias críticas.

---

### 7. ACEPTACIÓN Y CONFORMIDAD

La firma del presente documento convalida la aceptación de los términos técnicos, cronograma y condiciones económicas expuestas:

```
___________________________________           ___________________________________
Por la Empresa Contratante                     Por el Equipo Consultor SISBIRCECA
Dirección de Operaciones / Infraestructura    Líder de Proyecto & Arquitectura Técnica
Fecha: ____ / ____ / 2026                     Fecha: ____ / ____ / 2026
```
