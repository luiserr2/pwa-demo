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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* HEADER DE PÁGINA */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
            >
              &larr; Volver al Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Usuarios y Personal de Campo
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Control de cuentas (RBAC de 2 roles: Técnicos de Torre y Dirección de Operaciones).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setModalCrear(true)}
            className="bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>+</span>
            <span>Registrar Usuario</span>
          </button>
        </div>
      </div>

      {/* BANNER DE NOTIFICACIONES */}
      {mensaje && (
        <div
          className={`mb-5 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{mensaje.texto}</span>
          <button
            onClick={() => setMensaje(null)}
            className="text-xs font-bold px-2 py-0.5 rounded hover:bg-black/5"
          >
            ✕
          </button>
        </div>
      )}

      {/* METRICAS RÁPIDAS DE USUARIOS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Cuentas
          </span>
          <span className="text-2xl font-extrabold text-slate-900">{usuarios.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Técnicos (Campo)
          </span>
          <span className="text-2xl font-extrabold text-emerald-600">{conteoTecnicos}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Administradores (Operaciones)
          </span>
          <span className="text-2xl font-extrabold text-slate-900">{conteoAdmins}</span>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE USUARIOS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-5 font-bold text-slate-900">{u.nombre}</td>
                  <td className="p-3.5 font-mono text-slate-600">{u.email}</td>
                  <td className="p-3.5 text-slate-700 font-medium">{u.cedula}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                        u.rol === 'ADMIN'
                          ? 'bg-slate-900 text-white border-slate-800'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {u.rol === 'ADMIN' ? 'ADMINISTRADOR' : 'TÉCNICO CAMPO'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 font-medium">{u.cuadrilla}</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleToggleEstado(u.id, u.nombre)}
                      title="Haga clic para cambiar estado"
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                        u.estado === 'ACTIVO'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          : 'text-slate-500 bg-slate-100 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {u.estado}
                    </button>
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <button
                      onClick={() => handleEliminarUsuario(u.id, u.nombre)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
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

      {/* MODAL PARA CREAR NUEVO USUARIO */}
      {modalCrear && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Registrar Nuevo Usuario</h3>
                <p className="text-xs text-slate-500">Seleccione el rol y asigne permisos operativos:</p>
              </div>
              <button
                onClick={() => setModalCrear(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Correo Electrónico Corporativo *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@sisbirceca.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Cédula / Documento de Identidad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. V-25.123.456"
                  value={formCedula}
                  onChange={(e) => setFormCedula(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Rol de Acceso al Sistema *
                </label>
                <select
                  value={formRol}
                  onChange={(e) => setFormRol(e.target.value as 'TECNICO' | 'ADMIN')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold bg-white"
                >
                  <option value="TECNICO">Técnico de Torre (Campo) &middot; Terminal PWA /campo y /mobile</option>
                  <option value="ADMIN">Dirección de Operaciones (Admin) &middot; Gestión, Reportes y Validación</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  * El sistema opera bajo arquitectura de 2 roles. Los administradores auditan y aprueban reportes directamente.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Cuadrilla / Asignación Regional (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cuadrilla Centro - AMBA"
                  value={formCuadrilla}
                  onChange={(e) => setFormCuadrilla(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-slate-900 hover:bg-black text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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
