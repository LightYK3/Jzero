/**
 * Time Corrections: ΔT, UTC, TT, DST, Parallax
 * Based on Formulas document and IAU standards
 */

/**
 * Calculate ΔT (Delta T) = TT - UT
 * Using Espenak-Meeus polynomial approximation
 * @param {number} year - Decimal year
 * @returns {number} ΔT in seconds
 */
export function calculateDeltaT(year) {
  const y = year;
  const t = (y - 2000) / 100;
  
  // Espenak-Meeus 2006 polynomial
  if (y < -500) {
    const u = (y - 1820) / 100;
    return -20 + 32 * u * u;
  } else if (y < 500) {
    const u = y / 100;
    return 10583.6 - 1014.41 * u + 33.78311 * u * u - 5.952053 * u * u * u
           - 0.1798452 * u * u * u * u + 0.022174192 * u * u * u * u * u
           + 0.0090316521 * u * u * u * u * u * u;
  } else if (y < 1600) {
    const u = (y - 1000) / 100;
    return 1574.2 - 556.01 * u + 71.23472 * u * u + 0.319781 * u * u * u
           - 0.8503463 * u * u * u * u - 0.005050998 * u * u * u * u * u
           + 0.0083572073 * u * u * u * u * u * u;
  } else if (y < 1700) {
    const t = y - 1600;
    return 120 - 0.9808 * t - 0.01532 * t * t + t * t * t / 7129;
  } else if (y < 1800) {
    const t = y - 1700;
    return 8.83 + 0.1603 * t - 0.0059285 * t * t + 0.00013336 * t * t * t
           - t * t * t * t / 1174000;
  } else if (y < 1860) {
    const t = y - 1800;
    return 13.72 - 0.332447 * t + 0.0068612 * t * t + 0.0041116 * t * t * t
           - 0.00037436 * t * t * t * t + 0.0000121272 * t * t * t * t * t
           - 0.0000001699 * t * t * t * t * t * t
           + 0.000000000875 * t * t * t * t * t * t * t;
  } else if (y < 1900) {
    const t = y - 1860;
    return 7.62 + 0.5737 * t - 0.251754 * t * t + 0.01680668 * t * t * t
           - 0.0004473624 * t * t * t * t + t * t * t * t * t / 233174;
  } else if (y < 1920) {
    const t = y - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t * t * t
           - 0.000197 * t * t * t * t;
  } else if (y < 1941) {
    const t = y - 1920;
    return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t * t * t;
  } else if (y < 1961) {
    const t = y - 1950;
    return 29.07 + 0.407 * t - t * t / 233 + t * t * t / 2547;
  } else if (y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - t * t / 260 - t * t * t / 718;
  } else if (y < 2005) {
    const t = y - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t
           + 0.000651814 * t * t * t * t + 0.00002373599 * t * t * t * t * t;
  } else if (y < 2050) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  } else if (y < 2150) {
    // Extrapolation for future
    return -20 + 32 * ((y - 1820) / 100) * ((y - 1820) / 100)
           - 0.5628 * (2150 - y);
  } else {
    const u = (y - 1820) / 100;
    return -20 + 32 * u * u;
  }
}

/**
 * Convert UTC Julian Day to TT (Terrestrial Time) Julian Day
 * @param {number} jd_utc - Julian Day in UTC
 * @param {number} year - Year for ΔT calculation
 * @returns {number} Julian Day in TT
 */
export function utcToTT(jd_utc, year) {
  const deltaT = calculateDeltaT(year);
  const deltaT_days = deltaT / 86400.0;  // Convert seconds to days
  return jd_utc + deltaT_days;
}

/**
 * Convert TT Julian Day to UTC Julian Day
 * @param {number} jd_tt - Julian Day in TT
 * @param {number} year - Year for ΔT calculation
 * @returns {number} Julian Day in UTC
 */
export function ttToUTC(jd_tt, year) {
  const deltaT = calculateDeltaT(year);
  const deltaT_days = deltaT / 86400.0;
  return jd_tt - deltaT_days;
}

/**
 * Convert local time to UTC considering timezone offset
 * DST must be handled by the user providing correct offset
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day
 * @param {number} hour - Hour (0-23) in local time
 * @param {number} minute - Minute
 * @param {number} second - Second
 * @param {number} timezoneOffset - Hours from UTC (e.g., -5 for EST, -4 for EDT)
 * @returns {object} UTC components
 */
export function localToUTC(year, month, day, hour, minute, second, timezoneOffset) {
  // Convert to decimal hours
  let utcHour = hour - timezoneOffset;
  let utcDay = day;
  let utcMonth = month;
  let utcYear = year;
  
  // Handle day overflow
  if (utcHour >= 24) {
    utcDay += 1;
    utcHour -= 24;
  } else if (utcHour < 0) {
    utcDay -= 1;
    utcHour += 24;
  }
  
  // Handle month/year overflow (simplified - for exact use proper calendar)
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (utcYear % 4 === 0 && (utcYear % 100 !== 0 || utcYear % 400 === 0)) {
    daysInMonth[1] = 29;  // Leap year
  }
  
  if (utcDay > daysInMonth[utcMonth - 1]) {
    utcDay = 1;
    utcMonth += 1;
    if (utcMonth > 12) {
      utcMonth = 1;
      utcYear += 1;
    }
  } else if (utcDay < 1) {
    utcMonth -= 1;
    if (utcMonth < 1) {
      utcMonth = 12;
      utcYear -= 1;
    }
    utcDay = daysInMonth[utcMonth - 1];
  }
  
  return {
    year: utcYear,
    month: utcMonth,
    day: utcDay,
    hour: Math.floor(utcHour),
    minute: minute,
    second: second
  };
}

/**
 * Calculate topocentric parallax correction for the Moon
 * Based on Meeus Chapter 40
 * @param {number} moonRA - Moon right ascension (degrees)
 * @param {number} moonDec - Moon declination (degrees)
 * @param {number} moonDistance - Moon distance (km)
 * @param {number} latitude - Observer latitude (degrees)
 * @param {number} longitude - Observer longitude (degrees)
 * @param {number} elevation - Observer elevation (meters)
 * @param {number} lst - Local Sidereal Time (degrees)
 * @returns {object} Parallax corrections
 */
export function calculateMoonParallax(moonRA, moonDec, moonDistance, 
                                     latitude, longitude, elevation, lst) {
  const EARTH_RADIUS = 6378.137;  // km, equatorial radius
  
  // Geocentric latitude (flattening effect)
  const f = 1 / 298.257223563;  // WGS84 flattening
  const latRad = latitude * Math.PI / 180;
  const u = Math.atan((1 - f) * Math.tan(latRad));
  
  // Observer's distance from Earth's center
  const rho_sin_phi_prime = (1 - f) * Math.sin(u) + (elevation / EARTH_RADIUS) * Math.sin(latRad);
  const rho_cos_phi_prime = Math.cos(u) + (elevation / EARTH_RADIUS) * Math.cos(latRad);
  
  // Horizontal parallax
  const pi = Math.asin(EARTH_RADIUS / moonDistance);  // radians
  
  // Hour angle
  const H = (lst - moonRA) * Math.PI / 180;
  const decRad = moonDec * Math.PI / 180;
  
  // Parallax corrections (small angle approximation)
  const delta_alpha = -pi * rho_cos_phi_prime * Math.sin(H) / Math.cos(decRad);
  const delta_delta = -pi * (rho_sin_phi_prime * Math.cos(decRad) - 
                              rho_cos_phi_prime * Math.sin(decRad) * Math.cos(H));
  
  return {
    deltaRA: delta_alpha * 180 / Math.PI,  // degrees
    deltaDec: delta_delta * 180 / Math.PI,  // degrees
    parallaxAngle: pi * 180 / Math.PI  // degrees
  };
}

/**
 * Detect if a date is likely in DST
 * This is a heuristic - proper DST handling requires timezone database
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day
 * @param {string} timezone - Timezone identifier (e.g., 'America/New_York')
 * @returns {boolean} Likely DST (heuristic only!)
 */
export function isDSTHeuristic(year, month, day, timezone = 'America/New_York') {
  // US DST rules: 2nd Sunday in March to 1st Sunday in November (since 2007)
  if (year >= 2007) {
    if (month < 3 || month > 11) return false;
    if (month > 3 && month < 11) return true;
    
    // Complex day-of-week calculation would be needed for exact DST boundaries
    // This is a simplified heuristic
    if (month === 3) return day >= 8;   // Approximate 2nd Sunday
    if (month === 11) return day <= 7;  // Approximate 1st Sunday
  }
  
  return null;  // Unknown - user must specify
}

/**
 * Get timezone offset including DST
 * Note: User should provide this explicitly for accuracy
 * @param {Date} date - JavaScript Date object in local time
 * @returns {number} Offset in hours from UTC
 */
export function getTimezoneOffsetHours(date) {
  return -date.getTimezoneOffset() / 60;
}

export default {
  calculateDeltaT,
  utcToTT,
  ttToUTC,
  localToUTC,
  calculateMoonParallax,
  isDSTHeuristic,
  getTimezoneOffsetHours
};
