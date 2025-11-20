// =============================================================================
// ACCESSIBILITY WIDGET v1.3 - Inclusive & Non-Intrusive
// Poliția Locală Slobozia | Production-Ready | Government Standards
// Updated: Removed Unstable Weather Widget Interaction
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
            description: 'Mărește textul inteligent pentru citire ușoară'
        },
        highContrast: {
            label: 'Mod Focus (Contrast)',
            description: 'Evidențiază paragrafele și titlurile la trecerea mouse-ului'
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
        /* Import Material Symbols font */
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        
        /* =========================================
           1. ROBUST TEXT SCALING (Fixes Mobile Breakage)
           ========================================= */
        
        /* DESKTOP: Scale everything up by 25% relatively */
        body.access-larger-text {
            font-size: 125% !important; 
            line-height: 1.6 !important;
        }

        /* MOBILE: Cap the scaling to avoid breaking layout */
        @media (max-width: 768px) {
            body.access-larger-text {
                font-size: 115% !important; /* Smaller bump for mobile */
                line-height: 1.5 !important;
            }
        }

        /* Prevent layout explosions on fixed-height elements */
        body.access-larger-text .material-icons,
        body.access-larger-text .material-symbols-outlined,
        body.access-larger-text i {
            font-size: 1.2em !important; 
            vertical-align: middle;
        }

        /* =========================================
           2. INTELLIGENT HIGH CONTRAST (Focus Mode)
           ========================================= */
        
        :root {
            --hc-highlight-bg: #ffff00; /* Bright Yellow */
            --hc-highlight-text: #000000; /* Pure Black */
            --hc-outline: #000000;
        }

        /* DEFINE READABLE CONTENT: Targets only text blocks, avoiding "Blackout" of containers */
        body.access-high-contrast :is(p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, cite, caption, legend, label, input, textarea) {
            transition: all 0.1s ease !important;
        }

        /* THE HOVER EFFECT: "Pop" the text out */
        body.access-high-contrast :is(p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, legend, label):hover {
            background-color: var(--hc-highlight-bg) !important;
            color: var(--hc-highlight-text) !important;
            
            /* Create a solid box around the text */
            outline: 4px solid var(--hc-highlight-bg) !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
            border-radius: 4px !important;
            
            /* VITAL: Bring this element to the front so it covers neighbors */
            position: relative !important; 
            z-index: 10000 !important;
            cursor: help; 
        }

        /* Handle Interactive Elements (Buttons/Links) in High Contrast */
        body.access-high-contrast a:hover,
        body.access-high-contrast button:hover,
        body.access-high-contrast [role="button"]:hover {
            background-color: #000000 !important;
            color: #ffff00 !important;
            outline: 3px solid #ffff00 !important;
            z-index: 10001 !important;
            position: relative !important;
            text-decoration: underline !important;
        }

        /* Links INSIDE highlighted paragraphs need to be readable */
        body.access-high-contrast :is(p, li, td) a {
            text-decoration: underline !important;
            font-weight: bold !important;
            color: inherit !important; /* Inherit black from the parent hover */
        }

        /* Image handling - Slight filter to reduce glare, border for definition */
        body.access-high-contrast img {
            filter: contrast(110%);
            border: 2px solid #ffff00;
        }

        /* EXCLUSIONS: Protect the widget UI from being affected by High Contrast */
        .access-panel, .access-panel *, 
        .access-banner, .access-banner *, 
        .access-float-icon, .access-float-icon * {
            font-size: initial !important; /* Reset size for widget */
            line-height: initial !important;
            background-color: inherit;
            color: inherit;
            outline: inherit;
            z-index: auto;
        }
        
        /* Explicit Widget Z-Indices (Always on top of High Contrast content) */
        .access-banner { z-index: 100002 !important; }
        .access-panel { z-index: 100002 !important; }
        .access-float-icon { z-index: 100001 !important; }
        .access-toast { z-index: 100003 !important; }

        /* =========================================
           3. WIDGET UI STYLES
           ========================================= */
        
        /* GLOBAL SMOOTHING (Restored from original) */
        .access-banner *, .access-panel *, .access-float-icon {
            transition-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        /* KEYBOARD FOCUS STATES (Restored from original) */
        .access-banner-btn:focus,
        .access-panel-btn:focus,
        .access-panel-close:focus,
        .access-toggle:focus,
        .access-float-icon:focus {
            outline: 3px solid #ffca28;
            outline-offset: 3px;
        }

        /* BANNER */
        .access-banner {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: linear-gradient(135deg, #1a2f5f 0%, #0f1a36 100%);
            color: white;
            padding: 1.25rem 2rem;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
            transform: translateY(100%);
            transition: transform 400ms cubic-bezier(0.4, 0.0, 0.2, 1);
            border-top: 3px solid #ffca28;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .access-banner.show { transform: translateY(0); }
        
        .access-banner-content {
            max-width: 1200px; margin: 0 auto;
            display: flex; align-items: center; justify-content: space-between; gap: 2rem;
        }
        .access-banner-text { flex: 1; font-size: 1.05rem; font-weight: 500; }
        .access-banner-buttons { display: flex; gap: 1rem; flex-shrink: 0; }
        
        .access-banner-btn {
            padding: 0.75rem 1.75rem; border: none; border-radius: 6px;
            font-size: 0.95rem; font-weight: 600; cursor: pointer;
            text-transform: uppercase; white-space: nowrap;
            transition: all 0.2s ease;
        }
        .access-banner-btn.primary { background: #ffca28; color: #0f1a36; }
        .access-banner-btn.secondary { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); }

        /* PANEL */
        .access-panel {
            position: fixed; top: 12rem; right: 2rem; width: 400px;
            background: white; border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            opacity: 0; transform: translateY(-20px) scale(0.95);
            pointer-events: none; transition: all 350ms cubic-bezier(0.4, 0.0, 0.2, 1);
            overflow: hidden; font-family: 'Segoe UI', Roboto, sans-serif;
        }
        .access-panel.show { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }
        
        .access-panel-header {
            background: linear-gradient(135deg, #1a2f5f 0%, #0f1a36 100%);
            color: white; padding: 1.5rem;
            display: flex; align-items: center; justify-content: space-between;
            border-bottom: 3px solid #ffca28;
        }
        .access-panel-title { font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; gap: 0.75rem; }
        
        .access-panel-close {
            background: rgba(255,255,255,0.1); border: none; color: white;
            width: 32px; height: 32px; border-radius: 50%;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        
        .access-panel-body { padding: 1.75rem; }
        
        .access-option {
            background: #f8f9fa; border-radius: 10px; padding: 1.25rem;
            margin-bottom: 1rem; border: 2px solid transparent;
        }
        .access-option:hover { background: #f0f2f5; border-color: #e0e0e0; }
        
        .access-option-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
        .access-option-label { font-size: 1.05rem; font-weight: 600; color: #1a2f5f; }
        .access-option-description { font-size: 0.9rem; color: #666; line-height: 1.5; }
        
        /* TOGGLE SWITCH */
        .access-toggle {
            position: relative; width: 56px; height: 28px;
            background: #ccc; border-radius: 14px; cursor: pointer;
            transition: background 250ms ease;
        }
        .access-toggle.active { background: #43a047; }
        .access-toggle::after {
            content: ''; position: absolute; top: 3px; left: 3px;
            width: 22px; height: 22px; background: white; border-radius: 50%;
            transition: transform 250ms; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .access-toggle.active::after { transform: translateX(28px); }
        
        /* PANEL BUTTONS */
        .access-panel-buttons { display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid #e0e0e0; }
        .access-panel-btn {
            flex: 1; padding: 0.9rem; border: none; border-radius: 8px;
            font-size: 0.95rem; font-weight: 600; cursor: pointer;
            text-transform: uppercase;
        }
        .access-panel-btn.primary { background: #1a2f5f; color: white; }
        .access-panel-btn.secondary { background: #f0f0f0; color: #666; }

        /* FLOATING ICON */
        .access-float-icon {
            position: fixed; bottom: 8rem; right: 1rem;
            width: 56px; height: 56px;
            background: linear-gradient(135deg, #1a2f5f 0%, #0f1a36 100%);
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: white; cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            border: 3px solid #ffca28;
            transition: all 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        .access-float-icon:hover { transform: scale(1.1) translateY(-2px); }

        /* TOAST */
        .access-toast {
            position: fixed; bottom: 2rem; left: 50%;
            transform: translateX(-50%) translateY(150%);
            background: #1a2f5f; color: white; padding: 1rem 1.75rem;
            border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            max-width: 600px; border-left: 4px solid #ffca28;
            text-align: center;
        }
        .access-toast.show { transform: translateX(-50%) translateY(0); }
        
        /* BACKDROP */
        .access-backdrop {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.3); z-index: 100001;
            opacity: 0; pointer-events: none; transition: opacity 300ms ease;
        }
        .access-backdrop.show { opacity: 1; pointer-events: all; }

        /* MOBILE RESPONSIVENESS */
        @media (max-width: 768px) {
            .access-banner { padding: 1rem; }
            .access-banner-content { flex-direction: column; text-align: center; gap: 1rem; }
            .access-banner-buttons { width: 100%; flex-direction: column; }
            .access-banner-btn { width: 100%; }
            
            .access-panel {
                top: auto; bottom: 0; left: 0; right: 0;
                width: 100%; border-radius: 16px 16px 0 0;
                transform: translateY(100%);
            }
            .access-panel.show { transform: translateY(0); }
            
            .access-float-icon { bottom: 5rem; width: 52px; height: 52px; }
            .access-toast { width: 90%; bottom: 6rem; }
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
        
        console.log('✅ Accessibility Widget v1.3 initialized');
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
        
        const currentPrefs = this.preferences || { largerText: false, highContrast: false };
        
        const backdrop = document.createElement('div');
        backdrop.className = 'access-backdrop';
        
        const panel = document.createElement('div');
        panel.className = 'access-panel';
        panel.innerHTML = `
            <div class="access-panel-header">
                <div class="access-panel-title">
                    <span class="material-symbols-outlined">symptoms</span>
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
        
        // Revert to saved preferences if user cancels without saving
        this.applyPreferences();
        
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
        icon.innerHTML = '<span class="material-symbols-outlined">symptoms</span>';
        
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

console.log('✅ Accessibility Widget v1.3 loaded');
console.log('♿ Inclusive design | Non-intrusive | Government standards');
