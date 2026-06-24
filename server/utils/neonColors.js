export const neonColors = [
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#00FF00', // Lime
  '#FFFF00', // Yellow
  '#FF3300', // Neon Orange
  '#FF0099', // Hot Pink
  '#9D00FF', // Purple
  '#00FFCC'  // Teal
];

export const getRandomNeonColor = () => {
  return neonColors[Math.floor(Math.random() * neonColors.length)];
};
