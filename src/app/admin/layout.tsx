import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 text-slate-800 flex flex-col">
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
