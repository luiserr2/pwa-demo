# Design System: SISBIRCECA Telecom Operations & Audit Suite

## 1. Visual Theme & Atmosphere
A high-trust, cockpit-dense enterprise interface engineered for mission-critical telecommunications infrastructure management and cryptographic field verification. The aesthetic fuses **Smoked Obsidian Glass** with rigorous B2B data density. It abandons juvenile AI tropes (neon gradients, floating orbs, decorative emojis) in favor of clinical precision, structural dividers, and razor-sharp typographic hierarchy.

- **Visual Density:** 8/10 (Cockpit Dense — compact data matrices, monospace telemetry, immediate filters, zero bloated empty space).
- **Layout Variance:** 5/10 (Balanced B2B with Asymmetric Bento Splits — eliminates repetitive 3-equal-card rows).
- **Motion Intensity:** 3/10 (Snappy Tactile Precision — 150ms `cubic-bezier(0.16, 1, 0.3, 1)`, -1px physical button depression, zero disorienting wobbles).

---

## 2. Color Palette & Functional Roles
Strict single-accent system anchored in neutral deep slate and smoked glass. All colors adhere to WCAG AAA/AA readability standards.

### Neutrals & Surfaces
- **Obsidian Canvas** (`#0A0F1D`) — Main deep canvas background. Eliminates eye strain and battery drain.
- **Smoked Glass Surface** (`rgba(15, 23, 42, 0.65)`) — Card and module background with `backdrop-blur-md`.
- **Subtle Surface Highlight** (`rgba(255, 255, 255, 0.03)`) — Secondary container fills and table header surfaces.
- **Structural Wire Border** (`rgba(255, 255, 255, 0.08)`) — 1px micro-dividers and container boundaries.
- **Text Crisp White** (`#F8FAFC`) — Primary headlines, key metrics, and high-contrast labels.
- **Text Muted Slate** (`#94A3B8`) — Secondary text, metadata, table column headers, and helper descriptions.
- **Text Subdued Steel** (`#64748B`) — Tertiary timestamps, inactive states, and unit annotations.

### Singular Accent (Max 1 Accent — Saturation < 80%)
- **Telecom Cobalt** (`#2563EB` / `rgb(37, 99, 235)`) — Primary action color, active route indicators, focus rings. Saturation: 76%.
- **Cobalt Muted Tint** (`rgba(37, 99, 235, 0.12)`) — Active pill indicators, selected state backgrounds.
- **Cobalt Micro-Border** (`rgba(37, 99, 235, 0.35)`) — Focus boundaries and interactive outline accents.

### Status Indicators (Functional Monochromatic Semantic Tokens)
- **Operational Emerald** (`#10B981`) — Completed status, active accounts, validated photos (`bg-emerald-500/10 border-emerald-500/25 text-emerald-400`).
- **Inspection Amber** (`#F59E0B`) — In-progress inspections, maintenance status (`bg-amber-500/10 border-amber-500/25 text-amber-400`).
- **Critical Rose** (`#F43F5E`) — Deletions, permanent destructive actions, rejected evidence (`bg-rose-500/10 border-rose-500/25 text-rose-400`).

### Explicit Color Bans
- 🚫 **BANNED:** Pure Black (`#000000`).
- 🚫 **BANNED:** AI Purple/Cyan Neon Gradient Orbs (`blur-[120px]` floating background blobs).
- 🚫 **BANNED:** Outer neon glow drop-shadows (`shadow-[0_0_20px_...]`).
- 🚫 **BANNED:** Multi-accent rainbow pollution (mixing purple, cyan, emerald, orange in the same view).

---

## 3. Typography Architecture
Typographic hierarchy is driven by font-weight, letter-spacing, and color contrast rather than monstrous headline sizing.

- **Display & Section Titles:** Clean Sans-Serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`), tracking tight (`tracking-tight`), `font-bold` to `font-extrabold`. Never shouting.
- **Body & Labels:** Sans-serif, relaxed line height, 65ch maximum line length, high-contrast Slate-300 on Obsidian.
- **Telemetry & Numbers (Mandatory Monospace):** All numbers, KPIs, IP addresses, GPS coordinates, serial numbers, report IDs, and SHA-256 hashes MUST use `font-mono` (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`).
- **Anti-Patterns:** Generic serif fonts are strictly BANNED. Gradient text fills (`bg-clip-text`) are BANNED.

---

## 4. Component Stylings

### Buttons
- **Primary:** Cobalt fill (`bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg text-xs`).
- **Secondary / Ghost:** Smoked glass (`bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-medium px-3.5 py-2 rounded-lg text-xs`).
- **Destructive:** Subdued Rose (`bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-md text-xs`).
- **Tactile Feedback:** `active:translate-y-[1px]` physical depression. NO neon outer glows.
- **Iconography:** High-precision SVG micro-icons (14px–16px, 1.5px stroke width). Emojis are strictly BANNED.

### Cards & Surfaces
- Flat smoked glass (`bg-slate-900/60 backdrop-blur-md border border-white/[0.08] rounded-xl`).
- Shadows tinted strictly to background hue (`shadow-[0_4px_24px_-2px_rgba(10,15,29,0.8)]`).
- High-density zones replace cards with 1px top dividers (`border-t border-white/[0.08]`).

### Tables & Data Grids
- **Header:** Translucent smoked strip (`bg-white/[0.02] border-b border-white/[0.08] text-[10px] font-mono uppercase tracking-wider text-slate-400`).
- **Rows:** Alternating subtle hover (`hover:bg-white/[0.03] transition-colors`).
- **Dividers:** 1px hairline border (`divide-y divide-white/[0.05]`).
- **Actions:** Grouped action buttons with crisp 1px borders and direct routing.

### Modals & Drawers
- Deep Obsidian Sheet (`bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl`).
- High-contrast inputs (`bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30`).

---

## 5. Layout Principles
- **Asymmetric Bento Grid:** The generic "3 equal cards horizontally" row is BANNED. Key operational metrics use an asymmetric 2:1 or primary-hero split.
- **Mobile-First Collapse:** Below 768px, all grids collapse to a clean single column.
- **Zero Element Overlap:** Text never overlaps graphics or textures. Every element has its designated spatial boundary.
- **Touch Targets:** Minimum 44px interactive tap area on mobile/field views.
- **Containment:** Desktop views strictly constrained to `max-w-7xl mx-auto`.

---

## 6. Motion & Interaction
- **Snappy Spring Curves:** Standard transition of `150ms cubic-bezier(0.16, 1, 0.3, 1)`.
- **Hardware Acceleration:** Animations restricted to `transform` and `opacity`. Never animate layout geometry (`top`, `width`, `height`).
- **Restraint:** Zero gratuitous bouncing loaders or slow parallax effects. Loaders use skeletal pulse matching exact layout dimensions.

---

## 7. Anti-Patterns (Strictly Forbidden AI Tells)
1. 🚫 **NO EMOJIS ANYWHERE:** Absolutely no emoji characters (`📸`, `📋`, `📑`, `👥`, `⚡`, `✓`, `⚠️`, `✕`) in UI labels, headers, or buttons. Use crisp inline SVG icons.
2. 🚫 **NO AI NEON GLOWS:** No purple, cyan, or pink neon button glows. No `blur-[120px]` floating background spheres.
3. 🚫 **NO PURE BLACK:** `#000000` creates harsh contrast tears. Always use Obsidian Slate (`#0A0F1D`).
4. 🚫 **NO 3-COLUMN EQUAL CARD ROWS:** Replace with structured B2B telemetry rows or asymmetric bentos.
5. 🚫 **NO AI COPYWRITING CLICHÉS:** Banned terms: "Elevate", "Seamless", "Unleash", "Next-Gen", "Supercharge". Use direct technical terms: "Expediente Unificado", "Catálogo Homologado", "Firma Digital SHA-256".
6. 🚫 **NO CAROUSEL SLOP OR CENTERED HEROES:** Clean left-aligned hierarchy.
