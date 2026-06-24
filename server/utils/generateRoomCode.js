export const generateRoomCode = () => {
  // 6-digit numeric code: 100000–999999
  return Math.floor(100000 + Math.random() * 900000).toString();
};
