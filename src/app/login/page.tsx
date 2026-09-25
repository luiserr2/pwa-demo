'use client';

import React, { useState } from 'react';
import { useAuth, USUARIOS_HOMOLOGADOS, RolUsuario } from '@/client/context/AuthContext';

export default function LoginPage() {
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [procesandoRol, setProcesandoRol] = useState<RolUsuario | null>(null);
  const [mostrarManual, setMostrarManual] = useState(false);

  const ejecutarAcceso = async (rol: RolUsuario, destino: string) => {
    setProcesandoRol(rol);
    setError(null);
    try {
      await switchRole(rol);
      window.location.href = destino;
    } catch (err: any) {
      setError(`Error al inicializar sesión: ${err.message}`);
      setProcesandoRol(null);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor ingrese su correo electrónico corporativo.');
      return;
    }

    setError(null);
    const ok = await login(email.trim());
    if (ok) {
      const user = Object.values(USUARIOS_HOMOLOGADOS).find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (user?.rol === 'TECNICO') window.location.href = '/campo';
      else window.location.href = '/admin/dashboard';
    } else {
      setError('Credenciales no encontradas en el directorio. Seleccione una de las terminales oficiales.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0F1D] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      {/* RETÍCULA TÉCNICA OBSIDIAN */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" 
      />

      <div className="max-w-5xl w-full bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-[0_4px_24px_-2px_rgba(10,15,29,0.8)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-white/[0.08]">
        
        {/* PANEL IZQUIERDO: AUTORIDAD INDUSTRIAL & TELEMETRÍA (5 COLS) */}
        <div className="lg:col-span-5 bg-[#0A0F1D]/80 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08]">
          <div>
            {/* LOGOTIPO CORPORATIVO */}
            <div className="flex items-center gap-2.5 mb-6">
              <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md tracking-wider uppercase">
                SISBIRCECA
              </span>
              <span className="font-mono text-xs font-semibold text-slate-400 tracking-tight">
                Telecom Platform v3.7
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-4 text-white">
              Centro de Operaciones y Auditoría de Radiobases
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-8">
              Plataforma de misión crítica con arquitectura de 2 roles: personal de torre y dirección de operaciones. Certificación determinística inmutable.
            </p>

            {/* STATUS EN VIVO DEL SISTEMA */}
            <div className="space-y-3 mb-8">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                <div>
                  <span className="text-[11px] font-mono font-semibold text-slate-200 block">NOC Central Activo</span>
                  <span className="text-[10px] text-slate-400">Monitoreo 24/7 y telemetría de 4 regiones</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
                <div>
                  <span className="text-[11px] font-mono font-semibold text-slate-200 block">Seguridad Determinística</span>
                  <span className="text-[10px] text-slate-400">Tokens HMAC-SHA256 & sellado inmutable</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                <div>
                  <span className="text-[11px] font-mono font-semibold text-slate-200 block">Resiliencia Offline</span>
                  <span className="text-[10px] text-slate-400">IndexedDB Dexie.js & compresión WebP &lt; 250 KB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.08] text-[11px] text-slate-500 font-mono">
            <span>Certificación Oficial Operativa &middot; 2026</span>
          </div>
        </div>

        {/* PANEL DERECHO: CONSOLAS DE ACCESO DIRECTO (7 COLS) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-mono font-semibold uppercase text-blue-400 tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/25">
                Control de Acceso Basado en Roles (RBAC)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-2.5">
                Seleccione su Terminal de Acceso
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Autenticación directa de credenciales para iniciar turno operativo:
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 p-3.5 rounded-xl text-xs font-medium mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* LAS 2 TERMINALES OPERATIVAS OFICIALES */}
            <div className="space-y-3.5 mb-6">
              
              {/* TERMINAL 1: TÉCNICO DE CAMPO */}
              <div
                onClick={() => ejecutarAcceso('TECNICO', '/campo')}
                className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-blue-500/40 rounded-xl p-4 sm:p-5 transition-all shadow-sm cursor-pointer group relative active:translate-y-[1px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                      TEC
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                          Terminal Técnico de Torre (PWA)
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded border border-emerald-500/25">
                          Campo
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-300">
                        Gerson Martínez <span className="text-slate-500 font-mono font-normal">&middot; V-24.891.203</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Captura fotográfica guiada de 6 slots, compresión WebP y encolado offline en torre.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      ejecutarAcceso('TECNICO', '/campo');
                    }}
                    disabled={procesandoRol !== null}
                    aria-label="Ingresar a terminal de campo"
                    className="touch-target-field px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:translate-y-[1px]"
                  >
                    <span>{procesandoRol === 'TECNICO' ? 'Iniciando...' : 'Ingresar'}</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* TERMINAL 2: DIRECCIÓN DE OPERACIONES (ADMIN) */}
              <div
                onClick={() => ejecutarAcceso('ADMIN', '/admin/dashboard')}
                className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-blue-500/40 rounded-xl p-4 sm:p-5 transition-all shadow-sm cursor-pointer group relative active:translate-y-[1px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                      ADM
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                          Dirección de Operaciones & Reportes
                        </span>
                        <span className="bg-blue-500/10 text-blue-400 text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded border border-blue-500/25">
                          Admin
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-300">
                        Lic. Mariana Fernández <span className="text-slate-500 font-mono font-normal">&middot; V-15.320.841</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Control general: Monitoreo de radiobases, auditoría de expedientes y gestión de técnicos.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      ejecutarAcceso('ADMIN', '/admin/dashboard');
                    }}
                    disabled={procesandoRol !== null}
                    aria-label="Ingresar a dirección de operaciones"
                    className="touch-target-field px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:translate-y-[1px]"
                  >
                    <span>{procesandoRol === 'ADMIN' ? 'Iniciando...' : 'Ingresar'}</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN COLAPSABLE DE CREDENCIALES MANUALES */}
            <div className="border-t border-white/[0.08] pt-4">
              <button
                type="button"
                onClick={() => setMostrarManual(!mostrarManual)}
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{mostrarManual ? '▲ Ocultar formulario de credenciales' : '▼ ¿Desea ingresar con correo y contraseña manuales?'}</span>
              </button>

              {mostrarManual && (
                <form onSubmit={handleManualSubmit} className="mt-4 bg-white/[0.02] p-4 rounded-xl border border-white/[0.08] space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tecnico@sisbirceca.com, admin@sisbirceca.com"
                      className="w-full text-xs p-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-xs p-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer active:translate-y-[1px]"
                  >
                    Iniciar Sesión con Credenciales
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-6 text-center text-[11px] text-slate-500 font-mono">
            SISBIRCECA Enterprise &middot; Entorno Certificado de Producción
          </div>
        </div>
      </div>
    </div>
  );
}
