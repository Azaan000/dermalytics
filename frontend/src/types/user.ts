export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  is_admin: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  profile_picture_url?: string;
  preferences?: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
