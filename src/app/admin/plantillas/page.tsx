'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  FileText,
  Smartphone,
  Plus,
  Check,
  Eye,
  Settings2,
  Trash2,
  Copy,
  Download,
  Upload,
  ArrowRight,
  ShieldCheck,
  Camera,
  CheckSquare,
  Hash,
  Sliders,
  Sparkles,
  Save
} from 'lucide-react';

interface CampoPlantilla {
  id: string;
  etiqueta: string;
  tipo: 'CHECKLIST' | 'NUMERO' | 'TEXTO' | 'FOTO_UNICA' | 'FOTO_DUAL';
  obligatorio: boolean;
  seccion: string;
}

interface Plantilla {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  version: string;
  tipoMision: 'MANTENIMIENTO' | 'INSTALACION_SWAP' | 'AUDITORIA_ELECTRICA' | 'EMERGENCIA';
  reglaFotos: 'UNICA' | 'DUAL_ANTES_DESPUES' | 'MIXTA';
  campos: CampoPlantilla[];
  configPdf: {
    mostrarLogoContratista: boolean;
    mostrarLogoCliente: boolean;
    disposicionFotosPorPagina: number; // 2 o 4
    incluirBloqueHES: boolean;
    incluirFirmasTripartitas: boolean;
  };
}

const PLANTILLAS_INICIALES: Plantilla[] = [
  {
    id: 'plt-1',
    codigo: 'PLT-PREV-48Z',
    nombre: 'Mantenimiento Preventivo Homologado (48 Zonas)',
    descripcion: 'Plantilla estándar para rutinas de mantenimiento con evaluación de los 5 subsistemas normativos y registro fotográfico.',
    version: '2.1',
    tipoMision: 'MANTENIMIENTO',
    reglaFotos: 'DUAL_ANTES_DESPUES',
    campos: [
      { id: 'c1', etiqueta: 'Inspección Estructural de Torre y Tensores', tipo: 'CHECKLIST', obligatorio: true, seccion: 'Subsistema 1: Torre' },
      { id: 'c2', etiqueta: 'Foto Evidencia Antes / Después', tipo: 'FOTO_DUAL', obligatorio: true, seccion: 'Subsistema 1: Torre' },
      { id: 'c3', etiqueta: 'Voltaje Flotación Banco de Baterías (VDC)', tipo: 'NUMERO', obligatorio: true, seccion: 'Subsistema 2: Energía DC' },
      { id: 'c4', etiqueta: 'Estado de Conectores y Sellos Coaxiales', tipo: 'CHECKLIST', obligatorio: true, seccion: 'Subsistema 3: RF y Antenas' },
      { id: 'c5', etiqueta: 'Lectura VSWR Sector Principal', tipo: 'NUMERO', obligatorio: true, seccion: 'Subsistema 3: RF y Antenas' },
      { id: 'c6', etiqueta: 'Medición Puesta a Tierra (Ohms)', tipo: 'NUMERO', obligatorio: true, seccion: 'Subsistema 4: Aterramiento' }
    ],
    configPdf: {
      mostrarLogoContratista: true,
      mostrarLogoCliente: true,
      disposicionFotosPorPagina: 2,
      incluirBloqueHES: true,
      incluirFirmasTripartitas: true
    }
  },
  {
    id: 'plt-2',
    codigo: 'PLT-SWAP-RRU',
    nombre: 'Instalación y Swap de Equipos Activos (Obras Nuevas)',
    descripcion: 'Formulario simplificado para sustitución de módulos RRU/BBU o antenas con registro de seriales y foto única de conformidad.',
    version: '1.4',
    tipoMision: 'INSTALACION_SWAP',
    reglaFotos: 'UNICA',
    campos: [
      { id: 's1', etiqueta: 'Serial de Unidad Retirada', tipo: 'TEXTO', obligatorio: true, seccion: 'Inventario Desmontado' },
      { id: 's2', etiqueta: 'Serial de Unidad Nueva Instalada', tipo: 'TEXTO', obligatorio: true, seccion: 'Inventario Instalado' },
      { id: 's3', etiqueta: 'Foto de Etiqueta y Placa Fabricante', tipo: 'FOTO_UNICA', obligatorio: true, seccion: 'Inventario Instalado' },
      { id: 's4', etiqueta: 'Potencia Óptica Recibida (dBm)', tipo: 'NUMERO', obligatorio: true, seccion: 'Pruebas de Enlace' },
      { id: 's5', etiqueta: 'Foto de Instalación Final Terminada', tipo: 'FOTO_UNICA', obligatorio: true, seccion: 'Entrega en Torre' }
    ],
    configPdf: {
      mostrarLogoContratista: true,
      mostrarLogoCliente: true,
      disposicionFotosPorPagina: 4,
      incluirBloqueHES: true,
      incluirFirmasTripartitas: true
    }
  },
  {
    id: 'plt-3',
    codigo: 'PLT-AUDIT-PAT',
    nombre: 'Auditoría de Puesta a Tierra y Protección Atmosférica',
    descripcion: 'Evaluación especializada de barras de tierra, pararrayos y continuidad eléctrica para certificación anual.',
    version: '1.0',
    tipoMision: 'AUDITORIA_ELECTRICA',
    reglaFotos: 'UNICA',
    campos: [
      { id: 'p1', etiqueta: 'Resistencia Anillo Perimetral (Ohms)', tipo: 'NUMERO', obligatorio: true, seccion: 'Mediciones Físicas' },
      { id: 'p2', etiqueta: 'Estado de Soldaduras Exotérmicas (Cadweld)', tipo: 'CHECKLIST', obligatorio: true, seccion: 'Inspección Visual' },
      { id: 'p3', etiqueta: 'Foto de Barra Equipotencial Principal', tipo: 'FOTO_UNICA', obligatorio: true, seccion: 'Evidencias' }
    ],
    configPdf: {
      mostrarLogoContratista: true,
      mostrarLogoCliente: false,
      disposicionFotosPorPagina: 2,
      incluirBloqueHES: false,
      incluirFirmasTripartitas: false
    }
  }
];

export default function PlantillasAdminPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>(PLANTILLAS_INICIALES);
  const [seleccionada, setSeleccionada] = useState<Plantilla>(PLANTILLAS_INICIALES[0]);
  const [vistaActiva, setVistaActiva] = useState<'FORMULARIO' | 'PDF'>('FORMULARIO');
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Estados de nuevo campo
  const [nuevoCampoEtiqueta, setNuevoCampoEtiqueta] = useState('');
  const [nuevoCampoTipo, setNuevoCampoTipo] = useState<CampoPlantilla['tipo']>('CHECKLIST');
  const [nuevoCampoSeccion, setNuevoCampoSeccion] = useState('Subsistema General');

  const agregarCampo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCampoEtiqueta.trim()) return;

    const nuevo: CampoPlantilla = {
      id: `c-${Date.now()}`,
      etiqueta: nuevoCampoEtiqueta.trim(),
      tipo: nuevoCampoTipo,
      obligatorio: true,
      seccion: nuevoCampoSeccion.trim() || 'General'
    };

    const actualizada = {
      ...seleccionada,
      campos: [...seleccionada.campos, nuevo]
    };

    setSeleccionada(actualizada);
    setPlantillas(plantillas.map(p => p.id === actualizada.id ? actualizada : p));
    setNuevoCampoEtiqueta('');
  };

  const eliminarCampo = (id: string) => {
    const actualizada = {
      ...seleccionada,
      campos: seleccionada.campos.filter(c => c.id !== id)
    };
    setSeleccionada(actualizada);
    setPlantillas(plantillas.map(p => p.id === actualizada.id ? actualizada : p));
  };

  const togglePdfConfig = (key: keyof Plantilla['configPdf']) => {
    const actualizada = {
      ...seleccionada,
      configPdf: {
        ...seleccionada.configPdf,
        [key]: !seleccionada.configPdf[key]
      }
    };
    setSeleccionada(actualizada as Plantilla);
    setPlantillas(plantillas.map(p => p.id === actualizada.id ? (actualizada as Plantilla) : p));
  };

  const guardarCambios = () => {
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-50 text-blue-700 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border border-blue-200 font-bold tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" /> Módulo de Arquitectura Dinámica
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Form Builder + PDF Template Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestor y Generador de Plantillas
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure los formularios móviles que llenan las cuadrillas de campo y establezca cómo se mapean automáticamente los datos hacia el documento PDF final homologado.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={guardarCambios}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            {guardadoExitoso ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            {guardadoExitoso ? '¡Plantilla Guardada!' : 'Guardar Plantilla'}
          </button>
        </div>
      </div>

      {/* SELECTOR DE PLANTILLAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plantillas.map((plt) => {
          const esActiva = plt.id === seleccionada.id;
          return (
            <div
              key={plt.id}
              onClick={() => setSeleccionada(plt)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                esActiva
                  ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-600/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {plt.codigo}
                </span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  v{plt.version}
                </span>
              </div>

              <h3 className="text-sm font-black text-slate-900 mt-2 line-clamp-1">{plt.nombre}</h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {plt.descripcion}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>{plt.campos.length} campos definidos</span>
                <span className="text-slate-600 font-semibold uppercase">
                  {plt.reglaFotos === 'UNICA' ? 'Foto Única' : 'Antes / Después'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ÁREA DE CONFIGURACIÓN Y MAPPING DUAL (FORMULARIO OPERADOR VS PDF RESULTANTE) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* BARRA DE NAVEGACIÓN DUAL */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">Plantilla Activa:</span>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {seleccionada.nombre}
            </span>
          </div>

          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setVistaActiva('FORMULARIO')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                vistaActiva === 'FORMULARIO'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> 1. Formulario del Operador
            </button>
            <button
              onClick={() => setVistaActiva('PDF')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                vistaActiva === 'PDF'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> 2. Maquetación del PDF
            </button>
          </div>
        </div>

        {/* CONTENIDO DE LA PESTAÑA 1: CONSTRUCTOR DE FORMULARIO DE CAMPO */}
        {vistaActiva === 'FORMULARIO' && (
          <div className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LISTA Y EDICIÓN DE CAMPOS (8 COLS) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    Campos y Preguntas de la Intervención ({seleccionada.campos.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Modo Fotográfico: <strong>{seleccionada.reglaFotos}</strong>
                  </span>
                </div>

                <div className="space-y-2">
                  {seleccionada.campos.map((campo, index) => (
                    <div
                      key={campo.id}
                      className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            {campo.etiqueta}
                            {campo.obligatorio && (
                              <span className="text-[10px] text-red-500 font-bold">*Obligatorio</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                              {campo.seccion}
                            </span>
                            <span>&bull;</span>
                            <span className="font-mono text-blue-600 font-semibold">
                              Tipo: {campo.tipo}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => eliminarCampo(campo.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar campo de la plantilla"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* FORMULARIO RÁPIDO PARA AGREGAR CAMPO */}
                <form onSubmit={agregarCampo} className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Agregar Nuevo Campo a la Plantilla
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Nombre del parámetro o pregunta técnica..."
                        value={nuevoCampoEtiqueta}
                        onChange={(e) => setNuevoCampoEtiqueta(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <select
                        value={nuevoCampoTipo}
                        onChange={(e) => setNuevoCampoTipo(e.target.value as any)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="CHECKLIST">Checklist (Normal/Alarma/Falla)</option>
                        <option value="NUMERO">Medición Numérica (RF/Energía)</option>
                        <option value="TEXTO">Texto Libre / Serial</option>
                        <option value="FOTO_UNICA">Evidencia Fotográfica Única</option>
                        <option value="FOTO_DUAL">Evidencia Dual (Antes / Después)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Nombre de sección (Ej. Subsistema 5: Microondas)"
                      value={nuevoCampoSeccion}
                      onChange={(e) => setNuevoCampoSeccion(e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 placeholder-slate-400 w-64"
                    />

                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Insertar en Formulario
                    </button>
                  </div>
                </form>
              </div>

              {/* SIMULADOR VISUAL DE PANTALLA MÓVIL DEL TÉCNICO (4 COLS) */}
              <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-4 shadow-xl border-4 border-slate-800 text-white">
                <div className="text-center pb-3 border-b border-slate-800">
                  <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-2"></div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Vista Móvil en Torre
                  </span>
                  <div className="text-xs font-bold text-white mt-0.5">{seleccionada.nombre}</div>
                </div>

                <div className="py-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {seleccionada.campos.slice(0, 4).map((c, i) => (
                    <div key={i} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <div className="text-[11px] font-bold text-slate-200">{c.etiqueta}</div>
                      
                      {c.tipo === 'CHECKLIST' && (
                        <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] font-bold text-center">
                          <span className="bg-emerald-950/60 border border-emerald-600 text-emerald-300 py-1 rounded">Normal</span>
                          <span className="bg-slate-700/50 text-slate-400 py-1 rounded">Alarma</span>
                          <span className="bg-slate-700/50 text-slate-400 py-1 rounded">Falla</span>
                        </div>
                      )}

                      {c.tipo === 'NUMERO' && (
                        <div className="mt-2 bg-slate-900 p-1.5 rounded border border-slate-700 text-right font-mono text-xs text-blue-400">
                          1.18 [Auto-valida]
                        </div>
                      )}

                      {c.tipo === 'FOTO_DUAL' && (
                        <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px] text-center">
                          <div className="p-2 bg-slate-900 border border-dashed border-slate-700 rounded flex flex-col items-center justify-center">
                            <Camera className="w-3.5 h-3.5 text-blue-400 mb-1" />
                            <span>Foto ANTES</span>
                          </div>
                          <div className="p-2 bg-slate-900 border border-dashed border-slate-700 rounded flex flex-col items-center justify-center">
                            <Camera className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                            <span>Foto DESPUÉS</span>
                          </div>
                        </div>
                      )}

                      {c.tipo === 'FOTO_UNICA' && (
                        <div className="mt-2 p-2 bg-slate-900 border border-dashed border-slate-700 rounded flex items-center justify-center gap-2 text-[10px]">
                          <Camera className="w-3.5 h-3.5 text-purple-400" />
                          <span>Capturar Evidencia Única</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="text-center text-[10px] text-slate-500 italic pt-1">
                    + {Math.max(0, seleccionada.campos.length - 4)} campos adicionales según plantilla...
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* CONTENIDO DE LA PESTAÑA 2: MOTOR DE MAQUETACIÓN PDF */}
        {vistaActiva === 'PDF' && (
          <div className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* CONFIGURACIÓN DEL MAQUETADOR PDF (5 COLS) */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Reglas de Salida del Documento A4
                </h3>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer">
                    <span>Membrete: Logo de Contratista</span>
                    <input
                      type="checkbox"
                      checked={seleccionada.configPdf.mostrarLogoContratista}
                      onChange={() => togglePdfConfig('mostrarLogoContratista')}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer pt-2 border-t border-slate-200">
                    <span>Membrete: Logo Cliente (Digitel / Operadora)</span>
                    <input
                      type="checkbox"
                      checked={seleccionada.configPdf.mostrarLogoCliente}
                      onChange={() => togglePdfConfig('mostrarLogoCliente')}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer pt-2 border-t border-slate-200">
                    <span>Cuadro de Registro HES (SAP Contratista)</span>
                    <input
                      type="checkbox"
                      checked={seleccionada.configPdf.incluirBloqueHES}
                      onChange={() => togglePdfConfig('incluirBloqueHES')}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer pt-2 border-t border-slate-200">
                    <span>Firmas Tripartitas (Técnico, Supervisor, Inspector)</span>
                    <input
                      type="checkbox"
                      checked={seleccionada.configPdf.incluirFirmasTripartitas}
                      onChange={() => togglePdfConfig('incluirFirmasTripartitas')}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </label>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="block text-xs font-bold text-slate-800 mb-1">Disposición de Fotos en Anexo A4:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          const act = { ...seleccionada, configPdf: { ...seleccionada.configPdf, disposicionFotosPorPagina: 2 } };
                          setSeleccionada(act);
                        }}
                        className={`p-2 rounded-lg border text-center ${
                          seleccionada.configPdf.disposicionFotosPorPagina === 2
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        2 Fotos / Hoja (Grande)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const act = { ...seleccionada, configPdf: { ...seleccionada.configPdf, disposicionFotosPorPagina: 4 } };
                          setSeleccionada(act);
                        }}
                        className={`p-2 rounded-lg border text-center ${
                          seleccionada.configPdf.disposicionFotosPorPagina === 4
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        4 Fotos / Hoja (Compacto)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                  <Sparkles className="w-4 h-4 text-blue-600 mb-1" />
                  <strong>Garantía de Homologación:</strong> Cualquier modificación que realice en los campos del formulario se reflejará automáticamente en las tablas dinámicas de este PDF sin riesgo de descuadre o superposición.
                </div>
              </div>

              {/* PREVIEW EN VIVO DE LA HOJA A4 GENERADA (7 COLS) */}
              <div className="lg:col-span-7 bg-slate-100 p-6 rounded-2xl border border-slate-300 shadow-inner flex justify-center">
                <div className="w-full max-w-[500px] bg-white border border-slate-300 shadow-xl rounded-sm p-6 text-[10px] space-y-4 font-sans text-slate-800 min-h-[580px]">
                  
                  {/* CABECERA MAQUETADA DEL PDF */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                    <div className="flex items-center gap-2">
                      {seleccionada.configPdf.mostrarLogoContratista && (
                        <div className="px-2 py-1 bg-slate-900 text-white font-black text-[9px] rounded">
                          CONTRATISTA
                        </div>
                      )}
                      {seleccionada.configPdf.mostrarLogoCliente && (
                        <div className="px-2 py-1 bg-blue-700 text-white font-black text-[9px] rounded">
                          DIGITEL
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900 text-xs">INFORME TÉCNICO OFICIAL</div>
                      <div className="font-mono text-[9px] text-slate-500">FORMATO: {seleccionada.codigo}</div>
                    </div>
                  </div>

                  {/* DATOS DE ESTACIÓN */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 border border-slate-200 rounded text-[9px]">
                    <div><strong>Radiobase:</strong> RDB-001</div>
                    <div><strong>Región:</strong> Gran Caracas</div>
                    <div><strong>Fecha:</strong> 05/10/2026</div>
                  </div>

                  {/* TABLA DINÁMICA DE CAMPOS */}
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <div className="bg-slate-900 text-white px-2 py-1 font-bold text-[9px]">
                      EVALUACIÓN TÉCNICA ({seleccionada.campos.length} Puntos Inspeccionados)
                    </div>
                    <div className="divide-y divide-slate-100">
                      {seleccionada.campos.slice(0, 4).map((c, i) => (
                        <div key={i} className="px-2 py-1 flex items-center justify-between text-[9px]">
                          <span>{c.etiqueta}</span>
                          <span className="font-bold text-emerald-700">CONFORME / NORMAL</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GRILLA FOTOGRÁFICA SEGÚN CONFIG */}
                  <div className="border border-slate-200 rounded p-2 bg-slate-50">
                    <div className="font-bold text-[9px] text-slate-700 mb-1.5">
                      ANEXO FOTOGRÁFICO ({seleccionada.configPdf.disposicionFotosPorPagina} por lámina)
                    </div>
                    <div className={`grid gap-2 ${seleccionada.configPdf.disposicionFotosPorPagina === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                      <div className="h-20 bg-slate-200 border border-slate-300 rounded flex flex-col items-center justify-center text-[8px] text-slate-500">
                        <Camera className="w-3.5 h-3.5 mb-0.5 text-slate-400" />
                        <span>Slot 01: Evidencia</span>
                      </div>
                      <div className="h-20 bg-slate-200 border border-slate-300 rounded flex flex-col items-center justify-center text-[8px] text-slate-500">
                        <Camera className="w-3.5 h-3.5 mb-0.5 text-slate-400" />
                        <span>Slot 02: Evidencia</span>
                      </div>
                    </div>
                  </div>

                  {/* CUADRO DE FIRMAS / HES */}
                  {seleccionada.configPdf.incluirFirmasTripartitas && (
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 text-center text-[8px]">
                      <div>
                        <div className="border-b border-slate-400 h-6"></div>
                        <div className="mt-0.5 font-bold">Técnico en Torre</div>
                      </div>
                      <div>
                        <div className="border-b border-slate-400 h-6"></div>
                        <div className="mt-0.5 font-bold">Supervisor QA</div>
                      </div>
                      <div>
                        <div className="border-b border-slate-400 h-6"></div>
                        <div className="mt-0.5 font-bold">Inspector Digitel</div>
                      </div>
                    </div>
                  )}

                  {seleccionada.configPdf.incluirBloqueHES && (
                    <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-center text-[8px] font-mono text-blue-900">
                      HES / PEDIDO SAP DIGITEL: [Campo de radicación automática]
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
