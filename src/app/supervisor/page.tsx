'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  User,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface EdicionDocumento {
  id: string;
  timestamp: string;
  autor: {
    nombre: string;
    rol: 'TECNICO' | 'SUPERVISOR' | 'ADMINISTRADOR';
    avatar: string;
  };
  campoEditado: string;
  categoria: 'DATOS_TECNICOS' | 'FOTOGRAFIAS' | 'SUBSISTEMAS' | 'ESTADO_FLUJO';
  valorAnterior: string;
  valorNuevo: string;
  motivo: string;
}

interface ExpedienteSupervisor {
  id: string;
  codigoExpediente: string;
  sitio: string;
  codigoSitio: string;
  region: string;
  estado: 'REVISION_INTERNA' | 'ENVIADO_AL_CLIENTE' | 'VISADO' | 'HES_SOLICITADA' | 'FACTURADO';
  tecnicoResponsable: string;
  ultimaModificacion: string;
  totalEdiciones: number;
  ediciones: EdicionDocumento[];
}

const MOCK_EXPEDIENTES: ExpedienteSupervisor[] = [
  {
    id: 'exp-1',
    codigoExpediente: 'EXP-2026-001',
    sitio: 'Torre Puerto Madero',
    codigoSitio: 'RDB-001',
    region: 'Gran Caracas',
    estado: 'REVISION_INTERNA',
    tecnicoResponsable: 'Gerson Martínez',
    ultimaModificacion: '05/10/2026 11:35',
    totalEdiciones: 4,
    ediciones: [
      {
        id: 'ed-101',
        timestamp: '05/10/2026 11:35:22',
        autor: { nombre: 'Gerson Martínez', rol: 'TECNICO', avatar: 'GM' },
        campoEditado: 'Fotografía Slot 02 - Banco de Baterías',
        categoria: 'FOTOGRAFIAS',
        valorAnterior: 'foto_baterias_oscura.webp (Rechazada por QA)',
        valorNuevo: 'foto_baterias_iluminada_con_flash.webp (Aprobada)',
        motivo: 'Subsanación: Se repitió la captura con mejor iluminación a petición de supervisión.'
      },
      {
        id: 'ed-102',
        timestamp: '05/10/2026 11:15:08',
        autor: { nombre: 'Luis E. Rodríguez', rol: 'SUPERVISOR', avatar: 'LR' },
        campoEditado: 'Observación Técnica de Control de Calidad',
        categoria: 'SUBSISTEMAS',
        valorAnterior: 'Pendiente de revisión inicial',
        valorNuevo: 'Rechazo preventivo: La foto de bornes no permitía leer el serial de la celda 4.',
        motivo: 'Auditoría interna: Evitar rechazo por parte del inspector de Digitel.'
      },
      {
        id: 'ed-103',
        timestamp: '05/10/2026 10:48:40',
        autor: { nombre: 'Gerson Martínez', rol: 'TECNICO', avatar: 'GM' },
        campoEditado: 'Lectura VSWR Sector Alpha (700 MHz)',
        categoria: 'DATOS_TECNICOS',
        valorAnterior: '1.45 (Alerta preventiva)',
        valorNuevo: '1.18 (Óptimo homologado)',
        motivo: 'Ajuste de torque en conector DIN 7/16 y re-medición con Site Master.'
      },
      {
        id: 'ed-104',
        timestamp: '05/10/2026 10:02:15',
        autor: { nombre: 'Gerson Martínez', rol: 'TECNICO', avatar: 'GM' },
        campoEditado: 'Estado de Apertura de Intervención',
        categoria: 'ESTADO_FLUJO',
        valorAnterior: 'SIN_EMPEZAR',
        valorNuevo: 'EN_VISITA -> ELABORANDO_INFORME',
        motivo: 'Ingreso a estación de telecomunicaciones y apertura de planilla técnica.'
      }
    ]
  },
  {
    id: 'exp-2',
    codigoExpediente: 'EXP-2026-002',
    sitio: 'Cerro El Ávila Repetidora',
    codigoSitio: 'RDB-002',
    region: 'Central',
    estado: 'ENVIADO_AL_CLIENTE',
    tecnicoResponsable: 'Carlos Gómez',
    ultimaModificacion: '04/10/2026 16:40',
    totalEdiciones: 3,
    ediciones: [
      {
        id: 'ed-201',
        timestamp: '04/10/2026 16:40:12',
        autor: { nombre: 'Luis E. Rodríguez', rol: 'SUPERVISOR', avatar: 'LR' },
        campoEditado: 'Radicación de Informe ante Operadora',
        categoria: 'ESTADO_FLUJO',
        valorAnterior: 'REVISION_INTERNA (Aprobado)',
        valorNuevo: 'ENVIADO_AL_CLIENTE (Ticket DIG-8841)',
        motivo: 'Expediente técnico revisado y enviado por portal contratista al inspector Digitel.'
      },
      {
        id: 'ed-202',
        timestamp: '04/10/2026 15:20:00',
        autor: { nombre: 'Carlos Gómez', rol: 'TECNICO', avatar: 'CG' },
        campoEditado: 'Serial RRU Ericsson 4415 B28',
        categoria: 'DATOS_TECNICOS',
        valorAnterior: 'KRC161688/1',
        valorNuevo: 'KRC161688/1 - Rev R1B (Corregido dígito de chequeo)',
        motivo: 'Corrección tipográfica al verificar etiqueta física en torre.'
      },
      {
        id: 'ed-203',
        timestamp: '04/10/2026 14:10:33',
        autor: { nombre: 'Carlos Gómez', rol: 'TECNICO', avatar: 'CG' },
        campoEditado: 'Apertura de Reporte',
        categoria: 'ESTADO_FLUJO',
        valorAnterior: 'SIN_EMPEZAR',
        valorNuevo: 'ELABORANDO_INFORME',
        motivo: 'Inicio de levantamiento de 48 zonas en sitio.'
      }
    ]
  },
  {
    id: 'exp-3',
    codigoExpediente: 'EXP-2026-003',
    sitio: 'Guatire Centro Conexión',
    codigoSitio: 'RDB-003',
    region: 'Miranda',
    estado: 'VISADO',
    tecnicoResponsable: 'Gerson Martínez',
    ultimaModificacion: '04/10/2026 18:10',
    totalEdiciones: 2,
    ediciones: [
      {
        id: 'ed-301',
        timestamp: '04/10/2026 18:10:00',
        autor: { nombre: 'Luis E. Rodríguez', rol: 'SUPERVISOR', avatar: 'LR' },
        campoEditado: 'Estatus de Aprobación por Inspector Digitel',
        categoria: 'ESTADO_FLUJO',
        valorAnterior: 'ENVIADO_AL_CLIENTE',
        valorNuevo: 'VISADO (Acta N° ACT-2026-904)',
        motivo: 'Inspector de operadora firmó conformidad técnica sin observaciones. Expediente bloqueado para edición.'
      },
      {
        id: 'ed-302',
        timestamp: '04/10/2026 12:30:11',
        autor: { nombre: 'Gerson Martínez', rol: 'TECNICO', avatar: 'GM' },
        campoEditado: 'Medición de Resistencia de Puesta a Tierra',
        categoria: 'DATOS_TECNICOS',
        valorAnterior: '4.8 Ohms',
        valorNuevo: '3.2 Ohms',
        motivo: 'Limpieza de barra equipotencial y re-apriete de conectores exotérmicos.'
      }
    ]
  }
];

export default function SupervisorAuditoriaPage() {
  const [expedientes] = useState<ExpedienteSupervisor[]>(MOCK_EXPEDIENTES);
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState<ExpedienteSupervisor>(MOCK_EXPEDIENTES[0]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  const edicionesFiltradas = expedienteSeleccionado.ediciones.filter(ed => {
    const matchCat = filtroCategoria === 'TODOS' || ed.categoria === filtroCategoria;
    const matchBusqueda =
      ed.campoEditado.toLowerCase().includes(busqueda.toLowerCase()) ||
      ed.autor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      ed.motivo.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusqueda;
  });

  const getEstadoBadge = (estado: ExpedienteSupervisor['estado']) => {
    switch (estado) {
      case 'REVISION_INTERNA':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-300">Revisión Interna (QA)</span>;
      case 'ENVIADO_AL_CLIENTE':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-purple-100 text-purple-800 border border-purple-300">Enviado a Digitel</span>;
      case 'VISADO':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">Visado Oficial (Aprobado)</span>;
      case 'HES_SOLICITADA':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-300">HES Solicitada (SAP)</span>;
      case 'FACTURADO':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-900 text-white">Facturado / Cobrado</span>;
      default:
        return null;
    }
  };

  const getCategoriaLabel = (cat: EdicionDocumento['categoria']) => {
    switch (cat) {
      case 'DATOS_TECNICOS':
        return <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Dato Técnico RF / Parámetro</span>;
      case 'FOTOGRAFIAS':
        return <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Evidencia Fotográfica</span>;
      case 'SUBSISTEMAS':
        return <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Subsanación QA</span>;
      case 'ESTADO_FLUJO':
        return <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">Cambio de Estatus Pipeline</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER DE MANDO DEL SUPERVISOR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Módulo 2: Coordinación y Seguimiento
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Rol Supervisor / Auditor QA
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Auditoría y Trazabilidad de Edición de Documentos
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Control granular de cambios: visualice <strong>quién</strong> modificó el documento técnico, <strong>cuándo</strong> se realizó el cambio y <strong>cómo</strong> fue alterado (valor anterior vs. nuevo) antes de elevarlo al cliente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/reportes"
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Pipeline Kanban
            </Link>
            <Link
              href="/admin/expedientes"
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" /> Expedientes PDF
            </Link>
          </div>
        </div>

        {/* MÉTRICAS RÁPIDAS DEL SUPERVISOR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendientes de Revisión (QA)</div>
            <div className="text-2xl font-black text-amber-600 mt-1">1</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Requieren auditoría de fotos/datos</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enviados a Operadora</div>
            <div className="text-2xl font-black text-purple-600 mt-1">1</div>
            <div className="text-[11px] text-slate-400 mt-0.5">En espera de visado por inspector</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visados Oficiales</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">1</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Aprobados y listos para HES</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trazabilidad Total</div>
            <div className="text-2xl font-black text-slate-900 mt-1">100%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Cero ediciones anónimas</div>
          </div>
        </div>

        {/* CUERPO PRINCIPAL: SELECTOR DE DOCUMENTO + BITÁCORA ORGANIZADA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LISTA LATERAL DE EXPEDIENTES / DOCUMENTOS (4 COLS) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" /> Documentos Activos
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{expedientes.length} órdenes</span>
            </div>

            <div className="space-y-2">
              {expedientes.map((exp) => {
                const activo = exp.id === expedienteSeleccionado.id;
                return (
                  <div
                    key={exp.id}
                    onClick={() => setExpedienteSeleccionado(exp)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      activo
                        ? 'bg-blue-50/60 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {exp.codigoExpediente}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-0.5">{exp.sitio}</h4>
                      </div>
                      {getEstadoBadge(exp.estado)}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> {exp.tecnicoResponsable}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[10px] text-blue-700 bg-blue-100/50 px-1.5 py-0.5 rounded">
                        <History className="w-3 h-3" /> {exp.totalEdiciones} cambios
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PANEL DETALLADO DE AUDITORÍA Y CONTROL DE CAMBIOS (8 COLS) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* CABECERA DEL DOCUMENTO SELECCIONADO */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {expedienteSeleccionado.codigoExpediente}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-600">
                    {expedienteSeleccionado.codigoSitio}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  {expedienteSeleccionado.sitio} ({expedienteSeleccionado.region})
                </h2>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                  <span>Técnico: <strong>{expedienteSeleccionado.tecnicoResponsable}</strong></span>
                  <span>Último cambio: <strong>{expedienteSeleccionado.ultimaModificacion}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {getEstadoBadge(expedienteSeleccionado.estado)}
              </div>
            </div>

            {/* FILTROS DE AUDITORÍA DE EDICIÓN */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por usuario, campo editado o motivo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="TODOS">Todos los campos</option>
                  <option value="DATOS_TECNICOS">Datos Técnicos RF</option>
                  <option value="FOTOGRAFIAS">Fotografías</option>
                  <option value="SUBSISTEMAS">Observaciones QA</option>
                  <option value="ESTADO_FLUJO">Cambios de Estatus</option>
                </select>
              </div>
            </div>

            {/* CRONOLOGÍA DE EDICIONES DEL DOCUMENTO (EL QUIÉN, CUÁNDO Y CÓMO) */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Historial Cronológico de Modificaciones ({edicionesFiltradas.length})
              </h3>

              {edicionesFiltradas.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No se encontraron registros de edición con los filtros seleccionados.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {edicionesFiltradas.map((ed) => (
                    <div key={ed.id} className="relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors">
                      {/* INDICADOR CIRCULAR DEL TIMELINE */}
                      <span className="absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600"></span>

                      {/* ENCABEZADO DE LA EDICIÓN: AUTOR + TIMESTAMP */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                            {ed.autor.avatar}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-900">{ed.autor.nombre}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5 font-medium uppercase">
                              ({ed.autor.rol})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getCategoriaLabel(ed.categoria)}
                          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ed.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* DETALLE DEL CAMBIO: QUÉ Y CÓMO (DIFF ORGANIZADO) */}
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-bold text-slate-800">
                          Campo Modificado: <span className="text-blue-700">{ed.campoEditado}</span>
                        </div>

                        {/* MATRIZ ANTES VS DESPUÉS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2.5 rounded-lg bg-red-50/70 border border-red-200">
                            <span className="block text-[10px] font-sans font-bold uppercase text-red-600 mb-1">
                              Valor Anterior (Antes)
                            </span>
                            <span className="text-red-900 break-words">{ed.valorAnterior}</span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                            <span className="block text-[10px] font-sans font-bold uppercase text-emerald-600 mb-1">
                              Valor Modificado (Después)
                            </span>
                            <span className="text-emerald-900 break-words font-semibold">{ed.valorNuevo}</span>
                          </div>
                        </div>

                        {/* JUSTIFICACIÓN / MOTIVO */}
                        <div className="pt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Motivo registrado:</strong> {ed.motivo}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACCIÓN FINAL DE CERTIFICACIÓN POR EL SUPERVISOR */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
              <div className="text-xs text-blue-900">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Certificación de Auditoría Interna
                </span>
                <p className="text-[11px] text-blue-700/80 mt-0.5">
                  Al visar este documento, se sella el historial de cambios y queda registrado el visto bueno de supervisión.
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert(`Expediente ${expedienteSeleccionado.codigoExpediente} certificado y listo para envío al cliente.`)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Check className="w-4 h-4" /> Certificar y Aprobar Documento
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
