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
      {/* HEADER DE PÁGINA (GLASS STYLE) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span> Volver a Estadísticas
            </Link>
            <span className="text-slate-600">&middot;</span>
            <span className="bg-white/5 text-cyan-300 text-[10px] font-mono uppercase px-3 py-0.5 rounded-full tracking-widest border border-cyan-500/20 backdrop-blur-md font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              Gestión de Personal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Directorio y Administración de Personal Técnico
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Control de cuentas de técnicos de campo, asignación de cuadrillas y permisos de captura.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setModalCrear(true)}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 hover:border-cyan-400/60"
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>Registrar Técnico</span>
          </button>
        </div>
      </div>

      {/* BANNER DE NOTIFICACIONES */}
      {mensaje && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between border backdrop-blur-xl shadow-lg transition-all ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_4px_20px_rgba(244,63,94,0.15)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{mensaje.tipo === 'ok' ? '✓' : '⚠️'}</span>
            <span>{mensaje.texto}</span>
          </div>
          <button
            onClick={() => setMensaje(null)}
            className="text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* METRICAS RÁPIDAS DE USUARIOS (FROSTED GLASS CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:border-cyan-500/30 hover:bg-slate-900/60 transition-all duration-300">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Cuentas
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight block mb-1 drop-shadow-sm">
            {usuarios.length}
          </span>
          <p className="text-[11px] text-slate-400 font-medium">Personal activo en plataforma</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all duration-300">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Técnicos (Campo)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight block mb-1 drop-shadow-sm">
            {conteoTecnicos}
          </span>
          <p className="text-[11px] text-slate-400 font-medium">Habilitados para captura y app móvil</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:border-cyan-500/30 hover:bg-slate-900/60 transition-all duration-300">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Administradores (Operaciones)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight block mb-1 drop-shadow-sm">
            {conteoAdmins}
          </span>
          <p className="text-[11px] text-slate-400 font-medium">Gestión de expedientes y cuentas</p>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE USUARIOS (FROSTED GLASS CONTAINER) */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Directorio de Operadores y Administradores
            </h2>
            <p className="text-xs text-slate-400">
              Listado general con privilegios de acceso y asignación operativa.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold bg-white/5 text-slate-300 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            {usuarios.length} Registros Activos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/[0.03] text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10 backdrop-blur-md">
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
            <tbody className="divide-y divide-white/5">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="p-3.5 pl-5">
                    <span className="font-bold text-white text-xs">{u.nombre}</span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300 text-[11px]">{u.email}</td>
                  <td className="p-3.5 text-slate-300 font-medium">{u.cedula}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${
                        u.rol === 'ADMIN'
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      }`}
                    >
                      {u.rol === 'ADMIN' ? 'ADMINISTRADOR' : 'TÉCNICO CAMPO'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-medium">{u.cuadrilla}</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleToggleEstado(u.id, u.nombre)}
                      title="Haga clic para alternar estado"
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                        u.estado === 'ACTIVO'
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                          : 'text-slate-400 bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-md'
                      }`}
                    >
                      {u.estado}
                    </button>
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <button
                      onClick={() => handleEliminarUsuario(u.id, u.nombre)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20 hover:border-rose-500/40 backdrop-blur-md cursor-pointer"
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

      {/* MODAL PARA CREAR NUEVO USUARIO (FROSTED GLASS MODAL) */}
      {modalCrear && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950/90 backdrop-blur-2xl rounded-2xl max-w-md w-full p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="font-bold text-base text-white tracking-tight">Registrar Nuevo Usuario</h3>
                <p className="text-xs text-slate-400">Seleccione el rol y asigne permisos operativos:</p>
              </div>
              <button
                onClick={() => setModalCrear(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1 tracking-wider">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-xs backdrop-blur-md transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1 tracking-wider">
                  Correo Electrónico Corporativo *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@sisbirceca.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono text-xs backdrop-blur-md transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1 tracking-wider">
                  Cédula / Documento de Identidad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. V-25.123.456"
                  value={formCedula}
                  onChange={(e) => setFormCedula(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-xs backdrop-blur-md transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1 tracking-wider">
                  Rol de Acceso al Sistema *
                </label>
                <select
                  value={formRol}
                  onChange={(e) => setFormRol(e.target.value as 'TECNICO' | 'ADMIN')}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-xs font-semibold backdrop-blur-md"
                >
                  <option value="TECNICO" className="bg-slate-900 text-white">
                    Técnico de Torre (Campo) &middot; Terminal PWA /campo y /mobile
                  </option>
                  <option value="ADMIN" className="bg-slate-900 text-white">
                    Dirección de Operaciones (Admin) &middot; Gestión, Reportes y Validación
                  </option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  * El sistema opera bajo arquitectura de 2 roles. Los administradores auditan y gestionan reportes directamente.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1 tracking-wider">
                  Cuadrilla / Asignación Regional (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cuadrilla Centro - AMBA"
                  value={formCuadrilla}
                  onChange={(e) => setFormCuadrilla(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-xs backdrop-blur-md transition-all"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 font-semibold text-xs transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs px-5 py-2 rounded-xl border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all disabled:opacity-50 cursor-pointer active:scale-95"
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
