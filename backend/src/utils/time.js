// const getVietnamTimeISO = () => {
//   const now = new Date();

//   // Lấy timezone Việt Nam (Asia/Ho_Chi_Minh)
//   const vnTime = new Intl.DateTimeFormat("en-CA", {
//     timeZone: "Asia/Ho_Chi_Minh",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   }).format(now);

//   // Convert chuỗi "YYYY-MM-DD, HH:MM:SS" sang ISO
//   const isoString = vnTime.replace(", ", "T") + "+07:00";

//   return isoString;
// };

// module.exports = { getVietnamTimeISO };

const getVietnamTimeISO = () => {
  const now = new Date();

  // Múi giờ Việt Nam là GMT+7, tương đương cộng thêm 7 tiếng (7 * 60 * 60 * 1000 miligiây)
  const offsetVN = 7 * 60 * 60 * 1000;

  // Tạo một đối tượng Date mới đã được cộng thêm 7 tiếng
  const vnDate = new Date(now.getTime() + offsetVN);

  // Dùng toISOString() để lấy chuỗi chuẩn, sau đó thay chữ "Z" ở cuối thành "+07:00"
  return vnDate.toISOString().replace("Z", "+07:00");
};

module.exports = { getVietnamTimeISO };
