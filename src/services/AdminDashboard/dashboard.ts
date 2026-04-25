import api from "../../utils/api";

export const getDashboardData = () => {
  return api.get("/admin/dashboard");
};
