import React, { useState } from 'react';
import { LabSession, SchoolProfile } from '../types';
import { exportSessionToCSV } from '../utils/exportUtils';
import { formatIndonesianDate, getTodayDateString } from '../utils/defaultData';
import {
  History,
  Search,
  Trash2,
  Printer,
  Download,
  Eye,
  Copy,
  X,
  PlusCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSessions: LabSession[];
  activeSessionId?: string;
  profile: SchoolProfile;
  onSelectSession: (session: LabSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onStartNewSession?: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedSessions,
  activeSessionId,
  profile,
  onSelectSession,
  onDeleteSession,
  onStartNewSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSessions = savedSessions.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.dayAndDate.toLowerCase().includes(q) ||
      (s.teacherName && s.teacherName.toLowerCase().includes(q)) ||
      (s.className && s.className.toLowerCase().includes(q)) ||
      (s.subject && s.subject.toLowerCase().includes(q))
    );
  });

  const handleDuplicateToToday = (session: LabSession) => {
    const today = getTodayDateString();
    const cloned: LabSession = {
      ...session,
      id: `session-${Date.now()}`,
      rawDate: today,
      dayAndDate: formatIndonesianDate(today),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSelectSession(cloned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <History size={18} className="text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">
              Riwayat Kartu Kontrol Lab Komputer
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Action & Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan tanggal, nama guru, kelas, atau mapel..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-slate-800"
            />
          </div>

          {onStartNewSession && (
            <button
              type="button"
              onClick={() => {
                onStartNewSession();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 border border-amber-500/50 rounded-md transition-colors whitespace-nowrap shadow-2xs cursor-pointer w-full sm:w-auto justify-center"
            >
              <PlusCircle size={14} />
              <span>Mulai Sesi Baru Kosong</span>
            </button>
          )}
        </div>

        {/* Sessions List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada riwayat tersimpan. Simpan kartu kontrol setelah melakukan pengecekan lab.
            </div>
          ) : (
            filteredSessions.map((item, index) => {
              const isActive = item.id === activeSessionId;
              const issuesCount = item.items.filter(
                (i) => i.isUsed && (i.initialStatus === 'bermasalah' || i.finalStatus === 'bermasalah')
              ).length;
              const usedCount = item.items.filter((i) => i.isUsed).length;

              return (
                <div
                  key={item.id}
                  className={`rounded-lg p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-emerald-50/80 border-2 border-emerald-500 shadow-xs'
                      : 'bg-white border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-900 bg-emerald-200/90 px-2 py-0.5 rounded uppercase font-mono">
                          <CheckCircle2 size={11} />
                          Sedang Dibuka
                        </span>
                      )}

                      <span className="font-semibold text-xs text-slate-900">
                        {item.dayAndDate}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {item.startTime} - {item.endTime}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-600 font-mono">
                        {usedCount} PC Digunakan
                      </span>
                      {issuesCount > 0 ? (
                        <span className="text-[10px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          {issuesCount} Bermasalah
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Semua Normal
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                      <span>Guru: <strong className="text-slate-800">{item.teacherName || 'Belum diisi'}</strong></span>
                      {item.className && <span>· Kelas: <strong>{item.className}</strong></span>}
                      {item.subject && <span>· Mapel: {item.subject}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-300 p-1.5 rounded-md text-xs self-end sm:self-center shrink-0 animate-fade-in">
                      <span className="text-red-700 font-semibold text-[11px] pr-1">Yakin hapus sesi ini?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteSession(item.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        Ya, Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] cursor-pointer transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSession(item);
                          onClose();
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                        }`}
                        title="Buka Formulir Ini"
                      >
                        <Eye size={13} />
                        {isActive ? 'Aktif di Layar' : 'Buka Formulir'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateToToday(item)}
                        className="px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        title="Duplikasi konfigurasi ini untuk sesi hari ini"
                      >
                        <Copy size={13} />
                        <span className="hidden md:inline">Duplikat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => exportSessionToCSV(item, profile)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                        title="Download Excel / CSV"
                      >
                        <Download size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition-colors"
                        title="Hapus Dari Riwayat"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Total {savedSessions.length} sesi tersimpan dalam arsip</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

