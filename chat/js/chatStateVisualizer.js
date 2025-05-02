/**
 * chatStateVisualizer.js
 * 
 * A comprehensive visual design system for chat states in the admin panel
 * This file enhances the visual representation of chats in waiting, taken, and resolved states
 */

(function() {
  // Configuration - Visual Design System
  const DESIGN = {
    // Color Palette - Designed for Romanian interface
    colors: {
      waiting: {  // În așteptare
        primary: '#FF9800',       // Vibrant orange for attention
        secondary: 'rgba(255, 243, 224, 0.7)',  // Soft orange background
        accent: '#F57C00',        // Darker orange for accents
        text: '#7D4A00',          // Dark readable text
        border: '#FFB74D',        // Lighter border
        icon: '#FF5722'           // Icon color
      },
      taken: {    // Preluate
        primary: '#2196F3',       // Engaging blue for active chats
        secondary: 'rgba(227, 242, 253, 0.7)',  // Soft blue background
        accent: '#1976D2',        // Darker blue for accents
        text: '#0D47A1',          // Dark readable text
        border: '#64B5F6',        // Lighter border
        icon: '#0D47A1'           // Icon color
      },
      resolved: { // Rezolvate
        primary: '#4CAF50',       // Calm green for completed chats
        secondary: 'rgba(232, 245, 233, 0.7)',  // Soft green background
        accent: '#388E3C',        // Darker green for accents
        text: '#1B5E20',          // Dark readable text
        border: '#81C784',        // Lighter border
        icon: '#2E7D32'           // Icon color
      }
    },
    
    // Animation Timings
    animation: {
      standard: '0.25s ease',
      hover: '0.15s ease-out'
    },
    
    // Shadows
    shadows: {
      light: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      hover: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
    },
    
    // Border Radius
    borderRadius: {
      small: '4px',
      standard: '8px',
      large: '12px'
    },
    
    // Icons - Using Material Icons (assumed already imported in admin.html)
    icons: {
      waiting: 'schedule',        // Clock icon for waiting
      taken: 'person',            // Person icon for taken chats
      resolved: 'check_circle'    // Check icon for resolved chats
    }
  };

  // Map tab text to state
  const TAB_MAP = {
    'În așteptare': 'waiting',
    'Preluate': 'taken',
    'Rezolvate': 'resolved',
    'Toate': 'all'  // Not actually a state, but useful for tracking the active tab
  };
  
  // Helper function to inject CSS with high specificity
  function injectStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
  
  // Base styles for all card elements - targeting the specific structure seen in screenshots
  const baseStyles = `
    /* Target the conversation cards directly */
    .card, 
    .card-body, 
    .list-group-item,
    .list-group > *,
    div.conversation-card,
    div[class^="conversation-"],
    [class*="conversation-item"] {
      transition: all ${DESIGN.animation.standard} !important;
      border-radius: ${DESIGN.borderRadius.standard} !important;
      overflow: hidden !important;
      position: relative !important;
      margin: 10px 0 !important;
      padding-right: 40px !important; /* Space for icon */
    }
    
    /* Hover effect */
    .card:hover, 
    .card-body:hover, 
    .list-group-item:hover,
    .list-group > *:hover,
    div.conversation-card:hover,
    div[class^="conversation-"]:hover,
    [class*="conversation-item"]:hover {
      transform: translateY(-2px) !important;
      box-shadow: ${DESIGN.shadows.hover} !important;
      cursor: pointer !important;
      z-index: 1 !important;
    }
    
    /* Status icon container */
    .status-icon {
      position: absolute !important;
      top: 10px !important;
      right: 10px !important;
      z-index: 2 !important;
      font-size: 20px !important;
      width: 24px !important;
      height: 24px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
  `;

  // Status-specific styles for waiting state
  const waitingStyles = `
    /* Waiting status specific styling */
    .waiting, .card.waiting, .list-group-item.waiting, [class*="conversation"].waiting {
      background-color: ${DESIGN.colors.waiting.secondary} !important;
      border-left: 5px solid ${DESIGN.colors.waiting.primary} !important;
      box-shadow: 0 0 8px rgba(255, 152, 0, 0.2) !important;
    }
    
    .waiting .status-icon, .card.waiting .status-icon {
      color: ${DESIGN.colors.waiting.icon} !important;
    }
    
    /* Subtle pulse animation */
    @keyframes waitingPulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4); }
      70% { box-shadow: 0 0 0 6px rgba(255, 152, 0, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
    }
    
    .waiting .status-icon, .card.waiting .status-icon {
      animation: waitingPulse 2s infinite !important;
    }
  `;

  // Status-specific styles for taken state
  const takenStyles = `
    /* Taken status specific styling */
    .taken, .card.taken, .list-group-item.taken, [class*="conversation"].taken {
      background-color: ${DESIGN.colors.taken.secondary} !important;
      border-left: 5px solid ${DESIGN.colors.taken.primary} !important;
      box-shadow: 0 0 8px rgba(33, 150, 243, 0.2) !important;
    }
    
    .taken .status-icon, .card.taken .status-icon {
      color: ${DESIGN.colors.taken.icon} !important;
    }
    
    /* Subtle highlight animation */
    @keyframes takenHighlight {
      0% { background-color: ${DESIGN.colors.taken.secondary}; }
      50% { background-color: rgba(227, 242, 253, 0.9); }
      100% { background-color: ${DESIGN.colors.taken.secondary}; }
    }
    
    .taken, .card.taken, .list-group-item.taken, [class*="conversation"].taken {
      animation: takenHighlight 3s infinite !important;
    }
  `;

  // Status-specific styles for resolved state
  const resolvedStyles = `
    /* Resolved status specific styling */
    .resolved, .card.resolved, .list-group-item.resolved, [class*="conversation"].resolved {
      background-color: ${DESIGN.colors.resolved.secondary} !important;
      border-left: 5px solid ${DESIGN.colors.resolved.primary} !important;
      box-shadow: 0 0 8px rgba(76, 175, 80, 0.2) !important;
      opacity: 0.85 !important;
    }
    
    .resolved .status-icon, .card.resolved .status-icon {
      color: ${DESIGN.colors.resolved.icon} !important;
    }
    
    .resolved:hover, .card.resolved:hover, .list-group-item.resolved:hover {
      opacity: 1 !important;
    }
  `;

  // Tab highlighting styles
  const tabStyles = `
    /* Tab highlighting for better wayfinding */
    .nav-item .nav-link[href="#waiting-tab"],
    button:contains("În așteptare") {
      border-bottom: 2px solid ${DESIGN.colors.waiting.primary} !important;
      color: ${DESIGN.colors.waiting.accent} !important;
    }
    
    .nav-item .nav-link[href="#taken-tab"],
    button:contains("Preluate") {
      border-bottom: 2px solid ${DESIGN.colors.taken.primary} !important;
      color: ${DESIGN.colors.taken.accent} !important;
    }
    
    .nav-item .nav-link[href="#resolved-tab"],
    button:contains("Rezolvate") {
      border-bottom: 2px solid ${DESIGN.colors.resolved.primary} !important;
      color: ${DESIGN.colors.resolved.accent} !important;
    }
    
    /* Active tab styling */
    .nav-item .nav-link.active,
    button.active {
      font-weight: bold !important;
      border-bottom-width: 3px !important;
    }
  `;

  // Accessibility styles for reduced motion and high contrast
  const accessibilityStyles = `
    @media (prefers-reduced-motion: reduce) {
      *, .waiting, .taken, .resolved {
        animation: none !important;
        transition: none !important;
      }
    }
    
    @media (forced-colors: active) {
      .waiting, .taken, .resolved {
        border-width: 3px !important;
      }
    }
  `;
  
  // Apply status to conversation cards based on the active tab
  function applyStatusBasedOnTab() {
    // Find the active tab
    const activeTab = document.querySelector('.nav-link.active, .tab.active, button.active');
    
    if (!activeTab) return;
    
    const tabText = activeTab.textContent.trim();
    const status = TAB_MAP[tabText] || 'waiting';
    
    // Special handling for "All" tab - use individual detection
    if (status === 'all') {
      detectIndividualCardStatus();
      return;
    }
    
    // Get all conversation cards
    const cards = document.querySelectorAll('.card, .list-group-item, .list-group > *, [class*="conversation"]');
    
    // Remove any existing status classes
    cards.forEach(card => {
      card.classList.remove('waiting', 'taken', 'resolved');
      card.classList.add(status);
      
      // Add status icon if not present
      if (!card.querySelector('.status-icon')) {
        const icon = document.createElement('span');
        icon.className = 'material-icons status-icon';
        icon.textContent = DESIGN.icons[status];
        card.appendChild(icon);
      } else {
        // Update existing icon
        const icon = card.querySelector('.status-icon');
        icon.textContent = DESIGN.icons[status];
      }
    });
  }
  
  // Handle individual card status (if we can detect it directly)
  function detectIndividualCardStatus() {
    // Find all possible card elements
    const cards = document.querySelectorAll('.card, .list-group-item, .list-group > *, [class*="conversation"]');
    
    cards.forEach(card => {
      // Look for status indicators in text
      const cardText = card.textContent.toLowerCase();
      
      // Default to waiting
      let status = 'waiting';
      
      // Try to detect status from text content
      if (cardText.includes('preluat') || cardText.includes('în lucru')) {
        status = 'taken';
      } else if (cardText.includes('rezolvat') || cardText.includes('închis')) {
        status = 'resolved';
      }
      
      // Alternative detection based on time patterns
      // This is based on observation that different timeframes might indicate different statuses
      if (cardText.includes('minute') || cardText.includes('ore') && !cardText.includes('zile')) {
        // Recent conversations (minutes or hours) are often in waiting status
        status = 'waiting';
      } else if (cardText.includes('zile') || cardText.includes('săptămâni')) {
        // Older conversations (days or weeks) are more likely to be resolved
        status = 'resolved';
      }
      
      // Remove any existing status classes
      card.classList.remove('waiting', 'taken', 'resolved');
      card.classList.add(status);
      
      // Add status icon if not present
      if (!card.querySelector('.status-icon')) {
        const icon = document.createElement('span');
        icon.className = 'material-icons status-icon';
        icon.textContent = DESIGN.icons[status];
        card.appendChild(icon);
      } else {
        // Update existing icon
        const icon = card.querySelector('.status-icon');
        icon.textContent = DESIGN.icons[status];
      }
    });
  }
  
  // Set up tab click handlers to update styling
  function setupTabHandlers() {
    const tabs = document.querySelectorAll('.nav-link, .tab, button[role="tab"], button.tab, a.tab');
    
    tabs.forEach(tab => {
      // Remove any existing event listeners
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
      
      // Add new event listener
      newTab.addEventListener('click', () => {
        // Wait a moment for the tab switching to complete
        setTimeout(() => {
          applyStatusBasedOnTab();
        }, 50);
      });
    });
  }
  
  // Apply all enhancements
  function applyEnhancedChatStyles() {
    // Combine all styles
    const allStyles = 
      baseStyles + 
      waitingStyles + 
      takenStyles + 
      resolvedStyles + 
      tabStyles + 
      accessibilityStyles;
    
    // Inject styles to document
    injectStyles(allStyles);
    
    // Try both approaches to apply status
    if (document.querySelector('.nav-link.active, .tab.active, button.active')) {
      // If we have active tabs, use them to determine status
      applyStatusBasedOnTab();
    } else {
      // Otherwise try to detect individual card status
      detectIndividualCardStatus();
    }
    
    // Set up tab handlers for dynamic updates
    setupTabHandlers();
    
    // Set up mutation observer to handle new items
    setupMutationObserver();
  }
  
  // Watch for DOM changes to handle dynamically added content
  function setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      let needsUpdate = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          Array.from(mutation.addedNodes).forEach(node => {
            if (node.nodeType === 1) { // Element node
              // If a conversation card was added
              if (node.classList && 
                (node.classList.contains('card') || 
                node.classList.contains('list-group-item') ||
                (node.className && node.className.includes('conversation')))) {
                needsUpdate = true;
              }
              
              // If a container with cards was added
              if (node.querySelectorAll) {
                const cards = node.querySelectorAll('.card, .list-group-item, [class*="conversation"]');
                if (cards.length > 0) {
                  needsUpdate = true;
                }
              }
            }
          });
        }
      });
      
      if (needsUpdate) {
        // If we have active tabs, use them to determine status
        if (document.querySelector('.nav-link.active, .tab.active, button.active')) {
          applyStatusBasedOnTab();
        } else {
          // Otherwise try to detect individual card status
          detectIndividualCardStatus();
        }
      }
    });
    
    // Start observing the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Force style application even if the DOM structure is challenging
  function forceStyleApplication() {
    // Get all possible card containers based on the screenshots
    const cards = document.querySelectorAll('.list-group > *');
    
    if (cards.length === 0) {
      // If no cards found with standard selectors, try more aggressive approach
      const possibleCards = document.querySelectorAll('div:not(.nav):not(nav):not(.container):not(.row) > div:not(.nav):not(nav)');
      
      Array.from(possibleCards).forEach(element => {
        // Check if this looks like a conversation card (has text and is appropriately sized)
        if (element.textContent && 
            element.textContent.trim() !== '' && 
            element.offsetHeight > 50 && 
            element.offsetHeight < 200) {
          
          // Apply styling directly to likely conversation cards
          element.style.backgroundColor = DESIGN.colors.waiting.secondary;
          element.style.borderLeft = `5px solid ${DESIGN.colors.waiting.primary}`;
          element.style.borderRadius = DESIGN.borderRadius.standard;
          element.style.boxShadow = DESIGN.shadows.light;
          element.style.margin = '10px 0';
          element.style.transition = 'all ' + DESIGN.animation.standard;
          
          // Add hover effect
          element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-2px)';
            element.style.boxShadow = DESIGN.shadows.hover;
          });
          
          element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
            element.style.boxShadow = DESIGN.shadows.light;
          });
          
          // Add status icon
          if (!element.querySelector('.status-icon')) {
            const icon = document.createElement('span');
            icon.className = 'material-icons status-icon';
            icon.textContent = DESIGN.icons.waiting;
            icon.style.position = 'absolute';
            icon.style.top = '10px';
            icon.style.right = '10px';
            icon.style.color = DESIGN.colors.waiting.icon;
            icon.style.fontSize = '20px';
            
            // Make sure element has position relative
            element.style.position = 'relative';
            element.appendChild(icon);
          }
        }
      });
    }
  }
  
  // Initialize with a robust approach to ensure styles are applied
  function initialize() {
    // First try standard approach
    applyEnhancedChatStyles();
    
    // Then, apply force method after a slight delay
    setTimeout(forceStyleApplication, 100);
    
    // Check if we're on "Toate" tab initially
    const allTab = Array.from(document.querySelectorAll('button, .nav-link, .tab')).find(el => 
      el.textContent.trim() === 'Toate' && (el.classList.contains('active') || el.getAttribute('aria-selected') === 'true')
    );
    
    if (allTab) {
      // If we're on the "Toate" tab, explicitly call individual detection
      setTimeout(detectIndividualCardStatus, 200);
    }
    
    // Add a global function to force re-application (for debugging)
    window.reapplyChatStyles = () => {
      applyEnhancedChatStyles();
      forceStyleApplication();
      
      // Also check active tab and apply appropriate method
      const activeTab = document.querySelector('.nav-link.active, .tab.active, button.active');
      if (activeTab && activeTab.textContent.trim() === 'Toate') {
        detectIndividualCardStatus();
      }
    };
  }
  
  // Run the enhancement when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
    // Try again after a short delay to catch any asynchronously loaded content
    setTimeout(initialize, 500);
  }
  
  // Also run on full page load to catch late-loaded resources
  window.addEventListener('load', () => {
    initialize();
  });
})();
