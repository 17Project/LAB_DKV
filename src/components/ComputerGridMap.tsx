import React, { useState } from 'react';
import { ComputerCheck, LabSession } from '../types';
import { Monitor, AlertTriangle, CheckCircle2, Wrench, X, Power, PowerOff } from 'lucide-react';
import { COMMON_ISSUES, calculateLabStats } from '../utils/defaultData';

interface ComputerGridMapProps {
  session: LabSession;
  onUpdateSession: (updated: LabSession) => void;
}

export const ComputerGridMap: React.FC<ComputerGridMapProps> = ({ session, onUpdateSession }) => {
  const [selectedComp, setSelectedComp] = useState<ComputerCheck | null>(null);

  const stats = calculateLabStats(session);

  const handleUpdateComputer = (updated: ComputerCheck) => {
    const newItems = session.items.map((item) => (item.id === updated.id ? updated : item));
    onUpdateSession({ ...session, items: newItems, updatedAt: new Date().toISOString() });
    setSelectedComp(updated);
  };

  const troubledPCs = session.items.filter(
    (item) => item.isUsed && (item.initialStatus === 'bermasalah' || item.finalStatus === 'bermasalah')
  );

  return (
    <div className="space-y-6">
      {/* Intro & Summary */}
      <div className="bg-white p-5 rounded-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Monitor size={16} className="text-slate-700" />
              Tata Letak & Status Unit Lab Komputer (DKV-01 s/d DKV-18)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Penilaian kondisi komputer hanya dihitung pada PC yang dihidupkan/digunakan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Baik ({stats.goodUnits})
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Bermasalah ({stats.troubledUnits})
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              Mati ({stats.unusedUnits})
            </span>
          </div>
        </div>

        {/* 18 Computer Desks Grid (simulating lab layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {session.items.map((comp) => {
            const isUnused = !comp.isUsed;
            const isTroubled =
              comp.isUsed &&
              (comp.initialStatus === 'bermasalah' || comp.finalStatus === 'bermasalah');

            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelectedComp(comp)}
                className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between h-28 cursor-pointer ${
                  isUnused
                    ? 'bg-slate-100/70 border-slate-200 text-slate-400 hover:bg-slate-200/60 opacity-80'
                    : isTroubled
                    ? 'bg-red-50/80 border-red-300 hover:border-red-400'
                    : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                } ${selectedComp?.id === comp.id ? 'ring-2 ring-slate-900 shadow-xs' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono font-bold text-xs ${isUnused ? 'text-slate-500' : 'text-slate-900'}`}>
                    {comp.name}
                  </span>
                  {isUnused ? (
                    <span title="Mati / Tidak Dihidupkan">
                      <PowerOff size={14} className="text-slate-400 shrink-0" />
                    </span>
                  ) : isTroubled ? (
                    <AlertTriangle size={15} className="text-red-500 shrink-0" />
                  ) : (
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  )}
                </div>

                <div className="space-y-1 my-1">
                  {isUnused ? (
                    <div className="text-[11px] text-slate-400 italic py-1 text-center font-medium">
                      Mati / Tdk Dipakai
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Awal:</span>
                        <span
                          className={`font-medium ${
                            comp.initialStatus === 'baik'
                              ? 'text-emerald-700'
                              : comp.initialStatus === 'bermasalah'
                              ? 'text-red-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {comp.initialStatus === 'baik'
                            ? 'Baik'
                            : comp.initialStatus === 'bermasalah'
                            ? 'Rusak'
                            : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Akhir:</span>
                        <span
                          className={`font-medium ${
                            comp.finalStatus === 'baik'
                              ? 'text-emerald-700'
                              : comp.finalStatus === 'bermasalah'
                              ? 'text-red-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {comp.finalStatus === 'baik'
                            ? 'Baik'
                            : comp.finalStatus === 'bermasalah'
                            ? 'Rusak'
                            : '-'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-[10px] text-slate-600 truncate border-t border-slate-200/80 pt-1">
                  {isUnused ? (
                    <span className="text-slate-400">-</span>
                  ) : (
                    comp.notes || <span className="text-slate-400 italic">Normal</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Computer Quick Modal / Drawer */}
      {selectedComp && (
        <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm relative">
          <button
            type="button"
            onClick={() => setSelectedComp(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
          >
            <X size={16} />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-mono font-bold text-slate-900">
                Unit {selectedComp.name}
              </span>
              <span className="text-xs text-slate-500 font-sans">
                (No Urut: {selectedComp.no})
              </span>
            </div>

            {/* Power state toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Status Komputer:</span>
              <button
                type="button"
                onClick={() =>
                  handleUpdateComputer({
                    ...selectedComp,
                    isUsed: !selectedComp.isUsed,
                    initialStatus: !selectedComp.isUsed ? (selectedComp.initialStatus || 'baik') : null,
                    finalStatus: !selectedComp.isUsed ? (selectedComp.finalStatus || 'baik') : null,
                  })
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  selectedComp.isUsed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {selectedComp.isUsed ? (
                  <>
                    <Power size={13} />
                    <span>Dihidupkan (Digunakan)</span>
                  </>
                ) : (
                  <>
                    <PowerOff size={13} />
                    <span>Mati (Tidak Digunakan)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {selectedComp.isUsed ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Status Selection */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Kondisi Awal (Sebelum Pembelajaran)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateComputer({ ...selectedComp, initialStatus: 'baik' })
                      }
                      className={`flex-1 py-1.5 px-3 rounded border text-xs font-medium cursor-pointer ${
                        selectedComp.initialStatus === 'baik'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ✔ Baik
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateComputer({ ...selectedComp, initialStatus: 'bermasalah' })
                      }
                      className={`flex-1 py-1.5 px-3 rounded border text-xs font-medium cursor-pointer ${
                        selectedComp.initialStatus === 'bermasalah'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ✖ Bermasalah
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Kondisi Akhir (Setelah Pembelajaran)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateComputer({ ...selectedComp, finalStatus: 'baik' })
                      }
                      className={`flex-1 py-1.5 px-3 rounded border text-xs font-medium cursor-pointer ${
                        selectedComp.finalStatus === 'baik'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ✔ Baik
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateComputer({ ...selectedComp, finalStatus: 'bermasalah' })
                      }
                      className={`flex-1 py-1.5 px-3 rounded border text-xs font-medium cursor-pointer ${
                        selectedComp.finalStatus === 'bermasalah'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ✖ Bermasalah
                    </button>
                  </div>
                </div>
              </div>

              {/* Problem Notes */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-medium">
                  Keterangan Kerusakan / Catatan Teknis
                </label>
                <textarea
                  rows={3}
                  value={selectedComp.notes}
                  onChange={(e) =>
                    handleUpdateComputer({ ...selectedComp, notes: e.target.value })
                  }
                  placeholder="Contoh: Mouse mati, kabel LAN tidak terdeteksi, keyboard enter macet..."
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:outline-hidden focus:border-slate-800"
                />

                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Tambah cepat:</span>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_ISSUES.map((issue) => (
                      <button
                        key={issue}
                        type="button"
                        onClick={() => {
                          const newNotes = selectedComp.notes
                            ? `${selectedComp.notes}, ${issue}`
                            : issue;
                          handleUpdateComputer({
                            ...selectedComp,
                            finalStatus: 'bermasalah',
                            notes: newNotes,
                          });
                        }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10.5px] cursor-pointer"
                      >
                        + {issue}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded text-center text-xs text-slate-500">
              Komputer ini ditandai <strong>Mati / Tidak Dihidupkan</strong> pada sesi ini.
              Sesuai aturan, kondisi komputer tidak dinilai jika komputer tidak dihidupkan.
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateComputer({
                      ...selectedComp,
                      isUsed: true,
                      initialStatus: 'baik',
                      finalStatus: 'baik',
                    })
                  }
                  className="px-3 py-1 bg-slate-900 text-white rounded text-xs cursor-pointer hover:bg-slate-800"
                >
                  Hidupkan Komputer Ini
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Maintenance Action List for Trouble PCs */}
      {troubledPCs.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 font-bold text-xs text-amber-950">
            <Wrench size={15} className="text-amber-700" />
            Daftar Unit PC Perlu Perbaikan ({troubledPCs.length} unit yang digunakan):
          </div>
          <div className="space-y-1.5">
            {troubledPCs.map((pc) => (
              <div
                key={pc.id}
                className="flex items-center justify-between text-xs bg-white px-3 py-1.5 rounded border border-amber-200/80"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900">{pc.name}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-red-700 font-medium">{pc.notes || 'Bermasalah (tanpa rincian)'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newItems = session.items.map((i) =>
                      i.id === pc.id
                        ? { ...i, initialStatus: 'baik' as const, finalStatus: 'baik' as const, notes: '' }
                        : i
                    );
                    onUpdateSession({ ...session, items: newItems, updatedAt: new Date().toISOString() });
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium cursor-pointer"
                >
                  Tandai Selesai Diperbaiki
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

