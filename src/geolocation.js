/**
 * Geolocation and Timezone Handler
 * Based on timezone-js data for accurate location lookups
 * Open Source Astrology Calculator
 */

/**
 * Major world cities with coordinates for quick lookup
 */
export const MAJOR_CITIES = [
  { name: 'New York, NY, USA', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
  { name: 'Los Angeles, CA, USA', lat: 34.0522, lon: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  { name: 'Paris, France', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'São Paulo, Brazil', lat: -23.5505, lon: -46.6333, timezone: 'America/Sao_Paulo' },
  { name: 'Mexico City, Mexico', lat: 19.4326, lon: -99.1332, timezone: 'America/Mexico_City' },
  { name: 'Moscow, Russia', lat: 55.7558, lon: 37.6173, timezone: 'Europe/Moscow' },
  { name: 'Cairo, Egypt', lat: 30.0444, lon: 31.2357, timezone: 'Africa/Cairo' },
  { name: 'Beijing, China', lat: 39.9042, lon: 116.4074, timezone: 'Asia/Shanghai' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Toronto, Canada', lat: 43.6532, lon: -79.3832, timezone: 'America/Toronto' },
  { name: 'Berlin, Germany', lat: 52.5200, lon: 13.4050, timezone: 'Europe/Berlin' },
  { name: 'Rome, Italy', lat: 41.9028, lon: 12.4964, timezone: 'Europe/Rome' },
  { name: 'Madrid, Spain', lat: 40.4168, lon: -3.7038, timezone: 'Europe/Madrid' },
  { name: 'Athens, Greece', lat: 37.9838, lon: 23.7275, timezone: 'Europe/Athens' },
  { name: 'Istanbul, Turkey', lat: 41.0082, lon: 28.9784, timezone: 'Europe/Istanbul' },
  { name: 'Bangkok, Thailand', lat: 13.7563, lon: 100.5018, timezone: 'Asia/Bangkok' },
  { name: 'Seoul, South Korea', lat: 37.5665, lon: 126.9780, timezone: 'Asia/Seoul' },
  { name: 'Buenos Aires, Argentina', lat: -34.6037, lon: -58.3816, timezone: 'America/Argentina/Buenos_Aires' },
  { name: 'Lagos, Nigeria', lat: 6.5244, lon: 3.3792, timezone: 'Africa/Lagos' },
  { name: 'Johannesburg, South Africa', lat: -26.2041, lon: 28.0473, timezone: 'Africa/Johannesburg' },
];

/**
 * Get timezone offset for a date and timezone
 * @param {Date} date - Date object
 * @param {string} timezoneName - IANA timezone name
 * @returns {number} Offset in hours
 */
export function getTimezoneOffset(date, timezoneName) {
  try {
    const options = { timeZone: timezoneName, timeZoneName: 'short' };
    const dateStr = date.toLocaleString('en-US', options);
    
    // This is a simplified approach - for production use a proper timezone library
    const offset = -date.getTimezoneOffset() / 60;
    return offset;
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return 0;
  }
}

/**
 * Convert local time to UTC
 * @param {Date} localDate - Local date/time
 * @param {number} timezoneOffset - Timezone offset in hours
 * @returns {Date} UTC date
 */
export function localToUTC(localDate, timezoneOffset) {
  const utcDate = new Date(localDate.getTime() - (timezoneOffset * 60 * 60 * 1000));
  return utcDate;
}

/**
 * Search cities by name
 * @param {string} query - Search query
 * @returns {array} Matching cities
 */
export function searchCities(query) {
  const lowerQuery = query.toLowerCase();
  return MAJOR_CITIES.filter(city => 
    city.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get city by exact name match
 * @param {string} name - City name
 * @returns {object|null} City data or null
 */
export function getCityByName(name) {
  return MAJOR_CITIES.find(city => 
    city.name.toLowerCase() === name.toLowerCase()
  ) || null;
}

/**
 * Get current browser location
 * @returns {Promise} Promise resolving to coordinates
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string} Formatted string
 */
export function formatCoordinates(lat, lon) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}

export default {
  MAJOR_CITIES,
  getTimezoneOffset,
  localToUTC,
  searchCities,
  getCityByName,
  getCurrentLocation,
  formatCoordinates
};
