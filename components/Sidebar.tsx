import React, { useState } from 'react';
import { Activity, Calendar, Users, FileText, Database, ShieldCheck, Cpu, PlusCircle, X, Save, UserPlus, Stethoscope } from 'lucide-react';
import { db } from '../services/simulationDatabase';

interface SidebarProps {
  activeAgent: string | null;
  onSelectAgent: (prompt: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeAgent, onSelectAgent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');

  // Form States
  const [patientForm, setPatientForm] = useState({ name: '', nik: '', diagnosis: '', dob: '' });
  const [doctorForm, setDoctorForm] = useState({ name: '', specialty: '' });

  const getStatus = (agentKey: string) => {
    return activeAgent === agentKey ? 'Processing...' : 'Standby';
  };

  const getStatusColor = (agentKey: string) => {
    return activeAgent === agentKey ? 'text-amber-400 font-bold animate-pulse' : 'text-slate-500';
  };

  const getIndicatorClass = (agentKey: string) => {
    return activeAgent === agentKey ? 'bg-amber-400 animate-ping' : 'bg-green-500';
  };

  const handleSavePatient = () => {
    if (!patientForm.name || !patientForm.nik) {
      alert("Nama dan NIK wajib diisi!");
      return;
    }
    const newP = db.addPatient({
      name: patientForm.name,
      nik: patientForm.nik,
      dob: patientForm.dob || '2000-01-01',
      status: 'Rawat Jalan',
      diagnosis: patientForm.diagnosis || 'Pemeriksaan Umum',
      lastVisit: new Date().toISOString().split('T')[0]
    });
    alert(`Pasien ${newP.name} berhasil disimpan dengan ID: ${newP.id}`);
    setPatientForm({ name: '', nik: '', diagnosis: '', dob: '' });
    setIsModalOpen(false);
    onSelectAgent(`Cek status pasien baru atas nama ${newP.name} (ID: ${newP.id})`);
  };

  const handleSaveDoctor = () => {
    if (!doctorForm.name || !doctorForm.specialty) {
      alert("Nama dan Spesialisasi wajib diisi!");
      return;
    }
    const newD = db.addDoctor({
      name: doctorForm.name,
      specialty: doctorForm.specialty,
      availableSlots: ['09:00', '13:00']
    });
    alert(`Dokter ${newD.name} berhasil ditambahkan.`);
    setDoctorForm({ name: '', specialty: '' });
    setIsModalOpen(false);
    onSelectAgent(`Apakah dokter ${newD.name} tersedia untuk jadwal?`);
  };

  return (
    <div className="w-full md:w-80 bg-slate-900 text-white flex flex-col h-full border-r border-slate-700 font-sans shadow-xl z-50">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex items-center gap-3 bg-slate-900">
        <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-900/50">
          <Activity className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight">SIMRS-AI</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Hospital System v2.5</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        
        {/* Data Input Button */}
        <div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3 px-4 rounded-xl shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 transition-all active:scale-95 font-medium border border-teal-500/50"
          >
            <PlusCircle size={18} />
            Input Data Baru
          </button>
        </div>

        {/* Active Agents Status */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Cpu size={14} /> Sub-Agen Spesialis
          </h2>
          <div className="space-y-2">
            <AgentStatus 
              icon={<Users size={18} />} 
              name="Manajemen Pasien" 
              status={getStatus('manage_patient_data')}
              statusColor={getStatusColor('manage_patient_data')}
              indicatorClass={getIndicatorClass('manage_patient_data')}
              color="text-blue-400"
              onClick={() => onSelectAgent("Tampilkan data lengkap pasien P001 dan status rawat inapnya saat ini.")}
            />
            <AgentStatus 
              icon={<Calendar size={18} />} 
              name="Penjadwalan Medis" 
              status={getStatus('schedule_medical_service')}
              statusColor={getStatusColor('schedule_medical_service')}
              indicatorClass={getIndicatorClass('schedule_medical_service')}
              color="text-purple-400" 
              onClick={() => onSelectAgent("Cari jadwal dokter Spesialis Anak yang tersedia untuk besok pagi.")}
            />
            <AgentStatus 
              icon={<FileText size={18} />} 
              name="Administrasi & SIA" 
              status={getStatus('manage_hospital_admin')}
              statusColor={getStatusColor('manage_hospital_admin')}
              indicatorClass={getIndicatorClass('manage_hospital_admin')}
              color="text-amber-400" 
              onClick={() => onSelectAgent("Saya ingin cek rincian tagihan pasien P001 untuk periode Mei.")}
            />
            <AgentStatus 
              icon={<Database size={18} />} 
              name="Informasi Medis" 
              status={getStatus('provide_medical_info')}
              statusColor={getStatusColor('provide_medical_info')}
              indicatorClass={getIndicatorClass('provide_medical_info')}
              color="text-emerald-400" 
              onClick={() => onSelectAgent("Apa SOP penanganan awal untuk pasien dengan gejala Demam Berdarah?")}
            />
          </div>
        </div>

        {/* System Info */}
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-teal-400" />
            Governance & Compliance
          </h2>
          <ul className="text-xs text-slate-300 space-y-2.5">
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Permenkes No. 82/2013 (SIMRS)
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Permenkes No. 24/2022 (RME)
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              COBIT 5 Audit Framework
            </li>
          </ul>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-900 text-[10px] text-slate-600 text-center uppercase tracking-wider">
        Powered by Gemini 2.5 Flash
      </div>

      {/* Input Data Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Database size={18} className="text-teal-400" />
                Input Data Simulasi
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex border-b border-slate-700">
              <button 
                onClick={() => setActiveTab('patient')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'patient' ? 'text-teal-400 border-b-2 border-teal-400 bg-slate-700/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <UserPlus size={16} /> Pasien
              </button>
              <button 
                onClick={() => setActiveTab('doctor')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'doctor' ? 'text-teal-400 border-b-2 border-teal-400 bg-slate-700/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Stethoscope size={16} /> Dokter
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'patient' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={patientForm.name}
                      onChange={(e) => setPatientForm({...patientForm, name: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      placeholder="Contoh: Budi Santoso"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">NIK (16 Digit)</label>
                    <input 
                      type="text" 
                      value={patientForm.nik}
                      onChange={(e) => setPatientForm({...patientForm, nik: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      placeholder="3201..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Diagnosa Awal</label>
                    <input 
                      type="text" 
                      value={patientForm.diagnosis}
                      onChange={(e) => setPatientForm({...patientForm, diagnosis: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      placeholder="Contoh: Demam"
                    />
                  </div>
                  <button onClick={handleSavePatient} className="w-full bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-lg mt-4 flex items-center justify-center gap-2 font-medium transition-colors">
                    <Save size={16} /> Simpan Data Pasien
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Nama Dokter</label>
                    <input 
                      type="text" 
                      value={doctorForm.name}
                      onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      placeholder="Contoh: Dr. Andi"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Spesialisasi</label>
                    <input 
                      type="text" 
                      value={doctorForm.specialty}
                      onChange={(e) => setDoctorForm({...doctorForm, specialty: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      placeholder="Contoh: Spesialis Jantung"
                    />
                  </div>
                  <button onClick={handleSaveDoctor} className="w-full bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-lg mt-4 flex items-center justify-center gap-2 font-medium transition-colors">
                    <Save size={16} /> Simpan Data Dokter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AgentStatus: React.FC<{ 
  icon: React.ReactNode, 
  name: string, 
  status: string, 
  statusColor: string,
  indicatorClass: string,
  color: string,
  onClick: () => void
}> = ({ icon, name, status, statusColor, indicatorClass, color, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer group border border-transparent hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-left"
  >
    <div className="flex items-center gap-3">
      <div className={`${color} p-1.5 bg-white/5 rounded-md group-hover:bg-white/10 transition-colors`}>{icon}</div>
      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{name}</span>
    </div>
    <div className="flex items-center gap-2">
        <span className={`text-[10px] ${statusColor}`}>{status}</span>
        <span className={`w-2 h-2 rounded-full ${indicatorClass}`}></span>
    </div>
  </button>
);