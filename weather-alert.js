// =============================================================================
// WEATHER ALERT SYSTEM v4.1 - Municipal Weather Monitoring
// Poliția Locală Slobozia | Production-Ready | Clean & Polished
// =============================================================================

// === CONFIGURATION ===
const CONFIG = {
    coordinates: { lat: 44.5667, lon: 27.3667 },
    location: 'Slobozia, Ialomița',
    apiUrl: 'https://api.open-meteo.com/v1/forecast',
    updateInterval: 5 * 60 * 1000, // 5 minutes
    thresholds: {
        temperature: { cold: -10, hot: 38 },
        wind: { strong: 40, severe: 60 },
        precipitation: { moderate: 5, heavy: 10 }
    }
};

// Weather conditions with day/night awareness
const WEATHER_CONDITIONS = {
    // Clear sky
    0: { 
        day: { icon: 'wb_sunny', name: 'Senin', anim: 'sunny' },
        night: { icon: 'nights_stay', name: 'Senin', anim: 'night' }
    },
    // Partly cloudy
    1: { 
        day: { icon: 'wb_cloudy', name: 'Parțial înnorat', anim: 'partly-cloudy' },
        night: { icon: 'wb_cloudy', name: 'Parțial înnorat', anim: 'partly-cloudy-night' }
    },
    2: { 
        day: { icon: 'wb_cloudy', name: 'Parțial înnorat', anim: 'partly-cloudy' },
        night: { icon: 'wb_cloudy', name: 'Parțial înnorat', anim: 'partly-cloudy-night' }
    },
    // Overcast
    3: { icon: 'cloud', name: 'Înnorat', anim: 'cloudy' },
    // Fog
    45: { icon: 'foggy', name: 'Ceață', anim: 'foggy', advice: 'visibility' },
    48: { icon: 'foggy', name: 'Ceață cu chiciură', anim: 'foggy', advice: 'ice' },
    // Drizzle
    51: { icon: 'grain', name: 'Burniță ușoară', anim: 'drizzle' },
    53: { icon: 'grain', name: 'Burniță moderată', anim: 'drizzle', advice: 'rain' },
    55: { icon: 'grain', name: 'Burniță densă', anim: 'drizzle', advice: 'rain' },
    56: { icon: 'ac_unit', name: 'Burniță înghețată', anim: 'drizzle', advice: 'ice' },
    57: { icon: 'ac_unit', name: 'Burniță înghețată densă', anim: 'drizzle', advice: 'ice' },
    // Rain
    61: { icon: 'water_drop', name: 'Ploaie ușoară', anim: 'rainy' },
    63: { icon: 'water_drop', name: 'Ploaie moderată', anim: 'rainy', advice: 'rain' },
    65: { icon: 'water_drop', name: 'Ploaie torențială', anim: 'heavy-rain', advice: 'heavy_rain' },
    66: { icon: 'ac_unit', name: 'Ploaie înghețată', anim: 'rainy', advice: 'ice' },
    67: { icon: 'ac_unit', name: 'Ploaie înghețată puternică', anim: 'heavy-rain', advice: 'ice' },
    // Snow
    71: { icon: 'ac_unit', name: 'Ninsoare ușoară', anim: 'snowy', advice: 'snow' },
    73: { icon: 'ac_unit', name: 'Ninsoare moderată', anim: 'snowy', advice: 'snow' },
    75: { icon: 'ac_unit', name: 'Ninsoare abundentă', anim: 'heavy-snow', advice: 'heavy_snow' },
    77: { icon: 'ac_unit', name: 'Ninsoare cu boabe', anim: 'snowy', advice: 'snow' },
    // Rain showers
    80: { icon: 'water_drop', name: 'Averse ușoare', anim: 'rainy', advice: 'rain' },
    81: { icon: 'water_drop', name: 'Averse moderate', anim: 'rainy', advice: 'heavy_rain' },
    82: { icon: 'water_drop', name: 'Averse violente', anim: 'heavy-rain', advice: 'heavy_rain' },
    // Snow showers
    85: { icon: 'ac_unit', name: 'Averse de zăpadă', anim: 'snowy', advice: 'heavy_snow' },
    86: { icon: 'ac_unit', name: 'Averse de zăpadă puternice', anim: 'heavy-snow', advice: 'heavy_snow' },
    // Thunderstorm
    95: { icon: 'thunderstorm', name: 'Furtună', anim: 'thunderstorm', advice: 'storm' },
    96: { icon: 'thunderstorm', name: 'Furtună cu grindină', anim: 'severe-storm', advice: 'severe_storm' },
    99: { icon: 'thunderstorm', name: 'Furtună severă cu grindină', anim: 'severe-storm', advice: 'severe_storm' }
};

// Safety advice for different weather conditions
const SAFETY_ADVICE = {
    visibility: { 
        level: 'advisory', 
        title: 'ATENȚIE - VIZIBILITATE REDUSĂ', 
        tips: [
            'Conduceți cu atenție sporită și viteză redusă',
            'Folosiți farurile și luminile de ceață',
            'Păstrați distanța de siguranță mărită',
            'Evitați deplasările neesențiale'
        ] 
    },
    rain: { 
        level: 'advisory', 
        title: 'ATENȚIE - PRECIPITAȚII',
        tips: [
            'Atenție la carosabilul umed și aderență redusă',
            'Folosiți umbrela la deplasări pietonale',
            'Verificați gutierele și sistemul de scurgere',
            'Evitați zonele cu risc de băltire'
        ] 
    },
    heavy_rain: { 
        level: 'warning', 
        title: 'AVERTIZARE PLOAIE TORENȚIALĂ',
        tips: [
            'Evitați deplasările neesențiale cu automobilul',
            'Nu traversați zonele inundate sau cu apă pe carosabil',
            'Verificați acoperișurile și jgheaburile',
            'Aveți la îndemână numerele de urgență',
            'Urmăriți comunicatele și avertizările oficiale',
            'Securizați obiectele din curte care pot fi luate de apă'
        ] 
    },
    snow: { 
        level: 'advisory', 
        title: 'ATENȚIE - NINSOARE',
        tips: [
            'Echipați vehiculele pentru condiții de iarnă',
            'Atenție la drumurile alunecoase și vizibilitate',
            'Purtați încălțăminte antiderapantă adecvată',
            'Verificați funcționarea sistemului de încălzire'
        ] 
    },
    heavy_snow: { 
        level: 'warning', 
        title: 'AVERTIZARE NINSOARE ABUNDENTĂ',
        tips: [
            'Evitați călătoriile și deplasările neesențiale',
            'Pregătiți vehiculele cu anvelope de iarnă',
            'Asigurați-vă rezerve de alimente și medicamente',
            'Verificați și testați sistemul de încălzire',
            'Curățați periodic zăpada de pe acoperișuri',
            'Verificați și ajutați vecinii în vârstă'
        ] 
    },
    ice: { 
        level: 'warning', 
        title: 'ATENȚIE - SUPRAFEȚE ÎNGHEȚATE',
        tips: [
            'Mișcați-vă cu atenție extremă pe suprafețe înghețate',
            'Folosiți încălțăminte cu talpă antiderapantă',
            'Evitați deplasările pietonale neesențiale',
            'Atenție sporită la suprafețele din umbră',
            'Verificați și protejați conductele de apă',
            'Ajutați persoanele în vârstă la deplasări'
        ] 
    },
    storm: { 
        level: 'warning', 
        title: 'AVERTIZARE FURTUNĂ',
        tips: [
            'Rămâneți în interior pe durata furtunii',
            'Evitați zonele cu copaci înalți și neîntăriți',
            'Deconectați aparatele electrice sensibile',
            'Evitați folosirea telefonului fix pe cablu',
            'Nu vă adăpostiți sub structuri metalice înalte',
            'Fixați bine obiectele din curte și de pe balcoane'
        ] 
    },
    severe_storm: { 
        level: 'critical', 
        title: 'ALERTĂ FURTUNĂ SEVERĂ',
        tips: [
            'RĂMÂNEȚI ÎN INTERIOR - OBLIGATORIU',
            'Adăpostiți-vă într-o cameră interioară fără ferestre',
            'Evitați contact cu ferestre, uși și pereți exteriori',
            'Pregătiți și verificați trusa de prim ajutor',
            'Urmăriți în permanență alertele oficiale',
            'Apelați 112 doar în caz de urgență reală'
        ] 
    },
    extreme_cold: { 
        level: 'critical', 
        title: 'ALERTĂ GER SEVER',
        tips: [
            'Limitați la minimum timpul petrecut în exterior',
            'Îmbrăcați-vă în multiple straturi de haine',
            'Protejați obligatoriu extremitățile corpului',
            'Verificați și ajutați persoanele vulnerabile',
            'Asigurați-vă că sistemul de încălzire funcționează',
            'Atenție la semnele de hipotermie și degerătură'
        ] 
    },
    extreme_heat: { 
        level: 'critical', 
        title: 'ALERTĂ CANICULĂ',
        tips: [
            'Rămâneți în spații climatizate sau răcoroase',
            'Hidratați-vă frecvent cu apă și lichide',
            'Evitați activitățile fizice în exterior',
            'Purtați haine ușoare, largi și de culoare deschisă',
            'Verificați periodic persoanele în vârstă',
            'Centru de răcorire disponibil: Biblioteca Municipală'
        ] 
    },
    high_winds: { 
        level: 'warning', 
        title: 'AVERTIZARE VÂNT PUTERNIC',
        tips: [
            'Fixați și securizați toate obiectele mobile din curte',
            'Evitați deplasarea pe jos în zone deschise',
            'Atenție sporită la posibila cădere a crengilor',
            'Verificați și securizați acoperișurile și țiglele',
            'Evitați parcarea vehiculelor sub copaci'
        ] 
    }
};

// Romanian UI text
const TEXT = {
    loading: 'Se încarcă...',
    error: 'Eroare conexiune',
    cached: 'Date din cache',
    expand: 'Extinde informații',
    collapse: 'Restrânge informații',
    accessibility: 'Comutare vizibilitate îmbunătățită',
    accessibilityOn: 'Dezactivare vizibilitate îmbunătățită',
    emergency: 'Urgențe: 112 | Poliția Locală: (0243) 955'
};

// === CSS INJECTION ===
function injectCSS() {
    if (document.getElementById('weather-alert-css')) return;
    
    const css = `
/* =============================================================================
   WEATHER ALERT SYSTEM v4.1 - Clean & Polished Styles
   ============================================================================= */

/* === BASE CONTAINER === */
.weather-alert {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 280px;
    min-height: 70px;
    background: rgba(26, 47, 95, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    opacity: 0;
    transform: translateY(100%);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    overflow: hidden;
}

/* === VISIBILITY STATES === */
.weather-alert.visible {
    opacity: 1;
    transform: translateY(0);
}

.weather-alert.hidden {
    opacity: 0;
    pointer-events: none;
}

.weather-alert.expanded {
    width: 340px;
    min-height: 140px;
}

/* === ALERT LEVELS === */
.weather-alert.advisory {
    border-left: 4px solid #ffa726;
}

.weather-alert.warning {
    border-left: 4px solid #ff7043;
}

.weather-alert.critical {
    border-left: 4px solid #e53935;
    animation: criticalPulse 3s ease-in-out infinite;
}

@keyframes criticalPulse {
    0%, 100% {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    50% {
        box-shadow: 0 4px 25px rgba(229, 57, 53, 0.4);
    }
}

/* === LAYOUT STRUCTURE === */
.weather-content {
    padding: 12px;
    padding-right: 44px;
    position: relative;
}

/* === CONTROL BUTTONS === */
.weather-controls {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 10;
}

.weather-btn {
    width: 30px;
    height: 30px;
    min-width: 30px;
    min-height: 30px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    color: #1a2f5f;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    padding: 0;
    outline: none;
}

.weather-btn:hover {
    transform: scale(1.1);
    background: #ffffff;
    border-color: #ffca28;
}

.weather-btn:active {
    transform: scale(0.95);
}

.weather-btn:focus {
    outline: 3px solid #ffca28;
    outline-offset: 2px;
}

.weather-btn.active {
    background: #ffca28;
    color: #1a2f5f;
    border-color: #ffca28;
    box-shadow: 0 0 8px rgba(255, 202, 40, 0.6);
}

.weather-btn i {
    font-size: 16px;
    line-height: 1;
    font-family: 'Material Icons';
}

/* === ALERT HEADER === */
.weather-alert-header {
    display: none;
    text-align: center;
    padding: 8px 12px;
    margin: -12px -12px 12px;
    margin-right: -44px;
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.weather-alert-header.visible {
    display: block;
}

.weather-alert-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
    color: #ffffff;
}

/* === WEATHER DISPLAY === */
.weather-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 0;
}

.weather-icon-box {
    width: 48px;
    height: 48px;
    min-width: 48px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.weather-icon {
    font-size: 24px;
    color: #e3f2fd;
    font-family: 'Material Icons';
    line-height: 1;
}

.weather-text {
    flex: 1;
    min-width: 0;
}

.weather-temp-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 4px;
}

.weather-temp {
    font-size: 20px;
    font-weight: 600;
    line-height: 1;
    color: #ffffff;
}

.weather-condition {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 400;
}

.weather-location {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
}

/* === SAFETY TIPS === */
.weather-tips {
    display: none;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.weather-tips.visible {
    display: block;
}

.weather-tips ul {
    margin: 0;
    padding: 0;
    list-style: none;
}

.weather-tips li {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 6px;
    padding-left: 16px;
    position: relative;
    line-height: 1.4;
}

.weather-tips li:last-child {
    margin-bottom: 0;
}

.weather-tips li::before {
    content: '•';
    color: #ffca28;
    position: absolute;
    left: 0;
    font-weight: bold;
    font-size: 14px;
}

/* === EMERGENCY CONTACT === */
.weather-emergency {
    display: none;
    margin-top: 12px;
    padding: 8px 12px;
    background: rgba(229, 57, 53, 0.2);
    border: 1px solid rgba(229, 57, 53, 0.3);
    border-radius: 4px;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
    color: #ffcdd2;
}

.weather-emergency.visible {
    display: block;
}

.weather-emergency i {
    font-size: 12px;
    vertical-align: middle;
    margin-right: 4px;
}

/* === UPDATE INDICATOR === */
.weather-update {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 6px;
    height: 6px;
    background: #4caf50;
    border-radius: 50%;
    opacity: 0;
    z-index: 5;
}

.weather-update.flash {
    animation: updateFlash 1s ease-out;
}

@keyframes updateFlash {
    0% {
        opacity: 0;
        transform: scale(0.8);
    }
    50% {
        opacity: 1;
        transform: scale(1.2);
    }
    100% {
        opacity: 0;
        transform: scale(1);
    }
}

/* === HIGH CONTRAST MODE === */
.weather-alert.high-contrast {
    background: #000000 !important;
    border: 3px solid #ffffff !important;
    box-shadow: 0 0 0 3px #ffff00 !important;
}

.weather-alert.high-contrast .weather-content {
    color: #ffffff !important;
}

.weather-alert.high-contrast .weather-temp,
.weather-alert.high-contrast .weather-condition,
.weather-alert.high-contrast .weather-location,
.weather-alert.high-contrast .weather-alert-title,
.weather-alert.high-contrast .weather-tips li,
.weather-alert.high-contrast .weather-emergency {
    color: #ffffff !important;
}

.weather-alert.high-contrast .weather-icon {
    color: #ffff00 !important;
}

.weather-alert.high-contrast .weather-icon-box {
    background: #333333 !important;
    border: 2px solid #ffffff !important;
}

.weather-alert.high-contrast .weather-btn {
    background: #ffffff !important;
    color: #000000 !important;
    border: 2px solid #ffff00 !important;
}

.weather-alert.high-contrast .weather-btn i {
    color: #000000 !important;
}

.weather-alert.high-contrast .weather-btn:hover {
    background: #ffff00 !important;
    color: #000000 !important;
}

.weather-alert.high-contrast .weather-btn:hover i {
    color: #000000 !important;
}

.weather-alert.high-contrast .weather-btn.active {
    background: #00ff00 !important;
    color: #000000 !important;
    border-color: #00ff00 !important;
}

.weather-alert.high-contrast .weather-btn.active i {
    color: #000000 !important;
}

.weather-alert.high-contrast .weather-alert-header {
    background: #333333 !important;
    border-color: #ffffff !important;
}

.weather-alert.high-contrast .weather-tips {
    border-color: #ffffff !important;
}

.weather-alert.high-contrast .weather-tips li::before {
    color: #ffff00 !important;
}

.weather-alert.high-contrast .weather-emergency {
    background: #ff0000 !important;
    border-color: #ffffff !important;
    color: #ffffff !important;
}

/* === FONT SCALING === */
.weather-alert.font-scale-2 {
    font-size: 16px;
}

.weather-alert.font-scale-2 .weather-temp {
    font-size: 22px;
}

.weather-alert.font-scale-2 .weather-icon {
    font-size: 26px;
}

.weather-alert.font-scale-3 {
    font-size: 18px;
}

.weather-alert.font-scale-3 .weather-temp {
    font-size: 24px;
}

.weather-alert.font-scale-3 .weather-icon {
    font-size: 28px;
}

.weather-alert.font-scale-4 {
    font-size: 20px;
}

.weather-alert.font-scale-4 .weather-temp {
    font-size: 26px;
}

.weather-alert.font-scale-4 .weather-icon {
    font-size: 30px;
}

/* === WEATHER ANIMATIONS === */

/* Sunny - Day */
@keyframes sunny {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.weather-icon.sunny {
    color: #ffeb3b;
    animation: sunny 30s linear infinite;
}

/* Night - Moon */
@keyframes night {
    0%, 100% {
        transform: scale(1);
        opacity: 0.95;
    }
    50% {
        transform: scale(1.05);
        opacity: 1;
    }
}

.weather-icon.night {
    color: #b3e5fc;
    animation: night 8s ease-in-out infinite;
}

/* Partly Cloudy - Day */
@keyframes partly-cloudy {
    0%, 100% {
        transform: translateX(0) scale(1);
    }
    50% {
        transform: translateX(1px) scale(1.02);
    }
}

.weather-icon.partly-cloudy {
    color: #e3f2fd;
    animation: partly-cloudy 6s ease-in-out infinite;
}

/* Partly Cloudy - Night */
@keyframes partly-cloudy-night {
    0%, 100% {
        transform: translateX(0);
        opacity: 0.9;
    }
    50% {
        transform: translateX(-1px);
        opacity: 1;
    }
}

.weather-icon.partly-cloudy-night {
    color: #90caf9;
    animation: partly-cloudy-night 7s ease-in-out infinite;
}

/* Cloudy */
@keyframes cloudy {
    0%, 100% {
        transform: translateX(0);
    }
    50% {
        transform: translateX(1px);
    }
}

.weather-icon.cloudy {
    color: #78909c;
    animation: cloudy 8s ease-in-out infinite;
}

/* Foggy */
@keyframes foggy {
    0%, 100% {
        opacity: 0.8;
    }
    50% {
        opacity: 1;
    }
}

.weather-icon.foggy {
    color: #b0bec5;
    animation: foggy 6s ease-in-out infinite;
}

/* Drizzle */
@keyframes drizzle {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-1px);
    }
}

.weather-icon.drizzle {
    color: #64b5f6;
    animation: drizzle 3s ease-in-out infinite;
}

/* Rainy */
@keyframes rainy {
    0%, 100% {
        transform: translateY(0);
        opacity: 1;
    }
    50% {
        transform: translateY(-2px);
        opacity: 0.85;
    }
}

.weather-icon.rainy {
    color: #2196f3;
    animation: rainy 2s ease-in-out infinite;
}

/* Heavy Rain */
@keyframes heavy-rain {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

.weather-icon.heavy-rain {
    color: #1976d2;
    animation: heavy-rain 1.5s ease-in-out infinite;
}

/* Snowy */
@keyframes snowy {
    0%, 100% {
        transform: translateY(0) rotate(0deg);
    }
    25% {
        transform: translateY(-1px) rotate(5deg);
    }
    75% {
        transform: translateY(1px) rotate(-5deg);
    }
}

.weather-icon.snowy {
    color: #e3f2fd;
    animation: snowy 4s ease-in-out infinite;
}

/* Heavy Snow */
@keyframes heavy-snow {
    0%, 100% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-1px);
    }
    75% {
        transform: translateX(1px);
    }
}

.weather-icon.heavy-snow {
    color: #ffffff;
    animation: heavy-snow 2s ease-in-out infinite;
}

/* Thunderstorm */
@keyframes thunderstorm {
    0%, 90%, 100% {
        opacity: 1;
    }
    5%, 85% {
        opacity: 0.3;
    }
}

.weather-icon.thunderstorm {
    color: #ff7043;
    animation: thunderstorm 2s ease-in-out infinite;
}

/* Severe Storm */
@keyframes severe-storm {
    0%, 85%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    5%, 80% {
        opacity: 0.4;
        transform: scale(1.1);
    }
}

.weather-icon.severe-storm {
    color: #e53935;
    animation: severe-storm 1s ease-in-out infinite;
}

/* === RESPONSIVE DESIGN === */
@media (max-width: 768px) {
    .weather-alert {
        bottom: 10px;
        right: 10px;
        width: 240px;
        min-height: 60px;
    }
    
    .weather-alert.expanded {
        width: 280px;
        min-height: 120px;
    }
    
    .weather-content {
        padding: 10px;
        padding-right: 40px;
    }
    
    .weather-icon-box {
        width: 40px;
        height: 40px;
        min-width: 40px;
    }
    
    .weather-icon {
        font-size: 20px;
    }
    
    .weather-temp {
        font-size: 18px;
    }
    
    .weather-condition {
        font-size: 12px;
    }
    
    .weather-location {
        font-size: 10px;
    }
    
    .weather-btn {
        width: 28px;
        height: 28px;
        min-width: 28px;
        min-height: 28px;
    }
    
    .weather-btn i {
        font-size: 14px;
    }
    
    .weather-controls {
        top: 6px;
        right: 6px;
        gap: 3px;
    }
}

/* === ACCESSIBILITY === */
@media (prefers-contrast: high) {
    .weather-alert {
        border: 2px solid white;
        background: rgba(0, 0, 0, 0.95);
    }
}

@media (prefers-reduced-motion: reduce) {
    .weather-alert,
    .weather-icon,
    .weather-btn {
        animation: none !important;
        transition: opacity 0.3s ease !important;
    }
}

/* === FOCUS VISIBLE === */
.weather-alert:focus-visible {
    outline: 3px solid #ffca28;
    outline-offset: 2px;
}
    `;
    
    const style = document.createElement('style');
    style.id = 'weather-alert-css';
    style.textContent = css;
    document.head.appendChild(style);
}

// === UTILITY FUNCTIONS ===

// Get weather condition with day/night awareness
function getWeatherCondition(code, isDay) {
    const condition = WEATHER_CONDITIONS[code] || WEATHER_CONDITIONS[0];
    
    // If condition has day/night variants
    if (condition.day && condition.night) {
        return isDay ? condition.day : condition.night;
    }
    
    // Return standard condition
    return condition;
}

// Create HTML template
function createHTML(data) {
    const condition = data ? getWeatherCondition(data.weatherCode, data.isDay) : { icon: 'wb_sunny', name: TEXT.loading, anim: 'sunny' };
    const temp = data ? `${data.temp}°C` : '--°C';
    const conditionName = data ? condition.name : TEXT.loading;
    
    return `
        <div class="weather-controls">
            <button class="weather-btn accessibility-btn" type="button" title="${TEXT.accessibility}" aria-label="${TEXT.accessibility}">
                <i class="material-icons">visibility_off</i>
            </button>
            <button class="weather-btn expand-btn" type="button" title="${TEXT.expand}" aria-label="${TEXT.expand}">
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
                    <div class="weather-temp-row">
                        <div class="weather-temp">${temp}</div>
                        <div class="weather-condition">${conditionName}</div>
                    </div>
                    <div class="weather-location">${CONFIG.location}</div>
                </div>
            </div>
            <div class="weather-tips">
                <ul></ul>
            </div>
            <div class="weather-emergency">
                <i class="material-icons">phone</i>${TEXT.emergency}
            </div>
            <div class="weather-update"></div>
        </div>
    `;
}

// === MAIN WEATHER SYSTEM ===
class WeatherAlertSystem {
    constructor() {
        // Prevent multiple instances
        if (window.weatherSystemActive) {
            console.warn('⚠️ Weather system already running');
            return window.weatherSystem;
        }
        
        // State management
        this.container = null;
        this.currentData = null;
        this.currentAlert = null;
        this.isExpanded = false;
        this.isHidden = false;
        this.updateTimer = null;
        this.fetchAbortController = null;
        
        // Accessibility settings
        this.accessibility = {
            highContrast: localStorage.getItem('weather-high-contrast') === 'true',
            fontScale: parseInt(localStorage.getItem('weather-font-scale')) || 1
        };
        
        // Mark as active
        window.weatherSystemActive = true;
        window.weatherSystem = this;
        
        // Initialize
        this.init();
    }
    
    async init() {
        try {
            // Inject styles
            injectCSS();
            
            // Create container
            this.createContainer();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup intersection observer for footer
            this.setupFooterObserver();
            
            // Fetch initial weather
            await this.fetchWeather();
            
            // Start monitoring
            this.startMonitoring();
            
            // Show container
            setTimeout(() => {
                if (this.container) {
                    this.container.classList.add('visible');
                }
            }, 2000);
            
            console.log('✅ Weather Alert System v4.1 - Ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize weather system:', error);
        }
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'weather-alert';
        this.container.setAttribute('role', 'complementary');
        this.container.setAttribute('aria-label', 'Sistem de avertizare meteorologică municipală');
        this.container.setAttribute('tabindex', '0');
        this.container.innerHTML = createHTML(null);
        
        document.body.appendChild(this.container);
        this.applyAccessibility();
    }
    
    setupEventListeners() {
        if (!this.container) return;
        
        // Click anywhere on widget to expand (except buttons)
        this.container.addEventListener('click', (e) => {
            if (!e.target.closest('.weather-controls')) {
                this.toggleExpanded();
            }
        });
        
        // Accessibility button
        const accessBtn = this.container.querySelector('.accessibility-btn');
        if (accessBtn) {
            accessBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleAccessibility();
            });
        }
        
        // Expand button
        const expandBtn = this.container.querySelector('.expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleExpanded();
            });
        }
        
        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (e.target.classList.contains('accessibility-btn')) {
                    this.toggleAccessibility();
                } else if (e.target.classList.contains('expand-btn')) {
                    this.toggleExpanded();
                } else {
                    this.toggleExpanded();
                }
            } else if (e.key === 'Escape' && this.isExpanded) {
                this.isExpanded = false;
                this.updateExpandedState();
            }
        });
    }
    
    setupFooterObserver() {
        const footer = document.querySelector('footer');
        if (!footer) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.hide();
                } else {
                    this.show();
                }
            });
        }, {
            rootMargin: '0px 0px -20px 0px'
        });
        
        observer.observe(footer);
    }
    
    async fetchWeather() {
        try {
            // Cancel previous request
            if (this.fetchAbortController) {
                this.fetchAbortController.abort();
            }
            
            this.fetchAbortController = new AbortController();
            
            const params = new URLSearchParams({
                latitude: CONFIG.coordinates.lat.toString(),
                longitude: CONFIG.coordinates.lon.toString(),
                current: 'temperature_2m,weather_code,wind_speed_10m,precipitation,is_day',
                timezone: 'Europe/Bucharest'
            });
            
            const response = await fetch(`${CONFIG.apiUrl}?${params}`, {
                signal: this.fetchAbortController.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Validate data
            if (!data.current || typeof data.current.temperature_2m !== 'number') {
                throw new Error('Invalid weather data');
            }
            
            // Store current data
            this.currentData = {
                temp: Math.round(data.current.temperature_2m),
                weatherCode: data.current.weather_code || 0,
                wind: data.current.wind_speed_10m || 0,
                precipitation: data.current.precipitation || 0,
                isDay: data.current.is_day === 1
            };
            
            // Update display
            this.updateDisplay();
            
            // Check for alerts
            this.checkAlerts();
            
            // Flash update indicator
            this.flashUpdate();
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('❌ Weather fetch error:', error);
                this.showError();
            }
        }
    }
    
    updateDisplay() {
        if (!this.container || !this.currentData) return;
        
        const condition = getWeatherCondition(this.currentData.weatherCode, this.currentData.isDay);
        
        // Update icon
        const icon = this.container.querySelector('.weather-icon');
        if (icon) {
            icon.className = `material-icons weather-icon ${condition.anim}`;
            icon.textContent = condition.icon;
        }
        
        // Update temperature
        const temp = this.container.querySelector('.weather-temp');
        if (temp) {
            temp.textContent = `${this.currentData.temp}°C`;
        }
        
        // Update condition
        const conditionEl = this.container.querySelector('.weather-condition');
        if (conditionEl) {
            conditionEl.textContent = condition.name;
        }
        
        // Update ARIA label
        const now = new Date().toLocaleTimeString('ro-RO', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        this.container.setAttribute('aria-label', 
            `Sistem meteo Slobozia: ${condition.name}, ${this.currentData.temp} grade Celsius, actualizat ${now}`
        );
    }
    
    checkAlerts() {
        if (!this.currentData) return;
        
        const { temp, weatherCode, wind } = this.currentData;
        const condition = getWeatherCondition(weatherCode, this.currentData.isDay);
        let alert = null;
        
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
        if (condition.advice && SAFETY_ADVICE[condition.advice]) {
            const conditionAlert = SAFETY_ADVICE[condition.advice];
            if (!alert || this.getAlertPriority(conditionAlert.level) > this.getAlertPriority(alert.level)) {
                alert = conditionAlert;
            }
        }
        
        // Show or clear alert
        if (alert) {
            this.showAlert(alert);
        } else {
            this.clearAlert();
        }
    }
    
    getAlertPriority(level) {
        const priorities = {
            advisory: 1,
            warning: 2,
            critical: 3
        };
        return priorities[level] || 0;
    }
    
    showAlert(alert) {
        if (!this.container) return;
        
        this.currentAlert = alert;
        
        // Update container class
        this.container.className = `weather-alert visible ${alert.level}`;
        this.applyAccessibility();
        
        // Show alert header
        const header = this.container.querySelector('.weather-alert-header');
        const title = this.container.querySelector('.weather-alert-title');
        if (header && title) {
            title.textContent = alert.title;
            header.classList.add('visible');
        }
        
        // Show tips
        const tips = this.container.querySelector('.weather-tips ul');
        if (tips && alert.tips) {
            tips.innerHTML = alert.tips.map(tip => `<li>${tip}</li>`).join('');
        }
        
        // Show emergency contact for warnings and critical
        const emergency = this.container.querySelector('.weather-emergency');
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
        if (!this.container) return;
        
        this.currentAlert = null;
        
        // Reset container class
        this.container.className = 'weather-alert visible';
        this.applyAccessibility();
        
        // Hide alert elements
        const header = this.container.querySelector('.weather-alert-header');
        const tips = this.container.querySelector('.weather-tips');
        const emergency = this.container.querySelector('.weather-emergency');
        
        if (header) header.classList.remove('visible');
        if (tips) tips.classList.remove('visible');
        if (emergency) emergency.classList.remove('visible');
        
        // Collapse if expanded
        if (this.isExpanded) {
            this.isExpanded = false;
            this.updateExpandedState();
        }
    }
    
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        this.updateExpandedState();
    }
    
    updateExpandedState() {
        if (!this.container) return;
        
        this.container.classList.toggle('expanded', this.isExpanded);
        
        // Update expand button
        const expandBtn = this.container.querySelector('.expand-btn');
        if (expandBtn) {
            const icon = expandBtn.querySelector('i');
            if (icon) {
                icon.textContent = this.isExpanded ? 'expand_less' : 'expand_more';
            }
            expandBtn.setAttribute('aria-label', this.isExpanded ? TEXT.collapse : TEXT.expand);
            expandBtn.setAttribute('title', this.isExpanded ? TEXT.collapse : TEXT.expand);
        }
        
        // Show/hide tips
        const tips = this.container.querySelector('.weather-tips');
        if (tips) {
            tips.classList.toggle('visible', this.isExpanded);
        }
    }
    
    toggleAccessibility() {
        this.accessibility.highContrast = !this.accessibility.highContrast;
        localStorage.setItem('weather-high-contrast', this.accessibility.highContrast.toString());
        this.applyAccessibility();
        
        // Update button
        const accessBtn = this.container.querySelector('.accessibility-btn');
        if (accessBtn) {
            const icon = accessBtn.querySelector('i');
            if (icon) {
                icon.textContent = this.accessibility.highContrast ? 'visibility' : 'visibility_off';
            }
            accessBtn.setAttribute('aria-label', 
                this.accessibility.highContrast ? TEXT.accessibilityOn : TEXT.accessibility
            );
            accessBtn.setAttribute('title',
                this.accessibility.highContrast ? TEXT.accessibilityOn : TEXT.accessibility
            );
            accessBtn.classList.toggle('active', this.accessibility.highContrast);
        }
        
        console.log(`♿ High contrast: ${this.accessibility.highContrast ? 'ON' : 'OFF'}`);
    }
    
    applyAccessibility() {
        if (!this.container) return;
        
        this.container.classList.toggle('high-contrast', this.accessibility.highContrast);
        
        // Apply font scale
        this.container.classList.remove('font-scale-1', 'font-scale-2', 'font-scale-3', 'font-scale-4');
        this.container.classList.add(`font-scale-${this.accessibility.fontScale}`);
    }
    
    setFontScale(scale) {
        this.accessibility.fontScale = Math.max(1, Math.min(4, parseInt(scale)));
        localStorage.setItem('weather-font-scale', this.accessibility.fontScale.toString());
        this.applyAccessibility();
        console.log(`🔤 Font scale: ${this.accessibility.fontScale}x`);
    }
    
    flashUpdate() {
        const indicator = this.container?.querySelector('.weather-update');
        if (indicator) {
            indicator.classList.remove('flash');
            void indicator.offsetWidth; // Force reflow
            indicator.classList.add('flash');
        }
    }
    
    showError() {
        if (!this.container) return;
        
        const temp = this.container.querySelector('.weather-temp');
        const condition = this.container.querySelector('.weather-condition');
        
        if (temp) temp.textContent = '--°C';
        if (condition) condition.textContent = TEXT.error;
    }
    
    show() {
        if (!this.isHidden || !this.container) return;
        this.container.classList.remove('hidden');
        this.isHidden = false;
    }
    
    hide() {
        if (this.isHidden || !this.container) return;
        this.container.classList.add('hidden');
        this.isHidden = true;
    }
    
    startMonitoring() {
        // Update every 5 minutes
        this.updateTimer = setInterval(() => {
            this.fetchWeather();
        }, CONFIG.updateInterval);
    }
    
    destroy() {
        // Clear timer
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        
        // Abort any pending requests
        if (this.fetchAbortController) {
            this.fetchAbortController.abort();
        }
        
        // Remove container
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        
        // Clear global references
        delete window.weatherSystem;
        delete window.weatherSystemActive;
        
        console.log('🗑️ Weather system destroyed');
    }
}

// === TESTING INTERFACE ===
window.weatherTest = {
    // Set specific weather code
    setWeather(code) {
        if (!window.weatherSystem?.currentData) {
            console.warn('⚠️ Weather system not ready');
            return;
        }
        
        window.weatherSystem.currentData.weatherCode = code;
        window.weatherSystem.updateDisplay();
        window.weatherSystem.checkAlerts();
        console.log(`🌤️ Weather code: ${code}`);
    },
    
    // Set temperature
    setTemp(temp) {
        if (!window.weatherSystem?.currentData) {
            console.warn('⚠️ Weather system not ready');
            return;
        }
        
        window.weatherSystem.currentData.temp = temp;
        window.weatherSystem.updateDisplay();
        window.weatherSystem.checkAlerts();
        console.log(`🌡️ Temperature: ${temp}°C`);
    },
    
    // Set wind speed
    setWind(speed) {
        if (!window.weatherSystem?.currentData) {
            console.warn('⚠️ Weather system not ready');
            return;
        }
        
        window.weatherSystem.currentData.wind = speed;
        window.weatherSystem.checkAlerts();
        console.log(`💨 Wind: ${speed} km/h`);
    },
    
    // Toggle day/night
    toggleDayNight() {
        if (!window.weatherSystem?.currentData) {
            console.warn('⚠️ Weather system not ready');
            return;
        }
        
        window.weatherSystem.currentData.isDay = !window.weatherSystem.currentData.isDay;
        window.weatherSystem.updateDisplay();
        console.log(`🌓 ${window.weatherSystem.currentData.isDay ? 'Day' : 'Night'} mode`);
    },
    
    // Cycle through weather conditions
    cycle() {
        const codes = [0, 1, 3, 45, 61, 65, 71, 75, 95, 99];
        let i = 0;
        
        const interval = setInterval(() => {
            if (i >= codes.length) {
                clearInterval(interval);
                console.log('✅ Weather cycle complete');
                return;
            }
            
            this.setWeather(codes[i]);
            i++;
        }, 3000);
        
        console.log('🔄 Starting weather cycle...');
    },
    
    // Toggle accessibility
    toggleAccessibility() {
        window.weatherSystem?.toggleAccessibility();
    },
    
    // Set font scale
    setFontScale(scale) {
        window.weatherSystem?.setFontScale(scale);
    },
    
    // Expand widget
    expand() {
        if (window.weatherSystem && !window.weatherSystem.isExpanded) {
            window.weatherSystem.toggleExpanded();
        }
    },
    
    // Collapse widget
    collapse() {
        if (window.weatherSystem?.isExpanded) {
            window.weatherSystem.toggleExpanded();
        }
    },
    
    // Destroy and recreate
    reset() {
        window.weatherSystem?.destroy();
        setTimeout(() => {
            new WeatherAlertSystem();
        }, 500);
        console.log('🔄 Weather system reset');
    },
    
    // Show current state
    status() {
        if (!window.weatherSystem) {
            console.log('❌ Weather system not initialized');
            return;
        }
        
        console.log('📊 Weather System Status:');
        console.log('  Data:', window.weatherSystem.currentData);
        console.log('  Alert:', window.weatherSystem.currentAlert?.title || 'None');
        console.log('  Expanded:', window.weatherSystem.isExpanded);
        console.log('  Hidden:', window.weatherSystem.isHidden);
        console.log('  High Contrast:', window.weatherSystem.accessibility.highContrast);
        console.log('  Font Scale:', window.weatherSystem.accessibility.fontScale);
    }
};

// === AUTO-INITIALIZATION ===
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WeatherAlertSystem();
    });
} else {
    new WeatherAlertSystem();
}

// === PRODUCTION INFO ===
console.log('🏛️ Weather Alert System v4.1 - Production Ready');
console.log('📍 Location: Slobozia, Ialomița County, Romania');
console.log('🌓 Day/Night aware weather conditions');
console.log('♿ Accessibility: High contrast & font scaling');
console.log('🧪 Test: weatherTest.cycle() | weatherTest.status()');
console.log('🎨 Toggle: weatherTest.toggleAccessibility() | weatherTest.toggleDayNight()');
