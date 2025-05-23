// WEATHER-ALERT.JS - Floating Weather Alert System for Poliția Locală Slobozia
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
        
        // Weather condition mappings - Updated with correct WMO codes
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
            61: { icon: 'rainy', name: 'Ploaie ușoară', animation: 'rainy' },
            63: { icon: 'rainy', name: 'Ploaie moderată', animation: 'rainy' },
            65: { icon: 'rainy', name: 'Ploaie torențială', animation: 'heavy-rain' },
            66: { icon: 'ac_unit', name: 'Ploaie înghețată ușoară', animation: 'rainy' },
            67: { icon: 'ac_unit', name: 'Ploaie înghețată puternică', animation: 'heavy-rain' },
            71: { icon: 'weather_snowy', name: 'Ninsoare ușoară', animation: 'snowy' },
            73: { icon: 'weather_snowy', name: 'Ninsoare moderată', animation: 'snowy' },
            75: { icon: 'weather_snowy', name: 'Ninsoare abundentă', animation: 'heavy-snow' },
            77: { icon: 'weather_snowy', name: 'Ninsoare cu boabe', animation: 'snowy' },
            80: { icon: 'rainy', name: 'Averse ușoare', animation: 'rainy' },
            81: { icon: 'rainy', name: 'Averse moderate', animation: 'rainy' },
            82: { icon: 'rainy', name: 'Averse violente', animation: 'heavy-rain' },
            85: { icon: 'weather_snowy', name: 'Averse de zăpadă ușoare', animation: 'snowy' },
            86: { icon: 'weather_snowy', name: 'Averse de zăpadă puternice', animation: 'heavy-snow' },
            95: { icon: 'thunderstorm', name: 'Furtună', animation: 'thunderstorm' },
            96: { icon: 'thunderstorm', name: 'Furtună cu grindină ușoară', animation: 'thunderstorm' },
            99: { icon: 'thunderstorm', name: 'Furtună cu grindină puternică', animation: 'severe-thunderstorm' }
        };
        
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
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
            this.showWeatherAlert();
        }, 3000);
    }
    
    // Inject CSS styles for the weather alert system - FIXED TRANSPARENCY
    injectCSS() {
        if (document.getElementById('weather-alert-css')) return;
        
        const css = `
        /* Weather Alert System Styles - MAXIMUM VISIBILITY */
        .weather-alert-floating {
            position: fixed;
            top: calc(var(--header-height) + 0.5rem);
            right: 1rem;
            width: 280px; /* Increased size to match header scale */
            height: 70px; /* Increased height */
            background: linear-gradient(135deg, 
                rgba(26, 47, 95, 1) 0%, 
                rgba(15, 26, 54, 1) 100%); /* Solid gradient background */
            border-radius: var(--border-radius-large);
            color: #ffffff;
            font-family: 'Poppins', sans-serif;
            box-shadow: 
                0 8px 32px rgba(0,0,0,0.6),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.1); /* Multiple shadows for depth */
            border: 2px solid rgba(30, 136, 229, 0.3); /* Blue accent border */
            z-index: 999;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow: hidden;
            opacity: 0;
            transform: translateX(100%) scale(0.9);
        }
        
        .weather-alert-floating.visible {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
        
        .weather-alert-floating.hidden {
            opacity: 0.8; /* Much more visible when hidden */
            pointer-events: none;
        }
        
        .weather-alert-floating.expanded {
            height: 105px; /* Larger expanded size */
            width: 320px;
        }
        
        .weather-alert-floating:hover {
            transform: translateY(-3px);
            box-shadow: 
                0 12px 40px rgba(0,0,0,0.7),
                0 0 0 1px rgba(30, 136, 229, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            border-color: rgba(30, 136, 229, 0.5);
        }
        
        .weather-content {
            display: flex;
            align-items: center;
            padding: 1rem; /* Increased padding */
            height: 100%;
            position: relative;
            background: linear-gradient(135deg, 
                rgba(255, 255, 255, 0.08) 0%, 
                rgba(255, 255, 255, 0.02) 100%); /* Subtle inner glow */
            border-radius: var(--border-radius-large);
        }
        
        .weather-icon-container {
            width: 52px; /* Larger icon container */
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            position: relative;
            background: linear-gradient(135deg, 
                rgba(30, 136, 229, 0.2) 0%, 
                rgba(255, 202, 40, 0.1) 100%);
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .weather-icon {
            font-size: 2.4rem; /* Larger icon */
            color: #ffca28; /* Bright accent color */
            transition: all 0.3s ease;
            text-shadow: 
                0 2px 4px rgba(0,0,0,0.5),
                0 0 8px rgba(255, 202, 40, 0.3); /* Enhanced text shadow */
        }
        
        .weather-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-width: 0;
        }
        
        .temperature-display {
            font-size: 1.3rem; /* Larger temperature */
            font-weight: 700;
            line-height: 1;
            margin-bottom: 0.2rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            color: #ffffff;
        }
        
        .condition-text {
            font-size: 0.8rem; /* Larger condition text */
            font-weight: 500;
            opacity: 1; /* Full opacity */
            line-height: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            color: rgba(255, 255, 255, 1);
        }
        
        .location-indicator {
            font-size: 0.65rem; /* Larger location text */
            font-weight: 400;
            opacity: 0.9;
            margin-top: 0.1rem;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            color: rgba(255, 255, 255, 0.9);
        }
        
        .alert-banner {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.65rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .alert-banner.visible {
            transform: translateY(0);
        }
        
        .alert-banner.critical {
            background: var(--danger-color);
            animation: criticalPulse 2s infinite;
        }
        
        .alert-banner.warning {
            background: var(--accent-color);
            color: var(--primary-color);
            animation: warningPulse 3s infinite;
        }
        
        .alert-banner.info {
            background: var(--secondary-color);
            animation: infoPulse 4s infinite;
        }
        
        .expand-indicator {
            position: absolute;
            bottom: 4px;
            right: 6px;
            font-size: 0.8rem;
            opacity: 0.7; /* Increased from 0.5 */
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.1);
            padding: 2px;
            border-radius: 4px;
        }
        
        .weather-alert-floating:hover .expand-indicator {
            opacity: 1;
            transform: scale(1.1);
            background: rgba(255, 255, 255, 0.2);
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
            border: 2px solid var(--danger-color);
            animation: errorPulse 2s infinite;
            background: rgba(229, 57, 53, 0.2); /* Red tinted background for errors */
        }
        
        .update-indicator {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 6px;
            height: 6px;
            background: var(--success-color);
            border-radius: 50%;
            opacity: 0;
            animation: updateFlash 0.6s ease-out;
            box-shadow: 0 0 4px var(--success-color);
        }
        
        /* Weather Icon Animations */
        .weather-icon.sunny {
            animation: sunnyRotate 20s linear infinite;
            filter: drop-shadow(0 0 8px rgba(255, 202, 40, 0.6));
        }
        
        .weather-icon.partly-cloudy {
            animation: gentleFloat 4s ease-in-out infinite;
        }
        
        .weather-icon.cloudy {
            animation: cloudDrift 6s ease-in-out infinite;
        }
        
        .weather-icon.rainy {
            animation: rainyBounce 1.5s ease-in-out infinite;
            filter: drop-shadow(0 0 4px rgba(30, 136, 229, 0.4));
        }
        
        .weather-icon.heavy-rain {
            animation: heavyRainShake 0.8s ease-in-out infinite;
            filter: drop-shadow(0 0 6px rgba(30, 136, 229, 0.6));
        }
        
        .weather-icon.snowy {
            animation: snowySway 3s ease-in-out infinite;
            filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.4));
        }
        
        .weather-icon.thunderstorm {
            animation: thunderstormShake 0.3s ease-in-out infinite;
            filter: drop-shadow(0 0 8px rgba(229, 57, 53, 0.6));
        }
        
        .weather-icon.severe-thunderstorm {
            animation: severeThunderstormShake 0.2s ease-in-out infinite;
            filter: drop-shadow(0 0 12px rgba(229, 57, 53, 0.8));
        }
        
        .weather-icon.foggy {
            animation: foggyFade 2.5s ease-in-out infinite;
            opacity: 0.7;
        }
        
        .weather-icon.drizzle {
            animation: drizzleFloat 2s ease-in-out infinite;
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
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
        }
        
        @keyframes drizzleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-1px); }
        }
        
        @keyframes criticalPulse {
            0%, 100% { background-color: var(--danger-color); }
            50% { background-color: #ff5722; }
        }
        
        @keyframes warningPulse {
            0%, 100% { background-color: var(--accent-color); }
            50% { background-color: #ffc107; }
        }
        
        @keyframes infoPulse {
            0%, 100% { background-color: var(--secondary-color); }
            50% { background-color: #2196f3; }
        }
        
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        @keyframes errorPulse {
            0%, 100% { border-color: var(--danger-color); }
            50% { border-color: #ff1744; }
        }
        
        @keyframes updateFlash {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0; transform: scale(1); }
        }
        
        /* Responsive Design - ENHANCED VISIBILITY */
        @media (max-width: 768px) {
            .weather-alert-floating {
                top: calc(var(--header-height) + 0.5rem);
                left: 1rem;
                right: auto;
                width: 200px; /* Larger mobile size */
                height: 56px;
                background: linear-gradient(135deg, 
                    rgba(26, 47, 95, 1) 0%, 
                    rgba(15, 26, 54, 1) 100%); /* Same solid background on mobile */
            }
            
            .weather-alert-floating.expanded {
                height: 80px;
                width: 240px;
            }
            
            .weather-content {
                padding: 0.8rem;
            }
            
            .weather-icon-container {
                width: 40px;
                height: 40px;
                margin-right: 0.8rem;
            }
            
            .weather-icon {
                font-size: 2rem; /* Larger mobile icon */
            }
            
            .temperature-display {
                font-size: 1rem; /* Larger mobile temperature */
            }
            
            .condition-text {
                font-size: 0.7rem; /* Larger mobile condition */
            }
            
            .location-indicator {
                font-size: 0.6rem; /* Larger mobile location */
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
        
        /* High Contrast Support */
        @media (prefers-contrast: high) {
            .weather-alert-floating {
                border: 3px solid white;
                background: rgba(0, 0, 0, 0.95);
            }
        }
        `;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'weather-alert-css';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }
    
    // Create the weather container HTML
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
                <div class="expand-indicator">
                    <i class="material-icons">expand_more</i>
                </div>
                <div class="update-indicator"></div>
            </div>
        `;
        
        document.body.appendChild(this.weatherContainer);
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Click to expand/collapse
        this.weatherContainer.addEventListener('click', () => {
            this.toggleExpanded();
        });
        
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
    
    // Toggle expanded state
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        this.updateExpandedState();
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
    
    // Fetch weather data from Open-Meteo API - COMPLETELY REVISED
    async fetchWeatherData() {
        try {
            // Use the correct Open-Meteo API URL structure
            const params = new URLSearchParams({
                latitude: this.coordinates.latitude.toString(),
                longitude: this.coordinates.longitude.toString(),
                current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m',
                hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
                timezone: 'Europe/Bucharest',
                forecast_days: 3 // Get more data for better accuracy
            });
            
            const url = `${this.apiBaseUrl}?${params}`;
            console.log('🌤️ Fetching weather data from:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Politia-Locala-Slobozia-Weather/1.0'
                },
                cache: 'no-cache' // Always get fresh data
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('🌤️ Raw weather API response:', data);
            
            // Validate the response structure
            if (!data.current || typeof data.current.temperature_2m !== 'number') {
                console.error('❌ Invalid API response structure:', data);
                throw new Error('Invalid weather data structure received from API');
            }
            
            // Log current conditions for debugging
            console.log('🌡️ Current temperature:', data.current.temperature_2m, '°C');
            console.log('🌦️ Weather code:', data.current.weather_code);
            console.log('💧 Precipitation:', data.current.precipitation, 'mm');
            console.log('☁️ Cloud cover:', data.current.cloud_cover, '%');
            console.log('💨 Wind speed:', data.current.wind_speed_10m, 'km/h');
            
            this.currentWeatherData = data;
            this.lastSuccessfulData = data;
            this.updateWeatherDisplay(data);
            this.checkWeatherAlerts(data);
            this.showUpdateIndicator();
            
            // Remove error state
            if (this.weatherContainer) {
                this.weatherContainer.classList.remove('error-state');
            }
            
            console.log('✅ Weather data updated successfully');
            
        } catch (error) {
            console.error('❌ Weather fetch error:', error);
            this.handleWeatherError(error);
        }
    }
    
    // Update weather display - ENHANCED WITH BETTER DATA HANDLING
    updateWeatherDisplay(data) {
        if (!this.weatherContainer || !data.current) {
            console.error('❌ Cannot update display: missing container or current data');
            return;
        }
        
        const current = data.current;
        console.log('🔄 Updating weather display with:', current);
        
        // Get weather condition - ensure we have the correct mapping
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
        
        // Update temperature with proper rounding
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
        
        // Update weather icon with proper class management
        const weatherIcon = this.weatherContainer.querySelector('.weather-icon');
        if (weatherIcon) {
            weatherIcon.textContent = condition.icon;
            // Clear all existing animation classes
            weatherIcon.className = 'material-icons weather-icon';
            // Add the specific animation class
            setTimeout(() => {
                weatherIcon.classList.add(condition.animation);
            }, 50);
            console.log(`🎭 Icon updated: ${condition.icon} with animation: ${condition.animation}`);
        }
        
        // Add current time and conditions to aria-label for accessibility
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
    
    // Check for weather alerts - IMPROVED LOGIC
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
        
        // Severe weather alerts based on weather code
        const severeWeatherCodes = [95, 96, 99]; // Thunderstorms
        if (severeWeatherCodes.includes(current.weather_code)) {
            alerts.push({
                type: 'critical',
                message: 'ALERTĂ FURTUNĂ'
            });
        }
        
        // Precipitation alerts
        if (data.hourly && data.hourly.precipitation_probability) {
            const maxPrecipitation = Math.max(...data.hourly.precipitation_probability.slice(0, 12)); // Next 12 hours
            if (maxPrecipitation > 80) {
                alerts.push({
                    type: 'info',
                    message: 'RISC PRECIPITAȚII'
                });
            }
        }
        
        console.log('Weather alerts found:', alerts);
        this.displayAlert(alerts[0]); // Show most critical alert
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
    
    // Handle weather API errors - IMPROVED ERROR HANDLING
    handleWeatherError(error) {
        console.error('Weather error details:', error);
        
        if (!this.weatherContainer) return;
        
        // Add error state styling
        this.weatherContainer.classList.add('error-state');
        
        // Try to use last successful data if available
        if (this.lastSuccessfulData) {
            console.log('Using cached weather data due to error');
            this.updateWeatherDisplay(this.lastSuccessfulData);
            
            // Show error indicator but keep data
            const conditionText = this.weatherContainer.querySelector('.condition-text');
            if (conditionText) {
                conditionText.textContent = conditionText.textContent + ' (Cache)';
            }
        } else {
            // No cached data available - show error message
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
        
        // Remove loading skeleton
        const elements = this.weatherContainer.querySelectorAll('.loading-skeleton');
        elements.forEach(el => el.classList.remove('loading-skeleton'));
        
        // Show error alert
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
    
    // Make weather alert visible with animation - RENAMED TO AVOID CONFLICT
    makeVisible() {
        if (this.weatherContainer) {
            setTimeout(() => {
                this.weatherContainer.classList.add('visible');
                console.log('Weather alert made visible');
            }, 100);
        }
    }
    
    // Initial appearance method (called after delay)
    showWeatherAlert() {
        if (!this.isHidden) {
            this.makeVisible();
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
        console.log('Weather Alert System destroyed');
    }
}

// Export for use in components.js
window.WeatherAlertSystem = WeatherAlertSystem;
