/**
 * Enhanced chatStateVisualizer.js
 * 
 * Visual design system for chat states in the Poliția Locală Slobozia admin panel
 * Modified to replace user initials with Material Icons representing chat status
 */

(function() {
  // Configuration - Visual Design System
  const DESIGN = {
    // Color Palette - Designed for Romanian interface
    colors: {
      waiting: {  // In asteptare
        primary: '#FF9800',       // Vibrant orange for attention
        secondary: 'rgba(255, 243, 224, 0.7)',  // Soft orange background
        accent: '#F57C00',        // Darker orange for accents
      },
      active: {   // Preluate
        primary: '#2196F3',       // Engaging blue for active chats
        secondary: 'rgba(227, 242, 253, 0.7)',  // Soft blue background
        accent: '#1976D2',        // Darker blue for accents
      },
      closed: {   // Rezolvate
        primary: '#4CAF50',       // Calm green for completed chats
        secondary: 'rgba(232, 245, 233, 0.7)',  // Soft green background
        accent: '#388E3C',        // Darker green for accents
      }
    },
    
    // Status icons - Material Icons
    icons: {
      waiting: 'schedule',        // Hourglass/clock icon for waiting
      active: 'forum',            // Chat icon for active conversations
      closed: 'check_circle'      // Checkmark for completed chats
    },
    
    // Animation Timings
    animation: {
      standard: '0.25s ease',
      hover: '0.15s ease-out'
    },
    
    // Shadows
    shadows: {
      hover: '0 6px 12px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)'
    }
  };

  // Helper function to inject CSS with high specificity
  function injectStyles() {
    // Check if styles are already injected
    if (document.getElementById('chat-visualizer-styles')) {
      console.log('Chat visualizer styles already injected');
      return;
    }
    
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
      }
      
      .chat-list .chat-item[data-status="active"] .chat-avatar {
        border: 2px solid ${DESIGN.colors.active.primary} !important;
        color: ${DESIGN.colors.active.primary} !important;
      }
      
      .chat-list .chat-item[data-status="closed"] .chat-avatar {
        border: 2px solid ${DESIGN.colors.closed.primary} !important;
        color: ${DESIGN.colors.closed.primary} !important;
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
  
  // Replace initials with status icons in chat avatars
  function replaceInitialsWithIcons() {
    // Get all chat avatars
    const chatAvatars = document.querySelectorAll('.chat-list .chat-item .chat-avatar');
    
    chatAvatars.forEach(avatar => {
      try {
        // Get parent chat item to determine status
        const chatItem = avatar.closest('.chat-item');
        if (!chatItem) return;
        
        // Determine status
        let status = chatItem.getAttribute('data-status');
        if (!status) {
          // Try to determine status from classes
          if (avatar.classList.contains('status-waiting')) {
            status = 'waiting';
          } else if (avatar.classList.contains('status-active')) {
            status = 'active';
          } else if (avatar.classList.contains('status-closed')) {
            status = 'closed';
          } else {
            // Default to active if can't determine
            status = 'active';
          }
          chatItem.setAttribute('data-status', status);
        }
        
        // Skip if already has an icon
        if (avatar.querySelector('.material-icons')) return;
        
        // Get icon based on status
        const iconName = DESIGN.icons[status] || DESIGN.icons.active;
        
        // Save original content (initials) as data attribute
        if (!avatar.hasAttribute('data-initials')) {
          avatar.setAttribute('data-initials', avatar.textContent);
        }
        
        // Replace content with icon
        avatar.innerHTML = `<i class="material-icons">${iconName}</i>`;
      } catch (error) {
        console.error('Error replacing initials with icons:', error);
      }
    });
  }
  
  // Apply status to chat items based on their actual status class
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
        // Determine status from chat item structure
        let status = 'active'; // Default
        
        // First, check for elements with specific status classes
        if (item.querySelector('.status-waiting') || item.querySelector('.chat-avatar.status-waiting')) {
          status = 'waiting';
        } else if (item.querySelector('.status-active') || item.querySelector('.chat-avatar.status-active')) {
          status = 'active';
        } else if (item.querySelector('.status-closed') || item.querySelector('.chat-avatar.status-closed')) {
          status = 'closed';
        } else {
          // Check current filter - if view is filtered, items should match that status
          const currentFilter = getCurrentFilter();
          if (currentFilter !== 'all') {
            status = currentFilter;
          }
        }
        
        // Set status as data attribute for styling
        item.setAttribute('data-status', status);
        processedCount++;
      } catch (error) {
        console.error('Error processing chat item:', error);
      }
    });
    
    console.log(`Applied status styling to ${processedCount} chat items`);
    
    // Replace initials with icons
    replaceInitialsWithIcons();
  }
  
  // Helper function to get current filter
  function getCurrentFilter() {
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    return activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
  }
  
  // Set up MutationObserver to detect new chat items and changes
  function setupMutationObserver() {
    // Create the observer with a debounced callback
    let updateTimeout = null;
    const observer = new MutationObserver(mutations => {
      let shouldUpdate = false;
      
      mutations.forEach(mutation => {
        // Check for added nodes (new chat items)
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          Array.from(mutation.addedNodes).forEach(node => {
            if (node.classList && node.classList.contains('chat-item')) {
              shouldUpdate = true;
            }
            
            // Check for container with chat items
            if (node.querySelectorAll) {
              const items = node.querySelectorAll('.chat-item');
              if (items.length > 0) {
                shouldUpdate = true;
              }
            }
          });
        }
        
        // Also check for attribute changes that might indicate status update
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
          shouldUpdate = true;
        }
      });
      
      // Debounce updates
      if (shouldUpdate) {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
          applyStatusToChatItems();
        }, 100);
      }
    });
    
    // Observe the chat list
    const chatList = document.getElementById('chatList');
    if (chatList) {
      observer.observe(chatList, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      
      window.chatVisualizerObserver = observer;
      console.log('Chat list observer initialized');
    } else {
      console.warn('Chat list element not found for observer');
    }
  }
  
  // Override the updateChatList function to inject our icons
  function overrideUpdateChatList() {
    // Wait for the original function to be available
    if (typeof window.updateChatList === 'function') {
      const originalUpdateChatList = window.updateChatList;
      window.updateChatList = function() {
        // Call original function
        originalUpdateChatList.apply(this, arguments);
        
        // Then apply our styling and icon replacement
        setTimeout(() => {
          applyStatusToChatItems();
          replaceInitialsWithIcons();
        }, 50);
      };
      console.log('Hooked into updateChatList function');
    } else {
      // If not available yet, try again later
      setTimeout(overrideUpdateChatList, 500);
    }
  }
  
  // Add listeners for Firebase data changes
  function listenForDataChanges() {
    // Watch for the userChats array being updated
    // We need to use a trick since we don't have direct access to the internal variables
    
    // First wait for the app to be initialized
    const checkForApp = setInterval(() => {
      if (document.getElementById('appScreen').style.display !== 'none') {
        clearInterval(checkForApp);
        
        // Try to override updateChatList
        overrideUpdateChatList();
        
        // Also set up mutation observer as backup
        setupMutationObserver();
      }
    }, 500);
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Listen for filter button clicks
    document.addEventListener('click', function(e) {
      const filterBtn = e.target.closest('.filter-btn');
      if (filterBtn) {
        // Let the original handler process the click first
        setTimeout(() => {
          applyStatusToChatItems();
          replaceInitialsWithIcons();
        }, 50);
      }
    });
  }
  
  // Initialize the visualizer
  function initialize() {
    // Inject our CSS
    injectStyles();
    
    // Set up events and listeners
    setupEventListeners();
    
    // Listen for Firebase data changes
    listenForDataChanges();
    
    // Add global refresh function
    window.refreshChatStyles = function() {
      applyStatusToChatItems();
      replaceInitialsWithIcons();
      console.log('Chat styles refreshed with status icons');
    };
    
    // Initial application (might not work until data loads)
    setTimeout(() => {
      applyStatusToChatItems();
      replaceInitialsWithIcons();
    }, 1000);
    
    // Also check periodically during first 10 seconds
    let checkCount = 0;
    const periodicCheck = setInterval(() => {
      applyStatusToChatItems();
      replaceInitialsWithIcons();
      checkCount++;
      if (checkCount >= 10) clearInterval(periodicCheck);
    }, 1000);
    
    console.log('Enhanced chat state visualizer initialized with status icons');
  }
  
  // Check if already initialized
  if (window.chatVisualizerInitialized) return;
  window.chatVisualizerInitialized = true;
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // If already loaded, run now
    initialize();
  }
  
  // Also run on window load
  window.addEventListener('load', function() {
    setTimeout(() => {
      applyStatusToChatItems();
      replaceInitialsWithIcons();
    }, 500);
  });
})();
