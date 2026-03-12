import api from "../utils/api";

/* ================= SKILLS ================= */

export const addSkill = async (name: string) => {
  const { data } = await api.post("/users/me/skills", { name });
  return data;
};

export const deleteSkill = async (id: number) => {
  const { data } = await api.delete(`/users/me/skills/${id}`);
  return data;
};

/* ================= SPECIALIZATIONS ================= */

export const addSpecialization = async (name: string) => {
  const { data } = await api.post("/companys/me/specializations", { name });
  return data;
};

export const deleteSpecialization = async (id: number) => {
  const { data } = await api.delete(`/companys/me/specializations/${id}`);
  return data;
};

/* ================= EXPERIENCE ================= */

export const addExperience = async (experience: {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}) => {
  const { data } = await api.post("/users/me/experiences", experience);
  return data;
};

export const updateExperience = async (
  id: number,
  experience: {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  },
) => {
  const { data } = await api.put(`/users/me/experiences/${id}`, experience);
  return data;
};

export const deleteExperience = async (id: number) => {
  const { data } = await api.delete(`/users/me/experiences/${id}`);
  return data;
};
