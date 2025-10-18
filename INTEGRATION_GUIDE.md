# 🔧 Integration Guide - Adding Swiss Ephemeris

## The Problem

This framework includes CSV ephemeris files, but they only contain **sign ingress data** (when planets change signs). This is NOT sufficient for accurate chart calculations.

## The Solution: Swiss Ephemeris

Swiss Ephemeris is the **industry standard** for astronomical calculations in astrology software.

### Why Swiss Ephemeris?

- ✅ Arcminute accuracy (±0.001°)
- ✅ Industry standard
- ✅ Used by all professional astrology software
- ✅ Open source (AGPL/GPL or commercial license)
- ✅ Well-documented
- ✅ Very fast (local calculations)

---

## 📦 Installation

### 1. Install the npm package

```bash
npm install swisseph
```

### 2. Download ephemeris data files

```bash
mkdir ephe
cd ephe

# Download from https://www.astro.com/ftp/swisseph/ephe/
wget https://www.astro.com/ftp/swisseph/ephe/seas_18.se1  # Main planets
wget https://www.astro.com/ftp/swisseph/ephe/semo_18.se1  # Moon
wget https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1  # Outer planets
```

**Note:** These files cover years 1800-2399. Download additional files for extended ranges.

---

## 💻 Integration Code

### Basic Setup

```javascript
import swisseph from 'swisseph';

// Set ephemeris data path
swisseph.swe_set_ephe_path('./ephe');

// Planet IDs
const PLANETS = {
  Sun: swisseph.SE_SUN,
  Moon: swisseph.SE_MOON,
  Mercury: swisseph.SE_MERCURY,
  Venus: swisseph.SE_VENUS,
  Mars: swisseph.SE_MARS,
  Jupiter: swisseph.SE_JUPITER,
  Saturn: swisseph.SE_SATURN,
  Uranus: swisseph.SE_URANUS,
  Neptune: swisseph.SE_NEPTUNE,
  Pluto: swisseph.SE_PLUTO
};
```

### Calculate Planet Position

```javascript
function calculatePlanetPosition(planetName, jd_tt) {
  const planetId = PLANETS[planetName];
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
  
  const result = swisseph.swe_calc(jd_tt, planetId, flags);
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return {
    longitude: result.longitude,
    latitude: result.latitude,
    distance: result.distance,
    speed: result.longitudeSpeed
  };
}
```

### Usage Example

```javascript
import { dateToJulianDayTT } from './src/julianDay.js';

// Get Julian Day with time corrections
const jdData = dateToJulianDayTT(2000, 1, 1, 12, 0, 0);

// Calculate planet position
const mercury = calculatePlanetPosition('Mercury', jdData.jd_tt);

console.log('Mercury longitude:', mercury.longitude.toFixed(4), '°');
console.log('Mercury latitude:', mercury.latitude.toFixed(4), '°');
console.log('Mercury distance:', mercury.distance.toFixed(6), 'AU');
```

### Full Chart Calculation

```javascript
function calculateChart(date, time, latitude, longitude) {
  // Convert to Julian Day
  const jdData = dateToJulianDayTT(
    date.year, date.month, date.day,
    time.hour, time.minute, time.second
  );
  
  // Calculate all planets
  const planets = {};
  for (const [name, id] of Object.entries(PLANETS)) {
    planets[name] = calculatePlanetPosition(name, jdData.jd_tt);
  }
  
  // Calculate houses (using framework's house system)
  const houses = calculateHouses(jdData.jd_tt, latitude, longitude, 'porphyry');
  
  return {
    planets,
    houses,
    jd: jdData.jd_tt,
    deltaT: jdData.deltaT
  };
}
```

---

## 📚 Resources

- **Swiss Ephemeris Official Site:** https://www.astro.com/swisseph/
- **Ephemeris Files:** https://www.astro.com/ftp/swisseph/ephe/
- **Documentation:** https://www.astro.com/swisseph/swephprg.htm
- **npm Package:** https://www.npmjs.com/package/swisseph

---

## 🤝 Want to Contribute?

**This is an open-source project!**

You're free to:
- Fork and modify for your needs
- Submit pull requests
- Add features
- Improve documentation
- Report bugs
- Share improvements

We'd love to see:
- Complete Swiss Ephemeris integration examples
- Additional house systems
- Aspect calculations
- Transit calculations
- Better test coverage

**Open an issue or PR on GitHub to contribute!**

---

## 📄 License Note

**Swiss Ephemeris Licensing:**
- **AGPL/GPL:** Free for open-source projects
- **Commercial License:** Required for closed-source commercial use

See https://www.astro.com/swisseph/swephinfo_e.htm for details.

---

**Questions? Open an issue on GitHub!**
