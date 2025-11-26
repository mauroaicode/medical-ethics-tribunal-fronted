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

