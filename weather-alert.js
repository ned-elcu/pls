// WEATHER-ALERT.JS - Municipal Weather Warning System for Poliția Locală Slobozia
// Professional weather monitoring and safety advisory system - Production Version
// Now includes Emergency Monitoring (Earthquakes, Air Quality, Floods)

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
            1: { icon: 'foggy', name: 'Parțial înnorat', animation: 'foggy', advice: null },
            2: { icon: 'foggy', name: 'Parțial înnorat', animation: 'foggy', advice: null },
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
                    'Verificați gutierele și scurgerile',
                    'Evitați zonele cu risc de băltire'
                ]
            },
            heavy_rain: {
                level: 'warning',
                title: 'AVERTIZARE METEOROLOGICĂ',
                recommendations: [
                    'Evitați deplasările neesențiale',
                    'Nu traversați zonele inundate',
                    'Verificați acoperișurile și jgheaburile',
                    'Aveți la îndemână numerele de urgență',
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
                    'Verificați funcționarea încălzirii'
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
                    'Verificați vecinii în vârstă'
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
            },
            // Emergency alert types
            earthquake: {
                level: 'warning',
                title: 'ALERTĂ SEISMICĂ',
                recommendations: [
                    'Verificați integritatea locuinței',
                    'Pregătiți-vă pentru posibile replici',
                    'Urmăriți comunicatele oficiale',
                    'Apelați 112 pentru urgențe'
                ]
            },
            air_quality: {
                level: 'advisory',
                title: 'ATENȚIE - CALITATEA AERULUI',
                recommendations: [
                    'Limitați activitățile în aer liber',
                    'Persoanele sensibile să rămână în interior',
                    'Folosiți filtre de aer în locuință',
                    'Evitați zonele cu trafic intens'
                ]
            },
            flood_risk: {
                level: 'warning',
                title: 'RISC DE INUNDAȚII',
                recommendations: [
                    'Urmăriți nivelul apelor',
                    'Pregătiți planul de evacuare',
                    'Mutați obiectele de valoare la etaj',
                    'Nu traversați zonele inundate'
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
        
        // Store reference for emergency system
        window.municipalWeatherSystem = this;
    }
    
    // Method to handle emergency alerts from the emergency monitoring system
    displayEmergencyAlert(type, protocol) {
        console.log(`🚨 Emergency alert received: ${type} - ${protocol.level}`);
        
        // Integrate emergency alert with existing safety advice system
        const emergencyAlert = {
            level: protocol.level,
            title: protocol.title,
            recommendations: protocol.actions || protocol.recommendations || []
        };
        
        this.displaySafetyAlert(emergencyAlert);
        
        // Force expansion for critical emergency alerts
        if (protocol.level === 'critical' && !this.isExpanded) {
            setTimeout(() => {
                this.isExpanded = true;
                this.updateExpandedState();
                this.showSafetyRecommendations();
            }, 300);
        }
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
        
        .weather-alert-floating.critical.expanded {
            min-height: 200px;
            width: 360px;
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
            overflow: hidden;
            flex-shrink: 0;
        }
        
        .weather-icon {
            font-size: 22px;
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
            text-align: center;
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
            top: 8px;
            right: 8px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
            transition: all 0.3s ease;
            cursor: pointer;
            z-index: 10;
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            backdrop-filter: blur(4px);
        }
        
        .expand-indicator:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
        }
        
        .expand-indicator i {
            font-family: 'Material Icons' !important;
            font-size: 18px;
            color: white;
        }
        
        .update-indicator {
            position: absolute;
            top: 8px;
            right: 44px;
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
            
            .weather-alert-floating.critical.expanded {
                width: 320px;
                min-height: 180px;
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
                font-size: 18px;
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
                this.hideSafetyRecommendations();
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
        
        // Properly handle safety recommendations visibility
        if (this.isExpanded && this.currentAlertLevel !== 'normal') {
            this.showSafetyRecommendations();
        } else {
            this.hideSafetyRecommendations();
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
    
    // Show safety recommendations
    showSafetyRecommendations() {
        const safetyRecommendations = this.weatherContainer.querySelector('.safety-recommendations');
        if (safetyRecommendations) {
            safetyRecommendations.classList.add('visible');
        }
    }
    
    // Hide safety recommendations
    hideSafetyRecommendations() {
        const safetyRecommendations = this.weatherContainer.querySelector('.safety-recommendations');
        if (safetyRecommendations) {
            safetyRecommendations.classList.remove('visible');
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
        
        // Auto-expand for warnings and critical alerts with proper timing
        if ((alert.level === 'warning' || alert.level === 'critical') && !this.isExpanded) {
            console.log(`🚨 Auto-expanding for ${alert.level} alert`);
            setTimeout(() => {
                this.isExpanded = true;
                this.updateExpandedState();
                this.showSafetyRecommendations();
            }, 300); // Delay to ensure CSS transitions work properly
        }
        
        console.log(`🚨 Municipal alert: ${alert.level} - ${alert.title}`);
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
        
        // Reset expansion state when clearing alerts
        if (this.isExpanded) {
            this.isExpanded = false;
            this.updateExpandedState();
        }
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
        
        const cssElement = document.getElementById('municipal-weather-css');
        if (cssElement) {
            cssElement.remove();
        }
        
        delete window.weatherTest;
        delete window.municipalWeatherSystem;
        console.log('🏛️ Municipal weather system deactivated');
    }
}

// EMERGENCY MONITORING SYSTEM INTEGRATION
// Extends the municipal weather system with earthquake, air quality, and flood monitoring

class EmergencyMonitoringSystem {
    constructor() {
        this.coordinates = {
            latitude: 44.5667,  // Slobozia, Romania
            longitude: 27.3667
        };
        
        // API endpoints - all publicly accessible
        this.apis = {
            earthquake: {
                url: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
                name: 'USGS Earthquake API',
                keyRequired: false
            },
            airQuality: {
                url: 'https://api.open-meteo.com/v1/air-quality',
                name: 'Open-Meteo Air Quality',
                keyRequired: false
            },
            flood: {
                url: 'https://api.open-meteo.com/v1/flood',
                name: 'Open-Meteo Flood API',
                keyRequired: false
            }
        };
        
        // Emergency thresholds for municipal alerts
        this.emergencyThresholds = {
            earthquake: {
                minor: 3.0,     // Local awareness
                moderate: 4.5,  // Municipal preparation
                major: 6.0,     // Emergency response
                radius: 100     // km from Slobozia
            },
            airQuality: {
                good: 50,
                moderate: 100,
                unhealthy: 150,
                dangerous: 300
            },
            flood: {
                watch: 50,      // m³/s - monitoring threshold
                warning: 100,   // m³/s - preparation threshold
                emergency: 200  // m³/s - emergency response
            }
        };
        
        // Municipal emergency responses
        this.emergencyProtocols = {
            earthquake: {
                minor: {
                    level: 'advisory',
                    title: 'INFORMARE SEISMICĂ',
                    recommendations: [
                        'Rămâneți calmi și verificați dacă există avarii',
                        'Verificați integritatea locuinței',
                        'Urmăriți comunicatele oficiale',
                        'Pregătiți-vă pentru posibile replici'
                    ]
                },
                moderate: {
                    level: 'warning',
                    title: 'ALERTĂ SEISMICĂ',
                    recommendations: [
                        'Evacuați clădirea dacă observați fisuri',
                        'Verificați conductele de gaz și apă',
                        'Aveți pregătită trusa de urgență',
                        'Contactați autoritățile dacă sunt pagube',
                        'Rămâneți în zone sigure, departe de geamuri'
                    ]
                },
                major: {
                    level: 'critical',
                    title: 'SITUAȚIE DE URGENȚĂ SEISMICĂ',
                    recommendations: [
                        'EVACUAȚI CLĂDIREA IMEDIAT',
                        'Adăpostiți-vă în spații deschise',
                        'Apelați 112 pentru urgențe',
                        'Nu folosiți ascensorul',
                        'Aveți grijă de copii și persoane în vârstă',
                        'Urmăriți instrucțiunile autorităților'
                    ]
                }
            },
            airQuality: {
                moderate: {
                    level: 'advisory',
                    title: 'ATENȚIE - CALITATEA AERULUI',
                    recommendations: [
                        'Limitați activitățile fizice în exterior',
                        'Persoanele sensibile să rămână în interior',
                        'Închideți ferestrele în timpul zilei',
                        'Folosiți purificatoare de aer dacă aveți'
                    ]
                },
                unhealthy: {
                    level: 'warning',
                    title: 'AVERTIZARE CALITATE AER',
                    recommendations: [
                        'Evitați ieșirile neesențiale',
                        'Purtați mască de protecție în exterior',
                        'Copiii și vârstnicii să rămână în interior',
                        'Contactați medicul dacă aveți probleme respiratorii',
                        'Évitați zonele cu trafic intens'
                    ]
                },
                dangerous: {
                    level: 'critical',
                    title: 'ALERTĂ POLUARE SEVERĂ',
                    recommendations: [
                        'RĂMÂNEȚI ÎN INTERIOR OBLIGATORIU',
                        'Sigilați ferestrele și ușile',
                        'Folosiți purificatoare de aer',
                        'Apelați medicul la primele simptome',
                        'Nu faceți exerciții fizice',
                        'Beți multă apă pentru hidratare'
                    ]
                }
            },
            flood: {
                watch: {
                    level: 'advisory',
                    title: 'MONITORIZARE HIDRROLOGICĂ',
                    recommendations: [
                        'Urmăriți nivelul apelor din zonă',
                        'Pregătiți documente importante',
                        'Identificați rutele de evacuare',
                        'Verificați asigurarea locuinței'
                    ]
                },
                warning: {
                    level: 'warning',
                    title: 'ATENȚIONARE INUNDAȚII',
                    recommendations: [
                        'Mutați obiectele de valoare la etaj',
                        'Pregătiți provizii pentru 72 de ore',
                        'Aveți pregătit un plan de evacuare',
                        'Evitați deplasările în zonele cu risc',
                        'Țineți vehiculul cu rezervorul plin'
                    ]
                },
                emergency: {
                    level: 'critical',
                    title: 'ALERTĂ INUNDAȚII',
                    recommendations: [
                        'EVACUAȚI IMEDIAT ZONA DACĂ ESTE NECESAR',
                        'Nu traversați apele curgătoare',
                        'Urcați-vă la etajele superioare',
                        'Apelați 112 pentru salvare',
                        'Semnalizați prezența voastră',
                        'Nu intrați în subsoluri inundate'
                    ]
                }
            }
        };
        
        this.lastUpdate = {
            earthquake: null,
            airQuality: null,
            flood: null
        };
        
        this.currentAlerts = new Set();
        this.updateInterval = 10 * 60 * 1000; // 10 minutes for emergency monitoring
        this.activeTimers = [];
        
        this.init();
    }
    
    async init() {
        console.log('🚨 Initializing Emergency Monitoring System for Slobozia');
        
        // Wait for weather system to be ready
        setTimeout(() => {
            // Initial data fetch
            this.fetchAllEmergencyData();
            
            // Setup periodic monitoring
            this.startEmergencyMonitoring();
            
            // Setup console interface for testing
            this.setupEmergencyTestInterface();
        }, 3000);
    }
    
    setupEmergencyTestInterface() {
        window.emergencyTest = {
            testEarthquake: (magnitude, distance) => this.testEarthquakeAlert(magnitude, distance),
            testAirQuality: (aqi) => this.testAirQualityAlert(aqi),
            testFlood: (discharge) => this.testFloodAlert(discharge),
            checkAll: () => this.fetchAllEmergencyData(),
            showAlerts: () => console.log('Active alerts:', Array.from(this.currentAlerts)),
            clearAlerts: () => this.clearAllAlerts()
        };
        
        console.log('🧪 Emergency testing commands available:');
        console.log('emergencyTest.testEarthquake(5.2, 45) - Test earthquake alert');
        console.log('emergencyTest.testAirQuality(180) - Test air quality alert');
        console.log('emergencyTest.testFlood(150) - Test flood alert');
        console.log('emergencyTest.checkAll() - Fetch all emergency data');
    }
    
    async fetchAllEmergencyData() {
        console.log('🔍 Fetching emergency data for Slobozia...');
        
        try {
            // Fetch all emergency data in parallel
            const [earthquakeData, airQualityData, floodData] = await Promise.allSettled([
                this.fetchEarthquakeData(),
                this.fetchAirQualityData(),
                this.fetchFloodData()
            ]);
            
            // Process results
            if (earthquakeData.status === 'fulfilled') {
                this.processEarthquakeData(earthquakeData.value);
            } else {
                console.warn('❌ Earthquake data fetch failed:', earthquakeData.reason);
            }
            
            if (airQualityData.status === 'fulfilled') {
                this.processAirQualityData(airQualityData.value);
            } else {
                console.warn('❌ Air quality data fetch failed:', airQualityData.reason);
            }
            
            if (floodData.status === 'fulfilled') {
                this.processFloodData(floodData.value);
            } else {
                console.warn('❌ Flood data fetch failed:', floodData.reason);
            }
            
            console.log('✅ Emergency monitoring update completed');
            
        } catch (error) {
            console.error('❌ Emergency monitoring system error:', error);
        }
    }
    
    async fetchEarthquakeData() {
        const params = new URLSearchParams({
            format: 'geojson',
            starttime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 24 hours
            latitude: this.coordinates.latitude,
            longitude: this.coordinates.longitude,
            maxradiuskm: this.emergencyThresholds.earthquake.radius,
            minmagnitude: this.emergencyThresholds.earthquake.minor,
            orderby: 'time'
        });
        
        const url = `${this.apis.earthquake.url}?${params}`;
        console.log('🌍 Fetching earthquake data:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Politia-Locala-Slobozia-Emergency/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`USGS API error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    async fetchAirQualityData() {
        const params = new URLSearchParams({
            latitude: this.coordinates.latitude.toString(),
            longitude: this.coordinates.longitude.toString(),
            hourly: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
            timezone: 'Europe/Bucharest'
        });
        
        const url = `${this.apis.airQuality.url}?${params}`;
        console.log('🌬️ Fetching air quality data:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`Open-Meteo Air Quality API error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    async fetchFloodData() {
        const params = new URLSearchParams({
            latitude: this.coordinates.latitude.toString(),
            longitude: this.coordinates.longitude.toString(),
            daily: 'river_discharge',
            timezone: 'Europe/Bucharest'
        });
        
        const url = `${this.apis.flood.url}?${params}`;
        console.log('🌊 Fetching flood data:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`Open-Meteo Flood API error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    processEarthquakeData(data) {
        if (!data.features || data.features.length === 0) {
            console.log('🟢 No significant earthquakes in the last 24 hours');
            this.clearAlert('earthquake');
            return;
        }
        
        // Find the most significant earthquake
        const significantEarthquake = data.features.reduce((max, current) => {
            return current.properties.mag > max.properties.mag ? current : max;
        });
        
        const magnitude = significantEarthquake.properties.mag;
        const distance = this.calculateDistance(
            this.coordinates.latitude,
            this.coordinates.longitude,
            significantEarthquake.geometry.coordinates[1], // lat
            significantEarthquake.geometry.coordinates[0]  // lon
        );
        
        console.log(`🌍 Earthquake detected: M${magnitude} at ${distance.toFixed(1)}km from Slobozia`);
        
        this.evaluateEarthquakeAlert(magnitude, distance, significantEarthquake.properties);
    }
    
    processAirQualityData(data) {
        if (!data.hourly) {
            console.warn('⚠️ Invalid air quality data structure');
            return;
        }
        
        // Get current hour index (most recent data)
        const currentIndex = 0;
        const airData = {
            pm25: data.hourly.pm2_5?.[currentIndex] || 0,
            pm10: data.hourly.pm10?.[currentIndex] || 0,
            co: data.hourly.carbon_monoxide?.[currentIndex] || 0,
            no2: data.hourly.nitrogen_dioxide?.[currentIndex] || 0,
            so2: data.hourly.sulphur_dioxide?.[currentIndex] || 0,
            o3: data.hourly.ozone?.[currentIndex] || 0
        };
        
        // Calculate simplified AQI based on PM2.5 (most health-relevant)
        const aqi = this.calculateSimpleAQI(airData.pm25);
        
        console.log(`🌬️ Air Quality: PM2.5=${airData.pm25}µg/m³, AQI≈${aqi}`);
        
        this.evaluateAirQualityAlert(aqi, airData);
    }
    
    processFloodData(data) {
        if (!data.daily || !data.daily.river_discharge) {
            console.warn('⚠️ No flood data available for this location');
            return;
        }
        
        // Get most recent discharge data
        const discharge = data.daily.river_discharge[0] || 0;
        
        console.log(`🌊 River discharge: ${discharge} m³/s`);
        
        this.evaluateFloodAlert(discharge);
    }
    
    evaluateEarthquakeAlert(magnitude, distance, properties) {
        let alertLevel = null;
        
        if (magnitude >= this.emergencyThresholds.earthquake.major) {
            alertLevel = 'major';
        } else if (magnitude >= this.emergencyThresholds.earthquake.moderate) {
            alertLevel = 'moderate';
        } else if (magnitude >= this.emergencyThresholds.earthquake.minor) {
            alertLevel = 'minor';
        }
        
        if (alertLevel) {
            const protocol = this.emergencyProtocols.earthquake[alertLevel];
            this.triggerEmergencyAlert('earthquake', {
                ...protocol,
                data: {
                    magnitude: magnitude,
                    distance: distance.toFixed(1),
                    location: properties.place,
                    time: new Date(properties.time).toLocaleString('ro-RO')
                }
            });
        } else {
            this.clearAlert('earthquake');
        }
    }
    
    evaluateAirQualityAlert(aqi, airData) {
        let alertLevel = null;
        
        if (aqi >= this.emergencyThresholds.airQuality.dangerous) {
            alertLevel = 'dangerous';
        } else if (aqi >= this.emergencyThresholds.airQuality.unhealthy) {
            alertLevel = 'unhealthy';
        } else if (aqi >= this.emergencyThresholds.airQuality.moderate) {
            alertLevel = 'moderate';
        }
        
        if (alertLevel) {
            const protocol = this.emergencyProtocols.airQuality[alertLevel];
            this.triggerEmergencyAlert('airQuality', {
                ...protocol,
                data: {
                    aqi: aqi,
                    pm25: airData.pm25?.toFixed(1) || 'N/A',
                    pm10: airData.pm10?.toFixed(1) || 'N/A',
                    recommendation: this.getAirQualityRecommendation(aqi)
                }
            });
        } else {
            this.clearAlert('airQuality');
        }
    }
    
    evaluateFloodAlert(discharge) {
        let alertLevel = null;
        
        if (discharge >= this.emergencyThresholds.flood.emergency) {
            alertLevel = 'emergency';
        } else if (discharge >= this.emergencyThresholds.flood.warning) {
            alertLevel = 'warning';
        } else if (discharge >= this.emergencyThresholds.flood.watch) {
            alertLevel = 'watch';
        }
        
        if (alertLevel) {
            const protocol = this.emergencyProtocols.flood[alertLevel];
            this.triggerEmergencyAlert('flood', {
                ...protocol,
                data: {
                    discharge: discharge.toFixed(1),
                    risk: this.getFloodRiskLevel(discharge),
                    trend: 'monitoring'
                }
            });
        } else {
            this.clearAlert('flood');
        }
    }
    
    triggerEmergencyAlert(type, protocol) {
        const alertId = `${type}_${protocol.level}`;
        
        if (this.currentAlerts.has(alertId)) {
            console.log(`🔄 Updating existing ${type} alert`);
        } else {
            console.log(`🚨 NEW EMERGENCY ALERT: ${type} - ${protocol.level}`);
            this.currentAlerts.add(alertId);
        }
        
        // Integrate with existing weather system
        if (window.municipalWeatherSystem && window.municipalWeatherSystem.displayEmergencyAlert) {
            window.municipalWeatherSystem.displayEmergencyAlert(type, protocol);
        } else {
            // Standalone alert display
            this.displayEmergencyAlert(type, protocol);
        }
        
        // Log for municipal records
        this.logEmergencyEvent(type, protocol);
    }
    
    displayEmergencyAlert(type, protocol) {
        console.log('🚨 EMERGENCY ALERT SYSTEM');
        console.log(`Type: ${type.toUpperCase()}`);
        console.log(`Level: ${protocol.level.toUpperCase()}`);
        console.log(`Title: ${protocol.title}`);
        console.log('Actions Required:');
        protocol.recommendations.forEach((action, index) => {
            console.log(`  ${index + 1}. ${action}`);
        });
        
        if (protocol.data) {
            console.log('Data:', protocol.data);
        }
    }
    
    logEmergencyEvent(type, protocol) {
        const event = {
            timestamp: new Date().toISOString(),
            location: 'Slobozia, Ialomița',
            type: type,
            level: protocol.level,
            title: protocol.title,
            data: protocol.data || {},
            actions: protocol.recommendations
        };
        
        // In a real implementation, this would be sent to municipal systems
        console.log('📋 MUNICIPAL LOG ENTRY:', JSON.stringify(event, null, 2));
    }
    
    clearAlert(type) {
        const alertsToRemove = Array.from(this.currentAlerts).filter(alert => alert.startsWith(type));
        alertsToRemove.forEach(alert => this.currentAlerts.delete(alert));
        
        if (alertsToRemove.length > 0) {
            console.log(`✅ Cleared ${type} alerts:`, alertsToRemove);
        }
    }
    
    clearAllAlerts() {
        this.currentAlerts.clear();
        console.log('✅ All emergency alerts cleared');
    }
    
    // Utility methods
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    calculateSimpleAQI(pm25) {
        // Simplified AQI calculation based on PM2.5
        if (pm25 <= 12) return 50;
        if (pm25 <= 35.4) return 100;
        if (pm25 <= 55.4) return 150;
        if (pm25 <= 150.4) return 200;
        if (pm25 <= 250.4) return 300;
        return 400;
    }
    
    getAirQualityRecommendation(aqi) {
        if (aqi <= 50) return 'Calitate bună - activități normale';
        if (aqi <= 100) return 'Moderată - persoane sensibile să limiteze efortul';
        if (aqi <= 150) return 'Nesănătoasă pentru grupuri sensibile';
        if (aqi <= 200) return 'Nesănătoasă - limitați activitățile în exterior';
        if (aqi <= 300) return 'Foarte nesănătoasă - evitați activitățile în exterior';
        return 'Periculoasă - rămâneți în interior';
    }
    
    getFloodRiskLevel(discharge) {
        if (discharge < 50) return 'Normal';
        if (discharge < 100) return 'Monitorizare';
        if (discharge < 200) return 'Atenționare';
        return 'Pericol';
    }
    
    startEmergencyMonitoring() {
        // Main monitoring loop
        const timer = setInterval(() => {
            this.fetchAllEmergencyData();
        }, this.updateInterval);
        
        this.activeTimers.push(timer);
        console.log(`🔄 Emergency monitoring started (${this.updateInterval/1000/60} min intervals)`);
    }
    
    // Testing methods
    testEarthquakeAlert(magnitude, distance) {
        console.log(`🧪 Testing earthquake alert: M${magnitude} at ${distance}km`);
        this.evaluateEarthquakeAlert(magnitude, distance, {
            place: 'Test earthquake near Slobozia',
            time: Date.now()
        });
    }
    
    testAirQualityAlert(aqi) {
        console.log(`🧪 Testing air quality alert: AQI ${aqi}`);
        this.evaluateAirQualityAlert(aqi, {
            pm25: aqi * 0.5,
            pm10: aqi * 0.8,
            co: 100,
            no2: 20,
            so2: 10,
            o3: 80
        });
    }
    
    testFloodAlert(discharge) {
        console.log(`🧪 Testing flood alert: ${discharge} m³/s`);
        this.evaluateFloodAlert(discharge);
    }
    
    destroy() {
        this.activeTimers.forEach(timer => clearInterval(timer));
        this.activeTimers = [];
        this.clearAllAlerts();
        delete window.emergencyTest;
        console.log('🚨 Emergency monitoring system deactivated');
    }
}

// Initialize Municipal Weather Warning System
window.WeatherAlertSystem = WeatherAlertSystem;

// Auto-initialize if document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WeatherAlertSystem();
    });
} else {
    new WeatherAlertSystem();
}

// Initialize Emergency Monitoring System after weather system is ready
setTimeout(() => {
    window.emergencySystem = new EmergencyMonitoringSystem();
    console.log('🚨 Emergency monitoring system started for Slobozia');
}, 5000); // Wait 5 seconds to ensure weather system is fully loaded

console.log('🏛️ Municipal Weather Warning System loaded for Poliția Locală Slobozia');
console.log('📋 Use weatherTest.* commands for municipal testing');
console.log('🚨 Use emergencyTest.* commands for emergency system testing');
