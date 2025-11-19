// =============================================================================
// UNIFIED CITIZEN EXPERIENCE WIDGET v1.0
// Polița Locală Slobozia | Production-Ready | Mobile-First Design
// Combines: Weather Alert System + Accessibility Controls
// =============================================================================

// === CONFIGURATION ===
const UNIFIED_CONFIG = {
    // Weather Config
    weather: {
        coordinates: { lat: 44.5667, lon: 27.3667 },
        location: 'Slobozia, Ialomița',
        apiUrl: 'https://api.open-meteo.com/v1/forecast',
        updateInterval: 5 * 60 * 1000,
        thresholds: {
            temperature: { cold: -10, hot: 38 },
            wind: { strong: 40, severe: 60 },
            precipitation: { moderate: 5, heavy: 10 }
        }
    },
    
    // Accessibility Config
    accessibility: {
        storageKey: 'pls_accessibility_prefs',
        bannerKey: 'pls_accessibility_banner_dismissed',
        bannerDelay: 1000,
        toastDuration: 3000,
        showBanner: true // Show first-visit banner
    },
    
    // UI Config
    ui: {
        mobileBreakpoint: 768,
        buttonGap: 8,
        autoCollapseDelay: 10000,
        scrollThreshold: 50,
        enableScrollHide: false, // Disabled - widgets always visible
        animations: {
            gentle: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
            duration: 300
        }
    }
};

// === WEATHER CONDITIONS DATA ===
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

// === SAFETY ADVICE DATA ===
const SAFETY_ADVICE = {
    visibility: { 
        level: 'advisory', 
        title: 'ATENȚIE - VIZIBILITATE REDUSĂ', 
        tips: [
            'Conduceți cu atenție sporită și vitează redusă',
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

// === TEXT RESOURCES ===
const TEXT = {
    accessibility: {
        title: 'Setări de Accesibilitate',
        largerText: {
            label: 'Text mai mare',
            description: 'Face textul mai ușor de citit'
        },
        highContrast: {
            label: 'Evidențiere contrast ridicat',
            description: 'Evidențiază cuvintele importante la trecerea mouse-ului'
        },
        saveBtn: 'Salvează preferințele',
        resetBtn: 'Resetează',
        tooltip: 'Setări de accesibilitate',
        ariaLabel: 'Deschide setările de accesibilitate',
        toastSaved: 'Preferințe salvate. Le puteți schimba oricând.',
        toastReset: 'Preferințele au fost resetate.',
        toastApplied: 'Setările de accesibilitate au fost aplicate.',
        banner: {
            question: 'Doriți să îmbunătățiți vizibilitatea textului?',
            helpBtn: 'Da, ajută-mă',
            dismissBtn: 'Nu, mulțumesc'
        }
    },
    weather: {
        loading: 'Se încarcă...',
        error: 'Eroare conexiune',
        expand: 'Extinde informații',
        collapse: 'Restrânge informații',
        emergency: 'Urgențe: 112 | Poliția Locală: (0243) 955',
        ariaLabel: 'Informații meteorologice'
    },
    tabs: {
        accessibility: 'Accesibilitate',
        weather: 'Meteo'
    }
};

// === CSS INJECTION ===
function injectUnifiedCSS() {
    if (document.getElementById('unified-citizen-widget-css')) return;
    
    const style = document.createElement('style');
    style.id = 'unified-citizen-widget-css';
    style.textContent = `
/* =============================================================================
   UNIFIED CITIZEN EXPERIENCE WIDGET v1.0
   ============================================================================= */

/* Import Material Icons & Symbols */
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* === SHARED STYLES === */
.citizen-widget-base {
    position: fixed;
    background: rgba(26, 47, 95, 0.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 12px;
    border: 3px solid #ffca28;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
    z-index: 9996;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* === MOBILE: TWO SEPARATE BUTTONS === */
@media (max-width: 768px) {
    /* Accessibility Button (Top) */
    .citizen-accessibility-btn {
        bottom: 88px;
        right: 16px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: translateY(100%);
    }
    
    .citizen-accessibility-btn.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .citizen-accessibility-btn:hover {
        transform: scale(1.1) translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }
    
    .citizen-accessibility-btn i {
        font-size: 28px;
        color: #ffffff;
    }
    
    /* Weather Button (Bottom) */
    .citizen-weather-btn {
        bottom: 16px;
        right: 16px;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        cursor: pointer;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: translateY(100%);
    }
    
    .citizen-weather-btn.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .citizen-weather-btn:hover {
        transform: scale(1.05) translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }
    
    .citizen-weather-btn .weather-icon {
        font-size: 28px;
        color: #e3f2fd;
        margin-bottom: -2px;
    }
    
    .citizen-weather-btn .weather-temp {
        font-size: 11px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1;
    }
    
    /* Panels - Full Sheet from Bottom */
    .citizen-panel {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        max-height: 85vh;
        border-radius: 16px 16px 0 0;
        transform: translateY(100%);
        opacity: 0;
        pointer-events: none;
        overflow-y: auto;
        z-index: 9997;
    }
    
    .citizen-panel.visible {
        transform: translateY(0);
        opacity: 1;
        pointer-events: all;
    }
    
    /* Desktop unified widget hidden on mobile */
    .citizen-unified-desktop {
        display: none;
    }
}

/* === DESKTOP: UNIFIED TABBED WIDGET === */
@media (min-width: 769px) {
    /* Hide mobile buttons */
    .citizen-accessibility-btn,
    .citizen-weather-btn {
        display: none;
    }
    
    /* Unified Desktop Widget */
    .citizen-unified-desktop {
        bottom: 20px;
        right: 20px;
        width: 290px;
        min-height: 90px;
        opacity: 0;
        transform: translateY(100%);
    }
    
    .citizen-unified-desktop.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .citizen-unified-desktop.expanded {
        width: 380px;
        min-height: 200px;
    }
    
    .citizen-unified-desktop:not(.expanded) {
        cursor: pointer;
    }
    
    .citizen-unified-desktop:not(.expanded):hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }
    
    /* Desktop Compact View */
    .desktop-compact {
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 14px;
    }
    
    .desktop-compact .icon-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .desktop-compact .symptoms-icon {
        font-size: 24px;
        color: #ffca28;
    }
    
    .desktop-compact .weather-icon-box {
        width: 42px;
        height: 42px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .desktop-compact .weather-icon {
        font-size: 22px;
        color: #e3f2fd;
    }
    
    .desktop-compact .weather-info {
        flex: 1;
    }
    
    .desktop-compact .weather-temp {
        font-size: 20px;
        font-weight: 700;
        color: #ffffff;
    }
    
    .desktop-compact .weather-condition {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
    }
    
    .desktop-compact .weather-location {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 2px;
    }
    
    /* Desktop Tabs */
    .desktop-tabs {
        display: none;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px 12px 0 0;
        border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .citizen-unified-desktop.expanded .desktop-tabs {
        display: flex;
    }
    
    .citizen-unified-desktop.expanded .desktop-compact {
        display: none;
    }
    
    .desktop-tab {
        flex: 1;
        padding: 14px;
        text-align: center;
        cursor: pointer;
        border: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .desktop-tab:hover {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.9);
    }
    
    .desktop-tab.active {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.15);
    }
    
    .desktop-tab.active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 3px;
        background: #ffca28;
    }
    
    .desktop-tab i {
        font-size: 18px;
    }
    
    /* Desktop Tab Content */
    .desktop-tab-content {
        padding: 20px;
        display: none;
    }
    
    .desktop-tab-content.active {
        display: block;
    }
    
    /* Close button for expanded desktop */
    .desktop-close {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 10;
    }
    
    .citizen-unified-desktop.expanded .desktop-close {
        display: flex;
    }
    
    .desktop-close:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(90deg);
    }
}

/* === PANEL HEADER === */
.panel-header {
    background: linear-gradient(135deg, #1a2f5f 0%, #0f1a36 100%);
    color: white;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 3px solid #ffca28;
}

.panel-title {
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.panel-title i {
    font-size: 24px;
}

.panel-close {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.panel-close:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
}

/* === ACCESSIBILITY PANEL CONTENT === */
.accessibility-content {
    padding: 20px;
}

.access-option {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 14px;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.access-option:hover {
    background: #f0f2f5;
    border-color: #e0e0e0;
}

.access-option-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
}

.access-option-label {
    font-size: 1rem;
    font-weight: 600;
    color: #1a2f5f;
}

.access-option-description {
    font-size: 0.85rem;
    color: #666;
    line-height: 1.5;
}

/* Toggle Switch */
.access-toggle {
    position: relative;
    width: 52px;
    height: 26px;
    background: #ccc;
    border-radius: 13px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.access-toggle.active {
    background: #43a047;
}

.access-toggle::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.access-toggle.active::after {
    transform: translateX(26px);
}

/* Panel Buttons */
.panel-buttons {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #e0e0e0;
}

.panel-btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.panel-btn.primary {
    background: #1a2f5f;
    color: white;
}

.panel-btn.primary:hover {
    background: #0f1a36;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26, 47, 95, 0.3);
}

.panel-btn.secondary {
    background: #f0f0f0;
    color: #666;
}

.panel-btn.secondary:hover {
    background: #e0e0e0;
}

/* === WEATHER PANEL CONTENT === */
.weather-content {
    padding: 20px;
}

.weather-info-full {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.weather-icon-large {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.weather-icon-large i {
    font-size: 32px;
    color: #e3f2fd;
}

.weather-details {
    flex: 1;
}

.weather-temp-large {
    font-size: 32px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1;
    margin-bottom: 6px;
}

.weather-condition-large {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
}

.weather-location-large {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 4px;
}

/* Weather Alert Header */
.weather-alert-header {
    display: none;
    text-align: center;
    padding: 14px 18px;
    margin: -20px -20px 20px;
    background: rgba(255, 255, 255, 0.12);
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.weather-alert-header.visible {
    display: block;
}

.weather-alert-title {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin: 0;
    color: #ffffff;
}

/* Weather Tips */
.weather-tips {
    display: none;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
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
    font-size: 13px;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 10px;
    padding-left: 18px;
    position: relative;
    line-height: 1.6;
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
}

/* Emergency Contact */
.weather-emergency {
    display: none;
    margin-top: 16px;
    padding: 12px 16px;
    background: rgba(229, 57, 53, 0.25);
    border: 2px solid rgba(229, 57, 53, 0.4);
    border-radius: 8px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #ffcdd2;
}

.weather-emergency.visible {
    display: block;
}

.weather-emergency i {
    font-size: 13px;
    vertical-align: middle;
    margin-right: 6px;
}

/* === ALERT LEVELS === */
.citizen-widget-base.advisory {
    border-color: #ffa726;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(255, 167, 38, 0.3);
}

.citizen-widget-base.warning {
    border-color: #ff7043;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(255, 112, 67, 0.4);
}

.citizen-widget-base.critical {
    border-color: #e53935;
    box-shadow: 0 8px 36px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(229, 57, 53, 0.5);
    animation: criticalPulse 3s ease-in-out infinite;
}

@keyframes criticalPulse {
    0%, 100% {
        box-shadow: 0 8px 36px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(229, 57, 53, 0.5);
    }
    50% {
        box-shadow: 0 12px 48px rgba(229, 57, 53, 0.4), 0 0 0 1px rgba(229, 57, 53, 0.7);
    }
}

/* === WEATHER ICON ANIMATIONS === */
@keyframes sunny {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.weather-icon.sunny { animation: sunny 30s linear infinite; }

@keyframes rainy {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
}

.weather-icon.rainy { animation: rainy 2s ease-in-out infinite; }

/* === BACKDROP === */
.citizen-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 9995;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}

.citizen-backdrop.visible {
    opacity: 1;
    pointer-events: all;
}

/* === ACCESSIBILITY BANNER === */
.access-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #1a2f5f 0%, #0f1a36 100%);
    color: white;
    padding: 1.25rem 2rem;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
    z-index: 9998;
    transform: translateY(100%);
    transition: transform 400ms cubic-bezier(0.4, 0.0, 0.2, 1);
    border-top: 3px solid #ffca28;
}

.access-banner.show {
    transform: translateY(0);
}

.access-banner-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
}

.access-banner-text {
    flex: 1;
    font-size: 1.05rem;
    font-weight: 500;
    letter-spacing: 0.3px;
}

.access-banner-buttons {
    display: flex;
    gap: 1rem;
    flex-shrink: 0;
}

.access-banner-btn {
    padding: 0.75rem 1.75rem;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
}

.access-banner-btn.primary {
    background: #ffca28;
    color: #0f1a36;
}

.access-banner-btn.primary:hover {
    background: #ffd54f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 202, 40, 0.4);
}

.access-banner-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.access-banner-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
    .access-banner {
        padding: 1rem;
    }
    
    .access-banner-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
    .access-banner-buttons {
        width: 100%;
        flex-direction: column;
    }
    
    .access-banner-btn {
        width: 100%;
    }
}

/* === UPDATE FLASH INDICATOR === */
.weather-update-flash {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 8px;
    height: 8px;
    background: #4caf50;
    border-radius: 50%;
    opacity: 0;
    z-index: 5;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
}

.weather-update-flash.flash {
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

/* === TOAST NOTIFICATION === */
.citizen-toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(150%);
    background: #1a2f5f;
    color: white;
    padding: 14px 24px;
    border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    max-width: 600px;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    border-left: 4px solid #ffca28;
}

.citizen-toast.show {
    transform: translateX(-50%) translateY(0);
}

/* === ACCESSIBILITY EFFECTS === */
body.access-larger-text {
    font-size: 24px !important;
}

body.access-larger-text p,
body.access-larger-text li,
body.access-larger-text span:not(.material-icons):not(.material-symbols-outlined),
body.access-larger-text a,
body.access-larger-text div,
body.access-larger-text button {
    font-size: 1em !important;
    line-height: 1.8 !important;
}

body.access-high-contrast *:hover:not(img):not(svg):not(i):not(.citizen-widget-base):not(.citizen-widget-base *) {
    background-color: #000 !important;
    color: #ffca28 !important;
    outline: 3px solid #ffca28 !important;
    outline-offset: 2px;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
    .citizen-toast {
        bottom: 7rem;
        max-width: calc(100% - 2rem);
        left: 1rem;
        right: 1rem;
        transform: translateX(0) translateY(150%);
    }
    
    .citizen-toast.show {
        transform: translateX(0) translateY(0);
    }
}

/* === FOCUS STYLES === */
.citizen-widget-base:focus-visible {
    outline: 4px solid #ffca28;
    outline-offset: 4px;
}

.panel-btn:focus,
.panel-close:focus,
.access-toggle:focus,
.desktop-tab:focus {
    outline: 3px solid #ffca28;
    outline-offset: 3px;
}
    `;
    
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

function getAlertPriority(level) {
    return { advisory: 1, warning: 2, critical: 3 }[level] || 0;
}

// === UNIFIED CITIZEN WIDGET CLASS ===
class UnifiedCitizenWidget {
    constructor() {
        if (window.unifiedCitizenWidget) {
            console.warn('⚠️ Unified widget already running');
            return window.unifiedCitizenWidget;
        }
        
        // State
        this.isMobile = window.innerWidth <= UNIFIED_CONFIG.ui.mobileBreakpoint;
        this.isDesktopExpanded = false;
        this.activeDesktopTab = 'weather'; // 'weather' or 'accessibility'
        
        // Weather state
        this.weatherData = null;
        this.currentAlert = null;
        this.weatherUpdateTimer = null;
        this.fetchAbortController = null;
        this.autoCollapseTimer = null;
        this.lastScrollY = 0;
        
        // Accessibility state
        this.accessibilityPrefs = this.loadAccessibilityPrefs();
        this.bannerDismissed = localStorage.getItem(UNIFIED_CONFIG.accessibility.bannerKey) === 'true';
        
        // DOM elements
        this.elements = {};
        
        // Initialize
        window.unifiedCitizenWidget = this;
        this.init();
    }
    
    async init() {
        try {
            injectUnifiedCSS();
            this.createWidgets();
            this.setupEventListeners();
            this.setupFooterObserver();
            this.setupScrollListener();
            this.applyAccessibilityPrefs();
            
            // Fetch initial weather
            await this.fetchWeather();
            
            // Show widgets after brief delay
            setTimeout(() => this.showWidgets(), 1500);
            
            // Show banner if first visit and not dismissed
            if (UNIFIED_CONFIG.accessibility.showBanner && !this.bannerDismissed && !this.accessibilityPrefs) {
                setTimeout(() => this.showBanner(), UNIFIED_CONFIG.accessibility.bannerDelay);
            }
            
            // If returning user with preferences, show subtle toast
            if (this.accessibilityPrefs && (this.accessibilityPrefs.largerText || this.accessibilityPrefs.highContrast)) {
                setTimeout(() => this.showToast(TEXT.accessibility.toastApplied), 500);
            }
            
            // Start weather monitoring
            this.startWeatherMonitoring();
            
            console.log('✅ Unified Citizen Widget v1.0 initialized');
            console.log('📱 Mode:', this.isMobile ? 'Mobile (2 buttons)' : 'Desktop (unified)');
            
        } catch (error) {
            console.error('❌ Failed to initialize:', error);
        }
    }
    
    // === WIDGET CREATION ===
    createWidgets() {
        if (this.isMobile) {
            this.createMobileWidgets();
        } else {
            this.createDesktopWidget();
        }
        this.createBackdrop();
    }
    
    createMobileWidgets() {
        // Accessibility Button
        const accessBtn = document.createElement('div');
        accessBtn.className = 'citizen-widget-base citizen-accessibility-btn';
        accessBtn.setAttribute('role', 'button');
        accessBtn.setAttribute('aria-label', TEXT.accessibility.ariaLabel);
        accessBtn.setAttribute('tabindex', '0');
        accessBtn.innerHTML = '<span class="material-symbols-outlined">symptoms</span>';
        document.body.appendChild(accessBtn);
        this.elements.mobileAccessBtn = accessBtn;
        
        // Weather Button
        const weatherBtn = document.createElement('div');
        weatherBtn.className = 'citizen-widget-base citizen-weather-btn';
        weatherBtn.setAttribute('role', 'button');
        weatherBtn.setAttribute('aria-label', TEXT.weather.ariaLabel);
        weatherBtn.setAttribute('tabindex', '0');
        weatherBtn.innerHTML = `
            <i class="material-icons weather-icon">wb_sunny</i>
            <div class="weather-temp">--°</div>
        `;
        document.body.appendChild(weatherBtn);
        this.elements.mobileWeatherBtn = weatherBtn;
        
        // Accessibility Panel
        this.createAccessibilityPanel();
        
        // Weather Panel
        this.createWeatherPanel();
    }
    
    createDesktopWidget() {
        const widget = document.createElement('div');
        widget.className = 'citizen-widget-base citizen-unified-desktop';
        widget.setAttribute('role', 'complementary');
        widget.setAttribute('aria-label', 'Meteo și Accesibilitate');
        widget.setAttribute('tabindex', '0');
        
        widget.innerHTML = `
            <button class="desktop-close" aria-label="Închide">
                <i class="material-icons">close</i>
            </button>
            
            <!-- Compact View (Collapsed) -->
            <div class="desktop-compact">
                <div class="icon-group">
                    <span class="material-symbols-outlined symptoms-icon">symptoms</span>
                    <div class="weather-icon-box">
                        <i class="material-icons weather-icon">wb_sunny</i>
                    </div>
                </div>
                <div class="weather-info">
                    <div class="weather-temp">--°C</div>
                    <div class="weather-condition">Se încarcă...</div>
                    <div class="weather-location">${UNIFIED_CONFIG.weather.location}</div>
                </div>
            </div>
            
            <!-- Expanded View (Tabs) -->
            <div class="desktop-tabs">
                <button class="desktop-tab" data-tab="accessibility">
                    <span class="material-symbols-outlined">symptoms</span>
                    <span>${TEXT.tabs.accessibility}</span>
                </button>
                <button class="desktop-tab active" data-tab="weather">
                    <i class="material-icons">wb_sunny</i>
                    <span>${TEXT.tabs.weather}</span>
                </button>
            </div>
            
            <!-- Tab Contents -->
            <div class="desktop-tab-content" data-content="accessibility">
                ${this.getAccessibilityContent()}
            </div>
            
            <div class="desktop-tab-content active" data-content="weather">
                <div class="weather-content">
                    <div class="weather-alert-header">
                        <h3 class="weather-alert-title"></h3>
                    </div>
                    <div class="weather-info-full">
                        <div class="weather-icon-large">
                            <i class="material-icons weather-icon">wb_sunny</i>
                        </div>
                        <div class="weather-details">
                            <div class="weather-temp-large">--°C</div>
                            <div class="weather-condition-large">Se încarcă...</div>
                            <div class="weather-location-large">${UNIFIED_CONFIG.weather.location}</div>
                        </div>
                    </div>
                    <div class="weather-tips">
                        <ul></ul>
                    </div>
                    <div class="weather-emergency">
                        <i class="material-icons">phone</i>${TEXT.weather.emergency}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
        this.elements.desktopWidget = widget;
    }
    
    createAccessibilityPanel() {
        const panel = document.createElement('div');
        panel.className = 'citizen-widget-base citizen-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">
                    <span class="material-symbols-outlined">symptoms</span>
                    ${TEXT.accessibility.title}
                </div>
                <button class="panel-close" aria-label="Închide">
                    <i class="material-icons">close</i>
                </button>
            </div>
            ${this.getAccessibilityContent()}
        `;
        document.body.appendChild(panel);
        this.elements.accessPanel = panel;
    }
    
    createWeatherPanel() {
        const panel = document.createElement('div');
        panel.className = 'citizen-widget-base citizen-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">
                    <i class="material-icons">wb_sunny</i>
                    Informații Meteo
                </div>
                <button class="panel-close" aria-label="Închide">
                    <i class="material-icons">close</i>
                </button>
            </div>
            <div class="weather-content">
                <div class="weather-alert-header">
                    <h3 class="weather-alert-title"></h3>
                </div>
                <div class="weather-info-full">
                    <div class="weather-icon-large">
                        <i class="material-icons weather-icon">wb_sunny</i>
                    </div>
                    <div class="weather-details">
                        <div class="weather-temp-large">--°C</div>
                        <div class="weather-condition-large">Se încarcă...</div>
                        <div class="weather-location-large">${UNIFIED_CONFIG.weather.location}</div>
                    </div>
                </div>
                <div class="weather-tips">
                    <ul></ul>
                </div>
                <div class="weather-emergency">
                    <i class="material-icons">phone</i>${TEXT.weather.emergency}
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        this.elements.weatherPanel = panel;
    }
    
    getAccessibilityContent() {
        const prefs = this.accessibilityPrefs || { largerText: false, highContrast: false };
        return `
            <div class="accessibility-content">
                <div class="access-option" data-option="largerText">
                    <div class="access-option-header">
                        <div class="access-option-label">${TEXT.accessibility.largerText.label}</div>
                        <div class="access-toggle ${prefs.largerText ? 'active' : ''}" 
                             role="switch" 
                             aria-checked="${prefs.largerText}"
                             tabindex="0">
                        </div>
                    </div>
                    <div class="access-option-description">${TEXT.accessibility.largerText.description}</div>
                </div>
                
                <div class="access-option" data-option="highContrast">
                    <div class="access-option-header">
                        <div class="access-option-label">${TEXT.accessibility.highContrast.label}</div>
                        <div class="access-toggle ${prefs.highContrast ? 'active' : ''}" 
                             role="switch" 
                             aria-checked="${prefs.highContrast}"
                             tabindex="0">
                        </div>
                    </div>
                    <div class="access-option-description">${TEXT.accessibility.highContrast.description}</div>
                </div>
                
                <div class="panel-buttons">
                    <button class="panel-btn secondary" data-action="reset">
                        ${TEXT.accessibility.resetBtn}
                    </button>
                    <button class="panel-btn primary" data-action="save">
                        ${TEXT.accessibility.saveBtn}
                    </button>
                </div>
            </div>
        `;
    }
    
    createBackdrop() {
        const backdrop = document.createElement('div');
        backdrop.className = 'citizen-backdrop';
        document.body.appendChild(backdrop);
        this.elements.backdrop = backdrop;
    }
    
    // === EVENT LISTENERS ===
    setupEventListeners() {
        if (this.isMobile) {
            this.setupMobileListeners();
        } else {
            this.setupDesktopListeners();
        }
        this.setupResizeListener();
    }
    
    setupFooterObserver() {
        const footer = document.querySelector('footer');
        if (!footer) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.hideWidgets();
                } else {
                    this.showWidgets();
                }
            });
        }, { rootMargin: '0px 0px -20px 0px' });
        
        observer.observe(footer);
        this.footerObserver = observer;
    }
    
    setupScrollListener() {
        if (!UNIFIED_CONFIG.ui.enableScrollHide || !this.isMobile) return;
        
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    
                    if (currentScrollY > this.lastScrollY && currentScrollY > UNIFIED_CONFIG.ui.scrollThreshold) {
                        // Scrolling down
                        this.elements.mobileAccessBtn?.classList.add('mobile-hidden');
                        this.elements.mobileWeatherBtn?.classList.add('mobile-hidden');
                    } else if (currentScrollY < this.lastScrollY) {
                        // Scrolling up
                        this.elements.mobileAccessBtn?.classList.remove('mobile-hidden');
                        this.elements.mobileWeatherBtn?.classList.remove('mobile-hidden');
                    }
                    
                    this.lastScrollY = currentScrollY;
                    ticking = false;
                });
                
                ticking = true;
            }
        }, { passive: true });
    }
    
    setupMobileListeners() {
        // Accessibility button click
        this.elements.mobileAccessBtn?.addEventListener('click', () => {
            this.showAccessibilityPanel();
        });
        
        // Weather button click
        this.elements.mobileWeatherBtn?.addEventListener('click', () => {
            this.showWeatherPanel();
        });
        
        // Accessibility panel close
        this.elements.accessPanel?.querySelector('.panel-close')?.addEventListener('click', () => {
            this.hideAccessibilityPanel();
        });
        
        // Weather panel close
        this.elements.weatherPanel?.querySelector('.panel-close')?.addEventListener('click', () => {
            this.hideWeatherPanel();
        });
        
        // Backdrop click
        this.elements.backdrop?.addEventListener('click', () => {
            this.hideAllPanels();
        });
        
        // Accessibility toggles and buttons
        this.setupAccessibilityControls(this.elements.accessPanel);
    }
    
    setupDesktopListeners() {
        const widget = this.elements.desktopWidget;
        if (!widget) return;
        
        // Click to expand (when collapsed)
        widget.addEventListener('click', (e) => {
            if (!this.isDesktopExpanded && !e.target.closest('.desktop-close')) {
                this.expandDesktopWidget();
            }
        });
        
        // Close button
        widget.querySelector('.desktop-close')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.collapseDesktopWidget();
        });
        
        // Tab switching
        widget.querySelectorAll('.desktop-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                const tabName = tab.dataset.tab;
                this.switchDesktopTab(tabName);
            });
        });
        
        // Accessibility controls in desktop widget
        this.setupAccessibilityControls(widget);
    }
    
    setupAccessibilityControls(container) {
        if (!container) return;
        
        // Toggle switches
        container.querySelectorAll('.access-toggle').forEach(toggle => {
            const option = toggle.closest('.access-option');
            const optionName = option?.dataset.option;
            
            const handleToggle = () => {
                toggle.classList.toggle('active');
                const isActive = toggle.classList.contains('active');
                toggle.setAttribute('aria-checked', isActive);
                
                // Live preview
                this.previewAccessibility(container);
            };
            
            toggle.addEventListener('click', handleToggle);
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle();
                }
            });
        });
        
        // Save button
        container.querySelector('[data-action="save"]')?.addEventListener('click', () => {
            this.saveAccessibilityPrefs(container);
        });
        
        // Reset button
        container.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
            this.resetAccessibilityPrefs(container);
        });
    }
    
    setupResizeListener() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const wasMobile = this.isMobile;
                this.isMobile = window.innerWidth <= UNIFIED_CONFIG.ui.mobileBreakpoint;
                
                if (wasMobile !== this.isMobile) {
                    console.log('🔄 Switching layout mode:', this.isMobile ? 'Mobile' : 'Desktop');
                    this.rebuildWidgets();
                }
            }, 250);
        });
    }
    
    rebuildWidgets() {
        // Clean up existing widgets
        this.elements.mobileAccessBtn?.remove();
        this.elements.mobileWeatherBtn?.remove();
        this.elements.accessPanel?.remove();
        this.elements.weatherPanel?.remove();
        this.elements.desktopWidget?.remove();
        
        // Reset state
        this.isDesktopExpanded = false;
        
        // Recreate
        this.createWidgets();
        this.setupEventListeners();
        this.updateWeatherDisplay();
        this.showWidgets();
    }
    
    // === MOBILE PANEL MANAGEMENT ===
    showAccessibilityPanel() {
        this.elements.accessPanel?.classList.add('visible');
        this.elements.backdrop?.classList.add('visible');
        
        // Reset auto-collapse timer
        this.resetAutoCollapse();
    }
    
    hideAccessibilityPanel() {
        this.elements.accessPanel?.classList.remove('visible');
        this.elements.backdrop?.classList.remove('visible');
        this.clearAutoCollapse();
    }
    
    showWeatherPanel() {
        this.elements.weatherPanel?.classList.add('visible');
        this.elements.backdrop?.classList.add('visible');
        
        // Reset auto-collapse timer
        this.resetAutoCollapse();
    }
    
    hideWeatherPanel() {
        this.elements.weatherPanel?.classList.remove('visible');
        this.elements.backdrop?.classList.remove('visible');
        this.clearAutoCollapse();
    }
    
    hideAllPanels() {
        this.hideAccessibilityPanel();
        this.hideWeatherPanel();
    }
    
    resetAutoCollapse() {
        this.clearAutoCollapse();
        
        this.autoCollapseTimer = setTimeout(() => {
            if (this.isMobile && !this.currentAlert) {
                this.hideAllPanels();
            }
        }, UNIFIED_CONFIG.ui.autoCollapseDelay);
    }
    
    clearAutoCollapse() {
        if (this.autoCollapseTimer) {
            clearTimeout(this.autoCollapseTimer);
            this.autoCollapseTimer = null;
        }
    }
    
    // === DESKTOP WIDGET MANAGEMENT ===
    expandDesktopWidget() {
        this.isDesktopExpanded = true;
        this.elements.desktopWidget?.classList.add('expanded');
    }
    
    collapseDesktopWidget() {
        this.isDesktopExpanded = false;
        this.elements.desktopWidget?.classList.remove('expanded');
    }
    
    switchDesktopTab(tabName) {
        this.activeDesktopTab = tabName;
        
        const widget = this.elements.desktopWidget;
        if (!widget) return;
        
        // Update tabs
        widget.querySelectorAll('.desktop-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update content
        widget.querySelectorAll('.desktop-tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.content === tabName);
        });
    }
    
    // === ACCESSIBILITY MANAGEMENT ===
    createBanner() {
        if (document.querySelector('.access-banner')) return;
        
        const banner = document.createElement('div');
        banner.className = 'access-banner';
        banner.innerHTML = `
            <div class="access-banner-content">
                <div class="access-banner-text">${TEXT.accessibility.banner.question}</div>
                <div class="access-banner-buttons">
                    <button class="access-banner-btn primary" data-action="help">
                        ${TEXT.accessibility.banner.helpBtn}
                    </button>
                    <button class="access-banner-btn secondary" data-action="dismiss">
                        ${TEXT.accessibility.banner.dismissBtn}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Event listeners
        banner.querySelector('[data-action="help"]').addEventListener('click', () => {
            this.hideBanner();
            if (this.isMobile) {
                this.showAccessibilityPanel();
            } else {
                this.expandDesktopWidget();
                this.switchDesktopTab('accessibility');
            }
        });
        
        banner.querySelector('[data-action="dismiss"]').addEventListener('click', () => {
            this.hideBanner();
            localStorage.setItem(UNIFIED_CONFIG.accessibility.bannerKey, 'true');
            this.bannerDismissed = true;
        });
        
        return banner;
    }
    
    showBanner() {
        const banner = this.createBanner();
        if (banner) {
            setTimeout(() => banner.classList.add('show'), 100);
        }
    }
    
    hideBanner() {
        const banner = document.querySelector('.access-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 400);
        }
    }
    
    loadAccessibilityPrefs() {
        const stored = localStorage.getItem(UNIFIED_CONFIG.accessibility.storageKey);
        return stored ? JSON.parse(stored) : null;
    }
    
    saveAccessibilityPrefs(container) {
        const largerTextToggle = container.querySelector('[data-option="largerText"] .access-toggle');
        const highContrastToggle = container.querySelector('[data-option="highContrast"] .access-toggle');
        
        const prefs = {
            largerText: largerTextToggle?.classList.contains('active') || false,
            highContrast: highContrastToggle?.classList.contains('active') || false
        };
        
        localStorage.setItem(UNIFIED_CONFIG.accessibility.storageKey, JSON.stringify(prefs));
        this.accessibilityPrefs = prefs;
        this.applyAccessibilityPrefs();
        
        // Hide panel if mobile
        if (this.isMobile) {
            this.hideAccessibilityPanel();
        }
        
        this.showToast(TEXT.accessibility.toastSaved);
    }
    
    resetAccessibilityPrefs(container) {
        localStorage.removeItem(UNIFIED_CONFIG.accessibility.storageKey);
        this.accessibilityPrefs = null;
        this.applyAccessibilityPrefs();
        
        // Reset toggles
        container.querySelectorAll('.access-toggle').forEach(toggle => {
            toggle.classList.remove('active');
            toggle.setAttribute('aria-checked', 'false');
        });
        
        // Hide panel if mobile
        if (this.isMobile) {
            this.hideAccessibilityPanel();
        }
        
        this.showToast(TEXT.accessibility.toastReset);
    }
    
    previewAccessibility(container) {
        const largerTextToggle = container.querySelector('[data-option="largerText"] .access-toggle');
        const highContrastToggle = container.querySelector('[data-option="highContrast"] .access-toggle');
        
        const previewPrefs = {
            largerText: largerTextToggle?.classList.contains('active') || false,
            highContrast: highContrastToggle?.classList.contains('active') || false
        };
        
        // Apply preview
        document.body.classList.toggle('access-larger-text', previewPrefs.largerText);
        document.body.classList.toggle('access-high-contrast', previewPrefs.highContrast);
    }
    
    applyAccessibilityPrefs() {
        document.body.classList.remove('access-larger-text', 'access-high-contrast');
        
        if (this.accessibilityPrefs) {
            if (this.accessibilityPrefs.largerText) {
                document.body.classList.add('access-larger-text');
            }
            if (this.accessibilityPrefs.highContrast) {
                document.body.classList.add('access-high-contrast');
            }
        }
    }
    
    // === WEATHER MANAGEMENT ===
    async fetchWeather() {
        try {
            if (this.fetchAbortController) {
                this.fetchAbortController.abort();
            }
            
            this.fetchAbortController = new AbortController();
            
            const params = new URLSearchParams({
                latitude: UNIFIED_CONFIG.weather.coordinates.lat.toString(),
                longitude: UNIFIED_CONFIG.weather.coordinates.lon.toString(),
                current: 'temperature_2m,weather_code,wind_speed_10m,precipitation,is_day',
                timezone: 'Europe/Bucharest'
            });
            
            const response = await fetch(`${UNIFIED_CONFIG.weather.apiUrl}?${params}`, {
                signal: this.fetchAbortController.signal,
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const data = await response.json();
            
            if (!data.current || typeof data.current.temperature_2m !== 'number') {
                throw new Error('Invalid weather data');
            }
            
            this.weatherData = {
                temp: Math.round(data.current.temperature_2m),
                weatherCode: data.current.weather_code || 0,
                wind: data.current.wind_speed_10m || 0,
                precipitation: data.current.precipitation || 0,
                isDay: data.current.is_day === 1
            };
            
            this.updateWeatherDisplay();
            this.checkWeatherAlerts();
            this.flashWeatherUpdate();
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('❌ Weather fetch error:', error);
            }
        }
    }
    
    updateWeatherDisplay() {
        if (!this.weatherData) return;
        
        const condition = getWeatherCondition(this.weatherData.weatherCode, this.weatherData.isDay);
        const temp = `${this.weatherData.temp}°C`;
        
        // Update mobile weather button
        if (this.elements.mobileWeatherBtn) {
            const icon = this.elements.mobileWeatherBtn.querySelector('.weather-icon');
            const tempEl = this.elements.mobileWeatherBtn.querySelector('.weather-temp');
            if (icon) {
                icon.className = `material-icons weather-icon ${condition.anim}`;
                icon.textContent = condition.icon;
            }
            if (tempEl) tempEl.textContent = `${this.weatherData.temp}°`;
        }
        
        // Update mobile weather panel
        if (this.elements.weatherPanel) {
            this.updateWeatherContent(this.elements.weatherPanel, condition, temp);
        }
        
        // Update desktop widget
        if (this.elements.desktopWidget) {
            // Compact view
            const compactIcon = this.elements.desktopWidget.querySelector('.desktop-compact .weather-icon');
            const compactTemp = this.elements.desktopWidget.querySelector('.desktop-compact .weather-temp');
            const compactCondition = this.elements.desktopWidget.querySelector('.desktop-compact .weather-condition');
            
            if (compactIcon) {
                compactIcon.className = `material-icons weather-icon ${condition.anim}`;
                compactIcon.textContent = condition.icon;
            }
            if (compactTemp) compactTemp.textContent = temp;
            if (compactCondition) compactCondition.textContent = condition.name;
            
            // Expanded view
            this.updateWeatherContent(this.elements.desktopWidget, condition, temp);
        }
    }
    
    updateWeatherContent(container, condition, temp) {
        const iconLarge = container.querySelector('.weather-icon-large .weather-icon');
        const tempLarge = container.querySelector('.weather-temp-large');
        const conditionLarge = container.querySelector('.weather-condition-large');
        
        if (iconLarge) {
            iconLarge.className = `material-icons weather-icon ${condition.anim}`;
            iconLarge.textContent = condition.icon;
        }
        if (tempLarge) tempLarge.textContent = temp;
        if (conditionLarge) conditionLarge.textContent = condition.name;
    }
    
    checkWeatherAlerts() {
        if (!this.weatherData) return;
        
        const { temp, weatherCode, wind } = this.weatherData;
        const condition = getWeatherCondition(weatherCode, this.weatherData.isDay);
        let alert = null;
        
        if (temp <= UNIFIED_CONFIG.weather.thresholds.temperature.cold) {
            alert = SAFETY_ADVICE.extreme_cold;
        } else if (temp >= UNIFIED_CONFIG.weather.thresholds.temperature.hot) {
            alert = SAFETY_ADVICE.extreme_heat;
        }
        
        if (wind >= UNIFIED_CONFIG.weather.thresholds.wind.strong) {
            alert = SAFETY_ADVICE.high_winds;
        }
        
        if (condition.advice && SAFETY_ADVICE[condition.advice]) {
            const conditionAlert = SAFETY_ADVICE[condition.advice];
            if (!alert || getAlertPriority(conditionAlert.level) > getAlertPriority(alert.level)) {
                alert = conditionAlert;
            }
        }
        
        if (alert) {
            this.showWeatherAlert(alert);
        } else {
            this.clearWeatherAlert();
        }
    }
    
    showWeatherAlert(alert) {
        this.currentAlert = alert;
        
        // Apply alert level styling
        const applyAlertClass = (element) => {
            if (!element) return;
            element.classList.remove('advisory', 'warning', 'critical');
            element.classList.add(alert.level);
        };
        
        applyAlertClass(this.elements.mobileWeatherBtn);
        applyAlertClass(this.elements.weatherPanel);
        applyAlertClass(this.elements.desktopWidget);
        
        // Update alert content
        const updateAlertContent = (container) => {
            if (!container) return;
            
            const header = container.querySelector('.weather-alert-header');
            const title = container.querySelector('.weather-alert-title');
            const tips = container.querySelector('.weather-tips');
            const tipsList = container.querySelector('.weather-tips ul');
            const emergency = container.querySelector('.weather-emergency');
            
            if (header && title) {
                title.textContent = alert.title;
                header.classList.add('visible');
            }
            
            if (tips && tipsList && alert.tips) {
                tipsList.innerHTML = alert.tips.map(tip => `<li>${tip}</li>`).join('');
                tips.classList.add('visible');
            }
            
            if (emergency && (alert.level === 'warning' || alert.level === 'critical')) {
                emergency.classList.add('visible');
            }
        };
        
        updateAlertContent(this.elements.weatherPanel);
        updateAlertContent(this.elements.desktopWidget);
    }
    
    clearWeatherAlert() {
        this.currentAlert = null;
        
        const clearAlertClass = (element) => {
            if (!element) return;
            element.classList.remove('advisory', 'warning', 'critical');
        };
        
        clearAlertClass(this.elements.mobileWeatherBtn);
        clearAlertClass(this.elements.weatherPanel);
        clearAlertClass(this.elements.desktopWidget);
        
        const clearAlertContent = (container) => {
            if (!container) return;
            
            const header = container.querySelector('.weather-alert-header');
            const tips = container.querySelector('.weather-tips');
            const emergency = container.querySelector('.weather-emergency');
            
            if (header) header.classList.remove('visible');
            if (tips) tips.classList.remove('visible');
            if (emergency) emergency.classList.remove('visible');
        };
        
        clearAlertContent(this.elements.weatherPanel);
        clearAlertContent(this.elements.desktopWidget);
    }
    
    startWeatherMonitoring() {
        this.weatherUpdateTimer = setInterval(() => {
            this.fetchWeather();
        }, UNIFIED_CONFIG.weather.updateInterval);
    }
    
    flashWeatherUpdate() {
        // Flash indicator on mobile weather button
        if (this.elements.mobileWeatherBtn) {
            let flash = this.elements.mobileWeatherBtn.querySelector('.weather-update-flash');
            if (!flash) {
                flash = document.createElement('div');
                flash.className = 'weather-update-flash';
                this.elements.mobileWeatherBtn.appendChild(flash);
            }
            flash.classList.remove('flash');
            void flash.offsetWidth; // Trigger reflow
            flash.classList.add('flash');
        }
        
        // Flash indicator on desktop widget
        if (this.elements.desktopWidget) {
            let flash = this.elements.desktopWidget.querySelector('.weather-update-flash');
            if (!flash) {
                flash = document.createElement('div');
                flash.className = 'weather-update-flash';
                this.elements.desktopWidget.appendChild(flash);
            }
            flash.classList.remove('flash');
            void flash.offsetWidth;
            flash.classList.add('flash');
        }
        
        // Flash indicator on weather panel
        if (this.elements.weatherPanel) {
            let flash = this.elements.weatherPanel.querySelector('.weather-update-flash');
            if (!flash) {
                flash = document.createElement('div');
                flash.className = 'weather-update-flash';
                this.elements.weatherPanel.appendChild(flash);
            }
            flash.classList.remove('flash');
            void flash.offsetWidth;
            flash.classList.add('flash');
        }
    }
    
    // === UI UTILITIES ===
    showWidgets() {
        this.elements.mobileAccessBtn?.classList.add('visible');
        this.elements.mobileWeatherBtn?.classList.add('visible');
        this.elements.desktopWidget?.classList.add('visible');
    }
    
    hideWidgets() {
        this.elements.mobileAccessBtn?.classList.remove('visible');
        this.elements.mobileWeatherBtn?.classList.remove('visible');
        this.elements.desktopWidget?.classList.remove('visible');
    }
    
    showToast(message) {
        const existing = document.querySelector('.citizen-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'citizen-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, UNIFIED_CONFIG.accessibility.toastDuration);
    }
    
    // === CLEANUP ===
    destroy() {
        if (this.weatherUpdateTimer) {
            clearInterval(this.weatherUpdateTimer);
        }
        
        if (this.autoCollapseTimer) {
            clearTimeout(this.autoCollapseTimer);
        }
        
        if (this.fetchAbortController) {
            this.fetchAbortController.abort();
        }
        
        if (this.footerObserver) {
            this.footerObserver.disconnect();
        }
        
        Object.values(this.elements).forEach(el => el?.remove());
        
        const banner = document.querySelector('.access-banner');
        if (banner) banner.remove();
        
        document.body.classList.remove('access-larger-text', 'access-high-contrast');
        
        delete window.unifiedCitizenWidget;
        console.log('🗑️ Unified widget destroyed');
    }
}

// === AUTO-INITIALIZATION ===
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new UnifiedCitizenWidget();
    });
} else {
    new UnifiedCitizenWidget();
}

console.log('✅ Unified Citizen Experience Widget v1.0 loaded');
console.log('📱 Mobile: 2 stacked buttons (Accessibility + Weather)');
console.log('🖥️ Desktop: Single unified widget with tabs');
console.log('♿ Accessibility-first design with symptoms icon');

// === TESTING INTERFACE ===
window.weatherTest = {
    setWeather(code) {
        if (!window.unifiedCitizenWidget?.weatherData) {
            console.warn('⚠️ Weather system not ready');
            return;
        }
        window.unifiedCitizenWidget.weatherData.weatherCode = code;
        window.unifiedCitizenWidget.updateWeatherDisplay();
        window.unifiedCitizenWidget.checkWeatherAlerts();
        console.log(`🌤️ Weather code: ${code}`);
    },
    
    setTemp(temp) {
        if (!window.unifiedCitizenWidget?.weatherData) return;
        window.unifiedCitizenWidget.weatherData.temp = temp;
        window.unifiedCitizenWidget.updateWeatherDisplay();
        window.unifiedCitizenWidget.checkWeatherAlerts();
        console.log(`🌡️ Temperature: ${temp}°C`);
    },
    
    setWind(speed) {
        if (!window.unifiedCitizenWidget?.weatherData) return;
        window.unifiedCitizenWidget.weatherData.wind = speed;
        window.unifiedCitizenWidget.checkWeatherAlerts();
        console.log(`💨 Wind: ${speed} km/h`);
    },
    
    toggleDayNight() {
        if (!window.unifiedCitizenWidget?.weatherData) return;
        window.unifiedCitizenWidget.weatherData.isDay = !window.unifiedCitizenWidget.weatherData.isDay;
        window.unifiedCitizenWidget.updateWeatherDisplay();
        console.log(`🌓 ${window.unifiedCitizenWidget.weatherData.isDay ? 'Day' : 'Night'} mode`);
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
    
    flash() {
        window.unifiedCitizenWidget?.flashWeatherUpdate();
        console.log('✨ Update flash triggered');
    },
    
    showBanner() {
        window.unifiedCitizenWidget?.showBanner();
        console.log('📢 Banner shown');
    },
    
    reset() {
        window.unifiedCitizenWidget?.destroy();
        setTimeout(() => new UnifiedCitizenWidget(), 500);
        console.log('🔄 Widget reset');
    },
    
    status() {
        if (!window.unifiedCitizenWidget) {
            console.log('❌ Widget not initialized');
            return;
        }
        const w = window.unifiedCitizenWidget;
        console.log('📊 Widget Status:');
        console.log('  Mode:', w.isMobile ? 'Mobile' : 'Desktop');
        console.log('  Weather Data:', w.weatherData);
        console.log('  Alert:', w.currentAlert?.title || 'None');
        console.log('  Accessibility:', w.accessibilityPrefs);
        console.log('  Desktop Expanded:', w.isDesktopExpanded);
        console.log('  Active Tab:', w.activeDesktopTab);
    }
};

console.log('🧪 Test: weatherTest.cycle() | weatherTest.status() | weatherTest.showBanner()');
