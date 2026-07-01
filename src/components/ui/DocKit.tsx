import React from 'react';

interface DocSectionProps {
  title: string;
  children: React.ReactNode;
}

export function DocSection({ title, children }: DocSectionProps) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-white mb-4 border-b border-[#2a2d35] pb-2 flex items-center gap-2">
        {title}
      </h2>
      <div className="text-slate-300 space-y-4 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-12">
      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">{title}</h1>
      <p className="text-lg text-slate-400">{subtitle}</p>
    </div>
  );
}

export function Callout({ title, children, type = 'info' }: { title: string, children: React.ReactNode, type?: 'info' | 'warning' | 'success' }) {
  const colors = {
    info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.05)]',
    warning: 'bg-yellow-500/10 border-yellow-400/30 text-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.05)]',
    success: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.05)]',
  };
  return (
    <div className={`p-4 rounded-2xl border my-4 ${colors[type]}`}>
      <h4 className="font-bold mb-1">{title}</h4>
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#14161a] rounded-2xl p-5 border border-[#2a2d35] shadow-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <h3 className="text-lg font-bold text-white mb-3 relative z-10">{title}</h3>
      <div className="text-sm text-slate-400 space-y-2 relative z-10">{children}</div>
    </div>
  );
}
