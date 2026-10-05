const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Propuesta Técnico-Comercial B2B — VERTEX</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --text-main: #0f172a;       /* slate-900 */
      --text-body: #334155;       /* slate-700 */
      --text-muted: #475569;      /* slate-600 */
      --text-light: #64748b;      /* slate-500 */
      --border: #e2e8f0;          /* slate-200 */
      --border-subtle: #cbd5e1;   /* slate-300 */
      --surface: #ffffff;
      --surface-subtle: #f8fafc;  /* slate-50 */
      --navy: #0f172a;
      --blue: #2563eb;            /* blue-600 */
      --blue-subtle: #eff6ff;     /* blue-50 */
      --blue-border: #bfdbfe;     /* blue-200 */
      --danger: #991b1b;
      --danger-subtle: #fef2f2;
      --danger-border: #fecaca;
      --emerald: #166534;
      --emerald-subtle: #f0fdf4;
      --emerald-border: #bbf7d0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #0f172a;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: var(--text-main);
      line-height: 1.5;
      padding: 30px 15px;
      -webkit-font-smoothing: antialiased;
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
      padding: 16mm 20mm 14mm 20mm;
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
    /* PORTADA MINIMALISTA & PRO ESTILO CORPORATIVO SPLIT-WAVE  */
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
    /* ESTILOS COMUNES EDITORIALES PARA PÁGINAS DE CONTENIDO    */
    /* ======================================================== */
    .top-eyebrow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--text-main);
      padding-bottom: 7px;
      margin-bottom: 16px;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 1.3px;
      text-transform: uppercase;
      color: var(--text-main);
    }

    .header-layout {
      display: grid;
      grid-template-columns: 1.35fr 1fr;
      gap: 22px;
      margin-bottom: 18px;
      align-items: flex-start;
    }

    .doc-title {
      font-size: 27px;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.15;
      letter-spacing: -0.8px;
      margin-bottom: 6px;
    }

    .doc-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.48;
    }

    .meta-box {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px 14px;
      background: var(--surface-subtle);
      font-size: 11px;
    }

    .meta-line {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    }
    .meta-line:last-child { border-bottom: none; }
    .meta-label { color: var(--text-light); font-weight: 500; font-size: 11px; }
    .meta-val { color: var(--text-main); font-weight: 700; }

    .section-headline {
      font-size: 13.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-main);
      margin-bottom: 11px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 6px;
    }

    .section-subhead {
      font-size: 11.8px;
      color: var(--text-muted);
      margin-top: -5px;
      margin-bottom: 14px;
      line-height: 1.48;
    }

    /* PULL QUOTE / CALLOUT EDITORIAL */
    .callout-box {
      border-left: 4px solid var(--blue);
      background: var(--surface-subtle);
      padding: 12px 16px;
      margin-bottom: 16px;
      border-radius: 0 6px 6px 0;
    }

    .callout-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--blue);
      margin-bottom: 4px;
      display: block;
    }

    .callout-text {
      font-size: 12px;
      color: var(--text-main);
      line-height: 1.5;
    }

    .callout-text strong {
      color: #000;
      font-weight: 700;
    }

    /* COMPARISON GRID (PÁGINA 2) */
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 26px;
      margin-bottom: 18px;
    }

    .col-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid;
    }

    .col-title.problem {
      color: var(--danger);
      border-color: var(--danger-border);
    }

    .col-title.solution {
      color: var(--blue);
      border-color: var(--blue-border);
    }

    .item-block {
      margin-bottom: 12px;
    }
    .item-block:last-child { margin-bottom: 0; }

    .item-title {
      font-size: 11.8px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 2px;
    }

    .item-desc {
      font-size: 11.5px;
      color: var(--text-body);
      line-height: 1.48;
    }

    /* ======================================================== */
    /* MÓDULOS ABIERTOS EDITORIALES (SIN CAJAS ASFIXIANTES)     */
    /* ======================================================== */
    .module-card {
      margin-bottom: 14px;
    }

    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 6px;
    }

    .module-num-title {
      font-size: 13.5px;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .module-pill {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding: 2.5px 8px;
      border-radius: 4px;
      background: var(--blue-subtle);
      color: var(--blue);
      border: 1px solid var(--blue-border);
    }

    .module-target {
      font-size: 11px;
      color: var(--text-light);
      font-weight: 600;
      margin-bottom: 12px;
      display: block;
    }

    .feature-list-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 24px;
    }

    .feature-list-3col {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px 18px;
    }

    .feature-item {
      display: flex;
      flex-direction: column;
    }

    .feat-heading {
      font-size: 11.8px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 3px;
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .feat-num {
      color: var(--blue);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.2px;
    }

    .feat-text {
      font-size: 11.2px;
      color: var(--text-body);
      line-height: 1.48;
    }

    /* ======================================================== */
    /* TABLAS EDITORIALES MODERNAS                              */
    /* ======================================================== */
    .table-container {
      margin-bottom: 14px;
    }

    .editorial-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      text-align: left;
    }

    .editorial-table th {
      background: var(--surface-subtle);
      color: var(--text-main);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-size: 9.5px;
      padding: 8px 12px;
      border-top: 1px solid var(--border);
      border-bottom: 2px solid var(--border-subtle);
    }

    .editorial-table td {
      padding: 7px 12px;
      border-bottom: 1px solid var(--border);
      color: var(--text-body);
      vertical-align: middle;
      line-height: 1.4;
    }

    .editorial-table .td-bold {
      font-weight: 700;
      color: var(--text-main);
    }

    .editorial-table .td-price {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: var(--text-main);
      text-align: right;
      white-space: nowrap;
    }

    .editorial-table th.th-right {
      text-align: right;
    }

    .table-subtotal-row td {
      background: var(--surface-subtle);
      font-weight: 700;
      color: var(--text-main);
    }

    /* TABLA RESUMEN EJECUTIVO (PÁGINA 7) */
    .summary-editorial-table th {
      padding: 5.5px 10px;
      font-size: 9px;
    }

    .summary-editorial-table td {
      padding: 4px 10px;
      font-size: 9.8px;
      line-height: 1.25;
    }

    /* BOLSA DE HORAS EDITORIAL */
    .bolsa-editorial-box {
      border: 1px solid var(--blue-border);
      background: #f8fbff;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }

    .bolsa-editorial-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .bolsa-editorial-title {
      font-size: 12.5px;
      font-weight: 800;
      color: var(--navy);
    }

    .bolsa-editorial-pill {
      font-size: 9.5px;
      font-weight: 800;
      color: var(--emerald);
      background: var(--emerald-subtle);
      border: 1px solid var(--emerald-border);
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .bolsa-editorial-desc {
      font-size: 11.5px;
      color: var(--text-body);
      line-height: 1.45;
      margin-bottom: 10px;
    }

    .bolsa-editorial-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .bolsa-col {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 8px 10px;
    }

    .bolsa-col-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--blue);
      margin-bottom: 3px;
    }

    .bolsa-col-desc {
      font-size: 10.5px;
      color: var(--text-muted);
      line-height: 1.35;
    }

    /* RÉGIMEN FISCAL PILL */
    .fiscal-pill-row {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 9.5px;
      color: #581c87;
      font-weight: 600;
      line-height: 1.4;
      margin-top: 6px;
    }

    /* MARCO LEGAL EDITORIAL (PÁGINA 8) */
    .legal-editorial-grid {
      display: flex;
      flex-direction: column;
      gap: 9px;
      margin-bottom: 18px;
    }

    .legal-card {
      padding: 9px 12px;
      border: 1px solid var(--border);
      border-radius: 5px;
      background: var(--surface-subtle);
    }

    .legal-title {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 3px;
    }

    .legal-text {
      font-size: 11px;
      color: var(--text-body);
      line-height: 1.45;
    }

    /* BLOQUE DE FIRMAS */
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px;
      margin-top: 10px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .sig-col {
      display: flex;
      flex-direction: column;
    }

    .sig-party {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-light);
      margin-bottom: 34px;
    }

    .sig-line {
      border-top: 1px solid var(--text-main);
      margin-bottom: 8px;
    }

    .sig-name {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 2px;
    }

    .sig-meta {
      font-size: 10.5px;
      color: var(--text-light);
      line-height: 1.4;
    }

    /* FOOTER */
    .sheet-footer {
      border-top: 1px solid var(--border);
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--text-light);
      font-weight: 600;
    }

    /* PRINT RULES */
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

      <div class="section-headline">
        1. Resumen Ejecutivo: Diagnóstico y Propuesta de Valor
      </div>
      <p class="section-subhead">
        Las empresas contratistas de telecomunicaciones pierden en promedio entre un 15% y un 25% de su margen operativo debido a glosas, retrasos en la facturación y rechazos de actas de mantenimiento por parte de las operadoras clientes. La plataforma VERTEX estandariza el flujo integral de punta a punta.
      </p>

      <div class="callout-box">
        <span class="callout-title">Diagnóstico de Margen en Empresas Contratistas</span>
        <p class="callout-text">
          La falta de visibilidad en tiempo real y el uso de herramientas informales provocan rechazos técnicos reiterados. <strong>VERTEX</strong> transforma la operación en un flujo auditado y predecible, reduciendo el ciclo de cobro de 45 días a menos de 15 días continuos.
        </p>
      </div>

      <div class="comparison-grid">
        <div>
          <div class="col-title problem">
            Situación Actual (Sin Plataforma)
          </div>

          <div class="item-block">
            <div class="item-title">01. En Campo (Cuadrillas)</div>
            <p class="item-desc">Evidencias desordenadas en chats de WhatsApp, fotos borrosas y fallas por falta de señal en torre.</p>
          </div>

          <div class="item-block">
            <div class="item-title">02. En Coordinación (Seguimiento)</div>
            <p class="item-desc">Carga manual lenta de órdenes, descontrol de visados, retrasos en trámite de HES y falta de auditoría de cambios.</p>
          </div>

          <div class="item-block">
            <div class="item-title">03. En Gerencia (Operaciones)</div>
            <p class="item-desc">Días perdidos maquetando actas en Word/Excel, falta de visibilidad en tiempo real y riesgo ante reclamos del cliente.</p>
          </div>

          <div class="item-block">
            <div class="item-title">04. En Gestión de Formatos</div>
            <p class="item-desc">Formatos rígidos difíciles de adaptar ante los cambios de exigencias normativas de cada operadora.</p>
          </div>
        </div>

        <div>
          <div class="col-title solution">
            Impacto con Sistema VERTEX
          </div>

          <div class="item-block">
            <div class="item-title">01. Campo (Técnicos)</div>
            <p class="item-desc">Captura técnica 100% offline, modo sol de alto contraste y motor fotográfico (foto única o Antes/Después).</p>
          </div>

          <div class="item-block">
            <div class="item-title">02. Seguimiento (Coordinación)</div>
            <p class="item-desc">Carga de órdenes desde plantilla Excel, control de visado/HES y registro detallado de quién editó qué.</p>
          </div>

          <div class="item-block">
            <div class="item-title">03. Administración (Gerencia)</div>
            <p class="item-desc">Telemetría ejecutiva en vivo, actas PDF homologadas compiladas a 1 clic y registro auditado de eventos.</p>
          </div>

          <div class="item-block">
            <div class="item-title">04. Plantillas (Operaciones)</div>
            <p class="item-desc">Flexibilidad para configurar formularios, requerimientos de fotos y diseño de actas sin tocar código.</p>
          </div>
        </div>
      </div>

      <div class="section-headline" style="margin-top: 14px;">
        2. Estructura de la Solución por Módulos y Roles
      </div>
      <p class="section-subhead">
        El sistema se compone de cuatro (4) módulos especializados, diseñados para responder exactamente a la responsabilidad operativa y técnica de cada integrante de la empresa:
      </p>

      <div style="background: var(--surface-subtle); border-left: 3px solid var(--blue); padding: 8px 12px; font-size: 11px; color: var(--text-body); border-radius: 0 4px 4px 0;">
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

      <div class="module-card">
        <div class="module-header">
          <div class="module-num-title">
            <span>OPERACIONES EN SITIO &bull; TERMINAL MÓVIL PWA</span>
          </div>
          <span class="module-pill">PWA Offline-First</span>
        </div>
        <span class="module-target">Perfil: Técnicos de Campo, Cuadrillas de Mantenimiento e Instaladores</span>

        <div class="feature-list-2col">
          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">01.</span> PWA Offline-First (Sin Conexión)
            </div>
            <p class="feat-text">
              Base de datos local indexada en el dispositivo (IndexedDB / Dexie.js). Permite registrar levantamientos íntegros sin internet en zonas rurales o shelters metálicos apantallados. Cero riesgo de pantallas en blanco.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">02.</span> Sincronización Automática
            </div>
            <p class="feat-text">
              Detección inteligente de red (3G/4G/Wi-Fi) con reintentos exponenciales y cola de sincronización visual en segundo plano para asegurar que ningún informe se quede retenido en el teléfono.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">03.</span> Matriz Técnica de 48 Zonas
            </div>
            <p class="feat-text">
              Formulario secuencial guiado para Torre, Shelter, Energía DC/Baterías, Radiofrecuencia y Sistema de Tierra. Evaluación (NORMAL, ALARMA, FALLA) con notas obligatorias ante anomalías.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">04.</span> Motor Fotográfico Adaptativo
            </div>
            <p class="feat-text">
              Soporta flujo de <strong>Evidencia Única</strong> para instalaciones nuevas, swaps o auditorías, y flujo dual <strong>Antes / Después</strong> para correctivos. Compresión WebP (&lt; 250 KB) con preservación de nitidez para seriales.
            </p>
          </div>
        </div>

        <div style="margin-top: 14px;">
          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">05.</span> Modo Sol y Ergonomía de Faena
            </div>
            <p class="feat-text">
              Modo Sol de alto contraste y botones táctiles sobredimensionados (&ge; 48px) para operar bajo luz solar intensa y con guantes de seguridad, eliminando fatiga visual y errores de pulsación.
            </p>
          </div>
        </div>
      </div>

      <div class="callout-box" style="margin-top: 18px;">
        <span class="callout-title">Garantía de Productividad en Faena</span>
        <p class="callout-text">
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

      <div class="module-card">
        <div class="module-header">
          <div class="module-num-title">
            <span>CONSOLA CENTRAL DE OPERACIONES &bull; PIPELINE KANBAN</span>
          </div>
          <span class="module-pill">Pipeline Kanban &bull; Control HES</span>
        </div>
        <span class="module-target">Perfil: Persona de Seguimiento / Coordinador de Operaciones y Facturación Técnica</span>

        <div class="feature-list-2col">
          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">01.</span> Carga de Órdenes desde Excel
            </div>
            <p class="feat-text">
              Importación rápida de órdenes de salida o trabajo mediante plantilla estándar en Excel (código de radiobase, tipo de servicio, fecha y cuadrilla asignada), evitando la carga manual individual.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">02.</span> Pipeline Operativo de 8 Fases
            </div>
            <p class="feat-text">
              Monitoreo del ciclo completo: SIN_EMPEZAR &rarr; EN_VISITA &rarr; ELABORANDO &rarr; REVISION_INTERNA &rarr; ENVIADO &rarr; VISADO &rarr; HES &rarr; FACTURADO.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">03.</span> Revisión y Control de Calidad (QA)
            </div>
            <p class="feat-text">
              Bandeja de auditoría interna para revisar las 48 zonas y la calidad de fotos cargadas, con potestad de aprobar el informe o solicitar subsanaciones inmediatas a la cuadrilla.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">04.</span> Seguimiento de Radicación
            </div>
            <p class="feat-text">
              Registro del estado de entrega del informe al cliente (ENVIADO_AL_CLIENTE), documentando canal de entrega, número de ticket y tiempos de respuesta del inspector de la operadora.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">05.</span> Visado del Cliente y Gestión HES
            </div>
            <p class="feat-text">
              Registro del visto bueno del cliente (VISADO), bloqueo del informe para impedir modificaciones y registro de la Hoja de Entrada de Servicios (HES_SOLICITADA) para habilitar el cobro.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">06.</span> Historial y Auditoría de Cambios
            </div>
            <p class="feat-text">
              Bitácora organizada que registra quién editó el documento, fecha y hora, y el cambio puntual realizado (dato anterior vs. nuevo), garantizando total control antes de la entrega final.
            </p>
          </div>
        </div>
      </div>

      <div class="callout-box" style="margin-top: 18px;">
        <span class="callout-title">Impacto Directo en Flujo de Caja</span>
        <p class="callout-text">
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
      <div class="module-card">
        <div class="module-header">
          <div class="module-num-title">
            <span>CONTROL EJECUTIVO &bull; COMPLIANCE &bull; AUDITORÍA</span>
          </div>
          <span class="module-pill">Panel Gerencial</span>
        </div>
        <span class="module-target">Perfil: Directores Generales, Gerentes de Operaciones y Auditores</span>

        <div class="feature-list-2col">
          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">01.</span> Dashboard & Telemetría
            </div>
            <p class="feat-text">
              Métricas en tiempo real: volumen mensual de radiobases atendidas, tasa de rechazo interno vs. cliente, sitios con recurrencia de alarmas y metas contractuales.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">02.</span> Gestión de Radiobases
            </div>
            <p class="feat-text">
              Catálogo maestro de estaciones celulares con código único, región geográfica, coordenadas oficiales, tipo de estructura y tecnología instalada.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">03.</span> Directorio de Cuadrillas
            </div>
            <p class="feat-text">
              Administración de personal y segregación estricta de roles (Técnico, Seguimiento, Administrador) con control de accesos por usuario y permisos por región.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">04.</span> Generador de Actas PDF A4
            </div>
            <p class="feat-text">
              Compilación a 1 clic de expedientes técnicos homologados listos para radicar, con membrete corporativo, resumen de 48 zonas, mosaicos fotográficos HD y firmas digitales.
            </p>
          </div>
        </div>

        <div style="margin-top: 10px;">
          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">05.</span> Bitácora y Registro de Auditoría
            </div>
            <p class="feat-text">
              Registro inmutable de actividades operativas con fecha, hora y usuario responsable, con opción de consulta histórica y exportación en CSV/JSON para control interno.
            </p>
          </div>
        </div>
      </div>

      <!-- MÓDULO 4 -->
      <div class="section-headline" style="margin-top: 18px;">
        Módulo 4: Gestor de Plantillas (Formularios y Reportes PDF)
      </div>
      <div class="module-card">
        <div class="module-header">
          <div class="module-num-title">
            <span>AUTONOMÍA TOTAL &bull; CERO CÓDIGO</span>
          </div>
          <span class="module-pill">Diseñador Visual</span>
        </div>
        <span class="module-target">Perfil: Administradores y Coordinadores de Operaciones</span>

        <div class="feature-list-3col">
          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">01.</span> Plantillas de Formularios
            </div>
            <p class="feat-text">
              Configuración de campos, preguntas técnicas y datos obligatorios que debe completar el liniero en su terminal móvil según el tipo de servicio o misión.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">02.</span> Personalización del Acta PDF
            </div>
            <p class="feat-text">
              Ajuste de logotipos del cliente y de la contratista, disposición de 2 o 4 fotos por página e inclusión opcional de bloques de seguridad y firmas tripartitas.
            </p>
          </div>

          <div class="feature-item">
            <div class="feat-heading">
              <span class="feat-num">03.</span> Requerimiento de Fotos
            </div>
            <p class="feat-text">
              Definición de evidencias requeridas (foto individual para instalaciones/swaps o fotos comparativas antes/después para mantenimientos preventivos y correctivos).
            </p>
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

      <div class="bolsa-editorial-box">
        <div class="bolsa-editorial-header">
          <div class="bolsa-editorial-title">Bolsa de 20 Horas de Adecuación Técnica Incluidas</div>
          <span class="bolsa-editorial-pill">100% Bonificado en Setup</span>
        </div>
        <p class="bolsa-editorial-desc">
          Dentro del precio de Setup cerrado de <strong>$1,650.00 USD</strong>, se asignan hasta <strong>veinte (20) horas hombre de ingeniería</strong> sin costo adicional para ajustar la plataforma a las directrices exactas de su operación:
        </p>

        <div class="bolsa-editorial-grid">
          <div class="bolsa-col">
            <div class="bolsa-col-title">1. Planilla</div>
            <p class="bolsa-col-desc">Ajuste de nomenclaturas o ítems de las 48 zonas al estándar de su operadora cliente.</p>
          </div>
          <div class="bolsa-col">
            <div class="bolsa-col-title">2. Actas PDF</div>
            <p class="bolsa-col-desc">Inclusión de logotipo, datos fiscales, tipografías y maquetación personalizada de actas.</p>
          </div>
          <div class="bolsa-col">
            <div class="bolsa-col-title">3. Catálogos</div>
            <p class="bolsa-col-desc">Importación inicial del catálogo oficial de radiobases y coordenadas del cliente.</p>
          </div>
          <div class="bolsa-col">
            <div class="bolsa-col-title">4. Parámetros</div>
            <p class="bolsa-col-desc">Calibración de campos obligatorios, umbrales técnicos y reglas de validación de la empresa.</p>
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

      <div class="table-container">
        <table class="editorial-table">
          <thead>
            <tr>
              <th style="width: 25%;">Servicio Cloud (GCP)</th>
              <th style="width: 45%;">Función Operativa</th>
              <th style="width: 15%;">Consumo Estimado</th>
              <th style="width: 15%;" class="th-right">Costo Nube GCP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="td-bold">Google Cloud Run</td>
              <td>Instancia serverless para la PWA, API REST y motor de PDFs (1 vCPU, 1 GB RAM).</td>
              <td>~100k req/mes (0 cold-start)</td>
              <td class="td-price">$15.00 USD</td>
            </tr>
            <tr>
              <td class="td-bold">Cloud SQL for PostgreSQL</td>
              <td>Base de datos transaccional PostgreSQL multi-zona con almacenamiento SSD.</td>
              <td>db-f1-micro (20 GB SSD)</td>
              <td class="td-price">$18.50 USD</td>
            </tr>
            <tr>
              <td class="td-bold">Google Cloud Storage (GCS)</td>
              <td>Repositorio redundante multi-regional para fotos WebP de alta seguridad.</td>
              <td>Hasta 15,000 fotos (~3.5 GB)</td>
              <td class="td-price">$2.50 USD</td>
            </tr>
            <tr>
              <td class="td-bold">Cloud Armor, DNS y SSL</td>
              <td>Resolución DNS ultra-rápida, protección DDoS y certificados TLS 1.3 gestionados.</td>
              <td>Zona DNS + Tráfico (&lt; 20 GB)</td>
              <td class="td-price">$2.50 USD</td>
            </tr>
            <tr>
              <td class="td-bold">Cloud Logging & Monitoring</td>
              <td>Telemetría SRE, detección de incidencias y alertas automáticas al NOC.</td>
              <td>Retención a 30 días de eventos</td>
              <td class="td-price">$1.50 USD</td>
            </tr>
            <tr class="table-subtotal-row">
              <td colspan="3">
                <strong>SUBTOTAL CONSUMO BASE DE NUBE GOOGLE CLOUD:</strong>
                <span style="font-size: 10px; color: var(--text-muted); font-weight: normal; margin-left: 6px;">
                  (Hasta 10 técnicos, 15,000 fotos y 20 GB de tráfico. Sujeto a consumo real).
                </span>
              </td>
              <td class="td-price" style="font-size: 12px;">$40.00 USD <span style="font-size: 9px; font-weight: normal; color: var(--text-light);">/ mes</span></td>
            </tr>
            <tr>
              <td colspan="3">
                <strong>Servicio Gestionado DevOps, Mantenimiento Preventivo y Soporte Nivel 2:</strong>
                <span style="background: #e0f2fe; color: #0369a1; font-size: 8.5px; font-weight: 800; padding: 1px 5px; border-radius: 3px; margin-left: 4px;">OPCIONAL</span><br>
                <span style="font-size: 10px; color: var(--text-muted);">
                  Administración proactiva de infraestructura, aplicación de parches de seguridad, optimización de base de datos y soporte técnico especializado continuo.
                </span>
              </td>
              <td class="td-price" style="color: var(--blue); font-size: 12px;">$80.00 USD <span style="font-size: 9px; font-weight: normal; color: var(--text-light);">/ mes</span></td>
            </tr>
            <tr class="table-total-row">
              <td colspan="3">
                PAQUETE INTEGRAL RECOMENDADO (NUBE BASE + DEVOPS + SOPORTE L2):<br>
                <span style="font-size: 10px; color: var(--blue); font-weight: normal;">
                  (Si la empresa no contrata DevOps/Soporte L2, la facturación mensual será únicamente el costo neto de nube de $40.00 USD base).
                </span>
              </td>
              <td class="td-price" style="color: #1e3a8a; font-size: 13px;">$120.00 USD <span style="font-size: 9.5px; font-weight: normal; color: #1e3a8a;">/ mes</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="callout-box" style="margin-bottom: 0;">
        <span class="callout-title">Cláusula de Escalabilidad Cloud</span>
        <p class="callout-text" style="font-size: 11px;">
          La estimación base de $40.00 USD ampara con holgura hasta diez (10) cuadrillas concurrentes, 15,000 fotos en la nube y 20 GB de transferencia mensual. El gasto aumentará si hay mayor tráfico o técnicos del estimado base, facturándose a costo neto de la factura oficial de Google Cloud (+ 15% de gastos administrativos si es intermediada). El Servicio Gestionado DevOps ($80.00 USD/mes) es totalmente opcional.
        </p>
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

      <div class="table-container" style="margin-bottom: 8px;">
        <table class="editorial-table summary-editorial-table">
          <thead>
            <tr>
              <th style="width: 25%;">Concepto</th>
              <th style="width: 40%;">Detalle de Entregables</th>
              <th style="width: 20%;">Condición / Modalidad</th>
              <th style="width: 15%;" class="th-right">Monto Neto (USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="td-bold">1. Setup e Implementación Base</td>
              <td>Puesta en producción de los 4 Módulos (Campo, Seguimiento, Administración y Plantillas), despliegue en Google Cloud y configuración de catálogos.</td>
              <td>3 pagos fraccionados de <strong>$550.00 USD</strong>:<br>&bull; 33.3% Firma / Kick-off<br>&bull; 33.3% Demostración Staging<br>&bull; 33.4% Pase a Producción</td>
              <td class="td-price" style="color: var(--blue); font-size: 13px;">$1,650.00 USD<br><span style="font-size: 8.5px; color: var(--text-light); font-weight: normal;">(Pago Único)</span></td>
            </tr>
            <tr style="background: var(--surface-subtle);">
              <td class="td-bold">2. Adecuaciones y Personalización</td>
              <td><strong>Bolsa de hasta 20 horas libres</strong> para calibrar planillas, campos de 48 zonas, diseño del PDF con logo y reglas de validación técnica.</td>
              <td><strong>100% Bonificado</strong> dentro de la tarifa de Setup (No genera cobros extras).</td>
              <td class="td-price" style="color: var(--emerald); font-size: 12px;">INCLUIDO</td>
            </tr>
            <tr>
              <td class="td-bold">3. Infraestructura Cloud Base (GCP)</td>
              <td>Servidores Google Cloud de alta disponibilidad, base de datos PostgreSQL, almacenamiento (hasta 15,000 fotos) y red para 10 cuadrillas.<br><span style="font-size: 9.5px; color: var(--text-muted);"><em>(Aumentará si hay mayor tráfico o almacenamiento).</em></span></td>
              <td>Requerido para operación en línea. Facturación a mes vencido según consumo real GCP.<br><em>(Primeros 30 días con garantía técnica gratuita).</em></td>
              <td class="td-price" style="font-size: 11.5px;">$40.00 USD / mes<br><span style="font-size: 8.5px; color: var(--text-light); font-weight: normal;">(Base sujeta a consumo)</span></td>
            </tr>
            <tr style="background: var(--surface-subtle);">
              <td class="td-bold">4. DevOps y Soporte L2 <span style="background: #e0f2fe; color: #0369a1; font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 3px;">OPCIONAL</span></td>
              <td>Mantenimiento preventivo de infraestructura, parches de seguridad, optimización de base de datos y soporte técnico especializado.<br><span style="font-size: 9.5px; color: #047857;"><em>(Contratado junto a la nube conforma el paquete de $120.00 USD / mes).</em></span></td>
              <td><strong>Modalidad Opcional</strong>. Contratación mensual flexible mes a mes.</td>
              <td class="td-price" style="color: var(--blue); font-size: 11.5px;">$80.00 USD / mes<br><span style="font-size: 8.5px; color: var(--text-light); font-weight: normal;">(Opcional)</span></td>
            </tr>
            <tr>
              <td class="td-bold">5. Soporte Ad-Hoc (Bajo Demanda)</td>
              <td>Intervenciones técnicas puntuales bajo demanda en caso de prescindir del servicio mensual de soporte L2.</td>
              <td>Bajo demanda con cargo mínimo de 2 horas (SLA de 24-48 horas laborables).</td>
              <td class="td-price" style="font-size: 10px;">$40.00 / h (Estándar)<br>$50.00 / h (Emergencia)</td>
            </tr>
            <tr style="background: var(--surface-subtle);">
              <td class="td-bold">6. Tiempo de Ejecución Total</td>
              <td>Despliegue de infraestructura, parametrización, pruebas de campo y 2 sesiones de capacitación formal al personal.</td>
              <td>Cronograma ágil de <strong>3 a 4 semanas</strong> desde el anticipo inicial.</td>
              <td class="td-price" style="font-family: sans-serif; font-size: 11px;">Garantizado</td>
            </tr>
            <tr>
              <td class="td-bold">7. Soporte Post-Implementación</td>
              <td><strong>1 mes continuo (30 días)</strong> de soporte de estabilización para corrección exclusiva de fallas sobre funcionalidades delimitadas en el contrato.<br><span style="font-size: 9.5px; color: #1e40af;"><em>(Cualquier cambio de alcance tras aprobación será cotizado adicionalmente).</em></span></td>
              <td>A partir del pase formal a producción y entrega del sistema.</td>
              <td class="td-price" style="color: #1e40af; font-size: 11.5px;">INCLUIDO<br><span style="font-size: 8.5px; color: var(--text-light); font-weight: normal;">(30 Días)</span></td>
            </tr>
            <tr style="background: var(--surface-subtle); border-bottom: 2px solid var(--border-subtle);">
              <td class="td-bold">8. Licencia y Términos Contractuales</td>
              <td>Licencia de uso comercial perpetua (sin cobro mensual por usuario), exoneración total por modificación de código y límite de responsabilidad.</td>
              <td>Condiciones de protección legal mutua para ambas partes.</td>
              <td class="td-price" style="font-family: sans-serif; font-size: 11px;">Incluido</td>
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

      <div class="legal-editorial-grid">
        <div class="legal-card">
          <div class="legal-title">1. Licencia de Uso Comercial Perpetua (Sin cobro recurrente por usuario)</div>
          <p class="legal-text">
            EL PROVEEDOR concede a LA EMPRESA una licencia de uso comercial, no exclusiva e intransferible para operar la plataforma en sus labores ordinarias de telecomunicaciones. Dicha licencia queda 100% amortizada y concedida mediante el pago único de Setup inicial, sin cobros mensuales por cantidad de técnicos, cuadrillas o usuarios registrados.
          </p>
        </div>

        <div class="legal-card">
          <div class="legal-title">2. Garantía Técnica y Soporte Post-Implementación (Periodo de Estabilización)</div>
          <p class="legal-text">
            A partir de la entrega formal y pase a producción del sistema, EL PROVEEDOR otorga un periodo de soporte de estabilización y garantía técnica de un (1) mes continuo (30 días calendario) sin costo adicional. Ampara única y exclusivamente la corrección de errores de programación (bugs), fallas operativas o discrepancias técnicas atribuibles a las funcionalidades expresamente contratadas. Esta garantía no contempla nuevas funcionalidades ni alteraciones posteriores a la recepción conforme.
          </p>
        </div>

        <div class="legal-card">
          <div class="legal-title">3. Exoneración Total por Alteración o Modificación del Código / Sistema</div>
          <p class="legal-text">
            Queda terminantemente prohibida la modificación, alteración, descompilación o manipulación directa del código fuente, bases de datos o infraestructura del sistema por personal de LA EMPRESA o terceros ajenos al PROVEEDOR. En caso de detectarse cualquier alteración no autorizada, cesará de pleno derecho cualquier garantía técnica o SLA, quedando el PROVEEDOR completamente exonerado de responsabilidad operativa.
          </p>
        </div>

        <div class="legal-card">
          <div class="legal-title">4. Límite Máximo de Responsabilidad (Liability Cap)</div>
          <p class="legal-text">
            La responsabilidad patrimonial máxima acumulada del PROVEEDOR ante cualquier reclamo o eventualidad estará expresamente limitada al monto efectivamente percibido por concepto de la tarifa inicial de Setup ($1,650.00 USD).
          </p>
        </div>

        <div class="legal-card">
          <div class="legal-title">5. Régimen Tributario e Impuestos de Ley</div>
          <p class="legal-text">
            La totalidad de las tarifas, montos de implementación, cánones de infraestructura y honorarios técnicos estipulados corresponden a valores netos expresados en Dólares Americanos (USD). Sobre cada pago se adicionará el Impuesto al Valor Agregado (IVA) o gravamen tributario aplicable conforme a la normativa fiscal vigente.
          </p>
        </div>
      </div>
    </div>

    <div>
      <!-- FIRMAS BILATERALES -->
      <div class="signature-grid">
        <div class="sig-col">
          <div class="sig-party">Por el Proveedor Tecnológico</div>
          <div class="sig-line"></div>
          <div class="sig-name">Nombre: _________________________________________</div>
          <div class="sig-meta">
            C.I. / RIF: _________________________________________<br>
            Cargo: Titular & Arquitecto Técnico VERTEX
          </div>
        </div>

        <div class="sig-col">
          <div class="sig-party">Por la Empresa Contratante</div>
          <div class="sig-line"></div>
          <div class="sig-name">Razón Social: _____________________________________</div>
          <div class="sig-meta">
            RIF / Registro: _____________________________________<br>
            Representante: ______________________________________<br>
            Cargo / C.I.: ________________________________________
          </div>
        </div>
      </div>

      <div class="sheet-footer" style="margin-top: 14px;">
        <span>VERTEX &bull; Propuesta Técnico-Comercial B2B</span>
        <span>Documento Privado y Confidencial &bull; Página 8 de 8</span>
      </div>
    </div>
  </div>

</div>

</body>
</html>
`;

const outputPath = path.join(__dirname, '../docs/PROPUESTA_COMERCIAL_SISBIR.html');
fs.writeFileSync(outputPath, htmlContent, 'utf8');
console.log('Successfully updated docs/PROPUESTA_COMERCIAL_SISBIR.html with 100% restored content and new editorial styles!');
