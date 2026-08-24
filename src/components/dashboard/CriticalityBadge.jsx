import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

const CONFIG = {
  critico: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Crítico' },
  atencao: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Atenção' },
  ok: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'OK' },
};

export function CriticalityBadge({ criticidade }) {
  const { icon: Icon, color, bg, label } = CONFIG[criticidade] || CONFIG.ok;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}