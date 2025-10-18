/**
 * Ephemeris Data Lookup
 * Uses actual ephemeris data from CSV files (converted to JSON)
 * Open Source Astrology Calculator
 */

import { readFileSync } from 'fs';
import { normalizeAngle } from './julianDay.js';

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

// Cache for loaded ephemeris data
const ephemerisCache = {};

/**
 * Load ephemeris data for a celestial body
 * @param {string} body - Body name (Sun, Moon, Mercury, etc.)
 * @returns {array} Ephemeris data
 */
function loadEphemerisData(body) {
  if (ephemerisCache[body]) {
    return ephemerisCache[body];
  }
  
  try {
    const filename = `data/ephemeris_${body.toLowerCase().replace(' ', '_')}.json`;
    const data = JSON.parse(readFileSync(filename, 'utf8'));
    
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
    }).filter(r => !isNaN(r.jd) && r.longitude > 0);
    
    // Sort by JD
    processed.sort((a, b) => a.jd - b.jd);
    
    ephemerisCache[body] = processed;
    return processed;
  } catch (error) {
    console.error(`Error loading ephemeris for ${body}:`, error.message);
    return [];
  }
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
    console.warn(`JD ${jd} outside ephemeris range for ${body}`);
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
