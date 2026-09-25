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
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200">
        
        {/* PANEL IZQUIERDO: AUTORIDAD INDUSTRIAL & TELEMETRÍA (5 COLS) */}
        <div className="lg:col-span-5 bg-slate-50/80 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
          <div>
            {/* LOGOTIPO CORPORATIVO */}
            <div className="flex items-center gap-2.5 mb-6">
              <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md tracking-wider uppercase shadow-xs">
                SISBIRCECA
              </span>
              <span className="font-mono text-xs font-semibold text-slate-500 tracking-tight">
                Telecom Platform v4.0
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-4 text-slate-900">
              Centro de Operaciones y Auditoría de Radiobases
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-8">
              Plataforma de misión crítica con arquitectura de 2 roles: personal de torre y dirección de operaciones. Certificación determinística inmutable.
            </p>

            {/* STATUS EN VIVO DEL SISTEMA */}
            <div className="space-y-3 mb-8">
              <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-3 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse"></span>
                <div>
                  <span className="text-[11px] font-mono font-semibold text-slate-800 block">NOC Central Activo</span>
                  <span className="text-[10px] text-slate-500">Monitoreo 24/7 y telemetría de 4 regiones</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-3 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                <div>
                  <span className="text-[11px] font-mono font-semibold text-slate-800 block">Seguridad Determinística</span>
                  <span className="text-[10px] text-slate-500">Tokens HMAC-SHA256 & sellado inmutable</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-3 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <div>
                  <span className="text-[11px] font-mono font-semibold text-slate-800 block">Resiliencia Offline</span>
                  <span className="text-[10px] text-slate-500">IndexedDB Dexie.js & compresión WebP &lt; 250 KB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
            <span>Certificación Oficial Operativa &middot; 2026</span>
          </div>
        </div>

        {/* PANEL DERECHO: CONSOLAS DE ACCESO DIRECTO (7 COLS) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-mono font-semibold uppercase text-blue-700 tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Control de Acceso Basado en Roles (RBAC)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-2.5">
                Seleccione su Terminal de Acceso
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Autenticación directa de credenciales para iniciar turno operativo:
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-medium mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-400 rounded-xl p-4 sm:p-5 transition-all shadow-xs cursor-pointer group relative active:translate-y-[1px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                      TEC
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                          Terminal Técnico de Torre (PWA)
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded border border-emerald-200">
                          Campo
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        Gerson Martínez <span className="text-slate-400 font-mono font-normal">&middot; V-24.891.203</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
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
                    className="touch-target-field px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:translate-y-[1px]"
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
                className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-400 rounded-xl p-4 sm:p-5 transition-all shadow-xs cursor-pointer group relative active:translate-y-[1px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                      ADM
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                          Dirección de Operaciones & Reportes
                        </span>
                        <span className="bg-blue-50 text-blue-700 text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded border border-blue-200">
                          Admin
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        Lic. Mariana Fernández <span className="text-slate-400 font-mono font-normal">&middot; V-15.320.841</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
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
                    className="touch-target-field px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:translate-y-[1px]"
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
            <div className="border-t border-slate-200 pt-4">
              <button
                type="button"
                aria-expanded={mostrarManual}
                aria-controls="manual-credentials-form"
                onClick={() => setMostrarManual(!mostrarManual)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${mostrarManual ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <span>{mostrarManual ? 'Ocultar formulario de credenciales' : '¿Desea ingresar con correo y contraseña manuales?'}</span>
              </button>

              {mostrarManual && (
                <form
                  id="manual-credentials-form"
                  onSubmit={handleManualSubmit}
                  className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
                >
                  <div>
                    <label htmlFor="login-email" className="block text-[10px] font-semibold uppercase text-slate-600 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tecnico@sisbirceca.com, admin@sisbirceca.com"
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-[10px] font-semibold uppercase text-slate-600 mb-1">
                      Contraseña
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2.5 rounded-lg transition-colors shadow-xs cursor-pointer active:translate-y-[1px]"
                  >
                    Iniciar Sesión con Credenciales
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-6 text-center text-[11px] text-slate-400 font-mono">
            SISBIRCECA Enterprise &middot; Entorno Certificado de Producción
          </div>
        </div>
      </div>
    </div>
  );
}
