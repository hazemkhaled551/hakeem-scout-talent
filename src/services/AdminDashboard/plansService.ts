import api from "../../utils/api";

export const getPlans = () => api.get("/admin/plans");
export const createPlan = (data: any) => api.post("/plans/create", data);
export const setDefaultPlan = (id: string) => api.patch(`/plans/${id}/default`);
export const deletePlan = (id: string) => api.delete(`/plans/${id}`);
export const updatePlan = (id: string, data: any) =>
  api.patch(`/plans/${id}`, data);

export const getPlanById = (id: string) => api.get(`/plans/${id}`);
