/**
 * Calibrated Astrology Calculator
 * Uses actual ephemeris data from CSV files for accurate positions
 * Open Source Astrology Calculator
 */

import { dateToJulianDay, dateToJulianDayTT } from './julianDay.js';
import { getEphemerisPosition, getAllEphemerisPositions, checkEphemerisAvailability } from './ephemeris-browser.js';
import { longitudeToZodiac, PLANETARY_CONSTANTS } from './planets.js';
import { calculateHouses, getPlanetHouse } from './houses.js';
import { calculateMoonPosition } from './moon-calculator.js';
import { calculateInnerPlanet } from './inner-planets-calculator.js';
import { localToUTC } from './time-corrections.js';


/**
 * Calibration Epoch
 * Default to J2000.0 epoch when no birth data provided.
 * J2000.0 (TT): JD = 2451545.0 corresponds to 2000-01-01 12:00:00 TT
 * If civil time is used, convert to UTC then to TT via ΔT. We bypass civil time by using JD directly.
 */
const J2000_JD_TT = 2451545.0;

/**
 * Calculate chart at a specific Julian Day (TT)
 * @param {number} jd - Julian Day in Terrestrial Time
 * @param {object} opts - { latitude, longitude, houseSystem }
 * @returns {object} chart object
 */
export function calculateAtJD(jd, { latitude=0, longitude=0, houseSystem='porphyry' } = {}) {
  const availability = checkEphemerisAvailability(jd);
  if (!availability.available) {
    throw new Error(`Ephemeris data not available for JD ${jd}. Range: ${availability.minDate} to ${availability.maxDate}`);
  }
  const ephemerisPositions = getAllEphemerisPositions(jd);
  const moonCalc = calculateMoonPosition(jd); // already TT-based in this project
  const houses = calculateHouses(jd, latitude, longitude, houseSystem);
  const planets = [];
  for (const [planetName, pos] of Object.entries(ephemerisPositions)) {
    const zodiac = longitudeToZodiac(pos.longitude);
    const constants = PLANETARY_CONSTANTS[planetName] || {};
    planets.push({
      planet: planetName,
      longitude: pos.longitude,
      ...zodiac,
      julianDay: jd,
      color: constants.color || '#CCCCCC',
      source: 'J2000-Ephemeris',
      method: 'Ephemeris'
    });
  }
  const moonZodiac = longitudeToZodiac(moonCalc.longitude);
  planets.push({
    planet: 'Moon',
    longitude: moonCalc.longitude,
    ...moonZodiac,
    julianDay: jd,
    color: PLANETARY_CONSTANTS['Moon']?.color || '#C0C0C0',
    source: 'J2000-ELP2000',
    method: moonCalc.method || 'ELP2000'
  });
  return {
    jd,
    epoch: 'J2000.0',
    houses,
    planets,
    angles: {
      ascendant: houses.find(h => h.cusp === 1),
      midheaven: houses.find(h => h.cusp === 10),
      descendant: houses.find(h => h.cusp === 7),
      ic: houses.find(h => h.cusp === 4),
    }
  };
}


/**
 * Calculate birth chart using actual ephemeris data
 * @param {object} birthData - Birth data object
 * @returns {object} Complete birth chart data
 */
export function calculateBirthChart(birthData) {
  const { 
    year, month, day, hour, minute, second, 
    latitude, longitude, 
    houseSystem = 'porphyry',
    timezoneOffset = 0,  // Hours from UTC (e.g., -5 for EST, -4 for EDT)
    isLocalTime = false   // If true, convert from local time to UTC
  } = birthData;
  
  // Convert local time to UTC if needed
  let utcTime = { year, month, day, hour, minute, second };
  if (isLocalTime && timezoneOffset !== 0) {
    utcTime = localToUTC(year, month, day, hour, minute, second, timezoneOffset);
  }
  
  // If no date provided or explicit J2000 requested, use J2000.0 epoch
  if ((!year && !month && !day) || birthData?.useJ2000 === true) {
    const jd = J2000_JD_TT;
    return calculateAtJD(jd, { latitude, longitude, houseSystem });
  }
  // Calculate Julian Day in both UTC and TT
  const jdData = dateToJulianDayTT(utcTime.year, utcTime.month, utcTime.day, 
                                   utcTime.hour, utcTime.minute, utcTime.second);
  
  // Use TT for planetary calculations (more accurate)
  const jd = jdData.jd_tt;
  
  // Check if ephemeris data is available
  const availability = checkEphemerisAvailability(jd);
  if (!availability.available) {
    throw new Error(
      `Ephemeris data not available for this date. ` +
      `Available range: ${availability.minDate} to ${availability.maxDate}`
    );
  }
  
  // Get planetary positions from ephemeris data (outer planets + Sun only)
  const ephemerisPositions = getAllEphemerisPositions(jd);
  
  // Calculate Moon using J2000 formulas (ephemeris data is corrupted)
  const moonCalc = calculateMoonPosition(jd);
  const moonZodiac = longitudeToZodiac(moonCalc.longitude);
  
  // Calculate inner planets using J2000 formulas (ephemeris only has ingress data)
  const innerPlanets = {};
  for (const planetName of ['Mercury', 'Venus', 'Mars']) {
    const calc = calculateInnerPlanet(planetName, jd);
    if (calc) {
      innerPlanets[planetName] = calc;
    }
  }
  
  // Convert ephemeris positions to full planet objects
  const planets = ephemerisPositions.map(pos => {
    // Skip inner planets - we'll add them with J2000 calculations
    if (['Mercury', 'Venus', 'Mars', 'Moon'].includes(pos.body)) {
      return null;
    }
    
    const zodiac = longitudeToZodiac(pos.longitude);
    const constants = PLANETARY_CONSTANTS[pos.body] || {};
    
    return {
      planet: pos.body,
      longitude: pos.longitude,
      ...zodiac,
      julianDay: jd,
      color: constants.color || '#CCCCCC',
      source: 'ephemeris',
      interpolated: pos.interpolated
    };
  }).filter(p => p !== null);
  
  // Add inner planets with J2000 calculations
  for (const [planetName, calc] of Object.entries(innerPlanets)) {
    const zodiac = longitudeToZodiac(calc.longitude);
    const constants = PLANETARY_CONSTANTS[planetName] || {};
    
    planets.push({
      planet: planetName,
      longitude: calc.longitude,
      ...zodiac,
      julianDay: jd,
      color: constants.color || '#CCCCCC',
      source: 'J2000-Kepler',
      method: calc.method
    });
  }
  
  // Add Moon with J2000 calculation
  planets.push({
    planet: 'Moon',
    longitude: moonCalc.longitude,
    ...moonZodiac,
    julianDay: jd,
    color: PLANETARY_CONSTANTS['Moon']?.color || '#C0C0C0',
    source: 'J2000-ELP2000',
    method: moonCalc.method
  });
  
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
      timeUTC: `${String(utcTime.hour).padStart(2, '0')}:${String(utcTime.minute).padStart(2, '0')}:${String(utcTime.second).padStart(2, '0')} UTC`,
      latitude,
      longitude,
      julianDay: jdData.jd_tt,
      julianDayUTC: jdData.jd_utc,
      deltaT: jdData.deltaT,
      deltaTDays: jdData.deltaT_days
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
    dataSource: 'ephemeris',
    ephemerisRange: {
      minDate: availability.minDate,
      maxDate: availability.maxDate
    },
    metadata: {
      calculatedAt: new Date().toISOString(),
      version: '1.1.0',
      openSource: true,
      license: 'MIT',
      accuracy: 'High - Uses TT with ΔT correction and actual ephemeris data',
      timeCorrections: {
        description: 'Includes ΔT (TT-UTC) correction for accurate planetary positions',
        deltaT_seconds: jdData.deltaT,
        usesTerresterialTime: true
      }
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

export default {
  calculateBirthChart,
  calculateAspects
};
