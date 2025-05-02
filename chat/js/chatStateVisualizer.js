/**
 * chatStateVisualizer.js - Fixed Version
 * 
 * Enhanced visual design system for chat states in the admin panel
 * Modified to work with the actual DOM structure of admin.html
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
      
      /* Accessibility styles */
      @media (prefers-reduced-motion: reduce) {
        *, .chat-item {
          animation: none !important;
          transition: none !important;
        }
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
  
  // Apply status to chat items
  function applyStatusToChatItems() {
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
      // Get the status from chat info or determine based on content
      let status = item.querySelector('.status-waiting') ? 'waiting' : 
                  item.querySelector('.status-active') ? 'active' : 
                  item.querySelector('.status-closed') ? 'closed' : null;
      
      if (!status) {
        // Try to determine status from text content
        const content = item.textContent.toLowerCase();
        if (content.includes('conversație nouă')) {
          status = 'waiting';
        } else if (content.includes('rezolvate') || content.includes('încheiată')) {
          status = 'closed';
        } else {
          status = 'active'; // Default to active
        }
      }
      
      // Set status as data attribute for styling
      item.setAttribute('data-status', status);
    });
  }
  
  // Set up filter button handler
  function setupFilterHandlers() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // The existing click handler is already in admin.html
        // We just need to add our visual enhancements
        setTimeout(applyStatusToChatItems, 100);
      });
    });
  }
  
  // Set up MutationObserver to detect new chat items
  function setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      let shouldUpdate = false;
      
      mutations.forEach(mutation => {
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
      });
      
      if (shouldUpdate) {
        applyStatusToChatItems();
      }
    });
    
    // Start observing the chat list
    const chatList = document.getElementById('chatList');
    if (chatList) {
      observer.observe(chatList, {
        childList: true,
        subtree: true
      });
    }
  }
  
  // Initialize the enhancement
  function initialize() {
    // Inject styles
    injectStyles();
    
    // Apply status to existing chat items
    applyStatusToChatItems();
    
    // Set up filter button handlers
    setupFilterHandlers();
    
    // Set up observer for dynamic content
    setupMutationObserver();
    
    // Add global function to force re-application
    window.refreshChatStyles = applyStatusToChatItems;
    
    console.log('Chat state visualizer initialized');
  }
  
  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // If already loaded, run now
    initialize();
  }
  
  // Also run on window load to catch late-loaded content
  window.addEventListener('load', initialize);
})();
