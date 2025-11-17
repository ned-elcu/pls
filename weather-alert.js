// =============================================================================
// WEATHER ALERT SYSTEM v4.0 - Municipal Weather & Emergency Monitoring
// Poliția Locală Slobozia | Production-Ready | Optimized & Symmetrical
// =============================================================================

// === CONFIGURATION ===
const CONFIG = {
    coordinates: { lat: 44.5667, lon: 27.3667 },
    location: 'Slobozia, Ialomița',
    apiUrl: 'https://api.open-meteo.com/v1/forecast',
    updateInterval: 5 * 60 * 1000, // 5 minutes
    emergencyAPIs: {
        earthquake: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
        airQuality: 'https://api.openweathermap.org/data/2.5/air_pollution',
        airQualityKey: 'e815f9edc2ed7da7912339b43ef2fec8' // Replace with your key
    },
    thresholds: {
        earthquake: { minor: 3.0, moderate: 4.5, major: 6.0, radius: 100 },
        airQuality: { moderate: 60, unhealthy: 155, dangerous: 300 },
        temperature: { cold: -10, hot: 38 },
        wind: { strong: 40, severe: 60 }
    }
};

const WEATHER_CONDITIONS = {
    0: { icon: 'wb_sunny', name: 'Senin', anim: 'sunny' },
    1: { icon: 'wb_cloudy', name: 'Parțial înnorat', anim: 'cloudy' },
    2: { icon: 'wb_cloudy', name: 'Parțial înnorat', anim: 'cloudy' },
    3: { icon: 'cloud', name: 'Înnorat', anim: 'cloudy' },
    45: { icon: 'foggy', name: 'Ceață', anim: 'foggy', advice: 'visibility' },
    48: { icon: 'foggy', name: 'Ceață cu chiciură', anim: 'foggy', advice: 'ice' },
    51: { icon: 'grain', name: 'Burniță ușoară', anim: 'drizzle' },
    53: { icon: 'grain', name: 'Burniță moderată', anim: 'drizzle', advice: 'rain' },
    55: { icon: 'grain', name: 'Burniță densă', anim: 'drizzle', advice: 'rain' },
    61: { icon: 'water_drop', name: 'Ploaie ușoară', anim: 'rainy' },
    63: { icon: 'water_drop', name: 'Ploaie moderată', anim: 'rainy', advice: 'rain' },
    65: { icon: 'water_drop', name: 'Ploaie torențială', anim: 'heavy-rain', advice: 'heavy_rain' },
    71: { icon: 'ac_unit', name: 'Ninsoare ușoară', anim: 'snowy', advice: 'snow' },
    73: { icon: 'ac_unit', name: 'Ninsoare moderată', anim: 'snowy', advice: 'snow' },
    75: { icon: 'ac_unit', name: 'Ninsoare abundentă', anim: 'heavy-snow', advice: 'heavy_snow' },
    80: { icon: 'water_drop', name: 'Averse ușoare', anim: 'rainy', advice: 'rain' },
    81: { icon: 'water_drop', name: 'Averse moderate', anim: 'rainy', advice: 'heavy_rain' },
    82: { icon: 'water_drop', name: 'Averse violente', anim: 'heavy-rain', advice: 'heavy_rain' },
    85: { icon: 'ac_unit', name: 'Averse de zăpadă', anim: 'snowy', advice: 'heavy_snow' },
    95: { icon: 'thunderstorm', name: 'Furtună', anim: 'thunderstorm', advice: 'storm' },
    96: { icon: 'thunderstorm', name: 'Furtună cu grindină', anim: 'severe-storm', advice: 'severe_storm' },
    99: { icon: 'thunderstorm', name: 'Furtună severă', anim: 'severe-storm', advice: 'severe_storm' }
};

const SAFETY_ADVICE = {
    visibility: { level: 'advisory', title: 'ATENȚIE - VIZIBILITATE REDUSĂ', 
        tips: ['Conduceți cu atenție sporită', 'Folosiți farurile', 'Păstrați distanța de siguranță'] },
    rain: { level: 'advisory', title: 'ATENȚIE - PRECIPITAȚII',
        tips: ['Atenție la carosabilul umed', 'Folosiți umbrela', 'Evitați zonele cu băltire'] },
    heavy_rain: { level: 'warning', title: 'AVERTIZARE PLOAIE',
        tips: ['Evitați deplasările neesențiale', 'Nu traversați zonele inundate', 'Aveți la îndemână numerele de urgență'] },
    snow: { level: 'advisory', title: 'ATENȚIE - NINSOARE',
        tips: ['Echipați vehiculele pentru iarnă', 'Atenție la drumurile alunecoase', 'Purtați încălțăminte adecvată'] },
    heavy_snow: { level: 'warning', title: 'AVERTIZARE NINSOARE',
        tips: ['Evitați călătoriile neesențiale', 'Pregătiți vehiculele', 'Curățați zăpada de pe acoperișuri'] },
    ice: { level: 'warning', title: 'ATENȚIE - SUPRAFEȚE ÎNGHEȚATE',
        tips: ['Mișcați-vă cu atenție extremă', 'Folosiți încălțăminte antiderapantă', 'Verificați conductele'] },
    storm: { level: 'warning', title: 'AVERTIZARE FURTUNĂ',
        tips: ['Rămâneți în interior', 'Evitați zonele cu copaci', 'Deconectați aparatele electrice'] },
    severe_storm: { level: 'critical', title: 'ALERTĂ FURTUNĂ SEVERĂ',
        tips: ['RĂMÂNEȚI ÎN INTERIOR OBLIGATORIU', 'Adăpostiți-vă într-o cameră interioară', 'Apelați 112 în caz de urgență'] },
    extreme_cold: { level: 'critical', title: 'ALERTĂ GER SEVER',
        tips: ['Limitați timpul în exterior', 'Îmbrăcați-vă în straturi multiple', 'Verificați persoanele vulnerabile'] },
    extreme_heat: { level: 'critical', title: 'ALERTĂ CANICULĂ',
        tips: ['Rămâneți în spații climatizate', 'Hidratați-vă frecvent', 'Verificați persoanele în vârstă'] },
    high_winds: { level: 'warning', title: 'AVERTIZARE VÂNT PUTERNIC',
        tips: ['Fixați obiectele din curte', 'Evitați deplasarea pe jos', 'Atenție la căderea crengilor'] }
};

const ROMANIAN = {
    loading: 'Se încarcă...',
    error: 'Eroare conexiune',
    expand: 'Extinde informații',
    collapse: 'Restrânge informații',
    accessibility: 'Comutare vizibilitate îmbunătățită',
    emergency: 'Urgențe: 112 | Poliția Locală: (0243) 955',
    locked: 'Alertă de urgență'
};

// === CSS INJECTION ===
function injectCSS() {
    if (document.getElementById('weather-alert-css')) return;
    
    const css = `
/* Weather Alert System v4.0 - Symmetrical & Optimized */
.weather-alert {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 280px;
    min-height: 70px;
    background: rgba(26, 47, 95, 0.92);
    backdrop-filter: blur(12px);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    opacity: 0;
    transform: translateY(100%);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.weather-alert.visible { opacity: 1; transform: translateY(0); }
.weather-alert.hidden { opacity: 0; pointer-events: none; }
.weather-alert.expanded { width: 340px; min-height: 140px; }

/* Alert Levels */
.weather-alert.advisory { border-left: 4px solid #ffa726; }
.weather-alert.warning { border-left: 4px solid #ff7043; }
.weather-alert.critical { border-left: 4px solid #e53935; animation: pulse 3s infinite; }
.weather-alert.emergency { border: 3px solid #ff0000; animation: emergency 1.5s infinite; }

/* Layout - Symmetrical Padding */
.weather-content { padding: 12px; padding-right: 44px; position: relative; }

/* Control Buttons - Right Aligned */
.weather-controls {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.weather-btn {
    width: 30px;
    height: 30px;
    background: rgba(255, 255, 255, 0.95);
    border: none;
    border-radius: 50%;
    color: #1a2f5f;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.weather-btn:hover { transform: scale(1.1); background: #fff; }
.weather-btn:active { transform: scale(0.95); }
.weather-btn:focus { outline: 3px solid #ffff00; outline-offset: 2px; }
.weather-btn.active { background: #ffff00; box-shadow: 0 0 8px rgba(255, 255, 0, 0.6); }
.weather-btn.locked { background: rgba(255, 107, 0, 0.3); border: 2px solid #ff6b00; }

.weather-btn i { font-size: 16px; line-height: 1; }

/* Alert Header - Centered */
.weather-alert-header {
    display: none;
    text-align: center;
    padding: 8px 0;
    margin: -12px -12px 12px -12px;
    padding-right: 44px;
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.weather-alert-header.visible { display: block; }

.weather-alert-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
}

/* Weather Info - Left Aligned */
.weather-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.weather-icon-box {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.weather-icon {
    font-size: 24px;
    color: #e3f2fd;
    font-family: 'Material Icons';
}

.weather-text { flex: 1; min-width: 0; }

.weather-temp-condition {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 4px;
}

.weather-temp {
    font-size: 20px;
    font-weight: 600;
    line-height: 1;
}

.weather-condition {
    font-size: 13px;
    opacity: 0.9;
}

.weather-location {
    font-size: 11px;
    opacity: 0.7;
}

/* Emergency Layout - Centered Content */
.emergency-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.emergency-icon { font-size: 24px; animation: emergencyPulse 2s infinite; }

.emergency-title {
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.emergency-data {
    display: flex;
    justify-content: space-around;
    margin: 12px 0;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
}

.emergency-data-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.emergency-data-label {
    font-size: 9px;
    text-transform: uppercase;
    opacity: 0.7;
}

.emergency-data-value {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;
}

/* Activity Icons - Equal Spacing */
.activity-row {
    display: flex;
    justify-content: space-around;
    margin: 12px 0;
    padding: 8px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 6px;
}

.activity-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 40px;
}

.activity-icon {
    font-size: 18px;
    color: #555;
}

.activity-status {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 900;
    border: 2px solid;
}

.activity-status.ok { border-color: #00c853; color: #00c853; background: #e8f5e8; }
.activity-status.limited { border-color: #ff9800; color: #ff9800; background: #fff3e0; }
.activity-status.caution { border-color: #ffeb3b; color: #f57c00; background: #fffde7; }
.activity-status.no { border-color: #f44336; color: #f44336; background: #ffebee; }
.activity-status.danger { border-color: #9c27b0; color: #9c27b0; background: #f3e5f5; animation: dangerPulse 1s infinite; }

.activity-label {
    font-size: 7px;
    text-transform: uppercase;
    color: #333;
    font-weight: 700;
    letter-spacing: 0.3px;
}

/* Weather Summary - Centered */
.weather-summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 8px 0;
    padding: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-size: 11px;
}

.weather-summary i { font-size: 16px; }

/* Safety Tips - Left Aligned */
.weather-tips {
    display: none;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.weather-tips.visible { display: block; }

.weather-tips ul {
    margin: 0;
    padding: 0;
    list-style: none;
}

.weather-tips li {
    font-size: 12px;
    margin-bottom: 6px;
    padding-left: 16px;
    position: relative;
    line-height: 1.4;
}

.weather-tips li:before {
    content: '•';
    color: #ffca28;
    position: absolute;
    left: 0;
    font-weight: bold;
}

/* Emergency Contact - Centered */
.weather-emergency {
    display: none;
    margin-top: 12px;
    padding: 8px;
    background: rgba(229, 57, 53, 0.2);
    border-radius: 4px;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
}

.weather-emergency.visible { display: block; }

/* Update Indicator */
.weather-update {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 6px;
    height: 6px;
    background: #4caf50;
    border-radius: 50%;
    opacity: 0;
}

.weather-update.flash { animation: flash 1s ease-out; }

/* Accessibility - High Contrast */
.weather-alert.high-contrast {
    background: #000 !important;
    border: 3px solid #fff !important;
    box-shadow: 0 0 0 3px #ffff00 !important;
}

.weather-alert.high-contrast * { color: #fff !important; }

.weather-alert.high-contrast .weather-btn {
    background: #fff !important;
    color: #000 !important;
    border: 2px solid #ffff00 !important;
}

.weather-alert.high-contrast .weather-btn:hover {
    background: #ffff00 !important;
}

.weather-alert.high-contrast .activity-row,
.weather-alert.high-contrast .emergency-data {
    background: #333 !important;
    border: 2px solid #fff !important;
}

.weather-alert.high-contrast .activity-item {
    background: #fff !important;
}

.weather-alert.high-contrast .activity-label {
    color: #000 !important;
}

/* Font Scaling */
.weather-alert.font-scale-2 { font-size: 16px; }
.weather-alert.font-scale-3 { font-size: 18px; }
.weather-alert.font-scale-4 { font-size: 20px; }

/* Weather Animations */
@keyframes sunny { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.weather-icon.sunny { animation: sunny 30s linear infinite; }

@keyframes rainy { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(-2px); opacity: 0.8; } }
.weather-icon.rainy { animation: rainy 2s ease-in-out infinite; }

@keyframes heavy-rain { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
.weather-icon.heavy-rain { animation: heavy-rain 1.5s ease-in-out infinite; }

@keyframes snowy { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-1px) rotate(5deg); } 75% { transform: translateY(1px) rotate(-5deg); } }
.weather-icon.snowy { animation: snowy 4s ease-in-out infinite; }

@keyframes heavy-snow { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-1px); } 75% { transform: translateX(1px); } }
.weather-icon.heavy-snow { animation: heavy-snow 2s ease-in-out infinite; }

@keyframes thunderstorm { 0%, 90%, 100% { opacity: 1; } 5%, 85% { opacity: 0.3; } }
.weather-icon.thunderstorm { animation: thunderstorm 2s ease-in-out infinite; }

@keyframes severe-storm { 0%, 85%, 100% { opacity: 1; transform: scale(1); } 5%, 80% { opacity: 0.4; transform: scale(1.1); } }
.weather-icon.severe-storm { animation: severe-storm 1s ease-in-out infinite; }

@keyframes cloudy { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(1px); } }
.weather-icon.cloudy { animation: cloudy 8s ease-in-out infinite; }

@keyframes drizzle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1px); } }
.weather-icon.drizzle { animation: drizzle 3s ease-in-out infinite; }

@keyframes foggy { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
.weather-icon.foggy { animation: foggy 6s ease-in-out infinite; }

/* Alert Animations */
@keyframes pulse { 0%, 100% { box-shadow: 0 4px 20px rgba(229, 57, 53, 0.3); } 50% { box-shadow: 0 4px 25px rgba(229, 57, 53, 0.6); } }

@keyframes emergency { 0%, 100% { border-color: #ff0000; } 50% { border-color: #fff; } }

@keyframes emergencyPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }

@keyframes dangerPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }

@keyframes flash { 0% { opacity: 0; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0; transform: scale(1); } }

/* Responsive */
@media (max-width: 768px) {
    .weather-alert { bottom: 10px; right: 10px; width: 240px; min-height: 55px; }
    .weather-alert.expanded { width: 280px; }
    .weather-content { padding: 8px; padding-right: 38px; }
    .weather-icon-box { width: 40px; height: 40px; }
    .weather-icon { font-size: 20px; }
    .weather-temp { font-size: 18px; }
    .weather-btn { width: 26px; height: 26px; }
    .weather-btn i { font-size: 14px; }
}

@media (prefers-reduced-motion: reduce) {
    .weather-alert, .weather-icon, * { animation: none !important; transition: opacity 0.3s ease !important; }
}
    `;
    
    const style = document.createElement('style');
    style.id = 'weather-alert-css';
    style.textContent = css;
    document.head.appendChild(style);
}

// === HTML TEMPLATES ===
function createCompactHTML(data) {
    const condition = WEATHER_CONDITIONS[data.weatherCode] || WEATHER_CONDITIONS[0];
    return `
        <div class="weather-controls">
            <button class="weather-btn accessibility-btn" title="${ROMANIAN.accessibility}" aria-label="${ROMANIAN.accessibility}">
                <i class="material-icons">visibility_off</i>
            </button>
            <button class="weather-btn expand-btn" title="${ROMANIAN.expand}" aria-label="${ROMANIAN.expand}">
                <i class="material-icons">expand_more</i>
            </button>
        </div>
        <div class="weather-content">
            <div class="weather-alert-header">
                <h3 class="weather-alert-title"></h3>
            </div>
            <div class="weather-info">
                <div class="weather-icon-box">
                    <i class="material-icons weather-icon ${condition.anim}">${condition.icon}</i>
                </div>
                <div class="weather-text">
                    <div class="weather-temp-condition">
                        <div class="weather-temp">${data.temp}°C</div>
                        <div class="weather-condition">${condition.name}</div>
                    </div>
                    <div class="weather-location">${CONFIG.location}</div>
                </div>
            </div>
            <div class="weather-tips"></div>
            <div class="weather-emergency">${ROMANIAN.emergency}</div>
            <div class="weather-update"></div>
        </div>
    `;
}

function createEmergencyHTML(data) {
    const { type, title, emergencyData, activities, icon } = data;
    
    let dataHTML = '';
    if (type === 'earthquake') {
        dataHTML = `
            <div class="emergency-data">
                <div class="emergency-data-item">
                    <div class="emergency-data-label">Magnitudine</div>
                    <div class="emergency-data-value">M${emergencyData.magnitude}</div>
                </div>
                <div class="emergency-data-item">
                    <div class="emergency-data-label">Distanță</div>
                    <div class="emergency-data-value">${emergencyData.distance} km</div>
                </div>
                <div class="emergency-data-item">
                    <div class="emergency-data-label">Timp</div>
                    <div class="emergency-data-value">${emergencyData.time}</div>
                </div>
            </div>
        `;
    } else if (type === 'airQuality') {
        dataHTML = `
            <div class="emergency-data">
                <div class="emergency-data-item">
                    <div class="emergency-data-label">AQI</div>
                    <div class="emergency-data-value">${emergencyData.aqi}</div>
                </div>
                <div class="emergency-data-item">
                    <div class="emergency-data-label">PM2.5</div>
                    <div class="emergency-data-value">${emergencyData.pm25} μg/m³</div>
                </div>
                <div class="emergency-data-item">
                    <div class="emergency-data-label">Nivel</div>
                    <div class="emergency-data-value">${getAQILevel(emergencyData.aqi)}</div>
                </div>
            </div>
        `;
    }
    
    let activitiesHTML = '';
    if (activities) {
        const activityMap = {
            outdoor_sports: { icon: 'sports_soccer', label: 'SPORT' },
            cycling: { icon: 'directions_bike', label: 'BICICLETĂ' },
            bring_baby_out: { icon: 'child_friendly', label: 'COPII' },
            eating_outside: { icon: 'restaurant', label: 'TERASĂ' },
            windows_open: { icon: 'sensor_window', label: 'FERESTRE' }
        };
        
        const statusIcon = {
            ok: 'check_circle',
            limited: 'warning',
            caution: 'error',
            no: 'cancel',
            danger: 'dangerous'
        };
        
        activitiesHTML = '<div class="activity-row">';
        Object.entries(activities).forEach(([key, status]) => {
            const activity = activityMap[key];
            if (activity) {
                activitiesHTML += `
                    <div class="activity-item">
                        <i class="material-icons activity-icon">${activity.icon}</i>
                        <div class="activity-status ${status}">
                            <i class="material-icons">${statusIcon[status]}</i>
                        </div>
                        <div class="activity-label">${activity.label}</div>
                    </div>
                `;
            }
        });
        activitiesHTML += '</div>';
    }
    
    // Get current weather summary
    const weatherSummary = window.weatherSystem?.currentData ? 
        `<div class="weather-summary">
            <i class="material-icons">${WEATHER_CONDITIONS[window.weatherSystem.currentData.weatherCode]?.icon || 'wb_sunny'}</i>
            <span>${window.weatherSystem.currentData.temp}°C | ${WEATHER_CONDITIONS[window.weatherSystem.currentData.weatherCode]?.name || 'Senin'} | ${CONFIG.location}</span>
        </div>` : '';
    
    return `
        <div class="weather-controls">
            <button class="weather-btn accessibility-btn" title="${ROMANIAN.accessibility}" aria-label="${ROMANIAN.accessibility}">
                <i class="material-icons">visibility_off</i>
            </button>
            <button class="weather-btn expand-btn locked" title="${ROMANIAN.locked}" aria-label="${ROMANIAN.locked}">
                <i class="material-icons">priority_high</i>
            </button>
        </div>
        <div class="weather-content">
            <div class="emergency-header">
                <i class="material-icons emergency-icon">${icon || 'warning'}</i>
                <div class="emergency-title">${title}</div>
            </div>
            ${dataHTML}
            ${activitiesHTML}
            ${weatherSummary}
            <div class="weather-tips visible"></div>
            <div class="weather-emergency visible">${ROMANIAN.emergency}</div>
            <div class="weather-update"></div>
        </div>
    `;
}

function getAQILevel(aqi) {
    if (aqi <= 50) return 'Bun';
    if (aqi <= 100) return 'Moderat';
    if (aqi <= 150) return 'Nesănătos';
    if (aqi <= 200) return 'Periculos';
    return 'Extrem';
}

// === MAIN SYSTEM ===
class WeatherAlertSystem {
    constructor() {
        if (window.weatherSystemInitialized) {
            console.warn('⚠️ Weather system already initialized');
            return window.weatherSystem;
        }
        
        this.container = null;
        this.currentData = null;
        this.currentAlert = null;
        this.isExpanded = false;
        this.isEmergency = false;
        this.isHidden = false;
        this.updateTimer = null;
        this.accessibility = {
            highContrast: localStorage.getItem('weather-high-contrast') === 'true',
            fontScale: parseInt(localStorage.getItem('weather-font-scale')) || 1
        };
        
        window.weatherSystemInitialized = true;
        window.weatherSystem = this;
        
        this.init();
    }
    
    async init() {
        injectCSS();
        this.createContainer();
        this.setupEventListeners();
        this.setupIntersectionObserver();
        await this.fetchWeather();
        this.startMonitoring();
        
        setTimeout(() => this.container?.classList.add('visible'), 2000);
        console.log('✅ Weather Alert System v4.0 initialized');
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'weather-alert';
        this.container.setAttribute('role', 'complementary');
        this.container.setAttribute('aria-label', 'Sistem de avertizare meteorologică');
        this.container.innerHTML = createCompactHTML({ temp: '--', weatherCode: 0 });
        document.body.appendChild(this.container);
        this.applyAccessibility();
    }
    
    setupEventListeners() {
        // Expand/collapse
        this.container.addEventListener('click', (e) => {
            if (!e.target.closest('.weather-controls') && !this.isEmergency) {
                this.toggleExpanded();
            }
        });
        
        // Accessibility button
        const accessBtn = this.container.querySelector('.accessibility-btn');
        accessBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleAccessibility();
        });
        
        // Expand button
        const expandBtn = this.container.querySelector('.expand-btn');
        expandBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.isEmergency) {
                this.toggleExpanded();
            }
        });
        
        // Keyboard support
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (e.target.classList.contains('accessibility-btn')) {
                    this.toggleAccessibility();
                } else if (!this.isEmergency) {
                    this.toggleExpanded();
                }
            } else if (e.key === 'Escape' && this.isExpanded) {
                this.isExpanded = false;
                this.updateExpandedState();
            }
        });
    }
    
    setupIntersectionObserver() {
        const footer = document.querySelector('footer');
        if (!footer) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isEmergency) {
                    this.hide();
                } else {
                    this.show();
                }
            });
        }, { rootMargin: '0px 0px -20px 0px' });
        
        observer.observe(footer);
    }
    
    async fetchWeather() {
        try {
            const params = new URLSearchParams({
                latitude: CONFIG.coordinates.lat,
                longitude: CONFIG.coordinates.lon,
                current: 'temperature_2m,weather_code,wind_speed_10m,precipitation',
                timezone: 'Europe/Bucharest'
            });
            
            const response = await fetch(`${CONFIG.apiUrl}?${params}`);
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const data = await response.json();
            this.currentData = {
                temp: Math.round(data.current.temperature_2m),
                weatherCode: data.current.weather_code,
                wind: data.current.wind_speed_10m,
                precipitation: data.current.precipitation
            };
            
            this.updateDisplay();
            this.checkAlerts();
            this.flashUpdate();
            
        } catch (error) {
            console.error('❌ Weather fetch error:', error);
            this.showError();
        }
    }
    
    updateDisplay() {
        if (!this.currentData || this.isEmergency) return;
        
        const condition = WEATHER_CONDITIONS[this.currentData.weatherCode] || WEATHER_CONDITIONS[0];
        
        // Update icon and animation
        const icon = this.container.querySelector('.weather-icon');
        if (icon) {
            icon.className = `material-icons weather-icon ${condition.anim}`;
            icon.textContent = condition.icon;
        }
        
        // Update temperature
        const temp = this.container.querySelector('.weather-temp');
        if (temp) temp.textContent = `${this.currentData.temp}°C`;
        
        // Update condition
        const conditionEl = this.container.querySelector('.weather-condition');
        if (conditionEl) conditionEl.textContent = condition.name;
    }
    
    checkAlerts() {
        if (!this.currentData || this.isEmergency) return;
        
        let alert = null;
        const { temp, weatherCode, wind } = this.currentData;
        const condition = WEATHER_CONDITIONS[weatherCode];
        
        // Temperature alerts
        if (temp <= CONFIG.thresholds.temperature.cold) {
            alert = SAFETY_ADVICE.extreme_cold;
        } else if (temp >= CONFIG.thresholds.temperature.hot) {
            alert = SAFETY_ADVICE.extreme_heat;
        }
        
        // Wind alerts
        if (wind >= CONFIG.thresholds.wind.strong) {
            alert = SAFETY_ADVICE.high_winds;
        }
        
        // Weather condition alerts
        if (condition?.advice && SAFETY_ADVICE[condition.advice]) {
            const conditionAlert = SAFETY_ADVICE[condition.advice];
            if (!alert || this.getAlertPriority(conditionAlert.level) > this.getAlertPriority(alert.level)) {
                alert = conditionAlert;
            }
        }
        
        if (alert) {
            this.showAlert(alert);
        } else {
            this.clearAlert();
        }
    }
    
    getAlertPriority(level) {
        return { advisory: 1, warning: 2, critical: 3 }[level] || 0;
    }
    
    showAlert(alert) {
        this.currentAlert = alert;
        this.container.className = `weather-alert visible ${alert.level}`;
        this.applyAccessibility();
        
        const header = this.container.querySelector('.weather-alert-header');
        const title = this.container.querySelector('.weather-alert-title');
        const tips = this.container.querySelector('.weather-tips');
        const emergency = this.container.querySelector('.weather-emergency');
        
        if (header && title) {
            title.textContent = alert.title;
            header.classList.add('visible');
        }
        
        if (tips && alert.tips) {
            tips.innerHTML = '<ul>' + alert.tips.map(tip => `<li>${tip}</li>`).join('') + '</ul>';
        }
        
        if (emergency && (alert.level === 'warning' || alert.level === 'critical')) {
            emergency.classList.add('visible');
        }
        
        // Auto-expand for warnings and critical
        if ((alert.level === 'warning' || alert.level === 'critical') && !this.isExpanded) {
            setTimeout(() => {
                this.isExpanded = true;
                this.updateExpandedState();
            }, 300);
        }
    }
    
    clearAlert() {
        this.currentAlert = null;
        this.container.className = 'weather-alert visible';
        this.applyAccessibility();
        
        const header = this.container.querySelector('.weather-alert-header');
        const tips = this.container.querySelector('.weather-tips');
        const emergency = this.container.querySelector('.weather-emergency');
        
        header?.classList.remove('visible');
        tips?.classList.remove('visible');
        emergency?.classList.remove('visible');
        
        if (this.isExpanded) {
            this.isExpanded = false;
            this.updateExpandedState();
        }
    }
    
    showEmergency(data) {
        this.isEmergency = true;
        this.isExpanded = true;
        
        const emergencyClass = data.level === 'critical' ? 'emergency' : data.level;
        this.container.className = `weather-alert visible ${emergencyClass} expanded`;
        this.applyAccessibility();
        
        this.container.innerHTML = createEmergencyHTML(data);
        this.setupEventListeners(); // Re-attach after innerHTML change
        
        const tips = this.container.querySelector('.weather-tips');
        if (tips && data.tips) {
            tips.innerHTML = '<ul>' + data.tips.map(tip => `<li>${tip}</li>`).join('') + '</ul>';
        }
        
        console.log('🚨 Emergency alert displayed:', data.type);
    }
    
    clearEmergency() {
        this.isEmergency = false;
        this.isExpanded = false;
        
        if (this.currentData) {
            this.container.innerHTML = createCompactHTML(this.currentData);
            this.setupEventListeners();
            this.updateDisplay();
            this.checkAlerts();
        }
        
        console.log('✅ Emergency alert cleared');
    }
    
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        this.updateExpandedState();
    }
    
    updateExpandedState() {
        this.container.classList.toggle('expanded', this.isExpanded);
        
        const expandBtn = this.container.querySelector('.expand-btn');
        if (expandBtn && !this.isEmergency) {
            const icon = expandBtn.querySelector('i');
            icon.textContent = this.isExpanded ? 'expand_less' : 'expand_more';
            expandBtn.setAttribute('aria-label', this.isExpanded ? ROMANIAN.collapse : ROMANIAN.expand);
        }
        
        const tips = this.container.querySelector('.weather-tips');
        tips?.classList.toggle('visible', this.isExpanded);
    }
    
    toggleAccessibility() {
        this.accessibility.highContrast = !this.accessibility.highContrast;
        localStorage.setItem('weather-high-contrast', this.accessibility.highContrast);
        this.applyAccessibility();
        
        console.log(`♿ High contrast: ${this.accessibility.highContrast ? 'ON' : 'OFF'}`);
    }
    
    applyAccessibility() {
        if (!this.container) return;
        
        this.container.classList.toggle('high-contrast', this.accessibility.highContrast);
        this.container.classList.remove('font-scale-1', 'font-scale-2', 'font-scale-3', 'font-scale-4');
        this.container.classList.add(`font-scale-${this.accessibility.fontScale}`);
        
        const accessBtn = this.container.querySelector('.accessibility-btn i');
        if (accessBtn) {
            accessBtn.textContent = this.accessibility.highContrast ? 'visibility' : 'visibility_off';
        }
    }
    
    setFontScale(scale) {
        this.accessibility.fontScale = Math.max(1, Math.min(4, scale));
        localStorage.setItem('weather-font-scale', this.accessibility.fontScale);
        this.applyAccessibility();
        console.log(`🔤 Font scale: ${this.accessibility.fontScale}x`);
    }
    
    flashUpdate() {
        const indicator = this.container.querySelector('.weather-update');
        indicator?.classList.add('flash');
        setTimeout(() => indicator?.classList.remove('flash'), 1000);
    }
    
    showError() {
        const temp = this.container.querySelector('.weather-temp');
        const condition = this.container.querySelector('.weather-condition');
        if (temp) temp.textContent = '--°C';
        if (condition) condition.textContent = ROMANIAN.error;
    }
    
    show() {
        if (!this.isHidden) return;
        this.container?.classList.remove('hidden');
        this.isHidden = false;
    }
    
    hide() {
        if (this.isHidden || this.isEmergency) return;
        this.container?.classList.add('hidden');
        this.isHidden = true;
    }
    
    startMonitoring() {
        this.updateTimer = setInterval(() => this.fetchWeather(), CONFIG.updateInterval);
    }
    
    destroy() {
        if (this.updateTimer) clearInterval(this.updateTimer);
        this.container?.remove();
        delete window.weatherSystem;
        delete window.weatherSystemInitialized;
        console.log('🗑️ Weather system destroyed');
    }
}

// === EMERGENCY MONITORING ===
class EmergencyMonitor {
    constructor() {
        if (window.emergencyMonitorInitialized) return;
        
        this.updateTimer = null;
        this.currentAlerts = new Set();
        
        window.emergencyMonitorInitialized = true;
        window.emergencyMonitor = this;
        
        setTimeout(() => this.init(), 5000);
    }
    
    init() {
        this.checkEmergencies();
        this.updateTimer = setInterval(() => this.checkEmergencies(), CONFIG.updateInterval);
        console.log('✅ Emergency monitoring initialized');
    }
    
    async checkEmergencies() {
        try {
            const [earthquake, airQuality] = await Promise.allSettled([
                this.fetchEarthquake(),
                this.fetchAirQuality()
            ]);
            
            if (earthquake.status === 'fulfilled') {
                this.processEarthquake(earthquake.value);
            }
            
            if (airQuality.status === 'fulfilled') {
                this.processAirQuality(airQuality.value);
            }
        } catch (error) {
            console.error('❌ Emergency check error:', error);
        }
    }
    
    async fetchEarthquake() {
        const params = new URLSearchParams({
            format: 'geojson',
            starttime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            latitude: CONFIG.coordinates.lat,
            longitude: CONFIG.coordinates.lon,
            maxradiuskm: CONFIG.thresholds.earthquake.radius,
            minmagnitude: CONFIG.thresholds.earthquake.minor,
            orderby: 'time'
        });
        
        const response = await fetch(`${CONFIG.emergencyAPIs.earthquake}?${params}`);
        if (!response.ok) throw new Error('Earthquake API error');
        return await response.json();
    }
    
    async fetchAirQuality() {
        const params = new URLSearchParams({
            lat: CONFIG.coordinates.lat,
            lon: CONFIG.coordinates.lon,
            appid: CONFIG.emergencyAPIs.airQualityKey
        });
        
        const response = await fetch(`${CONFIG.emergencyAPIs.airQuality}?${params}`);
        if (!response.ok) throw new Error('Air quality API error');
        return await response.json();
    }
    
    processEarthquake(data) {
        if (!data.features?.length) {
            this.clearAlert('earthquake');
            return;
        }
        
        const quake = data.features[0];
        const magnitude = quake.properties.mag;
        const distance = this.calculateDistance(
            CONFIG.coordinates.lat,
            CONFIG.coordinates.lon,
            quake.geometry.coordinates[1],
            quake.geometry.coordinates[0]
        );
        
        let level = null;
        if (magnitude >= CONFIG.thresholds.earthquake.major) level = 'major';
        else if (magnitude >= CONFIG.thresholds.earthquake.moderate) level = 'moderate';
        else if (magnitude >= CONFIG.thresholds.earthquake.minor) level = 'minor';
        
        if (level) {
            const alertData = {
                type: 'earthquake',
                level: level === 'major' ? 'critical' : level === 'moderate' ? 'warning' : 'advisory',
                title: level === 'major' ? 'ALERTĂ SEISMICĂ CRITICĂ' : level === 'moderate' ? 'AVERTIZARE SEISMICĂ' : 'INFORMARE SEISMICĂ',
                icon: 'warning',
                emergencyData: {
                    magnitude: magnitude.toFixed(1),
                    distance: distance.toFixed(0),
                    time: new Date(quake.properties.time).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
                },
                tips: level === 'major' ? [
                    'EVACUAȚI CLĂDIREA IMEDIAT',
                    'Adăpostiți-vă în spații deschise',
                    'Apelați 112 pentru urgențe',
                    'Nu folosiți ascensorul'
                ] : level === 'moderate' ? [
                    'Verificați integritatea clădirii',
                    'Pregătiți-vă pentru replici',
                    'Aveți trusa de urgență pregătită'
                ] : [
                    'Rămâneți calmi',
                    'Verificați dacă există avarii',
                    'Urmăriți comunicatele oficiale'
                ]
            };
            
            this.triggerAlert('earthquake', alertData);
        } else {
            this.clearAlert('earthquake');
        }
    }
    
    processAirQuality(data) {
        if (!data.list?.length) {
            this.clearAlert('airQuality');
            return;
        }
        
        const current = data.list[0];
        const aqi = current.main.aqi * 50; // Convert to 0-300 scale
        
        let level = null;
        let activities = null;
        
        if (aqi >= CONFIG.thresholds.airQuality.dangerous) {
            level = 'dangerous';
            activities = {
                outdoor_sports: 'danger',
                cycling: 'danger',
                bring_baby_out: 'danger',
                eating_outside: 'danger',
                windows_open: 'danger'
            };
        } else if (aqi >= CONFIG.thresholds.airQuality.unhealthy) {
            level = 'unhealthy';
            activities = {
                outdoor_sports: 'no',
                cycling: 'no',
                bring_baby_out: 'no',
                eating_outside: 'no',
                windows_open: 'no'
            };
        } else if (aqi >= CONFIG.thresholds.airQuality.moderate) {
            level = 'moderate';
            activities = {
                outdoor_sports: 'limited',
                cycling: 'limited',
                bring_baby_out: 'caution',
                eating_outside: 'ok',
                windows_open: 'no'
            };
        }
        
        if (level) {
            const alertData = {
                type: 'airQuality',
                level: level === 'dangerous' ? 'critical' : level === 'unhealthy' ? 'warning' : 'advisory',
                title: level === 'dangerous' ? 'ALERTĂ POLUARE SEVERĂ' : level === 'unhealthy' ? 'AVERTIZARE CALITATE AER' : 'ATENȚIE - CALITATE AER',
                icon: 'masks',
                emergencyData: {
                    aqi: Math.round(aqi),
                    pm25: current.components.pm2_5?.toFixed(1) || 'N/A'
                },
                activities: activities,
                tips: level === 'dangerous' ? [
                    'RĂMÂNEȚI ÎN INTERIOR OBLIGATORIU',
                    'Sigilați ferestrele și ușile',
                    'Folosiți purificatoare de aer',
                    'Apelați medicul la primele simptome'
                ] : level === 'unhealthy' ? [
                    'Evitați ieșirile neesențiale',
                    'Purtați mască de protecție',
                    'Copiii și vârstnicii să rămână în interior'
                ] : [
                    'Limitați activitățile fizice în exterior',
                    'Persoanele sensibile să rămână în interior',
                    'Închideți ferestrele'
                ]
            };
            
            this.triggerAlert('airQuality', alertData);
        } else {
            this.clearAlert('airQuality');
        }
    }
    
    triggerAlert(type, data) {
        const alertId = `${type}_${data.level}`;
        if (this.currentAlerts.has(alertId)) return;
        
        this.currentAlerts.add(alertId);
        
        if (window.weatherSystem) {
            window.weatherSystem.showEmergency(data);
        }
        
        console.log(`🚨 Emergency alert: ${type} - ${data.level}`);
    }
    
    clearAlert(type) {
        const alerts = Array.from(this.currentAlerts).filter(a => a.startsWith(type));
        alerts.forEach(a => this.currentAlerts.delete(a));
        
        if (this.currentAlerts.size === 0 && window.weatherSystem?.isEmergency) {
            window.weatherSystem.clearEmergency();
        }
    }
    
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
    
    destroy() {
        if (this.updateTimer) clearInterval(this.updateTimer);
        this.currentAlerts.clear();
        delete window.emergencyMonitor;
        delete window.emergencyMonitorInitialized;
        console.log('🗑️ Emergency monitor destroyed');
    }
}

// === TESTING INTERFACE ===
window.weatherTest = {
    setWeather: (code) => {
        if (window.weatherSystem) {
            window.weatherSystem.currentData = {
                temp: -5 + Math.random() * 50,
                weatherCode: code,
                wind: Math.random() * 70,
                precipitation: Math.random() * 10
            };
            window.weatherSystem.updateDisplay();
            window.weatherSystem.checkAlerts();
            console.log(`🌤️ Set weather code: ${code}`);
        }
    },
    
    setTemp: (temp) => {
        if (window.weatherSystem?.currentData) {
            window.weatherSystem.currentData.temp = temp;
            window.weatherSystem.updateDisplay();
            window.weatherSystem.checkAlerts();
            console.log(`🌡️ Set temperature: ${temp}°C`);
        }
    },
    
    setWind: (speed) => {
        if (window.weatherSystem?.currentData) {
            window.weatherSystem.currentData.wind = speed;
            window.weatherSystem.checkAlerts();
            console.log(`💨 Set wind: ${speed} km/h`);
        }
    },
    
    cycle: () => {
        const codes = [0, 3, 45, 61, 65, 71, 75, 95, 99];
        let i = 0;
        const interval = setInterval(() => {
            if (i >= codes.length) {
                clearInterval(interval);
                console.log('✅ Weather cycle complete');
                return;
            }
            weatherTest.setWeather(codes[i]);
            i++;
        }, 3000);
        console.log('🔄 Starting weather cycle...');
    },
    
    testAccessibility: () => {
        window.weatherSystem?.toggleAccessibility();
    },
    
    testFontScale: (scale) => {
        window.weatherSystem?.setFontScale(scale);
    },
    
    expand: () => {
        if (window.weatherSystem && !window.weatherSystem.isExpanded) {
            window.weatherSystem.toggleExpanded();
        }
    },
    
    collapse: () => {
        if (window.weatherSystem?.isExpanded) {
            window.weatherSystem.toggleExpanded();
        }
    },
    
    destroy: () => {
        window.weatherSystem?.destroy();
        window.emergencyMonitor?.destroy();
    },
    
    reinit: () => {
        new WeatherAlertSystem();
        new EmergencyMonitor();
    }
};

window.emergencyTest = {
    earthquake: (magnitude = 5.2, distance = 45) => {
        const data = {
            type: 'earthquake',
            level: magnitude >= 6 ? 'critical' : magnitude >= 4.5 ? 'warning' : 'advisory',
            title: magnitude >= 6 ? 'ALERTĂ SEISMICĂ CRITICĂ' : 'AVERTIZARE SEISMICĂ',
            icon: 'warning',
            emergencyData: {
                magnitude: magnitude.toFixed(1),
                distance: distance.toFixed(0),
                time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
            },
            tips: ['Verificați integritatea clădirii', 'Pregătiți-vă pentru replici', 'Aveți trusa pregătită']
        };
        window.weatherSystem?.showEmergency(data);
        console.log(`🌍 Test earthquake: M${magnitude} at ${distance}km`);
    },
    
    airQuality: (aqi = 180) => {
        const level = aqi >= 300 ? 'dangerous' : aqi >= 155 ? 'unhealthy' : 'moderate';
        const data = {
            type: 'airQuality',
            level: aqi >= 300 ? 'critical' : aqi >= 155 ? 'warning' : 'advisory',
            title: aqi >= 300 ? 'ALERTĂ POLUARE SEVERĂ' : 'AVERTIZARE CALITATE AER',
            icon: 'masks',
            emergencyData: {
                aqi: aqi,
                pm25: (aqi * 0.5).toFixed(1)
            },
            activities: {
                outdoor_sports: level === 'dangerous' ? 'danger' : level === 'unhealthy' ? 'no' : 'limited',
                cycling: level === 'dangerous' ? 'danger' : level === 'unhealthy' ? 'no' : 'limited',
                bring_baby_out: level === 'dangerous' ? 'danger' : level === 'unhealthy' ? 'no' : 'caution',
                eating_outside: level === 'dangerous' ? 'danger' : level === 'unhealthy' ? 'no' : 'ok',
                windows_open: 'no'
            },
            tips: ['Evitați ieșirile neesențiale', 'Purtați mască de protecție', 'Închideți ferestrele']
        };
        window.weatherSystem?.showEmergency(data);
        console.log(`😷 Test air quality: AQI ${aqi}`);
    },
    
    clear: () => {
        window.weatherSystem?.clearEmergency();
        console.log('✅ Emergency cleared');
    }
};

// === INITIALIZATION ===
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WeatherAlertSystem();
        new EmergencyMonitor();
    });
} else {
    new WeatherAlertSystem();
    new EmergencyMonitor();
}

console.log('🏛️ Weather Alert System v4.0 - Production Ready');
console.log('📍 Slobozia, Ialomița County, Romania');
console.log('🧪 Test: weatherTest.cycle() | emergencyTest.earthquake(5.2, 45)');
console.log('♿ Accessibility: weatherTest.testAccessibility() | weatherTest.testFontScale(2)');
