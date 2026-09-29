'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/client/context/AuthContext';
import {
  LayoutDashboard,
  Server,
  Users,
  Activity,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Map
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard Principal', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Infraestructura y Sitios', href: '/admin/radiobases', icon: Server },
    { name: 'Gestión de Cuadrillas', href: '/admin/usuarios', icon: Users },
    { name: 'Mapa de Operaciones', href: '/admin/mapa', icon: Map },
    { name: 'Expedientes Oficiales', href: '/admin/expedientes', icon: FileText },
    { name: 'Configuración del Sistema', href: '/admin/config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 fixed inset-y-0 z-50">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm shadow-blue-600/20">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">SISBIRCECA</h1>
              <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold mt-1">Telecom Platform &middot; Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">
            Operaciones
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                <span className="text-blue-700 font-bold text-sm">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">Administrador</p>
                <p className="text-[10px] font-mono text-slate-500 truncate">NOC Operator</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-md shadow-sm">
            <Server className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900">SISBIRCECA</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-72 pt-16 lg:pt-0">
        <div className="flex-1 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
