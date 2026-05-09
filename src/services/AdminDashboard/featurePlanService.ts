import api from "../../utils/api";

export const getFeatures = () => api.get("/features/all");

export const createFeature = (data: any) => api.post("/features/create", data);

export const getPermissions = () => api.get("/permission/all");
