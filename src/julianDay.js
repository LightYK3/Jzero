/**
 * Julian Day Calculator
 * Based on Meeus Astronomical Algorithms
 * Includes UTC/TT corrections and J2000 reference
 * Open Source Astrology Calculator
 */

import { calculateDeltaT, utcToTT } from './time-corrections.js';

/**
 * Convert Gregorian calendar date to Julian Day Number (UTC)
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day of month
 * @param {number} hour - Hour (0-23) in UTC
 * @param {number} minute - Minute (0-59)
 * @param {number} second - Second (0-59)
 * @returns {number} Julian Day Number in UTC
 */
export function dateToJulianDay(year, month, day, hour = 12, minute = 0, second = 0) {
  // Convert time to decimal day
  const decimalDay = day + (hour + (minute + second / 60) / 60) / 24;
  
  // Adjust for January and February
  let y = year;
  let m = month;
  if (m <= 2) {
    y = y - 1;
    m = m + 12;
  }
  
  // Calculate Gregorian calendar correction
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  
  // Calculate Julian Day (UTC)
  const JD_UTC = Math.floor(365.25 * (y + 4716)) + 
                 Math.floor(30.6001 * (m + 1)) + 
                 decimalDay + B - 1524.5;
  
  return JD_UTC;
}

/**
 * Convert Gregorian calendar date to Julian Day in TT (Terrestrial Time)
 * This is what should be used for planetary calculations
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day of month
 * @param {number} hour - Hour (0-23) in UTC
 * @param {number} minute - Minute (0-59)
 * @param {number} second - Second (0-59)
 * @returns {object} { jd_utc, jd_tt, deltaT }
 */
export function dateToJulianDayTT(year, month, day, hour = 12, minute = 0, second = 0) {
  const jd_utc = dateToJulianDay(year, month, day, hour, minute, second);
  const deltaT = calculateDeltaT(year);
  const jd_tt = utcToTT(jd_utc, year);
  
  return {
    jd_utc: jd_utc,
    jd_tt: jd_tt,
    deltaT: deltaT,
    deltaT_days: deltaT / 86400.0
  };
}

/**
 * Convert Julian Day to Gregorian calendar date
 * @param {number} jd - Julian Day Number
 * @returns {object} Date components
 */
export function julianDayToDate(jd) {
  const Z = Math.floor(jd + 0.5);
  const F = (jd + 0.5) - Z;
  
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  
  const day = B - D - Math.floor(30.6001 * E) + F;
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  
  const decimalDay = day - Math.floor(day);
  const hours = decimalDay * 24;
  const minutes = (hours - Math.floor(hours)) * 60;
  const seconds = (minutes - Math.floor(minutes)) * 60;
  
  return {
    year: year,
    month: month,
    day: Math.floor(day),
    hour: Math.floor(hours),
    minute: Math.floor(minutes),
    second: Math.floor(seconds)
  };
}

/**
 * Calculate Julian Centuries from J2000.0
 * NOTE: This should use JD in TT (Terrestrial Time) for accurate calculations
 * @param {number} jd - Julian Day Number (should be in TT for planetary calculations)
 * @returns {number} Julian Centuries (T)
 */
export function julianCenturies(jd) {
  // J2000.0 = JD 2451545.0 (January 1, 2000, 12:00 TT)
  return (jd - 2451545.0) / 36525.0;
}

/**
 * Calculate Greenwich Mean Sidereal Time (GMST) in degrees
 * @param {number} jd - Julian Day Number
 * @returns {number} GMST in degrees
 */
export function calculateGMST(jd) {
  const T = julianCenturies(jd);
  
  // GMST at 0h UT
  let gmst = 280.46061837 + 
             360.98564736629 * (jd - 2451545.0) + 
             0.000387933 * T * T - 
             T * T * T / 38710000.0;
  
  // Normalize to 0-360
  return normalizeAngle(gmst);
}

/**
 * Calculate Local Sidereal Time (LST)
 * @param {number} jd - Julian Day Number
 * @param {number} longitude - Observer longitude in degrees (east positive)
 * @returns {number} LST in degrees
 */
export function calculateLST(jd, longitude) {
  const gmst = calculateGMST(jd);
  const lst = gmst + longitude;
  return normalizeAngle(lst);
}

/**
 * Normalize angle to 0-360 range
 * @param {number} angle - Angle in degrees
 * @returns {number} Normalized angle
 */
export function normalizeAngle(angle) {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radiansToDegrees(radians) {
  return radians * 180 / Math.PI;
}

/**
 * Calculate mean obliquity of the ecliptic (Laskar/Meeus)
 * @param {number} jd - Julian Day Number
 * @returns {number} Obliquity in degrees
 */
export function calculateObliquity(jd) {
  const T = julianCenturies(jd);
  
  // Mean obliquity in arcseconds
  const epsilon = 84381.406 - 
                  46.836769 * T - 
                  0.0001831 * T * T + 
                  0.00200340 * T * T * T - 
                  0.000000576 * T * T * T * T - 
                  0.0000000434 * T * T * T * T * T;
  
  // Convert to degrees
  return epsilon / 3600.0;
}

export default {
  dateToJulianDay,
  dateToJulianDayTT,
  julianDayToDate,
  julianCenturies,
  calculateGMST,
  calculateLST,
  normalizeAngle,
  degreesToRadians,
  radiansToDegrees,
  calculateObliquity
};
