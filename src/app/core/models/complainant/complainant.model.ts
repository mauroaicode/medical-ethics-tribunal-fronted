import { User } from '../common/user.model';
import { City } from '../common/city.model';

/**
 * Complainant Model
 */
export interface Complainant {
  id: number;
  user_id: number;
  name: string;
  last_name: string;
  email: string;
  location: string;
  is_anonymous: boolean;
  created_at: string;
}

/**
 * Complainant Detail Model
 */
export interface ComplainantDetail {
  id: number;
  user_id: number;
  city_id: number;
  municipality: string;
  company: string | null;
  is_anonymous: boolean;
  user: User;
  city: City;
}
