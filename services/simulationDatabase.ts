import { Patient, Doctor, Bill } from '../types';
import { MOCK_PATIENTS, MOCK_DOCTORS, MOCK_BILLS } from '../constants';

class SimulationDatabase {
  private patients: Record<string, Patient>;
  private doctors: Doctor[];
  private bills: Record<string, Bill>;

  constructor() {
    // Load initial mock data
    this.patients = { ...MOCK_PATIENTS };
    this.doctors = [...MOCK_DOCTORS];
    this.bills = { ...MOCK_BILLS };
  }

  // --- Patient Operations ---
  getPatient(id: string): Patient | undefined {
    // Case insensitive search logic for ID or Name
    if (this.patients[id]) return this.patients[id];
    
    // Search by name if ID not found
    const foundId = Object.keys(this.patients).find(key => 
      this.patients[key].name.toLowerCase().includes(id.toLowerCase())
    );
    return foundId ? this.patients[foundId] : undefined;
  }

  addPatient(patient: Omit<Patient, 'id'>): Patient {
    // Robust ID generation
    const count = Object.keys(this.patients).length;
    const nextIdNum = count + 1;
    // Ensure uniqueness if ID exists (simple collision check)
    let newId = `P${nextIdNum.toString().padStart(3, '0')}`;
    while(this.patients[newId]) {
        const num = parseInt(newId.substring(1)) + 1;
        newId = `P${num.toString().padStart(3, '0')}`;
    }

    const newPatient: Patient = {
      ...patient,
      id: newId,
    };
    this.patients[newId] = newPatient;
    console.log('[DB] Patient Added:', newPatient);
    return newPatient;
  }

  updatePatientStatus(id: string, status: 'Rawat Inap' | 'Rawat Jalan', diagnosis?: string): Patient | null {
    if (!this.patients[id]) return null;
    this.patients[id].status = status;
    if (diagnosis) this.patients[id].diagnosis = diagnosis;
    return this.patients[id];
  }

  // --- Doctor Operations ---
  getDoctors(query?: string): Doctor[] {
    if (!query) return this.doctors;
    const q = query.toLowerCase();
    return this.doctors.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.specialty.toLowerCase().includes(q)
    );
  }

  addDoctor(doctor: Omit<Doctor, 'id'>): Doctor {
    const newId = `D${(this.doctors.length + 1).toString().padStart(3, '0')}`;
    const newDoctor: Doctor = {
      ...doctor,
      id: newId,
    };
    this.doctors.push(newDoctor);
    console.log('[DB] Doctor Added:', newDoctor);
    return newDoctor;
  }

  // --- Bill Operations ---
  getBill(patientId: string): Bill | undefined {
    return this.bills[patientId];
  }
}

// Export singleton instance
export const db = new SimulationDatabase();