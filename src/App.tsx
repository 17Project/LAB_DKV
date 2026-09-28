/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LabSession, SchoolProfile } from './types';
import {
  DEFAULT_SCHOOL_PROFILE,
  createNewLabSession,
  generateSampleSessions,
  formatIndonesianDate,
  getTodayDateString,
} from './utils/defaultData';
import { exportSessionToCSV } from './utils/exportUtils';
import { PrintableCard } from './components/PrintableCard';
import { QuickEntryToolbar } from './components/QuickEntryToolbar';
import { ComputerGridMap } from './components/ComputerGridMap';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ReportRecapView } from './components/ReportRecapView';
import { SessionStatusBanner } from './components/SessionStatusBanner';
import {
  Printer,
  Save,
  Download,
  PlusCircle,
  History,
  Settings,
  Monitor,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
  School,
  ExternalLink,
  BarChart3,
  Sparkles,
  FolderCheck,
  RotateCcw,
  Cloud,
  Database,
} from 'lucide-react';
import {
  testConnection,
  subscribeSchoolProfile,
  saveSchoolProfileToCloud,
  subscribeSessions,
  saveSessionToCloud,
  deleteSessionFromCloud,
  seedInitialProfileIfEmpty,
  seedInitialSessionsIfEmpty,
} from './services/firebase';

const STORAGE_KEY_CURRENT = 'smk_lab_current_session_v1';
const STORAGE_KEY_SESSIONS = 'smk_lab_history_sessions_v1';
const STORAGE_KEY_PROFILE = 'smk_lab_school_profile_v1';

export default function App() {
  // Load school profile
  const [profile, setProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_PROFILE;
    } catch {
      return DEFAULT_SCHOOL_PROFILE;
    }
  });

  // Load current session
  const [currentSession, setCurrentSession] = useState<LabSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return createNewLabSession(profile);
  });

  // Saved history sessions
  const [savedSessions, setSavedSessions] = useState<LabSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return generateSampleSessions(profile);
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'sheet' | 'map' | 'recap'>('sheet');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Test Firestore Connection on boot
  useEffect(() => {
    testConnection().then((connected) => {
      setIsCloudConnected(connected);
    });
  }, []);

  // Realtime subscription for School Profile & Logos across devices
  useEffect(() => {
    seedInitialProfileIfEmpty(profile);

    const unsubscribe = subscribeSchoolProfile(
      (cloudProfile) => {
        if (cloudProfile && cloudProfile.schoolName) {
          setProfile((prev) => ({
            ...prev,
            ...cloudProfile,
          }));
        }
      },
      (err) => {
        console.warn('Realtime profile sync fallback:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  // Realtime subscription for Lab Sessions across devices
  useEffect(() => {
    const initialSamples = generateSampleSessions(profile);
    seedInitialSessionsIfEmpty(savedSessions.length > 0 ? savedSessions : initialSamples);

    const unsubscribe = subscribeSessions(
      (cloudSessions) => {
        if (cloudSessions && cloudSessions.length > 0) {
          setSavedSessions(cloudSessions);
        }
      },
      (err) => {
        console.warn('Realtime sessions sync fallback:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  // Auto-save current draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentSession));
    } catch {
      // ignore
    }
  }, [currentSession]);

  // Persist history sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(savedSessions));
    } catch {
      // ignore
    }
  }, [savedSessions]);

  // Persist school profile
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Determine if current session is saved in history
  const savedVersion = savedSessions.find((s) => s.id === currentSession.id);
  const isSavedInHistory = Boolean(savedVersion);

  // Check if saved session has unsaved modifications
  const isDirty = useMemo(() => {
    if (!savedVersion) return false;
    return (
      JSON.stringify({
        dayAndDate: currentSession.dayAndDate,
        teacherName: currentSession.teacherName,
        startTime: currentSession.startTime,
        endTime: currentSession.endTime,
        subject: currentSession.subject,
        className: currentSession.className,
        labName: currentSession.labName,
        overallInitialLab: currentSession.overallInitialLab,
        overallFinalLab: currentSession.overallFinalLab,
        items: currentSession.items,
      }) !==
      JSON.stringify({
        dayAndDate: savedVersion.dayAndDate,
        teacherName: savedVersion.teacherName,
        startTime: savedVersion.startTime,
        endTime: savedVersion.endTime,
        subject: savedVersion.subject,
        className: savedVersion.className,
        labName: savedVersion.labName,
        overallInitialLab: savedVersion.overallInitialLab,
        overallFinalLab: savedVersion.overallFinalLab,
        items: savedVersion.items,
      })
    );
  }, [currentSession, savedVersion]);

  const handleSaveCurrentSession = async () => {
    const existingIndex = savedSessions.findIndex((s) => s.id === currentSession.id);
    const now = new Date().toISOString();
    const updatedSession = { ...currentSession, updatedAt: now };

    setIsSyncing(true);
    if (existingIndex >= 0) {
      const updatedList = [...savedSessions];
      updatedList[existingIndex] = updatedSession;
      setSavedSessions(updatedList);
      showToast('Perubahan diperbarui & disinkronkan ke Cloud Database!');
    } else {
      setSavedSessions([updatedSession, ...savedSessions]);
      showToast('Sesi baru tersimpan di Cloud Database (bisa dibuka di HP/Laptop)!');
    }

    try {
      await saveSessionToCloud(updatedSession);
    } catch (err) {
      console.warn('Cloud sync notice:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveAsNewSession = async () => {
    const newId = `session-${Date.now()}`;
    const now = new Date().toISOString();
    const cloned: LabSession = {
      ...currentSession,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    setCurrentSession(cloned);
    setSavedSessions([cloned, ...savedSessions]);
    setIsSyncing(true);
    showToast('Tersimpan sebagai sesi baru di Cloud Database!');

    try {
      await saveSessionToCloud(cloned);
    } catch (err) {
      console.warn('Cloud sync notice:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartNewSession = () => {
    const newSession = createNewLabSession(profile);
    setCurrentSession(newSession);
    showToast('Formulir sesi baru siap diisi.');
  };

  const handleRevertChanges = () => {
    if (savedVersion) {
      setCurrentSession(JSON.parse(JSON.stringify(savedVersion)));
      showToast('Perubahan dibatalkan. Kembali ke data tersimpan.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportSessionToCSV(currentSession, profile);
    showToast('File CSV/Excel kartu kontrol berhasil diunduh.');
  };

  const handleDeleteSession = async (sessionId: string) => {
    setSavedSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      try {
        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // If deleted session was currently opened, reset current view to clean new session
    if (currentSession.id === sessionId) {
      setCurrentSession(createNewLabSession(profile));
    }
    showToast('Sesi dihapus dari arsip Cloud Database.');

    try {
      await deleteSessionFromCloud(sessionId);
    } catch (err) {
      console.warn('Cloud delete notice:', err);
    }
  };

  const handleSaveProfile = async (newProfile: SchoolProfile) => {
    setProfile(newProfile);
    setIsSyncing(true);

    // If computer count or prefix changed, update items if desired
    if (
      newProfile.totalComputers !== profile.totalComputers ||
      newProfile.computerPrefix !== profile.computerPrefix
    ) {
      const newItems = Array.from({ length: newProfile.totalComputers }, (_, idx) => {
        const num = idx + 1;
        const padded = num < 10 ? `0${num}` : `${num}`;
        const existing = currentSession.items[idx];
        return {
          id: `${newProfile.computerPrefix}${padded}`,
          no: num,
          name: `${newProfile.computerPrefix}${padded}`,
          isUsed: existing?.isUsed ?? true,
          initialStatus: existing?.initialStatus || 'baik',
          finalStatus: existing?.finalStatus || 'baik',
          initialLabCondition: existing?.initialLabCondition || currentSession.overallInitialLab || 'Bersih & Rapi',
          finalLabCondition: existing?.finalLabCondition || currentSession.overallFinalLab || 'Bersih & Rapi',
          notes: existing?.notes || '',
        };
      });
      setCurrentSession((prev) => ({
        ...prev,
        items: newItems,
        headOfDepartment: newProfile.headOfDepartment,
        headOfDeptTitle: newProfile.headOfDeptTitle,
      }));
    } else {
      setCurrentSession((prev) => ({
        ...prev,
        headOfDepartment: newProfile.headOfDepartment,
        headOfDeptTitle: newProfile.headOfDeptTitle,
      }));
    }

    showToast('Pengaturan sekolah & logo berhasil disimpan ke Cloud Database!');

    try {
      await saveSchoolProfileToCloud(newProfile);
    } catch (err) {
      console.warn('Cloud profile save notice:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetForm = () => {
    const resetItems = currentSession.items.map((item) => ({
      ...item,
      initialStatus: 'baik' as const,
      finalStatus: 'baik' as const,
      notes: '',
    }));
    setCurrentSession((prev) => ({
      ...prev,
      items: resetItems,
      teacherName: '',
      startTime: '07:30',
      endTime: '09:30',
    }));
    showToast('Formulir berhasil di-reset.');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans">
      {/* GLOBAL HEADER BAR (Top Bar Contract: Single-line Wordmark | Nav Tabs | Primary Actions) */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 no-print shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand Zone */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              <School size={18} className="text-amber-400" />
              <span>Kartu Kontrol Lab Komputer</span>
            </span>
            <span className="hidden lg:inline text-xs text-slate-400 border-l border-slate-700 pl-3">
              SMK Patria Dharma Selatpanjang
            </span>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-md text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('sheet')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'sheet'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileSpreadsheet size={14} />
              <span>Lembar Kontrol</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Monitor size={14} />
              <span>Peta & Unit PC</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recap')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'recap'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BarChart3 size={14} />
              <span>Rekap Laporan</span>
            </button>
          </div>

          {/* Utility Actions */}
          <div className="flex items-center gap-2">
            {/* Cloud Database Sync Status Badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300"
              title="Semua data kartu kontrol & logo tersimpan di Cloud Database Firestore, sinkron di HP, laptop, dan komputer lain"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSyncing
                    ? 'bg-amber-400 animate-ping'
                    : isCloudConnected
                    ? 'bg-emerald-400'
                    : 'bg-red-400'
                }`}
              />
              <Cloud size={13} className={isCloudConnected ? 'text-emerald-400' : 'text-slate-400'} />
              <span className="hidden lg:inline text-[10.5px]">
                {isSyncing
                  ? 'Sinkronisasi...'
                  : isCloudConnected
                  ? 'Database Cloud Aktif'
                  : 'Offline'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="px-2.5 py-1.5 text-xs text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Lihat Riwayat Sesi Penggunaan Lab"
            >
              <History size={14} />
              <span className="hidden sm:inline">Riwayat</span>
              {savedSessions.length > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {savedSessions.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="Pengaturan Identitas Sekolah & Lab"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-md shadow-lg border border-slate-700 flex items-center gap-2 animate-fade-in no-print">
          <CheckCircle size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ACTION TOOLBAR STRIP */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 no-print shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Quick Session State Badge & Info Indicator */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-600">
            {isSavedInHistory ? (
              isDirty ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Sesi Arsip (Ada Perubahan)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Sesi Tersimpan di Arsip
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                Sesi Baru (Draft)
              </span>
            )}

            <span className="text-slate-300">·</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Hari:</span>
              <span className="font-semibold text-slate-900">{currentSession.dayAndDate}</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Guru:</span>
              <span className="font-medium text-slate-900">
                {currentSession.teacherName || '(Belum diisi)'}
              </span>
            </div>
          </div>

          {/* Right: Primary Command Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleStartNewSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer"
              title="Mulai formulir sesi baru yang bersih"
            >
              <PlusCircle size={14} />
              <span>Sesi Baru</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer"
              title="Download format Excel/CSV"
            >
              <Download size={14} />
              <span>Excel/CSV</span>
            </button>

            <button
              type="button"
              onClick={handleSaveCurrentSession}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors shadow-2xs cursor-pointer ${
                !isSavedInHistory
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500/50'
                  : isDirty
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title={
                !isSavedInHistory
                  ? 'Simpan sebagai sesi baru ke riwayat'
                  : isDirty
                  ? 'Simpan perubahan ke sesi arsip ini'
                  : 'Sesi ini sudah tersimpan di riwayat'
              }
            >
              <Save size={14} />
              <span>
                {!isSavedInHistory
                  ? 'Simpan ke Riwayat'
                  : isDirty
                  ? 'Perbarui Sesi'
                  : 'Tersimpan'}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs cursor-pointer"
              title="Cetak langsung atau simpan sebagai PDF resmi"
            >
              <Printer size={14} />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Prominent Session Status Banner & Switcher */}
        <SessionStatusBanner
          currentSession={currentSession}
          savedSessions={savedSessions}
          isDirty={isDirty}
          isSavedInHistory={isSavedInHistory}
          onSaveCurrentSession={handleSaveCurrentSession}
          onSaveAsNewSession={handleSaveAsNewSession}
          onStartNewSession={handleStartNewSession}
          onRevertChanges={handleRevertChanges}
          onSelectSession={(s) => {
            setCurrentSession(s);
            showToast(`Memuat sesi: ${s.dayAndDate} (${s.teacherName || 'Guru'})`);
          }}
          onOpenHistoryModal={() => setIsHistoryOpen(true)}
        />

        {activeTab === 'sheet' ? (
          <div className="space-y-6">
            {/* Quick entry helpers for teacher/technician */}
            <QuickEntryToolbar
              session={currentSession}
              onUpdateSession={setCurrentSession}
              onReset={handleResetForm}
            />

            {/* The printable and interactive document card */}
            <PrintableCard
              session={currentSession}
              profile={profile}
              onUpdateSession={setCurrentSession}
            />

            {/* Practical instructions box below */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 no-print flex flex-col sm:flex-row items-start gap-3">
              <HelpCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">
                  Petunjuk Penggunaan Kartu Kontrol Digital:
                </p>
                <p>
                  1. Sesuai aturan lab, <strong>penilaian kondisi hanya dilakukan pada komputer yang dihidupkan</strong>. Anda dapat mengaktifkan/menonaktifkan PC di kolom No Komputer atau tombol di atas.
                </p>
                <p>
                  2. Centang <strong>Baik</strong> atau <strong>Bermasalah</strong> untuk komputer yang dihidupkan. Komputer yang mati akan tetap kosong pada lembar cetak.
                </p>
                <p>
                  3. Jika komputer bermasalah, ketikkan catatan kendala pada kolom <strong>Keterangan</strong> untuk diteruskan ke teknisi lab.
                </p>
                <p>
                  4. Klik tab <strong>Rekap Laporan</strong> untuk melihat laporan harian, mingguan, dan bulanan secara otomatis.
                </p>
              </div>
            </div>
          </div>
        ) : activeTab === 'map' ? (
          /* Visual Computer Grid Map & Issue Monitor */
          <ComputerGridMap session={currentSession} onUpdateSession={setCurrentSession} />
        ) : (
          /* Rekap Laporan Harian, Mingguan, Bulanan */
          <ReportRecapView
            sessions={savedSessions.length > 0 ? savedSessions : [currentSession]}
            profile={profile}
          />
        )}
      </main>

      {/* MODALS */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedSessions={savedSessions}
        activeSessionId={currentSession.id}
        profile={profile}
        onSelectSession={(s) => {
          setCurrentSession(s);
          showToast(`Sesi dimuat: ${s.dayAndDate} (${s.teacherName || 'Guru'})`);
        }}
        onDeleteSession={handleDeleteSession}
        onStartNewSession={handleStartNewSession}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 no-print">
        <p>
          Sistem Kartu Kontrol Laboratorium Komputer — SMK Patria Dharma (Yayasan Sosial Umat Beragama Buddha Selatpanjang)
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Kepala Jurusan DKV: {profile.headOfDepartment} · Selatpanjang, Kepulauan Meranti, Riau
        </p>
      </footer>
    </div>
  );
}
