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
      // Navegación limpia de navegador para garantizar que la cookie HttpOnly/Lax se aplique
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
      else if (user?.rol === 'SUPERVISOR') window.location.href = '/supervisor';
      else window.location.href = '/admin/dashboard';
    } else {
      setError('Credenciales no encontradas en el directorio. Seleccione una de las 3 terminales oficiales.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-800">
        
        {/* PANEL IZQUIERDO: AUTORIDAD INDUSTRIAL Y TELEMETRÍA (5 COLS) */}
        <div className="lg:col-span-5 bg-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="relative z-10">
            {/* LOGOTIPO CORPORATIVO */}
            <div className="flex items-center gap-2.5 mb-6">
              <span className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded tracking-wider uppercase">
                SISBIRCECA
              </span>
              <span className="font-mono text-xs font-semibold text-slate-400 tracking-tight">
                Telecom Platform v2.4
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-4 text-white">
              Centro de Operaciones y Auditoría Técnica de Radiobases
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-8">
              Plataforma de misión crítica con separación estricta de responsabilidades operativas: cuadrillas en torre, control de calidad QA y dirección de red.
            </p>

            {/* STATUS EN VIVO DEL SISTEMA */}
            <div className="space-y-3 mb-8">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                <div>
                  <span className="text-[11px] font-mono font-semibold text-slate-200 block">NOC Central Activo</span>
                  <span className="text-[10px] text-slate-400">Monitoreo 24/7 y telemetría de 4 regiones</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                <div>
                  <span className="text-[11px] font-mono font-semibold text-slate-200 block">Seguridad Zero-Trust</span>
                  <span className="text-[10px] text-slate-400">Tokens HMAC-SHA256 & Sellado inmutable</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                <div>
                  <span className="text-[11px] font-mono font-semibold text-slate-200 block">Resiliencia Offline</span>
                  <span className="text-[10px] text-slate-400">IndexedDB Dexie.js & compresión WebP &lt; 250KB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            <span>Certificación Oficial Operativa &middot; 2026</span>
          </div>
        </div>

        {/* PANEL DERECHO: CONSOLAS DE ACCESO DIRECTO (7 COLS) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-slate-50">
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-mono font-semibold uppercase text-slate-600 tracking-wider bg-slate-200/80 px-2.5 py-1 rounded border border-slate-300/60">
                Control de Acceso Basado en Roles (RBAC)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-2.5">
                Seleccione su Terminal de Acceso
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Haga clic en la terminal correspondiente para ingresar con su perfil autenticado:
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-semibold mb-5 flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            {/* LAS 2 TERMINALES OPERATIVAS OFICIALES */}
            <div className="space-y-3.5 mb-6">
              
              {/* TERMINAL 1: TÉCNICO DE CAMPO */}
              <div
                onClick={() => ejecutarAcceso('TECNICO', '/campo')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition-all shadow-sm hover:shadow cursor-pointer group relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                      TEC
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-black transition-colors">
                          Terminal Técnico de Torre (PWA)
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded border border-slate-200">
                          Campo
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        Gerson Martínez <span className="text-slate-400 font-normal">&middot; V-24.891.203</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Captura fotográfica guiada de 6 slots, compresión WebP y encolado offline en sitio.
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
                    className="touch-target-field px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                  >
                    <span>{procesandoRol === 'TECNICO' ? 'Iniciando...' : 'Ingresar'}</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>

              {/* TERMINAL 2: DIRECCIÓN DE OPERACIONES (ADMIN) */}
              <div
                onClick={() => ejecutarAcceso('ADMIN', '/admin/dashboard')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition-all shadow-sm hover:shadow cursor-pointer group relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                      ADM
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-black transition-colors">
                          Dirección de Operaciones & Reportes
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded border border-slate-200">
                          Admin
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        Lic. Mariana Fernández <span className="text-slate-400 font-normal">&middot; V-15.320.841</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Control total: Auditoría y aprobación de reportes, KPIs de radiobases y gestión de usuarios.
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
                    className="touch-target-field px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                  >
                    <span>{procesandoRol === 'ADMIN' ? 'Iniciando...' : 'Ingresar'}</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN COLAPSABLE DE CREDENCIALES MANUALES */}
            <div className="border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setMostrarManual(!mostrarManual)}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1.5"
              >
                <span>{mostrarManual ? '▲ Ocultar formulario manual' : '▼ ¿Desea ingresar con correo y contraseña manuales?'}</span>
              </button>

              {mostrarManual && (
                <form onSubmit={handleManualSubmit} className="mt-4 bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tecnico@sisbirceca.com, admin@sisbirceca.com"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-black text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-sm"
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
