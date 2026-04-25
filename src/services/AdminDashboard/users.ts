import api from "../../utils/api";

export const getAllUsers = (page: number = 1, limit: number = 10) => {
  return api.get("/admin/users", { params: { page, limit } });
};

export const getUserDetails = (userId: string) => {
  return api.get(`/admin/users/${userId}`);
};

export const banUser = (userId: string) => {
  return api.patch(`/admin/users/${userId}/ban`);
};

export const unbanUser = (userId: string) => {
  return api.patch(`/admin/users/${userId}/unban`);
};

export const getAllCompanies = (page: number = 1, limit: number = 10) => {
  return api.get("/admin/companies", { params: { page, limit } });
}
