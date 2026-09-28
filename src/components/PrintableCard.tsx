import React from 'react';
import { ComputerCheck, LabSession, SchoolProfile } from '../types';
import { SmkPatriaDharmaLogo, YayasanBuddhaLogo } from './Logos';
import { Check, AlertTriangle, Sparkles } from 'lucide-react';

interface PrintableCardProps {
  session: LabSession;
  profile: SchoolProfile;
  onUpdateSession: (updated: LabSession) => void;
  isPrintMode?: boolean;
}

export const PrintableCard: React.FC<PrintableCardProps> = ({
  session,
  profile,
  onUpdateSession,
  isPrintMode = false,
}) => {
  const handleToggleIsUsed = (index: number) => {
    const newItems = [...session.items];
    const current = newItems[index];
    const nextIsUsed = !current.isUsed;
    newItems[index] = {
      ...current,
      isUsed: nextIsUsed,
      initialStatus: nextIsUsed ? (current.initialStatus || 'baik') : null,
      finalStatus: nextIsUsed ? (current.finalStatus || 'baik') : null,
      notes: nextIsUsed ? current.notes : '',
    };
    onUpdateSession({ ...session, items: newItems, updatedAt: new Date().toISOString() });
  };

  const handleItemStatusChange = (
    index: number,
    phase: 'initial' | 'final',
    status: 'baik' | 'bermasalah'
  ) => {
    const newItems = [...session.items];
    const current = newItems[index];

    // If currently not used, turn it on
    if (!current.isUsed) {
      newItems[index] = {
        ...current,
        isUsed: true,
        initialStatus: status,
        finalStatus: status,
      };
      onUpdateSession({ ...session, items: newItems, updatedAt: new Date().toISOString() });
      return;
    }

    if (phase === 'initial') {
      newItems[index] = {
        ...current,
        initialStatus: current.initialStatus === status ? null : status,
      };
    } else {
      newItems[index] = {
        ...current,
        finalStatus: current.finalStatus === status ? null : status,
      };
    }
    onUpdateSession({ ...session, items: newItems, updatedAt: new Date().toISOString() });
  };

  const handleNotesChange = (index: number, notes: string) => {
    const newItems = [...session.items];
    newItems[index] = { ...newItems[index], notes };
    onUpdateSession({ ...session, items: newItems, updatedAt: new Date().toISOString() });
  };

  const handleLabConditionChange = (
    index: number,
    field: 'initialLabCondition' | 'finalLabCondition',
    value: string
  ) => {
    const newItems = [...session.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdateSession({ ...session, items: newItems, updatedAt: new Date().toISOString() });
  };

  return (
    <div
      className={`printable-sheet bg-white text-black text-xs font-sans mx-auto transition-all ${
        isPrintMode ? 'p-0 w-full' : 'p-6 sm:p-8 max-w-[960px] shadow-md border border-slate-300 rounded-sm'
      }`}
    >
      {/* KOP SURAT (Letterhead) */}
      <header className="border-b-[2.5px] border-black pb-2 mb-2">
        <div className="flex items-center justify-between gap-3">
          {/* Left: SMK Patria Dharma Logo */}
          <div className="w-20 flex justify-center">
            <SmkPatriaDharmaLogo size={68} customSrc={profile.logoLeft} />
          </div>

          {/* Center: School Official Identity */}
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
              Website:{' '}
              <span className="text-blue-900 underline">{profile.website}</span>
              {' / '}Email:{' '}
              <span className="text-blue-900 underline">{profile.email}</span>
            </p>
          </div>

          {/* Right: Yayasan Logo */}
          <div className="w-20 flex justify-center">
            <YayasanBuddhaLogo size={68} customSrc={profile.logoRight} />
          </div>
        </div>

        {/* Accreditation Bar */}
        <div className="mt-2 border border-black bg-slate-200 text-center py-0.5 px-2 text-[10px] sm:text-[10.5px] font-bold tracking-wider text-black">
          NSS : {profile.nss} &nbsp;|&nbsp; NPSN : {profile.npsn} &nbsp;|&nbsp; IZIN OPERASIONAL {profile.operationalPermit} &nbsp;|&nbsp; AKREDITASI : {profile.accreditation}
        </div>
      </header>

      {/* DOCUMENT TITLE */}
      <div className="text-center my-3">
        <h3 className="text-sm sm:text-base font-bold tracking-widest uppercase border-b-2 border-transparent inline-block pb-0.5 text-black">
          PENGGUNAAN LAB KOMPUTER
        </h3>
      </div>

      {/* METADATA BLOCK (Form Fields) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-3 text-[11px] font-medium">
        <div className="space-y-1">
          <div className="flex items-center">
            <span className="w-28 shrink-0 font-semibold">Hari / Tanggal</span>
            <span className="mr-2 font-bold">:</span>
            <input
              type="text"
              value={session.dayAndDate}
              onChange={(e) => onUpdateSession({ ...session, dayAndDate: e.target.value })}
              className="flex-1 border-b border-black/60 bg-transparent px-1 py-0.5 text-slate-900 focus:outline-hidden focus:border-black focus:bg-amber-50/50"
              placeholder="Contoh: Senin, 28 September 2026"
            />
          </div>
          <div className="flex items-center">
            <span className="w-28 shrink-0 font-semibold">Nama Guru</span>
            <span className="mr-2 font-bold">:</span>
            <input
              type="text"
              value={session.teacherName}
              onChange={(e) => onUpdateSession({ ...session, teacherName: e.target.value })}
              className="flex-1 border-b border-black/60 bg-transparent px-1 py-0.5 font-medium text-slate-900 focus:outline-hidden focus:border-black focus:bg-amber-50/50"
              placeholder="Nama Lengkap Guru Pengampu"
            />
          </div>
          <div className="flex items-center text-[10px] text-slate-700 no-print">
            <span className="w-28 shrink-0 text-slate-600 font-normal">Kelas & Mapel</span>
            <span className="mr-2">:</span>
            <div className="flex gap-1 flex-1">
              <input
                type="text"
                value={session.className || ''}
                onChange={(e) => onUpdateSession({ ...session, className: e.target.value })}
                className="w-1/2 border-b border-dashed border-slate-400 bg-transparent px-1 py-0.5 focus:outline-hidden"
                placeholder="Kelas (e.g. XI DKV 1)"
              />
              <input
                type="text"
                value={session.subject || ''}
                onChange={(e) => onUpdateSession({ ...session, subject: e.target.value })}
                className="w-1/2 border-b border-dashed border-slate-400 bg-transparent px-1 py-0.5 focus:outline-hidden"
                placeholder="Mata Pelajaran"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center">
            <span className="w-24 shrink-0 font-semibold">Jam Mulai</span>
            <span className="mr-2 font-bold">:</span>
            <input
              type="text"
              value={session.startTime}
              onChange={(e) => onUpdateSession({ ...session, startTime: e.target.value })}
              className="w-32 border-b border-black/60 bg-transparent px-1 py-0.5 font-mono text-slate-900 focus:outline-hidden focus:border-black focus:bg-amber-50/50"
              placeholder="07:30"
            />
          </div>
          <div className="flex items-center">
            <span className="w-24 shrink-0 font-semibold">Jam Selesai</span>
            <span className="mr-2 font-bold">:</span>
            <input
              type="text"
              value={session.endTime}
              onChange={(e) => onUpdateSession({ ...session, endTime: e.target.value })}
              className="w-32 border-b border-black/60 bg-transparent px-1 py-0.5 font-mono text-slate-900 focus:outline-hidden focus:border-black focus:bg-amber-50/50"
              placeholder="09:30"
            />
          </div>
          <div className="flex items-center text-[10px] text-slate-700 no-print">
            <span className="w-24 shrink-0 text-slate-600 font-normal">Lab Komputer</span>
            <span className="mr-2">:</span>
            <input
              type="text"
              value={session.labName || ''}
              onChange={(e) => onUpdateSession({ ...session, labName: e.target.value })}
              className="w-48 border-b border-dashed border-slate-400 bg-transparent px-1 py-0.5 focus:outline-hidden"
              placeholder="Nama Ruangan Lab"
            />
          </div>
        </div>
      </div>

      {/* MAIN DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-[1.5px] border-black text-[10.5px]">
          <thead>
            {/* Row 1 Headers */}
            <tr className="border-b-[1.5px] border-black bg-slate-50 text-center font-bold">
              <th
                rowSpan={3}
                className="border-r-[1.5px] border-black px-1.5 py-1 w-8 text-center"
              >
                No
              </th>
              <th
                rowSpan={3}
                className="border-r-[1.5px] border-black px-2 py-1 w-20 text-center"
              >
                No Komputer
              </th>
              <th
                colSpan={4}
                className="border-r-[1.5px] border-black px-2 py-1 text-center font-bold"
              >
                Kondisi Komputer
              </th>
              <th
                colSpan={2}
                className="border-r-[1.5px] border-black px-2 py-1 text-center font-bold"
              >
                Kondisi Lab
              </th>
              <th
                rowSpan={3}
                className="px-3 py-1 text-center font-bold"
              >
                Keterangan
              </th>
            </tr>

            {/* Row 2 Headers */}
            <tr className="border-b-[1.5px] border-black bg-slate-50 text-center font-bold">
              <th
                colSpan={2}
                className="border-r-[1.5px] border-black px-1 py-1"
              >
                Kondisi Awal
              </th>
              <th
                colSpan={2}
                className="border-r-[1.5px] border-black px-1 py-1"
              >
                Kondisi Akhir
              </th>
              <th
                rowSpan={2}
                className="border-r-[1.5px] border-black px-1.5 py-1 w-20 text-center align-middle"
              >
                Kondisi Awal
              </th>
              <th
                rowSpan={2}
                className="border-r-[1.5px] border-black px-1.5 py-1 w-20 text-center align-middle"
              >
                Kondisi Akhir
              </th>
            </tr>

            {/* Row 3 Headers: Baik vs Bermasalah */}
            <tr className="border-b-[1.5px] border-black bg-slate-50 text-center text-[9.5px]">
              <th className="border-r border-black px-1 py-0.5 w-12 font-semibold">
                Baik
              </th>
              <th className="border-r-[1.5px] border-black px-1 py-0.5 w-16 font-semibold">
                Bermasalah
              </th>
              <th className="border-r border-black px-1 py-0.5 w-12 font-semibold">
                Baik
              </th>
              <th className="border-r-[1.5px] border-black px-1 py-0.5 w-16 font-semibold">
                Bermasalah
              </th>
            </tr>
          </thead>

          <tbody>
            {session.items.map((item, idx) => {
              const hasIssue =
                item.isUsed &&
                (item.initialStatus === 'bermasalah' || item.finalStatus === 'bermasalah');
              const isUnused = !item.isUsed;

              return (
                <tr
                  key={item.id || idx}
                  className={`border-b border-black text-center transition-colors ${
                    isUnused
                      ? 'bg-slate-100/50 text-slate-500'
                      : hasIssue
                      ? 'bg-amber-50/70'
                      : idx % 2 === 1
                      ? 'bg-slate-50/50'
                      : 'bg-white'
                  }`}
                >
                  {/* Column 1: No */}
                  <td className="border-r-[1.5px] border-black px-1 py-1 font-mono font-medium text-slate-800">
                    {item.no}
                  </td>

                  {/* Column 2: No Komputer with Used Toggle */}
                  <td className="border-r-[1.5px] border-black px-1 py-1 font-mono font-bold text-slate-950 whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1 px-1">
                      <span>{item.name}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleIsUsed(idx)}
                        className={`no-print text-[9px] px-1 py-0.2 rounded font-sans font-medium transition-colors cursor-pointer ${
                          item.isUsed
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title={item.isUsed ? 'Klik untuk nonaktifkan PC ini (tidak dihidupkan)' : 'Klik untuk mengaktifkan PC ini (dihidupkan)'}
                      >
                        {item.isUsed ? 'Aktif' : 'Mati'}
                      </button>
                    </div>
                  </td>

                  {/* Column 3: Kondisi Awal - Baik */}
                  <td
                    onClick={() => handleItemStatusChange(idx, 'initial', 'baik')}
                    className="border-r border-black px-1 py-1 cursor-pointer select-none hover:bg-emerald-100/60"
                    title={item.isUsed ? "Klik untuk tandai Kondisi Awal: Baik" : "Klik untuk hidupkan & tandai Baik"}
                  >
                    <div className="flex items-center justify-center h-full">
                      {item.isUsed && item.initialStatus === 'baik' ? (
                        <span className="font-bold text-black text-sm leading-none">✔</span>
                      ) : (
                        <span className="w-3.5 h-3.5 border border-black/40 rounded-xs inline-block" />
                      )}
                    </div>
                  </td>

                  {/* Column 4: Kondisi Awal - Bermasalah */}
                  <td
                    onClick={() => handleItemStatusChange(idx, 'initial', 'bermasalah')}
                    className="border-r-[1.5px] border-black px-1 py-1 cursor-pointer select-none hover:bg-red-100/60"
                    title={item.isUsed ? "Klik untuk tandai Kondisi Awal: Bermasalah" : "Klik untuk hidupkan & tandai Bermasalah"}
                  >
                    <div className="flex items-center justify-center h-full">
                      {item.isUsed && item.initialStatus === 'bermasalah' ? (
                        <span className="font-bold text-red-600 text-sm leading-none">✔</span>
                      ) : (
                        <span className="w-3.5 h-3.5 border border-black/40 rounded-xs inline-block" />
                      )}
                    </div>
                  </td>

                  {/* Column 5: Kondisi Akhir - Baik */}
                  <td
                    onClick={() => handleItemStatusChange(idx, 'final', 'baik')}
                    className="border-r border-black px-1 py-1 cursor-pointer select-none hover:bg-emerald-100/60"
                    title={item.isUsed ? "Klik untuk tandai Kondisi Akhir: Baik" : "Klik untuk hidupkan & tandai Baik"}
                  >
                    <div className="flex items-center justify-center h-full">
                      {item.isUsed && item.finalStatus === 'baik' ? (
                        <span className="font-bold text-black text-sm leading-none">✔</span>
                      ) : (
                        <span className="w-3.5 h-3.5 border border-black/40 rounded-xs inline-block" />
                      )}
                    </div>
                  </td>

                  {/* Column 6: Kondisi Akhir - Bermasalah */}
                  <td
                    onClick={() => handleItemStatusChange(idx, 'final', 'bermasalah')}
                    className="border-r-[1.5px] border-black px-1 py-1 cursor-pointer select-none hover:bg-red-100/60"
                    title={item.isUsed ? "Klik untuk tandai Kondisi Akhir: Bermasalah" : "Klik untuk hidupkan & tandai Bermasalah"}
                  >
                    <div className="flex items-center justify-center h-full">
                      {item.isUsed && item.finalStatus === 'bermasalah' ? (
                        <span className="font-bold text-red-600 text-sm leading-none">✔</span>
                      ) : (
                        <span className="w-3.5 h-3.5 border border-black/40 rounded-xs inline-block" />
                      )}
                    </div>
                  </td>

                  {/* Column 7: Kondisi Lab - Awal */}
                  <td className="border-r-[1.5px] border-black px-1 py-0.5">
                    <input
                      type="text"
                      value={item.initialLabCondition ?? session.overallInitialLab ?? ''}
                      onChange={(e) =>
                        handleLabConditionChange(idx, 'initialLabCondition', e.target.value)
                      }
                      className="w-full text-center bg-transparent border-0 focus:outline-hidden focus:bg-amber-100/50 text-[10px]"
                      placeholder="Bersih/Rapi"
                    />
                  </td>

                  {/* Column 8: Kondisi Lab - Akhir */}
                  <td className="border-r-[1.5px] border-black px-1 py-0.5">
                    <input
                      type="text"
                      value={item.finalLabCondition ?? session.overallFinalLab ?? ''}
                      onChange={(e) =>
                        handleLabConditionChange(idx, 'finalLabCondition', e.target.value)
                      }
                      className="w-full text-center bg-transparent border-0 focus:outline-hidden focus:bg-amber-100/50 text-[10px]"
                      placeholder="Bersih/Rapi"
                    />
                  </td>

                  {/* Column 9: Keterangan */}
                  <td className="px-2 py-0.5 text-left">
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleNotesChange(idx, e.target.value)}
                      placeholder={
                        isUnused
                          ? '(Tidak digunakan)'
                          : hasIssue
                          ? 'Tuliskan permasalahan...'
                          : '-'
                      }
                      className={`w-full bg-transparent border-0 px-1 py-0.5 focus:outline-hidden focus:bg-amber-100/60 text-[10.5px] ${
                        hasIssue
                          ? 'font-medium text-red-900 placeholder:text-red-400'
                          : isUnused
                          ? 'text-slate-400 italic'
                          : 'text-slate-800'
                      }`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER NOTES (Keterangan) */}
      <footer className="mt-3 pt-2 text-[10.5px] text-black">
        <div className="font-semibold mb-0.5">Keterangan:</div>
        <ol className="list-decimal list-outside pl-4 space-y-0.5 text-[10px] leading-relaxed text-slate-900">
          <li>
            Centang Kondisi komputer yang dihidupkan atau komputer yang dicoba untuk dihidupkan pada pilihan <span className="font-semibold">"Baik"</span> atau <span className="font-semibold">"Bermasalah"</span>. Jika <span className="font-semibold">"Bermasalah"</span> tuliskan permasalahan pada kolom keterangan.
          </li>
          <li>
            Kondisi Lab diisi dengan nilai <span className="font-semibold">"Bersih", "Rapi"</span>, dll atau <span className="font-semibold">"Kotor", "Berserak"</span> dll.
          </li>
        </ol>

        {/* SIGNATURE BLOCK */}
        <div className="mt-8 grid grid-cols-2 text-xs">
          {/* Left Signature: Kepala Jurusan DKV */}
          <div className="text-left pl-2">
            <p className="leading-tight">Mengetahui,</p>
            <p className="font-semibold leading-tight">{session.headOfDeptTitle || profile.headOfDeptTitle}</p>
            <div className="h-16 flex items-end">
              <p className="font-bold underline text-[12px] tracking-wide">
                {session.headOfDepartment || profile.headOfDepartment}
              </p>
            </div>
          </div>

          {/* Right Signature: Guru Bidang Studi */}
          <div className="text-right pr-6">
            <p className="invisible">.</p>
            <p className="font-semibold leading-tight">Guru Bidang Studi</p>
            <div className="h-16 flex items-end justify-end">
              <p className="font-medium text-[11.5px] tracking-wide border-b border-dotted border-black/80 pb-0.5 min-w-[180px] text-center">
                {session.teacherName ? session.teacherName : '(......................................................)'}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
