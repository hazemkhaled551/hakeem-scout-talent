import api from "../utils/api";

/* ================= SKILLS ================= */

export const addSkill = async (name: string) => {
  const { data } = await api.post("/applicant/me/skills", { name });
  return data;
};

export const deleteSkill = async (id: number) => {
  const { data } = await api.delete(`/applicant/me/skills/${id}`);
  return data;
};

/* ================= SPECIALIZATIONS ================= */

export const addSpecialization = async (name: string) => {
  const { data } = await api.post("/companys/me/specializations", { name });
  return data;
};



export const deleteSpecialization = async (id: string) => {
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
  const { data } = await api.post("/applicant/me/experiences", experience);
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
  const { data } = await api.put(`/applicant/me/experiences/${id}`, experience);
  return data;
};

export const deleteExperience = async (id: number) => {
  const { data } = await api.delete(`/applicant/me/experiences/${id}`);
  return data;
};

/* ================= Shared Account Company ================= */

export const shareCompanyProfile = async () => {
  const { data } = await api.get("/company/me/shared/profile");
  return data;
};

/* ================= Shared Account Applicant ================= */

export const shareApplicantProfile = async () => {
  const { data } = await api.get("/applicant/shared/profile");
  return data;
};

/* ================= Shared Slug ================= */
export const getSharedProfile = async (slug: string) => {
  const { data } = await api.get(`/user/profile/${slug}`);
  return data;
};
