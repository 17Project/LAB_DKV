export type ComputerStatus = 'baik' | 'bermasalah' | 'tidak_dipakai' | null;

export interface ComputerCheck {
  id: string;
  no: number;
  name: string; // e.g. "DKV-01"
  isUsed: boolean; // Apakah PC dihidupkan/digunakan pada sesi ini
  initialStatus: ComputerStatus;
  finalStatus: ComputerStatus;
  initialLabCondition?: string; // e.g. "Bersih", "Rapi"
  finalLabCondition?: string; // e.g. "Bersih", "Rapi"
  notes: string; // Keterangan permasalahan
}

export interface LabSession {
  id: string;
  dayAndDate: string; // e.g. "Senin, 28 September 2026"
  rawDate: string; // "2026-09-28"
  teacherName: string;
  startTime: string; // "07:30"
  endTime: string; // "09:30"
  subject?: string; // Mata Pelajaran
  className?: string; // Kelas
  labName?: string; // "Lab Komputer DKV"
  overallInitialLab: string; // "Bersih & Rapi"
  overallFinalLab: string; // "Bersih & Rapi"
  items: ComputerCheck[];
  headOfDepartment: string; // "Ade Indra Sukma, S.Kom."
  headOfDeptTitle: string; // "Kepala Jurusan DKV"
  createdAt: string;
  updatedAt: string;
}

export interface SchoolProfile {
  schoolName: string;
  foundation: string;
  address: string;
  phone: string;
  region: string;
  website: string;
  email: string;
  nss: string;
  npsn: string;
  operationalPermit: string;
  accreditation: string;
  headOfDepartment: string;
  headOfDeptTitle: string;
  departmentName: string;
  totalComputers: number;
  computerPrefix: string;
  logoLeft?: string; // Data URL / Base64 image for left logo (SMK)
  logoRight?: string; // Data URL / Base64 image for right logo (Yayasan)
}
