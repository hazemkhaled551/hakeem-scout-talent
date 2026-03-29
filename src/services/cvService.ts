import api from "../utils/api";

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
