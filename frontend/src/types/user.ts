export interface User {
  user_id: string;
  email: string;
  name: string;
}

export interface UserRegister {
  email: string;
  password: string;
  name: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthTokens {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
} 