document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Components.js initialization started');
    
    try {
        // Favicon
        if (!document.querySelector('link[rel="icon"]')) {
            const faviconLink = document.createElement('link');
            faviconLink.rel = "icon";
            faviconLink.href = "https://images4.imagebam.com/12/a5/89/ME11HXQJ_o.png";
            faviconLink.type = "image/png";
            document.head.appendChild(faviconLink);
            console.log('✅ Favicon loaded');
        }

        // CSS
        if (!document.getElementById('components-css')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'components-css';
            styleEl.textContent = COMPONENTS_CSS;
            document.head.appendChild(styleEl);
            console.log('✅ Component styles loaded');
        }
        
        // Material Icons
        if (!document.querySelector('link[href*="material-icons"]')) {
            const iconLink = document.createElement('link');
            iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
            iconLink.rel = "stylesheet";
            document.head.appendChild(iconLink);
            console.log('✅ Material Icons loaded');
        }
        
        // === UNIFIED CITIZEN WIDGET (replaces weather + accessibility) ===
        try {
            loadUnifiedCitizenWidget();
        } catch (error) {
            console.error('⚠️ Unified citizen widget error:', error);
            console.log('   Site will continue without weather and accessibility widgets');
        }
        
        // Header & Footer
        const headerContainer = document.getElementById('header-container');
        const footerContainer = document.getElementById('footer-container');
        
        if (headerContainer) {
            headerContainer.innerHTML = HEADER_HTML;
            console.log('✅ Header loaded');
        }
        if (footerContainer) {
            footerContainer.innerHTML = FOOTER_HTML;
            console.log('✅ Footer loaded');
        }
        
        // Initialize all components
        initializeComponents();
        console.log('✅ All components initialized');
        
    } catch (error) {
        console.error('❌ CRITICAL ERROR in components initialization:', error);
        console.error('   Stack trace:', error.stack);
        
        // EMERGENCY: Force remove intro screen even if everything fails
        const introScreen = document.getElementById('intro-screen');
        if (introScreen) {
            console.log('🚨 Emergency intro screen removal');
            introScreen.style.display = 'none';
            introScreen.remove();
        }
    }
});

function initializeComponents() {
    console.log('🔧 Initializing components...');
    
    try {
        initIntroScreen();
        console.log('  ✓ Intro screen initialized');
    } catch (error) {
        console.error('  ✗ Intro screen error:', error);
    }
    
    try {
        initHeaderEffects();
        console.log('  ✓ Header effects initialized');
    } catch (error) {
        console.error('  ✗ Header effects error:', error);
    }
    
    try {
        initMobileMenu();
        console.log('  ✓ Mobile menu initialized');
    } catch (error) {
        console.error('  ✗ Mobile menu error:', error);
    }
    
    try {
        initDropdownMenu();
        console.log('  ✓ Dropdown menu initialized');
    } catch (error) {
        console.error('  ✗ Dropdown menu error:', error);
    }
    
    try {
        initResponsiveHeader();
        console.log('  ✓ Responsive header initialized');
    } catch (error) {
        console.error('  ✗ Responsive header error:', error);
    }
    
    try {
        fixIconAlignment();
        console.log('  ✓ Icon alignment fixed');
    } catch (error) {
        console.error('  ✗ Icon alignment error:', error);
    }
    
    try {
        initNewsletterForm();
        console.log('  ✓ Newsletter form initialized');
    } catch (error) {
        console.error('  ✗ Newsletter form error:', error);
    }
    
    console.log('✅ Component initialization complete');
}

function initIntroScreen() {
    const introScreen = document.getElementById('intro-screen');
    if (!introScreen) {
        console.log('ℹ️ No intro screen found');
        return;
    }
    
    // CRITICAL: Guarantee intro screen removal even if scripts fail
    const removeIntro = () => {
        if (introScreen && introScreen.style.display !== 'none') {
            console.log('✅ Removing intro screen');
            introScreen.style.opacity = '0';
            setTimeout(() => {
                introScreen.style.display = 'none';
                introScreen.remove(); // Completely remove from DOM
            }, 500);
        }
    };
    
    // Primary removal after 3 seconds
    setTimeout(removeIntro, 3000);
    
    // FAILSAFE: Force removal after 5 seconds no matter what
    setTimeout(() => {
        if (introScreen && introScreen.style.display !== 'none') {
            console.warn('⚠️ Intro screen forced removal (failsafe triggered)');
            introScreen.style.display = 'none';
            introScreen.remove();
        }
    }, 5000);
}

function initHeaderEffects() {
    const headerTop = document.getElementById('header-top');
    const headerMain = document.getElementById('header-main');
    
    if (headerTop && headerMain) {
        if (window.scrollY > 50) {
            headerTop.classList.add('scrolled');
            headerMain.classList.add('scrolled');
        }
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                headerTop.classList.add('scrolled');
                headerMain.classList.add('scrolled');
            } else {
                headerTop.classList.remove('scrolled');
                headerMain.classList.remove('scrolled');
            }
        });
    }
}

function initMobileMenu() {
    const hamburger = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('main-nav');
    const closeBtn = document.getElementById('mobile-menu-close-btn');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    
    // Validate all elements exist
    if (!hamburger || !menu || !backdrop) {
        console.error('Mobile menu: Required elements missing');
        return;
    }
    
    let isOpen = false;
    
    // === CORE FUNCTIONS ===
    
    const openMenu = () => {
        isOpen = true;
        menu.classList.add('active');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.innerHTML = '<i class="material-icons">close</i>';
    };
    
    const closeMenu = () => {
        isOpen = false;
        menu.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = '<i class="material-icons">menu</i>';
        
        // Auto-close all dropdowns when menu closes
        document.querySelectorAll('.main-nav .has-dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    };
    
    // === EVENT HANDLERS ===
    
    // Hamburger click
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isOpen ? closeMenu() : openMenu();
    });
    
    // Close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
        });
    }
    
    // Backdrop click
    backdrop.addEventListener('click', closeMenu);
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeMenu();
        }
    });
    
    // Smart link handling
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Only apply mobile logic on mobile devices
            if (window.innerWidth > 992) return;
            
            const parentLi = link.closest('li');
            const isDropdownParent = parentLi?.classList.contains('has-dropdown');
            const isMainDropdownLink = isDropdownParent && link.parentElement === parentLi;
            
            if (isMainDropdownLink) {
                // Dropdown parent clicked - toggle accordion
                e.preventDefault();
                e.stopPropagation();
                
                // Store the position of the clicked element before toggle
                const linkRect = link.getBoundingClientRect();
                const menuScrollTop = menu.scrollTop;
                const isCurrentlyActive = parentLi.classList.contains('active');
                
                // Close other dropdowns
                document.querySelectorAll('.main-nav .has-dropdown').forEach(item => {
                    if (item !== parentLi) item.classList.remove('active');
                });
                
                // Toggle this dropdown
                parentLi.classList.toggle('active');
                
                // If we just OPENED the dropdown, scroll to keep header visible
                if (!isCurrentlyActive) {
                    // Wait for the dropdown animation to start
                    setTimeout(() => {
                        // Calculate where the link is now after expansion
                        const newLinkRect = link.getBoundingClientRect();
                        
                        // If the link got pushed up (negative movement), scroll to compensate
                        if (newLinkRect.top < linkRect.top) {
                            const scrollOffset = linkRect.top - newLinkRect.top;
                            menu.scrollTo({
                                top: menuScrollTop - scrollOffset + 16, // +16 for padding
                                behavior: 'smooth'
                            });
                        }
                    }, 50);
                }
            } else if (link.closest('.dropdown-menu') || !isDropdownParent) {
                // Regular link or dropdown child - close menu after short delay
                setTimeout(closeMenu, 150);
            }
        });
    });
    
    // Window resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 992 && isOpen) {
                closeMenu();
            }
        }, 100);
    });
}

function initDropdownMenu() {
    const dropdownItems = document.querySelectorAll('.main-nav .has-dropdown');
    
    dropdownItems.forEach(item => {
        const link = item.querySelector('a');
        const dropdownIcon = item.querySelector('.dropdown-icon');
        
        // Handle clicks on mobile
        const handleClick = function(e) {
            if (window.innerWidth <= 992) {
                // Only toggle if clicking the parent link or dropdown icon
                if (e.target === link || 
                    e.target === dropdownIcon || 
                    link.contains(e.target) && !e.target.closest('.dropdown-menu')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Store position before toggle
                    const linkRect = link.getBoundingClientRect();
                    const menu = document.getElementById('main-nav');
                    const menuScrollTop = menu ? menu.scrollTop : 0;
                    const isCurrentlyActive = item.classList.contains('active');
                    
                    // Close other dropdowns
                    dropdownItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Toggle current dropdown
                    item.classList.toggle('active');
                    
                    // If we just OPENED the dropdown, scroll to keep header visible
                    if (!isCurrentlyActive && menu) {
                        setTimeout(() => {
                            const newLinkRect = link.getBoundingClientRect();
                            
                            // If link moved up, adjust scroll
                            if (newLinkRect.top < linkRect.top) {
                                const scrollOffset = linkRect.top - newLinkRect.top;
                                menu.scrollTo({
                                    top: menuScrollTop - scrollOffset + 16,
                                    behavior: 'smooth'
                                });
                            }
                        }, 50);
                    }
                }
            }
        };
        
        // Add click event
        link.addEventListener('click', handleClick);
        
        // Add touch event for better mobile responsiveness
        link.addEventListener('touchend', function(e) {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                handleClick(e);
            }
        }, { passive: false });
    });
    
    // Close dropdowns on window resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            dropdownItems.forEach(item => {
                item.classList.remove('active');
            });
            
            const mainNav = document.getElementById('main-nav');
            const backdrop = document.getElementById('mobile-menu-backdrop');
            if (mainNav) {
                mainNav.classList.remove('active');
            }
            if (backdrop) {
                backdrop.classList.remove('active');
            }
            document.body.style.overflow = '';
            
            const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            if (mobileMenuToggle) {
                mobileMenuToggle.innerHTML = '<i class="material-icons">menu</i>';
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });
}

function initResponsiveHeader() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupResponsiveHeader);
    } else {
        setupResponsiveHeader();
    }
    
    function setupResponsiveHeader() {
        const applyResponsiveClasses = () => {
            const screenWidth = window.innerWidth;
            
            const optionalTextItems = document.querySelectorAll('.main-nav ul li a .menu-text-optional');
            const iconOnlySmallItems = document.querySelectorAll('.main-nav ul li a.icon-only-small');
            
            if (screenWidth <= 1366 && screenWidth > 992) {
                optionalTextItems.forEach(item => {
                    item.style.display = 'none';
                });
                
                iconOnlySmallItems.forEach(item => {
                    item.classList.add('icon-only');
                });
            } else if (screenWidth > 1366) {
                optionalTextItems.forEach(item => {
                    item.style.display = 'inline';
                });
                
                iconOnlySmallItems.forEach(item => {
                    item.classList.remove('icon-only');
                });
            }
            
            if (screenWidth <= 1199 && screenWidth > 992) {
                createOverflowMenu();
            } else {
                const overflowMenu = document.querySelector('.overflow-menu-item');
                if (overflowMenu) {
                    overflowMenu.style.display = 'none';
                }
                
                const lowPriorityItems = document.querySelectorAll('.main-nav ul li.low-priority');
                lowPriorityItems.forEach(item => {
                    item.style.display = 'flex';
                });
            }
        };
        
        const createOverflowMenu = () => {
            let overflowMenu = document.querySelector('.overflow-menu-item');
            
            if (!overflowMenu) {
                const mainNav = document.querySelector('.main-nav ul');
                if (!mainNav) return;
                
                overflowMenu = document.createElement('li');
                overflowMenu.className = 'has-dropdown overflow-menu-item';
                
                const overflowLink = document.createElement('a');
                overflowLink.href = '#';
                overflowLink.setAttribute('data-tooltip', 'Mai mult');
                
                const moreIcon = document.createElement('i');
                moreIcon.className = 'material-icons menu-icon';
                moreIcon.textContent = 'more_horiz';
                
                const moreText = document.createElement('span');
                moreText.className = 'menu-text';
                moreText.textContent = 'Mai mult';
                
                const dropdownIcon = document.createElement('i');
                dropdownIcon.className = 'material-icons dropdown-icon';
                dropdownIcon.textContent = 'keyboard_arrow_down';
                
                overflowLink.appendChild(moreIcon);
                overflowLink.appendChild(moreText);
                overflowLink.appendChild(dropdownIcon);
                overflowMenu.appendChild(overflowLink);
                
                const dropdownMenu = document.createElement('ul');
                dropdownMenu.className = 'dropdown-menu';
                overflowMenu.appendChild(dropdownMenu);
                
                mainNav.appendChild(overflowMenu);
                updateOverflowMenuItems();
            } else {
                overflowMenu.style.display = 'flex';
                updateOverflowMenuItems();
            }
            
            const lowPriorityItems = document.querySelectorAll('.main-nav ul li.low-priority');
            lowPriorityItems.forEach(item => {
                item.style.display = 'none';
            });
        };
        
        const updateOverflowMenuItems = () => {
            const overflowMenu = document.querySelector('.overflow-menu-item');
            if (!overflowMenu) return;
            
            const dropdownMenu = overflowMenu.querySelector('.dropdown-menu');
            if (!dropdownMenu) return;
            
            dropdownMenu.innerHTML = '';
            
            const lowPriorityItems = document.querySelectorAll('.main-nav ul li.low-priority');
            lowPriorityItems.forEach(item => {
                const clonedItem = item.cloneNode(true);
                clonedItem.classList.remove('low-priority');
                
                const optionalText = clonedItem.querySelector('.menu-text-optional');
                if (optionalText) {
                    optionalText.style.display = 'inline';
                }
                
                dropdownMenu.appendChild(clonedItem);
            });
        };
        
        applyResponsiveClasses();
        
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(applyResponsiveClasses, 100);
        });
    }
}

function fixIconAlignment() {
    setTimeout(function() {
        const menuIcons = document.querySelectorAll('.menu-icon, .dropdown-icon, .dropdown-icon-item');
        
        if (menuIcons.length > 0) {
            menuIcons.forEach(icon => {
                if (icon.classList.contains('menu-icon') || icon.classList.contains('dropdown-icon')) {
                    icon.style.display = 'inline-flex';
                    icon.style.alignItems = 'center';
                    icon.style.justifyContent = 'center';
                    icon.style.position = 'relative';
                    icon.style.top = '2px';
                }
            });
        }
        
        const menuItems = document.querySelectorAll('.main-nav ul li a');
        if (menuItems.length > 0) {
            menuItems.forEach(item => {
                item.style.display = 'inline-flex';
                item.style.alignItems = 'center';
                item.style.height = '45px';
            });
        }
        
        const dropdownItems = document.querySelectorAll('.dropdown-menu li a');
        if (dropdownItems.length > 0) {
            dropdownItems.forEach(item => {
                const icon = item.querySelector('.dropdown-icon-item');
                if (icon) {
                    icon.style.display = 'inline-flex';
                    icon.style.alignItems = 'center';
                    icon.style.position = 'relative';
                    icon.style.top = '2px';
                }
            });
        }
    }, 100);
}

// FORMSPREE NEWSLETTER INTEGRATION - Configured and ready
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    const messageDiv = document.getElementById('newsletter-message');
    
    if (!form) {
        console.error('Newsletter form not found');
        return;
    }
    
    // Your Formspree endpoint
    const FORMSPREE_URL = 'https://formspree.io/f/mblwrrbj';
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Validate email
        if (!email || !emailInput.validity.valid) {
            messageDiv.className = 'newsletter-message error';
            messageDiv.textContent = '✗ Te rugăm să introduci o adresă de email validă.';
            return;
        }
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Se trimite...';
        
        // Hide any previous messages
        messageDiv.className = 'newsletter-message';
        messageDiv.textContent = '';
        
        try {
            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    _subject: 'New Newsletter Subscription - PLS'
                })
            });
            
            if (response.ok) {
                // Show success message
                messageDiv.className = 'newsletter-message success';
                messageDiv.textContent = '✓ Mulțumim! Te-ai abonat cu succes la newsletter!';
                
                // Clear the form
                form.reset();
            } else {
                throw new Error('Submission failed');
            }
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            
            // Show error message
            messageDiv.className = 'newsletter-message error';
            messageDiv.textContent = '✗ A apărut o eroare. Te rugăm să încerci din nou.';
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = 'Abonează-te';
            
            // Hide message after 5 seconds
            setTimeout(() => {
                messageDiv.className = 'newsletter-message';
                messageDiv.textContent = '';
            }, 5000);
        }
    });
    
    // Email validation on input
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            if (this.validity.valid) {
                this.style.borderColor = '';
            } else {
                this.style.borderColor = '#e53935';
            }
        });
    }
}

console.log('✅ Components.js v1.0 loaded - Unified widget integration active');// COMPONENTS.JS - Enhanced version with search disabled, bigger text, and UNIFIED CITIZEN WIDGET
// Simply include this file in your HTML pages to automatically load the header, footer, and unified widget

// CSS for header and footer as a string
const COMPONENTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap');

:root {
    --primary-color: #1a2f5f;
    --primary-dark: #0f1a36;
    --secondary-color: #1e88e5;
    --secondary-light: #4dabf5;
    --accent-color: #ffca28;
    --accent-dark: #f5a623;
    --success-color: #43a047;
    --danger-color: #e53935;
    --text-primary: #212121;
    --text-secondary: #424242;
    --text-light: #f5f5f5;
    --background-light: #f8f9fa;
    --background-dark: #121a2b;
    --header-height: 140px;
    --transition-fast: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    --transition-medium: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    --transition-slow: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
    --shadow-small: 0 2px 4px rgba(0,0,0,0.1);
    --shadow-medium: 0 5px 15px rgba(0,0,0,0.1);
    --shadow-large: 0 10px 25px rgba(0,0,0,0.15);
    --border-radius-small: 4px;
    --border-radius-medium: 8px;
    --border-radius-large: 12px;
    
    /* Menu group colors */
    --menu-group-1: rgba(30, 136, 229, 0.03);
    --menu-group-2: rgba(255, 202, 40, 0.03);
    --menu-group-3: rgba(67, 160, 71, 0.03);
}

/* Intro Screen */
.intro-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--primary-dark);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.5s ease;
}

.intro-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.intro-badge {
    width: 200px;
    height: 232px;
    margin-bottom: 2rem;
    opacity: 0;
    transform: scale(0.8);
    animation: badgeIntro 1.5s forwards;
}

@keyframes badgeIntro {
    0% {
        opacity: 0;
        transform: scale(0.8) rotateY(90deg);
    }
    70% {
        opacity: 1;
        transform: scale(1.1) rotateY(0deg);
    }
    100% {
        opacity: 1;
        transform: scale(1) rotateY(0deg);
    }
}

.intro-title {
    color: white;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s 0.8s forwards;
}

.intro-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s 1s forwards;
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.intro-loader {
    width: 200px;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
    margin-bottom: 1rem;
    opacity: 0;
    animation: fadeIn 0.5s 1.2s forwards;
}

.intro-loader-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0;
    background-color: var(--accent-color);
    animation: loading 2.5s ease-in-out forwards;
}

@keyframes loading {
    0% {
        width: 0;
    }
    20% {
        width: 20%;
    }
    50% {
        width: 60%;
    }
    80% {
        width: 85%;
    }
    100% {
        width: 100%;
    }
}

.intro-message {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    opacity: 0;
    animation: fadeIn 0.5s 1.2s forwards;
}

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

/* Header Styles */
.header-container {
    position: fixed;
    width: 100%;
    z-index: 1000;
    transition: var(--transition-fast);
    top: 0;
}

.header-top {
    background-color: var(--primary-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 3rem;
    transition: background-color 0.3s ease;
    position: relative;
    overflow: hidden;
}

.header-top::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('/api/placeholder/1920/100') center/cover;
    opacity: 0.1;
    z-index: 0;
}

.header-top.scrolled {
    background-color: var(--primary-dark);
}

.logo {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
}

.logo-badge {
    width: 60px;
    height: 68px;
    margin-right: 1.2rem;
    transition: var(--transition-fast);
}

.logo-text {
    display: flex;
    flex-direction: column;
}

.logo h1 {
    color: var(--text-light);
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    margin: 0;
    line-height: 1;
}

.logo-subtitle {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    font-weight: 400;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.utility-menu {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
}

.utility-item {
    margin-left: 2rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    position: relative;
    padding: 0.3rem 0;
    transition: var(--transition-fast);
}

.utility-item:hover {
    color: var(--accent-color);
}

.utility-item.emergency {
    background-color: var(--danger-color);
    color: white;
    padding: 0.8rem 1.4rem;
    border-radius: var(--border-radius-small);
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 10px rgba(229, 57, 53, 0.3);
    position: relative;
    overflow: hidden;
    z-index: 1;
}

.utility-item.emergency::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.1);
    z-index: -1;
}

.utility-item.emergency::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(45deg);
    opacity: 0;
    transition: var(--transition-fast);
    z-index: -1;
}

.utility-item.emergency:hover::after {
    opacity: 1;
    top: -100%;
    left: -100%;
}

.utility-item.emergency i {
    margin-right: 0.6rem;
    font-size: 1.3rem;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
    }
}

.accent-line {
    height: 3px;
    width: 100%;
    background-color: var(--secondary-color);
}

.header-main {
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 3rem;
    box-shadow: var(--shadow-small);
    transition: background-color 0.3s ease;
}

.header-main.scrolled {
    box-shadow: var(--shadow-medium);
}

/* ENHANCED NAVIGATION STYLES */
.main-nav {
    position: relative;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
}

.main-nav ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    align-items: center;
    flex-wrap: nowrap;
    width: 100%;
    justify-content: space-between;
}

.main-nav ul li {
    margin: 0 1.5rem;
    position: relative;
    display: flex;
    align-items: center;
}

.main-nav ul li a {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 600;
    padding: 0.6rem 0;
    transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    height: 45px;
    line-height: 1;
    white-space: nowrap;
    position: relative;
}

/* Support for menu text that can be hidden/shown */
.menu-text, .menu-text-optional {
    display: inline-block;
    position: relative;
}

/* Icon in main menu */
.menu-icon {
    margin-right: 0.7rem;
    font-size: 1.4rem;
    opacity: 0.8;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    flex-shrink: 0;
    position: relative;
    top: 2px;
}

.main-nav ul li a:hover {
    color: var(--secondary-color);
    transform: translateY(-2px);
}

.main-nav ul li a:hover .menu-icon {
    transform: scale(1.1);
    opacity: 1;
}

.main-nav ul li a::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 0;
    height: 3px;
    background-color: var(--secondary-color);
    transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.main-nav ul li a:hover::after {
    width: 100%;
}

.main-nav ul li.active a {
    color: var(--secondary-color);
    font-weight: 700;
}

.main-nav ul li.active a::after {
    width: 100%;
    background-color: var(--accent-color);
}

/* ENHANCED DROPDOWN STYLES */
.main-nav ul li.has-dropdown {
    position: relative;
}

.main-nav ul li.has-dropdown > a {
    display: flex;
    align-items: center;
    padding-right: 1.4rem;
    height: 45px;
}

.main-nav ul li.has-dropdown > a .dropdown-icon {
    margin-left: 0.4rem;
    font-size: 1.2rem;
    transition: transform 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    position: relative;
    top: 2px;
}

.main-nav ul li.has-dropdown:hover > a .dropdown-icon {
    transform: rotate(180deg);
}

/* Enhanced dropdown styling */
.dropdown-menu {
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    background-color: white !important;
    min-width: 320px !important;
    display: block !important;
    flex-direction: column !important;
    padding: 0.8rem 0 !important;
    margin: 0 !important;
    margin-top: 0.5rem !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
    z-index: 1000 !important;
    visibility: hidden !important;
    opacity: 0 !important;
    transform: translateY(15px) !important;
    transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) !important;
    overflow: hidden !important;
}

.main-nav ul li.has-dropdown:hover .dropdown-menu {
    visibility: visible !important;
    opacity: 1 !important;
    transform: translateY(0) !important;
}

.dropdown-menu::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 20px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid white;
}

/* Group headers in dropdown */
.dropdown-group-header {
    padding: 0.6rem 1.7rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 0.5rem;
    opacity: 0.7;
    list-style: none;
    background-color: transparent;
}

.dropdown-menu li {
    display: block !important;
    width: 100% !important;
    float: none !important;
    margin: 0 !important;
    padding: 0 !important;
}

.dropdown-menu li:last-child {
    border-bottom: none !important;
}

/* Dropdown menu item styling */
.dropdown-menu li a {
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
    padding: 0.8rem 1.7rem !important;
    color: var(--text-secondary) !important;
    text-decoration: none !important;
    font-size: 1rem !important;
    font-weight: 500 !important;
    transition: all 0.3s ease !important;
    border-left: 3px solid transparent !important;
}

/* Icon in dropdown menu */
.dropdown-icon-item {
    margin-right: 0.8rem !important;
    font-size: 1.3rem !important;
    color: var(--text-secondary) !important;
    opacity: 0.7 !important;
    transition: all 0.3s ease !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
    top: 2px !important;
}

.dropdown-menu li a:hover {
    background-color: rgba(30, 136, 229, 0.05) !important;
    color: var(--secondary-color) !important;
    border-left: 3px solid var(--secondary-color) !important;
    transform: translateX(3px) !important;
    padding-left: 1.9rem !important;
}

.dropdown-menu li a:hover .dropdown-icon-item {
    color: var(--secondary-color) !important;
    opacity: 1 !important;
    transform: scale(1.1) !important;
}

.dropdown-menu li a::after {
    display: none !important;
}

/* Separator in dropdown */
.dropdown-separator {
    height: 1px;
    background-color: rgba(0,0,0,0.05);
    margin: 0.5rem 0;
}

/* Search Bar styles - DISABLED */
.search-bar {
    display: none !important;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 2rem;
    cursor: pointer;
    transition: var(--transition-fast);
}

.mobile-menu-toggle:hover {
    color: var(--secondary-color);
}

/* INNOVATION MENU ANIMATIONS */
.main-nav ul li a[href="/pls/inovatii"] {
    position: relative;
    overflow: hidden;
}

.main-nav ul li a[href="/pls/inovatii"] .menu-icon {
    animation: innovationPulse 3s ease-in-out infinite;
    filter: drop-shadow(0 0 3px rgba(255, 202, 40, 0.4));
}

@keyframes innovationPulse {
    0% {
        transform: scale(1);
        filter: drop-shadow(0 0 3px rgba(255, 202, 40, 0.4));
        color: var(--text-secondary);
    }
    20% {
        transform: scale(1.15);
        filter: drop-shadow(0 0 12px rgba(255, 202, 40, 0.8));
        color: var(--accent-color);
    }
    40% {
        transform: scale(1);
        filter: drop-shadow(0 0 3px rgba(255, 202, 40, 0.4));
        color: var(--text-secondary);
    }
    100% {
        transform: scale(1);
        filter: drop-shadow(0 0 3px rgba(255, 202, 40, 0.4));
        color: var(--text-secondary);
    }
}

.main-nav ul li a[href="/pls/inovatii"]::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 20%, rgba(255, 202, 40, 0.15) 50%, transparent 80%);
    transform: translateX(-120%);
    animation: innovationShine 4s ease-in-out infinite;
    z-index: 0;
    border-radius: 6px;
}

@keyframes innovationShine {
    0% {
        transform: translateX(-120%);
        opacity: 0;
    }
    15% {
        opacity: 1;
    }
    35% {
        transform: translateX(120%);
        opacity: 1;
    }
    50% {
        transform: translateX(120%);
        opacity: 0;
    }
    100% {
        transform: translateX(120%);
        opacity: 0;
    }
}

.main-nav ul li a[href="/pls/inovatii"]:hover {
    background-color: rgba(255, 202, 40, 0.12);
    border-radius: 6px;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    overflow: hidden;
}

.main-nav ul li a[href="/pls/inovatii"]:hover::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    background: radial-gradient(circle, rgba(255, 202, 40, 0.2) 0%, transparent 70%);
    border-radius: 8px;
    z-index: -1;
    animation: innovationHoverGlow 0.6s ease-out;
}

@keyframes innovationHoverGlow {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }
    50% {
        transform: scale(1.1);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 0.7;
    }
}

.main-nav ul li a[href="/pls/inovatii"]:hover .menu-icon {
    animation: innovationHover 0.6s ease-in-out;
    color: var(--accent-color);
    filter: drop-shadow(0 0 15px rgba(255, 202, 40, 1));
    z-index: 2;
}

@keyframes innovationHover {
    0% {
        transform: scale(1);
    }
    30% {
        transform: scale(1.3) rotate(8deg);
    }
    60% {
        transform: scale(1.2) rotate(-3deg);
    }
    100% {
        transform: scale(1.15) rotate(0deg);
    }
}

.main-nav ul li a[href="/pls/inovatii"] .menu-text-optional {
    position: relative;
    z-index: 2;
}

@media (max-width: 992px) {
    .main-nav ul li a[href="/pls/inovatii"] {
        overflow: hidden;
    }
    
    .main-nav ul li a[href="/pls/inovatii"]::before {
        background: linear-gradient(45deg, transparent 30%, rgba(255, 202, 40, 0.2) 50%, transparent 70%);
        animation: innovationShine 5s ease-in-out infinite;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    
    .main-nav ul li a[href="/pls/inovatii"] .menu-icon {
        animation: innovationPulseMobile 3s ease-in-out infinite;
    }
    
    @keyframes innovationPulseMobile {
        0%, 70%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 2px rgba(255, 202, 40, 0.3));
            color: var(--text-secondary);
        }
        15% {
            transform: scale(1.1);
            filter: drop-shadow(0 0 8px rgba(255, 202, 40, 0.8));
            color: var(--accent-color);
        }
    }
}

.dropdown-menu li a[href="/pls/inovatii"] {
    position: relative;
    overflow: hidden;
}

.dropdown-menu li a[href="/pls/inovatii"] .dropdown-icon-item {
    animation: innovationDropdownPulse 4s ease-in-out infinite;
}

@keyframes innovationDropdownPulse {
    0%, 80%, 100% {
        color: var(--text-secondary);
        filter: none;
        transform: scale(1);
    }
    10% {
        color: var(--accent-color);
        filter: drop-shadow(0 0 6px rgba(255, 202, 40, 0.7));
        transform: scale(1.1);
    }
}

/* Tooltip for icon-only menu items */
.icon-only {
    position: relative;
}

.icon-only::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 0.3rem 0.7rem;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s, visibility 0.3s;
    z-index: 1001;
    pointer-events: none;
}

.icon-only::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent rgba(0,0,0,0.8) transparent;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s, visibility 0.3s;
    pointer-events: none;
}

.icon-only:hover::before,
.icon-only:hover::after {
    visibility: visible;
    opacity: 1;
}

/* Overflow menu for responsive header */
.overflow-menu-item {
    display: none;
}

.overflow-menu-container .dropdown-menu {
    min-width: 250px !important;
}

/* Footer styles */
footer {
    background-color: var(--primary-color);
    color: white;
    padding: 5rem 3rem 2rem;
    position: relative;
    overflow: hidden;
}

.footer-bg-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        url('/api/placeholder/1920/100');
    background-size: cover;
    opacity: 0.05;
    z-index: 0;
}

.footer-content {
    position: relative;
    z-index: 1;
    max-width: 1400px;
    margin: 0 auto;
}

.footer-top {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 4rem;
}

.footer-column {
    flex: 1;
    min-width: 250px;
    margin-bottom: 2rem;
    padding-right: 2rem;
}

.footer-logo {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
}

.footer-logo-badge {
    width: 60px;
    height: 68px;
    margin-right: 1.2rem;
}

.footer-logo-text {
    font-size: 1.7rem;
    font-weight: 700;
}

.footer-description {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.8;
    margin-bottom: 2rem;
    font-size: 1rem;
}

.footer-social {
    display: flex;
    gap: 1rem;
}

.social-icon {
    width: 45px;
    height: 45px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-decoration: none;
    transition: var(--transition-fast);
    font-size: 1.4rem;
}

.social-icon:hover {
    background-color: var(--accent-color);
    color: var(--primary-color);
    transform: translateY(-5px);
    box-shadow: var(--shadow-medium);
}

.footer-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
    position: relative;
    padding-bottom: 1rem;
}

.footer-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background-color: var(--accent-color);
}

.footer-links {
    display: flex;
    flex-direction: column;
}

.footer-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    transition: var(--transition-fast);
    font-size: 1rem;
}

.footer-link i {
    margin-right: 0.8rem;
    color: var(--accent-color);
    transition: var(--transition-fast);
    font-size: 1.2rem;
}

.footer-link:hover {
    color: white;
    transform: translateX(5px);
}

.footer-link:hover i {
    color: var(--accent-color);
}

.footer-contact-item {
    display: flex;
    margin-bottom: 1.5rem;
    color: rgba(255, 255, 255, 0.7);
}

.footer-contact-icon {
    margin-right: 1rem;
    color: var(--accent-color);
    font-size: 1.3rem;
}

.footer-contact-text h4 {
    margin-bottom: 0.3rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
}

.footer-contact-text p {
    line-height: 1.6;
    font-size: 1rem;
}

/* Newsletter Form Styles */
.footer-form {
    margin-bottom: 1.5rem;
}

.footer-form input {
    width: 100%;
    padding: 1.1rem;
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: var(--border-radius-medium);
    color: white;
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
}

.footer-form input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.footer-form button {
    background-color: var(--accent-color);
    color: var(--primary-color);
    border: none;
    padding: 1.1rem 2.2rem;
    border-radius: var(--border-radius-medium);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    width: 100%;
}

.footer-form button:hover {
    background-color: var(--accent-dark);
    transform: translateY(-3px);
}

.footer-form button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* Newsletter message styles */
.newsletter-message {
    padding: 1rem;
    border-radius: var(--border-radius-medium);
    margin-top: 1rem;
    font-size: 0.95rem;
    display: none;
    animation: slideIn 0.3s ease;
}

.newsletter-message.success {
    background-color: rgba(67, 160, 71, 0.2);
    border-left: 4px solid var(--success-color);
    color: #c8e6c9;
    display: block;
}

.newsletter-message.error {
    background-color: rgba(229, 57, 53, 0.2);
    border-left: 4px solid var(--danger-color);
    color: #ffcdd2;
    display: block;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.footer-bottom {
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
}

.footer-copyright {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
}

.footer-links-bottom {
    display: flex;
    flex-wrap: wrap;
}

.footer-bottom-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    margin-left: 1.5rem;
    font-size: 1rem;
    transition: var(--transition-fast);
}

.footer-bottom-link:hover {
    color: var(--accent-color);
}

/* Material Icons global styling */
.material-icons {
    vertical-align: middle;
    line-height: 1;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.utility-item.emergency i {
    position: relative;
    display: inline-flex;
    align-items: center;
    top: 2px;
}

/* Hide mobile menu close button on all desktop sizes */
@media screen and (min-width: 993px) {
    .mobile-menu-close {
        display: none !important;
    }
}

/* Responsive adjustments with bigger text */
@media screen and (min-width: 993px) and (max-width: 1920px) {
    .header-top,
    .header-main {
        padding-left: 2rem !important;
        padding-right: 2rem !important;
    }
    
    .header-main {
        flex-wrap: nowrap !important;
    }
    
    .main-nav {
        flex: 1 1 0 !important;
    }
    
    .main-nav ul {
        justify-content: space-evenly !important;
        width: 100% !important;
    }
    
    .main-nav ul li {
        margin: 0 0.8rem !important;
    }
    
    .main-nav ul li a {
        padding: 0.6rem 0 !important;
        white-space: nowrap !important;
    }
    
    .menu-icon {
        margin-right: 0.6rem !important;
    }
    
    .main-nav ul li.has-dropdown > a .dropdown-icon {
        margin-left: 0.4rem !important;
    }
}

/* MOBILE MENU BACKDROP */
.mobile-menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 999;
}

.mobile-menu-backdrop.active {
    opacity: 1;
    visibility: visible;
}

@media (max-width: 992px) {
    .header-top,
    .header-main {
        padding-left: 2rem;
        padding-right: 2rem;
    }
    
    .mobile-menu-toggle {
        display: block;
        position: relative;
        z-index: 1001;
        padding: 12px;
        margin: -12px;
    }
    
    .mobile-menu-toggle .material-icons {
        font-size: 28px;
    }
    
    /* MOBILE MENU - SLIDE FROM RIGHT */
    .main-nav {
        position: fixed;
        top: 0;
        right: -100%;
        width: 90%;
        max-width: 380px;
        height: 100vh;
        background-color: white;
        box-shadow: -5px 0 25px rgba(0,0,0,0.2);
        transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        overflow-y: auto;
        overflow-x: hidden;
        z-index: 1000;
        -webkit-overflow-scrolling: touch;
        display: flex;
        flex-direction: column;
        scroll-behavior: smooth;
    }
    
    .main-nav.active {
        right: 0;
    }
    
    /* CLOSE BUTTON INSIDE MOBILE MENU - STICKY AT TOP */
    .mobile-menu-close {
        position: sticky;
        top: 0;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 1rem 1.5rem;
        background-color: white;
        border-bottom: 1px solid rgba(0,0,0,0.06);
        z-index: 10;
        flex-shrink: 0;
    }
    
    .mobile-menu-close-btn {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 50%;
        position: relative;
    }
    
    .mobile-menu-close-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--secondary-color);
        opacity: 0;
        border-radius: 50%;
        transition: opacity 0.3s ease;
    }
    
    .mobile-menu-close-btn:active::before {
        opacity: 0.1;
    }
    
    .mobile-menu-close-btn .material-icons {
        font-size: 28px;
        position: relative;
        z-index: 1;
    }
    
    /* Hide mobile menu elements on desktop */
    .main-nav > .mobile-menu-close {
        display: flex;
    }
    
    /* MOBILE MENU LIST */
    .main-nav ul {
        flex-direction: column;
        padding: 0.5rem 0 2rem 0;
    }
    
    .main-nav ul li {
        margin: 0;
        width: 100%;
        border-bottom: 1px solid rgba(0,0,0,0.06);
        display: block !important;
        flex-direction: column !important;
    }
    
    .main-nav ul li.has-dropdown {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
    }
    
    .main-nav ul li:last-child {
        border-bottom: none;
    }
    
    /* MOBILE MENU ITEMS - MINIMUM 48PX TOUCH TARGET */
    .main-nav ul li a {
        display: flex;
        align-items: center;
        padding: 1.25rem 1.5rem;
        min-height: 56px;
        font-size: 1.15rem;
        font-weight: 600;
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* TOUCH FEEDBACK - RIPPLE EFFECT */
    .main-nav ul li a::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--secondary-color);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .main-nav ul li a:active::before {
        opacity: 0.1;
    }
    
    .main-nav ul li a::after {
        display: none;
    }
    
    .main-nav ul li a .menu-icon {
        margin-right: 1rem;
        font-size: 24px;
        flex-shrink: 0;
    }
    
    .main-nav ul li a .menu-text,
    .main-nav ul li a .menu-text-optional {
        display: inline !important;
        flex: 1;
    }
    
    .main-nav ul li a.icon-only::before,
    .main-nav ul li a.icon-only::after {
        display: none !important;
    }
    
    .main-nav ul li.overflow-menu-item {
        display: none !important;
    }
    
    .main-nav ul li.low-priority {
        display: block !important;
    }
    
    /* DROPDOWN PARENT STYLING */
    .main-nav ul li.has-dropdown > a {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 1.5rem;
    }
    
    .main-nav ul li.has-dropdown > a .dropdown-icon {
        margin-left: auto;
        font-size: 28px;
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        color: var(--secondary-color);
    }
    
    .main-nav ul li.has-dropdown.active > a .dropdown-icon {
        transform: rotate(180deg);
    }
    
    .main-nav ul li.has-dropdown.active > a {
        background-color: rgba(30, 136, 229, 0.05);
        color: var(--secondary-color);
    }
    
    /* DISABLE DESKTOP HOVER ON MOBILE */
    .main-nav ul li.has-dropdown:hover .dropdown-menu {
        visibility: visible !important;
        opacity: 1 !important;
        transform: none !important;
        max-height: 0 !important;
        position: static !important;
    }
    
    /* DROPDOWN MENU - ACCORDION STYLE - ULTRA SPECIFIC */
    .main-nav ul li.has-dropdown .dropdown-menu,
    .main-nav ul li.has-dropdown > .dropdown-menu,
    ul li.has-dropdown .dropdown-menu {
        position: static !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
        background-color: #f8f9fa !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
        transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        margin-top: 0 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        border-radius: 0 !important;
        top: auto !important;
        left: auto !important;
        right: auto !important;
        bottom: auto !important;
        display: block !important;
        float: none !important;
    }
    
    .dropdown-menu::before {
        display: none !important;
    }
    
    .main-nav ul li.has-dropdown.active .dropdown-menu {
        max-height: 2000px !important;
        border-top: 2px solid rgba(30, 136, 229, 0.15);
    }
    
    /* DROPDOWN ITEMS - LARGER TOUCH TARGETS */
    .dropdown-menu li a {
        padding: 1.1rem 1.5rem 1.1rem 3.5rem !important;
        min-height: 52px !important;
        font-size: 1.05rem !important;
        font-weight: 500 !important;
        display: flex !important;
        align-items: center !important;
        border-bottom: 1px solid rgba(0,0,0,0.04) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        position: relative !important;
    }
    
    .dropdown-menu li a::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background-color: var(--secondary-color) !important;
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
    }
    
    .dropdown-menu li a:active::before {
        opacity: 0.08 !important;
    }
    
    .dropdown-menu li:last-child a {
        border-bottom: none !important;
    }
    
    .dropdown-menu li a .dropdown-icon-item {
        margin-right: 0.8rem !important;
        font-size: 22px !important;
        flex-shrink: 0 !important;
    }
    
    /* DROPDOWN GROUP HEADERS */
    .dropdown-menu li.dropdown-group-header {
        padding: 0.8rem 1.5rem 0.5rem 3.5rem !important;
        font-size: 0.8rem !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.8px !important;
        color: var(--secondary-color) !important;
        background-color: rgba(30, 136, 229, 0.05) !important;
        list-style: none !important;
        cursor: default !important;
        pointer-events: none !important;
        border-bottom: none !important;
    }
    
    /* ACTIVE MENU ITEM */
    .main-nav ul li.active > a {
        background-color: rgba(30, 136, 229, 0.1);
        color: var(--secondary-color);
        border-left: 4px solid var(--secondary-color);
        padding-left: calc(1.5rem - 4px);
    }
}

@media (max-width: 768px) {
    .header-top,
    .header-main {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }
    
    .logo h1 {
        font-size: 1.3rem;
    }
    
    .logo-subtitle {
        font-size: 0.75rem;
    }
    
    .utility-item {
        display: none;
    }
    
    .utility-item.emergency {
        display: flex;
        margin-left: 0;
        font-size: 0.95rem;
    }

    /* ENHANCED MOBILE FOOTER */
    footer {
        padding: 4rem 1.5rem 2rem;
    }
    
    .footer-column {
        flex: 100%;
        padding-right: 0;
        margin-bottom: 3rem;
    }
    
    /* LARGER SOCIAL ICONS FOR MOBILE */
    .social-icon {
        width: 52px;
        height: 52px;
        font-size: 1.6rem;
    }
    
    /* NEWSLETTER FORM - LARGER INPUTS */
    .footer-form input {
        padding: 1.3rem 1.2rem;
        font-size: 1.05rem;
        min-height: 52px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
    }
    
    .footer-form input:focus {
        outline: none;
        border-color: var(--accent-color);
        background-color: rgba(255, 255, 255, 0.15);
    }
    
    .footer-form button {
        padding: 1.3rem 2rem;
        font-size: 1.05rem;
        min-height: 52px;
        font-weight: 700;
        border-radius: 10px;
    }
    
    /* FOOTER LINKS - LARGER TOUCH TARGETS */
    .footer-link {
        padding: 0.6rem 0;
        font-size: 1.05rem;
        margin-bottom: 1.2rem;
    }
    
    .footer-link i {
        font-size: 1.4rem;
    }
    
    /* FOOTER CONTACT ITEMS - BETTER SPACING */
    .footer-contact-item {
        margin-bottom: 2rem;
        padding: 0.5rem 0;
    }
    
    .footer-contact-icon {
        margin-right: 1.2rem;
        font-size: 1.5rem;
    }
    
    .footer-contact-text h4 {
        font-size: 1.15rem;
        margin-bottom: 0.4rem;
    }
    
    .footer-contact-text p {
        font-size: 1.05rem;
        line-height: 1.7;
    }
    
    .footer-bottom {
        flex-direction: column;
        text-align: center;
        padding-top: 2.5rem;
    }
    
    .footer-copyright {
        margin-bottom: 1.5rem;
        font-size: 1.05rem;
    }
    
    .footer-links-bottom {
        justify-content: center;
        gap: 0.5rem;
    }
    
    .footer-bottom-link {
        margin: 0 0.75rem;
        margin-bottom: 0.8rem;
        font-size: 1.05rem;
        padding: 0.5rem;
    }
}

body {
    padding-top: var(--header-height);
}

::-webkit-scrollbar {
    width: 12px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: var(--secondary-color);
    border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-light);
}

.header-top.scrolled,
.header-top {
    padding: 0.8rem 3rem !important;
    transition: background-color 0.3s ease !important;
}

.header-main.scrolled,
.header-main {
    padding: 1.2rem 3rem !important;
    transition: background-color 0.3s ease !important;
}

@media screen and (max-width: 1920px) {
    .header-top.scrolled,
    .header-top,
    .header-main.scrolled,
    .header-main {
        padding-left: 2rem !important;
        padding-right: 2rem !important;
    }
}

@media screen and (max-width: 1366px) {
    .header-top.scrolled,
    .header-top,
    .header-main.scrolled,
    .header-main {
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;
    }
}
`;
