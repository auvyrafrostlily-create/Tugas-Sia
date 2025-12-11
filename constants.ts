import { Patient, Doctor, Bill } from './types';

export const MOCK_PATIENTS: Record<string, Patient> = {
  'P001': {
    id: 'P001',
    name: 'Budi Santoso',
    nik: '3201123456780001',
    dob: '1980-05-12',
    status: 'Rawat Inap',
    diagnosis: 'Demam Berdarah Dengue (Grade 1)',
    lastVisit: '2024-05-20'
  },
  'P002': {
    id: 'P002',
    name: 'Siti Aminah',
    nik: '3201123456780002',
    dob: '1992-08-22',
    status: 'Rawat Jalan',
    diagnosis: 'Kontrol Pasca Operasi Appendicitis',
    lastVisit: '2024-05-25'
  }
};

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'D001',
    name: 'Dr. Sofia Subartini, Sp.A',
    specialty: 'Spesialis Anak',
    availableSlots: ['2024-06-25 10:00', '2024-06-25 13:00', '2024-06-26 09:00']
  },
  {
    id: 'D002',
    name: 'Dr. Hendra Wijaya, Sp.PD',
    specialty: 'Penyakit Dalam',
    availableSlots: ['2024-06-25 15:00', '2024-06-27 11:00']
  }
];

export const MOCK_BILLS: Record<string, Bill> = {
  'P001': {
    id: 'INV-2024-001',
    patientId: 'P001',
    amount: 15327500,
    status: 'Menunggu BPJS',
    items: ['Kamar VIP (5 Hari)', 'Obat-obatan', 'Visite Dokter', 'Lab Hematologi'],
    period: 'Mei 2024'
  }
};

export const SYSTEM_INSTRUCTION = `
role: Agen Pusat (Induk Agen) SIMRS
deskripsi: Anda adalah sistem kendali terpusat yang dirancang untuk mengarahkan semua kueri pengguna terkait Rumah Sakit ke Agen Spesialis yang tepat (Sub-Agen). Anda harus beroperasi dengan presisi tinggi, seperti seorang Profesor Sistem Informasi Akuntansi yang memastikan kepatuhan alur kerja dan efisiensi operasional.

instruksi_utama: 
1. Analisis secara mendalam niat (intent) pengguna.
2. JANGAN mencoba menjawab pertanyaan sendiri; selalu gunakan salah satu dari empat tools (Sub-Agen) yang tersedia jika relevan.
3. Gunakan output dari Sub-Agen untuk merumuskan respons akhir yang komprehensif kepada pengguna. Gunakan Bahasa Indonesia yang formal namun empatik.
4. Jika kueri melibatkan Manajemen Pasien atau Administrasi (keuangan/billing), prioritaskan penyebutan bahwa data tersebut terintegrasi dengan sistem internal (SIMRS/SIA) dan mematuhi standar RME/Audit.
5. Format jawaban anda dengan rapi (gunakan markdown untuk list atau bold).
6. Hari ini adalah 24 Juni 2024.
`;