const getVietnamTimeISO = () => {
  const now = new Date();

  // Lấy timezone Việt Nam (Asia/Ho_Chi_Minh)
  const vnTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  // Convert chuỗi "YYYY-MM-DD, HH:MM:SS" sang ISO
  const isoString = vnTime.replace(", ", "T") + "+07:00";

  return isoString;
};

module.exports = { getVietnamTimeISO };
