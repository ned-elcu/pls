// COMPONENTS.JS - Combined Header/Footer components with installation code
// Simply include this file in your HTML pages to automatically load the header and footer

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
    transition: var(--transition-fast);
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
    padding: 0.5rem 3rem;
}

.logo {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
}

.logo-badge {
    width: 50px;
    height: 57px;
    margin-right: 1rem;
    transition: var(--transition-fast);
}

.logo-text {
    display: flex;
    flex-direction: column;
}

.logo h1 {
    color: var(--text-light);
    font-size: 1.3rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    margin: 0;
    line-height: 1;
}

.logo-subtitle {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
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
    margin-left: 1.5rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.8rem;
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
    padding: 0.7rem 1.2rem;
    border-radius: var(--border-radius-small);
    font-weight: 600;
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
    margin-right: 0.5rem;
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
    padding: 1rem 3rem;
    box-shadow: var(--shadow-small);
    transition: var(--transition-fast);
}

.header-main.scrolled {
    padding: 0.7rem 3rem;
}

/* ENHANCED NAVIGATION STYLES */
.main-nav ul {
    display: flex;
    list-style: none;
}

.main-nav ul li {
    margin: 0 1rem;
    position: relative;
}

.main-nav ul li a {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 0;
    transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
}

/* Icon in main menu */
.menu-icon {
    margin-right: 0.5rem;
    font-size: 1.2rem;
    opacity: 0.8;
    transition: all 0.3s ease;
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
    height: 2px;
    background-color: var(--secondary-color);
    transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.main-nav ul li a:hover::after {
    width: 100%;
}

.main-nav ul li.active a {
    color: var(--secondary-color);
    font-weight: 600;
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
    padding-right: 1.2rem;
}

.main-nav ul li.has-dropdown > a .dropdown-icon {
    margin-left: 0.3rem;
    font-size: 1rem;
    transition: transform 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
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
    min-width: 280px !important;
    display: block !important;
    flex-direction: column !important;
    padding: 0.7rem 0 !important;
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
    padding: 0.5rem 1.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 0.5rem;
    opacity: 0.7;
}

/* Group styling in dropdown */
.dropdown-group-1 {
    background-color: var(--menu-group-1);
}

.dropdown-group-2 {
    background-color: var(--menu-group-2);
}

.dropdown-group-3 {
    background-color: var(--menu-group-3);
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
    padding: 0.7rem 1.5rem !important;
    color: var(--text-secondary) !important;
    text-decoration: none !important;
    font-size: 0.9rem !important;
    font-weight: 400 !important;
    transition: all 0.3s ease !important;
    border-left: 3px solid transparent !important;
}

/* Icon in dropdown menu */
.dropdown-icon-item {
    margin-right: 0.7rem !important;
    font-size: 1.1rem !important;
    color: var(--text-secondary) !important;
    opacity: 0.7 !important;
    transition: all 0.3s ease !important;
}

.dropdown-menu li a:hover {
    background-color: rgba(30, 136, 229, 0.05) !important;
    color: var(--secondary-color) !important;
    border-left: 3px solid var(--secondary-color) !important;
    transform: translateX(3px) !important;
    padding-left: 1.7rem !important;
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

/* Search Bar styles */
.search-bar {
    position: relative;
    width: 250px;
}

.search-bar input {
    width: 100%;
    padding: 0.7rem 1rem 0.7rem 2.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 30px;
    outline: none;
    transition: var(--transition-fast);
    font-family: 'Poppins', sans-serif;
    font-size: 0.9rem;
}

.search-bar input:focus {
    border-color: var(--secondary-color);
    box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.search-bar i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9e9e9e;
    transition: var(--transition-fast);
}

.search-bar input:focus + i {
    color: var(--secondary-color);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.8rem;
    cursor: pointer;
    transition: var(--transition-fast);
}

.mobile-menu-toggle:hover {
    color: var(--secondary-color);
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
    width: 50px;
    height: 50px;
    margin-right: 1rem;
}

.footer-logo-text {
    font-size: 1.5rem;
    font-weight: 700;
}

.footer-description {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.8;
    margin-bottom: 2rem;
}

.footer-social {
    display: flex;
    gap: 1rem;
}

.social-icon {
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-decoration: none;
    transition: var(--transition-fast);
    font-size: 1.2rem;
}

.social-icon:hover {
    background-color: var(--accent-color);
    color: var(--primary-color);
    transform: translateY(-5px);
}

.footer-title {
    font-size: 1.3rem;
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
}

.footer-link i {
    margin-right: 0.8rem;
    color: var(--accent-color);
    transition: var(--transition-fast);
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
}

.footer-contact-text h4 {
    margin-bottom: 0.3rem;
    font-size: 1rem;
    font-weight: 600;
    color: white;
}

.footer-contact-text p {
    line-height: 1.6;
}

.footer-form {
    margin-bottom: 1.5rem;
}

.footer-form input {
    width: 100%;
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: var(--border-radius-medium);
    color: white;
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
}

.footer-form input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.footer-form button {
    background-color: var(--accent-color);
    color: var(--primary-color);
    border: none;
    padding: 1rem 2rem;
    border-radius: var(--border-radius-medium);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
    font-family: 'Poppins', sans-serif;
}

.footer-form button:hover {
    background-color: var(--accent-dark);
    transform: translateY(-3px);
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
    font-size: 0.9rem;
}

.footer-links-bottom {
    display: flex;
    flex-wrap: wrap;
}

.footer-bottom-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    margin-left: 1.5rem;
    font-size: 0.9rem;
    transition: var(--transition-fast);
}

.footer-bottom-link:hover {
    color: var(--accent-color);
}

/* Mobile adjustments */
@media (max-width: 992px) {
    .header-top,
    .header-main {
        padding-left: 2rem;
        padding-right: 2rem;
    }
    
    .mobile-menu-toggle {
        display: block;
    }
    
    .main-nav {
        position: fixed;
        top: var(--header-height);
        left: -100%;
        width: 80%;
        max-width: 320px;
        height: calc(100vh - var(--header-height));
        background-color: white;
        box-shadow: var(--shadow-large);
        transition: left 0.3s ease;
        overflow-y: auto;
        z-index: 1000;
    }
    
    .main-nav.active {
        left: 0;
    }
    
    .main-nav ul {
        flex-direction: column;
        padding: 1rem 0;
    }
    
    .main-nav ul li {
        margin: 0;
        width: 100%;
    }
    
    .main-nav ul li a {
        display: flex;
        padding: 1rem 2rem;
        border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    
    .main-nav ul li a::after {
        display: none;
    }
    
    .dropdown-menu {
        position: static !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
        background-color: #f8f9fa !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
        transition: max-height 0.3s ease !important;
        width: 100% !important;
        margin-top: 0 !important;
        border-radius: 0 !important;
    }
    
    .dropdown-menu::before {
        display: none !important;
    }
    
    .main-nav ul li.has-dropdown.active .dropdown-menu {
        max-height: 1200px !important;
    }
    
    .main-nav ul li.has-dropdown > a .dropdown-icon {
        margin-left: auto;
    }
    
    .main-nav ul li.has-dropdown > a {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .dropdown-menu li a {
        padding-left: 3rem !important;
    }
    
    .dropdown-group-header {
        padding-left: 3rem !important;
    }
}

@media (max-width: 768px) {
    .header-top,
    .header-main {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }
    
    .logo h1 {
        font-size: 1.1rem;
    }
    
    .utility-item {
        display: none;
    }
    
    .utility-item.emergency {
        display: flex;
        margin-left: 0;
    }

    footer {
        padding: 4rem 1.5rem 2rem;
    }
    
    .footer-column {
        flex: 100%;
        padding-right: 0;
    }
    
    .footer-bottom {
        flex-direction: column;
        text-align: center;
    }
    
    .footer-copyright {
        margin-bottom: 1rem;
    }
    
    .footer-links-bottom {
        justify-content: center;
    }
    
    .footer-bottom-link {
        margin: 0 0.75rem;
        margin-bottom: 0.5rem;
    }
}

/* Add padding to the body to prevent content from being hidden under the fixed header */
body {
    padding-top: var(--header-height);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: var(--secondary-color);
    border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-light);
}

/* Material Icons styling */
.material-icons {
    vertical-align: middle;
    line-height: 1;
}
`;

// HTML Components as JavaScript strings
const HEADER_HTML = `
<div class="intro-screen" id="intro-screen">
    <div class="intro-content">
        <img src="https://images4.imagebam.com/12/a5/89/ME11HXQJ_o.png" alt="Insigna PLS" class="intro-badge">
        <h1 class="intro-title">POLIȚIA LOCALĂ SLOBOZIA</h1>
        <p class="intro-subtitle">Inovăm securitatea publică • Împreună pentru comunitate</p>
        <div class="intro-loader">
            <div class="intro-loader-bar"></div>
        </div>
        <p class="intro-message">Inițializare conexiune securizată...</p>
    </div>
</div>

<!-- Header -->
<div class="header-container">
    <div class="header-top" id="header-top">
        <div class="logo">
            <img src="https://images4.imagebam.com/12/a5/89/ME11HXQJ_o.png" alt="Insigna PLS" class="logo-badge">
            <div class="logo-text">
                <h1>POLIȚIA LOCALĂ SLOBOZIA</h1>
                <span class="logo-subtitle">Inovăm securitatea publică</span>
            </div>
        </div>
        <div class="utility-menu">
            <a href="/pls/cariere" class="utility-item">Oportunități de Carieră</a>
            <a href="/pls/registre" class="utility-item">Registre Publice</a>
            <a href="/pls/petitii" class="utility-item">Depunere Sesizare</a>
            <a href="tel:0243955" class="utility-item emergency">
                <i class="material-icons">phone_in_talk</i> (0243) 955
            </a>
        </div>
    </div>
    <div class="accent-line"></div>
    <div class="header-main" id="header-main">
        <nav class="main-nav" id="main-nav">
            <ul>
                <li class="active"><a href="/pls/"><i class="material-icons menu-icon">home</i> Acasă</a></li>
                <li class="has-dropdown">
                    <a href="/pls/despre-noi">
                        <i class="material-icons menu-icon">info</i> Despre Noi
                        <i class="material-icons dropdown-icon">keyboard_arrow_down</i>
                    </a>
                    <ul class="dropdown-menu">
                        <div class="dropdown-group-header">Informații generale</div>
                        <div class="dropdown-group-1">
                            <li><a href="/pls/acte-normative"><i class="material-icons dropdown-icon-item">gavel</i> Acte normative</a></li>
                            <li><a href="/pls/atributii"><i class="material-icons dropdown-icon-item">assignment</i> Atribuții</a></li>
                            <li><a href="/pls/regulament"><i class="material-icons dropdown-icon-item">description</i> Regulament</a></li>
                        </div>
                        <div class="dropdown-group-header">Structură și facilități</div>
                        <div class="dropdown-group-2">
                            <li><a href="/pls/organigrama"><i class="material-icons dropdown-icon-item">account_tree</i> Organigrama</a></li>
                            <li><a href="/pls/poligon"><i class="material-icons dropdown-icon-item">track_changes</i> Poligonul de tragere</a></li>
                        </div>
                        <div class="dropdown-group-header">Media</div>
                        <div class="dropdown-group-3">
                            <li><a href="/pls/reportaj"><i class="material-icons dropdown-icon-item">play_circle_filled</i> Reportaje și înregistrări video</a></li>
                        </div>
                    </ul>
                </li>
                <li class="has-dropdown">
                    <a href="/pls/petitii">
                        <i class="material-icons menu-icon">feedback</i> Petiții
                        <i class="material-icons dropdown-icon">keyboard_arrow_down</i>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="/pls/petitii"><i class="material-icons dropdown-icon-item">edit_note</i> Petiții</a></li>
                        <li><a href="/pls/raspunsuri"><i class="material-icons dropdown-icon-item">question_answer</i> Răspunsuri la sesizări, reclamații, anonime</a></li>
                    </ul>
                </li>
                <li class="has-dropdown">
                    <a href="/pls/contact">
                        <i class="material-icons menu-icon">phone</i> Contact
                        <i class="material-icons dropdown-icon">keyboard_arrow_down</i>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="/pls/conducere"><i class="material-icons dropdown-icon-item">supervisor_account</i> Conducere</a></li>
                        <li><a href="/pls/relatii-cu-publicul"><i class="material-icons dropdown-icon-item">people</i> Relații cu publicul</a></li>
                        <li><a href="/pls/sediu"><i class="material-icons dropdown-icon-item">location_on</i> Sediul operativ și administrativ</a></li>
                        <li><a href="/pls/audiente"><i class="material-icons dropdown-icon-item">event</i> Program de audiențe</a></li>
                    </ul>
                </li>
                <li class="has-dropdown">
                    <a href="/pls/integritate">
                        <i class="material-icons menu-icon">verified_user</i> Integritate instituțională
                        <i class="material-icons dropdown-icon">keyboard_arrow_down</i>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="/pls/integritate/#strategie-anticoruptie"><i class="material-icons dropdown-icon-item">policy</i> Strategia Națională Anticorupție</a></li>
                        <li><a href="/pls/integritate/#cod-etic"><i class="material-icons dropdown-icon-item">format_quote</i> Cod etic</a></li>
                        <li><a href="/pls/integritate/#declarare-cadouri"><i class="material-icons dropdown-icon-item">card_giftcard</i> Raport privind declararea cadourilor</a></li>
                    </ul>
                </li>
                <li class="has-dropdown">
                    <a href="/pls/transparenta">
                        <i class="material-icons menu-icon">public</i> Informații de interes public
                        <i class="material-icons dropdown-icon">keyboard_arrow_down</i>
                    </a>
                    <ul class="dropdown-menu">
                        <div class="dropdown-group-header">Financiare</div>
                        <div class="dropdown-group-1">
                            <li><a href="/pls/transparenta/financiara/#raportare-salariala"><i class="material-icons dropdown-icon-item">payments</i> Raportare salarială</a></li>
                            <li><a href="/pls/transparenta/financiara/#bilanturi-bugete"><i class="material-icons dropdown-icon-item">account_balance</i> Bilanțuri și bugete</a></li>
                            <li><a href="/pls/transparenta/financiara/#program-achizitii"><i class="material-icons dropdown-icon-item">shopping_cart</i> Program achiziții anuale</a></li>
                        </div>
                        <div class="dropdown-group-header">Transparență</div>
                        <div class="dropdown-group-2">
                            <li><a href="/pls/transparenta/#declaratii-interese"><i class="material-icons dropdown-icon-item">assignment_ind</i> Declarații interese</a></li>
                            <li><a href="/pls/transparenta/#declaratii-avere"><i class="material-icons dropdown-icon-item">account_balance_wallet</i> Declarații avere</a></li>
                            <li><a href="/pls/transparenta/#rapoarte-544"><i class="material-icons dropdown-icon-item">description</i> Raport anual de aplicare a Legii nr. 544/2001</a></li>
                            <li><a href="/pls/transparenta/documente"><i class="material-icons dropdown-icon-item">folder_shared</i> Documente gestionate conform legii</a></li>
                        </div>
                        <div class="dropdown-group-header">Dezvoltare</div>
                        <div class="dropdown-group-3">
                            <li><a href="/pls/transparenta/formare"><i class="material-icons dropdown-icon-item">school</i> Program formare profesională</a></li>
                            <li><a href="/pls/transparenta/cadouri"><i class="material-icons dropdown-icon-item">card_giftcard</i> Raport privind declararea cadourilor</a></li>
                        </div>
                    </ul>
                </li>
                <li><a href="/pls/gdpr"><i class="material-icons menu-icon">security</i> GDPR</a></li>
                <li><a href="/pls/camere"><i class="material-icons menu-icon">videocam</i> Camere publice</a></li>
            </ul>
        </nav>
        <div class="search-bar">
            <input type="text" placeholder="Caută...">
            <i class="material-icons">search</i>
        </div>
        <button class="mobile-menu-toggle" id="mobile-menu-toggle">
            <i class="material-icons">menu</i>
        </button>
    </div>
</div>
`;

const FOOTER_HTML = `
<footer>
    <div class="footer-bg-pattern"></div>
    <div class="footer-content">
        <div class="footer-top">
            <div class="footer-column">
                <div class="footer-logo">
                    <img src="https://images4.imagebam.com/12/a5/89/ME11HXQJ_o.png" alt="Insigna PLS" class="footer-logo-badge">
                    <div class="footer-logo-text">Poliția Locală Slobozia</div>
                </div>
                <p class="footer-description">Servim comunitatea noastră cu integritate, profesionalism și dedicare față de siguranța publică. Misiunea noastră este să lucrăm în parteneriat cu comunitatea noastră pentru a proteja viața și proprietatea, a rezolva probleme și a îmbunătăți calitatea vieții.</p>
                <div class="footer-social">
                    <a href="/pls/social/facebook" class="social-icon"><i class="material-icons">facebook</i></a>
                    <a href="/pls/contact" class="social-icon"><i class="material-icons">alternate_email</i></a>
                    <a href="/pls/galerie" class="social-icon"><i class="material-icons">photo_camera</i></a>
                    <a href="/pls/reportaj" class="social-icon"><i class="material-icons">play_circle_filled</i></a>
                </div>
            </div>
            
            <div class="footer-column">
                <h3 class="footer-title">Link-uri Rapide</h3>
                <div class="footer-links">
                    <a href="/pls/urgente" class="footer-link"><i class="material-icons">arrow_right</i> Servicii de Urgență</a>
                    <a href="/pls/sesizari" class="footer-link"><i class="material-icons">arrow_right</i> Raportează o Infracțiune</a>
                    <a href="/pls/amenzi" class="footer-link"><i class="material-icons">arrow_right</i> Plătește Amenzi</a>
                    <a href="/pls/inregistrari" class="footer-link"><i class="material-icons">arrow_right</i> Solicită Înregistrări</a>
                    <a href="/pls/petitii" class="footer-link"><i class="material-icons">arrow_right</i> Depune o Reclamație</a>
                    <a href="/pls/cariere" class="footer-link"><i class="material-icons">arrow_right</i> Oportunități de Carieră</a>
                </div>
            </div>
            
            <div class="footer-column">
                <h3 class="footer-title">Contactează-ne</h3>
                <div class="footer-contact-item">
                    <div class="footer-contact-icon"><i class="material-icons">location_on</i></div>
                    <div class="footer-contact-text">
                        <h4>Sediul Central</h4>
                        <p>Strada Răzoare nr. 3</p>
                        <p>Slobozia, județul Ialomița</p>
                    </div>
                </div>
                <div class="footer-contact-item">
                    <div class="footer-contact-icon"><i class="material-icons">call</i></div>
                    <div class="footer-contact-text">
                        <h4>Dispecerat: (0243) 955</h4>
                        <p></p>
                    </div>
                </div>
                <div class="footer-contact-item">
                    <div class="footer-contact-icon"><i class="material-icons">email</i></div>
                    <div class="footer-contact-text">
                        <h4>Email</h4>
                        <p>info@politialocala-slobozia.ro</p>
                    </div>
                </div>
            </div>
            
            <div class="footer-column">
                <h3 class="footer-title">Newsletter</h3>
                <p class="footer-description">Rămâi informat despre alertele de siguranță, evenimentele comunitare și actualizările departamentului abonându-te la newsletter-ul nostru.</p>
                <form class="footer-form">
                    <input type="email" placeholder="Adresa ta de Email">
                    <button type="submit">Abonează-te</button>
                </form>
            </div>
        </div>
        
        <div class="footer-bottom">
            <div class="footer-copyright">
                &copy; 2025 Poliția Locală Slobozia. Toate drepturile rezervate.
            </div>
            <div class="footer-links-bottom">
                <a href="/pls/confidentialitate" class="footer-bottom-link">Politica de Confidențialitate</a>
                <a href="/pls/termeni" class="footer-bottom-link">Termeni de Utilizare</a>
                <a href="/pls/accesibilitate" class="footer-bottom-link">Accesibilitate</a>
                <a href="/pls/sitemap" class="footer-bottom-link">Hartă Site</a>
            </div>
        </div>
    </div>
</footer>
`;

// Auto-install the components when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add favicon first
    if (!document.querySelector('link[rel="icon"]')) {
        const faviconLink = document.createElement('link');
        faviconLink.rel = "icon";
        faviconLink.href = "https://images4.imagebam.com/7d/dc/f5/ME11KAXQ_o.png";
        faviconLink.type = "image/png";
        document.head.appendChild(faviconLink);
    }

    // Inject CSS
    if (!document.getElementById('components-css')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'components-css';
        styleEl.textContent = COMPONENTS_CSS;
        document.head.appendChild(styleEl);
    }
    
    // Add material icons if not already included
    if (!document.querySelector('link[href*="material-icons"]')) {
        const iconLink = document.createElement('link');
        iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
        iconLink.rel = "stylesheet";
        document.head.appendChild(iconLink);
    }
    
    // Load header and footer
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');
    
    // Insert components if containers exist
    if (headerContainer) headerContainer.innerHTML = HEADER_HTML;
    if (footerContainer) footerContainer.innerHTML = FOOTER_HTML;
    
    // Initialize components
    initializeComponents();
});

// Initialize all component functionality
function initializeComponents() {
    // Initialize intro screen
    initIntroScreen();
    
    // Initialize header effects
    initHeaderEffects();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize dropdown menu
    initDropdownMenu();
}

// Intro Screen Animation and Removal
function initIntroScreen() {
    const introScreen = document.getElementById('intro-screen');
    if (introScreen) {
        setTimeout(function() {
            introScreen.style.opacity = '0';
            setTimeout(function() {
                introScreen.style.display = 'none';
            }, 500);
        }, 3000);
    }
}

// Header scroll effect
function initHeaderEffects() {
    const headerTop = document.getElementById('header-top');
    const headerMain = document.getElementById('header-main');
    
    if (headerTop && headerMain) {
        // Apply initial state based on current scroll position
        if (window.scrollY > 50) {
            headerTop.classList.add('scrolled');
            headerMain.classList.add('scrolled');
        }
        
        // Add scroll event listener
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

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            this.innerHTML = isExpanded ? 
                '<i class="material-icons">close</i>' : 
                '<i class="material-icons">menu</i>';
        });
    }
}

// Dropdown Menu functionality
function initDropdownMenu() {
    const dropdownItems = document.querySelectorAll('.main-nav .has-dropdown');
    
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Check if we're in mobile view
            if (window.innerWidth <= 992) {
                // Only apply to direct child a tag
                if (e.target === this.querySelector('a') || 
                    e.target === this.querySelector('a .dropdown-icon') || 
                    e.target === this.querySelector('a .menu-icon')) {
                    e.preventDefault();
                    this.classList.toggle('active');
                }
            }
        });
    });
    
    // Ensure proper dropdown behavior on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            dropdownItems.forEach(item => {
                item.classList.remove('active');
            });
            
            const mainNav = document.getElementById('main-nav');
            if (mainNav) {
                mainNav.classList.remove('active');
            }
            
            const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            if (mobileMenuToggle) {
                mobileMenuToggle.innerHTML = '<i class="material-icons">menu</i>';
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });
}
