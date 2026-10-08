import React from 'react';
import { ShieldCheck, Clock, UserCheck, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ActivityLogsView: React.FC = () => {
  const { adminLogs } = useStore();

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900">
          Admin Security Audit Trail
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Immutable audit record of all administrative changes, catalog updates, and order status transitions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-[#FAF8F5] border-b border-stone-200 text-xs font-semibold text-stone-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#C5A059]" />
            <span>Audit Records ({adminLogs.length})</span>
          </span>
          <span className="text-[10px] text-stone-400 font-mono">APPEND-ONLY COMPLIANT</span>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {adminLogs.map((log) => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50/70 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-500 font-medium">{log.targetType}</span>
                </div>
                <p className="text-stone-700">{log.details}</p>
                <p className="text-[10px] text-stone-400">
                  Triggered by: <span className="font-mono text-stone-600">{log.adminEmail}</span>
                </p>
              </div>

              <span className="text-[11px] font-mono text-stone-400 flex-shrink-0">
                {new Date(log.timestamp).toLocaleString('en-IN')}
              </span>
            </div>
          ))}

          {adminLogs.length === 0 && (
            <div className="py-12 text-center text-xs text-stone-400">
              No audit records yet. Administrative actions will automatically be appended here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
