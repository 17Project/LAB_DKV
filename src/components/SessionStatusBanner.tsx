import React from 'react';
import { LabSession } from '../types';
import {
  Sparkles,
  FolderCheck,
  FileEdit,
  Save,
  PlusCircle,
  RotateCcw,
  Copy,
  ChevronDown,
  History,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SessionStatusBannerProps {
  currentSession: LabSession;
  savedSessions: LabSession[];
  isDirty: boolean;
  isSavedInHistory: boolean;
  onSaveCurrentSession: () => void;
  onSaveAsNewSession: () => void;
  onStartNewSession: () => void;
  onRevertChanges: () => void;
  onSelectSession: (session: LabSession) => void;
  onOpenHistoryModal: () => void;
}

export const SessionStatusBanner: React.FC<SessionStatusBannerProps> = ({
  currentSession,
  savedSessions,
  isDirty,
  isSavedInHistory,
  onSaveCurrentSession,
  onSaveAsNewSession,
  onStartNewSession,
  onRevertChanges,
  onSelectSession,
  onOpenHistoryModal,
}) => {
  // Determine state
  const isNewDraft = !isSavedInHistory;

  return (
    <div
      className={`no-print rounded-lg border p-3.5 transition-all shadow-xs ${
        isNewDraft
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : isDirty
          ? 'bg-blue-50/90 border-blue-300 text-blue-950'
          : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Status Badge & Clarification Message */}
        <div className="flex items-start sm:items-center gap-3">
          {/* Status Icon */}
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
              isNewDraft
                ? 'bg-amber-500 text-white'
                : isDirty
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isNewDraft ? (
              <Sparkles size={18} />
            ) : isDirty ? (
              <FileEdit size={18} />
            ) : (
              <FolderCheck size={18} />
            )}
          </div>

          {/* Texts */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                  isNewDraft
                    ? 'bg-amber-200 text-amber-900 border border-amber-300'
                    : isDirty
                    ? 'bg-blue-200 text-blue-900 border border-blue-300'
                    : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                }`}
              >
                {isNewDraft
                  ? '🆕 Sesi Baru (Belum Disimpan)'
                  : isDirty
                  ? '✏️ Sesi Arsip Sedang Diedit'
                  : '✅ Sesi Tersimpan di Arsip'}
              </span>

              <span className="text-xs font-semibold text-slate-800">
                {currentSession.dayAndDate}
                {currentSession.teacherName ? ` · ${currentSession.teacherName}` : ''}
                {currentSession.className ? ` (${currentSession.className})` : ''}
              </span>
            </div>

            <p className="text-xs mt-0.5 text-slate-600">
              {isNewDraft ? (
                <span>
                  Ini adalah <strong>formulir sesi baru</strong>. Data pengecekan ini belum masuk ke
                  riwayat arsip sekolah. Klik <em>"Simpan ke Riwayat"</em> setelah selesai.
                </span>
              ) : isDirty ? (
                <span className="text-blue-950 font-medium">
                  ⚠️ Ada perubahan data yang belum disimpan ke arsip riwayat. Klik{' '}
                  <em>"Perbarui Sesi Ini"</em> untuk memperbarui arsip atau simpan sebagai salinan
                  baru.
                </span>
              ) : (
                <span>
                  Sesi ini <strong>telah tersimpan dengan aman</strong> di arsip riwayat laboratorium.
                  Semua data sudah sinkron.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Session Switcher Dropdown & Relevant Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {/* Quick Session Switcher Dropdown */}
          <div className="relative">
            <select
              value={currentSession.id}
              onChange={(e) => {
                const targetId = e.target.value;
                if (targetId === '__NEW_SESSION__') {
                  onStartNewSession();
                } else {
                  const found = savedSessions.find((s) => s.id === targetId);
                  if (found) onSelectSession(found);
                }
              }}
              className="appearance-none bg-white border border-slate-300 text-slate-800 text-xs rounded-md pl-2.5 pr-7 py-1.5 font-medium shadow-2xs cursor-pointer hover:border-slate-400 focus:outline-hidden"
              title="Pilih dan beralih antara Sesi Baru dan Sesi Tersimpan"
            >
              <optgroup label="Sesi Aktif Saat Ini">
                {isNewDraft ? (
                  <option value={currentSession.id}>🆕 [Aktif] Sesi Baru (Draft)</option>
                ) : (
                  <option value={currentSession.id}>
                    📁 [Aktif] {currentSession.dayAndDate.split(',')[0]} -{' '}
                    {currentSession.teacherName || 'Guru'} ({currentSession.className || 'Lab'})
                  </option>
                )}
              </optgroup>

              <optgroup label="Buat Baru">
                <option value="__NEW_SESSION__">+ Mulai Sesi Baru Kosong</option>
              </optgroup>

              {savedSessions.length > 0 && (
                <optgroup label={`Riwayat Tersimpan (${savedSessions.length} Sesi)`}>
                  {savedSessions.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      {idx + 1}. {s.dayAndDate.split(',')[0]} · {s.teacherName || 'Guru'} (
                      {s.className || 'Lab'})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2 top-2.5 text-slate-500 pointer-events-none"
            />
          </div>

          {/* Action Buttons depending on state */}
          {isNewDraft ? (
            <button
              type="button"
              onClick={onSaveCurrentSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <Save size={13} />
              <span>Simpan ke Riwayat</span>
            </button>
          ) : isDirty ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onSaveCurrentSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs cursor-pointer"
                title="Simpan revisi data ke sesi arsip ini"
              >
                <Save size={13} />
                <span>Perbarui Sesi Ini</span>
              </button>

              <button
                type="button"
                onClick={onSaveAsNewSession}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer"
                title="Simpan sebagai sesi baru (tidak menimpa arsip)"
              >
                <PlusCircle size={13} />
                <span>Simpan Sesi Baru</span>
              </button>

              <button
                type="button"
                onClick={onRevertChanges}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded cursor-pointer"
                title="Batalkan perubahan & kembalikan data tersimpan"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-100/80 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 size={13} />
                <span>Tersimpan di Riwayat</span>
              </span>

              <button
                type="button"
                onClick={onStartNewSession}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer"
                title="Tinggalkan sesi ini dan mulai formulir baru"
              >
                <PlusCircle size={13} />
                <span>Mulai Sesi Baru</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
