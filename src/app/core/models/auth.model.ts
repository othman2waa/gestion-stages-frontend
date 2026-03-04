export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  userId: number;
}

export interface User {
  token: string;
  username: string;
  email: string;
  role: string;
  userId: number;
}