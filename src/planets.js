/**
 * Planetary Position Calculator
 * Based on VSOP87/Meeus algorithms and ephemeris data
 * Open Source Astrology Calculator
 */

import { julianCenturies, normalizeAngle, degreesToRadians, radiansToDegrees } from './julianDay.js';

// Planetary constants (J2000.0)
export const PLANETARY_CONSTANTS = {
  Sun: {
    L0: 280.46646,
    L1: 36000.76983,
    n: 0.9856473602,
    M0: 357.52911,
    a: 1.0,
    e: 0.01671022,
    i: 0.0,
    omega: 0.0,
    pi: 102.94719,
    color: '#FDB813'
  },
  Mercury: {
    L0: 252.25084,
    L1: 149472.67411175,
    n: 4.0923387847,
    M0: 174.79439,
    a: 0.38709843,
    e: 0.20563069,
    i: 7.00487,
    omega: 48.33167,
    pi: 77.45645,
    color: '#97979F'
  },
  Venus: {
    L0: 181.97973,
    L1: 58517.81538729,
    n: 1.6021304692,
    M0: 50.44675,
    a: 0.72333199,
    e: 0.00677323,
    i: 3.39471,
    omega: 76.68069,
    pi: 131.53298,
    color: '#FFC649'
  },
  Moon: {
    L0: 218.3164477,
    L1: 481267.88123421,
    n: 13.1763965268,
    M0: 134.9633964,
    color: '#C0C0C0'
  },
  Mars: {
    L0: 355.45332,
    L1: 19140.29934243,
    n: 0.5240328362,
    M0: 19.41248,
    a: 1.52366231,
    e: 0.09341233,
    i: 1.85061,
    omega: 49.57854,
    pi: 336.04084,
    color: '#DC143C'
  },
  Jupiter: {
    L0: 34.40438,
    L1: 3034.74612775,
    n: 0.0830868207,
    M0: 19.65053,
    a: 5.20336301,
    e: 0.04839266,
    i: 1.30530,
    omega: 100.55615,
    pi: 14.75385,
    color: '#F4A460'
  },
  Saturn: {
    L0: 49.94432,
    L1: 1222.49362201,
    n: 0.0334700513,
    M0: 317.51238,
    a: 9.53707032,
    e: 0.05415060,
    i: 2.48446,
    omega: 113.71504,
    pi: 92.43194,
    color: '#DAA520'
  },
  Uranus: {
    L0: 313.23218,
    L1: 428.48202785,
    n: 0.0117311986,
    M0: 142.26794,
    a: 19.19126393,
    e: 0.04716771,
    i: 0.76986,
    omega: 74.22988,
    pi: 170.96424,
    color: '#4FD0E0'
  },
  Neptune: {
    L0: 304.88003,
    L1: 218.45945325,
    n: 0.0059810939,
    M0: 259.90868,
    a: 30.06896348,
    e: 0.00858587,
    i: 1.76917,
    omega: 131.72169,
    pi: 44.97135,
    color: '#4169E1'
  },
  Pluto: {
    L0: 238.92881,
    L1: 145.20780515,
    n: 0.0039755730,
    M0: 14.86205,
    a: 39.48,
    e: 0.24882,
    i: 17.14,
    omega: 110.30,
    pi: 224.07,
    color: '#8B4513'
  }
};

// Zodiac signs
export const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'Fire', modality: 'Cardinal', ruler: 'Mars' },
  { name: 'Taurus', symbol: '♉', element: 'Earth', modality: 'Fixed', ruler: 'Venus' },
  { name: 'Gemini', symbol: '♊', element: 'Air', modality: 'Mutable', ruler: 'Mercury' },
  { name: 'Cancer', symbol: '♋', element: 'Water', modality: 'Cardinal', ruler: 'Moon' },
  { name: 'Leo', symbol: '♌', element: 'Fire', modality: 'Fixed', ruler: 'Sun' },
  { name: 'Virgo', symbol: '♍', element: 'Earth', modality: 'Mutable', ruler: 'Mercury' },
  { name: 'Libra', symbol: '♎', element: 'Air', modality: 'Cardinal', ruler: 'Venus' },
  { name: 'Scorpio', symbol: '♏', element: 'Water', modality: 'Fixed', ruler: 'Mars/Pluto' },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter' },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn' },
  { name: 'Aquarius', symbol: '♒', element: 'Air', modality: 'Fixed', ruler: 'Saturn/Uranus' },
  { name: 'Pisces', symbol: '♓', element: 'Water', modality: 'Mutable', ruler: 'Jupiter/Neptune' }
];

/**
 * Convert longitude to zodiac sign and degree
 * @param {number} longitude - Ecliptic longitude in degrees
 * @returns {object} Sign information
 */
export function longitudeToZodiac(longitude) {
  const normalizedLon = normalizeAngle(longitude);
  const signIndex = Math.floor(normalizedLon / 30);
  const degree = normalizedLon % 30;
  const sign = ZODIAC_SIGNS[signIndex];
  
  return {
    longitude: normalizedLon,
    sign: sign.name,
    symbol: sign.symbol,
    degree: degree,
    formatted: `${Math.floor(degree)}°${sign.symbol}${Math.floor((degree % 1) * 60)}'`
  };
}

/**
 * Solve Kepler's equation using Newton-Raphson method
 * @param {number} M - Mean anomaly in radians
 * @param {number} e - Eccentricity
 * @returns {number} Eccentric anomaly in radians
 */
function solveKepler(M, e) {
  let E = M; // Initial guess
  const tolerance = 1e-8;
  const maxIterations = 30;
  
  for (let i = 0; i < maxIterations; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E = E - dE;
    
    if (Math.abs(dE) < tolerance) {
      break;
    }
  }
  
  return E;
}

/**
 * Calculate planetary position using simplified Kepler orbit
 * @param {string} planet - Planet name
 * @param {number} jd - Julian Day Number
 * @returns {object} Planet position
 */
export function calculatePlanetPosition(planet, jd) {
  const constants = PLANETARY_CONSTANTS[planet];
  if (!constants) {
    throw new Error(`Unknown planet: ${planet}`);
  }
  
  const T = julianCenturies(jd);
  const daysSinceJ2000 = jd - 2451545.0;
  
  // Calculate mean longitude
  let L = constants.L0 + constants.L1 * T;
  L = normalizeAngle(L);
  
  // Calculate mean anomaly
  let M = constants.M0 + constants.n * daysSinceJ2000;
  M = normalizeAngle(M);
  
  // Convert to radians for calculation
  const M_rad = degreesToRadians(M);
  const e = constants.e || 0.0167;
  
  // Solve Kepler's equation
  const E = solveKepler(M_rad, e);
  
  // Calculate true anomaly
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
  
  // Calculate heliocentric longitude
  let lambda = radiansToDegrees(nu) + (constants.pi || 0);
  lambda = normalizeAngle(lambda);
  
  // For geocentric (simplified - would need Earth's position for accuracy)
  if (planet !== 'Sun' && planet !== 'Moon') {
    // This is a simplified calculation
    // For production, calculate Earth's position and subtract
  }
  
  const zodiac = longitudeToZodiac(lambda);
  
  return {
    planet: planet,
    longitude: lambda,
    meanAnomaly: M,
    ...zodiac,
    julianDay: jd,
    color: constants.color
  };
}

/**
 * Calculate all planet positions for a given date
 * @param {number} jd - Julian Day Number
 * @returns {array} Array of planet positions
 */
export function calculateAllPlanets(jd) {
  const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  return planets.map(planet => calculatePlanetPosition(planet, jd));
}

export default {
  PLANETARY_CONSTANTS,
  ZODIAC_SIGNS,
  longitudeToZodiac,
  calculatePlanetPosition,
  calculateAllPlanets
};
