import { User } from '../common/user.model';
import { Specialty } from '../common/specialty.model';

/**
 * Doctor Model
 */
export interface Doctor {
  id: number;
  full_name: string;
}

/**
 * Doctor Detail Model
 */
export interface DoctorDetail {
  id: number;
  user_id: number;
  specialty_id: number;
  faculty: string;
  medical_registration_number: string;
  medical_registration_place: string;
  medical_registration_date: string;
  main_practice_company: string;
  other_practice_company: string | null;
  user: User;
  specialty: Specialty;
}

