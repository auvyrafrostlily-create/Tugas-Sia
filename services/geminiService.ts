import { GoogleGenAI, Chat, FunctionDeclaration, Type, Tool } from "@google/genai";
import { db } from "./simulationDatabase";
import { SYSTEM_INSTRUCTION } from "../constants";
import { ManagePatientArgs, ScheduleServiceArgs, HospitalAdminArgs, MedicalInfoArgs } from "../types";

// --- 1. Tool Definitions ---

const managePatientDataTool: FunctionDeclaration = {
  name: 'manage_patient_data',
  description: 'Menangani data pasien. Gunakan action="register" untuk mendaftarkan pasien baru, "check_status" untuk melihat data, "update" untuk ubah status.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, enum: ['register', 'update', 'check_status'], description: 'Tindakan yang dilakukan' },
      patient_id: { type: Type.STRING, description: 'ID Pasien (misal: P001) atau Nama Pasien untuk pencarian' },
      details: { type: Type.STRING, description: 'JSON string berisi: name, nik, dob, diagnosis (wajib untuk register)' }
    },
    required: ['action']
  }
};

const scheduleServiceTool: FunctionDeclaration = {
  name: 'schedule_medical_service',
  description: 'Mengelola jadwal dokter dan alokasi fasilitas (Poli, Ruang Operasi).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      service_type: { type: Type.STRING, enum: ['appointment', 'doctor_check', 'facility_check'] },
      resource_name: { type: Type.STRING, description: 'Nama dokter atau fasilitas' },
      datetime: { type: Type.STRING, description: 'Waktu yang diinginkan (optional)' }
    },
    required: ['service_type', 'resource_name']
  }
};

const manageAdminTool: FunctionDeclaration = {
  name: 'manage_hospital_admin',
  description: 'Mengelola penagihan, status klaim (BPJS/Asuransi), inventaris, dan prosedur administrasi.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      admin_task: { type: Type.STRING, enum: ['billing_inquiry', 'inventory_status', 'check_procedure'] },
      reference_number: { type: Type.STRING, description: 'Nomor referensi atau konteks waktu (misal: bulan lalu)' }
    },
    required: ['admin_task']
  }
};

const medicalInfoTool: FunctionDeclaration = {
  name: 'provide_medical_info',
  description: 'Memberikan informasi kesehatan umum berdasarkan knowledge base SOP/Guideline klinis.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING, description: 'Topik medis' },
      context: { type: Type.STRING, description: 'Konteks tambahan' }
    },
    required: ['topic']
  }
};

const tools: Tool[] = [{
  functionDeclarations: [managePatientDataTool, scheduleServiceTool, manageAdminTool, medicalInfoTool]
}];

// --- 2. Local Execution Logic (The "Backend") ---

async function executeTool(name: string, args: any): Promise<any> {
  console.log(`[SIMRS Backend] Executing ${name} with`, args);
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate realistic network/processing latency

  try {
    switch (name) {
      case 'manage_patient_data': {
        const { action, patient_id, details } = args as ManagePatientArgs;
        
        if (action === 'check_status') {
          const pid = patient_id || 'P001';
          const patient = db.getPatient(pid);
          if (patient) return { status: 'success', data: patient };
          return { status: 'error', message: `Pasien dengan ID/Nama "${pid}" tidak ditemukan dalam database RME.` };
        }

        if (action === 'register') {
          let patientData: any = {};
          try {
             // Handle if details is passed as string (model behavior) or object
             patientData = typeof details === 'string' ? JSON.parse(details) : details;
          } catch (e) {
             patientData = details || {};
          }

          // Fallback if patientData is null
          if (!patientData) patientData = {};

          const newPatient = db.addPatient({
            name: patientData.name || patient_id || 'Tanpa Nama',
            nik: patientData.nik || 'BELUM_ADA',
            dob: patientData.dob || new Date().toISOString().split('T')[0],
            status: 'Rawat Jalan',
            diagnosis: patientData.diagnosis || 'Pemeriksaan Umum',
            lastVisit: new Date().toISOString().split('T')[0]
          });

          return { 
            status: 'success', 
            message: `Registrasi Berhasil. Pasien terdaftar dengan ID: ${newPatient.id}`,
            data: newPatient 
          };
        }

        if (action === 'update') {
             const updated = db.updatePatientStatus(patient_id || '', 'Rawat Inap');
             if (updated) return { status: 'success', message: `Status pasien ${patient_id} berhasil diperbarui menjadi Rawat Inap.`};
             return { status: 'error', message: `Pasien ${patient_id} tidak ditemukan.` };
        }

        return { status: 'info', message: `Tindakan ${action} berhasil dicatat di log audit sistem.` };
      }

      case 'schedule_medical_service': {
        const { service_type, resource_name } = args as ScheduleServiceArgs;
        if (service_type === 'doctor_check') {
          const doctors = db.getDoctors(resource_name);
          
          if (doctors.length > 0) return { status: 'success', data: doctors };
          
          const allDoctors = db.getDoctors().map(d => d.name).join(', ');
          return { status: 'not_found', message: `Tidak ditemukan dokter dengan kriteria: ${resource_name}. Dokter tersedia: ${allDoctors}.` };
        }
        return { status: 'success', message: `Permintaan penjadwalan untuk ${resource_name} diterima. Kode Booking: B-${Date.now().toString().slice(-4)}` };
      }

      case 'manage_hospital_admin': {
        const { admin_task } = args as HospitalAdminArgs;
        if (admin_task === 'billing_inquiry') {
          // Default to P001 if no specific context provided, or try to infer from conversation context stored in args if available
          const bill = db.getBill('P001'); 
          if (bill) return { status: 'success', data: bill, note: 'Data diambil realtime dari modul SIA.' };
          return { status: 'info', message: 'Belum ada tagihan berjalan untuk pasien ini.' };
        }
        return { status: 'success', message: 'Prosedur administrasi telah divalidasi oleh sistem internal.' };
      }

      case 'provide_medical_info': {
        const { topic } = args as MedicalInfoArgs;
        return { 
          status: 'success', 
          content: `REFERENSI SOP-2024: Penanganan "${topic || 'Umum'}" memerlukan triase awal. Pastikan tanda vital stabil.` 
        };
      }

      default:
        return { error: 'Unknown tool' };
    }
  } catch (err) {
    console.error("Tool execution error:", err);
    return { status: 'error', message: 'Terjadi kesalahan internal pada subsistem rumah sakit.' };
  }
}

// --- 3. Chat Session Manager ---

export class ChatManager {
  private chat: Chat;
  
  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) console.warn("API Key is missing!");
    
    const ai = new GoogleGenAI({ apiKey: apiKey || '' });
    this.chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools,
        temperature: 0.1, 
      },
    });
  }

  async sendMessage(message: string, onToolCall?: (toolName: string, args: any) => void): Promise<string> {
    try {
      // First turn: User message
      let response = await this.chat.sendMessage({ message });
      
      // Handle Multi-turn Tool Use
      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionCalls = response.functionCalls;
        const parts: any[] = [];

        for (const call of functionCalls) {
          if (onToolCall) onToolCall(call.name, call.args);
          
          const result = await executeTool(call.name, call.args);
          
          parts.push({
            functionResponse: {
              name: call.name,
              response: { result: result },
              id: call.id
            }
          });
        }
        
        // Critical Fix: Pass the parts array directly to sendMessage in the message property.
        response = await this.chat.sendMessage({ message: parts });
      }

      return response.text || "Sistem telah memproses permintaan.";
    } catch (error: any) {
      console.error("Chat Error Detailed:", error);
      throw error;
    }
  }
}