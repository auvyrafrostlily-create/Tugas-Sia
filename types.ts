export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  isToolInput?: boolean;
  toolCallId?: string;
  toolName?: string;
  toolResult?: any;
  timestamp: Date;
}

export interface Patient {
  id: string;
  name: string;
  nik: string;
  dob: string;
  status: 'Rawat Inap' | 'Rawat Jalan';
  diagnosis: string;
  lastVisit: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availableSlots: string[];
}

export interface Bill {
  id: string;
  patientId: string;
  amount: number;
  status: 'Lunas' | 'Belum Lunas' | 'Menunggu BPJS';
  items: string[];
  period: string;
}

// Tool Arguments Types
export interface ManagePatientArgs {
  action: 'register' | 'update' | 'check_status';
  patient_id?: string;
  details?: any;
}

export interface ScheduleServiceArgs {
  service_type: 'appointment' | 'doctor_check' | 'facility_check';
  resource_name: string;
  datetime?: string;
}

export interface HospitalAdminArgs {
  admin_task: 'billing_inquiry' | 'inventory_status' | 'check_procedure';
  reference_number?: string;
}

export interface MedicalInfoArgs {
  topic: string;
  context?: string;
}