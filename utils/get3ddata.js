// utils/chairPlacement.js

/**
 * Calculate chair placements around a circle.
 *
 * @param {Object} options
 * @param {number} options.radius - Radius of the circular table
 * @param {number} options.chairWidth - Width of each chair
 * @param {number} options.totalChairs - Total number of chairs
 * @param {number} options.minMargin - Minimum spacing between chairs
 * @param {number} options.maxMargin - Maximum spacing between chairs
 * @param {number} options.gap - Multiplier for how far chairs are from center
 * @returns {Array} Array of placement objects: { x, z, rotY }
 */
export function calculateChairPlacements({
  radius,
  chairWidth,
  totalChairs,
  minMargin = 1,
  maxMargin = 10,
  gap = 1.1,
}) {
  const circumference = 2 * Math.PI * radius;
  const totalChairWidth = totalChairs * chairWidth;
  let totalMargin = circumference - totalChairWidth;

  // Margin between chairs
  let margin = totalMargin / totalChairs;
  margin = Math.min(Math.max(margin, minMargin), maxMargin);

  const angleStep = (2 * Math.PI) / totalChairs;
  const placements = [];

  for (let i = 0; i < totalChairs; i++) {
    const angle = i * angleStep;
    const x = gap * radius * Math.cos(angle);
    const z = gap * radius * Math.sin(angle);
    const rotY = Math.PI / 2;
    placements.push({ x, z, rotY });
  }

  return placements;
}
