import api from "../../utils/api";

export const getFeatures = () => api.get("/features/all");

export const createFeature = (data: any) => api.post("/features/create", data);
export const updateFeature = (id: string, data: any) =>
  api.patch(`/features/${id}`, data);
export const deleteFeature = (id: string) => api.delete(`/features/${id}`);

export const getPermissions = () => api.get("/permission/all");
