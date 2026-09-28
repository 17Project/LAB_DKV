import React, { useState, useRef } from 'react';
import { SchoolProfile } from '../types';
import { Settings, Save, RotateCcw, X, Upload, Trash2, Image } from 'lucide-react';
import { DEFAULT_SCHOOL_PROFILE } from '../utils/defaultData';
import { SmkPatriaDharmaLogo, YayasanBuddhaLogo } from './Logos';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  onSaveProfile: (newProfile: SchoolProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputLeftRef = useRef<HTMLInputElement>(null);
  const fileInputRightRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, position: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image file
      if (!file.type.startsWith('image/')) {
        setUploadError('Mohon pilih file gambar yang valid (PNG, JPG, JPEG, WEBP, atau SVG).');
        return;
      }
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (position === 'left') {
          setFormData((prev) => ({ ...prev, logoLeft: result }));
        } else {
          setFormData((prev) => ({ ...prev, logoRight: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = (position: 'left' | 'right') => {
    if (position === 'left') {
      setFormData((prev) => ({ ...prev, logoLeft: undefined }));
      if (fileInputLeftRef.current) fileInputLeftRef.current.value = '';
    } else {
      setFormData((prev) => ({ ...prev, logoRight: undefined }));
      if (fileInputRightRef.current) fileInputRightRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_SCHOOL_PROFILE });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">
              Pengaturan Identitas Sekolah & Laboratorium
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Section: Upload Logo Kop Surat */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Image size={15} className="text-slate-700" />
                Upload Foto / Logo Kop Surat
              </h3>
              <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ☁️ Sinkron Cloud Antar-Perangkat
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              Logo dan identitas yang diatur di sini tersimpan langsung di Database Cloud Firestore, sehingga otomatis dapat diakses dari laptop, HP, ataupun komputer lain.
            </p>

            {uploadError && (
              <div className="bg-red-50 text-red-700 p-2 rounded border border-red-200 text-xs">
                {uploadError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Logo Kiri (SMK) */}
              <div className="border border-slate-200 bg-white p-3 rounded-md flex flex-col items-center text-center">
                <span className="font-semibold text-slate-800 mb-2">Logo Kiri (SMK)</span>
                <div className="h-20 w-20 flex items-center justify-center border border-dashed border-slate-300 rounded p-1 mb-2 bg-slate-50">
                  <SmkPatriaDharmaLogo size={60} customSrc={formData.logoLeft} />
                </div>
                <input
                  type="file"
                  ref={fileInputLeftRef}
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'left')}
                  className="hidden"
                  id="logo-left-upload"
                />
                <div className="flex items-center gap-2 mt-auto">
                  <label
                    htmlFor="logo-left-upload"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 cursor-pointer transition-colors"
                  >
                    <Upload size={12} />
                    {formData.logoLeft ? 'Ganti Foto' : 'Upload Foto'}
                  </label>
                  {formData.logoLeft && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo('left')}
                      className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Kembalikan ke logo default"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Logo Kanan (Yayasan) */}
              <div className="border border-slate-200 bg-white p-3 rounded-md flex flex-col items-center text-center">
                <span className="font-semibold text-slate-800 mb-2">Logo Kanan (Yayasan)</span>
                <div className="h-20 w-20 flex items-center justify-center border border-dashed border-slate-300 rounded p-1 mb-2 bg-slate-50">
                  <YayasanBuddhaLogo size={60} customSrc={formData.logoRight} />
                </div>
                <input
                  type="file"
                  ref={fileInputRightRef}
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'right')}
                  className="hidden"
                  id="logo-right-upload"
                />
                <div className="flex items-center gap-2 mt-auto">
                  <label
                    htmlFor="logo-right-upload"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 cursor-pointer transition-colors"
                  >
                    <Upload size={12} />
                    {formData.logoRight ? 'Ganti Foto' : 'Upload Foto'}
                  </label>
                  {formData.logoRight && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo('right')}
                      className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Kembalikan ke logo default"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Sekolah & Yayasan */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-1">
              Identitas Sekolah
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Nama Sekolah</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Nama Yayasan</label>
                <input
                  type="text"
                  value={formData.foundation}
                  onChange={(e) => setFormData({ ...formData, foundation: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Alamat</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">No. Telepon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Kota / Daerah & Kode Pos</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Email</label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section: Legalitas & Akreditasi */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-1">
              Nomor Statistik & Akreditasi
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">NSS</label>
                <input
                  type="text"
                  value={formData.nss}
                  onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:border-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">NPSN</label>
                <input
                  type="text"
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:border-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Izin Operasional</label>
                <input
                  type="text"
                  value={formData.operationalPermit}
                  onChange={(e) => setFormData({ ...formData, operationalPermit: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Akreditasi</label>
                <input
                  type="text"
                  value={formData.accreditation}
                  onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 focus:outline-hidden focus:border-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section: Penandatangan & Jurusan */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-1">
              Penandatangan & Konfigurasi Komputer
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Nama Kepala Jurusan</label>
                <input
                  type="text"
                  value={formData.headOfDepartment}
                  onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Jabatan / Judul Tanda Tangan</label>
                <input
                  type="text"
                  value={formData.headOfDeptTitle}
                  onChange={(e) => setFormData({ ...formData, headOfDeptTitle: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Prefix Nama Komputer</label>
                <input
                  type="text"
                  value={formData.computerPrefix}
                  onChange={(e) => setFormData({ ...formData, computerPrefix: e.target.value })}
                  placeholder="DKV-"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Jumlah Unit PC (Standar: 18)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.totalComputers}
                  onChange={(e) =>
                    setFormData({ ...formData, totalComputers: parseInt(e.target.value) || 18 })
                  }
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <RotateCcw size={13} />
              Kembalikan Standar
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 cursor-pointer font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 cursor-pointer font-medium"
              >
                <Save size={14} />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
