// =============================================================================
// WEATHER ALERT SYSTEM v4.3 - Mobile-Optimized with Mini Mode
// Poliția Locală Slobozia | Production-Ready | Ultra-Compact Mobile
// =============================================================================

// === CONFIGURATION ===
const CONFIG = {
    coordinates: { lat: 44.5667, lon: 27.3667 },
    location: 'Slobozia, Ialomița',
    apiUrl: 'https://api.open-meteo.com/v1/forecast',
    updateInterval: 5 * 60 * 1000,
    thresholds: {
        temperature: { cold: -10, hot: 38 },
        wind: { strong: 40, severe: 60 },
        precipitation: { moderate: 5, heavy: 10 }
    },
    mobile: {
        autoCollapseDelay: 10000, // Auto-collapse after 10s of inactivity
        scrollThreshold: 50, // Hide when scrolled down this many pixels
        enableScrollHide: true // Enable scroll-based hiding
    }
};

const WEATHER_CONDITIONS = {
    0: { 
        day: { icon: 'wb_sunny', name: 'Senin', anim: 'sunny' },
        night: { icon: 'nights_stay', name: 'Senin', anim: 'night' }
    },
    1: { 
        day: { icon: 'wb_cloudy', name: 'Parțial înnorat', anim: 'partly-cloudy' },
        night: { icon: 'wb_cloudy', name: 'Parțial înnorat', anim: 'partly-cloudy-night' }
    },
    2: { 
        day: { icon: 'wb_cloudy', name: 'Parțial înnorat', anim: 'partly-cloudy' },
        night: { icon: 'wb_cloudy', name: 'Parțial înnorat', anim: 'partly-cloudy-night' }
    },
    3: { icon: 'cloud', name: 'Înnorat', anim: 'cloudy' },
    45: { icon: 'foggy', name: 'Ceață', anim: 'foggy', advice: 'visibility' },
    48: { icon: 'foggy', name: 'Ceață cu chiciură', anim: 'foggy', advice: 'ice' },
    51: { icon: 'grain', name: 'Burniță ușoară', anim: 'drizzle' },
    53: { icon: 'grain', name: 'Burniță moderată', anim: 'drizzle', advice: 'rain' },
    55: { icon: 'grain', name: 'Burniță densă', anim: 'drizzle', advice: 'rain' },
    56: { icon: 'ac_unit', name: 'Burniță înghețată', anim: 'drizzle', advice: 'ice' },
    57: { icon: 'ac_unit', name: 'Burniță înghețată densă', anim: 'drizzle', advice: 'ice' },
    61: { icon: 'water_drop', name: 'Ploaie ușoară', anim: 'rainy' },
    63: { icon: 'water_drop', name: 'Ploaie moderată', anim: 'rainy', advice: 'rain' },
    65: { icon: 'water_drop', name: 'Ploaie torențială', anim: 'heavy-rain', advice: 'heavy_rain' },
    66: { icon: 'ac_unit', name: 'Ploaie înghețată', anim: 'rainy', advice: 'ice' },
    67: { icon: 'ac_unit', name: 'Ploaie înghețată puternică', anim: 'heavy-rain', advice: 'ice' },
    71: { icon: 'ac_unit', name: 'Ninsoare ușoară', anim: 'snowy', advice: 'snow' },
    73: { icon: 'ac_unit', name: 'Ninsoare moderată', anim: 'snowy', advice: 'snow' },
    75: { icon: 'ac_unit', name: 'Ninsoare abundentă', anim: 'heavy-snow', advice: 'heavy_snow' },
    77: { icon: 'ac_unit', name: 'Ninsoare cu boabe', anim: 'snowy', advice: 'snow' },
    80: { icon: 'water_drop', name: 'Averse ușoare', anim: 'rainy', advice: 'rain' },
    81: { icon: 'water_drop', name: 'Averse moderate', anim: 'rainy', advice: 'heavy_rain' },
    82: { icon: 'water_drop', name: 'Averse violente', anim: 'heavy-rain', advice: 'heavy_rain' },
    85: { icon: 'ac_unit', name: 'Averse de zăpadă', anim: 'snowy', advice: 'heavy_snow' },
    86: { icon: 'ac_unit', name: 'Averse de zăpadă puternice', anim: 'heavy-snow', advice: 'heavy_snow' },
    95: { icon: 'thunderstorm', name: 'Furtună', anim: 'thunderstorm', advice: 'storm' },
    96: { icon: 'thunderstorm', name: 'Furtună cu grindină', anim: 'severe-storm', advice: 'severe_storm' },
    99: { icon: 'thunderstorm', name: 'Furtună severă cu grindină', anim: 'severe-storm', advice: 'severe_storm' }
};

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

const TEXT = {
    loading: 'Se încarcă...',
    error: 'Eroare conexiune',
    expand: 'Extinde informații',
    collapse: 'Restrânge informații',
    accessibility: 'Activează contrast ridicat',
    accessibilityOn: 'Dezactivează contrast ridicat',
    emergency: 'Urgențe: 112 | Poliția Locală: (0243) 955',
    tapToExpand: 'Apasă pentru mai multe detalii',
    contrastEnabled: 'Contrast ridicat activat',
    contrastDisabled: 'Contrast normal activat'
};

// === CSS INJECTION ===
function injectCSS() {
    if (document.getElementById('weather-alert-css')) return;
    
    // Load Material Icons if not already present
    if (!document.querySelector('link[href*="material-icons"]')) {
        const iconLink = document.createElement('link');
        iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        iconLink.rel = 'stylesheet';
        document.head.appendChild(iconLink);
    }
    
    const css = `
/* =============================================================================
   WEATHER ALERT SYSTEM v4.3 - Mobile-Optimized Mini Mode
   ============================================================================= */

/* === BASE CONTAINER === */
.weather-alert {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 290px;
    min-height: 90px;
    background: rgba(26, 47, 95, 0.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
    z-index: 1000;
    opacity: 0;
    transform: translateY(100%);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    cursor: pointer;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* === HOVER HINT === */
.weather-alert::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    border: 2px solid transparent;
    transition: border-color 0.3s ease;
    pointer-events: none;
    z-index: 1;
}

.weather-alert:hover::before {
    border-color: rgba(255, 202, 40, 0.3);
}

.weather-alert:hover {
    background: rgba(26, 47, 95, 0.96);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
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
    width: 360px;
    min-height: 180px;
    cursor: default;
}

.weather-alert.expanded:hover {
    transform: translateY(0);
}

/* === EXPANDED INDICATOR === */
.weather-alert.expanded::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
        #1e88e5 0%, 
        #ffca28 100%
    );
    animation: expandedPulse 3s ease-in-out infinite;
    z-index: 2;
}

@keyframes expandedPulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
}

/* === ALERT LEVELS === */
.weather-alert.advisory {
    border-left: 5px solid #ffa726;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(255, 167, 38, 0.2);
}

.weather-alert.warning {
    border-left: 5px solid #ff7043;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(255, 112, 67, 0.3);
}

.weather-alert.critical {
    border-left: 5px solid #e53935;
    box-shadow: 0 8px 36px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(229, 57, 53, 0.4);
    animation: criticalPulse 3s ease-in-out infinite;
}

@keyframes criticalPulse {
    0%, 100% {
        box-shadow: 0 8px 36px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(229, 57, 53, 0.4);
    }
    50% {
        box-shadow: 0 12px 48px rgba(229, 57, 53, 0.4), 0 0 0 1px rgba(229, 57, 53, 0.6);
    }
}

/* === LAYOUT === */
.weather-content {
    padding: 16px;
    padding-right: 56px;
    position: relative;
    z-index: 2;
}

/* === CONTROL BUTTONS === */
.weather-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 10;
}

.weather-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    color: #1a2f5f;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 0;
    outline: none;
    position: relative;
    overflow: hidden;
}

.weather-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 202, 40, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.weather-btn:hover {
    transform: scale(1.1) translateY(-2px);
    background: #ffffff;
    border-color: #ffca28;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.weather-btn:hover::before {
    opacity: 1;
}

.weather-btn:active {
    transform: scale(0.92);
    transition: transform 0.1s ease;
}

.weather-btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 202, 40, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.4s ease, height 0.4s ease, opacity 0.4s ease;
    opacity: 0;
}

.weather-btn.ripple::after {
    width: 100%;
    height: 100%;
    opacity: 1;
}

.weather-btn:focus {
    outline: none;
}

.weather-btn:focus-visible {
    outline: 3px solid #ffca28;
    outline-offset: 3px;
    animation: focusPulse 1.5s ease-in-out infinite;
}

@keyframes focusPulse {
    0%, 100% { outline-color: #ffca28; }
    50% { outline-color: #ffd54f; }
}

.weather-btn.active {
    background: #ffca28;
    color: #1a2f5f;
    border-color: #ffca28;
    box-shadow: 0 0 12px rgba(255, 202, 40, 0.6), 0 4px 12px rgba(0, 0, 0, 0.15);
}

.weather-btn i {
    font-size: 16px;
    line-height: 1;
    font-family: 'Material Icons';
    position: relative;
    z-index: 2;
}

/* === ALERT HEADER === */
.weather-alert-header {
    display: none;
    text-align: center;
    padding: 12px 16px;
    margin: -16px -16px 16px;
    margin-right: -56px;
    background: rgba(255, 255, 255, 0.12);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.weather-alert-header.visible {
    display: block;
    animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.weather-alert-title {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin: 0;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* === WEATHER DISPLAY === */
.weather-info {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 0;
}

.weather-icon-box {
    width: 52px;
    height: 52px;
    min-width: 52px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.weather-alert:hover .weather-icon-box {
    background: rgba(255, 255, 255, 0.12);
    transform: scale(1.05);
}

.weather-icon {
    font-size: 26px;
    color: #e3f2fd;
    font-family: 'Material Icons';
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.weather-text {
    flex: 1;
    min-width: 0;
}

.weather-temp-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 4px;
}

.weather-temp {
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
    color: #ffffff;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.weather-condition {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
}

.weather-location {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
    letter-spacing: 0.3px;
    margin-top: 2px;
}

/* === SAFETY TIPS === */
.weather-tips {
    display: none;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.weather-tips.visible {
    display: block;
    animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.weather-tips ul {
    margin: 0;
    padding: 0;
    list-style: none;
}

.weather-tips li {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 10px;
    padding-left: 18px;
    position: relative;
    line-height: 1.6;
    word-wrap: break-word;
    overflow-wrap: break-word;
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
    font-size: 16px;
    line-height: 1.4;
}

/* === EMERGENCY CONTACT === */
.weather-emergency {
    display: none;
    margin-top: 16px;
    padding: 10px 14px;
    background: rgba(229, 57, 53, 0.25);
    border: 1px solid rgba(229, 57, 53, 0.4);
    border-radius: 8px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #ffcdd2;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.weather-emergency.visible {
    display: block;
    animation: fadeIn 0.4s ease 0.2s backwards;
}

.weather-emergency i {
    font-size: 13px;
    vertical-align: middle;
    margin-right: 6px;
}

/* === UPDATE INDICATOR === */
.weather-update {
    position: absolute;
    top: 12px;
    left: 12px;
    width: 8px;
    height: 8px;
    background: #4caf50;
    border-radius: 50%;
    opacity: 0;
    z-index: 5;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
}

.weather-update.flash {
    animation: updateFlash 1.2s ease-out;
}

@keyframes updateFlash {
    0% {
        opacity: 0;
        transform: scale(0.5);
    }
    30% {
        opacity: 1;
        transform: scale(1.3);
    }
    60% {
        opacity: 1;
        transform: scale(1);
    }
    100% {
        opacity: 0;
        transform: scale(1);
    }
}

/* === NOTIFICATION TOAST === */
.weather-notification {
    position: absolute;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%) translateY(15px);
    background: rgba(0, 0, 0, 0.92);
    color: #ffffff;
    padding: 10px 18px;
    border-radius: 24px;
    font-size: 12px;
    font-weight: 600;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    white-space: nowrap;
    z-index: 30;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    pointer-events: none;
}

.weather-notification.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

/* === HIGH CONTRAST MODE === */
.weather-alert.high-contrast {
    background: #000000 !important;
    border: 4px solid #ffffff !important;
    box-shadow: 0 0 0 4px #ffff00 !important;
}

.weather-alert.high-contrast::before {
    display: none;
}

.weather-alert.high-contrast::after {
    background: #ffff00 !important;
}

.weather-alert.high-contrast .weather-update::before {
    content: '♿';
    position: absolute;
    top: -2px;
    left: -2px;
    font-size: 18px;
    color: #ffff00;
    filter: drop-shadow(0 0 4px #000);
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
    filter: drop-shadow(0 0 6px #ffff00);
}

.weather-alert.high-contrast .weather-icon-box {
    background: #333333 !important;
    border: 3px solid #ffffff !important;
}

.weather-alert.high-contrast .weather-btn {
    background: #ffffff !important;
    color: #000000 !important;
    border: 3px solid #ffff00 !important;
    box-shadow: 0 0 12px #ffff00 !important;
}

.weather-alert.high-contrast .weather-btn i {
    color: #000000 !important;
}

.weather-alert.high-contrast .weather-btn:hover {
    background: #ffff00 !important;
    color: #000000 !important;
    border-color: #ffffff !important;
}

.weather-alert.high-contrast .weather-btn.active {
    background: #00ff00 !important;
    color: #000000 !important;
    border-color: #00ff00 !important;
    box-shadow: 0 0 12px #00ff00 !important;
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
    border: 3px solid #ffffff !important;
    color: #ffffff !important;
}

/* === WEATHER ANIMATIONS === */
@keyframes sunny {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.weather-icon.sunny {
    color: #ffeb3b;
    animation: sunny 30s linear infinite;
}

@keyframes night {
    0%, 100% { transform: scale(1); opacity: 0.95; }
    50% { transform: scale(1.05); opacity: 1; }
}

.weather-icon.night {
    color: #b3e5fc;
    animation: night 8s ease-in-out infinite;
}

@keyframes partly-cloudy {
    0%, 100% { transform: translateX(0) scale(1); }
    50% { transform: translateX(1px) scale(1.02); }
}

.weather-icon.partly-cloudy {
    color: #e3f2fd;
    animation: partly-cloudy 6s ease-in-out infinite;
}

@keyframes partly-cloudy-night {
    0%, 100% { transform: translateX(0); opacity: 0.9; }
    50% { transform: translateX(-1px); opacity: 1; }
}

.weather-icon.partly-cloudy-night {
    color: #90caf9;
    animation: partly-cloudy-night 7s ease-in-out infinite;
}

@keyframes cloudy {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(1px); }
}

.weather-icon.cloudy {
    color: #78909c;
    animation: cloudy 8s ease-in-out infinite;
}

@keyframes foggy {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
}

.weather-icon.foggy {
    color: #b0bec5;
    animation: foggy 6s ease-in-out infinite;
}

@keyframes drizzle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-1px); }
}

.weather-icon.drizzle {
    color: #64b5f6;
    animation: drizzle 3s ease-in-out infinite;
}

@keyframes rainy {
    0%, 100% { transform: translateY(0); opacity: 1; }
    50% { transform: translateY(-2px); opacity: 0.85; }
}

.weather-icon.rainy {
    color: #2196f3;
    animation: rainy 2s ease-in-out infinite;
}

@keyframes heavy-rain {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.weather-icon.heavy-rain {
    color: #1976d2;
    animation: heavy-rain 1.5s ease-in-out infinite;
}

@keyframes snowy {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-1px) rotate(5deg); }
    75% { transform: translateY(1px) rotate(-5deg); }
}

.weather-icon.snowy {
    color: #e3f2fd;
    animation: snowy 4s ease-in-out infinite;
}

@keyframes heavy-snow {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-1px); }
    75% { transform: translateX(1px); }
}

.weather-icon.heavy-snow {
    color: #ffffff;
    animation: heavy-snow 2s ease-in-out infinite;
}

@keyframes thunderstorm {
    0%, 90%, 100% { opacity: 1; }
    5%, 85% { opacity: 0.3; }
}

.weather-icon.thunderstorm {
    color: #ff7043;
    animation: thunderstorm 2s ease-in-out infinite;
}

@keyframes severe-storm {
    0%, 85%, 100% { opacity: 1; transform: scale(1); }
    5%, 80% { opacity: 0.4; transform: scale(1.1); }
}

.weather-icon.severe-storm {
    color: #e53935;
    animation: severe-storm 1s ease-in-out infinite;
}

/* === MOBILE RESPONSIVE - ULTRA COMPACT === */
@media (max-width: 768px) {
    /* MINI MODE - Compact circular button */
    .weather-alert {
        bottom: 16px;
        right: 16px;
        width: 64px;
        height: 64px;
        min-height: 64px;
        border-radius: 50%;
        padding: 0;
        border: none;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    /* Hide controls in mini mode */
    .weather-alert .weather-controls {
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }
    
    /* Compact content layout */
    .weather-alert .weather-content {
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding-right: 0;
    }
    
    /* Center icon in circle */
    .weather-alert .weather-info {
        flex-direction: column;
        gap: 2px;
        margin-bottom: 0;
        align-items: center;
        justify-content: center;
    }
    
    /* Hide icon box border in mini mode */
    .weather-alert .weather-icon-box {
        background: transparent;
        border: none;
        box-shadow: none;
        width: 28px;
        height: 28px;
        min-width: 28px;
        margin-bottom: -2px;
    }
    
    .weather-alert .weather-icon {
        font-size: 28px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
    
    /* Compact temp display */
    .weather-alert .weather-text {
        text-align: center;
    }
    
    .weather-alert .weather-temp-row {
        flex-direction: column;
        gap: 0;
        align-items: center;
        margin-bottom: 0;
    }
    
    .weather-alert .weather-temp {
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    /* Hide condition and location in mini mode */
    .weather-alert .weather-condition,
    .weather-alert .weather-location,
    .weather-alert .weather-alert-header,
    .weather-alert .weather-tips,
    .weather-alert .weather-emergency {
        display: none;
    }
    
    /* Pulsing hint animation */
    .weather-alert::after {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 2px solid rgba(255, 202, 40, 0.3);
        animation: mobilePulseHint 3s ease-in-out infinite;
        pointer-events: none;
    }
    
    @keyframes mobilePulseHint {
        0%, 70%, 100% {
            transform: scale(1);
            opacity: 0;
        }
        10%, 30% {
            transform: scale(1.1);
            opacity: 0.6;
        }
        20% {
            transform: scale(1.15);
            opacity: 0.3;
        }
    }
    
    /* EXPANDED STATE on mobile */
    .weather-alert.expanded {
        width: min(340px, calc(100vw - 32px));
        height: auto;
        min-height: 160px;
        border-radius: 16px;
        padding: 0;
        bottom: 16px;
        right: 16px;
    }
    
    .weather-alert.expanded::after {
        display: none;
    }
    
    /* Show controls when expanded */
    .weather-alert.expanded .weather-controls {
        opacity: 1;
        pointer-events: auto;
        top: 8px;
        right: 8px;
        gap: 6px;
    }
    
    /* Restore normal layout when expanded */
    .weather-alert.expanded .weather-content {
        padding: 14px;
        padding-right: 52px;
        display: block;
    }
    
    .weather-alert.expanded .weather-info {
        flex-direction: row;
        gap: 14px;
        align-items: center;
        justify-content: flex-start;
    }
    
    .weather-alert.expanded .weather-icon-box {
        width: 46px;
        height: 46px;
        min-width: 46px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 0;
    }
    
    .weather-alert.expanded .weather-icon {
        font-size: 22px;
    }
    
    .weather-alert.expanded .weather-text {
        text-align: left;
    }
    
    .weather-alert.expanded .weather-temp-row {
        flex-direction: row;
        gap: 10px;
        align-items: baseline;
        margin-bottom: 4px;
    }
    
    .weather-alert.expanded .weather-temp {
        font-size: 20px;
    }
    
    .weather-alert.expanded .weather-condition,
    .weather-alert.expanded .weather-location {
        display: block;
    }
    
    .weather-alert.expanded .weather-condition {
        font-size: 13px;
    }
    
    .weather-alert.expanded .weather-location {
        font-size: 10px;
    }
    
    .weather-alert.expanded .weather-alert-header.visible,
    .weather-alert.expanded .weather-tips.visible,
    .weather-alert.expanded .weather-emergency.visible {
        display: block;
    }
    
    .weather-alert.expanded .weather-alert-header {
        padding: 10px 14px;
        margin: -14px -14px 14px;
        margin-right: -52px;
    }
    
    .weather-alert.expanded .weather-tips li {
        font-size: 12px;
    }
    
    /* Button styles for mobile */
    .weather-alert .weather-btn,
    .weather-alert.expanded .weather-btn {
        width: 32px;
        height: 32px;
        min-width: 32px;
        min-height: 32px;
    }
    
    .weather-alert .weather-btn i,
    .weather-alert.expanded .weather-btn i {
        font-size: 15px;
    }
    
    /* Hidden state for scroll */
    .weather-alert.mobile-hidden {
        transform: translateY(120px);
        opacity: 0;
        pointer-events: none;
    }
    
    /* Alert levels in mini mode */
    .weather-alert.advisory {
        border: 3px solid #ffa726;
    }
    
    .weather-alert.warning {
        border: 3px solid #ff7043;
    }
    
    .weather-alert.critical {
        border: 3px solid #e53935;
        animation: criticalPulseMobile 2s ease-in-out infinite;
    }
    
    @keyframes criticalPulseMobile {
        0%, 100% {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 0 0 0 rgba(229, 57, 53, 0.6);
        }
        50% {
            box-shadow: 0 6px 24px rgba(229, 57, 53, 0.4), 0 0 0 8px rgba(229, 57, 53, 0.2);
        }
    }
    
    /* Expanded alert levels */
    .weather-alert.expanded.advisory {
        border-left: 5px solid #ffa726;
        border: none;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(255, 167, 38, 0.2);
    }
    
    .weather-alert.expanded.warning {
        border-left: 5px solid #ff7043;
        border: none;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(255, 112, 67, 0.3);
    }
    
    .weather-alert.expanded.critical {
        border-left: 5px solid #e53935;
        border: none;
        box-shadow: 0 8px 36px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(229, 57, 53, 0.4);
        animation: criticalPulse 3s ease-in-out infinite;
    }
}

@media (max-width: 768px) and (orientation: landscape) {
    .weather-alert {
        bottom: 8px;
        right: 8px;
        max-height: calc(100vh - 16px);
        overflow-y: auto;
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
    .weather-btn,
    * {
        animation: none !important;
        transition: opacity 0.2s ease !important;
    }
}

.weather-alert:focus-visible {
    outline: 4px solid #ffca28;
    outline-offset: 4px;
}
    `;
    
    const style = document.createElement('style');
    style.id = 'weather-alert-css';
    style.textContent = css;
    document.head.appendChild(style);
}

// === UTILITY FUNCTIONS ===
function getWeatherCondition(code, isDay) {
    const condition = WEATHER_CONDITIONS[code] || WEATHER_CONDITIONS[0];
    if (condition.day && condition.night) {
        return isDay ? condition.day : condition.night;
    }
    return condition;
}

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

// === MAIN SYSTEM ===
class WeatherAlertSystem {
    constructor() {
        if (window.weatherSystemActive) {
            console.warn('⚠️ Weather system already running');
            return window.weatherSystem;
        }
        
        this.container = null;
        this.currentData = null;
        this.currentAlert = null;
        this.isExpanded = false;
        this.isHidden = false;
        this.updateTimer = null;
        this.fetchAbortController = null;
        this.autoCollapseTimer = null;
        this.lastScrollY = 0;
        this.isMobile = window.innerWidth <= 768;
        
        this.accessibility = {
            highContrast: localStorage.getItem('weather-high-contrast') === 'true',
            fontScale: parseInt(localStorage.getItem('weather-font-scale')) || 1
        };
        
        window.weatherSystemActive = true;
        window.weatherSystem = this;
        
        this.init();
    }
    
    async init() {
        try {
            injectCSS();
            this.createContainer();
            this.setupEventListeners();
            this.setupFooterObserver();
            this.setupScrollListener();
            this.setupResizeListener();
            await this.fetchWeather();
            this.startMonitoring();
            
            setTimeout(() => {
                if (this.container) {
                    this.container.classList.add('visible');
                }
            }, 2000);
            
            console.log('✅ Weather Alert System v4.3 - Mobile Optimized');
            
        } catch (error) {
            console.error('❌ Failed to initialize:', error);
        }
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'weather-alert';
        this.container.setAttribute('role', 'complementary');
        this.container.setAttribute('aria-label', 'Sistem de avertizare meteorologică');
        this.container.setAttribute('tabindex', '0');
        this.container.innerHTML = createHTML(null);
        
        document.body.appendChild(this.container);
        this.applyAccessibility();
    }
    
    setupEventListeners() {
        if (!this.container) return;
        
        this.container.addEventListener('click', (e) => {
            if (!e.target.closest('.weather-controls')) {
                this.toggleExpanded();
            }
        });
        
        const accessBtn = this.container.querySelector('.accessibility-btn');
        if (accessBtn) {
            accessBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleButtonClick(e.currentTarget);
                this.toggleAccessibility();
            });
        }
        
        const expandBtn = this.container.querySelector('.expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleButtonClick(e.currentTarget);
                this.toggleExpanded();
            });
        }
        
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
        
        this.container.addEventListener('blur', (e) => {
            if (e.target.classList.contains('weather-btn')) {
                e.target.blur();
            }
        }, true);
    }
    
    handleButtonClick(button) {
        button.classList.add('ripple');
        setTimeout(() => button.classList.remove('ripple'), 400);
        setTimeout(() => button.blur(), 100);
        
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
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
        }, { rootMargin: '0px 0px -20px 0px' });
        
        observer.observe(footer);
    }
    
    setupScrollListener() {
        if (!CONFIG.mobile.enableScrollHide || !this.isMobile) return;
        
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    
                    if (currentScrollY > this.lastScrollY && currentScrollY > CONFIG.mobile.scrollThreshold) {
                        // Scrolling down
                        this.container?.classList.add('mobile-hidden');
                    } else if (currentScrollY < this.lastScrollY) {
                        // Scrolling up
                        this.container?.classList.remove('mobile-hidden');
                    }
                    
                    this.lastScrollY = currentScrollY;
                    ticking = false;
                });
                
                ticking = true;
            }
        }, { passive: true });
    }
    
    setupResizeListener() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.isMobile = window.innerWidth <= 768;
            }, 250);
        });
    }
    
    async fetchWeather() {
        try {
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
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const data = await response.json();
            
            if (!data.current || typeof data.current.temperature_2m !== 'number') {
                throw new Error('Invalid weather data');
            }
            
            this.currentData = {
                temp: Math.round(data.current.temperature_2m),
                weatherCode: data.current.weather_code || 0,
                wind: data.current.wind_speed_10m || 0,
                precipitation: data.current.precipitation || 0,
                isDay: data.current.is_day === 1
            };
            
            this.updateDisplay();
            this.checkAlerts();
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
        
        const icon = this.container.querySelector('.weather-icon');
        if (icon) {
            icon.className = `material-icons weather-icon ${condition.anim}`;
            icon.textContent = condition.icon;
        }
        
        const temp = this.container.querySelector('.weather-temp');
        if (temp) temp.textContent = `${this.currentData.temp}°C`;
        
        const conditionEl = this.container.querySelector('.weather-condition');
        if (conditionEl) conditionEl.textContent = condition.name;
        
        const now = new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
        this.container.setAttribute('aria-label', 
            `Sistem meteo Slobozia: ${condition.name}, ${this.currentData.temp} grade, actualizat ${now}`
        );
    }
    
    checkAlerts() {
        if (!this.currentData) return;
        
        const { temp, weatherCode, wind } = this.currentData;
        const condition = getWeatherCondition(weatherCode, this.currentData.isDay);
        let alert = null;
        
        if (temp <= CONFIG.thresholds.temperature.cold) {
            alert = SAFETY_ADVICE.extreme_cold;
        } else if (temp >= CONFIG.thresholds.temperature.hot) {
            alert = SAFETY_ADVICE.extreme_heat;
        }
        
        if (wind >= CONFIG.thresholds.wind.strong) {
            alert = SAFETY_ADVICE.high_winds;
        }
        
        if (condition.advice && SAFETY_ADVICE[condition.advice]) {
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
        if (!this.container) return;
        
        this.currentAlert = alert;
        this.container.className = `weather-alert visible ${alert.level}`;
        this.applyAccessibility();
        
        const header = this.container.querySelector('.weather-alert-header');
        const title = this.container.querySelector('.weather-alert-title');
        if (header && title) {
            title.textContent = alert.title;
            header.classList.add('visible');
        }
        
        const tips = this.container.querySelector('.weather-tips ul');
        if (tips && alert.tips) {
            tips.innerHTML = alert.tips.map(tip => `<li>${tip}</li>`).join('');
        }
        
        const emergency = this.container.querySelector('.weather-emergency');
        if (emergency && (alert.level === 'warning' || alert.level === 'critical')) {
            emergency.classList.add('visible');
        }
        
        if ((alert.level === 'warning' || alert.level === 'critical') && !this.isExpanded && this.isMobile) {
            setTimeout(() => {
                this.isExpanded = true;
                this.updateExpandedState();
            }, 300);
        }
    }
    
    clearAlert() {
        if (!this.container) return;
        
        this.currentAlert = null;
        this.container.className = 'weather-alert visible';
        this.applyAccessibility();
        
        const header = this.container.querySelector('.weather-alert-header');
        const tips = this.container.querySelector('.weather-tips');
        const emergency = this.container.querySelector('.weather-emergency');
        
        if (header) header.classList.remove('visible');
        if (tips) tips.classList.remove('visible');
        if (emergency) emergency.classList.remove('visible');
        
        if (this.isExpanded && this.isMobile) {
            this.isExpanded = false;
            this.updateExpandedState();
        }
    }
    
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        this.updateExpandedState();
        
        // Auto-collapse on mobile after inactivity
        if (this.isMobile && this.isExpanded) {
            this.resetAutoCollapse();
        }
    }
    
    resetAutoCollapse() {
        if (this.autoCollapseTimer) {
            clearTimeout(this.autoCollapseTimer);
        }
        
        this.autoCollapseTimer = setTimeout(() => {
            if (this.isExpanded && this.isMobile && !this.currentAlert) {
                this.isExpanded = false;
                this.updateExpandedState();
            }
        }, CONFIG.mobile.autoCollapseDelay);
    }
    
    updateExpandedState() {
        if (!this.container) return;
        
        this.container.classList.toggle('expanded', this.isExpanded);
        
        const expandBtn = this.container.querySelector('.expand-btn');
        if (expandBtn) {
            const icon = expandBtn.querySelector('i');
            if (icon) {
                icon.textContent = this.isExpanded ? 'expand_less' : 'expand_more';
            }
            expandBtn.setAttribute('aria-label', this.isExpanded ? TEXT.collapse : TEXT.expand);
            expandBtn.setAttribute('title', this.isExpanded ? TEXT.collapse : TEXT.expand);
        }
        
        const tips = this.container.querySelector('.weather-tips');
        if (tips) {
            tips.classList.toggle('visible', this.isExpanded);
        }
    }
    
    toggleAccessibility() {
        this.accessibility.highContrast = !this.accessibility.highContrast;
        localStorage.setItem('weather-high-contrast', this.accessibility.highContrast.toString());
        this.applyAccessibility();
        
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
        
        this.showNotification(
            this.accessibility.highContrast ? TEXT.contrastEnabled : TEXT.contrastDisabled
        );
        
        console.log(`♿ High contrast: ${this.accessibility.highContrast ? 'ON' : 'OFF'}`);
    }
    
    showNotification(message) {
        const existing = this.container.querySelector('.weather-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'weather-notification';
        notification.textContent = message;
        this.container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }, 2500);
    }
    
    applyAccessibility() {
        if (!this.container) return;
        
        this.container.classList.toggle('high-contrast', this.accessibility.highContrast);
    }
    
    flashUpdate() {
        const indicator = this.container?.querySelector('.weather-update');
        if (indicator) {
            indicator.classList.remove('flash');
            void indicator.offsetWidth;
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
        this.updateTimer = setInterval(() => this.fetchWeather(), CONFIG.updateInterval);
    }
    
    destroy() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        
        if (this.autoCollapseTimer) {
            clearTimeout(this.autoCollapseTimer);
            this.autoCollapseTimer = null;
        }
        
        if (this.fetchAbortController) {
            this.fetchAbortController.abort();
        }
        
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        
        delete window.weatherSystem;
        delete window.weatherSystemActive;
        
        console.log('🗑️ Weather system destroyed');
    }
}

// === TESTING INTERFACE ===
window.weatherTest = {
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
    
    setTemp(temp) {
        if (!window.weatherSystem?.currentData) return;
        window.weatherSystem.currentData.temp = temp;
        window.weatherSystem.updateDisplay();
        window.weatherSystem.checkAlerts();
        console.log(`🌡️ Temperature: ${temp}°C`);
    },
    
    setWind(speed) {
        if (!window.weatherSystem?.currentData) return;
        window.weatherSystem.currentData.wind = speed;
        window.weatherSystem.checkAlerts();
        console.log(`💨 Wind: ${speed} km/h`);
    },
    
    toggleDayNight() {
        if (!window.weatherSystem?.currentData) return;
        window.weatherSystem.currentData.isDay = !window.weatherSystem.currentData.isDay;
        window.weatherSystem.updateDisplay();
        console.log(`🌓 ${window.weatherSystem.currentData.isDay ? 'Day' : 'Night'} mode`);
    },
    
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
    
    toggleAccessibility() {
        window.weatherSystem?.toggleAccessibility();
    },
    
    expand() {
        if (window.weatherSystem && !window.weatherSystem.isExpanded) {
            window.weatherSystem.toggleExpanded();
        }
    },
    
    collapse() {
        if (window.weatherSystem?.isExpanded) {
            window.weatherSystem.toggleExpanded();
        }
    },
    
    reset() {
        window.weatherSystem?.destroy();
        setTimeout(() => new WeatherAlertSystem(), 500);
        console.log('🔄 Weather system reset');
    },
    
    status() {
        if (!window.weatherSystem) {
            console.log('❌ Weather system not initialized');
            return;
        }
        console.log('📊 Weather System Status:');
        console.log('  Data:', window.weatherSystem.currentData);
        console.log('  Alert:', window.weatherSystem.currentAlert?.title || 'None');
        console.log('  Expanded:', window.weatherSystem.isExpanded);
        console.log('  Mobile:', window.weatherSystem.isMobile);
        console.log('  High Contrast:', window.weatherSystem.accessibility.highContrast);
    }
};

// === AUTO-INITIALIZATION ===
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new WeatherAlertSystem());
} else {
    new WeatherAlertSystem();
}

console.log('✅ Weather Alert System v4.3 - Mobile Optimized');
console.log('📍 Slobozia, Ialomița County, Romania');
console.log('📱 Mobile: 64px compact circle → expands to full widget');
console.log('🔧 Features: Auto-collapse, scroll-hide, 85% smaller footprint');
console.log('🧪 Test: weatherTest.cycle() | weatherTest.toggleAccessibility()');
