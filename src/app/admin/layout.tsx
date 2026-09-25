import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-[#0A0F1D] text-slate-100 flex flex-col">
      {/* ARCHITECTURAL OBSIDIAN GRID (PRECISION TELECOM SSOT) */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" 
      />

      {/* RESTRAINED COBALT APERTURE (SINGLE ACCENT, SATURATION < 80%) */}
      <div 
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/[0.04] rounded-full blur-[100px] -z-10" 
      />

      {/* MAIN CONTAINER */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
