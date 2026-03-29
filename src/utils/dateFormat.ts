export const formatDate = (date: string | Date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
export const fmt = (v: string | undefined) => v?.replace("_", " ") || "";

export const companyIntiatal = (name: string | undefined) => {
  if (!name) return "";
  return name.charAt(0).toUpperCase();
};

export const fmtTime = (iso: string) => {
  console.log(iso);

  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
};
export const fmtDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
export const fmtDateTime = (iso: string) => {
  return `${fmtDate(iso)} · ${fmtTime(iso)}`;
};
export const endTime = (iso: string, mins: number) => {
  return new Date(new Date(iso).getTime() + mins * 60000).toLocaleTimeString(
    "en-US",
    { hour: "2-digit", minute: "2-digit", hour12: true },
  );
};

export const fmtDateLong = (iso: string) => {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};
