import { useState } from "react";
import api from "../utils/api";
import { AuthContext, type User } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null"),
  );

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  /* ================= REGISTER ================= */

  const register = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  };

  /* ================= LOGIN ================= */

  const login = async (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => {
    const res = await api.post("/auth/login", {
      email,
      password,
      rememberMe,
    });

    const user = res.data.data.user;
    const token = res.data.data.accessToken;

    setUser(user);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    return user;
  };
  /* ================= RESEND EMAIL VERIFY ================= */

  const resendEmailVerify = async (email: string) => {
    const res = await api.post("/auth/resendEmailVerify", { email });
    return res.data;
  };

  /* ================= VERIFY EMAIL ================= */

  const verifyEmail = async (id: string, token: string) => {
    const res = await api.get(`/auth/verify-email/${id}/${token}`);
    return res.data;
  };

  /* ================= REFRESH TOKEN ================= */

  const refreshToken = async () => {
    const { data } = await api.post("/auth/refreshToken");

    setToken(data.accessToken);
    localStorage.setItem("token", data.accessToken);
  };

  /* ================= LOGOUT ================= */

  const logout = async () => {
    await api.post("/auth/logOut");

    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  /* ================= FORGET PASSWORD ================= */

  const forgetPassword = async (email: string) => {
    const res = await api.post("/auth/forget-password", { email });
    return res.data;
  };

  /* ================= RESET PASSWORD ================= */

  const resetPassword = async (
    id: string,
    resetToken: string,
    password: string,
  ) => {
    const res = await api.post(`/auth/reset_password/${id}/${resetToken}`, {
      password,
    });

    return res.data;
  };

  const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  const handleGoogleCallback = (token: string, user: User) => {
    setUser(user);
    setToken(token);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const selectRole = async (id: string, role: string) => {
    const { data } = await api.post(`/auth/select-role/${id}`, { role });

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        googleLogin,
        handleGoogleCallback,
        selectRole,
        refreshToken,
        resendEmailVerify,
        verifyEmail,
        forgetPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
