import { ComputerCheck, LabSession, SchoolProfile } from '../types';

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'SEKOLAH MENENGAH KEJURUAN PATRIA DHARMA',
  foundation: '(YAYASAN SOSIAL UMAT BERAGAMA BUDDHA)',
  address: 'Jalan Rumbia No. 8',
  phone: '0822 3335 9090',
  region: 'Selatpanjang - Kabupaten Kepulauan Meranti - Provinsi Riau 28753',
  website: 'http://www.smkspd.sch.id/',
  email: 'info@smkspd.sch.id',
  nss: '34.2.14.10.01.001',
  npsn: '10400957',
  operationalPermit: 'NO.79 / KPTS / KEP / 2002',
  accreditation: '"B"',
  headOfDepartment: 'Ade Indra Sukma, S.Kom.',
  headOfDeptTitle: 'Kepala Jurusan DKV',
  departmentName: 'Desain Komunikasi Visual (DKV)',
  totalComputers: 18,
  computerPrefix: 'DKV-',
};

export const COMMON_ISSUES = [
  'Mouse rusak / tidak respon',
  'Keyboard macet (tombol keras)',
  'Monitor no signal / blank',
  'Kabel LAN / internet terputus',
  'PC mati total / tidak mau hidup',
  'Software Adobe / Corel crash',
  'Audio / headset tidak keluar suara',
  'Layar bergaris / flickering',
  'Sistem lambat / terkena virus',
];

export const LAB_CONDITIONS = ['Bersih', 'Rapi', 'Bersih & Rapi', 'Kotor', 'Berserak', 'Cukup Rapi'];

export function generateDefaultComputers(count = 18, prefix = 'DKV-'): ComputerCheck[] {
  return Array.from({ length: count }, (_, idx) => {
    const num = idx + 1;
    const padded = num < 10 ? `0${num}` : `${num}`;
    return {
      id: `${prefix}${padded}`,
      no: num,
      name: `${prefix}${padded}`,
      isUsed: true,
      initialStatus: 'baik',
      finalStatus: 'baik',
      initialLabCondition: 'Bersih & Rapi',
      finalLabCondition: 'Bersih & Rapi',
      notes: '',
    };
  });
}

export interface LabStats {
  totalUnits: number;
  usedUnits: number;
  unusedUnits: number;
  goodUnits: number;
  troubledUnits: number;
  fitnessPercentage: number;
}

export function calculateLabStats(session: LabSession): LabStats {
  const totalUnits = session.items.length;
  const usedItems = session.items.filter((i) => i.isUsed);
  const usedUnits = usedItems.length;
  const unusedUnits = totalUnits - usedUnits;

  const goodUnits = usedItems.filter((i) => i.finalStatus === 'baik').length;
  const troubledUnits = usedItems.filter(
    (i) => i.initialStatus === 'bermasalah' || i.finalStatus === 'bermasalah'
  ).length;

  const fitnessPercentage =
    usedUnits > 0 ? Math.round((goodUnits / usedUnits) * 100) : 100;

  return {
    totalUnits,
    usedUnits,
    unusedUnits,
    goodUnits,
    troubledUnits,
    fitnessPercentage,
  };
}

export function formatIndonesianDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    const dayName = dayNames[d.getDay()];
    const monthName = monthNames[d.getMonth()];
    return `${dayName}, ${day} ${monthName} ${year}`;
  } catch {
    return dateString;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createNewLabSession(profile: SchoolProfile): LabSession {
  const todayRaw = getTodayDateString();
  return {
    id: `session-${Date.now()}`,
    rawDate: todayRaw,
    dayAndDate: formatIndonesianDate(todayRaw),
    teacherName: '',
    startTime: '07:30',
    endTime: '09:30',
    subject: 'Dasar-Dasar Desain Komunikasi Visual',
    className: 'X DKV 1',
    labName: 'Lab Komputer DKV',
    overallInitialLab: 'Bersih & Rapi',
    overallFinalLab: 'Bersih & Rapi',
    items: generateDefaultComputers(profile.totalComputers, profile.computerPrefix),
    headOfDepartment: profile.headOfDepartment,
    headOfDeptTitle: profile.headOfDeptTitle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateSampleSessions(profile: SchoolProfile): LabSession[] {
  const today = new Date();
  const sampleData: LabSession[] = [];

  const teachers = [
    { name: 'Ade Indra Sukma, S.Kom.', subject: 'Desain Grafis Percetakan', class: 'XI DKV 1' },
    { name: 'Rudi Hartono, S.Kom.', subject: 'Pengolahan Audio & Video', class: 'XII DKV 1' },
    { name: 'Siti Aminah, S.Pd.', subject: 'Dasar Kreatif DKV', class: 'X DKV 2' },
    { name: 'Ade Indra Sukma, S.Kom.', subject: 'Desain Publikasi Digital', class: 'XI DKV 2' },
  ];

  // Past 4 days
  for (let i = 0; i < 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dt = String(d.getDate()).padStart(2, '0');
    const rawDate = `${y}-${m}-${dt}`;
    const t = teachers[i % teachers.length];

    // Some PCs turned off (e.g. 14 or 15 turned on)
    const activeCount = i === 1 ? 12 : i === 2 ? 14 : 16;
    const items = generateDefaultComputers(profile.totalComputers, profile.computerPrefix).map(
      (comp, idx) => {
        const isUsed = idx < activeCount;
        if (!isUsed) {
          return {
            ...comp,
            isUsed: false,
            initialStatus: null,
            finalStatus: null,
            notes: '',
          };
        }

        // Add 1 or 2 realistic issues
        if (idx === 3 && i % 2 === 0) {
          return {
            ...comp,
            isUsed: true,
            initialStatus: 'baik' as const,
            finalStatus: 'bermasalah' as const,
            notes: 'Mouse optik tidak merespon / lampu mati',
          };
        }
        if (idx === 7 && i === 1) {
          return {
            ...comp,
            isUsed: true,
            initialStatus: 'bermasalah' as const,
            finalStatus: 'bermasalah' as const,
            notes: 'Kabel LAN lepas / no internet',
          };
        }

        return {
          ...comp,
          isUsed: true,
          initialStatus: 'baik' as const,
          finalStatus: 'baik' as const,
          notes: '',
        };
      }
    );

    sampleData.push({
      id: `sample-session-${i}-${Date.now()}`,
      rawDate,
      dayAndDate: formatIndonesianDate(rawDate),
      teacherName: t.name,
      startTime: i % 2 === 0 ? '07:30' : '10:00',
      endTime: i % 2 === 0 ? '09:30' : '12:00',
      subject: t.subject,
      className: t.class,
      labName: 'Lab Komputer DKV',
      overallInitialLab: 'Bersih & Rapi',
      overallFinalLab: 'Bersih & Rapi',
      items,
      headOfDepartment: profile.headOfDepartment,
      headOfDeptTitle: profile.headOfDeptTitle,
      createdAt: d.toISOString(),
      updatedAt: d.toISOString(),
    });
  }

  return sampleData;
}
