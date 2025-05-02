/**
 * chatStateVisualizer.js - Production Version
 * 
 * Enhanced visual design system for chat states in the Poliția Locală Slobozia admin panel
 * Modified to work with the actual DOM structure of admin.html
 */

(function() {
  // Check if the script has already been initialized to prevent duplicate initialization
  if (window.chatVisualizerInitialized) return;
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
    
    // Animation Timings
    animation: {
      standard: '0.25s ease',
      hover: '0.15s ease-out'
    },
    
    // Shadows
    shadows: {
      hover: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
    }
  };

  // Helper function to inject CSS with high specificity
  function injectStyles() {
    try {
      // Check if styles are already injected
      if (document.getElementById('chat-visualizer-styles')) {
        console.log('Chat visualizer styles already injected');
        return;
      }
      
      const css = `
        /* Base styles for chat items */
        .chat-item {
          transition: all ${DESIGN.animation.standard} !important;
          position: relative !important;
        }
        
        /* Hover effect */
        .chat-item:hover {
          transform: translateY(-2px) !important;
          box-shadow: ${DESIGN.shadows.hover} !important;
        }
        
        /* Status-specific styling */
        .chat-item[data-status="waiting"] {
          background-color: ${DESIGN.colors.waiting.secondary} !important;
          border-left: 5px solid ${DESIGN.colors.waiting.primary} !important;
        }
        
        .chat-item[data-status="active"] {
          background-color: ${DESIGN.colors.active.secondary} !important;
          border-left: 5px solid ${DESIGN.colors.active.primary} !important;
        }
        
        .chat-item[data-status="closed"] {
          background-color: ${DESIGN.colors.closed.secondary} !important;
          border-left: 5px solid ${DESIGN.colors.closed.primary} !important;
          opacity: 0.85 !important;
        }
        
        .chat-item[data-status="closed"]:hover {
          opacity: 1 !important;
        }
        
        /* Status indicators */
        .chat-item[data-status="waiting"] .chat-avatar {
          border: 2px solid ${DESIGN.colors.waiting.primary} !important;
        }
        
        .chat-item[data-status="active"] .chat-avatar {
          border: 2px solid ${DESIGN.colors.active.primary} !important;
        }
        
        .chat-item[data-status="closed"] .chat-avatar {
          border: 2px solid ${DESIGN.colors.closed.primary} !important;
        }
        
        /* Enhanced filter buttons */
        .filter-btn[data-filter="waiting"] {
          border: 1px solid ${DESIGN.colors.waiting.primary} !important;
          color: ${DESIGN.colors.waiting.accent} !important;
        }
        
        .filter-btn[data-filter="active"] {
          border: 1px solid ${DESIGN.colors.active.primary} !important;
          color: ${DESIGN.colors.active.accent} !important;
        }
        
        .filter-btn[data-filter="closed"] {
          border: 1px solid ${DESIGN.colors.closed.primary} !important;
          color: ${DESIGN.colors.closed.accent} !important;
        }
        
        .filter-btn.active[data-filter="waiting"] {
          background-color: ${DESIGN.colors.waiting.primary} !important;
          color: white !important;
        }
        
        .filter-btn.active[data-filter="active"] {
          background-color: ${DESIGN.colors.active.primary} !important;
          color: white !important;
        }
        
        .filter-btn.active[data-filter="closed"] {
          background-color: ${DESIGN.colors.closed.primary} !important;
          color: white !important;
        }
        
        /* Subtle animation for waiting items to draw attention */
        @keyframes pulseWaiting {
          0% { border-left-color: ${DESIGN.colors.waiting.primary}; }
          50% { border-left-color: ${DESIGN.colors.waiting.accent}; }
          100% { border-left-color: ${DESIGN.colors.waiting.primary}; }
        }
        
        .chat-item[data-status="waiting"] {
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
    } catch (error) {
      console.error('Failed to inject styles:', error);
    }
  }
  
  // Apply status to chat items
  function applyStatusToChatItems() {
    // Get all chat items, return if none found
    const chatItems = document.querySelectorAll('.chat-item');
    if (!chatItems || chatItems.length === 0) {
      console.log('No chat items found to style');
      return;
    }
    
    // Count of processed items
    let processedCount = 0;
    
    chatItems.forEach(item => {
      try {
        // Skip already processed items unless they're from the current filter
        const currentStatus = item.getAttribute('data-status');
        const currentFilter = getCurrentFilter();
        
        if (currentStatus && currentFilter !== 'all' && currentStatus !== currentFilter) {
          // Update to match current filter if needed
          item.setAttribute('data-status', currentFilter);
          processedCount++;
          return;
        }
        
        // First check for status indicators in the DOM
        let status = null;
        
        // Look for status indicator elements
        if (item.querySelector('.status-waiting')) {
          status = 'waiting';
        } else if (item.querySelector('.status-active')) {
          status = 'active';
        } else if (item.querySelector('.status-closed')) {
          status = 'closed';
        }
        
        // If no status found via DOM elements, try to infer from content
        if (!status) {
          const content = item.textContent.toLowerCase();
          
          // Check for status keywords
          if (content.includes('conversație nouă') || content.includes('în așteptare')) {
            status = 'waiting';
          } else if (content.includes('rezolvate') || content.includes('încheiată') || content.includes('închis')) {
            status = 'closed';
          } else if (content.includes('activ') || content.includes('preluat')) {
            status = 'active';
          } else {
            // Last resort - check for patterns indicating recent vs old conversations
            if (content.includes('acum') && 
               (content.includes('minute') || content.includes('ore'))) {
              // More recent conversations are likely to be in waiting status
              status = 'waiting';
            } else if (content.includes('zile') || content.includes('săptămâni')) {
              // Older conversations are often resolved
              status = 'closed';
            } else {
              // Default to active as a middle ground
              status = 'active';
            }
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
  }
  
  // Helper function to get current filter
  function getCurrentFilter() {
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    return activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
  }
  
  // Set up filter button handler
  function setupFilterHandlers() {
    try {
      const filterButtons = document.querySelectorAll('.filter-btn');
      
      if (!filterButtons || filterButtons.length === 0) {
        console.warn('No filter buttons found to attach handlers');
        return;
      }
      
      // Remove any existing event handlers by cloning and replacing
      filterButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        
        // Get original filter value
        const filter = button.getAttribute('data-filter');
        
        // Add new click event handler
        newButton.addEventListener('click', () => {
          // Log which filter was clicked
          console.log(`Filter clicked: ${filter}`);
          
          // The existing click handler in admin.html handles the actual filtering
          // We just need to add our visual enhancements after a short delay
          // to ensure the DOM has been updated
          setTimeout(() => {
            try {
              applyStatusToChatItems();
            } catch (error) {
              console.error('Error applying styles after filter change:', error);
            }
          }, 150);
        });
        
        // Replace the original button
        if (button.parentNode) {
          button.parentNode.replaceChild(newButton, button);
        }
      });
      
      console.log(`Initialized ${filterButtons.length} filter button handlers`);
    } catch (error) {
      console.error('Failed to set up filter handlers:', error);
    }
  }
  
  // Set up MutationObserver to detect new chat items
  function setupMutationObserver() {
    try {
      // Create the observer with a debounced callback to avoid excessive updates
      let updateTimeout = null;
      const observer = new MutationObserver(mutations => {
        let shouldUpdate = false;
        
        mutations.forEach(mutation => {
          // Handle added nodes
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if any chat items were added
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
          
          // Also check if class changes happened (like active status changes)
          if (mutation.type === 'attributes' && 
              mutation.attributeName === 'class' && 
              mutation.target.classList.contains('chat-item')) {
            shouldUpdate = true;
          }
        });
        
        // Debounce updates to avoid performance issues with rapid changes
        if (shouldUpdate) {
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(() => {
            applyStatusToChatItems();
          }, 100); // Wait 100ms before applying updates
        }
      });
      
      // Start observing the chat list with appropriate options
      const chatList = document.getElementById('chatList');
      if (chatList) {
        observer.observe(chatList, {
          childList: true,  // Watch for added/removed nodes
          subtree: true,    // Watch all descendants
          attributes: true, // Watch for attribute changes
          attributeFilter: ['class'] // Only care about class changes
        });
        
        // Store observer reference for potential cleanup
        window.chatVisualizerObserver = observer;
        console.log('Chat list observer initialized');
      } else {
        console.warn('Chat list element not found for observer');
      }
    } catch (error) {
      console.error('Failed to set up mutation observer:', error);
    }
  }
  
  // Initialize the enhancement
  function initialize() {
    try {
      // Mark as initialized
      window.chatVisualizerInitialized = true;
      
      // Inject styles
      injectStyles();
      
      // Apply status to existing chat items
      applyStatusToChatItems();
      
      // Set up filter button handlers
      setupFilterHandlers();
      
      // Set up observer for dynamic content
      setupMutationObserver();
      
      // Add global function to force re-application
      window.refreshChatStyles = function() {
        try {
          applyStatusToChatItems();
          console.log('Chat styles refreshed successfully');
        } catch (error) {
          console.error('Error refreshing chat styles:', error);
        }
      };
      
      console.log('Chat state visualizer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize chat state visualizer:', error);
    }
  }
  
  // Run on DOMContentLoaded for early initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // If already loaded, run now with a small delay to ensure DOM is fully ready
    setTimeout(initialize, 100);
  }
  
  // Also run on window load to catch late-loaded content
  window.addEventListener('load', function() {
    // If not already initialized, do it now
    if (!window.chatVisualizerInitialized) {
      initialize();
    } else {
      // Refresh styles to catch any content loaded after initial initialization
      window.refreshChatStyles();
    }
  });
})();
