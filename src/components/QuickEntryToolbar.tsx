import React, { useState } from 'react';
import { ComputerCheck, LabSession } from '../types';
import { COMMON_ISSUES, LAB_CONDITIONS, calculateLabStats } from '../utils/defaultData';
import { CheckCircle2, Copy, Sparkles, AlertCircle, Wrench, RotateCcw, Power } from 'lucide-react';

interface QuickEntryToolbarProps {
  session: LabSession;
  onUpdateSession: (updated: LabSession) => void;
  onReset: () => void;
}

export const QuickEntryToolbar: React.FC<QuickEntryToolbarProps> = ({
  session,
  onUpdateSession,
  onReset,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<string>(COMMON_ISSUES[0]);
  const [targetComputerId, setTargetComputerId] = useState<string>(session.items[0]?.id || '');

  // Calculate statistics according to user rule:
  // "Penilaian kondisi komputer hanya pada komputer yang digunakan"
  const stats = calculateLabStats(session);

  const handleSetAllUsedInitialGood = () => {
    const updated = session.items.map((item) => {
      if (!item.isUsed) return item;
      return {
        ...item,
        initialStatus: 'baik' as const,
        initialLabCondition: session.overallInitialLab || 'Bersih & Rapi',
      };
    });
    onUpdateSession({ ...session, items: updated, updatedAt: new Date().toISOString() });
  };

  const handleCopyInitialToFinal = () => {
    const updated = session.items.map((item) => {
      if (!item.isUsed) return item;
      return {
        ...item,
        finalStatus: item.initialStatus,
        finalLabCondition: session.overallFinalLab || item.initialLabCondition || 'Bersih & Rapi',
      };
    });
    onUpdateSession({ ...session, items: updated, updatedAt: new Date().toISOString() });
  };

  const handleSetUsedCount = (count: number) => {
    const updated = session.items.map((item, idx) => {
      const willBeUsed = idx < count;
      return {
        ...item,
        isUsed: willBeUsed,
        initialStatus: willBeUsed ? (item.initialStatus || 'baik') : null,
        finalStatus: willBeUsed ? (item.finalStatus || 'baik') : null,
        notes: willBeUsed ? item.notes : '',
      };
    });
    onUpdateSession({ ...session, items: updated, updatedAt: new Date().toISOString() });
  };

  const handleApplyIssueToComputer = (issueText: string, compId?: string) => {
    const targetId = compId || targetComputerId;
    const updated = session.items.map((item) => {
      if (item.id === targetId) {
        const currentNotes = item.notes ? `${item.notes}, ${issueText}` : issueText;
        return {
          ...item,
          isUsed: true,
          finalStatus: 'bermasalah' as const,
          notes: currentNotes,
        };
      }
      return item;
    });
    onUpdateSession({ ...session, items: updated, updatedAt: new Date().toISOString() });
  };

  const handleSetOverallLab = (condition: string, phase: 'initial' | 'final') => {
    if (phase === 'initial') {
      const updated = session.items.map((i) => ({ ...i, initialLabCondition: condition }));
      onUpdateSession({
        ...session,
        overallInitialLab: condition,
        items: updated,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const updated = session.items.map((i) => ({ ...i, finalLabCondition: condition }));
      onUpdateSession({
        ...session,
        overallFinalLab: condition,
        items: updated,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-4 no-print">
      {/* Top Stat Summary & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        {/* Metric Badges with rigorous evaluation only on active PCs */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="font-semibold text-slate-900 font-mono">{stats.usedUnits}</span>
            <span>dari {stats.totalUnits} PC Dihidupkan</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="font-semibold font-mono">{stats.goodUnits}</span>
            <span>Baik ({stats.fitnessPercentage}%)</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5 text-red-600">
            <span className="font-semibold font-mono">{stats.troubledUnits}</span>
            <span>Bermasalah</span>
          </div>
          {stats.unusedUnits > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="font-mono">{stats.unusedUnits}</span>
                <span>Mati (Tidak Dinilai)</span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSetAllUsedInitialGood}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            title="Tandai kondisi awal PC yang digunakan menjadi BAIK"
          >
            <CheckCircle2 size={14} className="text-emerald-600" />
            Set PC Aktif: Baik
          </button>

          <button
            type="button"
            onClick={handleCopyInitialToFinal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            title="Salin status kondisi awal ke kondisi akhir untuk PC yang aktif"
          >
            <Copy size={14} className="text-blue-600" />
            Salin Awal ke Akhir
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
            title="Kosongkan formulir"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>

      {/* Row: Quick Selector for Active PC Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200">
        <div className="flex items-center gap-2">
          <Power size={14} className="text-amber-600" />
          <span className="font-medium text-slate-800">
            Jumlah PC Dihidupkan / Digunakan Sesi Ini:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSetUsedCount(session.items.length)}
            className={`px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
              stats.usedUnits === session.items.length
                ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Semua ({session.items.length} PC)
          </button>
          {[10, 12, 14, 16].map((num) => {
            if (num > session.items.length) return null;
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleSetUsedCount(num)}
                className={`px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                  stats.usedUnits === num
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {num} PC
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleSetUsedCount(0)}
            className="px-2 py-1 rounded text-xs border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            Nonaktifkan Semua
          </button>
        </div>
      </div>

      {/* Lab Condition Presets & Fast Issue Tagging */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Left: Overall Room Condition */}
        <div className="space-y-1.5">
          <div className="font-medium text-slate-700 flex items-center justify-between">
            <span>Kondisi Ruangan Lab Cepat:</span>
            <span className="text-[11px] text-slate-500">Terapkan ke seluruh unit</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium">Awal:</span>
            {LAB_CONDITIONS.slice(0, 4).map((cond) => (
              <button
                key={`init-${cond}`}
                type="button"
                onClick={() => handleSetOverallLab(cond, 'initial')}
                className={`px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer ${
                  session.overallInitialLab === cond
                    ? 'bg-slate-900 text-white border-slate-900 font-medium'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 font-medium">Akhir:</span>
            {LAB_CONDITIONS.slice(0, 4).map((cond) => (
              <button
                key={`fin-${cond}`}
                type="button"
                onClick={() => handleSetOverallLab(cond, 'final')}
                className={`px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer ${
                  session.overallFinalLab === cond
                    ? 'bg-slate-900 text-white border-slate-900 font-medium'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Quick Tag for Issues */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 flex items-center gap-1">
              <Wrench size={13} className="text-amber-600" />
              Catat Kendala Cepat:
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500">ke PC:</span>
              <select
                value={targetComputerId}
                onChange={(e) => setTargetComputerId(e.target.value)}
                className="border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-mono font-medium bg-white focus:outline-hidden"
              >
                {session.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {!item.isUsed ? '(Mati)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {COMMON_ISSUES.map((issue) => (
              <button
                key={issue}
                type="button"
                onClick={() => handleApplyIssueToComputer(issue)}
                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[10.5px] transition-colors cursor-pointer"
                title={`Klik untuk menambahkan "${issue}" ke ${targetComputerId}`}
              >
                + {issue}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
