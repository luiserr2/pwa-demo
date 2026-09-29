'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/client/context/AuthContext';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAdmin = () => { setEmail('admin@sisbirceca.com'); setPassword('admin123'); };
  const setTecnico = () => { setEmail('tecnico@sisbirceca.com'); setPassword('tecnico123'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProcesando(true);

    try {
      const success = await login(email);
      
      if (!success) {
        setError('Credenciales inválidas (intente admin@sisbirceca.com o tecnico@sisbirceca.com)');
        setProcesando(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const isAd = email.toLowerCase().includes('admin') || email.toLowerCase().includes('supervisor');
      const redirectUrl = isAd ? '/admin/dashboard' : '/campo';

      router.push(redirectUrl);
    } catch (err) {
      setError('Error interno del sistema.');
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Fondo decorativo super sutil (Glows corporativos) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* CONTENEDOR PRINCIPAL: SaaS Floating Split-Card */}
      <div className="w-full max-w-[1000px] min-h-[600px] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5 flex overflow-hidden relative z-10">
        
        {/* MITAD IZQUIERDA: IMAGEN CORPORATIVA */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-10 overflow-hidden">
          <Image
            src="/login-cover.jpg"
            alt="Telecom Security Infrastructure"
            fill
            className="absolute inset-0 h-full w-full object-cover scale-105"
            priority
          />
          {/* Overlay oscuro mejorado */}
          <div className="absolute inset-0 bg-slate-900/70 mix-blend-multiply" />
          
          {/* Top izquierdo: Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-wide text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SISTEMA CERTIFICADO
            </div>
          </div>

          {/* Bottom izquierdo: Textos */}
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3 leading-tight drop-shadow-md">
              Auditoría y Gestión <br/>de Radiobases
            </h1>
            <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-sm">
              Plataforma B2B para el control técnico de infraestructura. Acceso monitoreado y cifrado.
            </p>
          </div>
        </div>

        {/* MITAD DERECHA: FORMULARIO */}
        <div className="flex flex-1 flex-col justify-center p-8 sm:p-12 lg:p-16">
          
          {/* Header Formulario */}
          <div className="mb-8 flex items-center justify-between">
            <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-2xl ring-1 ring-blue-100 shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            
            {/* BOTONES DEV SUTILES */}
            <div className="flex items-center gap-2">
              <button type="button" onClick={setAdmin} className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold font-mono rounded-lg transition-all active:scale-95">
                ADMIN
              </button>
              <button type="button" onClick={setTecnico} className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold font-mono rounded-lg transition-all active:scale-95">
                TEC
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Iniciar Sesión
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 font-medium">
              Ingrese sus credenciales de acceso seguro.
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-bold flex items-start gap-2 shadow-sm">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Correo Electrónico
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 bg-slate-50/50 hover:bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm font-medium transition-all"
                    placeholder="usuario@sisbirceca.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block font-mono w-full rounded-xl border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 bg-slate-50/50 hover:bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm font-medium transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 cursor-pointer font-medium">
                    Mantener sesión
                  </label>
                </div>

                <div className="text-xs">
                  <a href="#" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                    ¿Olvidó su clave?
                  </a>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={procesando}
                  className="flex w-full justify-center rounded-xl bg-slate-900 px-3 py-4 text-sm font-bold text-white shadow-lg hover:bg-blue-600 hover:shadow-blue-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {procesando ? 'Autenticando...' : 'Acceder al Sistema'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
            <span className="text-[10px] text-slate-400 font-mono font-semibold flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              ENCRIPTACIÓN HMAC SHA-256
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
