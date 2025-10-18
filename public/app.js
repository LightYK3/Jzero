/**
 * Main Application
 * Open Source Astrology Calculator Frontend
 * Uses calibrated calculator with actual ephemeris data
 */

import { calculateBirthChart, calculateAspects } from '../src/calculator-calibrated.js';

// Handle city selection
document.getElementById('city').addEventListener('change', function(e){
  if (!e.target.value) { return; }
  const [lat, lon] = e.target.value.split(',');
  if (lat && lon) {
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lon;
  }
});

// Handle form submission
document.getElementById('birthForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const useJ2000 = document.getElementById('useJ2000')?.checked === true;
  const formData = {
    year: parseInt(document.getElementById('year').value),
    month: parseInt(document.getElementById('month').value),
    day: parseInt(document.getElementById('day').value),
    hour: parseInt(document.getElementById('hour').value),
    minute: parseInt(document.getElementById('minute').value),
    second: parseInt(document.getElementById('second').value) || 0,
    latitude: parseFloat(document.getElementById('latitude').value),
    longitude: parseFloat(document.getElementById('longitude').value),
    houseSystem: document.getElementById('houseSystem').value
  };
  
  try {
    const chart = calculateBirthChart(formData);
    displayResults(chart);
  } catch (error) {
    alert('Error calculating chart: ' + error.message);
    console.error(error);
  }
});

function displayResults(chart) {
  // Show results section
  document.getElementById('results').classList.add('show');
  document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
  
  // Display birth info
  const birthInfoDiv = document.getElementById('birthInfo');
  birthInfoDiv.innerHTML = `
    <strong>Birth Date:</strong> ${chart.birthData.date} at ${chart.birthData.time}<br>
    <strong>Location:</strong> ${chart.birthData.latitude.toFixed(4)}°N, ${Math.abs(chart.birthData.longitude).toFixed(4)}°W<br>
    <strong>Julian Day:</strong> ${chart.birthData.julianDay.toFixed(5)}<br>
    <strong>House System:</strong> ${chart.houseSystem}
  `;
  
  // Display angles
  const anglesDiv = document.getElementById('angles');
  anglesDiv.innerHTML = `
    <div class="angle-card">
      <div class="angle-name">Ascendant (ASC)</div>
      <div class="angle-value">${chart.angles.ascendant.formatted}</div>
    </div>
    <div class="angle-card">
      <div class="angle-name">Midheaven (MC)</div>
      <div class="angle-value">${chart.angles.mc.formatted}</div>
    </div>
    <div class="angle-card">
      <div class="angle-name">Descendant (DSC)</div>
      <div class="angle-value">${chart.angles.descendant.formatted}</div>
    </div>
    <div class="angle-card">
      <div class="angle-name">Imum Coeli (IC)</div>
      <div class="angle-value">${chart.angles.ic.formatted}</div>
    </div>
  `;
  
  // Display planets
  const planetsDiv = document.getElementById('planets');
  planetsDiv.innerHTML = chart.planets.map(planet => `
    <div class="planet-card" style="border-left-color: ${planet.color}">
      <div class="planet-name">${planet.planet}</div>
      <div class="planet-info">${planet.formatted}</div>
      <div class="planet-info">House ${planet.house}</div>
    </div>
  `).join('');
  
  // Display houses
  const housesDiv = document.getElementById('houses');
  housesDiv.innerHTML = chart.houses.map(house => `
    <div class="house-card">
      <div class="house-number">${house.cusp}</div>
      <div>${house.formatted}</div>
    </div>
  `).join('');
}

// Initialize with example
function resetCitySelectDefault(){
  const sel = document.getElementById('city');
  if (sel) sel.selectedIndex = 0;
}

function setDefaultLatLon0(){
  const lat=document.getElementById('latitude');
  const lon=document.getElementById('longitude');
  if(lat && (!lat.value || lat.value.trim()==='')) lat.value='0';
  if(lon && (!lon.value || lon.value.trim()==='')) lon.value='0';
}

window.addEventListener('load', () => {
  console.log('🌟 Open Source Astrology Calculator loaded!');
  console.log('💜 Giving back to the community');
  const j = document.getElementById('useJ2000'); if (j) j.checked = true; setDefaultLatLon0(); resetCitySelectDefault();
});
