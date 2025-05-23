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
        
        // Weather condition mappings
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
            61: { icon: 'rainy', name: 'Ploaie ușoară', animation: 'rainy' },
            63: { icon: 'rainy', name: 'Ploaie moderată', animation: 'rainy' },
            65: { icon: 'rainy', name: 'Ploaie torențială', animation: 'heavy-rain' },
            71: { icon: 'weather_snowy', name: 'Ninsoare ușoară', animation: 'snowy' },
            73: { icon: 'weather_snowy', name: 'Ninsoare moderată', animation: 'snowy' },
            75: { icon: 'weather_snowy', name: 'Ninsoare abundentă', animation: 'heavy-snow' },
            95: { icon: 'thunderstorm', name: 'Furtună', animation: 'thunderstorm' },
            96: { icon: 'thunderstorm', name: 'Furtună cu grindină', animation: 'thunderstorm' },
            99: { icon: 'thunderstorm', name: 'Furtună severă', animation: 'severe-thunderstorm' }
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
    
    // Inject CSS styles for the weather alert system
    injectCSS() {
        if (document.getElementById('weather-alert-css')) return;
        
        const css = `
        /* Weather Alert System Styles */
        .weather-alert-floating {
            position: fixed;
            top: calc(var(--header-height) + 1rem);
            right: 1.5rem;
            width: 256px; /* 20% smaller than 320px */
            height: 64px; /* 20% smaller than 80px */
            background: rgba(26, 47, 95, 0.95);
            backdrop-filter: blur(12px);
            border-radius: var(--border-radius-large);
            color: var(--text-light);
            font-family: 'Poppins', sans-serif;
            box-shadow: var(--shadow-large);
            border: 1px solid rgba(255, 255, 255, 0.1);
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
            opacity: 0.3;
            pointer-events: none;
        }
        
        .weather-alert-floating.expanded {
            height: 96px; /* 20% smaller than 120px */
            width: 304px; /* 20% smaller than 380px */
        }
        
        .weather-alert-floating:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        
        .weather-content {
            display: flex;
            align-items: center;
            padding: 0.8rem;
            height: 100%;
            position: relative;
        }
        
        .weather-icon-container {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 0.8rem;
            position: relative;
        }
        
        .weather-icon {
            font-size: 2.2rem;
            color: var(--accent-color);
            transition: all 0.3s ease;
        }
        
        .weather-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-width: 0;
        }
        
        .temperature-display {
            font-size: 1.1rem; /* 20% smaller than 1.4rem */
            font-weight: 700;
            line-height: 1;
            margin-bottom: 0.1rem;
        }
        
        .condition-text {
            font-size: 0.7rem; /* 20% smaller than 0.9rem */
            font-weight: 500;
            opacity: 0.8;
            line-height: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .location-indicator {
            font-size: 0.6rem; /* 20% smaller than 0.8rem */
            font-weight: 400;
            opacity: 0.6;
            margin-top: 0.1rem;
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
            opacity: 0.5;
            transition: all 0.3s ease;
        }
        
        .weather-alert-floating:hover .expand-indicator {
            opacity: 0.8;
            transform: scale(1.1);
        }
        
        .loading-skeleton {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        
        .error-state {
            border: 2px solid var(--danger-color);
            animation: errorPulse 2s infinite;
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
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .weather-alert-floating {
                top: calc(var(--header-height) + 0.5rem);
                left: 1rem;
                right: auto;
                width: 176px; /* 20% smaller than mobile 220px */
                height: 48px; /* 20% smaller than mobile 60px */
            }
            
            .weather-alert-floating.expanded {
                height: 72px; /* 20% smaller than mobile expanded */
                width: 200px;
            }
            
            .weather-content {
                padding: 0.6rem;
            }
            
            .weather-icon-container {
                width: 36px;
                height: 36px;
                margin-right: 0.6rem;
            }
            
            .weather-icon {
                font-size: 1.8rem;
            }
            
            .temperature-display {
                font-size: 0.9rem;
            }
            
            .condition-text {
                font-size: 0.6rem;
            }
            
            .location-indicator {
                font-size: 0.5rem;
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
                border: 2px solid white;
                background: rgba(0, 0, 0, 0.9);
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
    
    // Fetch weather data from Open-Meteo API
    async fetchWeatherData() {
        try {
            const params = new URLSearchParams({
                latitude: this.coordinates.latitude,
                longitude: this.coordinates.longitude,
                current_weather: true,
                hourly: 'weather_code,temperature_2m,precipitation_probability,wind_speed_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min',
                timezone: 'Europe/Bucharest',
                forecast_days: 1
            });
            
            const response = await fetch(`${this.apiBaseUrl}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.currentWeatherData = data;
            this.updateWeatherDisplay(data);
            this.checkWeatherAlerts(data);
            this.showUpdateIndicator();
            
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.handleWeatherError();
        }
    }
    
    // Update weather display
    updateWeatherDisplay(data) {
        if (!this.weatherContainer || !data.current_weather) return;
        
        const current = data.current_weather;
        const condition = this.weatherConditions[current.weathercode] || 
                         this.weatherConditions[0];
        
        // Remove loading skeleton
        const elements = this.weatherContainer.querySelectorAll('.loading-skeleton');
        elements.forEach(el => el.classList.remove('loading-skeleton'));
        
        // Update temperature
        const tempDisplay = this.weatherContainer.querySelector('.temperature-display');
        if (tempDisplay) {
            tempDisplay.textContent = `${Math.round(current.temperature)}°C`;
        }
        
        // Update condition text
        const conditionText = this.weatherContainer.querySelector('.condition-text');
        if (conditionText) {
            conditionText.textContent = condition.name;
        }
        
        // Update weather icon
        const weatherIcon = this.weatherContainer.querySelector('.weather-icon');
        if (weatherIcon) {
            weatherIcon.textContent = condition.icon;
            // Remove all animation classes
            weatherIcon.className = 'material-icons weather-icon ' + condition.animation;
        }
        
        // Remove error state
        this.weatherContainer.classList.remove('error-state');
    }
    
    // Check for weather alerts
    checkWeatherAlerts(data) {
        if (!data.current_weather || !data.hourly) return;
        
        const current = data.current_weather;
        const hourly = data.hourly;
        const alerts = [];
        
        // Temperature alerts
        if (current.temperature < -5) {
            alerts.push({
                type: 'critical',
                message: 'ALERTĂ ÎNGHEȚ SEVER'
            });
        } else if (current.temperature > 35) {
            alerts.push({
                type: 'critical',
                message: 'ALERTĂ CANICULĂ'
            });
        }
        
        // Wind alerts
        if (current.windspeed > 25) {
            alerts.push({
                type: 'warning',
                message: 'VÂNT PUTERNIC'
            });
        }
        
        // Severe weather alerts
        if ([95, 96, 99].includes(current.weathercode)) {
            alerts.push({
                type: 'critical',
                message: 'ALERTĂ FURTUNĂ'
            });
        }
        
        // Precipitation alerts
        const maxPrecipitation = Math.max(...(hourly.precipitation_probability || [0]));
        if (maxPrecipitation > 80) {
            alerts.push({
                type: 'info',
                message: 'RISC PRECIPITAȚII'
            });
        }
        
        this.displayAlert(alerts[0]); // Show most critical alert
    }
    
    // Display weather alert
    displayAlert(alert) {
        const alertBanner = this.weatherContainer.querySelector('.alert-banner');
        if (!alertBanner) return;
        
        if (alert) {
            alertBanner.textContent = alert.message;
            alertBanner.className = `alert-banner visible ${alert.type}`;
            this.isExpanded = true;
            this.updateExpandedState();
        } else {
            alertBanner.classList.remove('visible');
        }
    }
    
    // Handle weather API errors
    handleWeatherError() {
        if (!this.weatherContainer) return;
        
        // Add error state styling
        this.weatherContainer.classList.add('error-state');
        
        // Update display with error message
        const tempDisplay = this.weatherContainer.querySelector('.temperature-display');
        const conditionText = this.weatherContainer.querySelector('.condition-text');
        
        if (tempDisplay) tempDisplay.textContent = '--°C';
        if (conditionText) conditionText.textContent = 'Eroare conexiune';
        
        // Remove loading skeleton
        const elements = this.weatherContainer.querySelectorAll('.loading-skeleton');
        elements.forEach(el => el.classList.remove('loading-skeleton'));
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
    
    // Make weather alert visible with animation
    showWeatherAlert() {
        if (this.weatherContainer) {
            setTimeout(() => {
                this.weatherContainer.classList.add('visible');
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
    }
}

// Export for use in components.js
window.WeatherAlertSystem = WeatherAlertSystem;
