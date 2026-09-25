# Design System: SISBIRCECA Telecom Operations & Audit Suite (Versión Normal Oficial)

## 1. Visual Theme & Atmosphere
Una interfaz empresarial clara, pulcra y de alta confianza ("Versión Normal"), diseñada para operaciones reales de telecomunicaciones de misión crítica. Se erradican los clichés de inteligencia artificial (fondos oscuros azulados artificiales `#0A0F1D`, vidrios ahumados de ciencia ficción, neones púrpuras/cianes y orbes difusos). 

La estética se ancla en un diseño corporativo B2B sólido y sobrio (estándar Stripe / Linear / AWS Enterprise):
- **Lienzo Principal:** Claro y nítido (`bg-slate-50` / `bg-slate-100`).
- **Superficies y Tarjetas:** Blanco puro con bordes sutiles y sombra suave (`bg-white border border-slate-200 rounded-xl shadow-xs`).
- **Densidad Visual:** 8/10 (Cockpit B2B — matrices tabulares densas, telemetría monospace, filtros inmediatos).
- **Tipografía y Contraste:** Alto contraste para lectura bajo luz solar y oficinas (`text-slate-900` para títulos, `text-slate-500` / `text-slate-600` para metadatos).
- **Microinteracciones:** Transición táctil rápida (150ms `cubic-bezier(0.16, 1, 0.3, 1)` con `-1px` de presión física activa).

---

## 2. Paleta Cromática & Roles Funcionales

### Superficies & Neutros (Modo Claro Empresarial)
- **Canvas Base:** `bg-slate-50` (`#F8FAFC`) — Fondo limpio y libre de reflejos que elimina el tinte azulado artificial.
- **Superficie de Tarjeta:** `bg-white` (`#FFFFFF`) — Contenedor nítido para módulos, tablas y modales.
- **Borde Estructural:** `border-slate-200` (`#E2E8F0`) — Separadores y límites de contenedor de 1px.
- **Borde de Énfasis / Focus:** `border-blue-500` con `ring-blue-500/20`.
- **Texto Principal:** `text-slate-900` (`#0F172A`) — Encabezados, títulos de tarjeta y métricas clave.
- **Texto Secundario:** `text-slate-600` (`#475569`) — Etiquetas, cuerpos descriptivos y columnas secundarias.
- **Texto Terciario / Metadatos:** `text-slate-400` / `text-slate-500` (`#64748B`) — Timestamps, identificadores y notas.

### Acento Primario Único
- **Azul Telecom Oficial:** `bg-blue-600 hover:bg-blue-700 text-white` (`#2563EB`) — Botones primarios, acciones de guardado y navegación activa.
- **Píldora / Fondo de Acento:** `bg-blue-50 text-blue-700 border border-blue-200` — Badges de roles, pestañas activas e indicadores de ruta.

### Indicadores Semánticos de Estado (Pasteles Muted B2B)
- **Operativo / Aprobado (Emerald):** `bg-emerald-50 text-emerald-800 border border-emerald-200` (`#059669`).
- **Inspección / Observado (Amber):** `bg-amber-50 text-amber-800 border border-amber-200` (`#D97706`).
- **Alerta / Crítico (Rose):** `bg-rose-50 text-rose-800 border border-rose-200` (`#E11D48`).
- **Borrador / Neutro (Slate):** `bg-slate-100 text-slate-700 border border-slate-200`.

### Prohibiciones Explícitas de Color
- 🚫 **PROHIBIDO:** Fondos oscuros azulados artificiales estilo "maqueta IA" (`#0A0F1D`, `bg-slate-900/60`).
- 🚫 **PROHIBIDO:** Gradientes fluorescentes violeta/cian o paneles de vidrio falso con resplandores exteriores.
- 🚫 **PROHIBIDO:** Textos blancos sobre fondos ahumados translúcidos ilegibles en oficinas o torres.

---

## 3. Tipografía & Jerarquía
- **Títulos y Secciones:** Sans-Serif moderna del sistema (`Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`), tracking sutil (`tracking-tight`), peso `font-bold` a `font-extrabold`.
- **Datos & Telemetría (Monospace Obligatorio):** Todos los códigos de sitio, coordenadas GPS, hashes criptográficos SHA-256, direcciones IP y números de reporte DEBEN usar `font-mono`.
- **Prohibición de Emojis:** Cero emojis en botones, títulos y badges. Únicamente iconos SVG micro-precisos (14px–16px, trazo 2px).

---

## 4. Componentes

### Botones
- **Primario:** `bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-xs active:translate-y-[1px]`.
- **Secundario / Contorno:** `bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs px-3.5 py-2 rounded-lg shadow-xs`.
- **Peligro:** `bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium text-xs px-3 py-1.5 rounded-lg`.
- **Touch Target:** Mínimo 44px a 48px para ergonomía móvil y trabajo en torre con guantes.

### Tarjetas & Paneles
- Fondo blanco sólido `bg-white`, borde `border-slate-200`, esquinas `rounded-xl`, sombra suave `shadow-xs`.
- Divisores internos limpios `border-t border-slate-100`.

### Tablas & Rejillas de Datos
- **Encabezado:** `bg-slate-50 text-slate-600 text-[11px] font-mono uppercase font-semibold border-b border-slate-200`.
- **Filas:** `bg-white hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-slate-700`.
- **Zebra Striping Opcional:** Filas pares con `bg-slate-50/50`.

### Modales & Formularios
- Backdrop sutil semitransparente: `fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50`.
- Contenedor modal: `bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl text-slate-900`.
- Campos de texto: `bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`.

---

## 5. Reglas Anti-Clichés de IA
1. Cero pantallas con fondo `#0A0F1D` teñido de azul.
2. Cero orbes brillantes difuminados o sombras coloreadas de neón.
3. Cero emojis infantiles en botones técnicos.
4. Cero texto en gradiente (`bg-clip-text text-transparent`).
5. Copia técnica sobria: "Expediente Unificado", "Catálogo Homologado", "Sello Criptográfico HMAC-SHA256".
