import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-100 overflow-hidden flex flex-col">
      {/* AMBIENT LUMINOUS MESH GRADIENTS (GLASS CANVAS) */}
      <div className="pointer-events-none absolute -top-40 -left-20 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/10 to-transparent rounded-full blur-[120px] -z-10" />
      <div className="pointer-events-none absolute top-1/4 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-600/20 via-teal-600/10 to-transparent rounded-full blur-[140px] -z-10" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-gradient-to-t from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-[130px] -z-10" />

      {/* SUBTLE MATRIX PATTERN OVERLAY */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:28px_28px] -z-10" />

      {/* CHILDREN CONTENT */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
