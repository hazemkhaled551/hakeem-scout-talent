import { createContext, useContext } from "react";

export type User = {
  id: string;
  email: string;
  role?: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;

  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<User>;

  register: (data: any) => Promise<any>;

  googleLogin: () => void;
  handleGoogleCallback: (token: string, user: User) => void;
  selectRole: (id: string, role: string) => Promise<any>;
  requestRestoreEmail: (email: string) => Promise<any>;

  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;

  resendEmailVerify: (email: string) => Promise<any>;
  verifyEmail: (token: string) => Promise<any>;

  forgetPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
