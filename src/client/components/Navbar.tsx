'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, RolUsuario } from '@/client/context/AuthContext';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { user, rolActivo, switchRole, logout } = useAuth();
  const pathname = usePathname();
  const [modalSwitch, setModalSwitch] = useState(false);

  // En login, mobile, admin y campo no se muestra el navbar global de escritorio
  if (pathname === '/login' || pathname === '/mobile' || pathname.startsWith('/admin') || pathname.startsWith('/campo')) {
    return null;
  }

  const handleRoleChange = async (rol: RolUsuario) => {
    await switchRole(rol);
    setModalSwitch(false);
    if (rol === 'TECNICO') {
      window.location.href = '/campo';
    } else {
      window.location.href = '/admin/dashboard';
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md text-slate-800 border-b border-slate-200 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* LOGO & PLATAFORMA */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <span className="bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-[12px] px-2.5 py-0.5 rounded-md tracking-wider uppercase transition-colors">
              VERTEX
            </span>
            <span className="font-bold text-sm tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors hidden sm:inline">
              Plataforma Operativa
            </span>
          </Link>

          {rolActivo && (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium">
              {rolActivo === 'ADMIN' ? 'Administrador' : 'Técnico'}
            </span>
          )}
        </div>

        {/* NAVEGACIÓN SEGÚN ROL */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5 text-xs">
          {rolActivo === 'TECNICO' && (
            <>
              <Link
                href="/campo"
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === '/campo'
                    ? 'bg-slate-100 text-slate-900 border border-slate-200 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent font-medium'
                }`}
              >
                Asignaciones
              </Link>
              <Link
                href="/mobile"
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                Terminal Móvil
              </Link>
            </>
          )}

          {rolActivo === 'ADMIN' && (
            <>
              <Link
                href="/admin/dashboard"
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all ${
                  pathname === '/admin/dashboard'
                    ? 'bg-slate-100 text-slate-900 border border-slate-200 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent font-medium'
                }`}
              >
                Estadísticas
              </Link>
              <Link
                href="/admin/usuarios"
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all ${
                  pathname === '/admin/usuarios'
                    ? 'bg-slate-100 text-slate-900 border border-slate-200 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent font-medium'
                }`}
              >
                Técnicos
              </Link>
              <Link
                href="/admin/radiobases"
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all ${
                  pathname === '/admin/radiobases'
                    ? 'bg-slate-100 text-slate-900 border border-slate-200 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent font-medium'
                }`}
              >
                Radiobases
              </Link>
            </>
          )}
        </nav>

        {/* PERFIL & CONMUTADOR */}
        <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
          <div className="hidden lg:block text-right text-[11px] leading-tight mr-1">
            <span className="font-semibold text-slate-900 block">{user?.nombre || 'Usuario Autorizado'}</span>
            <span className="text-slate-500 font-mono text-[10px]">{user?.cargo || `Rol: ${rolActivo}`}</span>
          </div>

          <button
            onClick={() => setModalSwitch(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all cursor-pointer active:translate-y-[1px]"
            title="Cambiar perfil o rol de trabajo"
          >
            Cambiar Rol
          </button>

          <button
            onClick={handleLogout}
            title="Cerrar Sesión Segura"
            className="px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer active:translate-y-[1px]"
          >
            Salir
          </button>
        </div>
      </div>

      {/* MODAL DE CAMBIO RÁPIDO DE ROL */}
      {modalSwitch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-switch-title"
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 id="modal-switch-title" className="font-bold text-sm text-slate-900">Cambiar Perfil de Operación</h3>
                <p className="text-xs text-slate-500">Seleccione el entorno y permisos a los que desea conmutar:</p>
              </div>
              <button
                type="button"
                onClick={() => setModalSwitch(false)}
                aria-label="Cerrar ventana modal"
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2.5 mb-5">
              <button
                onClick={() => handleRoleChange('TECNICO')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  rolActivo === 'TECNICO'
                    ? 'border-blue-600 bg-blue-50/60'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">Técnico de Torre (Campo)</span>
                  <span className="font-mono text-[10px] text-blue-700 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded font-medium">/campo</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Gerson Martínez &middot; Terminal PWA y captura</p>
              </button>

              <button
                onClick={() => handleRoleChange('ADMIN')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  rolActivo === 'ADMIN'
                    ? 'border-blue-600 bg-blue-50/60'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">Dirección de Operaciones (Admin)</span>
                  <span className="font-mono text-[10px] text-blue-700 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded font-medium">/admin</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Lic. Mariana Fernández &middot; Estadísticas operativas y gestión de personal</p>
              </button>
            </div>

            <button
              onClick={() => setModalSwitch(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors text-center border border-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
