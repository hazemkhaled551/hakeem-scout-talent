import api from "../utils/api";

/* ───────────── Upload CV ───────────── */
export const uploadCV = async (file: File) => {
  const formData = new FormData();
  formData.append("cv", file);

  const res = await api.post("/cv/upload-cv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.data;
};

/* ───────────── Get All CVs ───────────── */
export const getAllCVs = async () => {
  const res = await api.get("/cv/getAll", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.data;
};

/* ───────────── Delete CV ───────────── */
export const deleteCV = async (id: string) => {
  const res = await api.delete(`/cv/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.data;
};

/* ───────────── Download CV ───────────── */
export const downloadCV = async (id: string) => {
  const res = await api.get(`/cv/download/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    responseType: "blob",
  });

  return res.data;
};
/* ───────────── view CV ───────────── */
export const viewCV = async (id: string) => {
  const res = await api.get(`/cv/view/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    responseType: "blob",
  });

  return res.data;
};
