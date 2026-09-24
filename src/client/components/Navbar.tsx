'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, RolUsuario } from '@/client/context/AuthContext';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { user, rolActivo, switchRole, logout } = useAuth();
  const pathname = usePathname();
  const [modalSwitch, setModalSwitch] = useState(false);

  // En login y mobile no se muestra el navbar de escritorio
  if (pathname === '/login' || pathname === '/mobile') {
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
    <header className="sticky top-0 z-50 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* LOGO & PLATAFORMA */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <span className="bg-emerald-600 text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded tracking-wider uppercase">
              SISBIRCECA
            </span>
            <span className="font-semibold text-sm tracking-tight text-slate-200 group-hover:text-white transition-colors hidden sm:inline">
              Telecom Platform
            </span>
          </Link>

          {rolActivo && (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {rolActivo === 'ADMIN' ? 'ADMINISTRADOR' : 'TÉCNICO'}
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
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                Asignaciones
              </Link>
              <Link
                href="/mobile"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                Cámara PWA
              </Link>
            </>
          )}

          {rolActivo === 'ADMIN' && (
            <>
              <Link
                href="/admin/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === '/admin/dashboard'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/supervisor"
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === '/supervisor'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                Auditoría QA
              </Link>
              <Link
                href="/admin/radiobases"
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors hidden sm:inline ${
                  pathname === '/admin/radiobases'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                Radiobases
              </Link>
              <Link
                href="/admin/usuarios"
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors hidden md:inline ${
                  pathname === '/admin/usuarios'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                Personal
              </Link>
              <Link
                href="/reportes"
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === '/reportes'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                Reportes
              </Link>
            </>
          )}
        </nav>

        {/* PERFIL & CONMUTADOR */}
        <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-800">
          <div className="hidden lg:block text-right text-[11px] leading-tight mr-1">
            <span className="font-semibold text-slate-200 block">{user?.nombre || 'Usuario Autorizado'}</span>
            <span className="text-slate-400 font-mono text-[10px]">{user?.cargo || `Rol: ${rolActivo}`}</span>
          </div>

          <button
            onClick={() => setModalSwitch(true)}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Cambiar perfil o rol de trabajo"
          >
            Cambiar Rol
          </button>

          <button
            onClick={handleLogout}
            title="Cerrar Sesión Segura"
            className="px-2.5 py-1 rounded-md hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
          >
            Salir
          </button>
        </div>
      </div>

      {/* MODAL DE CAMBIO RÁPIDO DE ROL */}
      {modalSwitch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Cambiar Perfil de Operación</h3>
                <p className="text-xs text-slate-500">Seleccione el entorno y permisos a los que desea conmutar:</p>
              </div>
              <button
                onClick={() => setModalSwitch(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 mb-4">
              <button
                onClick={() => handleRoleChange('TECNICO')}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  rolActivo === 'TECNICO'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">Técnico de Torre (Campo)</span>
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-medium">/campo</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Gerson Martínez &middot; Terminal PWA y captura</p>
              </button>

              <button
                onClick={() => handleRoleChange('ADMIN')}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  rolActivo === 'ADMIN'
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">Dirección de Operaciones (Admin)</span>
                  <span className="font-mono text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium">/admin</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Lic. Mariana Fernández &middot; Dashboard KPIs, Reportes y Usuarios</p>
              </button>
            </div>

            <button
              onClick={() => setModalSwitch(false)}
              className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors text-center cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
