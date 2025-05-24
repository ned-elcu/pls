// WEATHER-ALERT.JS - Municipal Weather Warning System for Poliția Locală Slobozia
// Production Version with Emergency-First Design (Earthquakes + Air Quality)
// Professional weather monitoring and safety advisory system

class WeatherAlertSystem {
    constructor() {
        // Prevent multiple instances
        if (window.municipalWeatherSystemInitialized) {
            console.warn('⚠️ Weather system already initialized');
            return window.municipalWeatherSystem;
        }
        
        window.municipalWeatherSystemInitialized = true;
        
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
        this.emergencyAlertActive = false;
        this.lockExpansion = false;
        
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
            expand: () => {
                this.isExpanded = true;
                this.updateExpandedState();
                if (this.emergencyAlertActive) this.showEmergencyDetails();
                else this.showSafetyRecommendations();
            },
            minimize: () => {
                this.isExpanded = false;
                this.updateExpandedState();
                if (this.emergencyAlertActive) this.hideEmergencyDetails();
                else this.hideSafetyRecommendations();
            },
            toggle: () => this.toggleExpanded(),
            destroy: () => this.destroy(),
            debug: () => {
                console.log('🔍 Weather System Debug Info:');
                console.log('Weather containers found:', document.querySelectorAll('.weather-alert-floating').length);
                console.log('Municipal system instance:', !!window.municipalWeatherSystem);
                console.log('Emergency system instance:', !!window.emergencySystem);
                console.log('Weather initialized flag:', !!window.municipalWeatherSystemInitialized);
                console.log('Emergency initialized flag:', !!window.emergencySystemInitialized);
                console.log('Is expanded:', this.isExpanded);
                console.log('Emergency active:', this.emergencyAlertActive);
                console.log('Current alert level:', this.currentAlertLevel);
            }
        };
        
        console.log('🏛️ Municipal Weather System - Testing Commands:');
        console.log('weatherTest.cycleWeather() - Test all weather conditions');
        console.log('weatherTest.setWeather(code) - Set specific weather (0-99)');
        console.log('weatherTest.testAlert("extreme_heat") - Test alert types');
        console.log('weatherTest.toggle() - Toggle minimize/maximize');
        console.log('weatherTest.expand() - Expand widget');
        console.log('weatherTest.minimize() - Minimize widget');
        console.log('weatherTest.debug() - Show debug information');
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
        this.createWeatherContainer();
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
        console.log(`🚨 EMERGENCY ALERT: ${type} - ${protocol.level}`);
        
        // Activate emergency mode
        this.emergencyAlertActive = true;
        
        // Create enhanced emergency alert with proper data structure
        const emergencyAlert = {
            level: 'emergency_' + protocol.level,
            title: protocol.title,
            recommendations: protocol.actions || protocol.recommendations || [],
            emergency: true,
            emergencyType: type,
            emergencyData: protocol.data || {},
            activities: protocol.activities || null
        };
        
        this.displaySafetyAlert(emergencyAlert);
        
        // Force expansion for all emergency alerts
        setTimeout(() => {
            this.isExpanded = true;
            this.updateExpandedState();
            this.showSafetyRecommendations();
        }, 300);
        
        // Keep emergency alert expanded
        this.lockExpansion = true;
        
        // Add emergency sound notification (optional)
        this.playEmergencySound(protocol.level);
    }
    
    // Play emergency sound notification
    playEmergencySound(level) {
        try {
            // Create audio context for emergency notification
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different sounds for different emergency levels
            switch(level) {
                case 'critical':
                    // High urgency - rapid beeps
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    oscillator.start();
                    setTimeout(() => oscillator.stop(), 200);
                    setTimeout(() => this.playEmergencySound(level), 300);
                    break;
                case 'warning':
                    // Medium urgency - single beep
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    oscillator.start();
                    setTimeout(() => oscillator.stop(), 500);
                    break;
                default:
                    // Low urgency - soft tone
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                    oscillator.start();
                    setTimeout(() => oscillator.stop(), 300);
            }
        } catch (error) {
            // Audio not supported or blocked
            console.log('Audio notification not available');
        }
    }
    
    // Clear emergency alert state
    clearEmergencyAlert() {
        this.emergencyAlertActive = false;
        this.lockExpansion = false;
        
        // Return to normal weather display
        if (this.currentWeatherData) {
            this.checkMunicipalAlerts(this.currentWeatherData);
        } else {
            this.clearAlert();
        }
    }
    
    // Inject municipal-appropriate CSS with emergency styling
    injectMunicipalCSS() {
        if (document.getElementById('municipal-weather-css')) return;
        
        const css = `
        /* Municipal Weather Warning System - Emergency-First Layout */
        .weather-alert-floating {
            position: fixed;
            bottom: 50px;
            right: 20px;
            width: 280px;
            min-height: 70px;
            background: rgba(26, 47, 95, 0.7);
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
            z-index: 1000;
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
        
        /* EMERGENCY ALERT STYLING - COMPACT LAYOUT */
        .weather-alert-floating.emergency_advisory,
        .weather-alert-floating.emergency_warning,
        .weather-alert-floating.emergency_critical {
            display: grid;
            grid-template-columns: 2fr 1fr;
            grid-template-areas: 
                "emergency-content weather-summary"
                "emergency-actions weather-summary"
                "emergency-contact emergency-contact";
            gap: 8px;
            padding: 12px;
            min-height: 140px;
            width: 350px;
            position: relative;
        }
        
        /* Emergency Minimized State */
        .weather-alert-floating.emergency_advisory.minimized,
        .weather-alert-floating.emergency_warning.minimized,
        .weather-alert-floating.emergency_critical.minimized {
            min-height: 60px;
            width: 280px;
            grid-template-columns: 1fr auto;
            grid-template-areas: "emergency-header expand-btn";
        }
        
        .weather-alert-floating.emergency_advisory.minimized .emergency-actions,
        .weather-alert-floating.emergency_warning.minimized .emergency-actions,
        .weather-alert-floating.emergency_critical.minimized .emergency-actions,
        .weather-alert-floating.emergency_advisory.minimized .weather-summary,
        .weather-alert-floating.emergency_warning.minimized .weather-summary,
        .weather-alert-floating.emergency_critical.minimized .weather-summary,
        .weather-alert-floating.emergency_advisory.minimized .emergency-contact-full,
        .weather-alert-floating.emergency_warning.minimized .emergency-contact-full,
        .weather-alert-floating.emergency_critical.minimized .emergency-contact-full {
            display: none;
        }
        
        .weather-alert-floating.emergency_advisory {
            border: 3px solid #ff9800;
            background: rgba(255, 152, 0, 0.95);
            color: #000;
            animation: emergencyGlow 2s infinite;
            box-shadow: 
                0 0 30px rgba(255, 152, 0, 0.8),
                0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .weather-alert-floating.emergency_warning {
            border: 3px solid #f44336;
            background: rgba(244, 67, 54, 0.95);
            color: #fff;
            animation: emergencyFlash 1.5s infinite;
            box-shadow: 
                0 0 40px rgba(244, 67, 54, 0.9),
                0 4px 25px rgba(0, 0, 0, 0.4);
        }
        
        .weather-alert-floating.emergency_critical {
            border: 3px solid #d32f2f;
            background: rgba(211, 47, 47, 0.98);
            color: #fff;
            animation: emergencyCritical 1s infinite;
            box-shadow: 
                0 0 50px rgba(211, 47, 47, 1),
                0 0 100px rgba(211, 47, 47, 0.5),
                0 4px 30px rgba(0, 0, 0, 0.5);
            z-index: 2000;
        }
        
        .weather-alert-floating.expanded {
            min-height: 140px;
            width: 340px;
        }
        
        /* Regular Weather Minimized State */
        .weather-alert-floating.minimized {
            min-height: 60px;
            width: 280px;
        }
        
        .weather-alert-floating.minimized .safety-recommendations,
        .weather-alert-floating.minimized .emergency-contact,
        .weather-alert-floating.minimized .alert-header {
            display: none !important;
        }
        
        .weather-alert-floating.emergency_advisory.expanded,
        .weather-alert-floating.emergency_warning.expanded,
        .weather-alert-floating.emergency_critical.expanded {
            min-height: 160px;
            width: 380px;
        }
        
        /* Emergency Content Areas */
        .emergency-content {
            grid-area: emergency-content;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .weather-summary {
            grid-area: weather-summary;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            text-align: center;
            padding: 8px 6px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
            font-size: 11px;
            min-height: 80px;
        }
        
        .emergency-actions {
            grid-area: emergency-actions;
            margin-top: 8px;
        }
        
        .emergency-contact-full {
            grid-area: emergency-contact;
            margin-top: 12px;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            text-align: center;
        }
        
        /* Emergency Header - COMPACT */
        .emergency-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .emergency-icon {
            font-size: 22px;
            animation: emergencyPulse 2s infinite ease-in-out;
            flex-shrink: 0;
            font-family: 'Material Icons';
        }
        
        .emergency-title {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            line-height: 1.1;
            flex: 1;
        }
        
        /* Emergency Details Grid - COMPACT */
        .emergency-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            gap: 6px;
            margin-bottom: 6px;
        }
        
        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }
        
        .detail-label {
            font-size: 9px;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            font-weight: 500;
        }
        
        .detail-value {
            font-size: 12px;
            font-weight: 600;
            line-height: 1.1;
        }
        
        /* Activity Recommendations - COMPACT */
        .activity-recommendations {
            margin-top: 6px;
            padding: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .activity-title {
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 4px;
            opacity: 0.9;
        }
        
        .activity-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 3px;
        }
        
        .activity-item {
            display: flex;
            align-items: center;
            text-align: left;
            padding: 3px 4px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 3px;
            border-left: 2px solid;
            min-height: 24px;
            font-size: 8px;
        }
        
        .activity-icon-wrapper {
            position: relative;
            margin-right: 4px;
            flex-shrink: 0;
        }
        
        .activity-icon {
            font-size: 12px;
            font-family: 'Material Icons';
        }
        
        .activity-status {
            position: absolute;
            top: -2px;
            right: -4px;
            font-size: 8px;
            font-family: 'Material Icons';
            background: rgba(0, 0, 0, 0.7);
            border-radius: 50%;
            padding: 1px;
            line-height: 1;
        }
        
        .activity-label {
            font-size: 8px;
            font-weight: 500;
            line-height: 1.1;
            flex: 1;
        }
        
        /* Emergency Activity Colors for Different Alert Levels */
        .weather-alert-floating.emergency_advisory .activity-recommendations {
            background: rgba(0, 0, 0, 0.1);
            border-color: rgba(0, 0, 0, 0.2);
        }
        
        .weather-alert-floating.emergency_advisory .activity-title,
        .weather-alert-floating.emergency_advisory .activity-label {
            color: #000;
        }
        
        .weather-alert-floating.emergency_advisory .activity-icon {
            color: #333;
        }
        
        .weather-alert-floating.emergency_advisory .activity-item {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .weather-alert-floating.emergency_warning .activity-recommendations,
        .weather-alert-floating.emergency_critical .activity-recommendations {
            background: rgba(0, 0, 0, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
        }
        
        .weather-alert-floating.emergency_warning .activity-icon,
        .weather-alert-floating.emergency_critical .activity-icon {
            color: #fff;
        }
        
        /* Weather Summary in Emergency Mode - COMPACT */
        .weather-summary .temp-display {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 2px;
        }
        
        .weather-summary .condition-text {
            font-size: 10px;
            opacity: 0.9;
            margin-bottom: 4px;
        }
        
        .weather-summary .location-text {
            font-size: 9px;
            opacity: 0.7;
        }
        
        .weather-summary .weather-icon-small {
            font-size: 16px;
            margin-bottom: 4px;
            font-family: 'Material Icons';
        }
        
        /* Regular Weather Layout */
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
            font-family: 'Material Icons';
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
        
        /* Emergency list styling */
        .weather-alert-floating.emergency_advisory .safety-list li {
            color: #000;
            font-weight: 500;
        }
        
        .weather-alert-floating.emergency_advisory .safety-list li:before {
            color: #f57c00;
        }
        
        .weather-alert-floating.emergency_warning .safety-list li,
        .weather-alert-floating.emergency_critical .safety-list li {
            color: #fff;
            font-weight: 600;
            font-size: 13px;
        }
        
        .weather-alert-floating.emergency_warning .safety-list li:before,
        .weather-alert-floating.emergency_critical .safety-list li:before {
            color: #ffeb3b;
            font-size: 16px;
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
            font-family: 'Material Icons';
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
        
        /* Emergency Animation Keyframes */
        @keyframes emergencyGlow {
            0%, 100% { 
                box-shadow: 
                    0 0 30px rgba(255, 152, 0, 0.8),
                    0 4px 20px rgba(0, 0, 0, 0.3);
            }
            50% { 
                box-shadow: 
                    0 0 50px rgba(255, 152, 0, 1),
                    0 4px 20px rgba(0, 0, 0, 0.3);
            }
        }
        
        @keyframes emergencyFlash {
            0%, 100% { 
                background: rgba(244, 67, 54, 0.95);
                box-shadow: 
                    0 0 40px rgba(244, 67, 54, 0.9),
                    0 4px 25px rgba(0, 0, 0, 0.4);
            }
            50% { 
                background: rgba(244, 67, 54, 1);
                box-shadow: 
                    0 0 60px rgba(244, 67, 54, 1),
                    0 4px 25px rgba(0, 0, 0, 0.4);
            }
        }
        
        @keyframes emergencyCritical {
            0%, 100% { 
                background: rgba(211, 47, 47, 0.98);
                transform: scale(1);
                box-shadow: 
                    0 0 50px rgba(211, 47, 47, 1),
                    0 0 100px rgba(211, 47, 47, 0.5),
                    0 4px 30px rgba(0, 0, 0, 0.5);
            }
            25% { 
                background: rgba(255, 255, 255, 0.95);
                transform: scale(1.02);
            }
            50% { 
                background: rgba(211, 47, 47, 1);
                transform: scale(1.01);
                box-shadow: 
                    0 0 80px rgba(211, 47, 47, 1),
                    0 0 150px rgba(211, 47, 47, 0.8),
                    0 4px 40px rgba(0, 0, 0, 0.6);
            }
            75% { 
                background: rgba(255, 255, 255, 0.95);
                transform: scale(1.02);
            }
        }
        
        @keyframes emergencyPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        /* Regular Weather Icon Animations */
        .weather-icon.sunny {
            color: #ffeb3b;
            animation: gentleRotate 30s linear infinite;
        }
        
        .weather-icon.partly-cloudy, .weather-icon.foggy {
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
        
        .weather-icon.drizzle {
            color: #64b5f6;
            animation: drizzleFloat 3s ease-in-out infinite;
        }
        
        /* Regular Animation Keyframes */
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
        
        @keyframes drizzleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-1px); }
        }
        
        /* Responsive Design */
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
            
            .weather-alert-floating.emergency_advisory,
            .weather-alert-floating.emergency_warning,
            .weather-alert-floating.emergency_critical {
                width: 320px;
                max-width: 95vw;
                grid-template-columns: 1fr;
                grid-template-areas:
                    "emergency-content"
                    "weather-summary"
                    "emergency-actions"
                    "emergency-contact";
            }
            
            .weather-summary {
                padding: 8px;
                min-height: auto;
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
            
            /* Mobile Activity Grid */
            .activity-grid {
                grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
                gap: 4px;
            }
            
            .activity-item {
                padding: 4px 2px;
                min-height: 40px;
            }
            
            .activity-icon {
                font-size: 14px;
            }
            
            .activity-status {
                font-size: 10px;
                top: -1px;
                right: -4px;
            }
            
            .activity-label {
                font-size: 8px;
            }
        }
        
        /* Accessibility */
        @media (prefers-contrast: high) {
            .weather-alert-floating {
                border: 2px solid white;
                background: rgba(0, 0, 0, 0.9);
            }
        }
        
        @media (prefers-reduced-motion: reduce) {
            .weather-alert-floating,
            .weather-icon,
            .emergency-icon {
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
    
    // Create municipal weather container with emergency layout support
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
                        <i class="material-icons" style="font-size: 12px; vertical-align: middle;">phone</i> Urgențe: 112 | Poliția Locală: (0243) 955
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
    
    // Create emergency layout
    createEmergencyLayout(emergencyData) {
        // Add error handling for undefined data
        if (!emergencyData) {
            console.error('❌ Emergency data is undefined');
            return this.createErrorLayout();
        }
        
        const { emergencyType, level, title, data, activities } = emergencyData;
        
        if (!emergencyType || !level || !title) {
            console.error('❌ Missing required emergency data fields');
            return this.createErrorLayout();
        }
        
        let emergencyIcon = 'warning';
        let detailsHTML = '';
        let activitiesHTML = '';
        
        // Determine icon and details based on emergency type
        if (emergencyType === 'earthquake') {
            emergencyIcon = 'warning';
            if (data) {
                detailsHTML = `
                    <div class="emergency-details">
                        <div class="detail-item">
                            <div class="detail-label">Magnitudine</div>
                            <div class="detail-value">M${data.magnitude || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Distanță</div>
                            <div class="detail-value">${data.distance || 'N/A'} km</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Locația</div>
                            <div class="detail-value">${data.location || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Ora</div>
                            <div class="detail-value">${data.time || 'N/A'}</div>
                        </div>
                    </div>
                `;
            }
        } else if (emergencyType === 'airQuality') {
            emergencyIcon = 'masks';
            if (data) {
                detailsHTML = `
                    <div class="emergency-details">
                        <div class="detail-item">
                            <div class="detail-label">AQI</div>
                            <div class="detail-value">${data.aqi || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">PM2.5</div>
                            <div class="detail-value">${data.pm25 || 'N/A'} μg/m³</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">PM10</div>
                            <div class="detail-value">${data.pm10 || 'N/A'} μg/m³</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Nivel</div>
                            <div class="detail-value">${data.aqi ? this.getAQILevel(data.aqi) : 'N/A'}</div>
                        </div>
                    </div>
                `;
            }
            
            // Add activity recommendations for air quality
            if (activities) {
                activitiesHTML = this.createActivityRecommendations(activities);
            }
        }
        
        // Get current weather for summary
        const weatherSummary = this.createWeatherSummary();
        
        return `
            <div class="emergency-content">
                <div class="emergency-header">
                    <i class="material-icons emergency-icon">${emergencyIcon}</i>
                    <div class="emergency-title">${title}</div>
                </div>
                ${detailsHTML}
                ${activitiesHTML}
            </div>
            
            <div class="weather-summary">
                ${weatherSummary}
            </div>
            
            <div class="emergency-actions">
                <div class="safety-recommendations visible" role="region" aria-label="Recomandări de siguranță">
                    <ul class="safety-list"></ul>
                </div>
            </div>
            
            <div class="emergency-contact-full">
                <p class="emergency-text">
                    <i class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">phone</i>
                    Urgențe: 112 | Poliția Locală: (0243) 955
                </p>
            </div>
            
            <div class="expand-indicator" role="button" aria-label="Expandează/Minimizează informații" tabindex="0">
                <i class="material-icons">expand_more</i>
            </div>
            <div class="update-indicator"></div>
        `;
    }
    
    // Create error layout for missing data
    createErrorLayout() {
        return `
            <div class="emergency-content">
                <div class="emergency-header">
                    <i class="material-icons emergency-icon">error</i>
                    <div class="emergency-title">EROARE DATE URGENȚĂ</div>
                </div>
                <div class="emergency-details">
                    <div class="detail-item">
                        <div class="detail-label">Status</div>
                        <div class="detail-value">Date indisponibile</div>
                    </div>
                </div>
            </div>
            
            <div class="weather-summary">
                ${this.createWeatherSummary()}
            </div>
            
            <div class="emergency-contact-full">
                <p class="emergency-text">
                    <i class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">phone</i>
                    Urgențe: 112 | Poliția Locală: (0243) 955
                </p>
            </div>
            
            <div class="expand-indicator" role="button" aria-label="Expandează/Minimizează informații" tabindex="0">
                <i class="material-icons">expand_more</i>
            </div>
            <div class="update-indicator"></div>
        `;
    }
    
    // Create activity recommendations for air quality
    createActivityRecommendations(activities) {
        if (!activities || typeof activities !== 'object') return '';
        
        const activityIcons = {
            outdoor_sports: 'sports_soccer',
            bring_baby_out: 'child_friendly',
            eating_outside: 'restaurant',
            jogging: 'directions_run',
            cycling: 'directions_bike',
            windows_open: 'sensor_window'
        };
        
        const activityLabels = {
            outdoor_sports: 'Sport exterior',
            bring_baby_out: 'Copii afară',
            eating_outside: 'Mâncare afară',
            jogging: 'Alergare',
            cycling: 'Ciclism',
            windows_open: 'Ferestre deschise'
        };
        
        const statusColors = {
            ok: '#4caf50',      // Green
            limited: '#ff9800',  // Orange
            caution: '#ff5722',  // Red-orange
            no: '#f44336',       // Red
            danger: '#9c27b0'    // Purple
        };
        
        const statusIcons = {
            ok: 'check_circle',
            limited: 'warning',
            caution: 'error',
            no: 'cancel',
            danger: 'dangerous'
        };
        
        let activitiesHtml = '<div class="activity-recommendations"><div class="activity-title">Recomandări activități:</div><div class="activity-grid">';
        
        Object.entries(activities).forEach(([activity, status]) => {
            const icon = activityIcons[activity] || 'help';
            const label = activityLabels[activity] || activity;
            const color = statusColors[status] || '#666';
            const statusIcon = statusIcons[status] || 'help';
            
            activitiesHtml += `
                <div class="activity-item" style="border-left: 3px solid ${color};">
                    <div class="activity-icon-wrapper">
                        <i class="material-icons activity-icon">${icon}</i>
                        <i class="material-icons activity-status" style="color: ${color};">${statusIcon}</i>
                    </div>
                    <div class="activity-label">${label}</div>
                </div>
            `;
        });
        
        activitiesHtml += '</div></div>';
        return activitiesHtml;
    }
    
    // Create weather summary for emergency layout
    createWeatherSummary() {
        if (!this.currentWeatherData || !this.currentWeatherData.current) {
            return `
                <div class="weather-icon-small material-icons">wb_sunny</div>
                <div class="temp-display">--°C</div>
                <div class="condition-text">Se încarcă...</div>
                <div class="location-text">Slobozia</div>
            `;
        }
        
        const current = this.currentWeatherData.current;
        const weatherCode = parseInt(current.weather_code) || 0;
        const condition = this.weatherConditions[weatherCode] || {
            icon: 'help_outline',
            name: 'Necunoscut'
        };
        
        return `
            <div class="weather-icon-small material-icons">${condition.icon}</div>
            <div class="temp-display">${Math.round(current.temperature_2m)}°C</div>
            <div class="condition-text">${condition.name}</div>
            <div class="location-text">Slobozia</div>
        `;
    }
    
    // Get AQI level description
    getAQILevel(aqi) {
        if (aqi <= 50) return 'Bun';
        if (aqi <= 100) return 'Moderat';
        if (aqi <= 150) return 'Nesănătos';
        if (aqi <= 200) return 'Foarte Nesănătos';
        return 'Periculos';
    }
    
    // Setup municipal event listeners
    setupEventListeners() {
        // Main container click - only toggle if not clicking on expand indicator
        this.weatherContainer.addEventListener('click', (e) => {
            if (!e.target.closest('.expand-indicator') && !this.lockExpansion) {
                this.toggleExpanded();
            }
        });
        
        // Setup expand indicator events
        this.setupExpandIndicatorEvents();
        
        // Keyboard support
        this.weatherContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!this.lockExpansion) {
                    this.toggleExpanded();
                }
            } else if (e.key === 'Escape') {
                if (this.emergencyAlertActive) {
                    this.clearEmergencyAlert();
                } else {
                    this.isExpanded = false;
                    this.updateExpandedState();
                    this.hideSafetyRecommendations();
                }
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
    
    // Setup expand indicator events (used after innerHTML replacement and initial setup)
    setupExpandIndicatorEvents() {
        const expandIndicator = this.weatherContainer.querySelector('.expand-indicator');
        if (expandIndicator) {
            // Remove existing listeners first
            expandIndicator.replaceWith(expandIndicator.cloneNode(true));
            const newExpandIndicator = this.weatherContainer.querySelector('.expand-indicator');
            
            newExpandIndicator.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.lockExpansion) {
                    this.toggleExpanded();
                }
            });
            
            newExpandIndicator.addEventListener('keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !this.lockExpansion) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleExpanded();
                }
            });
        } else {
            console.warn('⚠️ Expand indicator not found - toggle functionality may not work');
        }
    }
    
    // Check footer overlap for municipal design
    checkFooterOverlap() {
        if (!this.weatherContainer) return;
        
        const footer = document.querySelector('footer');
        if (!footer) return;
        
        const weatherRect = this.weatherContainer.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        
        // Hide if footer is visible on screen (unless emergency alert)
        if (footerRect.top < window.innerHeight && footerRect.bottom > 0 && !this.emergencyAlertActive) {
            this.hideWeatherAlert();
        } else {
            this.showWeatherAlert();
        }
    }
    
    // Setup intersection observer
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.target.tagName === 'FOOTER' && entry.isIntersecting && !this.emergencyAlertActive) {
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
        if (this.weatherContainer && !this.isHidden && !this.emergencyAlertActive) {
            this.weatherContainer.classList.add('hidden');
            this.isHidden = true;
        }
    }
    
    // Enhanced toggle for municipal warnings - supports minimized/expanded states
    toggleExpanded() {
        if (this.lockExpansion) return;
        
        // Toggle between minimized and expanded
        this.isExpanded = !this.isExpanded;
        this.updateExpandedState();
        
        // Handle visibility of elements based on state and alert type
        if (this.emergencyAlertActive) {
            // Emergency alert toggle
            if (this.isExpanded) {
                this.showEmergencyDetails();
            } else {
                this.hideEmergencyDetails();
            }
        } else {
            // Regular weather alert toggle
            if (this.isExpanded && this.currentAlertLevel !== 'normal') {
                this.showSafetyRecommendations();
            } else {
                this.hideSafetyRecommendations();
            }
        }
        
        console.log(`🏛️ Municipal weather ${this.isExpanded ? 'expanded' : 'minimized'}`);
    }
    
    // Update expanded state with proper class management
    updateExpandedState() {
        if (this.weatherContainer) {
            // Remove both states first
            this.weatherContainer.classList.remove('expanded', 'minimized');
            
            // Add the correct state
            if (this.isExpanded) {
                this.weatherContainer.classList.add('expanded');
            } else {
                this.weatherContainer.classList.add('minimized');
            }
            
            // Update expand icon
            const expandIcon = this.weatherContainer.querySelector('.expand-indicator i');
            if (expandIcon) {
                expandIcon.textContent = this.isExpanded ? 'expand_less' : 'expand_more';
            }
        }
    }
    
    // Show emergency details (for expanded emergency alerts)
    showEmergencyDetails() {
        const weatherSummary = this.weatherContainer.querySelector('.weather-summary');
        const emergencyActions = this.weatherContainer.querySelector('.emergency-actions');
        const emergencyContact = this.weatherContainer.querySelector('.emergency-contact-full');
        
        if (weatherSummary) weatherSummary.style.display = 'flex';
        if (emergencyActions) emergencyActions.style.display = 'block';
        if (emergencyContact) emergencyContact.style.display = 'block';
    }
    
    // Hide emergency details (for minimized emergency alerts)
    hideEmergencyDetails() {
        const weatherSummary = this.weatherContainer.querySelector('.weather-summary');
        const emergencyActions = this.weatherContainer.querySelector('.emergency-actions');
        const emergencyContact = this.weatherContainer.querySelector('.emergency-contact-full');
        
        if (weatherSummary) weatherSummary.style.display = 'none';
        if (emergencyActions) emergencyActions.style.display = 'none';
        if (emergencyContact) emergencyContact.style.display = 'none';
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
            
            this.currentWeatherData = data;
            this.lastSuccessfulData = data;
            this.updateWeatherDisplay(data);
            
            // Only check weather alerts if no emergency alert is active
            if (!this.emergencyAlertActive) {
                this.checkMunicipalAlerts(data);
            }
            
            this.showUpdateIndicator();
            
            if (this.weatherContainer) {
                this.weatherContainer.classList.remove('error-state');
            }
            
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
        
        // Update icon with animation (only if not in emergency mode)
        const weatherIcon = this.weatherContainer.querySelector('.weather-icon');
        if (weatherIcon && !this.emergencyAlertActive) {
            weatherIcon.className = 'material-icons weather-icon';
            weatherIcon.textContent = condition.icon;
            
            setTimeout(() => {
                weatherIcon.classList.add(condition.animation);
            }, 100);
        }
        
        // Update weather summary in emergency layout if active
        if (this.emergencyAlertActive) {
            const weatherSummary = this.weatherContainer.querySelector('.weather-summary');
            if (weatherSummary) {
                weatherSummary.innerHTML = this.createWeatherSummary();
            }
        }
        
        // Update accessibility
        const now = new Date().toLocaleTimeString('ro-RO', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        this.weatherContainer.setAttribute('aria-label', 
            `Sistem municipal meteo Slobozia: ${condition.name}, ${Math.round(current.temperature_2m)}°C, actualizat ${now}`
        );
    }
    
    // Check municipal weather alerts
    checkMunicipalAlerts(data) {
        if (!data.current || this.emergencyAlertActive) return;
        
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
    
    // Display municipal safety alert (enhanced for emergency layout)
    displaySafetyAlert(alert) {
        if (!this.weatherContainer) return;
        
        this.currentAlertLevel = alert.level;
        
        // Check if this is an emergency alert
        if (alert.emergency) {
            // Prepare emergency data structure for layout creation
            const emergencyLayoutData = {
                emergencyType: alert.emergencyType,
                level: alert.level,
                title: alert.title,
                data: alert.emergencyData || {},
                activities: alert.activities
            };
            
            try {
                // Switch to emergency layout
                this.weatherContainer.innerHTML = this.createEmergencyLayout(emergencyLayoutData);
                
                // Update container class for emergency
                this.weatherContainer.className = `weather-alert-floating visible ${alert.level}`;
                
                // Start in minimized state for emergency alerts
                this.isExpanded = false;
                this.updateExpandedState();
                this.hideEmergencyDetails();
                
                // Re-setup all event listeners (since we replaced innerHTML)
                this.setupExpandIndicatorEvents();
                
                console.log('✅ Emergency layout created successfully');
            } catch (error) {
                console.error('❌ Error creating emergency layout:', error);
                // Fallback to regular alert display
                this.weatherContainer.className = `weather-alert-floating visible ${alert.level}`;
            }
        } else {
            // Regular alert layout
            this.weatherContainer.className = `weather-alert-floating visible ${alert.level}`;
            
            // Show alert header
            const alertHeader = this.weatherContainer.querySelector('.alert-header');
            const alertTitle = this.weatherContainer.querySelector('.alert-title');
            if (alertHeader && alertTitle) {
                alertTitle.textContent = alert.title;
                alertHeader.classList.add('visible');
            }
            
            // Start in minimized state for regular alerts too
            this.isExpanded = false;
            this.updateExpandedState();
        }
        
        // Prepare safety recommendations
        const safetyList = this.weatherContainer.querySelector('.safety-list');
        if (safetyList && alert.recommendations) {
            safetyList.innerHTML = '';
            alert.recommendations.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = rec;
                safetyList.appendChild(li);
            });
        }
        
        // Show emergency contact for critical alerts when expanded
        const emergencyContact = this.weatherContainer.querySelector('.emergency-contact, .emergency-contact-full');
        if (emergencyContact) {
            emergencyContact.classList.add('visible');
        }
    }
    
    // Setup expand indicator events (used after innerHTML replacement)
    setupExpandIndicatorEvents() {
        const expandIndicator = this.weatherContainer.querySelector('.expand-indicator');
        if (expandIndicator) {
            expandIndicator.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.lockExpansion) {
                    this.toggleExpanded();
                }
            });
            
            expandIndicator.addEventListener('keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !this.lockExpansion) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleExpanded();
                }
            });
        }
    }
    
    // Clear alert state
    clearAlert() {
        if (!this.weatherContainer) return;
        
        this.currentAlertLevel = 'normal';
        
        // Reset to normal layout if we were in emergency mode
        if (this.emergencyAlertActive) {
            // Remove the old container
            this.weatherContainer.remove();
            
            // Create new weather container
            this.createWeatherContainer();
            this.setupEventListeners();
            if (this.currentWeatherData) {
                this.updateWeatherDisplay(this.currentWeatherData);
            }
            // Start in minimized state
            this.isExpanded = false;
            this.updateExpandedState();
            this.makeVisible();
            return;
        }
        
        this.weatherContainer.className = 'weather-alert-floating visible';
        
        // Hide alert components
        const alertHeader = this.weatherContainer.querySelector('.alert-header');
        const safetyRecommendations = this.weatherContainer.querySelector('.safety-recommendations');
        const emergencyContact = this.weatherContainer.querySelector('.emergency-contact');
        
        if (alertHeader) alertHeader.classList.remove('visible');
        if (safetyRecommendations) safetyRecommendations.classList.remove('visible');
        if (emergencyContact) emergencyContact.classList.remove('visible');
        
        // Return to minimized state when clearing alerts
        this.isExpanded = false;
        this.updateExpandedState();
        
        // Reset weather icon to current weather
        if (this.currentWeatherData) {
            this.updateWeatherDisplay(this.currentWeatherData);
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
    
    // Make visible with default minimized state
    makeVisible() {
        if (this.weatherContainer) {
            setTimeout(() => {
                this.weatherContainer.classList.add('visible');
                // Start in minimized state by default
                this.isExpanded = false;
                this.updateExpandedState();
                console.log('🏛️ Municipal weather system activated (minimized)');
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
        delete window.municipalWeatherSystemInitialized;
        console.log('🏛️ Municipal weather system deactivated');
    }
}

// EMERGENCY MONITORING SYSTEM INTEGRATION
// Production Version - Earthquakes + Air Quality with OpenWeatherMap API

class EmergencyMonitoringSystem {
    constructor() {
        // Configuration
        this.coordinates = {
            latitude: 44.5667,  // Slobozia, Romania
            longitude: 27.3667
        };
        
        // API Configuration
        this.apis = {
            earthquake: {
                url: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
                name: 'USGS Earthquake API',
                keyRequired: false
            },
            airQuality: {
                url: 'https://api.openweathermap.org/data/2.5/air_pollution',
                name: 'OpenWeatherMap Air Pollution API',
                keyRequired: true,
                apiKey: 'e815f9edc2ed7da7912339b43ef2fec8' // Replace with your API key
            }
        };
        
        // Emergency thresholds
        this.emergencyThresholds = {
            earthquake: {
                minor: 3.0,
                moderate: 4.5,
                major: 6.0,
                radius: 100
            },
            airQuality: {
                good: 50,
                moderate: 100,
                unhealthy: 150,    // Emergency starts here (AQI 151+)
                dangerous: 300
            }
        };
        
        // Emergency response protocols
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
                    ],
                    activities: {
                        outdoor_sports: 'limited', // Limited outdoor sports
                        bring_baby_out: 'caution', // Caution with babies
                        eating_outside: 'ok', // OK to eat outside
                        jogging: 'limited', // Limited jogging
                        cycling: 'limited', // Limited cycling
                        windows_open: 'no' // Don't open windows
                    }
                },
                unhealthy: {
                    level: 'warning',
                    title: 'AVERTIZARE CALITATE AER',
                    recommendations: [
                        'Evitați ieșirile neesențiale',
                        'Purtați mască de protecție în exterior',
                        'Copiii și vârstnicii să rămână în interior',
                        'Contactați medicul dacă aveți probleme respiratorii',
                        'Evitați zonele cu trafic intens'
                    ],
                    activities: {
                        outdoor_sports: 'no', // No outdoor sports
                        bring_baby_out: 'no', // Don't bring babies out
                        eating_outside: 'no', // Don't eat outside
                        jogging: 'no', // No jogging
                        cycling: 'no', // No cycling
                        windows_open: 'no' // Keep windows closed
                    }
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
                    ],
                    activities: {
                        outdoor_sports: 'danger', // Dangerous for outdoor sports
                        bring_baby_out: 'danger', // Dangerous for babies
                        eating_outside: 'danger', // Dangerous to eat outside
                        jogging: 'danger', // Dangerous jogging
                        cycling: 'danger', // Dangerous cycling
                        windows_open: 'danger' // Dangerous to open windows
                    }
                }
            }
        };
        
        this.lastUpdate = {
            earthquake: null,
            airQuality: null
        };
        
        this.currentAlerts = new Set();
        this.updateInterval = 10 * 60 * 1000; // 10 minutes
        this.activeTimers = [];
        
        this.init();
    }
    
    async init() {
        // Ensure we don't initialize if already running
        if (window.emergencySystemInitialized) {
            console.log('⚠️ Emergency system already initialized');
            return;
        }
        
        window.emergencySystemInitialized = true;
        
        // Wait for weather system to be ready
        setTimeout(() => {
            // Check API configuration
            this.checkAPIConfiguration();
            
            // Initial data fetch
            this.fetchAllEmergencyData();
            
            // Setup periodic monitoring
            this.startEmergencyMonitoring();
            
            // Setup console interface for testing
            this.setupEmergencyTestInterface();
            
            console.log('✅ Emergency monitoring system activated');
        }, 3000);
    }
    
    checkAPIConfiguration() {
        console.log('🔍 Checking emergency API configuration...');
        
        // Check if OpenWeatherMap API key is configured
        if (this.apis.airQuality.apiKey === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
            console.log('⚠️ OpenWeatherMap API key not configured - air quality monitoring disabled');
            this.apis.airQuality.enabled = false;
        } else {
            this.apis.airQuality.enabled = true;
            console.log('✅ Air quality monitoring enabled');
        }
        
        console.log('✅ Earthquake monitoring enabled (no API key required)');
    }
    
    setupEmergencyTestInterface() {
        window.emergencyTest = {
            testEarthquake: (magnitude, distance) => this.testEarthquakeAlert(magnitude, distance),
            testAirQuality: (aqi) => this.testAirQualityAlert(aqi),
            testActivities: () => this.testActivityRecommendations(),
            checkAll: () => this.fetchAllEmergencyData(),
            showAlerts: () => console.log('Active alerts:', Array.from(this.currentAlerts)),
            clearAlerts: () => this.clearAllAlerts(),
            clearEmergency: () => {
                if (window.municipalWeatherSystem) {
                    window.municipalWeatherSystem.clearEmergencyAlert();
                }
            },
            debug: () => {
                console.log('🔍 Emergency System Debug Info:');
                console.log('Active alerts:', Array.from(this.currentAlerts));
                console.log('Weather system available:', !!window.municipalWeatherSystem);
                console.log('Emergency monitoring active:', this.activeTimers.length > 0);
                console.log('API configuration:', {
                    earthquake: 'enabled',
                    airQuality: this.apis.airQuality.enabled ? 'enabled' : 'disabled (no API key)'
                });
                console.log('Last updates:', this.lastUpdate);
            }
        };
        
        console.log('🧪 Emergency testing commands:');
        console.log('emergencyTest.testEarthquake(5.2, 45) - Test earthquake');
        console.log('emergencyTest.testAirQuality(180) - Test unhealthy air quality (151+ triggers emergency)');
        console.log('emergencyTest.testActivities() - Test all activity levels');
        console.log('emergencyTest.clearEmergency() - Clear emergency alert');
        console.log('emergencyTest.debug() - Show debug info');
        console.log('💡 Air Quality Emergency Thresholds: Unhealthy 151+, Dangerous 301+');
    }
    
    // Test activity recommendations at different levels
    testActivityRecommendations() {
        console.log('🧪 Testing activity recommendations...');
        
        // Test unhealthy air quality (now the minimum for emergency)
        setTimeout(() => {
            console.log('Testing unhealthy AQI (165) - minimum for emergency');
            this.testAirQualityAlert(165);
        }, 1000);
        
        // Test dangerous air quality
        setTimeout(() => {
            console.log('Testing dangerous AQI (285)');
            this.testAirQualityAlert(285);
        }, 5000);
        
        // Test moderate (should NOT trigger emergency)
        setTimeout(() => {
            console.log('Testing moderate AQI (120) - should NOT trigger emergency');
            this.testAirQualityAlert(120);
        }, 9000);
        
        console.log('🧪 Activity test cycle started - Emergency threshold: AQI 151+');
    }
    
    async fetchAllEmergencyData() {
        try {
            const promises = [this.fetchEarthquakeData()];
            
            // Only fetch air quality if API key is configured
            if (this.apis.airQuality.enabled) {
                promises.push(this.fetchAirQualityData());
            }
            
            const results = await Promise.allSettled(promises);
            
            // Process earthquake data
            if (results[0].status === 'fulfilled') {
                this.processEarthquakeData(results[0].value);
            } else {
                console.warn('❌ Earthquake data fetch failed:', results[0].reason);
            }
            
            // Process air quality data (if enabled)
            if (this.apis.airQuality.enabled && results[1]) {
                if (results[1].status === 'fulfilled') {
                    this.processAirQualityData(results[1].value);
                } else {
                    console.warn('❌ Air quality data fetch failed:', results[1].reason);
                    this.clearAlert('airQuality');
                }
            }
            
        } catch (error) {
            console.error('❌ Emergency monitoring error:', error);
        }
    }
    
    async fetchEarthquakeData() {
        const params = new URLSearchParams({
            format: 'geojson',
            starttime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            latitude: this.coordinates.latitude,
            longitude: this.coordinates.longitude,
            maxradiuskm: this.emergencyThresholds.earthquake.radius,
            minmagnitude: this.emergencyThresholds.earthquake.minor,
            orderby: 'time'
        });
        
        const response = await fetch(`${this.apis.earthquake.url}?${params}`, {
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
        if (!this.apis.airQuality.enabled) {
            return null;
        }
        
        const params = new URLSearchParams({
            lat: this.coordinates.latitude.toString(),
            lon: this.coordinates.longitude.toString(),
            appid: this.apis.airQuality.apiKey
        });
        
        const response = await fetch(`${this.apis.airQuality.url}?${params}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`OpenWeatherMap API error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    processEarthquakeData(data) {
        if (!data.features || data.features.length === 0) {
            this.clearAlert('earthquake');
            return;
        }
        
        const significantEarthquake = data.features.reduce((max, current) => {
            return current.properties.mag > max.properties.mag ? current : max;
        });
        
        const magnitude = significantEarthquake.properties.mag;
        const distance = this.calculateDistance(
            this.coordinates.latitude,
            this.coordinates.longitude,
            significantEarthquake.geometry.coordinates[1],
            significantEarthquake.geometry.coordinates[0]
        );
        
        this.evaluateEarthquakeAlert(magnitude, distance, significantEarthquake.properties);
    }
    
    processAirQualityData(data) {
        if (!data.list || data.list.length === 0) {
            this.clearAlert('airQuality');
            return;
        }
        
        const current = data.list[0];
        const aqi = current.main.aqi * 50; // Convert to 0-300 scale
        
        this.evaluateAirQualityAlert(aqi, current.components);
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
    
    evaluateAirQualityAlert(aqi, components) {
        let alertLevel = null;
        
        // Only trigger emergency alerts for unhealthy and dangerous levels
        if (aqi >= this.emergencyThresholds.airQuality.dangerous) {
            alertLevel = 'dangerous';
        } else if (aqi > this.emergencyThresholds.airQuality.unhealthy) {
            alertLevel = 'unhealthy';
        }
        // Note: No emergency alert for moderate (AQI 101-150) - only unhealthy (151+)
        
        if (alertLevel) {
            const baseProtocol = this.emergencyProtocols.airQuality[alertLevel];
            const protocol = {
                ...baseProtocol,
                data: {
                    aqi: Math.round(aqi),
                    pm25: components.pm2_5?.toFixed(1) || 'N/A',
                    pm10: components.pm10?.toFixed(1) || 'N/A'
                },
                activities: baseProtocol.activities || null
            };
            
            this.triggerEmergencyAlert('airQuality', protocol);
        } else {
            this.clearAlert('airQuality');
        }
    }
    
    triggerEmergencyAlert(type, protocol) {
        const alertId = `${type}_${protocol.level}`;
        
        if (this.currentAlerts.has(alertId)) {
            return; // Don't spam the same alert
        }
        
        console.log(`🚨 EMERGENCY ALERT: ${type} - ${protocol.level}`);
        this.currentAlerts.add(alertId);
        
        // Always integrate with existing weather system
        if (window.municipalWeatherSystem && typeof window.municipalWeatherSystem.displayEmergencyAlert === 'function') {
            window.municipalWeatherSystem.displayEmergencyAlert(type, protocol);
        }
        
        this.logEmergencyEvent(type, protocol);
    }
    
    logEmergencyEvent(type, protocol) {
        const event = {
            timestamp: new Date().toISOString(),
            location: 'Slobozia, Ialomița',
            type: type,
            level: protocol.level,
            title: protocol.title,
            data: protocol.data || {}
        };
        
        console.log('📋 EMERGENCY LOG:', JSON.stringify(event, null, 2));
    }
    
    clearAlert(type) {
        const alertsToRemove = Array.from(this.currentAlerts).filter(alert => alert.startsWith(type));
        alertsToRemove.forEach(alert => this.currentAlerts.delete(alert));
    }
    
    clearAllAlerts() {
        this.currentAlerts.clear();
        if (window.municipalWeatherSystem) {
            window.municipalWeatherSystem.clearEmergencyAlert();
        }
    }
    
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    startEmergencyMonitoring() {
        const timer = setInterval(() => {
            this.fetchAllEmergencyData();
        }, this.updateInterval);
        
        this.activeTimers.push(timer);
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
            pm2_5: aqi * 0.5,
            pm10: aqi * 0.8
        });
    }
    
    destroy() {
        this.activeTimers.forEach(timer => clearInterval(timer));
        this.activeTimers = [];
        this.clearAllAlerts();
        delete window.emergencyTest;
        delete window.emergencySystemInitialized;
        console.log('🚨 Emergency monitoring system deactivated');
    }
}

// PRODUCTION INITIALIZATION
// Initialize Municipal Weather Warning System
window.WeatherAlertSystem = WeatherAlertSystem;

// Create only ONE instance of the weather system
let weatherSystemInstance = null;

// Auto-initialize if document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!weatherSystemInstance) {
            weatherSystemInstance = new WeatherAlertSystem();
            window.municipalWeatherSystem = weatherSystemInstance;
        }
    });
} else {
    if (!weatherSystemInstance) {
        weatherSystemInstance = new WeatherAlertSystem();
        window.municipalWeatherSystem = weatherSystemInstance;
    }
}

// Initialize Emergency Monitoring System after weather system is ready
setTimeout(() => {
    if (!window.emergencySystem && !window.emergencySystemInitialized && weatherSystemInstance) {
        window.emergencySystem = new EmergencyMonitoringSystem();
    }
}, 5000);

// Production logging
console.log('🏛️ Municipal Weather System v2.0 - Production Ready');
console.log('📍 Location: Slobozia, Ialomița County, Romania');
console.log('🚨 Emergency monitoring: Earthquakes + Air Quality');
console.log('📋 Test commands: weatherTest.debug() | emergencyTest.debug()');
