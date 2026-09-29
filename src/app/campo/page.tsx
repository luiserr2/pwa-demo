'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/client/context/AuthContext';
import { offlineDB, EvidenciaOffline } from '@/client/offline/dexie-db';
import { LogOut, Camera, ClipboardCheck, Search, FileText, CheckCircle2, Clock, Shield, ArrowRight, Image as ImageIcon, LayoutGrid, Zap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function CampoPortalPage() {
  const { user, logout } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [offlineEvidencias, setOfflineEvidencias] = useState<EvidenciaOffline[]>([]);
  const [reporteActualId, setReporteActualId] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReporteActualId(uuidv4());
    cargarTelemetriaDexie();
  }, []);

  const cargarTelemetriaDexie = async () => {
    try {
      const items = await offlineDB.evidencias.toArray();
      setOfflineEvidencias(items);
    } catch (e) {
      console.error('Error leyendo Dexie:', e);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const reportesGuardados = [
    {
      id: 'rep-001',
      sitio: 'RB Puerto Madero - Core Enlace MW',
      codigo: 'REP_FOTO_MADERO_20260915',
      tecnico: 'Ing. Rodrigo Peralta',
      fecha: '29 sept. 2026',
      estado: 'LISTO',
      totalFotos: 12,
      miniaturas: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=100&auto=format&fit=crop&q=80',
      ]
    },
    {
      id: 'rep-002',
      sitio: 'RB Cerro Catedral - Repetidor Bariloche',
      codigo: 'INF_TEC_CATEDRAL_20260918',
      tecnico: 'Ing. Facundo Navarro',
      fecha: '29 sept. 2026',
      estado: 'LISTO',
      totalFotos: 12,
      miniaturas: [
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508344928928-7137b2f30206?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&auto=format&fit=crop&q=80',
      ]
    },
    {
      id: 'rep-003',
      sitio: 'RB Córdoba Sierras - Nodo Troncal Alta Gracia',
      codigo: 'REP_CORDOBA_20260920',
      tecnico: 'Téc. Matías Rossi',
      fecha: '29 sept. 2026',
      estado: 'EN PROCESO',
      totalFotos: 6,
      miniaturas: [
        'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80',
      ]
    },
  ];

  const filtrados = reportesGuardados.filter(r => 
    r.sitio.toLowerCase().includes(busqueda.toLowerCase()) || 
    r.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full bg-slate-50 selection:bg-blue-600 selection:text-white pb-32 font-sans overflow-x-hidden">
      
      {/* HEADER: SaaS Premium */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Shield className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-bold text-slate-900 tracking-tight leading-none">Reportes Radiobases</h1>
                <span className="bg-emerald-100/80 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/50 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-500"></span> TLS 1.3
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-1">Plataforma Operativa de Campo</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-slate-100/50 border border-slate-200 py-1.5 pl-1.5 pr-4 rounded-full">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 text-blue-600">
                <span className="text-[10px] font-bold tracking-tighter">GM</span>
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {user?.nombre || 'Gerson Martínez'}
              </span>
            </div>
            
            <button onClick={handleLogout} className="p-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-all shadow-sm active:scale-95">
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        
        {/* HERO ACTIONS: Rich Colors & Depth */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Action 1: Fotos (Deep Blue) */}
          <Link 
            href={`/captura?reporteId=${reporteActualId}&mode=FOTOS`}
            className="group relative overflow-hidden bg-white p-1.5 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="relative h-full bg-slate-900 rounded-[1.65rem] p-6 sm:p-8 overflow-hidden flex flex-col md:justify-center">
              {/* Abstract Background Blob */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-500"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-blue-100 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-inner shadow-white/10">
                  <Camera className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/20 group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-200 mb-3">
                  <LayoutGrid className="w-3 h-3" /> PPTX Generator
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight mb-2">1. Tomar Fotos (Antes/Después)</h2>
                <p className="hidden sm:block text-sm text-blue-200/80 font-medium leading-relaxed max-w-sm">Genera el álbum de fotos tipo diapositiva (PPTX).</p>
              </div>
            </div>
          </Link>

          {/* Action 2: Ficha (Deep Emerald) */}
          <Link 
            href={`/reportes/${reporteActualId}/edit`}
            className="group relative overflow-hidden bg-white p-1.5 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="relative h-full bg-[#064E3B] rounded-[1.65rem] p-6 sm:p-8 overflow-hidden flex flex-col md:justify-center">
              {/* Abstract Background Blob */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-500"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-teal-500/20 blur-3xl rounded-full pointer-events-none"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-emerald-100 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-inner shadow-white/10">
                  <ClipboardCheck className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/20 group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-3">
                  <Zap className="w-3 h-3" /> DOCX Form
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight mb-2">2. Llenar Formulario Técnico</h2>
                <p className="hidden sm:block text-sm text-emerald-200/80 font-medium leading-relaxed max-w-sm">48 zonas, voltajes, equipos y acta TIP/ATP (DOCX).</p>
              </div>
            </div>
          </Link>

        </section>

        {/* REPOSITORY SECTION */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Reportes Guardados ({reportesGuardados.length})</h3>
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
              <input 
                type="text" 
                placeholder="Buscar radiobase..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* LISTA DE REPORTES */}
          <div className="grid grid-cols-1 gap-4">
            {filtrados.map((reporte) => (
              <div key={reporte.id} className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row gap-6">
                
                <div className="flex-1 space-y-4">
                  
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      reporte.estado === 'LISTO' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {reporte.estado === 'LISTO' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {reporte.estado}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200">
                      {reporte.codigo}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900 tracking-tight mb-1">{reporte.sitio}</h4>
                    <p className="text-sm text-slate-500 font-medium">
                      Técnico: <span className="text-slate-700">{reporte.tecnico}</span> &middot; {reporte.fecha}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {reporte.miniaturas.map((url, idx) => (
                        <div key={idx} className="relative w-10 h-10 rounded-lg border-2 border-white overflow-hidden shadow-sm hover:scale-110 hover:z-10 transition-transform">
                          <img src={url} alt="Evi" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      +{reporte.totalFotos - reporte.miniaturas.length} FOTOS
                    </span>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-end justify-start lg:justify-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
                  <button className="flex-1 lg:flex-none w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors active:scale-95">
                    <ImageIcon className="w-4 h-4" />
                    Fotos
                  </button>
                  <Link href={`/reportes/${reporte.id}/pdf?vista=UNIFICADO`} className="flex-1 lg:flex-none w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95">
                    <FileText className="w-4 h-4" />
                    PDF
                  </Link>
                </div>

              </div>
            ))}
          </div>

        </section>
      </main>
    </div>
  );
}
