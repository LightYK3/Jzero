/**
 * Ephemeris Data Lookup (Browser Version)
 * Uses JavaScript modules instead of filesystem
 * Open Source Astrology Calculator
 */

import { normalizeAngle } from './julianDay.js';

// Import ephemeris data as modules
import sunData from '../data/ephemeris_sun.js';
import moonData from '../data/ephemeris_moon.js';
import mercuryData from '../data/ephemeris_mercury.js';
import venusData from '../data/ephemeris_venus.js';
import marsData from '../data/ephemeris_mars.js';
import jupiterData from '../data/ephemeris_jupiter.js';
import saturnData from '../data/ephemeris_saturn.js';
import uranusData from '../data/ephemeris_uranus.js';
import neptuneData from '../data/ephemeris_neptune.js';
import plutoData from '../data/ephemeris_pluto.js';

// Map body names to data modules
const EPHEMERIS_MODULES = {
  'Sun': sunData,
  'Moon': moonData,
  'Mercury': mercuryData,
  'Venus': venusData,
  'Mars': marsData,
  'Jupiter': jupiterData,
  'Saturn': saturnData,
  'Uranus': uranusData,
  'Neptune': neptuneData,
  'Pluto': plutoData
};

// Sign name to starting longitude mapping
const SIGN_TO_LONGITUDE = {
  'Aries': 0,
  'Taurus': 30,
  'Gemini': 60,
  'Cancer': 90,
  'Leo': 120,
  'Virgo': 150,
  'Libra': 180,
  'Scorpio': 210,
  'Sagittarius': 240,
  'Capricorn': 270,
  'Aquarius': 300,
  'Pisces': 330
};

// Cache for processed ephemeris data
const ephemerisCache = {};

/**
 * Load and process ephemeris data for a celestial body
 * @param {string} body - Body name (Sun, Moon, Mercury, etc.)
 * @returns {array} Processed ephemeris data
 */
function loadEphemerisData(body) {
  if (ephemerisCache[body]) {
    return ephemerisCache[body];
  }
  
  const data = EPHEMERIS_MODULES[body];
  if (!data) {
    console.error(`No ephemeris data available for ${body}`);
    return [];
  }
  
  // Convert to usable format with full longitude
  const processed = data.map(record => {
    const jd = parseFloat(record.JD);
    const sign = record.Sign;
    const degInSign = parseFloat(record.Deg) || 0;
    
    // Calculate full ecliptic longitude
    let longitude = 0;
    if (sign && SIGN_TO_LONGITUDE.hasOwnProperty(sign)) {
      longitude = SIGN_TO_LONGITUDE[sign] + degInSign;
    }
    
    return {
      jd: jd,
      longitude: longitude,
      sign: sign,
      degInSign: degInSign,
      date: record.Date_UT
    };
  }).filter(r => !isNaN(r.jd) && r.longitude >= 0);
  
  // Sort by JD
  processed.sort((a, b) => a.jd - b.jd);
  
  ephemerisCache[body] = processed;
  return processed;
}

/**
 * Linear interpolation between two values
 * @param {number} x0 - First x value
 * @param {number} y0 - First y value
 * @param {number} x1 - Second x value
 * @param {number} y1 - Second y value
 * @param {number} x - Target x value
 * @returns {number} Interpolated y value
 */
function lerp(x0, y0, x1, y1, x) {
  if (x1 === x0) return y0;
  return y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
}

/**
 * Get planet position from ephemeris data
 * @param {string} body - Body name
 * @param {number} jd - Julian Day Number
 * @returns {object|null} Position data or null if not found
 */
export function getEphemerisPosition(body, jd) {
  const data = loadEphemerisData(body);
  
  if (!data || data.length === 0) {
    return null;
  }
  
  // Check if JD is within range
  if (jd < data[0].jd || jd > data[data.length - 1].jd) {
    console.warn(`JD ${jd} outside ephemeris range for ${body} (${data[0].jd} to ${data[data.length - 1].jd})`);
    return null;
  }
  
  // Find surrounding records
  let before = null;
  let after = null;
  
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].jd <= jd && data[i + 1].jd >= jd) {
      before = data[i];
      after = data[i + 1];
      break;
    }
  }
  
  if (!before || !after) {
    // Exact match or closest
    const closest = data.reduce((prev, curr) => {
      return Math.abs(curr.jd - jd) < Math.abs(prev.jd - jd) ? curr : prev;
    });
    return {
      longitude: closest.longitude,
      sign: closest.sign,
      degInSign: closest.degInSign,
      interpolated: false
    };
  }
  
  // Interpolate longitude
  let lon1 = before.longitude;
  let lon2 = after.longitude;
  
  // Handle wrap around 360/0
  if (Math.abs(lon2 - lon1) > 180) {
    if (lon2 < lon1) {
      lon2 += 360;
    } else {
      lon1 += 360;
    }
  }
  
  const longitude = normalizeAngle(lerp(before.jd, lon1, after.jd, lon2, jd));
  
  return {
    longitude: longitude,
    interpolated: true,
    beforeJD: before.jd,
    afterJD: after.jd
  };
}

/**
 * Get positions for all available bodies
 * @param {number} jd - Julian Day Number
 * @returns {array} Array of positions
 */
export function getAllEphemerisPositions(jd) {
  const bodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const positions = [];
  
  for (const body of bodies) {
    // Note: Moon ephemeris data is corrupted in CSV, use calculation instead
    if (body === 'Moon') {
      // Will be handled by calculator using moon-calculator.js
      continue;
    }
    
    const pos = getEphemerisPosition(body, jd);
    if (pos) {
      positions.push({
        body: body,
        ...pos
      });
    }
  }
  
  return positions;
}

/**
 * Check if ephemeris data is available for a date
 * @param {number} jd - Julian Day Number
 * @returns {object} Availability info
 */
export function checkEphemerisAvailability(jd) {
  const sunData = loadEphemerisData('Sun');
  
  if (!sunData || sunData.length === 0) {
    return {
      available: false,
      reason: 'No ephemeris data loaded'
    };
  }
  
  const minJD = sunData[0].jd;
  const maxJD = sunData[sunData.length - 1].jd;
  
  return {
    available: jd >= minJD && jd <= maxJD,
    minJD: minJD,
    maxJD: maxJD,
    minDate: sunData[0].date,
    maxDate: sunData[sunData.length - 1].date
  };
}

export default {
  getEphemerisPosition,
  getAllEphemerisPositions,
  checkEphemerisAvailability
};
