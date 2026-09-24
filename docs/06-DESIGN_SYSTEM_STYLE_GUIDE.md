# 06-DESIGN_SYSTEM_STYLE_GUIDE: SISTEMA DE DISEÑO DUAL, TOKENS Y ESTÉTICA INDUSTRIAL

## 1. Estado Real Detectado (Código Actual)
- **Base Técnica:** Tailwind CSS configurado con colores básicos `brand-purple` (`#30235F`) y `brand-green` (`#009444`).
- **Problema Detectado:**
  - El diseño visual previo trataba todas las pantallas con la misma plantilla genérica blanca/gris.
  - La herramienta de campo ([`/mobile`](file:///c:/Users/luiserr/Videos/gerson-sisbirceca/src/app/mobile/page.tsx), [`/campo`](file:///c:/Users/luiserr/Videos/gerson-sisbirceca/src/app/campo/page.tsx)) carecía de la estética de herramienta de grado industrial para trabajo en torre (alto contraste para sol directo, botones táctiles masivos ≥ 48px, indicador de batería/red, estados hápticos).
  - El panel administrativo ([`/admin/dashboard`](file:///c:/Users/luiserr/Videos/gerson-sisbirceca/src/app/admin/dashboard/page.tsx)) carecía de la densidad de datos B2B requerida para control gerencial (secciones con demasiado espacio vacío y métricas poco contextualizadas).
  - La bandeja de supervisión ([`/supervisor`](file:///c:/Users/luiserr/Videos/gerson-sisbirceca/src/app/supervisor/page.tsx)) requería una atmósfera de laboratorio de inspección visual de precisión con lupa y comparativa de píxeles lado a lado.

## 2. Nuevos Requerimientos a Integrar (Nuevo Brief de Diseño)
- **Declaración de Inferencia de Diseño (Design Read Oficial):**
  > *"Dual-Surface Industrial Telecom Platform for infrastructure executives, QA supervisors, and field tower operators, with a Precision Industrial & High-Trust Telecom language, using corporate tokens (#30235F & #009444), strict WCAG AAA sunlight readability for field operators, and dense B2B data telemetry for administrators."*

- **Configuración de Diales por Superficie:**
  ### Superficie 1: Panel Administrativo & Bandeja QA (Desktop/Tablet)
  - `DESIGN_VARIANCE: 5` (Modular, simétrico, profesional, sin sorpresas visuales).
  - `MOTION_INTENSITY: 3` (Microinteracciones funcionales de 150ms `ease-out`, cero distracciones ni rebotes).
  - `VISUAL_DENSITY: 8` (Alta densidad: tablas compactas tipo Excel, filtros inmediatos sin wizards, KPIs compactos).

  ### Superficie 2: Herramienta de Campo PWA (Móvil en Torre)
  - `DESIGN_VARIANCE: 2` (Rígido, predecible, a prueba de fallos operativos).
  - `MOTION_INTENSITY: 1` (Transiciones instantáneas para maximizar batería y fluidez en teléfonos modestos).
  - `VISUAL_DENSITY: 5` (Botones de acción de ≥ 48px, textos grandes con contraste reforzado WCAG AAA ≥ 7:1, slots fotográficos claramente correlativos).

## 3. Expectativas Arquitectónicas y Estándares de Producción
- **Arquitectura de Color y Tokens Semánticos:**
  - `brand-purple-900`: `#30235F` (Identidad institucional, encabezados de auditoría, barra principal).
  - `brand-purple-950`: `#1E153C` (Superficie oscura para paneles ejecutivos nocturnos o de control NOC).
  - `brand-green-500`: `#009444` (Color primario de acción telecom, captura completada, aprobación visual).
  - `telecom-amber`: `#F79009` (Observación técnica, corrección pendiente).
  - `telecom-red`: `#D92D20` (Rechazo técnico, foto desenfocada, slot bloqueado).
  - `telecom-slate-canvas`: `#F8FAFC` (Lienzo técnico limpio, frío, sin tonos crema de IA).
- **Tipografía y Legibilidad:**
  - Fuente sans-serif de interfaz con excelente hinting (`Inter`, `-apple-system`, `system-ui`).
  - Fuente monoespaciada para datos duros (`JetBrains Mono`, `Consolas`, `monospace`) para: Coordenadas GPS, IPs, VLAN IDs, números de serie y hashes SHA-256.
- **Directivas Anti-Slop (Gobernanaza Impeccable):**
  - Cero gradientes en títulos de texto (`bg-clip-text` prohibido).
  - Cero bordes decorativos laterales sin función (`border-l-4` decorativo prohibido).
  - Cero tarjetas anidadas dentro de tarjetas (`cards-inside-cards`).
  - Cero fondos crema o pergamino (`cream/parchment`).

## 4. BRECHA ARQUITECTÓNICA Y NUEVOS GOALS PARA EL MASTER LOOP
- [ ] [DES-01] Extender `tailwind.config.ts` y `globals.css` con variables CSS de tokens de alto contraste exterior e industrial. (`tailwind.config.ts`, `src/app/globals.css`)
- [ ] [DES-02] Rediseñar el Portal de Campo `/campo` con estética de tableta/terminal industrial rugerizada. (`src/app/campo/page.tsx`)
- [ ] [DES-03] Optimizar la PWA `/mobile` con modo de alto contraste para luz solar directa, slots correlativos masivos y candados reactivos en fotos "Después". (`src/app/mobile/page.tsx`)
- [ ] [DES-04] Elevar la densidad visual del Dashboard Gerencial `/admin/dashboard` a estándar B2B de centro de control telecom (KPIs densos, tablas con zebra striping y estado de celdas). (`src/app/admin/dashboard/page.tsx`)
- [ ] [DES-05] Transformar la bandeja `/supervisor` en un estudio óptico de validación visual con zoom comparativo e inspección de píxeles. (`src/app/supervisor/page.tsx`)
