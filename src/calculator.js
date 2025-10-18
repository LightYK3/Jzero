/**
 * Main Astrology Calculator
 * Combines Julian Day, planetary positions, and house calculations
 * Open Source Astrology Calculator
 */

import { dateToJulianDay } from './julianDay.js';
import { calculateAllPlanets, longitudeToZodiac } from './planets.js';
import { calculateHouses, getPlanetHouse } from './houses.js';

/**
 * Calculate complete birth chart
 * @param {object} birthData - Birth data object
 * @param {number} birthData.year - Year
 * @param {number} birthData.month - Month (1-12)
 * @param {number} birthData.day - Day
 * @param {number} birthData.hour - Hour (0-23)
 * @param {number} birthData.minute - Minute
 * @param {number} birthData.second - Second
 * @param {number} birthData.latitude - Latitude in degrees
 * @param {number} birthData.longitude - Longitude in degrees (east positive)
 * @param {string} birthData.houseSystem - House system ('whole', 'equal', 'porphyry')
 * @returns {object} Complete birth chart data
 */
export function calculateBirthChart(birthData) {
  const { year, month, day, hour, minute, second, latitude, longitude, houseSystem = 'porphyry' } = birthData;
  
  // Calculate Julian Day
  const jd = dateToJulianDay(year, month, day, hour, minute, second);
  
  // Calculate planetary positions
  const planets = calculateAllPlanets(jd);
  
  // Calculate houses
  const houseData = calculateHouses(jd, latitude, longitude, houseSystem);
  
  // Determine which house each planet is in
  const planetsWithHouses = planets.map(planet => ({
    ...planet,
    house: getPlanetHouse(planet.longitude, houseData.houses)
  }));
  
  // Add zodiac info for angles
  const ascendantZodiac = longitudeToZodiac(houseData.ascendant);
  const mcZodiac = longitudeToZodiac(houseData.mc);
  
  return {
    birthData: {
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
      latitude,
      longitude,
      julianDay: jd
    },
    angles: {
      ascendant: {
        longitude: houseData.ascendant,
        ...ascendantZodiac
      },
      mc: {
        longitude: houseData.mc,
        ...mcZodiac
      },
      descendant: {
        longitude: houseData.descendant,
        ...longitudeToZodiac(houseData.descendant)
      },
      ic: {
        longitude: houseData.ic,
        ...longitudeToZodiac(houseData.ic)
      }
    },
    planets: planetsWithHouses,
    houses: houseData.houses.map(house => ({
      ...house,
      ...longitudeToZodiac(house.longitude)
    })),
    houseSystem: houseSystem,
    metadata: {
      calculatedAt: new Date().toISOString(),
      version: '1.0.0',
      openSource: true,
      license: 'MIT'
    }
  };
}

/**
 * Calculate aspects between planets
 * @param {array} planets - Array of planet positions
 * @param {object} orbs - Orb values for each aspect type
 * @returns {array} Array of aspects
 */
export function calculateAspects(planets, orbs = { conjunction: 8, opposition: 8, trine: 8, square: 7, sextile: 6 }) {
  const aspects = [];
  const aspectTypes = [
    { name: 'Conjunction', angle: 0, orb: orbs.conjunction, symbol: '☌' },
    { name: 'Opposition', angle: 180, orb: orbs.opposition, symbol: '☍' },
    { name: 'Trine', angle: 120, orb: orbs.trine, symbol: '△' },
    { name: 'Square', angle: 90, orb: orbs.square, symbol: '□' },
    { name: 'Sextile', angle: 60, orb: orbs.sextile, symbol: '⚹' }
  ];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      
      let diff = Math.abs(planet1.longitude - planet2.longitude);
      if (diff > 180) diff = 360 - diff;
      
      for (const aspectType of aspectTypes) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planet1: planet1.planet,
            planet2: planet2.planet,
            aspect: aspectType.name,
            symbol: aspectType.symbol,
            angle: aspectType.angle,
            orb: orb.toFixed(2),
            applying: planet1.longitude < planet2.longitude
          });
        }
      }
    }
  }
  
  return aspects;
}

/**
 * Generate text interpretation of chart
 * @param {object} chart - Birth chart data
 * @returns {string} Text interpretation
 */
export function generateInterpretation(chart) {
  const { planets, angles } = chart;
  const sun = planets.find(p => p.planet === 'Sun');
  const moon = planets.find(p => p.planet === 'Moon');
  
  let interpretation = `## Birth Chart Interpretation\n\n`;
  interpretation += `**Sun in ${sun.sign}**: Your core identity and life purpose.\n`;
  interpretation += `**Moon in ${moon.sign}**: Your emotional nature and inner world.\n`;
  interpretation += `**Ascendant in ${angles.ascendant.sign}**: How you present yourself to the world.\n\n`;
  
  interpretation += `### Planetary Positions\n`;
  planets.forEach(planet => {
    interpretation += `- **${planet.planet}** in ${planet.formatted} (House ${planet.house})\n`;
  });
  
  return interpretation;
}

export default {
  calculateBirthChart,
  calculateAspects,
  generateInterpretation
};
