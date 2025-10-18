# Calibration: J2000.0 Default

This project now uses **J2000.0** as the default calibration epoch when no birth data is supplied.

- **Epoch:** J2000.0 (TT)  
- **Julian Day:** `2451545.0` (12:00:00 Terrestrial Time on 2000-01-01)
- **Why:** avoids personal-data defaults, provides a universal astronomical reference, and makes test cases reproducible.
- **How:** if you call the calculator without a date/time, it injects `jd = 2451545.0`. If you pass civil time, it will compute JD from your input normally.
- **Override:** pass `opts.jd` explicitly to calibrate at any epoch.

