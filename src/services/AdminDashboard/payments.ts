import api from "../../utils/api";
export const getPayments = (
  page = 1,
  limit = 10,
  status?: string,
  search?: string,
) => api.get("/admin/payment", { params: { page, limit, status, search } });
