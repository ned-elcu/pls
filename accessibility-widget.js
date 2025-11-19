// =============================================================================
// ACCESSIBILITY WIDGET v1.0 - Inclusive & Non-Intrusive
// Poliția Locală Slobozia | Production-Ready | Government Standards
// =============================================================================

// === CONFIGURATION ===
const ACCESS_CONFIG = {
    storageKey: 'pls_accessibility_prefs',
    bannerKey: 'pls_accessibility_banner_dismissed',
    bannerDelay: 1000, // Show banner 1s after page load
    toastDuration: 3000,
    animations: {
        gentle: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        duration: 300
    }
};

const ACCESS_TEXT = {
    banner: {
        question: 'Doriți să îmbunătățiți vizibilitatea textului?',
        helpBtn: 'Da, ajută-mă',
        dismissBtn: 'Nu, mulțumesc'
    },
    panel: {
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
        resetBtn: 'Resetează'
    },
    toast: {
        saved: 'Preferințe salvate. Le puteți schimba oricând din Setări → Accesibilitate.',
        reset: 'Preferințele au fost resetate.',
        applied: 'Setările de accesibilitate au fost aplicate.'
    },
    icon: {
        tooltip: 'Setări de accesibilitate',
        ariaLabel: 'Deschide setările de accesibilitate'
    }
};

// === CSS INJECTION ===
function injectAccessibilityCSS() {
    if (document.getElementById('accessibility-widget-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'accessibility-widget-styles';
    style.textContent = `
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
        
        /* === ACCESSIBILITY PANEL === */
        .access-panel {
            position: fixed;
            top: 12rem;
            right: 2rem;
            width: 400px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            z-index: 9997;
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
            pointer-events: none;
            transition: all 350ms cubic-bezier(0.4, 0.0, 0.2, 1);
            overflow: hidden;
        }
        
        .access-panel.show {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }
        
        .access-panel-header {
            background: linear-gradient(135deg, #1a2f5f 0%, #0f1a36 100%);
            color: white;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #ffca28;
        }
        
        .access-panel-title {
            font-size: 1.2rem;
            font-weight: 700;
            letter-spacing: 0.3px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .access-panel-title i {
            font-size: 1.5rem;
        }
        
        .access-panel-close {
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
            transition: all 250ms ease;
        }
        
        .access-panel-close:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: rotate(90deg);
        }
        
        .access-panel-body {
            padding: 1.75rem;
        }
        
        .access-option {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            transition: all 250ms ease;
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
            margin-bottom: 0.5rem;
        }
        
        .access-option-label {
            font-size: 1.05rem;
            font-weight: 600;
            color: #1a2f5f;
        }
        
        .access-option-description {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.5;
        }
        
        /* === TOGGLE SWITCH === */
        .access-toggle {
            position: relative;
            width: 56px;
            height: 28px;
            background: #ccc;
            border-radius: 14px;
            cursor: pointer;
            transition: background 250ms ease;
        }
        
        .access-toggle.active {
            background: #43a047;
        }
        
        .access-toggle::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 22px;
            height: 22px;
            background: white;
            border-radius: 50%;
            transition: transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .access-toggle.active::after {
            transform: translateX(28px);
        }
        
        /* === PANEL BUTTONS === */
        .access-panel-buttons {
            display: flex;
            gap: 0.75rem;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 2px solid #e0e0e0;
        }
        
        .access-panel-btn {
            flex: 1;
            padding: 0.9rem;
            border: none;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 250ms ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .access-panel-btn.primary {
            background: #1a2f5f;
            color: white;
        }
        
        .access-panel-btn.primary:hover {
            background: #0f1a36;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(26, 47, 95, 0.3);
        }
        
        .access-panel-btn.secondary {
            background: #f0f0f0;
            color: #666;
        }
        
        .access-panel-btn.secondary:hover {
            background: #e0e0e0;
        }
        
        /* === FLOATING ICON === */
        .access-float-icon {
            position: fixed;
            bottom: 8rem;
            right: 1rem;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #1a2f5f 0%, #0f1a36 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            z-index: 9996;
            transition: all 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
            border: 3px solid #ffca28;
        }
        
        /* Dynamic positioning when weather widget is present */
        .access-float-icon.weather-active {
            bottom: 14rem;
        }
        
        /* When weather is expanded on mobile */
        .access-float-icon.weather-expanded {
            bottom: 24rem;
        }
        
        .access-float-icon:hover {
            transform: scale(1.1) translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }
        
        .access-float-icon i {
            font-size: 28px;
        }
        
        /* === TOAST NOTIFICATION === */
        .access-toast {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(150%);
            background: #1a2f5f;
            color: white;
            padding: 1rem 1.75rem;
            border-radius: 8px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            max-width: 600px;
            font-size: 0.95rem;
            font-weight: 500;
            text-align: center;
            line-height: 1.5;
            transition: transform 400ms cubic-bezier(0.4, 0.0, 0.2, 1);
            border-left: 4px solid #ffca28;
        }
        
        .access-toast.show {
            transform: translateX(-50%) translateY(0);
        }
        
        /* === BACKDROP === */
        .access-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            z-index: 9995;
            opacity: 0;
            pointer-events: none;
            transition: opacity 300ms ease;
        }
        
        .access-backdrop.show {
            opacity: 1;
            pointer-events: all;
        }
        
        /* === ACCESSIBILITY EFFECTS === */
        /* WCAG AAA Compliant Text Scaling - Minimum 24px base */
        body.access-larger-text {
            font-size: 24px !important;
        }
        
        body.access-larger-text *:not(i):not(.material-icons) {
            font-size: inherit !important;
        }
        
        body.access-larger-text p,
        body.access-larger-text li,
        body.access-larger-text span:not(.material-icons),
        body.access-larger-text a,
        body.access-larger-text div,
        body.access-larger-text td,
        body.access-larger-text th,
        body.access-larger-text label,
        body.access-larger-text input,
        body.access-larger-text textarea,
        body.access-larger-text button {
            font-size: 1em !important;
            line-height: 1.8 !important;
            letter-spacing: 0.02em !important;
        }
        
        body.access-larger-text h1 {
            font-size: 3.25rem !important;
            line-height: 1.3 !important;
        }
        
        body.access-larger-text h2 {
            font-size: 2.75rem !important;
            line-height: 1.4 !important;
        }
        
        body.access-larger-text h3 {
            font-size: 2.25rem !important;
            line-height: 1.5 !important;
        }
        
        body.access-larger-text h4 {
            font-size: 1.85rem !important;
            line-height: 1.5 !important;
        }
        
        body.access-larger-text h5 {
            font-size: 1.5rem !important;
            line-height: 1.5 !important;
        }
        
        body.access-larger-text .main-nav ul li a {
            font-size: 1.15rem !important;
        }
        
        body.access-larger-text .footer-column h3 {
            font-size: 1.75rem !important;
        }
        
        /* Prevent icon scaling */
        body.access-larger-text i.material-icons,
        body.access-larger-text .material-icons {
            font-size: 24px !important;
        }
        
        /* High Contrast Mode - Comprehensive Coverage */
        body.access-high-contrast *:hover:not(.material-icons):not(i):not(.access-float-icon):not(.access-panel):not(.access-panel *):not(.access-banner):not(.access-banner *):not(.access-toast):not(.weather-widget):not(.weather-widget *) {
            background: #000 !important;
            color: #ffca28 !important;
            outline: 3px solid #ffca28 !important;
            outline-offset: 2px;
            border-radius: 4px;
        }
        
        /* Specific elements that need text decoration */
        body.access-high-contrast a:hover,
        body.access-high-contrast button:hover,
        body.access-high-contrast .main-nav ul li a:hover {
            text-decoration: underline !important;
            text-decoration-thickness: 2px !important;
            text-underline-offset: 4px !important;
        }
        
        /* Cards and containers */
        body.access-high-contrast .card:hover,
        body.access-high-contrast .service-card:hover,
        body.access-high-contrast .info-card:hover {
            outline: 4px solid #ffca28 !important;
            outline-offset: 4px;
            box-shadow: 0 0 0 8px rgba(255, 202, 40, 0.3) !important;
        }
        
        /* Prevent Material Icons from getting outline */
        body.access-high-contrast i.material-icons:hover,
        body.access-high-contrast .material-icons:hover {
            background: transparent !important;
            outline: none !important;
        }
        
        /* Ensure parent button/link still gets highlight even if icon is hovered */
        body.access-high-contrast button:hover i.material-icons,
        body.access-high-contrast a:hover i.material-icons {
            color: #ffca28 !important;
            background: transparent !important;
            outline: none !important;
        }
        
        /* === MOBILE RESPONSIVENESS === */
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
            
            .access-panel {
                top: auto;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                border-radius: 16px 16px 0 0;
                transform: translateY(100%);
            }
            
            .access-panel.show {
                transform: translateY(0);
            }
            
            .access-float-icon {
                bottom: 5rem;
                right: 1rem;
                width: 52px;
                height: 52px;
            }
            
            .access-toast {
                bottom: 7rem;
                max-width: calc(100% - 2rem);
                left: 1rem;
                right: 1rem;
                transform: translateX(0) translateY(150%);
            }
            
            .access-toast.show {
                transform: translateX(0) translateY(0);
            }
        }
        
        /* === SMOOTH TRANSITIONS === */
        * {
            transition-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        
        /* === FOCUS STYLES === */
        .access-banner-btn:focus,
        .access-panel-btn:focus,
        .access-panel-close:focus,
        .access-toggle:focus,
        .access-float-icon:focus {
            outline: 3px solid #ffca28;
            outline-offset: 3px;
        }
    `;
    
    document.head.appendChild(style);
}

// === ACCESSIBILITY WIDGET CLASS ===
class AccessibilityWidget {
    constructor() {
        this.preferences = this.loadPreferences();
        this.bannerDismissed = localStorage.getItem(ACCESS_CONFIG.bannerKey) === 'true';
        
        injectAccessibilityCSS();
        
        this.createFloatingIcon();
        this.applyPreferences();
        
        // Show banner if first visit and not dismissed
        if (!this.bannerDismissed && !this.preferences) {
            setTimeout(() => this.showBanner(), ACCESS_CONFIG.bannerDelay);
        }
        
        // If returning user with preferences, show subtle toast
        if (this.preferences && (this.preferences.largerText || this.preferences.highContrast)) {
            setTimeout(() => this.showToast(ACCESS_TEXT.toast.applied), 500);
        }
        
        console.log('✅ Accessibility Widget v1.0 initialized');
        console.log('📊 Current preferences:', this.preferences);
    }
    
    loadPreferences() {
        const stored = localStorage.getItem(ACCESS_CONFIG.storageKey);
        return stored ? JSON.parse(stored) : null;
    }
    
    savePreferences(prefs) {
        localStorage.setItem(ACCESS_CONFIG.storageKey, JSON.stringify(prefs));
        this.preferences = prefs;
    }
    
    createBanner() {
        if (document.querySelector('.access-banner')) return;
        
        const banner = document.createElement('div');
        banner.className = 'access-banner';
        banner.innerHTML = `
            <div class="access-banner-content">
                <div class="access-banner-text">${ACCESS_TEXT.banner.question}</div>
                <div class="access-banner-buttons">
                    <button class="access-banner-btn primary" data-action="help">
                        ${ACCESS_TEXT.banner.helpBtn}
                    </button>
                    <button class="access-banner-btn secondary" data-action="dismiss">
                        ${ACCESS_TEXT.banner.dismissBtn}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Event listeners
        banner.querySelector('[data-action="help"]').addEventListener('click', () => {
            this.hideBanner();
            this.showPanel();
        });
        
        banner.querySelector('[data-action="dismiss"]').addEventListener('click', () => {
            this.hideBanner();
            localStorage.setItem(ACCESS_CONFIG.bannerKey, 'true');
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
    
    createPanel() {
        if (document.querySelector('.access-panel')) return;
        
        const currentPrefs = this.preferences || { largerText: true, highContrast: true };
        
        const backdrop = document.createElement('div');
        backdrop.className = 'access-backdrop';
        
        const panel = document.createElement('div');
        panel.className = 'access-panel';
        panel.innerHTML = `
            <div class="access-panel-header">
                <div class="access-panel-title">
                    <i class="material-icons">symptoms</i>
                    ${ACCESS_TEXT.panel.title}
                </div>
                <button class="access-panel-close" aria-label="Închide panoul">
                    <i class="material-icons">close</i>
                </button>
            </div>
            <div class="access-panel-body">
                <div class="access-option" data-option="largerText">
                    <div class="access-option-header">
                        <div class="access-option-label">${ACCESS_TEXT.panel.largerText.label}</div>
                        <div class="access-toggle ${currentPrefs.largerText ? 'active' : ''}" 
                             role="switch" 
                             aria-checked="${currentPrefs.largerText}"
                             tabindex="0">
                        </div>
                    </div>
                    <div class="access-option-description">${ACCESS_TEXT.panel.largerText.description}</div>
                </div>
                
                <div class="access-option" data-option="highContrast">
                    <div class="access-option-header">
                        <div class="access-option-label">${ACCESS_TEXT.panel.highContrast.label}</div>
                        <div class="access-toggle ${currentPrefs.highContrast ? 'active' : ''}" 
                             role="switch" 
                             aria-checked="${currentPrefs.highContrast}"
                             tabindex="0">
                        </div>
                    </div>
                    <div class="access-option-description">${ACCESS_TEXT.panel.highContrast.description}</div>
                </div>
                
                <div class="access-panel-buttons">
                    <button class="access-panel-btn secondary" data-action="reset">
                        ${ACCESS_TEXT.panel.resetBtn}
                    </button>
                    <button class="access-panel-btn primary" data-action="save">
                        ${ACCESS_TEXT.panel.saveBtn}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(backdrop);
        document.body.appendChild(panel);
        
        // Toggle functionality
        const toggles = panel.querySelectorAll('.access-toggle');
        toggles.forEach(toggle => {
            const option = toggle.closest('.access-option');
            const optionName = option.dataset.option;
            
            const handleToggle = () => {
                toggle.classList.toggle('active');
                const isActive = toggle.classList.contains('active');
                toggle.setAttribute('aria-checked', isActive);
                
                // IMMEDIATE LIVE PREVIEW - Apply changes instantly
                const largerTextToggle = panel.querySelector('[data-option="largerText"] .access-toggle');
                const highContrastToggle = panel.querySelector('[data-option="highContrast"] .access-toggle');
                
                const previewPrefs = {
                    largerText: largerTextToggle.classList.contains('active'),
                    highContrast: highContrastToggle.classList.contains('active')
                };
                
                // Temporarily apply for preview (without saving)
                this.applyPreferencesPreview(previewPrefs);
            };
            
            toggle.addEventListener('click', handleToggle);
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle();
                }
            });
        });
        
        // Close button
        panel.querySelector('.access-panel-close').addEventListener('click', () => {
            this.hidePanel();
        });
        
        // Backdrop click
        backdrop.addEventListener('click', () => {
            this.hidePanel();
        });
        
        // Save button
        panel.querySelector('[data-action="save"]').addEventListener('click', () => {
            const largerTextToggle = panel.querySelector('[data-option="largerText"] .access-toggle');
            const highContrastToggle = panel.querySelector('[data-option="highContrast"] .access-toggle');
            
            const newPrefs = {
                largerText: largerTextToggle.classList.contains('active'),
                highContrast: highContrastToggle.classList.contains('active')
            };
            
            this.savePreferences(newPrefs);
            this.applyPreferences();
            this.hidePanel();
            this.showToast(ACCESS_TEXT.toast.saved);
        });
        
        // Reset button
        panel.querySelector('[data-action="reset"]').addEventListener('click', () => {
            localStorage.removeItem(ACCESS_CONFIG.storageKey);
            this.preferences = null;
            this.applyPreferences();
            this.hidePanel();
            this.showToast(ACCESS_TEXT.toast.reset);
        });
        
        return { panel, backdrop };
    }
    
    showPanel() {
        const existing = document.querySelector('.access-panel');
        if (existing) {
            existing.classList.add('show');
            document.querySelector('.access-backdrop')?.classList.add('show');
            return;
        }
        
        const { panel, backdrop } = this.createPanel();
        setTimeout(() => {
            panel.classList.add('show');
            backdrop.classList.add('show');
        }, 50);
    }
    
    hidePanel() {
        const panel = document.querySelector('.access-panel');
        const backdrop = document.querySelector('.access-backdrop');
        
        if (panel) panel.classList.remove('show');
        if (backdrop) backdrop.classList.remove('show');
    }
    
    createFloatingIcon() {
        if (document.querySelector('.access-float-icon')) return;
        
        const icon = document.createElement('div');
        icon.className = 'access-float-icon';
        icon.setAttribute('role', 'button');
        icon.setAttribute('aria-label', ACCESS_TEXT.icon.ariaLabel);
        icon.setAttribute('title', ACCESS_TEXT.icon.tooltip);
        icon.setAttribute('tabindex', '0');
        icon.innerHTML = '<i class="material-icons">symptoms</i>';
        
        icon.addEventListener('click', () => {
            const panel = document.querySelector('.access-panel');
            if (panel && panel.classList.contains('show')) {
                this.hidePanel();
            } else {
                this.showPanel();
            }
        });
        icon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const panel = document.querySelector('.access-panel');
                if (panel && panel.classList.contains('show')) {
                    this.hidePanel();
                } else {
                    this.showPanel();
                }
            }
        });
        
        document.body.appendChild(icon);
        
        // Monitor weather widget for dynamic positioning
        this.monitorWeatherWidget();
    }
    
    monitorWeatherWidget() {
        const icon = document.querySelector('.access-float-icon');
        if (!icon) return;
        
        let isUpdating = false; // Prevent infinite loop
        
        // Check for weather widget presence and state
        const checkWeatherPosition = () => {
            // Prevent recursive calls
            if (isUpdating) return;
            isUpdating = true;
            
            const weatherWidget = document.querySelector('.weather-widget');
            
            if (!weatherWidget) {
                // No weather widget - default position
                icon.classList.remove('weather-active', 'weather-expanded');
            } else {
                // Weather widget exists
                icon.classList.add('weather-active');
                
                // Check if expanded
                const isExpanded = weatherWidget.classList.contains('expanded');
                if (isExpanded) {
                    icon.classList.add('weather-expanded');
                } else {
                    icon.classList.remove('weather-expanded');
                }
            }
            
            // Allow next update after a small delay
            setTimeout(() => {
                isUpdating = false;
            }, 50);
        };
        
        // Initial check
        checkWeatherPosition();
        
        // Monitor ONLY for weather widget changes, not entire DOM
        const observer = new MutationObserver((mutations) => {
            // Only react to changes that might affect weather widget
            let shouldCheck = false;
            
            for (const mutation of mutations) {
                // Check if mutation involves weather widget specifically
                if (mutation.type === 'childList') {
                    // Check if weather widget was added/removed
                    const addedWidget = Array.from(mutation.addedNodes).some(
                        node => node.classList && node.classList.contains('weather-widget')
                    );
                    const removedWidget = Array.from(mutation.removedNodes).some(
                        node => node.classList && node.classList.contains('weather-widget')
                    );
                    
                    if (addedWidget || removedWidget) {
                        shouldCheck = true;
                        break;
                    }
                } else if (mutation.type === 'attributes') {
                    // Only check if the weather widget's class changed
                    if (mutation.target.classList && 
                        mutation.target.classList.contains('weather-widget')) {
                        shouldCheck = true;
                        break;
                    }
                }
            }
            
            if (shouldCheck) {
                checkWeatherPosition();
            }
        });
        
        // Watch ONLY document.body for direct children changes (less aggressive)
        observer.observe(document.body, {
            childList: true,     // Watch for weather widget add/remove
            subtree: false,      // Don't watch entire DOM tree (CRITICAL FIX)
            attributes: false    // Don't watch all attributes
        });
        
        // Separately watch weather widget specifically if it exists
        const weatherWidget = document.querySelector('.weather-widget');
        if (weatherWidget) {
            const widgetObserver = new MutationObserver(() => {
                checkWeatherPosition();
            });
            
            widgetObserver.observe(weatherWidget, {
                attributes: true,
                attributeFilter: ['class'] // Only watch class changes on weather widget
            });
            
            this.weatherWidgetObserver = widgetObserver;
        }
        
        // Store observer for cleanup if needed
        this.weatherObserver = observer;
    }
    
    showToast(message) {
        const existing = document.querySelector('.access-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'access-toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, ACCESS_CONFIG.toastDuration);
    }
    
    applyPreferencesPreview(prefs) {
        const body = document.body;
        
        // Remove all accessibility classes
        body.classList.remove('access-larger-text', 'access-high-contrast');
        
        if (prefs) {
            if (prefs.largerText) {
                body.classList.add('access-larger-text');
            }
            
            if (prefs.highContrast) {
                body.classList.add('access-high-contrast');
            }
        }
        
        console.log('♿ Preview applied:', prefs);
    }
    
    applyPreferences() {
        const body = document.body;
        
        // Remove all accessibility classes
        body.classList.remove('access-larger-text', 'access-high-contrast');
        
        if (this.preferences) {
            if (this.preferences.largerText) {
                body.classList.add('access-larger-text');
            }
            
            if (this.preferences.highContrast) {
                body.classList.add('access-high-contrast');
            }
        }
        
        console.log('♿ Preferences applied:', this.preferences);
    }
}

// === AUTO-INITIALIZATION ===
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.accessibilityWidget = new AccessibilityWidget();
    });
} else {
    window.accessibilityWidget = new AccessibilityWidget();
}

console.log('✅ Accessibility Widget v1.0 loaded');
console.log('♿ Inclusive design | Non-intrusive | Government standards');
