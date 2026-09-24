'use client';

import React from 'react';
import Link from 'next/link';

export default function ReportePDFPage({ params }: { params: { id: string } }) {
  // Datos representativos del reporte oficial de producción
  const reporte = {
    id: params.id || 'rep-001',
    codigo: 'RDB-001_20260922',
    radiobase: 'Torre Puerto Madero',
    region: 'AMBA / CABA',
    tecnologia: '4G / 5G LTE',
    tipoTorre: 'Mástil Autosoportado',
    tecnico: 'Gerson Martínez',
    cedulaTecnico: 'V-24.891.203',
    supervisor: 'Ing. Roberto Silva',
    cedulaSupervisor: 'V-18.442.109',
    fecha: '2026-09-22',
    estado: 'APROBADO',
    hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    datosRed: {
      ipWan: '190.210.45.12',
      ipLan: '192.168.100.1',
      gateway: '190.210.45.1',
      mascara: '255.255.255.248',
      vlanId: '104',
      dns1: '8.8.8.8',
      dns2: '1.1.1.1',
    },
    equipos: [
      { desc: 'Panel de Alarma Híbrido AX PRO', modelo: 'DS-PHA64-LP', serial: 'HKV-2026-9921', cant: 1 },
      { desc: 'Cámara Domo IP 4K ColorVu', modelo: 'DS-2CD2187G2-LSU', serial: 'HKV-CAM-8831', cant: 2 },
      { desc: 'Sensor PIR Anti-enmascaramiento', modelo: 'DS-PD2-P10P-W', serial: 'HKV-PIR-4410', cant: 4 },
      { desc: 'Grabador NVR 16 Canales PoE', modelo: 'DS-7616NXI-I2/16P', serial: 'HKV-NVR-1120', cant: 1 },
    ],
    evidencias: [
      {
        slot: 1,
        tipo: 'CAMARA',
        nombre: 'Cámara Domo Perimetral',
        antes: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
        estado: 'APROBADO',
      },
      {
        slot: 2,
        tipo: 'PIR',
        nombre: 'Sensor PIR Infrarrojo',
        antes: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
        estado: 'APROBADO',
      },
      {
        slot: 3,
        tipo: 'BOTON',
        nombre: 'Botón de Pánico Baliza',
        antes: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&auto=format&fit=crop&q=80',
        estado: 'APROBADO',
      },
      {
        slot: 4,
        tipo: 'TECLADO',
        nombre: 'Teclado de Alarma y Acceso',
        antes: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        estado: 'APROBADO',
      },
      {
        slot: 5,
        tipo: 'DVR',
        nombre: 'DVR / Grabador NVR',
        antes: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&auto=format&fit=crop&q=80',
        estado: 'APROBADO',
      },
      {
        slot: 6,
        tipo: 'TABLERO',
        nombre: 'Tablero Eléctrico Principal',
        antes: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
        despues: 'https://images.unsplash.com/photo-1581092787765-7351c2807e3d?w=600&auto=format&fit=crop&q=80',
        estado: 'APROBADO',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      {/* BARRA DE CONTROL SUPERIOR (OCULTA AL IMPRIMIR) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/reportes"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1"
        >
          &larr; Volver al Panel de Reportes
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2"
        >
          <span>Imprimir / Exportar a PDF</span>
        </button>
      </div>

      {/* DOCUMENTO FORMAL IMPRESO */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0">
        {/* HEADER INSTITUCIONAL */}
        <div className="border-b border-slate-200 pb-6 mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                SISBIRCECA
              </span>
              <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase font-mono">
                Certificación Técnica Oficial
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Reporte de Intervención Técnica en Radiobase
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Código Único: {reporte.codigo} &middot; Emisión: {reporte.fecha}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase px-3 py-1 rounded-md mb-1 font-mono">
              ✓ {reporte.estado}
            </span>
            <div className="text-[10px] text-slate-400 font-mono">
              SHA-256: {reporte.hashSha256.substring(0, 16)}...
            </div>
          </div>
        </div>

        {/* METADATOS DEL SITIO Y PERSONAL */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs">
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase">Radiobase</span>
            <span className="font-bold text-slate-900">{reporte.radiobase}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase">Región / Tipo</span>
            <span className="font-bold text-slate-900">{reporte.region} ({reporte.tipoTorre})</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase">Técnico</span>
            <span className="font-bold text-slate-900">{reporte.tecnico} ({reporte.cedulaTecnico})</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase">Supervisor QA</span>
            <span className="font-bold text-slate-900">{reporte.supervisor}</span>
          </div>
        </div>

        {/* CONFIGURACION DE RED */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            1. Parámetros de Conectividad & Red
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
            <div className="p-2 border border-slate-200 rounded bg-slate-50">
              <span className="block text-[9px] text-slate-500 font-bold uppercase">IP WAN</span>
              <span className="font-mono font-bold text-slate-800">{reporte.datosRed.ipWan}</span>
            </div>
            <div className="p-2 border border-slate-200 rounded bg-slate-50">
              <span className="block text-[9px] text-slate-500 font-bold uppercase">IP LAN</span>
              <span className="font-mono font-bold text-slate-800">{reporte.datosRed.ipLan}</span>
            </div>
            <div className="p-2 border border-slate-200 rounded bg-slate-50">
              <span className="block text-[9px] text-slate-500 font-bold uppercase">Gateway</span>
              <span className="font-mono font-bold text-slate-800">{reporte.datosRed.gateway}</span>
            </div>
            <div className="p-2 border border-slate-200 rounded bg-slate-50">
              <span className="block text-[9px] text-slate-500 font-bold uppercase">Máscara</span>
              <span className="font-mono font-bold text-slate-800">{reporte.datosRed.mascara}</span>
            </div>
            <div className="p-2 border border-slate-200 rounded bg-slate-50">
              <span className="block text-[9px] text-slate-500 font-bold uppercase">VLAN ID</span>
              <span className="font-mono font-bold text-slate-800">{reporte.datosRed.vlanId}</span>
            </div>
            <div className="p-2 border border-slate-200 rounded bg-slate-50">
              <span className="block text-[9px] text-slate-500 font-bold uppercase">DNS</span>
              <span className="font-mono font-bold text-slate-800">{reporte.datosRed.dns1}</span>
            </div>
          </div>
        </div>

        {/* EQUIPOS INSTALADOS */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            2. Inventario de Equipos Homologados
          </h2>
          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-2 text-left">Descripción del Equipo</th>
                <th className="p-2 text-left">Modelo</th>
                <th className="p-2 text-left">Número de Serial</th>
                <th className="p-2 text-center">Cant.</th>
              </tr>
            </thead>
            <tbody>
              {reporte.equipos.map((eq, i) => (
                <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2 font-bold text-slate-800">{eq.desc}</td>
                  <td className="p-2 font-mono text-slate-600">{eq.modelo}</td>
                  <td className="p-2 font-mono text-slate-600">{eq.serial}</td>
                  <td className="p-2 text-center font-bold">{eq.cant}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EVIDENCIAS FOTOGRAFICAS (ANTES / DESPUES) */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            3. Registro Fotográfico Comparativo (Antes vs Después)
          </h2>
          <div className="space-y-4">
            {reporte.evidencias.map((ev) => (
              <div key={ev.slot} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Slot #{ev.slot}: {ev.nombre} ({ev.tipo})
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Validado Visualmente
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500 mb-1">
                      ESTADO ANTERIOR (ANTES)
                    </span>
                    <div className="aspect-video rounded overflow-hidden border border-slate-300">
                      <img src={ev.antes} alt="Antes" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-emerald-700 mb-1">
                      ESTADO FINAL (DESPUÉS)
                    </span>
                    <div className="aspect-video rounded overflow-hidden border border-emerald-300">
                      <img src={ev.despues} alt="Después" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MATRIZ DE 48 ZONAS (RESUMEN) */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            4. Resumen Matriz de 48 Zonas Técnicas
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-[10px] text-center">
            {Array.from({ length: 48 }, (_, i) => (
              <div
                key={i}
                className={`p-1 border rounded ${
                  i === 2 ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Z{i + 1}: {i === 2 ? 'ALR' : 'OK'}
              </div>
            ))}
          </div>
        </div>

        {/* FIRMAS Y SELLO INMUTABLE */}
        <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-48 border-b-2 border-slate-400 mb-2 pb-1 font-signature text-base text-slate-700">
              Gerson Martínez
            </div>
            <span className="font-extrabold text-slate-900">{reporte.tecnico}</span>
            <span className="text-[10px] text-slate-500">Técnico Instalador Certificado</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-48 border-b-2 border-slate-800 mb-2 pb-1 font-signature text-base text-slate-800 font-bold">
              Ing. Roberto Silva
            </div>
            <span className="font-extrabold text-slate-900">{reporte.supervisor}</span>
            <span className="text-[10px] text-slate-500">Supervisor de Calidad & Operaciones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
