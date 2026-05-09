import api from "../../utils/api";

export const getPlans = () => api.get("/admin/plans");
export const createPlan = (data: any) => api.post("/plans/create", data);
