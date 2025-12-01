// =============================================================================
// UNIFIED WIDGET v2.0 - Accessibility & Weather Integration
// Poliția Locală Slobozia | Production-Ready | Mobile-First Design
// =============================================================================
// Combines: Accessibility Widget v1.3 + Weather Alert System v4.3
// New Features: 10+ enhanced accessibility features, unified responsive UI
// =============================================================================

console.log('🚀 Unified Widget v2.0 - Initializing...');

// === CONFIGURATION ===
const UNIFIED_CONFIG = {
    version: '2.0.0',

    // Storage keys
    storageKeys: {
        version: 'pls_widget_version',
        position: 'pls_widget_position',
        lastTab: 'pls_widget_last_tab',
        collapsed: 'pls_widget_collapsed',
        accessibilityPrefs: 'pls_accessibility_prefs',
        weatherPrefs: 'pls_weather_prefs',
        weatherCache: 'pls_weather_cache',
        bannerDismissed: 'pls_accessibility_banner_dismissed'
    },

    // Widget behavior
    behavior: {
        toastDuration: 3000,
        autoCollapseDelay: 10000,
        animationDuration: 300
    },

    // Weather settings
    weather: {
        coordinates: { lat: 44.5667, lon: 27.3667 },
        location: 'Slobozia, Ialomița',
        apiUrl: 'https://api.open-meteo.com/v1/forecast',
        updateInterval: 5 * 60 * 1000, // 5 minutes
        cacheExpiry: 30 * 60 * 1000, // 30 minutes
        thresholds: {
            temperature: { cold: -10, hot: 38 },
            wind: { strong: 40, severe: 60 },
            precipitation: { moderate: 5, heavy: 10 }
        }
    }
};

// === TEXT CONTENT (Romanian) ===
const UNIFIED_TEXT = {
    widget: {
        title: 'Setări',
        close: 'Închide',
        save: 'Salvează',
        reset: 'Resetează'
    },
    tabs: {
        accessibility: 'Accesibilitate',
        weather: 'Meteo'
    },
    accessibility: {
        largerText: {
            label: 'Text mai mare',
            description: 'Mărește textul inteligent pentru citire ușoară'
        },
        highContrast: {
            label: 'Mod Focus (Contrast)',
            description: 'Evidențiază paragrafele și titlurile la trecerea mouse-ului'
        },
        dyslexicFont: {
            label: 'Font Dyslexic',
            description: 'Font special pentru persoane cu dislexie'
        },
        readingGuide: {
            label: 'Ghid de citire',
            description: 'Linie orizontală care urmărește cursorul'
        },
        readingMask: {
            label: 'Mască de citire',
            description: 'Întunecă tot ecranul exceptând zona cursorului'
        },
        bigCursor: {
            label: 'Cursor mare',
            description: 'Mărește cursorul mouse-ului'
        },
        lineHeight: {
            label: 'Înălțime rând',
            description: 'Ajustează spațierea între rânduri'
        },
        letterSpacing: {
            label: 'Spațiere litere',
            description: 'Ajustează distanța între litere'
        },
        linkHighlight: {
            label: 'Evidențiere link-uri',
            description: 'Subliniază și îngroașă toate link-urile'
        },
        darkMode: {
            label: 'Mod întunecat',
            description: 'Fundal întunecat pentru confort vizual'
        },
        stopAnimations: {
            label: 'Oprește animațiile',
            description: 'Dezactivează toate animațiile CSS'
        },
        monochrome: {
            label: 'Monocrom',
            description: 'Convertește pagina la tonuri de gri'
        },
        textToSpeech: {
            label: 'Citire vocală',
            description: 'Text-to-speech în limba română'
        }
    },
    weather: {
        loading: 'Se încarcă...',
        error: 'Eroare conexiune',
        emergency: 'Urgențe: 112 | Poliția Locală: (0243) 955',
        lastUpdate: 'Actualizat:',
        safetyTips: 'Sfaturi de siguranță'
    },
    toast: {
        saved: 'Preferințe salvate',
        reset: 'Preferințele au fost resetate',
        applied: 'Setările au fost aplicate',
        weatherUpdated: 'Informații meteo actualizate'
    }
};

// === WEATHER CONDITIONS (from weather-alert.js) ===
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
    99: { icon: 'thunderstorm', name: 'Furtună severă cu grindină', anim: 'severe-storm', advice: 'severe_storm' }
};

// === SAFETY ADVICE (from weather-alert.js) ===
const SAFETY_ADVICE = {
    visibility: {
        level: 'advisory',
        title: 'ATENȚIE - VIZIBILITATE REDUSĂ',
        tips: [
            'Conduceți cu atenție sporită și viteză redusă',
            'Folosiți farurile și luminile de ceață',
            'Păstrați distanța de siguranță mărită'
        ]
    },
    rain: {
        level: 'advisory',
        title: 'ATENȚIE - PRECIPITAȚII',
        tips: [
            'Atenție la carosabilul umed și aderență redusă',
            'Folosiți umbrela la deplasări pietonale',
            'Verificați gutierele și sistemul de scurgere'
        ]
    },
    heavy_rain: {
        level: 'warning',
        title: 'AVERTIZARE PLOAIE TORENȚIALĂ',
        tips: [
            'Evitați deplasările neesențiale cu automobilul',
            'Nu traversați zonele inundate sau cu apă pe carosabil',
            'Verificați acoperișurile și jgheaburile',
            'Urmăriți comunicatele și avertizările oficiale'
        ]
    },
    snow: {
        level: 'advisory',
        title: 'ATENȚIE - NINSOARE',
        tips: [
            'Echipați vehiculele pentru condiții de iarnă',
            'Atenție la drumurile alunecoase și vizibilitate',
            'Purtați încălțăminte antiderapantă adecvată'
        ]
    },
    heavy_snow: {
        level: 'warning',
        title: 'AVERTIZARE NINSOARE ABUNDENTĂ',
        tips: [
            'Evitați călătoriile și deplasările neesențiale',
            'Pregătiți vehiculele cu anvelope de iarnă',
            'Asigurați-vă rezerve de alimente și medicamente',
            'Curățați periodic zăpada de pe acoperișuri'
        ]
    },
    ice: {
        level: 'warning',
        title: 'ATENȚIE - SUPRAFEȚE ÎNGHEȚATE',
        tips: [
            'Mișcați-vă cu atenție extremă pe suprafețe înghețate',
            'Folosiți încălțăminte cu talpă antiderapantă',
            'Evitați deplasările pietonale neesențiale',
            'Verificați și protejați conductele de apă'
        ]
    },
    storm: {
        level: 'warning',
        title: 'AVERTIZARE FURTUNĂ',
        tips: [
            'Rămâneți în interior pe durata furtunii',
            'Evitați zonele cu copaci înalți și neîntăriți',
            'Deconectați aparatele electrice sensibile',
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
            'Urmăriți în permanență alertele oficiale'
        ]
    },
    extreme_cold: {
        level: 'critical',
        title: 'ALERTĂ GER SEVER',
        tips: [
            'Limitați la minimum timpul petrecut în exterior',
            'Îmbrăcați-vă în multiple straturi de haine',
            'Protejați obligatoriu extremitățile corpului',
            'Verificați și ajutați persoanele vulnerabile'
        ]
    },
    extreme_heat: {
        level: 'critical',
        title: 'ALERTĂ CANICULĂ',
        tips: [
            'Rămâneți în spații climatizate sau răcoroase',
            'Hidratați-vă frecvent cu apă și lichide',
            'Evitați activitățile fizice în exterior',
            'Verificați periodic persoanele în vârstă'
        ]
    },
    high_winds: {
        level: 'warning',
        title: 'AVERTIZARE VÂNT PUTERNIC',
        tips: [
            'Fixați și securizați toate obiectele mobile din curte',
            'Evitați deplasarea pe jos în zone deschise',
            'Atenție sporită la posibila cădere a crengilor',
            'Evitați parcarea vehiculelor sub copaci'
        ]
    }
};

// =============================================================================
// === CSS INJECTION ===
// =============================================================================

function injectUnifiedCSS() {
    if (document.getElementById('unified-widget-styles')) return;

    const style = document.createElement('style');
    style.id = 'unified-widget-styles';
    style.textContent = `
        /* Import required fonts */
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        /* =========================================
           UNIFIED WIDGET v2.0 - COMPREHENSIVE STYLES
           ========================================= */

        /* === CSS CUSTOM PROPERTIES === */
        :root {
            /* Primary Colors */
            --uw-primary: #1a2f5f;
            --uw-primary-light: #2d4a8a;
            --uw-primary-dark: #0f1a36;

            /* Accent Colors */
            --uw-accent: #ffca28;
            --uw-accent-light: #ffd54f;

            /* Alert Colors */
            --uw-advisory: #ffa726;
            --uw-warning: #ff7043;
            --uw-critical: #e53935;

            /* Neutrals */
            --uw-white: #ffffff;
            --uw-gray-50: #f8f9fa;
            --uw-gray-100: #f0f2f5;
            --uw-gray-700: #333333;
            --uw-black: #000000;

            /* Contrast Mode (Preserve from v1.3) */
            --uw-contrast-bg: #ffff00;
            --uw-contrast-text: #000000;

            /* Transitions */
            --uw-transition: 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
            --uw-transition-bounce: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);

            /* Z-Index */
            --uw-z-widget: 100001;
            --uw-z-panel: 100002;
            --uw-z-toast: 100003;
        }

        /* =========================================
           1. ACCESSIBILITY FEATURES (from v1.3)
           ========================================= */

        /* Text Scaling */
        body.uw-larger-text {
            font-size: 125% !important;
            line-height: 1.6 !important;
        }

        @media (max-width: 768px) {
            body.uw-larger-text {
                font-size: 115% !important;
                line-height: 1.5 !important;
            }
        }

        /* Preserve icon sizes */
        body.uw-larger-text .material-icons,
        body.uw-larger-text .material-symbols-outlined,
        body.uw-larger-text i {
            font-size: 1.2em !important;
            vertical-align: middle;
        }

        /* High Contrast Mode - PRESERVE EXACTLY from v1.3 */
        body.uw-high-contrast :is(p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, legend, label):hover {
            background-color: var(--uw-contrast-bg) !important;
            color: var(--uw-contrast-text) !important;
            outline: 4px solid var(--uw-contrast-bg) !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
            border-radius: 4px !important;
            position: relative !important;
            z-index: 10000 !important;
            cursor: help;
        }

        body.uw-high-contrast a:hover,
        body.uw-high-contrast button:hover {
            background-color: #000000 !important;
            color: #ffff00 !important;
            outline: 3px solid #ffff00 !important;
        }

        /* Exclude widget UI from contrast mode */
        .unified-widget, .unified-widget *,
        .uw-panel, .uw-panel *,
        .uw-toast, .uw-toast * {
            font-size: initial !important;
            line-height: initial !important;
            background-color: inherit;
            color: inherit;
            outline: inherit;
            z-index: auto;
        }

        /* =========================================
           2. NEW ACCESSIBILITY FEATURES (v2.0)
           ========================================= */

        /* Dyslexic Font */
        body.uw-dyslexic-font {
            font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
        }

        /* Reading Guide */
        .uw-reading-guide {
            position: fixed;
            left: 0;
            right: 0;
            height: 2px;
            background: rgba(255, 202, 40, 0.8);
            pointer-events: none;
            z-index: 9999;
            box-shadow: 0 0 10px rgba(255, 202, 40, 0.5);
            transition: top 0.1s ease-out;
        }

        /* Reading Mask */
        .uw-reading-mask {
            position: fixed;
            inset: 0;
            background: radial-gradient(
                ellipse 600px 100px at var(--mouse-x, 50%) var(--mouse-y, 50%),
                transparent 0%,
                rgba(0, 0, 0, 0.85) 100%
            );
            pointer-events: none;
            z-index: 9998;
        }

        /* Big Cursor */
        body.uw-big-cursor * {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M2 2 L2 28 L10 22 L14 30 L18 28 L14 20 L22 20 Z" fill="black" stroke="white" stroke-width="1"/></svg>') 0 0, auto !important;
        }

        body.uw-big-cursor-3x * {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M3 3 L3 42 L15 33 L21 45 L27 42 L21 30 L33 30 Z" fill="black" stroke="white" stroke-width="2"/></svg>') 0 0, auto !important;
        }

        /* Line Height Adjustment */
        body.uw-line-height-175 p,
        body.uw-line-height-175 li {
            line-height: 1.75 !important;
        }

        body.uw-line-height-200 p,
        body.uw-line-height-200 li {
            line-height: 2.0 !important;
        }

        /* Letter Spacing */
        body.uw-letter-spacing-wide {
            letter-spacing: 0.05em !important;
        }

        body.uw-letter-spacing-wider {
            letter-spacing: 0.1em !important;
        }

        /* Stop Animations */
        body.uw-stop-animations *,
        body.uw-stop-animations *::before,
        body.uw-stop-animations *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }

        /* Monochrome */
        body.uw-monochrome {
            filter: grayscale(100%);
        }

        /* =========================================
           3. WIDGET UI STRUCTURE
           ========================================= */

        /* Mini Weather Widget (Collapsed State - like old weather-alert.js) */
        .unified-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 290px;
            min-height: 90px;
            background: linear-gradient(135deg, rgba(26, 47, 95, 0.95) 0%, rgba(15, 26, 54, 0.98) 100%);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                        0 1px 0 rgba(255, 255, 255, 0.1) inset,
                        0 -1px 0 rgba(0, 0, 0, 0.2) inset;
            color: white;
            cursor: pointer;
            z-index: var(--uw-z-widget);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            opacity: 0;
            transform: translateY(100%);
            display: flex;
            align-items: stretch;
            padding: 0;
            overflow: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .unified-widget.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .unified-widget::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 12px;
            border: 2px solid transparent;
            transition: border-color 0.3s ease;
            pointer-events: none;
            z-index: 1;
        }

        .unified-widget:hover::before {
            border-color: rgba(255, 202, 40, 0.3);
        }

        .unified-widget:hover {
            background: linear-gradient(135deg, rgba(26, 47, 95, 0.98) 0%, rgba(15, 26, 54, 1) 100%);
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4),
                        0 1px 0 rgba(255, 255, 255, 0.15) inset,
                        0 -1px 0 rgba(0, 0, 0, 0.3) inset;
        }

        /* Mini Weather Display */
        .uw-mini-weather {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 16px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .uw-mini-weather:hover {
            background: rgba(255,255,255,0.05);
        }

        .uw-mini-icon-box {
            width: 52px;
            height: 52px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .uw-mini-icon {
            font-size: 26px !important;
            color: #e3f2fd;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .uw-mini-info {
            flex: 1;
            min-width: 0;
        }

        .uw-mini-temp {
            font-size: 24px;
            font-weight: 700;
            line-height: 1;
            color: white;
            letter-spacing: -0.5px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .uw-mini-condition {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.95);
            font-weight: 500;
            margin-top: 4px;
        }

        /* Mini Controls */
        .uw-mini-controls {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 8px;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        .uw-mini-btn {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            color: var(--uw-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 0;
        }

        .uw-mini-btn:hover {
            transform: scale(1.1);
            background: white;
            border-color: var(--uw-accent);
        }

        .uw-mini-btn i {
            font-size: 20px;
        }

        /* Mobile Mini Mode */
        @media (max-width: 768px) {
            .unified-widget {
                width: 70px;
                height: 70px;
                bottom: 16px;
                right: 16px;
            }

            .unified-widget::after {
                content: '';
                position: absolute;
                inset: -8px;
                border-radius: 50%;
                border: 2px solid rgba(255, 202, 40, 0.3);
                animation: uw-pulse-hint 3s ease-in-out infinite;
                pointer-events: none;
            }
        }

        @keyframes uw-pulse-hint {
            0%, 70%, 100% {
                transform: scale(1);
                opacity: 0;
            }
            10%, 30% {
                transform: scale(1.1);
                opacity: 0.6;
            }
        }

        /* Expanded Panel */
        .uw-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 420px;
            max-height: calc(100vh - 100px);
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: var(--uw-z-panel);
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
            pointer-events: none;
            transition: all var(--uw-transition);
            overflow: hidden;
            font-family: 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
        }

        .uw-panel.show {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }

        /* Panel Header */
        .uw-panel-header {
            background: linear-gradient(135deg, var(--uw-primary) 0%, var(--uw-primary-dark) 100%);
            color: white;
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid var(--uw-accent);
        }

        .uw-panel-title {
            font-size: 1.1rem;
            font-weight: 700;
        }

        .uw-panel-close {
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .uw-panel-close:hover {
            background: rgba(255,255,255,0.2);
            transform: scale(1.1);
        }

        /* Tab Bar */
        .uw-tab-bar {
            display: flex;
            background: var(--uw-gray-50);
            border-bottom: 1px solid var(--uw-gray-100);
        }

        .uw-tab {
            flex: 1;
            padding: 0.75rem;
            border: none;
            background: transparent;
            color: var(--uw-gray-700);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }

        .uw-tab:hover {
            background: rgba(26, 47, 95, 0.05);
        }

        .uw-tab.active {
            color: var(--uw-primary);
            background: white;
        }

        .uw-tab.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--uw-accent);
        }

        /* Panel Body */
        .uw-panel-body {
            padding: 1.5rem;
            overflow-y: auto;
            flex: 1;
            min-height: 0;
        }

        .uw-tab-content {
            display: none;
        }

        .uw-tab-content.active {
            display: block;
            animation: uw-fade-in 0.3s ease;
        }

        @keyframes uw-fade-in {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Toggle Options */
        .uw-option {
            background: var(--uw-gray-50);
            border-radius: 10px;
            padding: 1rem;
            margin-bottom: 0.75rem;
            border: 2px solid transparent;
            transition: all 0.2s;
        }

        .uw-option:hover {
            background: var(--uw-gray-100);
            border-color: var(--uw-gray-100);
        }

        .uw-option-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.25rem;
        }

        .uw-option-label {
            font-size: 1rem;
            font-weight: 600;
            color: var(--uw-primary);
        }

        .uw-option-description {
            font-size: 0.875rem;
            color: #666;
            line-height: 1.4;
        }

        /* Toggle Switch */
        .uw-toggle {
            position: relative;
            width: 52px;
            height: 26px;
            background: #ccc;
            border-radius: 13px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .uw-toggle.active {
            background: #43a047;
        }

        .uw-toggle::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: transform 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .uw-toggle.active::after {
            transform: translateX(26px);
        }

        /* Panel Footer */
        .uw-panel-footer {
            padding: 1rem 1.5rem;
            border-top: 2px solid var(--uw-gray-100);
            display: flex;
            gap: 0.75rem;
        }

        .uw-btn {
            flex: 1;
            padding: 0.75rem;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
        }

        .uw-btn-primary {
            background: var(--uw-primary);
            color: white;
        }

        .uw-btn-primary:hover {
            background: var(--uw-primary-light);
            transform: translateY(-1px);
        }

        .uw-btn-secondary {
            background: var(--uw-gray-100);
            color: #666;
        }

        .uw-btn-secondary:hover {
            background: var(--uw-gray-100);
        }

        /* Toast Notifications */
        .uw-toast {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(150%);
            background: var(--uw-primary);
            color: white;
            padding: 1rem 1.75rem;
            border-radius: 8px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            border-left: 4px solid var(--uw-accent);
            z-index: var(--uw-z-toast);
            transition: transform var(--uw-transition-bounce);
        }

        .uw-toast.show {
            transform: translateX(-50%) translateY(0);
        }

        /* Backdrop */
        .uw-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.3);
            z-index: calc(var(--uw-z-widget) + 1);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .uw-backdrop.show {
            opacity: 1;
            pointer-events: all;
        }

        /* Weather Content Styles */
        .uw-weather-current {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--uw-gray-50);
            border-radius: 10px;
            margin-bottom: 1rem;
        }

        .uw-weather-icon-box {
            width: 60px;
            height: 60px;
            background: rgba(255,255,255,0.5);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .uw-weather-icon {
            font-size: 32px;
            font-family: 'Material Icons';
        }

        .uw-weather-info {
            flex: 1;
        }

        .uw-weather-temp {
            font-size: 2rem;
            font-weight: 700;
            color: var(--uw-primary);
            line-height: 1;
        }

        .uw-weather-condition {
            font-size: 1rem;
            color: #666;
            margin-top: 0.25rem;
        }

        .uw-weather-location {
            font-size: 0.875rem;
            color: #999;
            margin-top: 0.25rem;
        }

        .uw-safety-alert {
            background: var(--uw-gray-50);
            border-radius: 10px;
            padding: 1rem;
            margin-top: 1rem;
        }

        .uw-safety-alert.advisory {
            border-left: 4px solid var(--uw-advisory);
        }

        .uw-safety-alert.warning {
            border-left: 4px solid var(--uw-warning);
        }

        .uw-safety-alert.critical {
            border-left: 4px solid var(--uw-critical);
            animation: uw-pulse-alert 2s ease-in-out infinite;
        }

        @keyframes uw-pulse-alert {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.85; }
        }

        .uw-safety-title {
            font-size: 0.875rem;
            font-weight: 700;
            color: var(--uw-primary);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
        }

        .uw-safety-tips {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .uw-safety-tips li {
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 0.5rem;
            padding-left: 1.25rem;
            position: relative;
        }

        .uw-safety-tips li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--uw-accent);
            font-weight: bold;
        }

        .uw-emergency {
            background: rgba(229, 57, 53, 0.1);
            border: 1px solid var(--uw-critical);
            border-radius: 8px;
            padding: 0.75rem;
            text-align: center;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--uw-critical);
            margin-top: 1rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .uw-panel {
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                max-height: 80vh;
                border-radius: 16px 16px 0 0;
                transform: translateY(100%);
            }

            .uw-panel.show {
                transform: translateY(0);
            }

            .uw-panel-body {
                max-height: calc(80vh - 200px);
            }
        }

        /* Keyboard Focus States */
        .uw-toggle:focus,
        .uw-btn:focus,
        .uw-tab:focus,
        .uw-panel-close:focus {
            outline: 3px solid var(--uw-accent);
            outline-offset: 2px;
        }

        /* Scrollbar Styling */
        .uw-panel-body::-webkit-scrollbar {
            width: 8px;
        }

        .uw-panel-body::-webkit-scrollbar-track {
            background: var(--uw-gray-50);
        }

        .uw-panel-body::-webkit-scrollbar-thumb {
            background: var(--uw-gray-700);
            border-radius: 4px;
        }

        /* === WEATHER ICON ANIMATIONS === */
        @keyframes sunny {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .uw-mini-icon.sunny,
        .uw-weather-icon.sunny {
            color: #ffeb3b;
            animation: sunny 30s linear infinite;
        }

        @keyframes night {
            0%, 100% { transform: scale(1); opacity: 0.95; }
            50% { transform: scale(1.05); opacity: 1; }
        }

        .uw-mini-icon.night,
        .uw-weather-icon.night {
            color: #b3e5fc;
            animation: night 8s ease-in-out infinite;
        }

        @keyframes partly-cloudy {
            0%, 100% { transform: translateX(0) scale(1); }
            50% { transform: translateX(1px) scale(1.02); }
        }

        .uw-mini-icon.partly-cloudy,
        .uw-weather-icon.partly-cloudy {
            color: #e3f2fd;
            animation: partly-cloudy 6s ease-in-out infinite;
        }

        @keyframes rainy {
            0%, 100% { transform: translateY(0); opacity: 1; }
            50% { transform: translateY(-2px); opacity: 0.85; }
        }

        .uw-mini-icon.rainy,
        .uw-weather-icon.rainy {
            color: #2196f3;
            animation: rainy 2s ease-in-out infinite;
        }

        @keyframes snowy {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-1px) rotate(5deg); }
            75% { transform: translateY(1px) rotate(-5deg); }
        }

        .uw-mini-icon.snowy,
        .uw-weather-icon.snowy {
            color: #e3f2fd;
            animation: snowy 4s ease-in-out infinite;
        }

        @keyframes thunderstorm {
            0%, 90%, 100% { opacity: 1; }
            5%, 85% { opacity: 0.3; }
        }

        .uw-mini-icon.thunderstorm,
        .uw-weather-icon.thunderstorm {
            color: #ff7043;
            animation: thunderstorm 2s ease-in-out infinite;
        }

        @keyframes severe-storm {
            0%, 85%, 100% { opacity: 1; transform: scale(1); }
            5%, 80% { opacity: 0.4; transform: scale(1.1); }
        }

        .uw-mini-icon.severe-storm,
        .uw-weather-icon.severe-storm {
            color: #e53935;
            animation: severe-storm 1s ease-in-out infinite;
        }

        @keyframes cloudy {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(1px); }
        }

        .uw-mini-icon.cloudy,
        .uw-weather-icon.cloudy {
            color: #78909c;
            animation: cloudy 8s ease-in-out infinite;
        }
    `;

    document.head.appendChild(style);
    console.log('✅ Unified Widget CSS injected');
}

// =============================================================================
// === DATA MIGRATION ===
// =============================================================================

function migrateUserData() {
    const version = localStorage.getItem(UNIFIED_CONFIG.storageKeys.version);

    // First-time user
    if (!version) {
        console.log('🆕 New user - initializing defaults');
        localStorage.setItem(UNIFIED_CONFIG.storageKeys.version, UNIFIED_CONFIG.version);
        return;
    }

    // Migration from v1.3
    if (version === '1.3' || !version) {
        console.log('⬆️ Migrating from v1.3 to v2.0...');

        try {
            const oldPrefs = localStorage.getItem('pls_accessibility_prefs');
            const oldData = oldPrefs ? JSON.parse(oldPrefs) : {};

            const newPrefs = {
                // Preserve v1.3 settings
                largerText: oldData.largerText || false,
                highContrast: oldData.highContrast || false,

                // New v2.0 features (all disabled by default)
                dyslexicFont: false,
                readingGuide: false,
                readingMask: false,
                bigCursor: false,
                bigCursorSize: 2,
                lineHeight: 'normal',
                letterSpacing: 'normal',
                linkHighlight: false,
                darkMode: false,
                stopAnimations: false,
                monochrome: false,
                textToSpeech: false
            };

            localStorage.setItem(UNIFIED_CONFIG.storageKeys.accessibilityPrefs, JSON.stringify(newPrefs));
            localStorage.setItem(UNIFIED_CONFIG.storageKeys.version, UNIFIED_CONFIG.version);

            console.log('✅ Migration successful');
            console.log('   Preserved:', { largerText: newPrefs.largerText, highContrast: newPrefs.highContrast });
        } catch (error) {
            console.error('❌ Migration failed:', error);
            localStorage.setItem(UNIFIED_CONFIG.storageKeys.version, UNIFIED_CONFIG.version);
        }
    }
}

function cleanupOldWidgets() {
    // Remove v1.3 accessibility widget
    document.querySelectorAll('.access-float-icon, .access-panel, .access-banner').forEach(el => el.remove());

    // Remove v4.3 weather widget
    document.querySelectorAll('.weather-alert').forEach(el => el.remove());

    // Remove old styles
    document.querySelectorAll('#accessibility-widget-styles, #weather-alert-css').forEach(el => el.remove());

    // Destroy old instances
    if (window.accessibilityWidget) delete window.accessibilityWidget;
    if (window.weatherSystem) {
        window.weatherSystem.destroy?.();
        delete window.weatherSystem;
        delete window.weatherSystemActive;
    }

    console.log('🧹 Old widgets cleaned up');
}

// =============================================================================
// === UNIFIED WIDGET CLASS ===
// =============================================================================

class UnifiedWidget {
    constructor() {
        this.version = UNIFIED_CONFIG.version;
        this.isExpanded = false;
        this.activeTab = 'weather'; // Weather first!
        this.preferences = this.loadPreferences();
        this.weatherData = null;
        this.weatherTimer = null;
        this.readingGuideElement = null;
        this.readingMaskElement = null;

        console.log('🎨 Unified Widget instance created');
        this.init();
    }

    async init() {
        // Inject CSS
        injectUnifiedCSS();

        // Create widget UI
        this.createWidget();
        this.createPanel();

        // Apply saved preferences
        this.applyAllPreferences();

        // Fetch weather
        await this.fetchWeather();
        this.startWeatherMonitoring();

        // Show widget after 1 second
        setTimeout(() => {
            const widget = document.querySelector('.unified-widget');
            if (widget) widget.classList.add('visible');
        }, 1000);

        console.log('✅ Unified Widget v2.0 initialized');
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'unified-widget';
        widget.setAttribute('role', 'button');
        widget.setAttribute('aria-label', 'Informații meteo și setări de accesibilitate');
        widget.setAttribute('tabindex', '0');
        widget.innerHTML = `
            <div class="uw-mini-weather">
                <div class="uw-mini-icon-box">
                    <i class="material-icons uw-mini-icon">wb_sunny</i>
                </div>
                <div class="uw-mini-info">
                    <div class="uw-mini-temp">--°C</div>
                    <div class="uw-mini-condition">Se încarcă...</div>
                </div>
            </div>
            <div class="uw-mini-controls">
                <button class="uw-mini-btn" title="Setări accesibilitate" aria-label="Setări accesibilitate">
                    <i class="material-icons">visibility</i>
                </button>
            </div>
        `;

        // Click on weather area opens panel
        widget.querySelector('.uw-mini-weather').addEventListener('click', () => {
            this.activeTab = 'weather';
            this.togglePanel();
        });

        // Click on accessibility button opens accessibility tab
        widget.querySelector('.uw-mini-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.activeTab = 'accessibility';
            this.togglePanel();
        });

        widget.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.togglePanel();
            }
        });

        document.body.appendChild(widget);
    }

    createPanel() {
        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'uw-backdrop';
        backdrop.addEventListener('click', () => this.closePanel());
        document.body.appendChild(backdrop);

        // Panel
        const panel = document.createElement('div');
        panel.className = 'uw-panel';
        panel.innerHTML = `
            <div class="uw-panel-header">
                <div class="uw-panel-title">${UNIFIED_TEXT.widget.title}</div>
                <button class="uw-panel-close" aria-label="${UNIFIED_TEXT.widget.close}">
                    <i class="material-icons">close</i>
                </button>
            </div>

            <div class="uw-tab-bar">
                <button class="uw-tab active" data-tab="weather">
                    <i class="material-icons" style="font-size: 18px; vertical-align: middle;">wb_sunny</i> ${UNIFIED_TEXT.tabs.weather}
                </button>
                <button class="uw-tab" data-tab="accessibility">
                    <i class="material-icons" style="font-size: 18px; vertical-align: middle;">visibility</i> ${UNIFIED_TEXT.tabs.accessibility}
                </button>
            </div>

            <div class="uw-panel-body">
                <!-- Weather Tab (First!) -->
                <div class="uw-tab-content active" data-content="weather">
                    ${this.createWeatherContent()}
                </div>

                <!-- Accessibility Tab -->
                <div class="uw-tab-content" data-content="accessibility">
                    ${this.createAccessibilityOptions()}
                </div>
            </div>

            <div class="uw-panel-footer">
                <button class="uw-btn uw-btn-secondary" data-action="reset">
                    ${UNIFIED_TEXT.widget.reset}
                </button>
                <button class="uw-btn uw-btn-primary" data-action="save">
                    ${UNIFIED_TEXT.widget.save}
                </button>
            </div>
        `;

        document.body.appendChild(panel);

        // Setup event listeners
        this.setupPanelEvents(panel);
    }

    createAccessibilityOptions() {
        const features = [
            { key: 'largerText', icon: 'format_size', text: UNIFIED_TEXT.accessibility.largerText },
            { key: 'highContrast', icon: 'contrast', text: UNIFIED_TEXT.accessibility.highContrast },
            { key: 'dyslexicFont', icon: 'font_download', text: UNIFIED_TEXT.accessibility.dyslexicFont },
            { key: 'readingGuide', icon: 'horizontal_rule', text: UNIFIED_TEXT.accessibility.readingGuide },
            { key: 'bigCursor', icon: 'mouse', text: UNIFIED_TEXT.accessibility.bigCursor },
            { key: 'stopAnimations', icon: 'pause_circle', text: UNIFIED_TEXT.accessibility.stopAnimations },
            { key: 'monochrome', icon: 'filter_b_and_w', text: UNIFIED_TEXT.accessibility.monochrome }
        ];

        return features.map(feature => `
            <div class="uw-option">
                <div class="uw-option-header">
                    <div class="uw-option-label">
                        <i class="material-icons" style="font-size: 20px; vertical-align: middle; margin-right: 8px;">${feature.icon}</i>
                        ${feature.text.label}
                    </div>
                    <div class="uw-toggle ${this.preferences[feature.key] ? 'active' : ''}"
                         data-feature="${feature.key}"
                         role="switch"
                         aria-checked="${this.preferences[feature.key]}"
                         tabindex="0">
                    </div>
                </div>
                <div class="uw-option-description">${feature.text.description}</div>
            </div>
        `).join('');
    }

    createWeatherContent() {
        if (!this.weatherData) {
            return `<div style="text-align: center; padding: 2rem; color: #999;">
                <i class="material-icons" style="font-size: 48px;">cloud_off</i>
                <div style="margin-top: 1rem;">${UNIFIED_TEXT.weather.loading}</div>
            </div>`;
        }

        const condition = this.getWeatherCondition(this.weatherData.weatherCode, this.weatherData.isDay);

        return `
            <div class="uw-weather-current">
                <div class="uw-weather-icon-box">
                    <i class="uw-weather-icon material-icons">${condition.icon}</i>
                </div>
                <div class="uw-weather-info">
                    <div class="uw-weather-temp">${this.weatherData.temp}°C</div>
                    <div class="uw-weather-condition">${condition.name}</div>
                    <div class="uw-weather-location">${UNIFIED_CONFIG.weather.location}</div>
                </div>
            </div>
            ${this.createSafetyAlertHTML()}
        `;
    }

    createSafetyAlertHTML() {
        const alert = this.checkWeatherAlert();
        if (!alert) return '';

        return `
            <div class="uw-safety-alert ${alert.level}">
                <div class="uw-safety-title">${alert.title}</div>
                <ul class="uw-safety-tips">
                    ${alert.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            ${alert.level !== 'advisory' ? `
                <div class="uw-emergency">
                    <i class="material-icons" style="font-size: 14px; vertical-align: middle;">phone</i>
                    ${UNIFIED_TEXT.weather.emergency}
                </div>
            ` : ''}
        `;
    }

    setupPanelEvents(panel) {
        // Close button
        panel.querySelector('.uw-panel-close').addEventListener('click', () => this.closePanel());

        // Tab switching
        panel.querySelectorAll('.uw-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Toggle switches
        panel.querySelectorAll('.uw-toggle').forEach(toggle => {
            const handleToggle = () => {
                toggle.classList.toggle('active');
                const isActive = toggle.classList.contains('active');
                toggle.setAttribute('aria-checked', isActive);

                // Live preview
                const feature = toggle.dataset.feature;
                this.preferences[feature] = isActive;
                this.applyPreference(feature, isActive);
            };

            toggle.addEventListener('click', handleToggle);
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle();
                }
            });
        });

        // Action buttons
        panel.querySelector('[data-action="save"]').addEventListener('click', () => this.savePreferences());
        panel.querySelector('[data-action="reset"]').addEventListener('click', () => this.resetPreferences());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isExpanded) {
                this.closePanel();
            }
        });
    }

    switchTab(tabName) {
        this.activeTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.uw-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update content
        document.querySelectorAll('.uw-tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.content === tabName);
        });

        // If switching to weather, refresh content
        if (tabName === 'weather') {
            this.updateWeatherDisplay();
        }
    }

    togglePanel() {
        if (this.isExpanded) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        this.isExpanded = true;
        document.querySelector('.uw-panel')?.classList.add('show');
        document.querySelector('.uw-backdrop')?.classList.add('show');
    }

    closePanel() {
        this.isExpanded = false;
        document.querySelector('.uw-panel')?.classList.remove('show');
        document.querySelector('.uw-backdrop')?.classList.remove('show');
    }

    loadPreferences() {
        const stored = localStorage.getItem(UNIFIED_CONFIG.storageKeys.accessibilityPrefs);
        return stored ? JSON.parse(stored) : {
            largerText: false,
            highContrast: false,
            dyslexicFont: false,
            readingGuide: false,
            readingMask: false,
            bigCursor: false,
            bigCursorSize: 2,
            lineHeight: 'normal',
            letterSpacing: 'normal',
            linkHighlight: false,
            darkMode: false,
            stopAnimations: false,
            monochrome: false,
            textToSpeech: false
        };
    }

    savePreferences() {
        localStorage.setItem(UNIFIED_CONFIG.storageKeys.accessibilityPrefs, JSON.stringify(this.preferences));
        this.showToast(UNIFIED_TEXT.toast.saved);
        console.log('💾 Preferences saved:', this.preferences);
    }

    resetPreferences() {
        // Reset all to false
        Object.keys(this.preferences).forEach(key => {
            this.preferences[key] = false;
        });

        // Remove all classes
        this.applyAllPreferences();

        // Update UI
        document.querySelectorAll('.uw-toggle').forEach(toggle => {
            toggle.classList.remove('active');
            toggle.setAttribute('aria-checked', 'false');
        });

        // Save and notify
        this.savePreferences();
        this.showToast(UNIFIED_TEXT.toast.reset);
    }

    applyAllPreferences() {
        Object.keys(this.preferences).forEach(key => {
            this.applyPreference(key, this.preferences[key]);
        });
    }

    applyPreference(feature, enabled) {
        const body = document.body;

        switch(feature) {
            case 'largerText':
                body.classList.toggle('uw-larger-text', enabled);
                break;
            case 'highContrast':
                body.classList.toggle('uw-high-contrast', enabled);
                break;
            case 'dyslexicFont':
                body.classList.toggle('uw-dyslexic-font', enabled);
                break;
            case 'readingGuide':
                this.toggleReadingGuide(enabled);
                break;
            case 'readingMask':
                this.toggleReadingMask(enabled);
                break;
            case 'bigCursor':
                body.classList.toggle('uw-big-cursor', enabled);
                break;
            case 'lineHeight':
                body.classList.toggle('uw-line-height-175', enabled);
                break;
            case 'letterSpacing':
                body.classList.toggle('uw-letter-spacing-wide', enabled);
                break;
            case 'stopAnimations':
                body.classList.toggle('uw-stop-animations', enabled);
                break;
            case 'monochrome':
                body.classList.toggle('uw-monochrome', enabled);
                break;
        }
    }

    toggleReadingGuide(enabled) {
        if (enabled && !this.readingGuideElement) {
            this.readingGuideElement = document.createElement('div');
            this.readingGuideElement.className = 'uw-reading-guide';
            document.body.appendChild(this.readingGuideElement);

            document.addEventListener('mousemove', this.updateReadingGuide.bind(this));
        } else if (!enabled && this.readingGuideElement) {
            this.readingGuideElement.remove();
            this.readingGuideElement = null;
        }
    }

    updateReadingGuide(e) {
        if (this.readingGuideElement) {
            this.readingGuideElement.style.top = `${e.clientY}px`;
        }
    }

    toggleReadingMask(enabled) {
        if (enabled && !this.readingMaskElement) {
            this.readingMaskElement = document.createElement('div');
            this.readingMaskElement.className = 'uw-reading-mask';
            document.body.appendChild(this.readingMaskElement);

            document.addEventListener('mousemove', this.updateReadingMask.bind(this));
        } else if (!enabled && this.readingMaskElement) {
            this.readingMaskElement.remove();
            this.readingMaskElement = null;
        }
    }

    updateReadingMask(e) {
        if (this.readingMaskElement) {
            this.readingMaskElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            this.readingMaskElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        }
    }

    // === WEATHER METHODS ===

    async fetchWeather() {
        try {
            const params = new URLSearchParams({
                latitude: UNIFIED_CONFIG.weather.coordinates.lat.toString(),
                longitude: UNIFIED_CONFIG.weather.coordinates.lon.toString(),
                current: 'temperature_2m,weather_code,wind_speed_10m,precipitation,is_day',
                timezone: 'Europe/Bucharest'
            });

            const response = await fetch(`${UNIFIED_CONFIG.weather.apiUrl}?${params}`);
            if (!response.ok) throw new Error('Weather API error');

            const data = await response.json();

            this.weatherData = {
                temp: Math.round(data.current.temperature_2m),
                weatherCode: data.current.weather_code || 0,
                wind: data.current.wind_speed_10m || 0,
                precipitation: data.current.precipitation || 0,
                isDay: data.current.is_day === 1,
                timestamp: Date.now()
            };

            // Cache weather data
            localStorage.setItem(UNIFIED_CONFIG.storageKeys.weatherCache, JSON.stringify(this.weatherData));

            // Update both panel and mini widget display
            this.updateWeatherDisplay();
            this.updateMiniWeatherDisplay();

            console.log('🌤 Weather updated:', this.weatherData);
        } catch (error) {
            console.error('❌ Weather fetch error:', error);
        }
    }

    startWeatherMonitoring() {
        this.weatherTimer = setInterval(() => {
            this.fetchWeather();
        }, UNIFIED_CONFIG.weather.updateInterval);
    }

    updateWeatherDisplay() {
        const weatherContent = document.querySelector('[data-content="weather"]');
        if (weatherContent) {
            weatherContent.innerHTML = this.createWeatherContent();
        }
    }

    updateMiniWeatherDisplay() {
        if (!this.weatherData) return;

        const condition = this.getWeatherCondition(this.weatherData.weatherCode, this.weatherData.isDay);

        const miniIcon = document.querySelector('.uw-mini-icon');
        const miniTemp = document.querySelector('.uw-mini-temp');
        const miniCondition = document.querySelector('.uw-mini-condition');

        if (miniIcon) {
            miniIcon.textContent = condition.icon;
            miniIcon.className = `material-icons uw-mini-icon ${condition.anim}`;
        }

        if (miniTemp) {
            miniTemp.textContent = `${this.weatherData.temp}°C`;
        }

        if (miniCondition) {
            miniCondition.textContent = condition.name;
        }
    }

    getWeatherCondition(code, isDay) {
        const condition = WEATHER_CONDITIONS[code] || WEATHER_CONDITIONS[0];
        if (condition.day && condition.night) {
            return isDay ? condition.day : condition.night;
        }
        return condition;
    }

    checkWeatherAlert() {
        if (!this.weatherData) return null;

        const { temp, weatherCode, wind } = this.weatherData;
        const condition = this.getWeatherCondition(weatherCode, this.weatherData.isDay);
        let alert = null;

        // Temperature alerts
        if (temp <= UNIFIED_CONFIG.weather.thresholds.temperature.cold) {
            alert = SAFETY_ADVICE.extreme_cold;
        } else if (temp >= UNIFIED_CONFIG.weather.thresholds.temperature.hot) {
            alert = SAFETY_ADVICE.extreme_heat;
        }

        // Wind alerts
        if (wind >= UNIFIED_CONFIG.weather.thresholds.wind.strong) {
            alert = SAFETY_ADVICE.high_winds;
        }

        // Condition-based alerts
        if (condition.advice && SAFETY_ADVICE[condition.advice]) {
            const conditionAlert = SAFETY_ADVICE[condition.advice];
            if (!alert || this.getAlertPriority(conditionAlert.level) > this.getAlertPriority(alert?.level)) {
                alert = conditionAlert;
            }
        }

        return alert;
    }

    getAlertPriority(level) {
        return { advisory: 1, warning: 2, critical: 3 }[level] || 0;
    }

    // === UI HELPERS ===

    showToast(message) {
        const existing = document.querySelector('.uw-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'uw-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, UNIFIED_CONFIG.behavior.toastDuration);
    }

    destroy() {
        if (this.weatherTimer) {
            clearInterval(this.weatherTimer);
        }

        document.querySelectorAll('.unified-widget, .uw-panel, .uw-backdrop, .uw-toast').forEach(el => el.remove());

        if (this.readingGuideElement) this.readingGuideElement.remove();
        if (this.readingMaskElement) this.readingMaskElement.remove();

        console.log('🗑️ Unified Widget destroyed');
    }
}

// =============================================================================
// === INITIALIZATION ===
// =============================================================================

// Run migration and cleanup
migrateUserData();
cleanupOldWidgets();

// Initialize widget
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.unifiedWidget = new UnifiedWidget();
    });
} else {
    window.unifiedWidget = new UnifiedWidget();
}

console.log('✅ Unified Widget v2.0 loaded successfully');
console.log('📊 Features: Accessibility + Weather | Mobile-First | WCAG 2.1 AA');
