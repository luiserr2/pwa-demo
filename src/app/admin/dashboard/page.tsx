'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { ShieldAlert, Signal, Activity, Cpu, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

// --- DATA MOCKUP PREMIUM PARA GRAFICOS ---
const dataDemandaRegion = [
  { region: 'AMBA / CABA', intervenciones: 420, asignadas: 480 },
  { region: 'Patagonia', intervenciones: 180, asignadas: 200 },
  { region: 'Centro', intervenciones: 250, asignadas: 300 },
  { region: 'Norte', intervenciones: 120, asignadas: 150 },
  { region: 'Litoral', intervenciones: 190, asignadas: 220 },
];

const dataTelemetriaSLA = [
  { hora: '00:00', consultas: 12, slaMinutos: 45 },
  { hora: '04:00', consultas: 8, slaMinutos: 40 },
  { hora: '08:00', consultas: 45, slaMinutos: 60 },
  { hora: '12:00', consultas: 68, slaMinutos: 90 },
  { hora: '16:00', consultas: 85, slaMinutos: 110 },
  { hora: '20:00', consultas: 30, slaMinutos: 55 },
];

const dataTecnologia = [
  { name: '4G / 5G LTE', value: 57, color: '#0f172a' }, // slate-900
  { name: '5G Standalone', value: 24, color: '#10b981' }, // emerald-500
  { name: 'Microondas', value: 14, color: '#3b82f6' }, // blue-500
  { name: 'Satelital', value: 5, color: '#8b5cf6' }, // violet-500
];

export default function AdminDashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="p-8">Cargando telemetría...</div>;

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* HEADER EJECUTIVO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Centro de Control NOC</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Supervisión en tiempo real de infraestructura Telecom y despliegues PWA.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold font-mono flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SISTEMA OPERATIVO
          </div>
          <span className="text-xs text-slate-400 font-mono">Pico Operativo: 18:00 UTC</span>
        </div>
      </div>

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Signal className="w-16 h-16 text-blue-600" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-600 p-2 rounded-lg"><Signal className="w-4 h-4 text-white" /></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sitios Activos</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mb-1">1,204</div>
          <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
            +12.5% vs Mes Anterior
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-500 p-2 rounded-lg"><CheckCircle2 className="w-4 h-4 text-white" /></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Certificados Hoy</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mb-1">342</div>
          <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
            SLA Cumplido 98%
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-amber-500" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-500 p-2 rounded-lg"><Activity className="w-4 h-4 text-white" /></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">En Progreso</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mb-1">89</div>
          <div className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
            Cuadrillas en Ruta
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-16 h-16 text-rose-500" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-rose-500 p-2 rounded-lg"><AlertTriangle className="w-4 h-4 text-white" /></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alertas NOC</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mb-1">3</div>
          <div className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded inline-block">
            Requieren atención
          </div>
        </div>
      </div>

      {/* GRAFICOS PRINCIPALES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Demanda por Región */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              Intervenciones Técnicas por Región
            </h2>
            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">Cotejado con catálogo de infraestructura</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataDemandaRegion} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="region" type="category" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} width={80} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="asignadas" name="Asignadas Totales" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="intervenciones" name="Ejecutadas" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: SLA y Telemetría */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                SLA Promedio vs Volumen 24/7
              </h2>
              <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">Tiempo de resolución en sitio</p>
            </div>
            <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold">
              OBJ: &lt; 60 MIN
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataTelemetriaSLA} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hora" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area yAxisId="left" type="monotone" dataKey="consultas" name="Volumen Cuadrillas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorConsultas)" />
                <Line yAxisId="right" type="monotone" dataKey="slaMinutos" name="SLA (Minutos)" stroke="#0f172a" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TERCERA FILA: PIE CHART Y TABLA RECIENTE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 3: Distribución Tecnológica */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900">Distribución de Tecnologías</h2>
            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">Mapeo de infraestructura activa</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataTecnologia}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dataTecnologia.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Inner text for donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">100%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Auditado</span>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {dataTecnologia.map(tech => (
              <div key={tech.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tech.color }}></span>
                <span className="text-[11px] font-semibold text-slate-700">{tech.name}</span>
                <span className="text-[11px] text-slate-400 ml-auto">{tech.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* TABLA: Últimas Actividades Críticas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Certificaciones Recientes</h2>
              <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">Flujo de entrega PWA en tiempo real</p>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              Ver Expedientes
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sitio / Código</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cuadrilla</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Integridad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { sitio: 'Torre Madero', id: 'RDB-001', tech: 'Gerson M.', state: 'Completado', color: 'emerald', integ: '100%' },
                  { sitio: 'Cerro Catedral', id: 'RDB-002', tech: 'Carlos G.', state: 'En Progreso', color: 'blue', integ: '83%' },
                  { sitio: 'Palermo Soho', id: 'RDB-004', tech: 'Gerson M.', state: 'Pendiente', color: 'slate', integ: '0%' },
                  { sitio: 'Córdoba Sierras', id: 'RDB-003', tech: 'Martín A.', state: 'Completado', color: 'emerald', integ: '100%' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3">
                      <div className="text-xs font-bold text-slate-900">{item.sitio}</div>
                      <div className="text-[10px] font-mono text-slate-500">{item.id}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-xs font-semibold text-slate-700">{item.tech}</div>
                    </td>
                    <td className="py-3">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-${item.color}-50 text-${item.color}-700 border border-${item.color}-100`}>
                        {item.state}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="text-xs font-mono font-bold text-slate-700">{item.integ}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
