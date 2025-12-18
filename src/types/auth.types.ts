// Auth-related TypeScript interfaces

import { User } from "./user.types";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}