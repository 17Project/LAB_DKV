import { LabSession, SchoolProfile } from '../types';

export function exportSessionToCSV(session: LabSession, profile: SchoolProfile): void {
  const rows: string[][] = [];

  // Header information
  rows.push([profile.schoolName]);
  rows.push([profile.foundation]);
  rows.push([`${profile.address} - ${profile.region}`]);
  rows.push([`Website: ${profile.website} | Email: ${profile.email}`]);
  rows.push([`NSS: ${profile.nss} | NPSN: ${profile.npsn} | IZIN: ${profile.operationalPermit} | AKREDITASI: ${profile.accreditation}`]);
  rows.push([]);
  rows.push(['PENGGUNAAN LAB KOMPUTER']);
  rows.push([]);
  rows.push(['Hari / Tanggal:', session.dayAndDate, '', 'Jam Mulai:', session.startTime]);
  rows.push(['Nama Guru:', session.teacherName || '-', '', 'Jam Selesai:', session.endTime]);
  rows.push(['Kelas / Mapel:', `${session.className || '-'} / ${session.subject || '-'}`]);
  rows.push([]);

  // Table headers
  rows.push([
    'No',
    'No Komputer',
    'Kondisi Awal (Baik / Bermasalah)',
    'Kondisi Akhir (Baik / Bermasalah)',
    'Kondisi Lab (Awal)',
    'Kondisi Lab (Akhir)',
    'Keterangan',
  ]);

  // Items
  session.items.forEach((item) => {
    const awalStr = item.initialStatus === 'baik' ? 'Baik' : item.initialStatus === 'bermasalah' ? 'Bermasalah' : 'Tidak Dipakai';
    const akhirStr = item.finalStatus === 'baik' ? 'Baik' : item.finalStatus === 'bermasalah' ? 'Bermasalah' : 'Tidak Dipakai';
    rows.push([
      String(item.no),
      item.name,
      awalStr,
      akhirStr,
      item.initialLabCondition || session.overallInitialLab || 'Bersih',
      item.finalLabCondition || session.overallFinalLab || 'Bersih',
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);
  });

  rows.push([]);
  rows.push(['Catatan:']);
  rows.push(['1. Centang Kondisi komputer yang dihidupkan atau komputer yang dicoba untuk dihidupkan pada pilihan "Baik" atau "Bermasalah". Jika "Bermasalah" tuliskan permasalahan pada kolom keterangan']);
  rows.push(['2. Kondisi Lab diisi dengan nilai "Bersih", "Rapi", dll atau "Kotor", "Berserak" dll.']);
  rows.push([]);
  rows.push(['Mengetahui,', '', '', '', 'Guru Bidang Studi,']);
  rows.push([session.headOfDeptTitle || profile.headOfDeptTitle, '', '', '', '']);
  rows.push([]);
  rows.push([]);
  rows.push([session.headOfDepartment || profile.headOfDepartment, '', '', '', session.teacherName || '(....................................)']);

  const csvContent = '\uFEFF' + rows.map((e) => e.join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedDate = session.rawDate || 'lab-session';
  link.setAttribute('href', url);
  link.setAttribute('download', `Kartu_Kontrol_Lab_${sanitizedDate}_${session.teacherName || 'Guru'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
