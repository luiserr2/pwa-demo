const fs = require('fs');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Propuesta Técnico-Comercial — VERTEX</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap');

    :root {
      --bg: #ffffff;
      --navy: #0f172a;
      --navy-light: #1e293b;
      --text-main: #0f172a;
      --text-body: #334155;
      --text-muted: #64748b;
      --text-light: #94a3b8;
      --border: #e2e8f0;
      --border-subtle: #cbd5e1;
      --surface-subtle: #f8fafc;
      --surface-card: #ffffff;
      --red: #e11d48;
      --red-soft: #fff1f2;
      --red-border: #fecdd3;
      --blue: #2563eb;
      --blue-subtle: #eff6ff;
      --blue-border: #bfdbfe;
      --emerald: #059669;
      --emerald-subtle: #ecfdf5;
      --emerald-border: #a7f3d0;
      --amber: #d97706;
      --amber-subtle: #fffbeb;
      --amber-border: #fde68a;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #262626;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: var(--text-body);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      padding: 30px 0;
    }

    .container {
      max-width: 210mm;
      margin: 0 auto;
    }

    /* PÁGINA EXACTA A4 */
    .sheet {
      background: #ffffff;
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      padding: 14mm 18mm 12mm 18mm;
      margin: 0 auto 30px auto;
      border-radius: 4px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      page-break-after: always;
      break-after: page;
      box-sizing: border-box;
      overflow: hidden;
    }

    /* ======================================================== */
    /* PORTADA ESTILO CORPORATIVO SPLIT-WAVE (PÁGINA 1)         */
    /* ======================================================== */
    .sheet.cover-wave-sheet {
      padding: 0 !important;
      background: #0f172a;
      position: relative;
      overflow: hidden;
      display: block;
    }

    .cover-bg-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
    }

    .cover-content-layer {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    }

    .cover-upper-zone {
      padding-top: 24mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .cover-symbol-box {
      margin-bottom: 22px;
    }

    .cover-year {
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 3px;
      margin-bottom: 8px;
    }

    .cover-hero-title {
      font-size: 38px;
      font-weight: 900;
      line-height: 1.08;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      color: #0f172a;
      margin-bottom: 14px;
    }

    .cover-hero-title .accent-red {
      color: #e11d48;
    }

    .cover-hero-subtitle {
      font-size: 14px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .cover-hero-desc {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 600;
      max-width: 480px;
      line-height: 1.45;
    }

    .cover-lower-zone {
      padding: 0 24mm 16mm 24mm;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .cover-quote-container {
      text-align: center;
      margin-bottom: 24px;
    }

    .cover-quote-symbol {
      font-size: 46px;
      font-family: Georgia, serif;
      color: #e11d48;
      line-height: 1;
      margin-bottom: 2px;
      display: block;
    }

    .cover-quote-text-main {
      font-size: 19px;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.2px;
    }

    .cover-quote-text-sub {
      font-size: 17px;
      font-weight: 700;
      color: #e11d48;
      margin-top: 3px;
    }

    .cover-info-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 16px 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 28px;
      margin-bottom: 20px;
    }

    .cover-info-row {
      display: flex;
      flex-direction: column;
    }

    .cover-info-lbl {
      font-size: 9.5px;
      color: #94a3b8;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .cover-info-val {
      font-size: 12px;
      color: #ffffff;
      font-weight: 700;
    }

    .cover-dark-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
      letter-spacing: 0.8px;
    }

    /* ======================================================== */
    /* ESTILOS COMUNES PARA PÁGINAS DE CONTENIDO (2 A 8)        */
    /* ======================================================== */
    .top-eyebrow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--text-main);
      padding-bottom: 6px;
      margin-bottom: 14px;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .header-layout {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 14px;
    }

    .doc-title {
      font-size: 26px;
      font-weight: 900;
      color: var(--text-main);
      letter-spacing: -0.5px;
      line-height: 1.1;
      margin-bottom: 4px;
    }

    .doc-subtitle {
      font-size: 12px;
      color: var(--text-body);
      max-width: 440px;
      line-height: 1.45;
    }

    .meta-box {
      background: var(--surface-subtle);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 11px;
      min-width: 220px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .meta-line {
      display: flex;
      justify-content: space-between;
    }
    .meta-label { color: var(--text-muted); font-weight: 500; }
    .meta-val { color: var(--text-main); font-weight: 700; }

    .section-headline {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--text-main);
      margin-bottom: 10px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-subhead {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: -6px;
      margin-bottom: 12px;
      line-height: 1.45;
    }

    /* RESUMEN EJECUTIVO (PÁGINA 2) */
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }

    .summary-card {
      padding: 14px 16px;
      border-radius: 8px;
      border: 1px solid;
    }
    .summary-card.pain {
      background: #fff5f5;
      border-color: #fecdd3;
    }
    .summary-card.gain {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .summary-card-title {
      font-size: 11.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .summary-card.pain .summary-card-title { color: #991b1b; }
    .summary-card.gain .summary-card-title { color: #166534; }

    .summary-card ul {
      list-style: none;
      font-size: 11.5px;
      line-height: 1.5;
    }
    .summary-card ul li {
      margin-bottom: 7px;
      position: relative;
      padding-left: 16px;
      color: var(--text-body);
    }
    .summary-card ul li:last-child { margin-bottom: 0; }
    .summary-card.pain ul li::before {
      content: "✕";
      position: absolute;
      left: 0;
      color: #dc2626;
      font-weight: 800;
      font-size: 11px;
    }
    .summary-card.gain ul li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #16a34a;
      font-weight: 800;
      font-size: 11px;
    }
    .summary-card strong {
      color: var(--text-main);
    }

    /* CARDS DE MÓDULOS (PÁGINAS 3, 4, 5) */
    .module-box {
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #ffffff;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .module-box:last-child { margin-bottom: 0; }

    .module-header {
      background: var(--surface-subtle);
      border-bottom: 1px solid var(--border);
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .module-tag-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .module-badge {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .badge-campo { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .badge-seguimiento { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-admin { background: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }
    .badge-plantillas { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }

    .module-name {
      font-size: 12.5px;
      font-weight: 800;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .module-target {
      font-size: 10.5px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .module-body {
      padding: 12px 14px;
    }

    .module-intro-text {
      font-size: 11.5px;
      color: var(--text-body);
      line-height: 1.45;
      margin-bottom: 10px;
    }

    .features-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .features-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .feature-card {
      background: var(--surface-subtle);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px 11px;
    }

    .feature-cap-tag {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--blue);
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 3px;
    }

    .feature-cap-title {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .feature-cap-desc {
      font-size: 10.5px;
      color: var(--text-body);
      line-height: 1.4;
    }

    /* BOLSA DE HORAS (PÁGINA 6) */
    .bolsa-banner {
      background: #eff6ff;
      border: 1px solid var(--blue-border);
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 14px;
    }

    .bolsa-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .bolsa-title {
      font-size: 13.5px;
      font-weight: 900;
      color: var(--text-main);
    }

    .bolsa-pill {
      background: var(--blue);
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 999px;
      text-transform: uppercase;
    }

    .bolsa-desc {
      font-size: 11.5px;
      color: var(--text-body);
      line-height: 1.45;
      margin-bottom: 10px;
    }

    .bolsa-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .bolsa-item {
      background: #ffffff;
      border: 1px solid var(--blue-border);
      border-radius: 6px;
      padding: 9px 11px;
    }

    .bolsa-item-title {
      font-size: 11px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 3px;
    }

    .bolsa-item-desc {
      font-size: 10px;
      color: var(--text-muted);
      line-height: 1.35;
    }

    /* TABLA GCP (PÁGINA 6) */
    .gcp-box {
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .gcp-box-header {
      background: var(--navy);
      color: #ffffff;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .gcp-box-title {
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.3px;
    }

    .gcp-box-tag {
      font-size: 9.5px;
      background: rgba(255, 255, 255, 0.15);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .table-clean {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }

    .table-clean th {
      background: var(--surface-subtle);
      font-weight: 800;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 9.5px;
      padding: 7px 10px;
      border-bottom: 1px solid var(--border);
      text-align: left;
    }

    .table-clean td {
      padding: 7px 10px;
      border-bottom: 1px solid var(--border);
      color: var(--text-body);
      vertical-align: middle;
      line-height: 1.35;
    }

    .table-clean .cost-cell {
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
    }

    .table-clean .subtotal-row td {
      background: var(--surface-subtle);
      font-weight: 700;
    }

    .table-clean .total-row td {
      background: #eff6ff;
      border-top: 2px solid var(--blue);
      font-weight: 800;
      color: #1e3a8a;
      font-size: 11.5px;
    }

    .gcp-clause-note {
      background: var(--surface-subtle);
      border-left: 3px solid var(--blue);
      padding: 8px 12px;
      font-size: 10px;
      color: var(--text-body);
      line-height: 1.4;
      border-radius: 0 4px 4px 0;
    }

    /* TABLA RESUMEN EJECUTIVO (PÁGINA 7) */
    .summary-table-box {
      border: 1px solid var(--navy);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .summary-table-header {
      background: var(--navy);
      color: #ffffff;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-table-title {
      font-size: 12.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .fiscal-pill-row {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 10.5px;
      color: #581c87;
      font-weight: 600;
      line-height: 1.4;
    }

    /* CLÁUSULAS CONTRACTUALES Y FIRMAS (PÁGINA 8) */
    .contract-clause-box {
      background: var(--surface-subtle);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
    }

    .contract-clause-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .contract-clause-item {
      font-size: 11px;
      color: var(--text-body);
      line-height: 1.45;
    }

    .contract-clause-title {
      font-weight: 800;
      color: var(--text-main);
      display: inline;
    }

    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 14px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .signature-card {
      display: flex;
      flex-direction: column;
    }

    .signature-line {
      border-bottom: 1px solid var(--text-main);
      height: 44px;
      margin-bottom: 8px;
    }

    .sig-party-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--text-main);
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .sig-meta-text {
      font-size: 10.5px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* FOOTER COMÚN */
    .sheet-footer {
      border-top: 1px solid var(--border);
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: var(--text-light);
      font-weight: 600;
      letter-spacing: 0.4px;
    }

    /* IMPRESIÓN Y REGLAS A4 */
    @page {
      size: A4 portrait;
      margin: 0;
    }

    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .container {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .sheet {
        box-shadow: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
        page-break-after: always;
        break-after: page;
      }
    }
  </style>
</head>
<body>

<div class="container">

  <!-- ======================================================== -->
  <!-- PÁGINA 1: PORTADA SPLIT-WAVE MINIMALISTA & PRO           -->
  <!-- ======================================================== -->
  <div class="sheet cover-wave-sheet">
    <svg class="cover-bg-svg" viewBox="0 0 1000 1414" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mainRedGrad" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stop-color="#fb7185" />
          <stop offset="35%" stop-color="#e11d48" />
          <stop offset="100%" stop-color="#be123c" />
        </linearGradient>
        <linearGradient id="darkFoldGrad" x1="20%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stop-color="#881337" />
          <stop offset="45%" stop-color="#4c0519" />
          <stop offset="100%" stop-color="#1c040a" />
        </linearGradient>
        <filter id="ambientShadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="24" stdDeviation="25" flood-color="#000000" flood-opacity="0.6" />
        </filter>
      </defs>

      <rect width="1000" height="1414" fill="#0f172a" />
      <path d="M 0,0 L 1000,0 L 1000,650 C 750,750 550,720 380,640 C 200,550 80,450 0,380 Z" fill="#ffffff" />
      <path d="M 0,300 C 140,390 320,530 520,590 C 720,650 880,580 1000,450 L 1000,550 C 880,670 680,730 480,670 C 300,610 130,480 0,380 Z" fill="#e2e8f0" />

      <g filter="url(#ambientShadow)">
        <path d="M 430,680 C 600,740 800,730 1000,590 L 1000,750 C 780,850 560,800 430,680 Z" fill="url(#darkFoldGrad)" />
        <path d="M 0,360 C 140,440 320,600 500,660 C 700,720 880,630 1000,490 L 1000,590 C 880,715 680,775 480,720 C 300,655 130,510 0,440 Z" fill="url(#mainRedGrad)" />
      </g>
    </svg>

    <div class="cover-content-layer">
      <div class="cover-upper-zone">
        <div class="cover-symbol-box">
          <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
            <path d="M18 13L7 24L18 35" stroke="#e11d48" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M30 13L41 24L30 35" stroke="#e11d48" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            <polygon points="24,17 28.5,24 24,31 19.5,24" fill="#e11d48"/>
          </svg>
        </div>

        <div class="cover-year">2026</div>

        <h1 class="cover-hero-title">
          <span class="accent-red">PROPUESTA</span><br>
          COMERCIAL
        </h1>

        <div class="cover-hero-subtitle">SISTEMA VERTEX</div>
        <div class="cover-hero-desc">
          Control Operativo en Campo y Generación de Actas Técnicas
        </div>
      </div>

      <div class="cover-lower-zone">
        <div class="cover-quote-container">
          <span class="cover-quote-symbol">&ldquo;</span>
          <p class="cover-quote-text-main">Estandarización y control técnico</p>
          <p class="cover-quote-text-sub">de alto rendimiento</p>
        </div>

        <div class="cover-info-card">
          <div class="cover-info-row">
            <span class="cover-info-lbl">Destinatario</span>
            <span class="cover-info-val">Empresa Contratista</span>
          </div>
          <div class="cover-info-row">
            <span class="cover-info-lbl">Referencia</span>
            <span class="cover-info-val">PROP-VTX-2026-01</span>
          </div>
          <div class="cover-info-row">
            <span class="cover-info-lbl">Modalidad</span>
            <span class="cover-info-val">Setup + EULA Perpetua</span>
          </div>
          <div class="cover-info-row">
            <span class="cover-info-lbl">Vigencia</span>
            <span class="cover-info-val">15 Días Continuos</span>
          </div>
        </div>

        <div class="cover-dark-footer">
          <span>DOCUMENTO PRIVADO Y CONFIDENCIAL</span>
          <span>VERTEX &bull; 2026</span>
        </div>
      </div>
    </div>
  </div>


  <!-- ======================================================== -->
  <!-- PÁGINA 2: RESUMEN EJECUTIVO (DIAGNÓSTICO Y PROPUESTA)    -->
  <!-- ======================================================== -->
  <div class="sheet">
    <div>
      <div class="top-eyebrow">
        <span>Propuesta Técnico-Comercial B2B</span>
        <span>Referencia: PROP-VTX-2026-01</span>
      </div>

      <div class="header-layout">
        <div>
          <h1 class="doc-title">SISTEMA VERTEX</h1>
          <p class="doc-subtitle">
            Plataforma Integral de Supervisión, Matriz Técnica de 48 Zonas y Generación de Actas para Cuadrillas de Telecomunicaciones.
          </p>
        </div>

        <div class="meta-box">
          <div class="meta-line">
            <span class="meta-label">Fecha de Emisión:</span>
            <span class="meta-val">Octubre 2026</span>
          </div>
          <div class="meta-line">
            <span class="meta-label">Validez de Oferta:</span>
            <span class="meta-val">15 Días Continuos</span>
          </div>
          <div class="meta-line">
            <span class="meta-label">Modalidad:</span>
            <span class="meta-val">Setup + EULA B2B</span>
          </div>
          <div class="meta-line">
            <span class="meta-label">Régimen Fiscal:</span>
            <span class="meta-val">Precios Netos (+ IVA)</span>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 1 -->
      <div class="section-headline">
        1. Resumen Ejecutivo: Diagnóstico y Propuesta de Valor
      </div>
      <p class="section-subhead">
        Las empresas contratistas de telecomunicaciones pierden en promedio entre un 15% y un 25% de su margen operativo debido a glosas, retrasos en la facturación y rechazos de actas de mantenimiento por parte de las operadoras clientes. La plataforma VERTEX estandariza el flujo integral de punta a punta.
      </p>

      <div class="summary-grid">
        <div class="summary-card pain">
          <div class="summary-card-title">Situación Actual (Sin Plataforma)</div>
          <ul>
            <li><strong>En Campo:</strong> Evidencias desordenadas en chats de WhatsApp, fotos borrosas y fallas por falta de señal en torre.</li>
            <li><strong>En Coordinación:</strong> Carga manual lenta de órdenes, descontrol de visados, retrasos en trámite de HES y falta de auditoría de cambios.</li>
            <li><strong>En Gerencia:</strong> Días perdidos maquetando actas en Word/Excel, falta de visibilidad en tiempo real y riesgo ante reclamos del cliente.</li>
            <li><strong>En Operaciones:</strong> Formatos rígidos difíciles de adaptar ante los cambios de exigencias normativas de cada operadora.</li>
          </ul>
        </div>

        <div class="summary-card gain">
          <div class="summary-card-title">Impacto con VERTEX</div>
          <ul>
            <li><strong>Campo (Técnicos):</strong> Captura técnica 100% offline, modo sol de alto contraste y motor fotográfico (foto única o Antes/Después).</li>
            <li><strong>Seguimiento (Coordinación):</strong> Carga de órdenes desde plantilla Excel, control de visado/HES y registro detallado de quién editó qué.</li>
            <li><strong>Administración (Gerencia):</strong> Telemetría ejecutiva en vivo, actas PDF homologadas compiladas a 1 clic y registro auditado de eventos.</li>
            <li><strong>Plantillas (Operaciones):</strong> Flexibilidad para configurar formularios, requerimientos de fotos y diseño de actas sin tocar código.</li>
          </ul>
        </div>
      </div>

      <!-- INTRO SECCIÓN 2 -->
      <div class="section-headline" style="margin-top: 14px;">
        2. Estructura de la Solución por Módulos y Roles
      </div>
      <p class="section-subhead">
        El sistema se compone de cuatro (4) módulos especializados, diseñados para responder exactamente a la responsabilidad operativa y técnica de cada integrante de la empresa:
      </p>
      <div style="background: var(--surface-subtle); border: 1px solid var(--border); border-radius: 6px; padding: 10px 14px; font-size: 11.5px; line-height: 1.45; color: var(--text-body);">
        Cada módulo cuenta con interfaces optimizadas para su entorno de trabajo: terminal móvil PWA para cuadrillas en torre, consola de despacho para coordinadores de operaciones, panel ejecutivo para gerencia y diseñador visual para administración de formularios.
      </div>
    </div>

    <div class="sheet-footer">
      <span>VERTEX &bull; Propuesta Técnico-Comercial B2B</span>
      <span>Documento Privado y Confidencial &bull; Página 2 de 8</span>
    </div>
  </div>


  <!-- ======================================================== -->
  <!-- PÁGINA 3: MÓDULO 1 (CAMPO / TÉCNICO EN TORRE)            -->
  <!-- ======================================================== -->
  <div class="sheet">
    <div>
      <div class="top-eyebrow">
        <span>Alcance Técnico y Arquitectura Funcional</span>
        <span>Módulo 1: Campo</span>
      </div>

      <div class="section-headline">
        Módulo 1: Campo (Técnico en Torre / Operaciones en Sitio)
      </div>
      <p class="section-subhead">
        Aplicación PWA móvil optimizada para terminales táctiles, diseñada para operar en condiciones severas de campo con visibilidad bajo luz solar directa, cero dependencia de cobertura celular y consumo mínimo de batería.
      </p>

      <div class="module-box">
        <div class="module-header">
          <div class="module-tag-title">
            <span class="module-badge badge-campo">Módulo 1</span>
            <span class="module-name">Operaciones en Sitio &bull; Terminal Móvil PWA</span>
          </div>
          <span class="module-target">Perfil: Técnicos de Campo, Cuadrillas de Mantenimiento e Instaladores</span>
        </div>
        <div class="module-body">
          <p class="module-intro-text">
            Diseñado para erradicar el uso informal de WhatsApp y eliminar el extravío de información técnica en torre:
          </p>

          <div class="features-grid-3">
            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 01</span>
              <div class="feature-cap-title">PWA Offline-First (Sin Conexión)</div>
              <p class="feature-cap-desc">
                Base de datos local indexada <code>IndexedDB / Dexie.js</code>. Levantamientos íntegros sin internet en zonas rurales o shelters metálicos apantallados. Cero riesgo de pantallas en blanco.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 02</span>
              <div class="feature-cap-title">Sincronización Automática</div>
              <p class="feature-cap-desc">
                Detección inteligente de red (3G/4G/Wi-Fi) con reintentos exponenciales y cola de sincronización visual en segundo plano para asegurar que ningún informe se quede retenido en el teléfono.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 03</span>
              <div class="feature-cap-title">Matriz Técnica de 48 Zonas</div>
              <p class="feature-cap-desc">
                Formulario secuencial guiado para Torre, Shelter, Energía DC/Baterías, Radiofrecuencia y Sistema de Tierra. Evaluación (<code>NORMAL</code>, <code>ALARMA</code>, <code>FALLA</code>) con notas obligatorias.
              </p>
            </div>
          </div>

          <div class="features-grid-2" style="margin-top: 10px;">
            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 04</span>
              <div class="feature-cap-title">Motor Fotográfico Adaptativo por Misión</div>
              <p class="feature-cap-desc">
                Soporta flujo de <strong>Evidencia Única</strong> para instalaciones nuevas, swaps o auditorías, y flujo dual <strong>Antes / Después</strong> para mantenimientos correctivos. Compresión WebP (&lt; 250 KB) con preservación de nitidez para números de serie.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 05</span>
              <div class="feature-cap-title">Modo Sol y Ergonomía de Faena</div>
              <p class="feature-cap-desc">
                Modo Sol de alto contraste y botones táctiles sobredimensionados (&ge; 48px) para operar bajo luz solar intensa y con guantes de seguridad, eliminando fatiga visual y errores de pulsación.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- HIGHLIGHT OPERATIVO DE CAMPO -->
      <div style="background: var(--surface-subtle); border-left: 3px solid var(--blue); padding: 10px 14px; border-radius: 0 6px 6px 0; margin-top: 14px;">
        <strong style="color: var(--blue); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Garantía de Productividad en Faena:</strong>
        <p style="font-size: 11px; color: var(--text-body); line-height: 1.45;">
          El liniero completa la rutina en 20 minutos sin necesidad de cobertura celular. Las evidencias quedan almacenadas localmente en el dispositivo con respaldo automático hasta recuperar conexión para su transmisión central.
        </p>
      </div>
    </div>

    <div class="sheet-footer">
      <span>VERTEX &bull; Propuesta Técnico-Comercial B2B</span>
      <span>Documento Privado y Confidencial &bull; Página 3 de 8</span>
    </div>
  </div>


  <!-- ======================================================== -->
  <!-- PÁGINA 4: MÓDULO 2 (SEGUIMIENTO, COORDINACIÓN Y HES)     -->
  <!-- ======================================================== -->
  <div class="sheet">
    <div>
      <div class="top-eyebrow">
        <span>Alcance Técnico y Arquitectura Funcional</span>
        <span>Módulo 2: Seguimiento</span>
      </div>

      <div class="section-headline">
        Módulo 2: Seguimiento (Coordinación, Visado y HES)
      </div>
      <p class="section-subhead">
        Consola central de operaciones: permite cargar las órdenes de salida desde plantillas Excel, hacer seguimiento al avance de las cuadrillas en campo, supervisar el control de calidad técnico, dar seguimiento a la radicación y visado ante el cliente, y registrar la HES para facturación.
      </p>

      <div class="module-box">
        <div class="module-header">
          <div class="module-tag-title">
            <span class="module-badge badge-seguimiento">Módulo 2</span>
            <span class="module-name">Consola Central de Operaciones &bull; Pipeline Kanban</span>
          </div>
          <span class="module-target">Perfil: Persona de Seguimiento / Coordinador de Operaciones y Facturación Técnica</span>
        </div>
        <div class="module-body">
          <p class="module-intro-text">
            Centraliza el flujo técnico-comercial para asegurar que ningún trabajo ejecutado se quede sin radicar o cobrar:
          </p>

          <div class="features-grid-3">
            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 01</span>
              <div class="feature-cap-title">Carga de Órdenes desde Excel</div>
              <p class="feature-cap-desc">
                Importación rápida de órdenes de salida o trabajo mediante plantilla estándar en Excel (código de radiobase, tipo de servicio, fecha y cuadrilla asignada), evitando la carga manual individual.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 02</span>
              <div class="feature-cap-title">Pipeline Operativo de 8 Fases</div>
              <p class="feature-cap-desc">
                Monitoreo del ciclo completo: <code>SIN_EMPEZAR</code> &rarr; <code>EN_VISITA</code> &rarr; <code>ELABORANDO</code> &rarr; <code>REVISION_INTERNA</code> &rarr; <code>ENVIADO</code> &rarr; <code>VISADO</code> &rarr; <code>HES</code> &rarr; <code>FACTURADO</code>.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 03</span>
              <div class="feature-cap-title">Revisión y Control de Calidad (QA)</div>
              <p class="feature-cap-desc">
                Bandeja de auditoría interna para revisar las 48 zonas y la calidad de fotos cargadas, con potestad de aprobar el informe o solicitar subsanaciones inmediatas a la cuadrilla.
              </p>
            </div>
          </div>

          <div class="features-grid-3" style="margin-top: 10px;">
            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 04</span>
              <div class="feature-cap-title">Seguimiento de Radicación</div>
              <p class="feature-cap-desc">
                Registro del estado de entrega del informe al cliente (<code>ENVIADO_AL_CLIENTE</code>), documentando canal de entrega, número de ticket y tiempos de respuesta del inspector de la operadora.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 05</span>
              <div class="feature-cap-title">Visado del Cliente y Gestión de HES</div>
              <p class="feature-cap-desc">
                Registro del visto bueno del cliente (<code>VISADO</code>), bloqueo del informe para impedir modificaciones y registro de la Hoja de Entrada de Servicios (<code>HES_SOLICITADA</code>) para habilitar el cobro.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 06</span>
              <div class="feature-cap-title">Historial y Auditoría de Cambios</div>
              <p class="feature-cap-desc">
                Bitácora organizada que registra quién editó el documento, fecha y hora, y el cambio puntual realizado (dato anterior vs. nuevo), garantizando total control antes de la entrega final.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- HIGHLIGHT DE FACTURACIÓN -->
      <div style="background: var(--surface-subtle); border-left: 3px solid var(--emerald); padding: 10px 14px; border-radius: 0 6px 6px 0; margin-top: 14px;">
        <strong style="color: var(--emerald); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Impacto Directo en Flujo de Caja:</strong>
        <p style="font-size: 11px; color: var(--text-body); line-height: 1.45;">
          Al reducir los tiempos de visado y contar con la HES documentada el mismo día de la visita, el periodo promedio de cobranza pasa de 45 días a menos de 15 días continuos.
        </p>
      </div>
    </div>

    <div class="sheet-footer">
      <span>VERTEX &bull; Propuesta Técnico-Comercial B2B</span>
      <span>Documento Privado y Confidencial &bull; Página 4 de 8</span>
    </div>
  </div>


  <!-- ======================================================== -->
  <!-- PÁGINA 5: MÓDULOS 3 Y 4 (ADMINISTRACIÓN Y PLANTILLAS)    -->
  <!-- ======================================================== -->
  <div class="sheet">
    <div>
      <div class="top-eyebrow">
        <span>Alcance Técnico y Arquitectura Funcional</span>
        <span>Módulos 3 y 4: Gestión & Plantillas</span>
      </div>

      <!-- MÓDULO 3 -->
      <div class="section-headline">
        Módulo 3: Administrativo (Gerencia, Auditoría y Control)
      </div>
      <div class="module-box" style="margin-bottom: 12px;">
        <div class="module-header">
          <div class="module-tag-title">
            <span class="module-badge badge-admin">Módulo 3</span>
            <span class="module-name">Control Ejecutivo &bull; Compliance</span>
          </div>
          <span class="module-target">Perfil: Directores Generales, Gerentes de Operaciones y Auditores</span>
        </div>
        <div class="module-body">
          <div class="features-grid-3">
            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 01</span>
              <div class="feature-cap-title">Dashboard & Telemetría</div>
              <p class="feature-cap-desc">
                Métricas en tiempo real: volumen mensual de radiobases atendidas, tasa de rechazo interno vs. cliente, sitios con recurrencia de alarmas y metas contractuales.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 02</span>
              <div class="feature-cap-title">Gestión de Radiobases</div>
              <p class="feature-cap-desc">
                Catálogo maestro de estaciones celulares con código único, región geográfica, coordenadas oficiales, tipo de estructura y tecnología instalada.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 03</span>
              <div class="feature-cap-title">Directorio de Cuadrillas</div>
              <p class="feature-cap-desc">
                Administración de personal y segregación estricta de roles (Técnico, Seguimiento, Administrador) con control de accesos por usuario y permisos por región.
              </p>
            </div>
          </div>

          <div class="features-grid-2" style="margin-top: 8px;">
            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 04</span>
              <div class="feature-cap-title">Generador de Actas PDF A4</div>
              <p class="feature-cap-desc">
                Compilación a 1 clic de expedientes técnicos homologados listos para radicar, con membrete corporativo, resumen de 48 zonas, mosaicos fotográficos HD y firmas digitales.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 05</span>
              <div class="feature-cap-title">Bitácora y Registro de Auditoría</div>
              <p class="feature-cap-desc">
                Registro inmutable de actividades operativas con fecha, hora y usuario responsable, con opción de consulta histórica y exportación en CSV/JSON para control interno.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- MÓDULO 4 -->
      <div class="section-headline">
        Módulo 4: Gestor de Plantillas (Formularios y Reportes PDF)
      </div>
      <div class="module-box">
        <div class="module-header">
          <div class="module-tag-title">
            <span class="module-badge badge-plantillas">Módulo 4</span>
            <span class="module-name">Autonomía Total &bull; Cero Código</span>
          </div>
          <span class="module-target">Perfil: Administradores y Coordinadores de Operaciones</span>
        </div>
        <div class="module-body">
          <div class="features-grid-3">
            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 01</span>
              <div class="feature-cap-title">Plantillas de Formularios</div>
              <p class="feature-cap-desc">
                Configuración de campos, preguntas técnicas y datos obligatorios que debe completar el liniero en su terminal móvil según el tipo de servicio o misión.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 02</span>
              <div class="feature-cap-title">Personalización del Acta PDF</div>
              <p class="feature-cap-desc">
                Ajuste de logotipos del cliente y de la contratista, disposición de 2 o 4 fotos por página e inclusión opcional de bloques de seguridad y firmas tripartitas.
              </p>
            </div>

            <div class="feature-card">
              <span class="feature-cap-tag">Capacidad 03</span>
              <div class="feature-cap-title">Requerimiento de Fotos</div>
              <p class="feature-cap-desc">
                Definición de evidencias requeridas (foto individual para instalaciones/swaps o fotos comparativas antes/después para mantenimientos preventivos y correctivos).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sheet-footer">
      <span>VERTEX &bull; Propuesta Técnico-Comercial B2B</span>
      <span>Documento Privado y Confidencial &bull; Página 5 de 8</span>
    </div>
  </div>


  <!-- ======================================================== -->
  <!-- PÁGINA 6: BOLSA DE HORAS Y TABLA GOOGLE CLOUD            -->
  <!-- ======================================================== -->
  <div class="sheet">
    <div>
      <div class="top-eyebrow">
        <span>Condiciones Técnicas e Infraestructura</span>
        <span>Bolsa de Horas & GCP</span>
      </div>

      <!-- SECCIÓN 3 -->
      <div class="section-headline">
        3. Adecuaciones Personalizadas y Bolsa de Horas Libres
      </div>
      <p class="section-subhead">
        Entendemos que cada contratista posee requerimientos particulares exigidos por su operadora cliente. Por ello, la tarifa de implementación inicial no es una "caja cerrada", sino que incluye una bolsa de ingeniería dedicada:
      </p>

      <div class="bolsa-banner">
        <div class="bolsa-title-row">
          <div class="bolsa-title">Bolsa de 20 Horas de Adecuación Técnica Incluidas</div>
          <span class="bolsa-pill">100% Bonificado en Setup</span>
        </div>
        <p class="bolsa-desc">
          Dentro del precio de Setup cerrado de <strong>$1,650.00 USD</strong>, se asignan hasta <strong>veinte (20) horas hombre de ingeniería</strong> sin costo adicional para ajustar la plataforma a las directrices exactas de su operación:
        </p>

        <div class="bolsa-grid">
          <div class="bolsa-item">
            <div class="bolsa-item-title">1. Adaptación de Planilla</div>
            <p class="bolsa-item-desc">Ajuste de nomenclaturas o ítems de las 48 zonas al estándar de su operadora cliente.</p>
          </div>
          <div class="bolsa-item">
            <div class="bolsa-item-title">2. Identidad en Actas PDF</div>
            <p class="bolsa-item-desc">Inclusión de logotipo, datos fiscales, tipografías y maquetación personalizada de actas.</p>
          </div>
          <div class="bolsa-item">
            <div class="bolsa-item-title">3. Carga de Catálogos</div>
            <p class="bolsa-item-desc">Importación inicial del catálogo oficial de radiobases y coordenadas del cliente.</p>
          </div>
          <div class="bolsa-item">
            <div class="bolsa-item-title">4. Ajuste de Parámetros</div>
            <p class="bolsa-item-desc">Calibración de campos obligatorios, umbrales técnicos y reglas de validación de la empresa.</p>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 4 -->
      <div class="section-headline">
        4. Infraestructura Cloud de Nivel Empresarial (Google Cloud Platform)
      </div>
      <p class="section-subhead">
        Para evitar servidores vulnerables o caídas de servicio, la plataforma se hospeda en la nube de <strong>Google Cloud Platform (GCP)</strong> en centros de datos Tier-3 de Estados Unidos, garantizando un 99.9% de disponibilidad y soberanía de los datos:
      </p>

      <div class="gcp-box">
        <div class="gcp-box-header">
          <div class="gcp-box-title">Desglose de Costos de Infraestructura y Mantenimiento</div>
          <span class="gcp-box-tag">Centros de Datos GCP EE.UU. (Iowa / Carolina)</span>
        </div>

        <table class="table-clean">
          <thead>
            <tr>
              <th>Servicio Cloud (GCP)</th>
              <th>Función Operativa</th>
              <th>Consumo Mensual Estimado</th>
              <th style="text-align: right;">Costo Nube GCP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Google Cloud Run</strong></td>
              <td>Instancia serverless para la PWA, API REST y motor de PDFs (1 vCPU, 1 GB RAM).</td>
              <td>~100,000 peticiones / mes (0 cold-start garantizado).</td>
              <td class="cost-cell">$15.00 USD</td>
            </tr>
            <tr>
              <td><strong>Cloud SQL for PostgreSQL</strong></td>
              <td>Base de datos transaccional PostgreSQL multi-zona con almacenamiento SSD de alta velocidad.</td>
              <td>Instancia db-f1-micro / e2-micro (20 GB SSD).</td>
              <td class="cost-cell">$18.50 USD</td>
            </tr>
            <tr>
              <td><strong>Google Cloud Storage (GCS)</strong></td>
              <td>Repositorio redundante multi-regional para fotos WebP de alta seguridad.</td>
              <td>Hasta 15,000 fotografías activas (~3.5 GB).</td>
              <td class="cost-cell">$2.50 USD</td>
            </tr>
            <tr>
              <td><strong>Cloud Armor, DNS y SSL</strong></td>
              <td>Resolución DNS ultra-rápida, protección DDoS y certificados TLS 1.3 gestionados.</td>
              <td>Zona DNS + Tráfico saliente seguro (&lt; 20 GB).</td>
              <td class="cost-cell">$2.50 USD</td>
            </tr>
            <tr>
              <td><strong>Cloud Logging & Monitoring</strong></td>
              <td>Telemetría SRE, detección de incidencias y alertas automáticas al NOC.</td>
              <td>Retención a 30 días de eventos de auditoría.</td>
              <td class="cost-cell">$1.50 USD</td>
            </tr>
            <tr class="subtotal-row">
              <td colspan="3">
                <strong>SUBTOTAL CONSUMO BASE DE NUBE GOOGLE CLOUD:</strong><br>
                <span style="font-size: 9.5px; color: var(--text-muted); font-weight: normal;">
                  Costo directo de infraestructura (ampara hasta 10 técnicos, 15,000 fotos y 20 GB de tráfico). <em>El gasto aumentará si hay mayor consumo del estimado base.</em>
                </span>
              </td>
              <td class="cost-cell" style="color: var(--text-main); font-size: 11.5px;">$40.00 USD / mes<br><span style="font-size: 8.5px; color: var(--text-light); font-weight: normal;">(Sujeto a consumo)</span></td>
            </tr>
            <tr>
              <td colspan="3">
                <strong>Servicio Gestionado DevOps, Mantenimiento Preventivo y Soporte Nivel 2:</strong>
                <span style="background: #e0f2fe; color: #0369a1; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 3px; margin-left: 4px;">OPCIONAL</span><br>
                <span style="font-size: 9.5px; color: var(--text-muted);">
                  Administración proactiva de infraestructura, aplicación de parches de seguridad, optimización de base de datos y soporte técnico especializado continuo.
                </span>
              </td>
              <td class="cost-cell" style="color: var(--blue); font-size: 11.5px;">$80.00 USD / mes<br><span style="font-size: 8.5px; color: var(--text-light); font-weight: normal;">(Opcional)</span></td>
            </tr>
            <tr class="total-row">
              <td colspan="3">
                PAQUETE INTEGRAL RECOMENDADO (NUBE BASE + DEVOPS + SOPORTE L2):<br>
                <span style="font-size: 9.5px; color: var(--blue); font-weight: normal;">
                  (Si la empresa no contrata DevOps/Soporte L2, la facturación mensual será únicamente el costo neto de nube de $40.00 USD base).
                </span>
              </td>
              <td class="cost-cell" style="color: #1e3a8a; font-size: 12.5px;">$120.00 USD / mes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="gcp-clause-note">
        <strong>Cláusula de Escalabilidad Cloud:</strong> La estimación base de $40.00 USD ampara con holgura hasta diez (10) cuadrillas concurrentes, 15,000 fotos en la nube y 20 GB de transferencia mensual. El gasto aumentará si hay mayor tráfico o técnicos del estimado base, facturándose a costo neto de la factura oficial de Google Cloud (+ 15% de gastos administrativos si es intermediada). El Servicio Gestionado DevOps ($80.00 USD/mes) es totalmente opcional.
      </div>
    </div>

    <div class="sheet-footer">
      <span>VERTEX &bull; Propuesta Técnico-Comercial B2B</span>
      <span>Documento Privado y Confidencial &bull; Página 6 de 8</span>
    </div>
  </div>


  <!-- ======================================================== -->
  <!-- PÁGINA 7: CUADRO RESUMEN EJECUTIVO DE LA INVERSIÓN       -->
  <!-- ======================================================== -->
  <div class="sheet">
    <div>
      <div class="top-eyebrow">
        <span>Estructura Económica y Condiciones de Pago</span>
        <span>Resumen Ejecutivo</span>
      </div>

      <!-- SECCIÓN 5 -->
      <div class="section-headline">
        5. Cuadro Resumen Ejecutivo de la Propuesta
      </div>
      <p class="section-subhead">
        A continuación se consolida la totalidad de la propuesta económica, términos de entrega y acuerdos de servicio para facilitar la decisión directiva:
      </p>

      <div class="summary-table-box">
        <div class="summary-table-header">
          <span class="summary-table-title">Resumen Financiero y de Compromisos Operativos</span>
          <span style="font-size: 10px; opacity: 0.9; font-weight: 600;">Moneda: Dólares Americanos (USD) &bull; Precios Netos (+ IVA)</span>
        </div>

        <table class="table-clean">
          <thead>
            <tr>
              <th style="width: 25%;">Concepto</th>
              <th style="width: 40%;">Detalle de Entregables</th>
              <th style="width: 20%;">Condición / Modalidad</th>
              <th style="width: 15%; text-align: right;">Monto Neto (USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. Setup e Implementación Base</strong></td>
              <td>Puesta en producción de los 4 Módulos (Campo, Seguimiento, Administración y Plantillas), despliegue en Google Cloud y configuración de catálogos.</td>
              <td>3 pagos fraccionados de <strong>$550.00 USD</strong>:<br>&bull; 33.3% Firma / Kick-off<br>&bull; 33.3% Demostración Staging<br>&bull; 33.4% Pase a Producción</td>
              <td class="cost-cell" style="color: var(--blue); font-size: 12.5px;">$1,650.00 USD<br><span style="font-size: 8.5px; color: var(--text-light); font-weight: normal;">(Pago Único)</span></td>
            </tr>
            <tr style="background: #faf5ff;">
              <td><strong>2. Adecuaciones y Personalización</strong></td>
              <td><strong>Bolsa de hasta 20 horas libres</strong> para calibrar planillas, campos de 48 zonas, diseño del PDF con logo y reglas de validación técnica.</td>
              <td><strong>100% Bonificado</strong> dentro de la tarifa de Setup (No genera cobros extras).</td>
              <td class="cost-cell" style="color: var(--emerald); font-size: 12px;">INCLUIDO</td>
            </tr>
            <tr>
              <td><strong>3. Infraestructura Cloud Base (GCP)</strong></td>
              <td>Servidores Google Cloud de alta disponibilidad, base de datos PostgreSQL, almacenamiento (hasta 15,000 fotos) y red para 10 cuadrillas.<br><span style="font-size: 9.5px; color: var(--text-muted);"><em>(Aumentará proporcionalmente si hay mayor tráfico o almacenamiento).</em></span></td>
              <td>Requerido para operación en línea. Facturación a mes vencido según consumo real GCP.<br><em>(Primeros 30 días con garantía técnica gratuita).</em></td>
              <td class="cost-cell" style="font-size: 11.5px;">$40.00 USD / mes<br><span style="font-size: 8.5px; color: var(--text-light); font-weight: normal;">(Base sujeta a consumo)</span></td>
            </tr>
            <tr style="background: #f0fdf4;">
              <td><strong>4. DevOps y Soporte L2</strong> <span style="background: #e0f2fe; color: #0369a1; font-size: 8.5px; font-weight: 800; padding: 1px 4px; border-radius: 3px;">OPCIONAL</span></td>
              <td>Mantenimiento preventivo de infraestructura, parches de seguridad, optimización de base de datos y soporte técnico especializado.<br><span style="font-size: 9.5px; color: #047857;"><em>(Contratado junto a la nube conforma el paquete integral de $120.00 USD / mes).</em></span></td>
              <td><strong>Modalidad Opcional</strong>. Contratación mensual flexible mes a mes.</td>
              <td class="cost-cell" style="color: var(--blue); font-size: 11.5px;">$80.00 USD / mes<br><span style="font-size: 8.5px; color: var(--text-light); font-weight: normal;">(Opcional)</span></td>
            </tr>
            <tr style="background: var(--surface-subtle);">
              <td><strong>5. Soporte Ad-Hoc (Bajo Demanda)</strong></td>
              <td>Intervenciones técnicas puntuales bajo demanda en caso de prescindir del servicio mensual de soporte L2.</td>
              <td>Bajo demanda con cargo mínimo de 2 horas (SLA de 24-48 horas laborables).</td>
              <td class="cost-cell" style="font-size: 10px;">$40.00 / h (Estándar)<br>$50.00 / h (Emergencia)</td>
            </tr>
            <tr>
              <td><strong>6. Tiempo de Ejecución Total</strong></td>
              <td>Despliegue de infraestructura, parametrización, pruebas de campo y 2 sesiones de capacitación formal al personal.</td>
              <td>Cronograma ágil de <strong>3 a 4 semanas</strong> desde el anticipo inicial.</td>
              <td class="cost-cell" style="font-family: sans-serif; font-size: 10.5px;">Garantizado</td>
            </tr>
            <tr style="background: #eff6ff;">
              <td><strong>7. Soporte Post-Implementación</strong></td>
              <td><strong>1 mes continuo (30 días)</strong> de soporte de estabilización para corrección exclusiva de fallas sobre funcionalidades delimitadas en el contrato.<br><span style="font-size: 9.5px; color: #1e40af;"><em>(Cualquier modificación de fondo o cambio de alcance tras la aprobación será cotizada adicionalmente).</em></span></td>
              <td>A partir del pase formal a producción y entrega del sistema.</td>
              <td class="cost-cell" style="color: #1e40af; font-size: 11.5px;">INCLUIDO<br><span style="font-size: 8.5px; color: var(--text-light); font-weight: normal;">(30 Días)</span></td>
            </tr>
            <tr class="subtotal-row">
              <td><strong>8. Licencia y Términos Contractuales</strong></td>
              <td>Licencia de uso comercial perpetua (sin cobro mensual por usuario), exoneración total por modificación de código y límite de responsabilidad.</td>
              <td>Condiciones de protección legal mutua para ambas partes.</td>
              <td class="cost-cell" style="font-family: sans-serif; font-size: 10.5px;">Incluido</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="fiscal-pill-row">
        ℹ️ <strong>RÉGIMEN FISCAL:</strong> Todos los montos, cánones y tarifas presentadas en esta propuesta económica son valores netos en USD. A cada pago se le adicionará el Impuesto al Valor Agregado (IVA) correspondiente de acuerdo con la legislación tributaria aplicable al momento de la facturación formal.
      </div>
    </div>

    <div class="sheet-footer">
      <span>VERTEX &bull; Propuesta Técnico-Comercial B2B</span>
      <span>Documento Privado y Confidencial &bull; Página 7 de 8</span>
    </div>
  </div>


  <!-- ======================================================== -->
  <!-- PÁGINA 8: MARCO CONTRACTUAL, LICENCIA Y FIRMAS           -->
  <!-- ======================================================== -->
  <div class="sheet">
    <div>
      <div class="top-eyebrow">
        <span>Formalización Contractual y Acuerdos de Servicio</span>
        <span>Aceptación y Cierre</span>
      </div>

      <!-- SECCIÓN 6 -->
      <div class="section-headline">
        6. Marco Contractual, Licencia y Exoneración de Responsabilidad
      </div>
      <p class="section-subhead">
        Pautas contractuales claras que garantizan la seguridad operativa, la confidencialidad corporativa y la protección de la inversión:
      </p>

      <div class="contract-clause-box">
        <ul class="contract-clause-list">
          <li class="contract-clause-item">
            <div class="contract-clause-title">1. Licencia de Uso Comercial Perpetua (Sin cobro recurrente por usuario):</div>
            EL PROVEEDOR concede a LA EMPRESA una licencia de uso comercial, no exclusiva e intransferible para operar la plataforma en sus labores ordinarias de telecomunicaciones. Dicha licencia queda 100% amortizada y concedida mediante el pago único de Setup inicial, sin cobros mensuales por cantidad de técnicos, cuadrillas o usuarios registrados.
          </li>
          <li class="contract-clause-item">
            <div class="contract-clause-title">2. Garantía Técnica y Soporte Post-Implementación (Periodo de Estabilización):</div>
            A partir de la entrega formal y pase a producción del sistema, EL PROVEEDOR otorga un periodo de <strong>soporte de estabilización y garantía técnica de un (1) mes continuo (30 días calendario)</strong> sin costo adicional. Ampara única y exclusivamente la corrección de errores de programación (bugs), fallas operativas o discrepancias técnicas atribuibles a las funcionalidades expresamente contratadas. Esta garantía no contempla nuevas funcionalidades ni alteraciones posteriores a la recepción conforme.
          </li>
          <li class="contract-clause-item">
            <div class="contract-clause-title">3. Exoneración Total por Alteración o Modificación del Código / Sistema:</div>
            Queda terminantemente prohibida la modificación, alteración, descompilación o manipulación directa del código fuente, bases de datos o infraestructura del sistema por personal de LA EMPRESA o terceros ajenos al PROVEEDOR. En caso de detectarse cualquier alteración no autorizada, cesará de pleno derecho cualquier garantía técnica o SLA, quedando el PROVEEDOR completamente exonerado de responsabilidad operativa.
          </li>
          <li class="contract-clause-item">
            <div class="contract-clause-title">4. Límite Máximo de Responsabilidad (Liability Cap):</div>
            La responsabilidad patrimonial máxima acumulada del PROVEEDOR ante cualquier reclamo o eventualidad estará expresamente limitada al monto efectivamente percibido por concepto de la tarifa inicial de Setup ($1,650.00 USD).
          </li>
          <li class="contract-clause-item">
            <div class="contract-clause-title">5. Régimen Tributario e Impuestos de Ley:</div>
            La totalidad de las tarifas, montos de implementación, cánones de infraestructura y honorarios técnicos estipulados corresponden a <strong>valores netos expresados en Dólares Americanos (USD)</strong>. Sobre cada pago se adicionará el Impuesto al Valor Agregado (IVA) o gravamen tributario aplicable conforme a la normativa fiscal vigente.
          </li>
        </ul>
      </div>

      <!-- FIRMAS FORMALES -->
      <div class="signature-grid">
        <div class="signature-card">
          <div class="signature-line"></div>
          <span class="sig-party-title">Por el Proveedor Tecnológico</span>
          <div class="sig-meta-text">
            <strong>Nombre:</strong> ____________________________________<br>
            <strong>C.I. / RIF:</strong> ____________________________________<br>
            <strong>Cargo:</strong> Titular & Arquitecto Técnico VERTEX
          </div>
        </div>

        <div class="signature-card">
          <div class="signature-line"></div>
          <span class="sig-party-title">Por la Empresa Contratante</span>
          <div class="sig-meta-text">
            <strong>Razón Social:</strong> ________________________________<br>
            <strong>RIF / Registro:</strong> ________________________________<br>
            <strong>Representante:</strong> ________________________________<br>
            <strong>Cargo / C.I.:</strong> ________________________________
          </div>
        </div>
      </div>
    </div>

    <div class="sheet-footer">
      <span>VERTEX &bull; Propuesta Técnico-Comercial B2B</span>
      <span>Documento Privado y Confidencial &bull; Página 8 de 8</span>
    </div>
  </div>

</div>

</body>
</html>
`;

fs.writeFileSync('docs/PROPUESTA_COMERCIAL_SISBIR.html', html, 'utf8');
console.log('Restored full master proposal into docs/PROPUESTA_COMERCIAL_SISBIR.html');
