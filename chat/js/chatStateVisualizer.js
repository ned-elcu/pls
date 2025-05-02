/**
 * Fixed chatStateVisualizer.js
 * Addresses timing issues and improves status detection
 */

(function() {
  // Configuration - Visual Design System
  const DESIGN = {
    // Colors and other design settings remain unchanged
    colors: {
      waiting: {
        primary: '#FF9800',
        secondary: 'rgba(255, 243, 224, 0.7)',
        accent: '#F57C00',
      },
      active: {
        primary: '#2196F3',
        secondary: 'rgba(227, 242, 253, 0.7)',
        accent: '#1976D2',
      },
      closed: {
        primary: '#4CAF50',
        secondary: 'rgba(232, 245, 233, 0.7)',
        accent: '#388E3C',
      }
    },
    
    icons: {
      waiting: 'schedule',
      active: 'forum',
      closed: 'check_circle'
    },
    
    animation: {
      standard: '0.25s ease',
      hover: '0.15s ease-out'
    },
    
    shadows: {
      hover: '0 6px 12px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)'
    }
  };

  // Helper function to inject CSS with high specificity
  function injectStyles() {
    // Same CSS injection code, no changes needed
    if (document.getElementById('chat-visualizer-styles')) {
      console.log('Chat visualizer styles already injected');
      return;
    }
    
    // CSS code remains unchanged
    const css = `
      /* Base styles for chat items */
      .chat-list .chat-item {
        transition: all ${DESIGN.animation.standard} !important;
        position: relative !important;
      }
      
      /* Hover effect */
      .chat-list .chat-item:hover {
        transform: translateY(-2px) !important;
        box-shadow: ${DESIGN.shadows.hover} !important;
      }
      
      /* Status-specific styling */
      .chat-list .chat-item[data-status="waiting"] {
        background-color: ${DESIGN.colors.waiting.secondary} !important;
        border-left: 5px solid ${DESIGN.colors.waiting.primary} !important;
      }
      
      .chat-list .chat-item[data-status="active"] {
        background-color: ${DESIGN.colors.active.secondary} !important;
        border-left: 5px solid ${DESIGN.colors.active.primary} !important;
      }
      
      .chat-list .chat-item[data-status="closed"] {
        background-color: ${DESIGN.colors.closed.secondary} !important;
        border-left: 5px solid ${DESIGN.colors.closed.primary} !important;
        opacity: 0.85 !important;
      }
      
      .chat-list .chat-item[data-status="closed"]:hover {
        opacity: 1 !important;
      }
      
      /* Status indicators */
      .chat-list .chat-item[data-status="waiting"] .chat-avatar {
        border: 2px solid ${DESIGN.colors.waiting.primary} !important;
        color: ${DESIGN.colors.waiting.primary} !important;
        background-color: ${DESIGN.colors.waiting.secondary} !important;
      }
      
      .chat-list .chat-item[data-status="active"] .chat-avatar {
        border: 2px solid ${DESIGN.colors.active.primary} !important;
        color: ${DESIGN.colors.active.primary} !important;
        background-color: ${DESIGN.colors.active.secondary} !important;
      }
      
      .chat-list .chat-item[data-status="closed"] .chat-avatar {
        border: 2px solid ${DESIGN.colors.closed.primary} !important;
        color: ${DESIGN.colors.closed.primary} !important;
        background-color: ${DESIGN.colors.closed.secondary} !important;
      }
      
      /* Chat avatar icon styling */
      .chat-list .chat-avatar .material-icons {
        font-size: 24px !important;
      }
      
      /* Enhanced filter buttons */
      .chat-filter .filter-btn[data-filter="waiting"] {
        border: 1px solid ${DESIGN.colors.waiting.primary} !important;
        color: ${DESIGN.colors.waiting.accent} !important;
      }
      
      .chat-filter .filter-btn[data-filter="active"] {
        border: 1px solid ${DESIGN.colors.active.primary} !important;
        color: ${DESIGN.colors.active.accent} !important;
      }
      
      .chat-filter .filter-btn[data-filter="closed"] {
        border: 1px solid ${DESIGN.colors.closed.primary} !important;
        color: ${DESIGN.colors.closed.accent} !important;
      }
      
      .chat-filter .filter-btn.active[data-filter="waiting"] {
        background-color: ${DESIGN.colors.waiting.primary} !important;
        color: white !important;
      }
      
      .chat-filter .filter-btn.active[data-filter="active"] {
        background-color: ${DESIGN.colors.active.primary} !important;
        color: white !important;
      }
      
      .chat-filter .filter-btn.active[data-filter="closed"] {
        background-color: ${DESIGN.colors.closed.primary} !important;
        color: white !important;
      }
      
      /* Subtle animation for waiting items to draw attention */
      @keyframes pulseWaiting {
        0% { border-left-color: ${DESIGN.colors.waiting.primary}; }
        50% { border-left-color: ${DESIGN.colors.waiting.accent}; }
        100% { border-left-color: ${DESIGN.colors.waiting.primary}; }
      }
      
      .chat-list .chat-item[data-status="waiting"] {
        animation: pulseWaiting 2s infinite;
      }
      
      /* Accessibility styles */
      @media (prefers-reduced-motion: reduce) {
        *, .chat-item {
          animation: none !important;
          transition: none !important;
        }
      }
      
      /* High contrast mode support */
      @media (forced-colors: active) {
        .chat-item {
          border-width: 2px !important;
        }
        
        .chat-item[data-status="waiting"] {
          border-left-width: 5px !important;
        }
        
        .chat-item[data-status="active"] {
          border-left-width: 5px !important;
        }
        
        .chat-item[data-status="closed"] {
          border-left-width: 5px !important;
        }
      }
    `;
    
    const style = document.createElement('style');
    style.id = 'chat-visualizer-styles';
    style.textContent = css;
    document.head.appendChild(style);
    
    console.log('Chat visualizer styles injected successfully');
  }
  
  // FIXED: Improved status detection and icon replacement
  function replaceInitialsWithIcons() {
    // More robust selector to get all chat items first
    const chatItems = document.querySelectorAll('.chat-list .chat-item');
    console.log(`Found ${chatItems.length} chat items to process`);
    
    chatItems.forEach(chatItem => {
      try {
        // First, set status on the chat item if not already set
        if (!chatItem.hasAttribute('data-status')) {
          determineAndSetStatus(chatItem);
        }
        
        // Find the avatar within this chat item
        const avatar = chatItem.querySelector('.chat-avatar');
        if (!avatar) {
          console.log('No avatar found in chat item');
          return;
        }
        
        // Skip if already has an icon
        if (avatar.querySelector('.material-icons')) {
          return;
        }
        
        // Get status from parent chat item
        const status = chatItem.getAttribute('data-status') || 'active';
        
        // Get icon based on status
        const iconName = DESIGN.icons[status] || DESIGN.icons.active;
        
        // Save original content (initials) as data attribute
        if (!avatar.hasAttribute('data-initials')) {
          avatar.setAttribute('data-initials', avatar.textContent.trim());
        }
        
        // Replace content with icon
        avatar.innerHTML = `<i class="material-icons">${iconName}</i>`;
        console.log(`Replaced initials with icon ${iconName} for status ${status}`);
      } catch (error) {
        console.error('Error replacing initials with icons:', error);
      }
    });
  }
  
  // FIXED: More robust status detection function
  function determineAndSetStatus(chatItem) {
    try {
      // Check for avatar with specific status classes
      const avatar = chatItem.querySelector('.chat-avatar');
      if (avatar) {
        if (avatar.classList.contains('status-waiting')) {
          chatItem.setAttribute('data-status', 'waiting');
          return 'waiting';
        } else if (avatar.classList.contains('status-active')) {
          chatItem.setAttribute('data-status', 'active');
          return 'active';
        } else if (avatar.classList.contains('status-closed')) {
          chatItem.setAttribute('data-status', 'closed');
          return 'closed';
        }
      }
      
      // Check for status indicators elsewhere in the item
      if (chatItem.querySelector('.status-waiting')) {
        chatItem.setAttribute('data-status', 'waiting');
        return 'waiting';
      } else if (chatItem.querySelector('.status-active')) {
        chatItem.setAttribute('data-status', 'active');
        return 'active';
      } else if (chatItem.querySelector('.status-closed')) {
        chatItem.setAttribute('data-status', 'closed');
        return 'closed';
      }
      
      // Check current filter as a fallback
      const currentFilter = getCurrentFilter();
      if (currentFilter !== 'all') {
        chatItem.setAttribute('data-status', currentFilter);
        return currentFilter;
      }
      
      // Default to active if can't determine
      chatItem.setAttribute('data-status', 'active');
      return 'active';
    } catch (error) {
      console.error('Error determining status:', error);
      return 'active'; // Default
    }
  }
  
  // Apply status to chat items - FIXED with better error handling
  function applyStatusToChatItems() {
    // Get all chat items
    const chatItems = document.querySelectorAll('.chat-list .chat-item');
    if (!chatItems || chatItems.length === 0) {
      console.log('No chat items found to style');
      return;
    }
    
    let processedCount = 0;
    
    chatItems.forEach(item => {
      try {
        // Set status using improved function
        determineAndSetStatus(item);
        processedCount++;
      } catch (error) {
        console.error('Error processing chat item:', error);
      }
    });
    
    console.log(`Applied status styling to ${processedCount} chat items`);
    
    // Now replace initials with icons
    replaceInitialsWithIcons();
  }
  
  // Helper function to get current filter
  function getCurrentFilter() {
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    return activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
  }
  
  // FIXED: Improved initialization with better timing
  function initialize() {
    console.log('Initializing chat visualizer...');
    
    // Inject our CSS
    injectStyles();
    
    // Add a more robust hook to process chat items whenever they change
    hookIntoUpdateFunction();
    
    // Set up mutation observer as backup
    setupMutationObserver();
    
    // Set up events and listeners
    setupEventListeners();
    
    // Add global refresh function
    window.refreshChatStyles = function() {
      applyStatusToChatItems();
      console.log('Chat styles refreshed with status icons');
    };
    
    // Initial check with delay to ensure DOM is ready
    setTimeout(() => {
      applyStatusToChatItems();
    }, 1000);
    
    // Also check every second for 10 seconds to catch any dynamic loading
    let checkCount = 0;
    const periodicCheck = setInterval(() => {
      if (document.querySelectorAll('.chat-list .chat-item').length > 0) {
        applyStatusToChatItems();
        console.log(`Periodic check ${checkCount + 1}: Found and processed chat items`);
      }
      checkCount++;
      if (checkCount >= 10) clearInterval(periodicCheck);
    }, 1000);
    
    console.log('Enhanced chat state visualizer initialized with status icons');
  }
  
  // FIXED: Better integration with the updateChatList function
  function hookIntoUpdateFunction() {
    // Try to hook into the original updateChatList function
    if (typeof window.updateChatList === 'function') {
      console.log('Found updateChatList function, hooking in...');
      const originalUpdateChatList = window.updateChatList;
      
      window.updateChatList = function() {
        // Call original function first
        originalUpdateChatList.apply(this, arguments);
        
        // Then apply our styling and icon replacement with a slight delay
        setTimeout(() => {
          console.log('Original updateChatList executed, now applying our styling');
          applyStatusToChatItems();
        }, 100);
      };
      
      console.log('Successfully hooked into updateChatList function');
    } else {
      // If function not available yet, set up a MutationObserver to watch for chat items
      console.log('updateChatList function not found, setting up alternative approach');
      
      // Check again after a delay
      setTimeout(() => {
        if (typeof window.updateChatList === 'function') {
          hookIntoUpdateFunction();
        }
      }, 1000);
    }
  }
  
  // Set up MutationObserver with improved logic
  function setupMutationObserver() {
    const chatList = document.getElementById('chatList');
    if (!chatList) {
      console.warn('Chat list element not found for observer');
      
      // Try again later if the element isn't found
      setTimeout(setupMutationObserver, 1000);
      return;
    }
    
    console.log('Setting up mutation observer for chat list');
    
    // Create the observer with a debounced callback
    let updateTimeout = null;
    const observer = new MutationObserver(mutations => {
      // Clear existing timeout to debounce multiple rapid changes
      clearTimeout(updateTimeout);
      
      // Set new timeout
      updateTimeout = setTimeout(() => {
        console.log('Mutation detected, updating chat styles');
        applyStatusToChatItems();
      }, 200);
    });
    
    // Observe the chat list for changes
    observer.observe(chatList, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    
    window.chatVisualizerObserver = observer;
    console.log('Chat list observer initialized');
  }
  
  // Setup event listeners for filter buttons and other interactions
  function setupEventListeners() {
    // Watch for filter button clicks
    document.addEventListener('click', function(e) {
      const filterBtn = e.target.closest('.filter-btn');
      if (filterBtn) {
        console.log('Filter button clicked, updating styles after a short delay');
        
        // Let the original handler process the click first
        setTimeout(() => {
          applyStatusToChatItems();
        }, 100);
      }
    });
    
    // Also watch for when the app becomes visible
    const appScreen = document.getElementById('appScreen');
    if (appScreen) {
      const appObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'style' && 
              appScreen.style.display === 'block') {
            console.log('App screen now visible, initializing visualizer');
            setTimeout(applyStatusToChatItems, 500);
          }
        });
      });
      
      appObserver.observe(appScreen, { attributes: true });
    }
  }
  
  // Check if already initialized to prevent duplicate initialization
  if (window.chatVisualizerInitialized) {
    console.log('Chat visualizer already initialized, refreshing styles');
    applyStatusToChatItems();
    return;
  }
  
  window.chatVisualizerInitialized = true;
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
    console.log('Waiting for DOM to be ready before initializing');
  } else {
    // If already loaded, run now
    console.log('DOM already loaded, initializing now');
    initialize();
  }
  
  // Also run on window load for good measure
  window.addEventListener('load', function() {
    console.log('Window loaded, ensuring styles are applied');
    setTimeout(() => {
      applyStatusToChatItems();
    }, 500);
  });
})();
