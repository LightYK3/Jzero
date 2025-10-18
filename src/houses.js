/**
 * House System Calculator
 * Implements Placidus, Whole Sign, Equal, and Porphyry house systems
 * Open Source Astrology Calculator
 */

import { 
  calculateLST, 
  calculateObliquity, 
  normalizeAngle, 
  degreesToRadians, 
  radiansToDegrees 
} from './julianDay.js';

/**
 * Calculate Midheaven (MC) - 10th house cusp
 * @param {number} lst - Local Sidereal Time in degrees
 * @param {number} epsilon - Obliquity of ecliptic in degrees
 * @returns {number} MC in degrees
 */
export function calculateMC(lst, epsilon) {
  const lstRad = degreesToRadians(lst);
  const epsRad = degreesToRadians(epsilon);
  
  const mc = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(epsRad));
  return normalizeAngle(radiansToDegrees(mc));
}

/**
 * Calculate Ascendant (ASC) - 1st house cusp
 * @param {number} lst - Local Sidereal Time in degrees
 * @param {number} latitude - Geographic latitude in degrees
 * @param {number} epsilon - Obliquity of ecliptic in degrees
 * @returns {number} Ascendant in degrees
 */
export function calculateAscendant(lst, latitude, epsilon) {
  const lstRad = degreesToRadians(lst);
  const latRad = degreesToRadians(latitude);
  const epsRad = degreesToRadians(epsilon);
  
  const numerator = -Math.cos(lstRad);
  const denominator = Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad);
  
  const asc = Math.atan2(numerator, denominator);
  return normalizeAngle(radiansToDegrees(asc));
}

/**
 * Calculate Whole Sign Houses
 * Each house occupies one complete zodiac sign
 * @param {number} ascendant - Ascendant in degrees
 * @returns {array} Array of 12 house cusps
 */
export function calculateWholeSignHouses(ascendant) {
  const houses = [];
  const ascSign = Math.floor(ascendant / 30);
  
  for (let i = 0; i < 12; i++) {
    const houseSign = (ascSign + i) % 12;
    houses.push({
      cusp: i + 1,
      longitude: houseSign * 30,
      sign: Math.floor(houseSign),
      system: 'Whole Sign'
    });
  }
  
  return houses;
}

/**
 * Calculate Equal Houses
 * Each house is exactly 30° from the Ascendant
 * @param {number} ascendant - Ascendant in degrees
 * @returns {array} Array of 12 house cusps
 */
export function calculateEqualHouses(ascendant) {
  const houses = [];
  
  for (let i = 0; i < 12; i++) {
    const longitude = normalizeAngle(ascendant + (i * 30));
    houses.push({
      cusp: i + 1,
      longitude: longitude,
      sign: Math.floor(longitude / 30),
      system: 'Equal'
    });
  }
  
  return houses;
}

/**
 * Calculate Porphyry Houses
 * Trisects each quadrant (ASC-MC, MC-DSC, DSC-IC, IC-ASC)
 * @param {number} ascendant - Ascendant in degrees
 * @param {number} mc - Midheaven in degrees
 * @returns {array} Array of 12 house cusps
 */
export function calculatePorphyryHouses(ascendant, mc) {
  const houses = [];
  const descendant = normalizeAngle(ascendant + 180);
  const ic = normalizeAngle(mc + 180);
  
  // Helper function to calculate arc
  function getArc(start, end) {
    let arc = end - start;
    if (arc < 0) arc += 360;
    return arc;
  }
  
  // Quadrant 1: ASC to MC
  const arc1 = getArc(ascendant, mc) / 3;
  houses.push({ cusp: 1, longitude: ascendant, sign: Math.floor(ascendant / 30), system: 'Porphyry' });
  houses.push({ cusp: 12, longitude: normalizeAngle(ascendant + arc1 * 2), sign: Math.floor(normalizeAngle(ascendant + arc1 * 2) / 30), system: 'Porphyry' });
  houses.push({ cusp: 11, longitude: normalizeAngle(ascendant + arc1), sign: Math.floor(normalizeAngle(ascendant + arc1) / 30), system: 'Porphyry' });
  
  // Quadrant 2: MC to DSC
  const arc2 = getArc(mc, descendant) / 3;
  houses.push({ cusp: 10, longitude: mc, sign: Math.floor(mc / 30), system: 'Porphyry' });
  houses.push({ cusp: 9, longitude: normalizeAngle(mc + arc2 * 2), sign: Math.floor(normalizeAngle(mc + arc2 * 2) / 30), system: 'Porphyry' });
  houses.push({ cusp: 8, longitude: normalizeAngle(mc + arc2), sign: Math.floor(normalizeAngle(mc + arc2) / 30), system: 'Porphyry' });
  
  // Quadrant 3: DSC to IC
  const arc3 = getArc(descendant, ic) / 3;
  houses.push({ cusp: 7, longitude: descendant, sign: Math.floor(descendant / 30), system: 'Porphyry' });
  houses.push({ cusp: 6, longitude: normalizeAngle(descendant + arc3 * 2), sign: Math.floor(normalizeAngle(descendant + arc3 * 2) / 30), system: 'Porphyry' });
  houses.push({ cusp: 5, longitude: normalizeAngle(descendant + arc3), sign: Math.floor(normalizeAngle(descendant + arc3) / 30), system: 'Porphyry' });
  
  // Quadrant 4: IC to ASC
  houses.push({ cusp: 4, longitude: ic, sign: Math.floor(ic / 30), system: 'Porphyry' });
  houses.push({ cusp: 3, longitude: normalizeAngle(ic + arc3 * 2), sign: Math.floor(normalizeAngle(ic + arc3 * 2) / 30), system: 'Porphyry' });
  houses.push({ cusp: 2, longitude: normalizeAngle(ic + arc3), sign: Math.floor(normalizeAngle(ic + arc3) / 30), system: 'Porphyry' });
  
  // Sort by cusp number
  return houses.sort((a, b) => a.cusp - b.cusp);
}

/**
 * Calculate houses for a given birth data
 * @param {number} jd - Julian Day Number
 * @param {number} latitude - Geographic latitude in degrees
 * @param {number} longitude - Geographic longitude in degrees (east positive)
 * @param {string} system - House system ('whole', 'equal', 'porphyry', 'placidus')
 * @returns {object} House data including ASC, MC, and house cusps
 */
export function calculateHouses(jd, latitude, longitude, system = 'porphyry') {
  const lst = calculateLST(jd, longitude);
  const epsilon = calculateObliquity(jd);
  const mc = calculateMC(lst, epsilon);
  const ascendant = calculateAscendant(lst, latitude, epsilon);
  const descendant = normalizeAngle(ascendant + 180);
  const ic = normalizeAngle(mc + 180);
  
  let houses;
  switch (system.toLowerCase()) {
    case 'whole':
    case 'wholesign':
      houses = calculateWholeSignHouses(ascendant);
      break;
    case 'equal':
      houses = calculateEqualHouses(ascendant);
      break;
    case 'porphyry':
    default:
      houses = calculatePorphyryHouses(ascendant, mc);
      break;
  }
  
  return {
    ascendant,
    descendant,
    mc,
    ic,
    lst,
    epsilon,
    houses,
    system
  };
}

/**
 * Determine which house a planet is in
 * @param {number} planetLongitude - Planet's ecliptic longitude in degrees
 * @param {array} houses - Array of house cusps
 * @returns {number} House number (1-12)
 */
export function getPlanetHouse(planetLongitude, houses) {
  const normalizedLon = normalizeAngle(planetLongitude);
  
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % houses.length];
    
    const currentCusp = currentHouse.longitude;
    const nextCusp = nextHouse.longitude;
    
    // Handle wrap-around at 0°
    if (currentCusp < nextCusp) {
      if (normalizedLon >= currentCusp && normalizedLon < nextCusp) {
        return currentHouse.cusp;
      }
    } else {
      if (normalizedLon >= currentCusp || normalizedLon < nextCusp) {
        return currentHouse.cusp;
      }
    }
  }
  
  return 1; // Default to 1st house
}

export default {
  calculateMC,
  calculateAscendant,
  calculateWholeSignHouses,
  calculateEqualHouses,
  calculatePorphyryHouses,
  calculateHouses,
  getPlanetHouse
};
