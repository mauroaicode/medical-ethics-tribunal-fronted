import { User } from '../common/user.model';

/**
 * Magistrate Model
 */
export interface Magistrate {
  id: number;
  user_id: number;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
}

/**
 * Magistrate Detail Model
 */
export interface MagistrateDetail {
  id: number;
  user_id: number;
  user: User;
}
