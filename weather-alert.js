// WEATHER-ALERT.JS - Fixed Weather Alert System for Poliția Locală Slobozia
// This module provides real-time weather information and alerts using Open-Meteo API

class WeatherAlertSystem {
    constructor() {
        this.apiBaseUrl = 'https://api.open-meteo.com/v1/forecast';
        this.coordinates = {
            latitude: 44.5667,  // Slobozia, Romania
            longitude: 27.3667
        };
        this.updateInterval = 10 * 60 * 1000; // 10 minutes
        this.weatherContainer = null;
        this.isExpanded = false;
        this.isHidden = false;
        this.currentWeatherData = null;
        this.updateTimer = null;
        this.hideTimer = null;
        this.lastSuccessfulData = null;
        
        // Fixed weather condition mappings with correct Material Icons
        this.weatherConditions = {
            0: { icon: 'wb_sunny', name: 'Senin', animation: 'sunny' },
            1: { icon: 'partly_cloudy_day', name: 'Parțial înnorat', animation: 'partly-cloudy' },
            2: { icon: 'partly_cloudy_day', name: 'Parțial înnorat', animation: 'partly-cloudy' },
            3: { icon: 'cloud', name: 'Înnorat', animation: 'cloudy' },
            45: { icon: 'foggy', name: 'Ceață', animation: 'foggy' },
            48: { icon: 'foggy', name: 'Ceață cu chiciură', animation: 'foggy' },
            51: { icon: 'grain', name: 'Burniță ușoară', animation: 'drizzle' },
            53: { icon: 'grain', name: 'Burniță moderată', animation: 'drizzle' },
            55: { icon: 'grain', name: 'Burniță densă', animation: 'drizzle' },
            56: { icon: 'ac_unit', name: 'Burniță înghețată ușoară', animation: 'drizzle' },
            57: { icon: 'ac_unit', name: 'Burniță înghețată densă', animation: 'drizzle' },
            61: { icon: 'water_drop', name: 'Ploaie ușoară', animation: 'rainy' },
            63: { icon: 'water_drop', name: 'Ploaie moderată', animation: 'rainy' },
            65: { icon: 'water_drop', name: 'Ploaie torențială', animation: 'heavy-rain' },
            66: { icon: 'ac_unit', name: 'Ploaie înghețată ușoară', animation: 'rainy' },
            67: { icon: 'ac_unit', name: 'Ploaie înghețată puternică', animation: 'heavy-rain' },
            71: { icon: 'ac_unit', name: 'Ninsoare ușoară', animation: 'snowy' },
            73: { icon: 'ac_unit', name: 'Ninsoare moderată', animation: 'snowy' },
            75: { icon: 'ac_unit', name: 'Ninsoare abundentă', animation: 'heavy-snow' },
            77: { icon: 'ac_unit', name: 'Ninsoare cu boabe', animation: 'snowy' },
            80: { icon: 'water_drop', name: 'Averse ușoare', animation: 'rainy' },
            81: { icon: 'water_drop', name: 'Averse moderate', animation: 'rainy' },
            82: { icon: 'water_drop', name: 'Averse violente', animation: 'heavy-rain' },
            85: { icon: 'ac_unit', name: 'Averse de zăpadă ușoare', animation: 'snowy' },
            86: { icon: 'ac_unit', name: 'Averse de zăpadă puternice', animation: 'heavy-snow' },
            95: { icon: 'thunderstorm', name: 'Furtună', animation: 'thunderstorm' },
            96: { icon: 'thunderstorm', name: 'Furtună cu grindină ușoară', animation: 'thunderstorm' },
            99: { icon: 'thunderstorm', name: 'Furtună cu grindină puternică', animation: 'severe-thunderstorm' }
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
            listCodes: () => this.listWeatherCodes(),
            show: () => this.showWeatherAlert(),
            hide: () => this.hideWeatherAlert(),
            expand: () => this.toggleExpanded(),
            destroy: () => this.destroy()
        };
        
        console.log('🌤️ Weather testing commands available:');
        console.log('weatherTest.cycleWeather() - Cycle through all weather conditions');
        console.log('weatherTest.setWeather(code) - Set specific weather code (0-99)');
        console.log('weatherTest.listCodes() - List all weather codes');
        console.log('weatherTest.show() / weatherTest.hide() - Show/hide widget');
        console.log('weatherTest.expand() - Toggle expanded state');
        console.log('weatherTest.destroy() - Remove widget');
    }
    
    // Cycle through weather modes for testing
    cycleWeatherModes() {
        const codes = Object.keys(this.weatherConditions).map(Number);
        let index = 0;
        
        const cycle = () => {
            if (index >= codes.length) {
                console.log('🌤️ Weather cycle completed');
                return;
            }
            
            const code = codes[index];
            console.log(`🌤️ Testing weather code ${code}: ${this.weatherConditions[code].name}`);
            this.setTestWeather(code);
            index++;
            setTimeout(cycle, 2000); // 2 seconds per condition
        };
        
        console.log('🌤️ Starting weather cycle...');
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
                temperature_2m: 20 + Math.random() * 15, // Random temp 20-35°C
                weather_code: code,
                wind_speed_10m: Math.random() * 20,
                precipitation: Math.random() * 5,
                cloud_cover: Math.random() * 100,
                relative_humidity_2m: 50 + Math.random() * 40
            }
        };
        
        this.updateWeatherDisplay(testData);
        console.log(`🌤️ Set weather to: ${condition.name} (${condition.icon})`);
    }
    
    // List all weather codes
    listWeatherCodes() {
        console.log('🌤️ Available weather codes:');
        Object.entries(this.weatherConditions).forEach(([code, condition]) => {
            console.log(`${code}: ${condition.name} (${condition.icon})`);
        });
    }
    
    // Initialize the weather alert system
    async init() {
        this.injectCSS();
        await this.createWeatherContainer();
        this.setupEventListeners();
        this.startWeatherUpdates();
        this.setupIntersectionObserver();
        
        // Delay appearance by 3 seconds (after intro screen)
        setTimeout(() => {
            this.makeVisible();
        }, 3000);
    }
    
    // Inject CSS styles - FIXED TRANSPARENCY AND POSITIONING
    injectCSS() {
        if (document.getElementById('weather-alert-css')) return;
        
        const css = `
        /* Weather Alert System Styles - FIXED VISIBILITY */
        .weather-alert-floating {
            position: fixed;
            top: 120px; /* Better position below header */
            left: 20px; /* Left side for better visibility */
            width: 300px;
            height: 75px;
            background: linear-gradient(135deg, 
                rgba(30, 136, 229, 0.95) 0%, 
                rgba(26, 47, 95, 0.95) 100%); /* Semi-transparent blue gradient */
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 12px;
            color: #ffffff;
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 
                0 8px 32px rgba(0,0,0,0.4),
                0 0 0 1px rgba(255, 255, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            z-index: 1000;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow: hidden;
            opacity: 0;
            transform: translateX(-100%) scale(0.9);
        }
        
        .weather-alert-floating.visible {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
        
        .weather-alert-floating.hidden {
            opacity: 0.95;
            pointer-events: none;
        }
        
        .weather-alert-floating.expanded {
            height: 110px;
            width: 340px;
        }
        
        .weather-alert-floating:hover {
            transform: translateY(-2px);
            box-shadow: 
                0 12px 40px rgba(0,0,0,0.5),
                0 0 0 1px rgba(255, 255, 255, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            background: linear-gradient(135deg, 
                rgba(30, 136, 229, 0.98) 0%, 
                rgba(26, 47, 95, 0.98) 100%);
        }
        
        .weather-content {
            display: flex;
            align-items: center;
            padding: 1rem;
            height: 100%;
            position: relative;
        }
        
        .weather-icon-container {
            width: 55px;
            height: 55px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            position: relative;
            background: linear-gradient(135deg, 
                rgba(255, 255, 255, 0.15) 0%, 
                rgba(255, 255, 255, 0.05) 100%);
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .weather-icon {
            font-size: 2.2rem;
            color: #ffeb3b;
            transition: all 0.3s ease;
            text-shadow: 
                0 2px 4px rgba(0,0,0,0.3),
                0 0 8px rgba(255, 235, 59, 0.3);
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
        
        .weather-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-width: 0;
        }
        
        .temperature-display {
            font-size: 1.4rem;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 0.3rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            color: #ffffff;
        }
        
        .condition-text {
            font-size: 0.85rem;
            font-weight: 500;
            opacity: 0.95;
            line-height: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            color: rgba(255, 255, 255, 0.95);
        }
        
        .location-indicator {
            font-size: 0.7rem;
            font-weight: 400;
            opacity: 0.8;
            margin-top: 0.2rem;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            color: rgba(255, 255, 255, 0.8);
        }
        
        .alert-banner {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border-radius: 12px 12px 0 0;
        }
        
        .alert-banner.visible {
            transform: translateY(0);
        }
        
        .alert-banner.critical {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            animation: criticalPulse 2s infinite;
        }
        
        .alert-banner.warning {
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            color: white;
            animation: warningPulse 3s infinite;
        }
        
        .alert-banner.info {
            background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
            animation: infoPulse 4s infinite;
        }
        
        .expand-indicator {
            position: absolute;
            bottom: 6px;
            right: 8px;
            font-size: 1rem;
            opacity: 0.8;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.1);
            padding: 4px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 10;
            pointer-events: auto;
        }
        
        .expand-indicator:hover {
            opacity: 1;
            transform: scale(1.1);
            background: rgba(255, 255, 255, 0.2);
        }
        
        .expand-indicator i {
            font-family: 'Material Icons' !important;
            font-size: 1rem;
            color: white;
        }
        
        .loading-skeleton {
            background: linear-gradient(90deg, 
                rgba(255,255,255,0.1), 
                rgba(255,255,255,0.3), 
                rgba(255,255,255,0.1)
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .error-state {
            border: 2px solid #f44336;
            animation: errorPulse 2s infinite;
            background: linear-gradient(135deg, 
                rgba(244, 67, 54, 0.2) 0%, 
                rgba(26, 47, 95, 0.95) 100%);
        }
        
        .update-indicator {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 8px;
            height: 8px;
            background: #4caf50;
            border-radius: 50%;
            opacity: 0;
            animation: updateFlash 0.6s ease-out;
            box-shadow: 0 0 4px #4caf50;
        }
        
        /* Weather Icon Animations */
        .weather-icon.sunny {
            animation: sunnyRotate 20s linear infinite;
            color: #ffeb3b;
        }
        
        .weather-icon.partly-cloudy {
            animation: gentleFloat 4s ease-in-out infinite;
            color: #90a4ae;
        }
        
        .weather-icon.cloudy {
            animation: cloudDrift 6s ease-in-out infinite;
            color: #78909c;
        }
        
        .weather-icon.rainy {
            animation: rainyBounce 1.5s ease-in-out infinite;
            color: #2196f3;
        }
        
        .weather-icon.heavy-rain {
            animation: heavyRainShake 0.8s ease-in-out infinite;
            color: #1976d2;
        }
        
        .weather-icon.snowy {
            animation: snowySway 3s ease-in-out infinite;
            color: #e3f2fd;
        }
        
        .weather-icon.heavy-snow {
            animation: snowySway 2s ease-in-out infinite;
            color: #ffffff;
        }
        
        .weather-icon.thunderstorm {
            animation: thunderstormShake 0.3s ease-in-out infinite;
            color: #f44336;
        }
        
        .weather-icon.severe-thunderstorm {
            animation: severeThunderstormShake 0.2s ease-in-out infinite;
            color: #d32f2f;
        }
        
        .weather-icon.foggy {
            animation: foggyFade 2.5s ease-in-out infinite;
            color: #90a4ae;
            opacity: 0.8;
        }
        
        .weather-icon.drizzle {
            animation: drizzleFloat 2s ease-in-out infinite;
            color: #64b5f6;
        }
        
        /* Keyframe Animations */
        @keyframes sunnyRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        @keyframes gentleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
        }
        
        @keyframes cloudDrift {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(2px); }
        }
        
        @keyframes rainyBounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
        }
        
        @keyframes heavyRainShake {
            0%, 100% { transform: translate(0px, 0px); }
            25% { transform: translate(-1px, -1px); }
            75% { transform: translate(1px, 1px); }
        }
        
        @keyframes snowySway {
            0%, 100% { transform: translateX(0px) rotate(0deg); }
            33% { transform: translateX(-1px) rotate(-1deg); }
            66% { transform: translateX(1px) rotate(1deg); }
        }
        
        @keyframes thunderstormShake {
            0%, 100% { transform: translate(0px, 0px); }
            25% { transform: translate(-2px, -1px); }
            50% { transform: translate(2px, 1px); }
            75% { transform: translate(-1px, 2px); }
        }
        
        @keyframes severeThunderstormShake {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            25% { transform: translate(-3px, -2px) scale(1.05); }
            50% { transform: translate(3px, 2px) scale(0.95); }
            75% { transform: translate(-2px, 3px) scale(1.02); }
        }
        
        @keyframes foggyFade {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.9; }
        }
        
        @keyframes drizzleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-1px); }
        }
        
        @keyframes criticalPulse {
            0%, 100% { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); }
            50% { background: linear-gradient(135deg, #ff5722 0%, #f44336 100%); }
        }
        
        @keyframes warningPulse {
            0%, 100% { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); }
            50% { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); }
        }
        
        @keyframes infoPulse {
            0%, 100% { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); }
            50% { background: linear-gradient(135deg, #03a9f4 0%, #2196f3 100%); }
        }
        
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        @keyframes errorPulse {
            0%, 100% { border-color: #f44336; }
            50% { border-color: #ff1744; }
        }
        
        @keyframes updateFlash {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0; transform: scale(1); }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .weather-alert-floating {
                top: 90px;
                left: 10px;
                width: 260px;
                height: 65px;
            }
            
            .weather-alert-floating.expanded {
                height: 90px;
                width: 280px;
            }
            
            .weather-content {
                padding: 0.8rem;
            }
            
            .weather-icon-container {
                width: 45px;
                height: 45px;
                margin-right: 0.8rem;
            }
            
            .weather-icon {
                font-size: 1.8rem;
            }
            
            .temperature-display {
                font-size: 1.2rem;
            }
            
            .condition-text {
                font-size: 0.75rem;
            }
            
            .location-indicator {
                font-size: 0.65rem;
            }
        }
        
        /* High Contrast Support */
        @media (prefers-contrast: high) {
            .weather-alert-floating {
                border: 3px solid white;
                background: rgba(0, 0, 0, 0.95);
            }
        }
        
        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
            .weather-alert-floating,
            .weather-icon,
            .alert-banner {
                animation: none !important;
                transition: opacity 0.3s ease !important;
            }
        }
        `;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'weather-alert-css';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }
    
    // Create the weather container HTML - FIXED EXPAND BUTTON
    async createWeatherContainer() {
        this.weatherContainer = document.createElement('div');
        this.weatherContainer.className = 'weather-alert-floating';
        this.weatherContainer.setAttribute('role', 'complementary');
        this.weatherContainer.setAttribute('aria-label', 'Informații meteo curente');
        this.weatherContainer.setAttribute('tabindex', '0');
        
        this.weatherContainer.innerHTML = `
            <div class="weather-content">
                <div class="weather-icon-container">
                    <i class="material-icons weather-icon loading-skeleton">wb_sunny</i>
                </div>
                <div class="weather-info">
                    <div class="temperature-display loading-skeleton">--°C</div>
                    <div class="condition-text loading-skeleton">Se încarcă...</div>
                    <div class="location-indicator">Slobozia, IL</div>
                </div>
                <div class="alert-banner" role="alert" aria-live="assertive"></div>
                <div class="expand-indicator" role="button" aria-label="Expandează informații meteo" tabindex="0">
                    <i class="material-icons">expand_more</i>
                </div>
                <div class="update-indicator"></div>
            </div>
        `;
        
        document.body.appendChild(this.weatherContainer);
    }
    
    // Setup event listeners - FIXED EXPAND BUTTON
    setupEventListeners() {
        // Click to expand/collapse - main container
        this.weatherContainer.addEventListener('click', (e) => {
            // Don't trigger on expand indicator clicks
            if (!e.target.closest('.expand-indicator')) {
                this.toggleExpanded();
            }
        });
        
        // Separate handler for expand indicator
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
        
        // Keyboard support for main container
        this.weatherContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleExpanded();
            } else if (e.key === 'Escape') {
                this.isExpanded = false;
                this.updateExpandedState();
            }
        });
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.checkOverlaps();
        });
        
        // Scroll handler for overlap detection
        window.addEventListener('scroll', () => {
            this.checkOverlaps();
        });
    }
    
    // Setup intersection observer for smart hiding
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.target.classList.contains('dropdown-menu') && entry.isIntersecting) {
                    this.hideWeatherAlert();
                } else {
                    clearTimeout(this.hideTimer);
                    this.hideTimer = setTimeout(() => {
                        this.showWeatherAlert();
                    }, 500);
                }
            });
        });
        
        // Observe dropdown menus
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            observer.observe(menu);
        });
    }
    
    // Check for overlaps with important elements
    checkOverlaps() {
        if (!this.weatherContainer) return;
        
        const weatherRect = this.weatherContainer.getBoundingClientRect();
        const importantSelectors = [
            'h1', 'h2', 'form', 'button', '.main-nav.active',
            '.dropdown-menu', '.modal', '.alert'
        ];
        
        let hasOverlap = false;
        
        importantSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (this.isOverlapping(weatherRect, rect)) {
                    hasOverlap = true;
                }
            });
        });
        
        if (hasOverlap) {
            this.hideWeatherAlert();
        } else {
            this.showWeatherAlert();
        }
    }
    
    // Check if two rectangles overlap
    isOverlapping(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    // Show weather alert
    showWeatherAlert() {
        if (this.weatherContainer && this.isHidden) {
            this.weatherContainer.classList.remove('hidden');
            this.isHidden = false;
        }
    }
    
    // Hide weather alert
    hideWeatherAlert() {
        if (this.weatherContainer && !this.isHidden) {
            this.weatherContainer.classList.add('hidden');
            this.isHidden = true;
        }
    }
    
    // Toggle expanded state - IMPROVED
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        this.updateExpandedState();
        console.log(`🌤️ Weather widget ${this.isExpanded ? 'expanded' : 'collapsed'}`);
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
    
    // Start weather updates
    startWeatherUpdates() {
        this.fetchWeatherData();
        this.updateTimer = setInterval(() => {
            this.fetchWeatherData();
        }, this.updateInterval);
    }
    
    // Fetch weather data from Open-Meteo API
    async fetchWeatherData() {
        try {
            const params = new URLSearchParams({
                latitude: this.coordinates.latitude.toString(),
                longitude: this.coordinates.longitude.toString(),
                current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m',
                hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
                timezone: 'Europe/Bucharest',
                forecast_days: 3
            });
            
            const url = `${this.apiBaseUrl}?${params}`;
            console.log('🌤️ Fetching weather data from:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Politia-Locala-Slobozia-Weather/1.0'
                },
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('🌤️ Raw weather API response:', data);
            
            if (!data.current || typeof data.current.temperature_2m !== 'number') {
                console.error('❌ Invalid API response structure:', data);
                throw new Error('Invalid weather data structure received from API');
            }
            
            console.log('🌡️ Current temperature:', data.current.temperature_2m, '°C');
            console.log('🌦️ Weather code:', data.current.weather_code);
            
            this.currentWeatherData = data;
            this.lastSuccessfulData = data;
            this.updateWeatherDisplay(data);
            this.checkWeatherAlerts(data);
            this.showUpdateIndicator();
            
            if (this.weatherContainer) {
                this.weatherContainer.classList.remove('error-state');
            }
            
            console.log('✅ Weather data updated successfully');
            
        } catch (error) {
            console.error('❌ Weather fetch error:', error);
            this.handleWeatherError(error);
        }
    }
    
    // Update weather display - FIXED ICON DISPLAY
    updateWeatherDisplay(data) {
        if (!this.weatherContainer || !data.current) {
            console.error('❌ Cannot update display: missing container or current data');
            return;
        }
        
        const current = data.current;
        console.log('🔄 Updating weather display with:', current);
        
        const weatherCode = parseInt(current.weather_code) || 0;
        const condition = this.weatherConditions[weatherCode] || {
            icon: 'help_outline',
            name: `Cod necunoscut (${weatherCode})`,
            animation: 'sunny'
        };
        
        console.log(`🌦️ Weather mapping: Code ${weatherCode} → ${condition.name} (${condition.icon})`);
        
        // Remove loading skeleton
        const elements = this.weatherContainer.querySelectorAll('.loading-skeleton');
        elements.forEach(el => el.classList.remove('loading-skeleton'));
        
        // Update temperature
        const tempDisplay = this.weatherContainer.querySelector('.temperature-display');
        if (tempDisplay && typeof current.temperature_2m === 'number') {
            const temperature = Math.round(current.temperature_2m);
            tempDisplay.textContent = `${temperature}°C`;
            console.log(`🌡️ Temperature display updated: ${temperature}°C`);
        }
        
        // Update condition text
        const conditionText = this.weatherContainer.querySelector('.condition-text');
        if (conditionText) {
            conditionText.textContent = condition.name;
            console.log(`📝 Condition text updated: ${condition.name}`);
        }
        
        // Update weather icon - FIXED
        const weatherIcon = this.weatherContainer.querySelector('.weather-icon');
        if (weatherIcon) {
            // Clear all classes first
            weatherIcon.className = 'material-icons weather-icon';
            weatherIcon.textContent = condition.icon;
            
            // Add animation class after a short delay
            setTimeout(() => {
                weatherIcon.classList.add(condition.animation);
            }, 100);
            
            console.log(`🎭 Icon updated: ${condition.icon} with animation: ${condition.animation}`);
        }
        
        // Update accessibility
        if (this.weatherContainer) {
            const now = new Date().toLocaleTimeString('ro-RO', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this.weatherContainer.setAttribute('aria-label', 
                `Informații meteo actuale pentru Slobozia: ${condition.name}, ${Math.round(current.temperature_2m)}°C, actualizat la ${now}`
            );
        }
        
        console.log('✅ Weather display update completed successfully');
    }
    
    // Check for weather alerts
    checkWeatherAlerts(data) {
        if (!data.current) {
            console.log('No current weather data for alerts');
            return;
        }
        
        const current = data.current;
        const alerts = [];
        
        console.log('Checking weather alerts for:', current);
        
        // Temperature alerts
        if (typeof current.temperature_2m === 'number') {
            if (current.temperature_2m < -5) {
                alerts.push({
                    type: 'critical',
                    message: 'ALERTĂ ÎNGHEȚ SEVER'
                });
            } else if (current.temperature_2m > 35) {
                alerts.push({
                    type: 'critical',
                    message: 'ALERTĂ CANICULĂ'
                });
            }
        }
        
        // Wind alerts
        if (typeof current.wind_speed_10m === 'number' && current.wind_speed_10m > 25) {
            alerts.push({
                type: 'warning',
                message: 'VÂNT PUTERNIC'
            });
        }
        
        // Severe weather alerts
        const severeWeatherCodes = [95, 96, 99];
        if (severeWeatherCodes.includes(current.weather_code)) {
            alerts.push({
                type: 'critical',
                message: 'ALERTĂ FURTUNĂ'
            });
        }
        
        // Precipitation alerts
        if (data.hourly && data.hourly.precipitation_probability) {
            const maxPrecipitation = Math.max(...data.hourly.precipitation_probability.slice(0, 12));
            if (maxPrecipitation > 80) {
                alerts.push({
                    type: 'info',
                    message: 'RISC PRECIPITAȚII'
                });
            }
        }
        
        console.log('Weather alerts found:', alerts);
        this.displayAlert(alerts[0]);
    }
    
    // Display weather alert
    displayAlert(alert) {
        const alertBanner = this.weatherContainer.querySelector('.alert-banner');
        if (!alertBanner) return;
        
        if (alert) {
            console.log('Displaying alert:', alert);
            alertBanner.textContent = alert.message;
            alertBanner.className = `alert-banner visible ${alert.type}`;
            this.isExpanded = true;
            this.updateExpandedState();
        } else {
            alertBanner.classList.remove('visible');
            alertBanner.className = 'alert-banner';
        }
    }
    
    // Handle weather API errors
    handleWeatherError(error) {
        console.error('Weather error details:', error);
        
        if (!this.weatherContainer) return;
        
        this.weatherContainer.classList.add('error-state');
        
        if (this.lastSuccessfulData) {
            console.log('Using cached weather data due to error');
            this.updateWeatherDisplay(this.lastSuccessfulData);
            
            const conditionText = this.weatherContainer.querySelector('.condition-text');
            if (conditionText) {
                conditionText.textContent = conditionText.textContent + ' (Cache)';
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
        
        this.displayAlert({
            type: 'warning',
            message: 'EROARE METEO'
        });
    }
    
    // Show update indicator
    showUpdateIndicator() {
        const indicator = this.weatherContainer.querySelector('.update-indicator');
        if (indicator) {
            indicator.style.opacity = '1';
            setTimeout(() => {
                indicator.style.opacity = '0';
            }, 600);
        }
    }
    
    // Make weather alert visible
    makeVisible() {
        if (this.weatherContainer) {
            setTimeout(() => {
                this.weatherContainer.classList.add('visible');
                console.log('🌤️ Weather alert made visible');
            }, 100);
        }
    }
    
    // Cleanup method
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
        
        // Clean up console interface
        delete window.weatherTest;
        
        console.log('🌤️ Weather Alert System destroyed');
    }
}

// Export for use in components.js
window.WeatherAlertSystem = WeatherAlertSystem;

console.log('🌤️ Weather Alert System loaded. Use weatherTest.* commands in console for testing.');
