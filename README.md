````markdown
# � JZero - Open Source Astrology Engine

**Free, open-source astrology calculation engine for everyone.**

Built on J2000, this engine provides accurate calculations for Moon positions, house cusps, and chart angles. Perfect for astrology enthusiasts, developers, and anyone interested in astrological computations.

## ⚡ Quick Start

```bash
# Clone
git clone <your-repo>
cd astrocalc-framework

# Run example - works immediately!
python3 -m http.server 8000
open http://localhost:8000/public/index.html
```

## ✅ What Works Right Now

**No setup needed - these work immediately:**

- ✅ **Moon positions** (±1-2° accuracy using ELP2000)
- ✅ **House cusps** (Porphyry, Whole Sign, Equal)
- ✅ **Chart angles** (ASC, MC, DSC, IC)
- ✅ **Time corrections** (J2000, ΔT, UTC/TT)
- ✅ **Geolocation** (city database, coordinates)

**Perfect for:**
- Learning how astrology calculations work
- Building and testing house system logic
- Lunar phase calculations
- Moon sign calculators
- Educational projects
- Prototyping before adding full ephemeris

## 🚀 Add Swiss Ephemeris for Other Planets

Want Mercury through Pluto? Easy:

```bash
npm install swisseph
```

See `INTEGRATION_GUIDE.md` for complete integration (takes ~30 minutes).

---

## 📦 What This Framework Provides

### ✅ Working Components

1. **Time Systems** (`src/julianDay.js`, `src/time-corrections.js`)
   - Julian Day conversions
   - J2000.0 reference epoch (JD 2451545.0)
   - ΔT correction (TT-UTC)
   - Timezone handling
   - DST support

2. **House Systems** (`src/houses.js`)
   - Porphyry (quadrant trisection)
   - Whole Sign (ancient method)
   - Equal House (30° divisions)

3. **Chart Angles** (`src/houses.js`)
   - Ascendant (ASC)
   - Midheaven (MC)
   - Descendant (DSC)
   - Imum Coeli (IC)

4. **Ephemeris Data** (`data/`)
   - CSV files for all major planets
   - Date range: 1950-2050
   - Includes: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto

5. **Geolocation** (`src/geolocation.js`)
   - City database
   - Coordinate formatting
   - Timezone helpers

### 🎯 What You Can Build Right Now

**Without any additional setup:**

✅ **Moon Sign Calculator**
- Accurate Moon positions for any date 1950-2050
- Perfect for "What's my Moon sign?" apps

✅ **House System Calculator**  
- Calculate Ascendant, MC, and all house cusps
- Compare different house systems
- Educational tools

✅ **Lunar Calendar**
- Moon phase calculations
- Lunar returns
- Void of course Moon

✅ **Chart Skeleton**
- Full chart structure with houses and angles
- Moon position included
- Ready to add planets via Swiss Ephemeris

### 🌍 For Other Planets

The included CSV files have **sign ingress data** (when planets change signs) - useful for showing data structure, but not for calculating daily positions.

**For accurate Sun, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto:**
- Integrate Swiss Ephemeris (see `INTEGRATION_GUIDE.md`)
- Takes ~30 minutes
- Industry standard, professional accuracy

---

## 🚀 Basic Usage

```javascript
import { dateToJulianDayTT } from './src/julianDay.js';
import { calculateHouses } from './src/houses.js';

// Calculate Julian Day with time corrections
const jdData = dateToJulianDayTT(2000, 1, 1, 12, 0, 0);
console.log('JD (TT):', jdData.jd_tt);
console.log('ΔT:', jdData.deltaT, 'seconds');

// Calculate house cusps
const houses = calculateHouses(
  jdData.jd_tt,
  41.12,  // latitude
  -73.41, // longitude
  'porphyry'
);

console.log('ASC:', houses.ascendant);
console.log('MC:', houses.mc);
console.log('Houses:', houses.houses);
```

---

## 📁 Project Structure

```
astrocalc-framework/
├── src/
│   ├── julianDay.js         # Time conversions
│   ├── time-corrections.js  # ΔT, UTC/TT
│   ├── houses.js            # House systems
│   ├── geolocation.js       # Location helpers
│   ├── planets.js           # Zodiac conversions
│   └── calculator.js        # Basic chart structure
├── data/
│   ├── Ephem_Sun_1950_2050.csv
│   ├── Ephem_Moon_1950_2050.csv
│   └── ... (all planets)
├── public/
│   ├── index.html           # Basic web interface
│   └── app.js               # Frontend code
└── README.md
```

---

## 🎓 What You'll Learn

By using/extending this framework, you'll understand:
- How Julian Day calculations work
- Why ΔT correction matters
- How house systems differ mathematically
- The structure of astrological calculations
- How to integrate ephemeris data

---

## 🤝 Contributing

**This is an open-source project - you're free to work on it!**

Contributions welcome:

- ✨ Swiss Ephemeris integration examples
- ✨ Additional house systems (Placidus, Koch, Regiomontanus)
- ✨ Aspect calculations
- ✨ Transit calculations
- ✨ Progression algorithms
- ✨ Better documentation
- ✨ Test coverage
- ✨ Bug fixes
- ✨ Example applications

**Fork it, improve it, submit a PR!**

This is community infrastructure - make it better for everyone.

---

## 📊 Accuracy & Range

### What's Production-Ready

- ✅ **Moon:** ±1-2° accuracy (good for Moon sign, phase, general position)
- ✅ **Houses:** Professional accuracy (exact calculations)
- ✅ **Angles:** Professional accuracy (ASC, MC, DSC, IC)
- ✅ **Time:** Professional accuracy (ΔT corrections, J2000 calibration)

### Date Range

**Moon Calculator:** Any date (formulas work indefinitely)
**CSV Data:** 1950-2050 (for reference/structure)

### Adding Swiss Ephemeris

- ⭐ **All Planets:** ±0.001° accuracy (professional grade)
- ⭐ **Date Range:** 1800-2399+ (with standard files)
- ⭐ **Speed:** Very fast (local calculations)

See `INTEGRATION_GUIDE.md` for setup.

---

## 📜 License

MIT License - Free to use, modify, and distribute.

---

## 🎯 Philosophy

This project believes in:
- **Honesty**: Clear about limitations
- **Education**: Teach how calculations work
- **Community**: Open source, collaborative
- **Quality**: Accurate time math, clean code
- **Extensibility**: Easy to add features

**We give you the foundation. You build the calculator.**

---

## 🙏 Acknowledgments

- Time correction formulas: Espenak-Meeus 2006
- House systems: Classical astronomical formulas
- Ephemeris data: Provided CSV files (1950-2050)

---

**Built with 💜 for the astrology developer community**

*"Start with a solid foundation, build what you need."*


### J2000 Calibration (Default Base)

If you call the calculator without a date, or pass `{ useJ2000: true }`, the engine computes at the **J2000.0** epoch.

- **Epoch:** J2000.0 (TT)
- **Julian Day (base number):** `2451545.0`

```js
// Example: compute precisely at J2000.0
import { calculateBirthChart } from './src/calculator-calibrated.js';

const chart = calculateBirthChart({
  latitude: 0,
  longitude: 0,
  houseSystem: 'porphyry',
  useJ2000: true
});
```
