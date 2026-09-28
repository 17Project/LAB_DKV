import React, { useState, useMemo } from 'react';
import { LabSession, SchoolProfile } from '../types';
import { calculateLabStats, formatIndonesianDate, getTodayDateString } from '../utils/defaultData';
import { SmkPatriaDharmaLogo, YayasanBuddhaLogo } from './Logos';
import {
  Calendar,
  CalendarRange,
  CalendarDays,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Monitor,
  Wrench,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface ReportRecapViewProps {
  sessions: LabSession[];
  profile: SchoolProfile;
}

type RecapPeriodType = 'harian' | 'mingguan' | 'bulanan';

export const ReportRecapView: React.FC<ReportRecapViewProps> = ({ sessions, profile }) => {
  const [periodType, setPeriodType] = useState<RecapPeriodType>('bulanan');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${mm}`;
  });

  // Calculate week start and end (Monday to Saturday) based on selectedDate
  const weekRange = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);

    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    const formatYMD = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const dt = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${dt}`;
    };

    return {
      startStr: formatYMD(monday),
      endStr: formatYMD(saturday),
      label: `${formatIndonesianDate(formatYMD(monday))} s/d ${formatIndonesianDate(
        formatYMD(saturday)
      )}`,
    };
  }, [selectedDate]);

  // Filter sessions according to period
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const sessionDate = s.rawDate || s.createdAt.slice(0, 10);
      if (periodType === 'harian') {
        return sessionDate === selectedDate;
      }
      if (periodType === 'mingguan') {
        return sessionDate >= weekRange.startStr && sessionDate <= weekRange.endStr;
      }
      if (periodType === 'bulanan') {
        return sessionDate.startsWith(selectedMonth);
      }
      return true;
    });
  }, [sessions, periodType, selectedDate, selectedMonth, weekRange]);

  // Aggregated Stats
  const recapMetrics = useMemo(() => {
    let totalSessions = filteredSessions.length;
    let totalUsedPCs = 0;
    let totalGoodPCs = 0;
    let totalTroubledPCs = 0;
    let totalIdlePCs = 0;
    const issueMap: Record<string, { pcName: string; issues: string[]; count: number }> = {};

    filteredSessions.forEach((s) => {
      const stats = calculateLabStats(s);
      totalUsedPCs += stats.usedUnits;
      totalGoodPCs += stats.goodUnits;
      totalTroubledPCs += stats.troubledUnits;
      totalIdlePCs += stats.unusedUnits;

      s.items.forEach((item) => {
        if (
          item.isUsed &&
          (item.initialStatus === 'bermasalah' || item.finalStatus === 'bermasalah')
        ) {
          if (!issueMap[item.name]) {
            issueMap[item.name] = { pcName: item.name, issues: [], count: 0 };
          }
          issueMap[item.name].count += 1;
          if (item.notes && !issueMap[item.name].issues.includes(item.notes)) {
            issueMap[item.name].issues.push(item.notes);
          }
        }
      });
    });

    const overallFitness =
      totalUsedPCs > 0 ? Math.round((totalGoodPCs / totalUsedPCs) * 100) : 100;

    const rankedTroubledPCs = Object.values(issueMap).sort((a, b) => b.count - a.count);

    return {
      totalSessions,
      totalUsedPCs,
      totalGoodPCs,
      totalTroubledPCs,
      totalIdlePCs,
      overallFitness,
      rankedTroubledPCs,
    };
  }, [filteredSessions]);

  const handlePrintRecap = () => {
    window.print();
  };

  const handleExportRecapCSV = () => {
    const rows: string[][] = [];
    rows.push([profile.schoolName]);
    rows.push([profile.foundation]);
    rows.push([`REKAP LAPORAN PENGGUNAAN LAB KOMPUTER - ${periodType.toUpperCase()}`]);
    rows.push([
      `Periode: ${
        periodType === 'harian'
          ? formatIndonesianDate(selectedDate)
          : periodType === 'mingguan'
          ? weekRange.label
          : selectedMonth
      }`,
    ]);
    rows.push([]);
    rows.push([
      'No',
      'Tanggal',
      'Waktu',
      'Guru Pengampu',
      'Kelas',
      'Mata Pelajaran',
      'PC Dihidupkan',
      'PC Baik',
      'PC Bermasalah',
      'Kelaikan (%)',
      'Kondisi Lab Awal',
      'Kondisi Lab Akhir',
      'Catatan Kendala Teknis',
    ]);

    filteredSessions.forEach((s, idx) => {
      const stats = calculateLabStats(s);
      const issues = s.items
        .filter(
          (i) =>
            i.isUsed &&
            (i.initialStatus === 'bermasalah' || i.finalStatus === 'bermasalah')
        )
        .map((i) => `${i.name}: ${i.notes || 'Rusak'}`)
        .join('; ');

      rows.push([
        String(idx + 1),
        s.dayAndDate,
        `${s.startTime} - ${s.endTime}`,
        s.teacherName || '-',
        s.className || '-',
        s.subject || '-',
        String(stats.usedUnits),
        String(stats.goodUnits),
        String(stats.troubledUnits),
        `${stats.fitnessPercentage}%`,
        s.overallInitialLab || '-',
        s.overallFinalLab || '-',
        `"${issues.replace(/"/g, '""')}"`,
      ]);
    });

    rows.push([]);
    rows.push(['RINGKASAN TOTAL:']);
    rows.push(['Total Sesi Penggunaan:', String(recapMetrics.totalSessions)]);
    rows.push(['Total PC Dihidupkan:', String(recapMetrics.totalUsedPCs)]);
    rows.push(['Total PC Kondisi Baik:', String(recapMetrics.totalGoodPCs)]);
    rows.push(['Total PC Bermasalah:', String(recapMetrics.totalTroubledPCs)]);
    rows.push(['Rata-rata Kelaikan PC:', `${recapMetrics.overallFitness}%`]);

    const csvContent = '\uFEFF' + rows.map((e) => e.join(';')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Rekap_Lab_${periodType}_${selectedDate || selectedMonth}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Control Navigation Header (no-print) */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs no-print space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Segmented Control for Period Selection */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setPeriodType('harian')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                periodType === 'harian'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar size={14} />
              <span>Rekap Harian</span>
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('mingguan')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                periodType === 'mingguan'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange size={14} />
              <span>Rekap Mingguan</span>
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('bulanan')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                periodType === 'bulanan'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays size={14} />
              <span>Rekap Bulanan</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportRecapCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Export Excel / CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrintRecap}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <Printer size={14} />
              <span>Cetak Laporan Rekap</span>
            </button>
          </div>
        </div>

        {/* Date Filter Selection Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-slate-100">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Filter size={13} className="text-slate-500" />
            Filter Periode:
          </span>

          {periodType === 'harian' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white font-mono"
              />
              <span className="text-slate-600 font-medium">
                ({formatIndonesianDate(selectedDate)})
              </span>
            </div>
          )}

          {periodType === 'mingguan' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white font-mono"
              />
              <span className="text-slate-600 font-medium">
                Pekan: <strong>{weekRange.label}</strong>
              </span>
            </div>
          )}

          {periodType === 'bulanan' && (
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white font-mono"
              />
              <span className="text-slate-600 font-medium">
                Bulan: <strong>{selectedMonth}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* RECAP SHEET (Both for screen review and printing) */}
      <div className="printable-sheet bg-white text-black p-6 sm:p-8 max-w-[960px] mx-auto border border-slate-300 shadow-md rounded-sm">
        {/* Official Letterhead (KOP SURAT) */}
        <header className="border-b-[2.5px] border-black pb-2 mb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="w-20 flex justify-center">
              <SmkPatriaDharmaLogo size={65} customSrc={profile.logoLeft} />
            </div>
            <div className="flex-1 text-center px-1">
              <h1 className="text-base sm:text-[17px] font-bold tracking-tight uppercase leading-tight font-serif text-slate-950">
                {profile.schoolName}
              </h1>
              <h2 className="text-xs sm:text-[13px] font-bold tracking-normal leading-tight font-serif text-slate-900 mt-0.5">
                {profile.foundation}
              </h2>
              <p className="text-[11px] leading-tight text-slate-950 mt-1">
                {profile.address} Telp. {profile.phone}
              </p>
              <p className="text-[11px] leading-tight text-slate-950">
                {profile.region}
              </p>
              <p className="text-[10px] leading-tight text-slate-900 mt-0.5">
                Website: <span className="text-blue-900 underline">{profile.website}</span> | Email:{' '}
                <span className="text-blue-900 underline">{profile.email}</span>
              </p>
            </div>
            <div className="w-20 flex justify-center">
              <YayasanBuddhaLogo size={65} customSrc={profile.logoRight} />
            </div>
          </div>
          <div className="mt-2 border border-black bg-slate-200 text-center py-0.5 px-2 text-[10px] sm:text-[10.5px] font-bold tracking-wider text-black">
            NSS : {profile.nss} &nbsp;|&nbsp; NPSN : {profile.npsn} &nbsp;|&nbsp; IZIN OPERASIONAL {profile.operationalPermit} &nbsp;|&nbsp; AKREDITASI : {profile.accreditation}
          </div>
        </header>

        {/* Title */}
        <div className="text-center my-3">
          <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-black">
            REKAPITULASI LAPORAN PENGGUNAAN & KONDISI LAB KOMPUTER
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Periode: <strong className="uppercase">{periodType}</strong> —{' '}
            {periodType === 'harian'
              ? formatIndonesianDate(selectedDate)
              : periodType === 'mingguan'
              ? weekRange.label
              : `Bulan ${selectedMonth}`}
          </p>
        </div>

        {/* KPI / Summary Matrix Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-center">
          <div className="border border-black p-2 bg-slate-50">
            <span className="block text-[10px] text-slate-600 font-semibold uppercase">
              Total Sesi Kelas
            </span>
            <span className="text-base font-bold font-mono text-black">
              {recapMetrics.totalSessions}
            </span>
            <span className="text-[10px] text-slate-500 block">Jam Pembelajaran</span>
          </div>

          <div className="border border-black p-2 bg-slate-50">
            <span className="block text-[10px] text-slate-600 font-semibold uppercase">
              PC Dihidupkan
            </span>
            <span className="text-base font-bold font-mono text-black">
              {recapMetrics.totalUsedPCs}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Unit ({recapMetrics.totalIdlePCs} Unit Mati)
            </span>
          </div>

          <div className="border border-black p-2 bg-slate-50">
            <span className="block text-[10px] text-slate-600 font-semibold uppercase">
              Kelaikan PC Digunakan
            </span>
            <span className="text-base font-bold font-mono text-emerald-800">
              {recapMetrics.overallFitness}%
            </span>
            <span className="text-[10px] text-slate-500 block">
              {recapMetrics.totalGoodPCs} Unit Baik
            </span>
          </div>

          <div className="border border-black p-2 bg-slate-50">
            <span className="block text-[10px] text-slate-600 font-semibold uppercase">
              Laporan Kendala
            </span>
            <span className="text-base font-bold font-mono text-red-600">
              {recapMetrics.totalTroubledPCs}
            </span>
            <span className="text-[10px] text-slate-500 block">Perlu Perbaikan</span>
          </div>
        </div>

        {/* Note on condition calculation rule */}
        <div className="text-[10px] text-slate-600 italic mb-2">
          * Catatan: Sesuai petunjuk teknis laboratorium, penilaian kondisi dan kelaikan komputer hanya dihitung dari komputer yang dihidupkan/digunakan selama kegiatan praktikum.
        </div>

        {/* Detailed Session Logs Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="border-b border-black bg-slate-200 text-center font-bold">
                <th className="border-r border-black p-1 w-6">No</th>
                <th className="border-r border-black p-1 w-24">Tanggal & Jam</th>
                <th className="border-r border-black p-1 w-28">Guru Pengampu</th>
                <th className="border-r border-black p-1 w-20">Kelas</th>
                <th className="border-r border-black p-1 w-28">Mata Pelajaran</th>
                <th className="border-r border-black p-1 w-14">PC Aktif</th>
                <th className="border-r border-black p-1 w-12">Baik</th>
                <th className="border-r border-black p-1 w-14">Rusak</th>
                <th className="border-r border-black p-1 w-16">Kondisi Lab</th>
                <th className="p-1">Rincian Kerusakan Teknis</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-slate-500 italic">
                    Tidak ada data sesi penggunaan lab pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((sess, idx) => {
                  const sStats = calculateLabStats(sess);
                  const issueItems = sess.items.filter(
                    (i) =>
                      i.isUsed &&
                      (i.initialStatus === 'bermasalah' || i.finalStatus === 'bermasalah')
                  );

                  return (
                    <tr
                      key={sess.id || idx}
                      className={`border-b border-black text-center ${
                        idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                      }`}
                    >
                      <td className="border-r border-black p-1 font-mono">{idx + 1}</td>
                      <td className="border-r border-black p-1 text-left whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{sess.dayAndDate.split(',')[0]}</div>
                        <div className="font-mono text-[9px] text-slate-500">
                          {sess.startTime} - {sess.endTime}
                        </div>
                      </td>
                      <td className="border-r border-black p-1 text-left font-medium">
                        {sess.teacherName || '-'}
                      </td>
                      <td className="border-r border-black p-1">{sess.className || '-'}</td>
                      <td className="border-r border-black p-1 text-left truncate max-w-[120px]">
                        {sess.subject || '-'}
                      </td>
                      <td className="border-r border-black p-1 font-mono font-bold">
                        {sStats.usedUnits}
                      </td>
                      <td className="border-r border-black p-1 font-mono text-emerald-800">
                        {sStats.goodUnits}
                      </td>
                      <td className="border-r border-black p-1 font-mono text-red-600 font-bold">
                        {sStats.troubledUnits}
                      </td>
                      <td className="border-r border-black p-1 text-[9.5px]">
                        {sess.overallFinalLab || sess.overallInitialLab || 'Rapi'}
                      </td>
                      <td className="p-1 text-left text-[9.5px]">
                        {issueItems.length > 0 ? (
                          <div className="space-y-0.5">
                            {issueItems.map((iss) => (
                              <div key={iss.id} className="text-red-900">
                                <strong className="font-mono">{iss.name}:</strong>{' '}
                                {iss.notes || 'Bermasalah'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Semua unit normal</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Frequency of Recurring PC Damage (Trouble Tracker for Lab Technician) */}
        {recapMetrics.rankedTroubledPCs.length > 0 && (
          <div className="mt-4 border border-black p-3 bg-amber-50/40">
            <h3 className="font-bold text-xs text-amber-950 mb-1 flex items-center gap-1.5">
              <Wrench size={13} className="text-amber-700" />
              Daftar Unit PC Paling Sering Bermasalah Pada Periode Ini:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
              {recapMetrics.rankedTroubledPCs.map((pc) => (
                <div
                  key={pc.pcName}
                  className="bg-white p-1.5 border border-amber-300 rounded flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900">{pc.pcName}</span>
                    <span className="text-slate-400 mx-1">·</span>
                    <span className="text-red-700 font-medium">{pc.count}x dilaporkan</span>
                    <div className="text-[9.5px] text-slate-600 mt-0.5 truncate max-w-[280px]">
                      Kendala: {pc.issues.join(', ') || '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature Section */}
        <footer className="mt-8 pt-4 grid grid-cols-2 text-xs">
          <div className="text-left pl-2">
            <p className="leading-tight">Mengetahui,</p>
            <p className="font-semibold leading-tight">{profile.headOfDeptTitle}</p>
            <div className="h-16 flex items-end">
              <p className="font-bold underline text-[12px] tracking-wide">
                {profile.headOfDepartment}
              </p>
            </div>
          </div>

          <div className="text-right pr-6">
            <p className="leading-tight">Selatpanjang, {formatIndonesianDate(getTodayDateString())}</p>
            <p className="font-semibold leading-tight">Pengelola / Teknisi Lab Komputer</p>
            <div className="h-16 flex items-end justify-end">
              <p className="font-medium text-[11.5px] tracking-wide border-b border-dotted border-black/80 pb-0.5 min-w-[180px] text-center">
                (......................................................)
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
