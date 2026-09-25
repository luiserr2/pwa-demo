'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface UsuarioItem {
  id: string;
  nombre: string;
  email: string;
  cedula: string;
  rol: 'TECNICO' | 'ADMIN' | 'SUPERVISOR';
  cuadrilla: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

const USUARIOS_INITIAL: UsuarioItem[] = [
  {
    id: 'u-1',
    nombre: 'Gerson Martínez',
    email: 'tecnico@sisbirceca.com',
    cedula: 'V-24.891.203',
    rol: 'TECNICO',
    cuadrilla: 'Cuadrilla 04 (Torres AMBA)',
    estado: 'ACTIVO',
  },
  {
    id: 'u-3',
    nombre: 'Lic. Mariana Fernández',
    email: 'admin@sisbirceca.com',
    cedula: 'V-15.320.841',
    rol: 'ADMIN',
    cuadrilla: 'Dirección Nacional de Operaciones',
    estado: 'ACTIVO',
  },
  {
    id: 'u-4',
    nombre: 'Carlos Gómez',
    email: 'carlos.gomez@sisbirceca.com',
    cedula: 'V-22.104.992',
    rol: 'TECNICO',
    cuadrilla: 'Cuadrilla 09 (Patagonia)',
    estado: 'ACTIVO',
  },
  {
    id: 'u-5',
    nombre: 'Martín Albornoz',
    email: 'martin.albornoz@sisbirceca.com',
    cedula: 'V-20.441.512',
    rol: 'TECNICO',
    cuadrilla: 'Cuadrilla 02 (Córdoba)',
    estado: 'ACTIVO',
  },
];

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>(USUARIOS_INITIAL);
  const [cargando, setCargando] = useState(false);
  const [modalCrear, setModalCrear] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Formulario nuevo usuario
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCedula, setFormCedula] = useState('');
  const [formRol, setFormRol] = useState<'TECNICO' | 'ADMIN'>('TECNICO');
  const [formCuadrilla, setFormCuadrilla] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/usuarios');
      const json = await res.json();
      if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
        const mapeados: UsuarioItem[] = json.data.map((u: any) => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          cedula: u.cedula,
          rol: u.rol === 'SUPERVISOR' ? 'ADMIN' : u.rol,
          cuadrilla: u.rol === 'TECNICO' ? (u.cuadrilla || 'Cuadrilla Operativa Telecom') : 'Dirección y Control',
          estado: u.activo ? 'ACTIVO' : 'INACTIVO',
        }));
        setUsuarios(mapeados);
      }
    } catch {
      // Usar estado inicial si no hay conexión
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formEmail.trim() || !formCedula.trim()) {
      setMensaje({ tipo: 'error', texto: 'Todos los campos son obligatorios.' });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formNombre.trim(),
          email: formEmail.trim().toLowerCase(),
          cedula: formCedula.trim(),
          rol: formRol,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setMensaje({ tipo: 'ok', texto: `Usuario '${formNombre}' registrado exitosamente.` });
        setModalCrear(false);
        setFormNombre('');
        setFormEmail('');
        setFormCedula('');
        setFormCuadrilla('');
        await cargarUsuarios();
      } else {
        setMensaje({ tipo: 'error', texto: json.error || 'Error al crear usuario.' });
      }
    } catch (err: any) {
      setMensaje({ tipo: 'error', texto: 'Fallo de conexión al registrar usuario.' });
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id: string, nombre: string) => {
    try {
      const res = await fetch('/api/usuarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.ok) {
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, estado: u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' } : u
          )
        );
        setMensaje({ tipo: 'ok', texto: `Estado de '${nombre}' actualizado.` });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo cambiar el estado del usuario.' });
    }
  };

  const handleEliminarUsuario = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Está seguro de eliminar permanentemente la cuenta de '${nombre}'?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/usuarios?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.ok) {
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
        setMensaje({ tipo: 'ok', texto: `Cuenta de '${nombre}' eliminada.` });
      } else {
        setMensaje({ tipo: 'error', texto: json.error || 'Error al eliminar usuario.' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de red al intentar eliminar usuario.' });
    }
  };

  const conteoTecnicos = usuarios.filter((u) => u.rol === 'TECNICO').length;
  const conteoAdmins = usuarios.filter((u) => u.rol === 'ADMIN').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20">
      {/* HEADER DE PÁGINA (STITCH SPEC) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/dashboard"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
            >
              <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Volver a Estadísticas</span>
            </Link>
            <span className="text-slate-600">&middot;</span>
            <span className="bg-white/[0.04] text-blue-400 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md tracking-wider border border-blue-500/25 font-semibold">
              Gestión de Personal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Directorio y Administración de Personal Técnico
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Control de cuentas de técnicos de campo, asignación de cuadrillas y permisos de captura.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setModalCrear(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Registrar Técnico</span>
          </button>
        </div>
      </div>

      {/* BANNER DE NOTIFICACIONES */}
      {mensaje && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-medium flex items-center justify-between border backdrop-blur-md transition-all ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/25'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {mensaje.tipo === 'ok' ? (
              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-rose-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span>{mensaje.texto}</span>
          </div>
          <button
            onClick={() => setMensaje(null)}
            className="text-xs p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ASYMMETRIC TELEMETRY STRIP (REPLACES 3-EQUAL-CARD SLOP) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-7">
        {/* TOTAL CUENTAS (5 COLS) */}
        <div className="md:col-span-5 bg-slate-900/60 backdrop-blur-md p-5 rounded-xl border border-white/[0.08] shadow-[0_4px_24px_-2px_rgba(10,15,29,0.8)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Cuentas Registradas
            </span>
            <span className="text-[10px] font-mono bg-white/[0.04] text-slate-300 px-2 py-0.5 rounded-md border border-white/[0.08]">
              Directorio Activo
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight my-1">
            {usuarios.length}
          </div>
          <p className="text-xs text-slate-400">
            Personal con credenciales activas y certificados de acceso a la red.
          </p>
        </div>

        {/* ROLE DISTRIBUTION (7 COLS) */}
        <div className="md:col-span-7 bg-slate-900/60 backdrop-blur-md p-5 rounded-xl border border-white/[0.08] shadow-[0_4px_24px_-2px_rgba(10,15,29,0.8)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Distribución por Rol Operativo
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Arquitectura de 2 Roles Oficiales
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-1">
            <div className="p-3 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/20">
              <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-0.5">Técnicos (Campo)</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">{conteoTecnicos}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Habilitados para captura y PWA</span>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/[0.05] border border-blue-500/20">
              <span className="text-[10px] font-mono uppercase text-blue-400 block mb-0.5">Administradores (Operaciones)</span>
              <div className="text-2xl font-bold font-mono text-blue-400">{conteoAdmins}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Auditoría y control de expedientes</span>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-500 font-mono">
            * Cero roles innecesarios. Control directo sin intermediación.
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE USUARIOS (HIGH DENSITY SMOKED GLASS) */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/[0.08] shadow-[0_4px_24px_-2px_rgba(10,15,29,0.8)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Directorio de Operadores y Administradores
            </h2>
            <p className="text-xs text-slate-400">
              Listado general con privilegios de acceso y asignación operativa.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold bg-white/[0.04] text-slate-300 px-3 py-1 rounded-md border border-white/[0.08]">
            {usuarios.length} Registros Activos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/[0.02] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="p-3.5 pl-5">Nombre y Apellido</th>
                <th className="p-3.5">Correo Corporativo</th>
                <th className="p-3.5">Cédula</th>
                <th className="p-3.5">Rol Oficial</th>
                <th className="p-3.5">Asignación</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 pr-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 pl-5">
                    <span className="font-bold text-white text-xs">{u.nombre}</span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300 text-[11px]">{u.email}</td>
                  <td className="p-3.5 text-slate-300 font-medium font-mono">{u.cedula}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                        u.rol === 'ADMIN'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      }`}
                    >
                      {u.rol === 'ADMIN' ? 'Administrador' : 'Técnico Campo'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-medium">{u.cuadrilla}</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleToggleEstado(u.id, u.nombre)}
                      title="Haga clic para alternar estado"
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border cursor-pointer transition-all active:translate-y-[1px] ${
                        u.estado === 'ACTIVO'
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20'
                          : 'text-slate-400 bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]'
                      }`}
                    >
                      {u.estado}
                    </button>
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <button
                      onClick={() => handleEliminarUsuario(u.id, u.nombre)}
                      className="px-2.5 py-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-md transition-colors border border-rose-500/20 cursor-pointer active:translate-y-[1px]"
                      title="Eliminar usuario permanentemente"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA CREAR NUEVO USUARIO (SMOKED OBSIDIAN SHEET) */}
      {modalCrear && (
        <div className="fixed inset-0 bg-[#0A0F1D]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-usuario-title"
            className="bg-[#0A0F1D]/95 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 text-white animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div>
                <h3 id="modal-usuario-title" className="font-bold text-sm text-white">Registrar Nuevo Usuario</h3>
                <p className="text-xs text-slate-400">Seleccione el rol y asigne permisos operativos:</p>
              </div>
              <button
                type="button"
                onClick={() => setModalCrear(false)}
                aria-label="Cerrar ventana modal"
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-4 text-xs">
              <div>
                <label htmlFor="usuario-nombre" className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 tracking-wider">
                  Nombre Completo *
                </label>
                <input
                  id="usuario-nombre"
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-xs transition-all"
                />
              </div>

              <div>
                <label htmlFor="usuario-email" className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 tracking-wider">
                  Correo Electrónico Corporativo *
                </label>
                <input
                  id="usuario-email"
                  type="email"
                  required
                  placeholder="ejemplo@sisbirceca.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 font-mono text-xs transition-all"
                />
              </div>

              <div>
                <label htmlFor="usuario-cedula" className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 tracking-wider">
                  Cédula / Documento de Identidad *
                </label>
                <input
                  id="usuario-cedula"
                  type="text"
                  required
                  placeholder="Ej. V-25.123.456"
                  value={formCedula}
                  onChange={(e) => setFormCedula(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-xs transition-all font-mono"
                />
              </div>

              <div>
                <label htmlFor="usuario-rol" className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 tracking-wider">
                  Rol de Acceso al Sistema *
                </label>
                <select
                  id="usuario-rol"
                  value={formRol}
                  onChange={(e) => setFormRol(e.target.value as 'TECNICO' | 'ADMIN')}
                  className="w-full px-3 py-2 bg-[#0F172A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-xs font-medium"
                >
                  <option value="TECNICO">Técnico de Torre (Campo) &middot; Terminal PWA /campo y /mobile</option>
                  <option value="ADMIN">Dirección de Operaciones (Admin) &middot; Gestión y Reportes</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  * Arquitectura de 2 roles. Los administradores auditan y gestionan reportes directamente.
                </p>
              </div>

              <div>
                <label htmlFor="usuario-cuadrilla" className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 tracking-wider">
                  Cuadrilla / Asignación Regional (Opcional)
                </label>
                <input
                  id="usuario-cuadrilla"
                  type="text"
                  placeholder="Ej. Cuadrilla Centro - AMBA"
                  value={formCuadrilla}
                  onChange={(e) => setFormCuadrilla(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-xs transition-all"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-5 py-2 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer active:translate-y-[1px]"
                >
                  {guardando ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
