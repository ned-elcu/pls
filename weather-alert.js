// WEATHER-ALERT.JS - Municipal Weather Warning System for Poliția Locală Slobozia
// Professional weather monitoring and safety advisory system

class WeatherAlertSystem {
    constructor() {
        this.apiBaseUrl = 'https://api.open-meteo.com/v1/forecast';
        this.coordinates = {
            latitude: 44.5667,  // Slobozia, Romania
            longitude: 27.3667
        };
        this.updateInterval = 5 * 60 * 1000; // 5 minutes for municipal monitoring
        this.weatherContainer = null;
        this.isExpanded = false;
        this.isHidden = false;
        this.currentWeatherData = null;
        this.updateTimer = null;
        this.hideTimer = null;
        this.lastSuccessfulData = null;
        this.currentAlertLevel = 'normal';
        
        // Municipal weather conditions with safety guidance
        this.weatherConditions = {
            0: { icon: 'wb_sunny', name: 'Senin', animation: 'sunny', advice: null },
            1: { icon: 'partly_cloudy_day', name: 'Parțial înnorat', animation: 'partly-cloudy', advice: null },
            2: { icon: 'partly_cloudy_day', name: 'Parțial înnorat', animation: 'partly-cloudy', advice: null },
            3: { icon: 'cloud', name: 'Înnorat', animation: 'cloudy', advice: null },
            45: { icon: 'foggy', name: 'Ceață', animation: 'foggy', advice: 'visibility' },
            48: { icon: 'foggy', name: 'Ceață cu chiciură', animation: 'foggy', advice: 'ice_safety' },
            51: { icon: 'grain', name: 'Burniță ușoară', animation: 'drizzle', advice: null },
            53: { icon: 'grain', name: 'Burniță moderată', animation: 'drizzle', advice: 'light_rain' },
            55: { icon: 'grain', name: 'Burniță densă', animation: 'drizzle', advice: 'heavy_rain' },
            56: { icon: 'ac_unit', name: 'Burniță înghețată', animation: 'drizzle', advice: 'ice_safety' },
            57: { icon: 'ac_unit', name: 'Burniță înghețată densă', animation: 'drizzle', advice: 'ice_safety' },
            61: { icon: 'water_drop', name: 'Ploaie ușoară', animation: 'rainy', advice: null },
            63: { icon: 'water_drop', name: 'Ploaie moderată', animation: 'rainy', advice: 'light_rain' },
            65: { icon: 'water_drop', name: 'Ploaie torențială', animation: 'heavy-rain', advice: 'heavy_rain' },
            66: { icon: 'ac_unit', name: 'Ploaie înghețată', animation: 'rainy', advice: 'ice_safety' },
            67: { icon: 'ac_unit', name: 'Ploaie înghețată puternică', animation: 'heavy-rain', advice: 'ice_safety' },
            71: { icon: 'ac_unit', name: 'Ninsoare ușoară', animation: 'snowy', advice: 'light_snow' },
            73: { icon: 'ac_unit', name: 'Ninsoare moderată', animation: 'snowy', advice: 'heavy_snow' },
            75: { icon: 'ac_unit', name: 'Ninsoare abundentă', animation: 'heavy-snow', advice: 'heavy_snow' },
            77: { icon: 'ac_unit', name: 'Ninsoare cu boabe', animation: 'snowy', advice: 'heavy_snow' },
            80: { icon: 'water_drop', name: 'Averse ușoare', animation: 'rainy', advice: 'light_rain' },
            81: { icon: 'water_drop', name: 'Averse moderate', animation: 'rainy', advice: 'heavy_rain' },
            82: { icon: 'water_drop', name: 'Averse violente', animation: 'heavy-rain', advice: 'heavy_rain' },
            85: { icon: 'ac_unit', name: 'Averse de zăpadă', animation: 'snowy', advice: 'heavy_snow' },
            86: { icon: 'ac_unit', name: 'Averse de zăpadă puternice', animation: 'heavy-snow', advice: 'heavy_snow' },
            95: { icon: 'thunderstorm', name: 'Furtună', animation: 'thunderstorm', advice: 'thunderstorm' },
            96: { icon: 'thunderstorm', name: 'Furtună cu grindină', animation: 'thunderstorm', advice: 'severe_storm' },
            99: { icon: 'thunderstorm', name: 'Furtună severă cu grindină', animation: 'severe-thunderstorm', advice: 'severe_storm' }
        };
        
        // Municipal safety guidance for different conditions
        this.safetyAdvice = {
            visibility: {
                level: 'advisory',
                title: 'ATENȚIE - VIZIBILITATE REDUSĂ',
                recommendations: [
                    'Conduceți cu atenție sporită',
                    'Folosiți farurile și semnalizarea',
                    'Păstrați distanța de siguranță',
                    'Evitați deplasările neesențiale'
                ]
            },
            light_rain: {
                level: 'advisory',
                title: 'ATENȚIE - PRECIPITAȚII',
                recommendations: [
                    'Atenție la carosabilul umed',
                    'Folosiți umbrela la deplasări',
                    'Verificați sistemele de scurgere',
                    'Evitați zonele cu risc de inundații'
                ]
            },
            heavy_rain: {
                level: 'warning',
                title: 'AVERTIZARE METEOROLOGICĂ',
                recommendations: [
                    'Evitați deplasările neesențiale',
                    'Nu traversați zonele inundate',
                    'Verificați acoperișurile și jgheaburile',
                    'Țineți la îndemână numerele de urgență',
                    'Urmăriți comunicatele oficiale'
                ]
            },
            light_snow: {
                level: 'advisory',
                title: 'ATENȚIE - NINSOARE',
                recommendations: [
                    'Echipați vehiculele pentru iarnă',
                    'Atenție la drumurile alunecoase',
                    'Purtați încălțăminte adecvată',
                    'Verificați încălzirea locuinței'
                ]
            },
            heavy_snow: {
                level: 'warning',
                title: 'AVERTIZARE NINSOARE ABUNDENTĂ',
                recommendations: [
                    'Evitați călătoriile neesențiale',
                    'Pregătiți vehiculele pentru iarnă',
                    'Asigurați-vă rezerve de alimente',
                    'Verificați sistemul de încălzire',
                    'Curățați zăpada de pe acoperișuri',
                    'Contactați vecinii în vârstă'
                ]
            },
            ice_safety: {
                level: 'warning',
                title: 'ATENȚIE - SUPRAFEȚE ÎNGHEȚATE',
                recommendations: [
                    'Mișcați-vă cu atenție extremă',
                    'Folosiți încălțăminte antiderapantă',
                    'Evitați deplasările pe jos',
                    'Atenție la suprafețele din umbră',
                    'Verificați conductele de apă'
                ]
            },
            thunderstorm: {
                level: 'warning',
                title: 'AVERTIZARE FURTUNĂ',
                recommendations: [
                    'Rămâneți în interior',
                    'Evitați zonele cu copaci înalți',
                    'Deconectați aparatele electrice',
                    'Evitați folosirea telefonului fix',
                    'Nu vă adăpostiți sub structuri înalte'
                ]
            },
            severe_storm: {
                level: 'critical',
                title: 'ALERTĂ METEOROLOGICĂ CRITICĂ',
                recommendations: [
                    'RĂMÂNEȚI ÎN INTERIOR OBLIGATORIU',
                    'Adăpostiți-vă într-o cameră interioară',
                    'Evitați ferestrele și ușile',
                    'Pregătiți trusa de urgență',
                    'Urmăriți alertele oficiale',
                    'Apelați 112 în caz de urgență'
                ]
            },
            extreme_cold: {
                level: 'critical',
                title: 'ALERTĂ GER SEVER',
                recommendations: [
                    'Limitați timpul petrecut în exterior',
                    'Îmbrăcați-vă în straturi multiple',
                    'Protejați extremitățile corpului',
                    'Verificați persoanele vulnerabile',
                    'Asigurați-vă funcționarea încălzirii',
                    'Atenție la semnele de degerătură'
                ]
            },
            extreme_heat: {
                level: 'critical',
                title: 'ALERTĂ CANICULĂ',
                recommendations: [
                    'Rămâneți în spații climatizate',
                    'Hidratați-vă frecvent',
                    'Evitați activitățile în exterior',
                    'Purtați haine ușoare și deschise',
                    'Verificați persoanele în vârstă',
                    'Centrul de răcorire: Biblioteca Municipală'
                ]
            },
            high_winds: {
                level: 'warning',
                title: 'AVERTIZARE VÂNT PUTERNIC',
                recommendations: [
                    'Fixați obiectele din curte',
                    'Evitați deplasarea pe jos',
                    'Atenție la căderea crengilor',
                    'Verificați acoperișurile',
                    'Evitați parcarea sub copaci'
                ]
            }
        };
        
        // Add console testing interface
        this.setupConsoleInterface();
        
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    // Setup console testing interface
    setupConsoleInterface() {
        window.weatherTest = {
            cycleWeather: () => this.cycleWeatherModes(),
            setWeather: (code) => this.setTestWeather(code),
            testAlert: (type) => this.testAlert(type),
            listCodes: () => this.listWeatherCodes(),
            show: () => this.showWeatherAlert(),
            hide: () => this.hideWeatherAlert(),
            expand: () => this.toggleExpanded(),
            destroy: () => this.destroy()
        };
        
        console.log('🏛️ Municipal Weather System - Testing Commands:');
        console.log('weatherTest.cycleWeather() - Test all weather conditions');
        console.log('weatherTest.setWeather(code) - Set specific weather (0-99)');
        console.log('weatherTest.testAlert("extreme_heat") - Test alert types');
        console.log('weatherTest.listCodes() - List all weather codes');
    }
    
    // Test specific alert types
    testAlert(alertType) {
        if (this.safetyAdvice[alertType]) {
            console.log(`🚨 Testing alert: ${alertType}`);
            this.displaySafetyAlert(this.safetyAdvice[alertType]);
        } else {
            console.log('Available alert types:', Object.keys(this.safetyAdvice));
        }
    }
    
    // Cycle through weather modes for testing
    cycleWeatherModes() {
        const codes = Object.keys(this.weatherConditions).map(Number);
        let index = 0;
        
        const cycle = () => {
            if (index >= codes.length) {
                console.log('🏛️ Municipal weather cycle completed');
                return;
            }
            
            const code = codes[index];
            console.log(`🌤️ Testing: ${code} - ${this.weatherConditions[code].name}`);
            this.setTestWeather(code);
            index++;
            setTimeout(cycle, 3000); // 3 seconds per condition
        };
        
        console.log('🏛️ Starting municipal weather monitoring cycle...');
        cycle();
    }
    
    // Set test weather condition
    setTestWeather(code) {
        const condition = this.weatherConditions[code];
        if (!condition) {
            console.error(`❌ Invalid weather code: ${code}`);
            return;
        }
        
        const testData = {
            current: {
                temperature_2m: -5 + Math.random() * 45, // Range -5 to 40°C
                weather_code: code,
                wind_speed_10m: Math.random() * 50,
                precipitation: Math.random() * 10,
                cloud_cover: Math.random() * 100,
                relative_humidity_2m: 30 + Math.random() * 60
            }
        };
        
        this.updateWeatherDisplay(testData);
        this.checkMunicipalAlerts(testData);
        console.log(`🏛️ Set municipal weather: ${condition.name}`);
    }
    
    // List all weather codes
    listWeatherCodes() {
        console.log('🏛️ Municipal Weather Monitoring Codes:');
        Object.entries(this.weatherConditions).forEach(([code, condition]) => {
            const advisory = condition.advice ? ` [${condition.advice}]` : '';
            console.log(`${code}: ${condition.name}${advisory}`);
        });
    }
    
    // Initialize the municipal weather system
    async init() {
        this.injectMunicipalCSS();
        await this.createWeatherContainer();
        this.setupEventListeners();
        this.startMunicipalMonitoring();
        this.setupIntersectionObserver();
        
        // Delay appearance for smooth site loading
        setTimeout(() => {
            this.makeVisible();
        }, 2000);
    }
    
    // Inject municipal-appropriate CSS
    injectMunicipalCSS() {
        if (document.getElementById('municipal-weather-css')) return;
        
        const css = `
        /* Municipal Weather Warning System - Professional Styling */
        .weather-alert-floating {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 280px;
            min-height: 70px;
            background: rgba(26, 47, 95, 0.7); /* Municipal blue with 70% transparency */
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            box-shadow: 
                0 4px 20px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            z-index: 100;
            cursor: pointer;
            transition: all 0.3s ease;
            overflow: hidden;
            opacity: 0;
            transform: translateY(100%);
        }
        
        .weather-alert-floating.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .weather-alert-floating.hidden {
            opacity: 0.9;
            pointer-events: none;
        }
        
        .weather-alert-floating.advisory {
            border-left: 4px solid #ffa726;
            background: rgba(26, 47, 95, 0.8);
        }
        
        .weather-alert-floating.warning {
            border-left: 4px solid #ff7043;
            background: rgba(26, 47, 95, 0.9);
            min-height: 120px;
        }
        
        .weather-alert-floating.critical {
            border-left: 4px solid #e53935;
            background: rgba(26, 47, 95, 0.95);
            min-height: 160px;
            animation: criticalPulse 3s infinite;
        }
        
        .weather-alert-floating.expanded {
            min-height: 140px;
            width: 340px;
        }
        
        .weather-alert-floating:hover {
            background: rgba(26, 47, 95, 0.85);
            box-shadow: 
                0 6px 25px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }
        
        .weather-content {
            padding: 12px 16px;
            position: relative;
        }
        
        .weather-basic-info {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .weather-icon-container {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .weather-icon {
            font-size: 24px;
            color: #e3f2fd;
            transition: all 0.3s ease;
            font-family: 'Material Icons' !important;
            font-weight: normal;
            font-style: normal;
            display: inline-block;
            line-height: 1;
            text-transform: none;
            letter-spacing: normal;
            word-wrap: normal;
            white-space: nowrap;
            direction: ltr;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
            -moz-osx-font-smoothing: grayscale;
            font-feature-settings: 'liga';
        }
        
        .weather-text-info {
            flex: 1;
            min-width: 0;
        }
        
        .weather-temp-condition {
            display: flex;
            align-items: baseline;
            gap: 8px;
            margin-bottom: 2px;
        }
        
        .temperature-display {
            font-size: 20px;
            font-weight: 600;
            color: #ffffff;
            line-height: 1;
        }
        
        .condition-text {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 400;
        }
        
        .location-indicator {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 400;
            margin-top: 2px;
        }
        
        .alert-header {
            display: none;
            background: rgba(255, 255, 255, 0.1);
            margin: -12px -16px 8px -16px;
            padding: 8px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .alert-header.visible {
            display: block;
        }
        
        .alert-title {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #ffffff;
            margin: 0;
        }
        
        .safety-recommendations {
            display: none;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .safety-recommendations.visible {
            display: block;
        }
        
        .safety-list {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        
        .safety-list li {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 4px;
            padding-left: 16px;
            position: relative;
            line-height: 1.3;
        }
        
        .safety-list li:before {
            content: '•';
            color: #ffca28;
            position: absolute;
            left: 0;
            font-weight: bold;
        }
        
        .emergency-contact {
            display: none;
            margin-top: 8px;
            padding: 6px 12px;
            background: rgba(229, 57, 53, 0.2);
            border-radius: 4px;
            border: 1px solid rgba(229, 57, 53, 0.3);
        }
        
        .emergency-contact.visible {
            display: block;
        }
        
        .emergency-text {
            font-size: 11px;
            color: #ffcdd2;
            margin: 0;
            font-weight: 500;
        }
        
        .expand-indicator {
            position: absolute;
            bottom: 8px;
            right: 12px;
            font-size: 16px;
            opacity: 0.6;
            transition: all 0.3s ease;
            cursor: pointer;
            z-index: 10;
            background: rgba(255, 255, 255, 0.1);
            padding: 4px;
            border-radius: 4px;
        }
        
        .expand-indicator:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.2);
        }
        
        .expand-indicator i {
            font-family: 'Material Icons' !important;
            font-size: 16px;
            color: white;
        }
        
        .update-indicator {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 6px;
            height: 6px;
            background: #4caf50;
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .update-indicator.flash {
            opacity: 1;
            animation: updateFlash 1s ease-out;
        }
        
        .loading-skeleton {
            background: linear-gradient(90deg, 
                rgba(255,255,255,0.1), 
                rgba(255,255,255,0.2), 
                rgba(255,255,255,0.1)
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            color: rgba(255, 255, 255, 0.6);
        }
        
        .error-state {
            border-left: 4px solid #f44336;
            background: rgba(244, 67, 54, 0.1);
        }
        
        /* Professional Weather Icon Animations */
        .weather-icon.sunny {
            color: #ffeb3b;
            animation: gentleRotate 30s linear infinite;
        }
        
        .weather-icon.partly-cloudy {
            color: #90a4ae;
            animation: subtleFloat 6s ease-in-out infinite;
        }
        
        .weather-icon.cloudy {
            color: #78909c;
            animation: cloudDrift 8s ease-in-out infinite;
        }
        
        .weather-icon.rainy {
            color: #2196f3;
            animation: rainDrop 2s ease-in-out infinite;
        }
        
        .weather-icon.heavy-rain {
            color: #1976d2;
            animation: heavyRainPulse 1.5s ease-in-out infinite;
        }
        
        .weather-icon.snowy {
            color: #e3f2fd;
            animation: snowfall 4s ease-in-out infinite;
        }
        
        .weather-icon.heavy-snow {
            color: #ffffff;
            animation: blizzard 2s ease-in-out infinite;
        }
        
        .weather-icon.thunderstorm {
            color: #ff7043;
            animation: lightning 2s ease-in-out infinite;
        }
        
        .weather-icon.severe-thunderstorm {
            color: #e53935;
            animation: severeLightning 1s ease-in-out infinite;
        }
        
        .weather-icon.foggy {
            color: #90a4ae;
            animation: fogPulse 3s ease-in-out infinite;
            opacity: 0.8;
        }
        
        .weather-icon.drizzle {
            color: #64b5f6;
            animation: drizzleFloat 3s ease-in-out infinite;
        }
        
        /* Municipal-appropriate Keyframes */
        @keyframes gentleRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        @keyframes subtleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
        }
        
        @keyframes cloudDrift {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(1px); }
        }
        
        @keyframes rainDrop {
            0%, 100% { transform: translateY(0px); opacity: 1; }
            50% { transform: translateY(-1px); opacity: 0.8; }
        }
        
        @keyframes heavyRainPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes snowfall {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-1px) rotate(5deg); }
            75% { transform: translateY(1px) rotate(-5deg); }
        }
        
        @keyframes blizzard {
            0%, 100% { transform: translateX(0px); }
            25% { transform: translateX(-1px); }
            75% { transform: translateX(1px); }
        }
        
        @keyframes lightning {
            0%, 90%, 100% { opacity: 1; }
            5%, 85% { opacity: 0.3; }
        }
        
        @keyframes severeLightning {
            0%, 85%, 100% { opacity: 1; transform: scale(1); }
            5%, 80% { opacity: 0.4; transform: scale(1.1); }
        }
        
        @keyframes fogPulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.9; }
        }
        
        @keyframes drizzleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-1px); }
        }
        
        @keyframes criticalPulse {
            0%, 100% { box-shadow: 0 4px 20px rgba(229, 57, 53, 0.3); }
            50% { box-shadow: 0 4px 25px rgba(229, 57, 53, 0.5); }
        }
        
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        @keyframes updateFlash {
            0% { opacity: 0; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0; transform: scale(1); }
        }
        
        /* Responsive Municipal Design */
        @media (max-width: 768px) {
            .weather-alert-floating {
                bottom: 10px;
                left: 10px;
                width: 260px;
                min-height: 60px;
            }
            
            .weather-alert-floating.expanded {
                width: 300px;
                min-height: 120px;
            }
            
            .weather-content {
                padding: 10px 12px;
            }
            
            .weather-icon-container {
                width: 40px;
                height: 40px;
                margin-right: 10px;
            }
            
            .weather-icon {
                font-size: 20px;
            }
            
            .temperature-display {
                font-size: 18px;
            }
        }
        
        /* Accessibility and High Contrast */
        @media (prefers-contrast: high) {
            .weather-alert-floating {
                border: 2px solid white;
                background: rgba(0, 0, 0, 0.9);
            }
        }
        
        @media (prefers-reduced-motion: reduce) {
            .weather-alert-floating,
            .weather-icon {
                animation: none !important;
                transition: opacity 0.3s ease !important;
            }
        }
        `;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'municipal-weather-css';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }
    
    // Create municipal weather container
    async createWeatherContainer() {
        this.weatherContainer = document.createElement('div');
        this.weatherContainer.className = 'weather-alert-floating';
        this.weatherContainer.setAttribute('role', 'complementary');
        this.weatherContainer.setAttribute('aria-label', 'Sistem de avertizare meteorologică municipală');
        this.weatherContainer.setAttribute('tabindex', '0');
        
        this.weatherContainer.innerHTML = `
            <div class="weather-content">
                <div class="alert-header" role="alert" aria-live="assertive">
                    <h3 class="alert-title"></h3>
                </div>
                
                <div class="weather-basic-info">
                    <div class="weather-icon-container">
                        <i class="material-icons weather-icon loading-skeleton">wb_sunny</i>
                    </div>
                    <div class="weather-text-info">
                        <div class="weather-temp-condition">
                            <div class="temperature-display loading-skeleton">--°C</div>
                            <div class="condition-text loading-skeleton">Se încarcă...</div>
                        </div>
                        <div class="location-indicator">Slobozia, Ialomița</div>
                    </div>
                </div>
                
                <div class="safety-recommendations" role="region" aria-label="Recomandări de siguranță">
                    <ul class="safety-list"></ul>
                </div>
                
                <div class="emergency-contact">
                    <p class="emergency-text">
                        📞 Urgențe: 112 | Poliția Locală: (0243) 955
                    </p>
                </div>
                
                <div class="expand-indicator" role="button" aria-label="Expandează informații de siguranță" tabindex="0">
                    <i class="material-icons">expand_more</i>
                </div>
                <div class="update-indicator"></div>
            </div>
        `;
        
        document.body.appendChild(this.weatherContainer);
    }
    
    // Setup municipal event listeners
    setupEventListeners() {
        // Main container click
        this.weatherContainer.addEventListener('click', (e) => {
            if (!e.target.closest('.expand-indicator')) {
                this.toggleExpanded();
            }
        });
        
        // Expand indicator
        const expandIndicator = this.weatherContainer.querySelector('.expand-indicator');
        if (expandIndicator) {
            expandIndicator.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleExpanded();
            });
            
            expandIndicator.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleExpanded();
                }
            });
        }
        
        // Keyboard support
        this.weatherContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleExpanded();
            } else if (e.key === 'Escape') {
                this.isExpanded = false;
                this.updateExpandedState();
            }
        });
        
        // Municipal footer overlap detection
        window.addEventListener('scroll', () => {
            this.checkFooterOverlap();
        });
        
        window.addEventListener('resize', () => {
            this.checkFooterOverlap();
        });
    }
    
    // Check footer overlap for municipal design
    checkFooterOverlap() {
        if (!this.weatherContainer) return;
        
        const footer = document.querySelector('footer');
        if (!footer) return;
        
        const weatherRect = this.weatherContainer.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        
        // Hide if footer is visible on screen
        if (footerRect.top < window.innerHeight && footerRect.bottom > 0) {
            this.hideWeatherAlert();
        } else {
            this.showWeatherAlert();
        }
    }
    
    // Setup intersection observer
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.target.tagName === 'FOOTER' && entry.isIntersecting) {
                    this.hideWeatherAlert();
                } else if (entry.target.tagName === 'FOOTER' && !entry.isIntersecting) {
                    setTimeout(() => this.showWeatherAlert(), 300);
                }
            });
        }, { rootMargin: '0px 0px -20px 0px' });
        
        const footer = document.querySelector('footer');
        if (footer) {
            observer.observe(footer);
        }
    }
    
    // Show/hide methods
    showWeatherAlert() {
        if (this.weatherContainer && this.isHidden) {
            this.weatherContainer.classList.remove('hidden');
            this.isHidden = false;
        }
    }
    
    hideWeatherAlert() {
        if (this.weatherContainer && !this.isHidden) {
            this.weatherContainer.classList.add('hidden');
            this.isHidden = true;
        }
    }
    
    // Enhanced toggle for municipal warnings
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        this.updateExpandedState();
        
        // Auto-show safety recommendations when expanded
        if (this.isExpanded && this.currentAlertLevel !== 'normal') {
            this.showSafetyRecommendations();
        }
        
        console.log(`🏛️ Municipal weather ${this.isExpanded ? 'expanded' : 'collapsed'}`);
    }
    
    // Update expanded state
    updateExpandedState() {
        if (this.weatherContainer) {
            this.weatherContainer.classList.toggle('expanded', this.isExpanded);
            const expandIcon = this.weatherContainer.querySelector('.expand-indicator i');
            if (expandIcon) {
                expandIcon.textContent = this.isExpanded ? 'expand_less' : 'expand_more';
            }
        }
    }
    
    // Start municipal weather monitoring
    startMunicipalMonitoring() {
        this.fetchWeatherData();
        this.updateTimer = setInterval(() => {
            this.fetchWeatherData();
        }, this.updateInterval);
    }
    
    // Fetch weather data
    async fetchWeatherData() {
        try {
            const params = new URLSearchParams({
                latitude: this.coordinates.latitude.toString(),
                longitude: this.coordinates.longitude.toString(),
                current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m',
                hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
                timezone: 'Europe/Bucharest',
                forecast_days: 1
            });
            
            const url = `${this.apiBaseUrl}?${params}`;
            console.log('🏛️ Municipal weather monitoring:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Politia-Locala-Slobozia-Municipal-Weather/1.0'
                },
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`Municipal weather API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.current || typeof data.current.temperature_2m !== 'number') {
                throw new Error('Invalid municipal weather data structure');
            }
            
            console.log('🏛️ Municipal weather update:', {
                temp: data.current.temperature_2m,
                condition: data.current.weather_code,
                wind: data.current.wind_speed_10m
            });
            
            this.currentWeatherData = data;
            this.lastSuccessfulData = data;
            this.updateWeatherDisplay(data);
            this.checkMunicipalAlerts(data);
            this.showUpdateIndicator();
            
            if (this.weatherContainer) {
                this.weatherContainer.classList.remove('error-state');
            }
            
            console.log('✅ Municipal weather monitoring updated');
            
        } catch (error) {
            console.error('❌ Municipal weather error:', error);
            this.handleWeatherError(error);
        }
    }
    
    // Update weather display
    updateWeatherDisplay(data) {
        if (!this.weatherContainer || !data.current) {
            console.error('❌ Cannot update municipal display');
            return;
        }
        
        const current = data.current;
        const weatherCode = parseInt(current.weather_code) || 0;
        const condition = this.weatherConditions[weatherCode] || {
            icon: 'help_outline',
            name: `Cod necunoscut (${weatherCode})`,
            animation: 'sunny',
            advice: null
        };
        
        // Remove loading skeleton
        const elements = this.weatherContainer.querySelectorAll('.loading-skeleton');
        elements.forEach(el => el.classList.remove('loading-skeleton'));
        
        // Update temperature
        const tempDisplay = this.weatherContainer.querySelector('.temperature-display');
        if (tempDisplay && typeof current.temperature_2m === 'number') {
            const temperature = Math.round(current.temperature_2m);
            tempDisplay.textContent = `${temperature}°C`;
        }
        
        // Update condition
        const conditionText = this.weatherContainer.querySelector('.condition-text');
        if (conditionText) {
            conditionText.textContent = condition.name;
        }
        
        // Update icon with animation
        const weatherIcon = this.weatherContainer.querySelector('.weather-icon');
        if (weatherIcon) {
            weatherIcon.className = 'material-icons weather-icon';
            weatherIcon.textContent = condition.icon;
            
            setTimeout(() => {
                weatherIcon.classList.add(condition.animation);
            }, 100);
        }
        
        // Update accessibility
        const now = new Date().toLocaleTimeString('ro-RO', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        this.weatherContainer.setAttribute('aria-label', 
            `Sistem municipal meteo Slobozia: ${condition.name}, ${Math.round(current.temperature_2m)}°C, actualizat ${now}`
        );
        
        console.log('✅ Municipal weather display updated');
    }
    
    // Check municipal weather alerts
    checkMunicipalAlerts(data) {
        if (!data.current) return;
        
        const current = data.current;
        const condition = this.weatherConditions[current.weather_code];
        let alertToShow = null;
        
        // Temperature-based alerts
        if (current.temperature_2m <= -10) {
            alertToShow = this.safetyAdvice.extreme_cold;
        } else if (current.temperature_2m >= 38) {
            alertToShow = this.safetyAdvice.extreme_heat;
        }
        
        // Wind-based alerts
        if (current.wind_speed_10m >= 40) {
            alertToShow = this.safetyAdvice.high_winds;
        }
        
        // Weather condition alerts
        if (condition && condition.advice && this.safetyAdvice[condition.advice]) {
            const conditionAlert = this.safetyAdvice[condition.advice];
            if (!alertToShow || this.getAlertPriority(conditionAlert.level) > this.getAlertPriority(alertToShow.level)) {
                alertToShow = conditionAlert;
            }
        }
        
        if (alertToShow) {
            this.displaySafetyAlert(alertToShow);
        } else {
            this.clearAlert();
        }
    }
    
    // Get alert priority for comparison
    getAlertPriority(level) {
        const priorities = { normal: 0, advisory: 1, warning: 2, critical: 3 };
        return priorities[level] || 0;
    }
    
    // Display municipal safety alert
    displaySafetyAlert(alert) {
        if (!this.weatherContainer) return;
        
        this.currentAlertLevel = alert.level;
        
        // Update container class
        this.weatherContainer.className = `weather-alert-floating visible ${alert.level}`;
        
        // Show alert header
        const alertHeader = this.weatherContainer.querySelector('.alert-header');
        const alertTitle = this.weatherContainer.querySelector('.alert-title');
        if (alertHeader && alertTitle) {
            alertTitle.textContent = alert.title;
            alertHeader.classList.add('visible');
        }
        
        // Prepare safety recommendations
        const safetyRecommendations = this.weatherContainer.querySelector('.safety-recommendations');
        const safetyList = this.weatherContainer.querySelector('.safety-list');
        if (safetyList) {
            safetyList.innerHTML = '';
            alert.recommendations.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = rec;
                safetyList.appendChild(li);
            });
        }
        
        // Show emergency contact for critical alerts
        const emergencyContact = this.weatherContainer.querySelector('.emergency-contact');
        if (emergencyContact) {
            emergencyContact.classList.toggle('visible', alert.level === 'critical');
        }
        
        // Auto-expand for warnings and critical alerts
        if ((alert.level === 'warning' || alert.level === 'critical') && !this.isExpanded) {
            this.isExpanded = true;
            this.updateExpandedState();
            this.showSafetyRecommendations();
        }
        
        console.log(`🚨 Municipal alert: ${alert.level} - ${alert.title}`);
    }
    
    // Show safety recommendations
    showSafetyRecommendations() {
        const safetyRecommendations = this.weatherContainer.querySelector('.safety-recommendations');
        if (safetyRecommendations) {
            safetyRecommendations.classList.add('visible');
        }
    }
    
    // Clear alert state
    clearAlert() {
        if (!this.weatherContainer) return;
        
        this.currentAlertLevel = 'normal';
        this.weatherContainer.className = 'weather-alert-floating visible';
        
        // Hide alert components
        const alertHeader = this.weatherContainer.querySelector('.alert-header');
        const safetyRecommendations = this.weatherContainer.querySelector('.safety-recommendations');
        const emergencyContact = this.weatherContainer.querySelector('.emergency-contact');
        
        if (alertHeader) alertHeader.classList.remove('visible');
        if (safetyRecommendations) safetyRecommendations.classList.remove('visible');
        if (emergencyContact) emergencyContact.classList.remove('visible');
    }
    
    // Handle errors
    handleWeatherError(error) {
        console.error('❌ Municipal weather system error:', error);
        
        if (!this.weatherContainer) return;
        
        this.weatherContainer.classList.add('error-state');
        
        if (this.lastSuccessfulData) {
            this.updateWeatherDisplay(this.lastSuccessfulData);
            const conditionText = this.weatherContainer.querySelector('.condition-text');
            if (conditionText) {
                conditionText.textContent += ' (Cache)';
            }
        } else {
            const tempDisplay = this.weatherContainer.querySelector('.temperature-display');
            const conditionText = this.weatherContainer.querySelector('.condition-text');
            const weatherIcon = this.weatherContainer.querySelector('.weather-icon');
            
            if (tempDisplay) tempDisplay.textContent = '--°C';
            if (conditionText) conditionText.textContent = 'Eroare conexiune';
            if (weatherIcon) {
                weatherIcon.textContent = 'cloud_off';
                weatherIcon.className = 'material-icons weather-icon';
            }
        }
        
        const elements = this.weatherContainer.querySelectorAll('.loading-skeleton');
        elements.forEach(el => el.classList.remove('loading-skeleton'));
    }
    
    // Show update indicator
    showUpdateIndicator() {
        const indicator = this.weatherContainer.querySelector('.update-indicator');
        if (indicator) {
            indicator.classList.add('flash');
            setTimeout(() => {
                indicator.classList.remove('flash');
            }, 1000);
        }
    }
    
    // Make visible
    makeVisible() {
        if (this.weatherContainer) {
            setTimeout(() => {
                this.weatherContainer.classList.add('visible');
                console.log('🏛️ Municipal weather system activated');
            }, 100);
        }
    }
    
    // Cleanup
    destroy() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
        }
        if (this.weatherContainer) {
            this.weatherContainer.remove();
        }
        
        delete window.weatherTest;
        console.log('🏛️ Municipal weather system deactivated');
    }
}

// Initialize Municipal Weather Warning System
window.WeatherAlertSystem = WeatherAlertSystem;

console.log('🏛️ Municipal Weather Warning System loaded for Poliția Locală Slobozia');
console.log('📋 Use weatherTest.* commands for municipal testing');
