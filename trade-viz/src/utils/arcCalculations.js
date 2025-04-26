/**
 * Utility functions for calculating arc properties on the globe visualization
 */

/**
 * Calculate the spherical distance between two points in radians
 * @param {number} startLat - Starting latitude in degrees
 * @param {number} startLng - Starting longitude in degrees
 * @param {number} endLat - Ending latitude in degrees
 * @param {number} endLng - Ending longitude in degrees
 * @returns {number} - Distance in radians
 */
export const calculateDistanceRadians = (startLat, startLng, endLat, endLng) => {
  return Math.acos(
    Math.sin(startLat * Math.PI/180) * Math.sin(endLat * Math.PI/180) +
    Math.cos(startLat * Math.PI/180) * Math.cos(endLat * Math.PI/180) *
    Math.cos((startLng - endLng) * Math.PI/180)
  );
};

/**
 * Calculate the distance effect (normalized distance)
 * @param {number} distRadians - Distance in radians
 * @returns {number} - Distance effect value
 */
export const calculateDistanceEffect = (distRadians) => {
  const normalizedDist = Math.min(distRadians / (0.5 * Math.PI), 1);
  return Math.pow(normalizedDist, 3) * 0.6;
};

/**
 * Calculate the final arc altitude
 * @param {number} normalizedValue - Normalized trade value (0-1)
 * @param {number} distEffect - Distance effect value
 * @returns {number} - Final arc altitude
 */
export const calculateArcAltitude = (normalizedValue, distEffect) => {
  return 0.02 + distEffect + (normalizedValue * 0.1);
};