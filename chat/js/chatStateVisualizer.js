/**
 * chatStateVisualizer.js
 * 
 * A comprehensive visual design system for chat states in the admin panel
 * This file enhances the visual representation of chats in waiting, taken, and resolved states
 */

(function() {
  // Configuration - Visual Design System
  const DESIGN = {
    // Color Palette
    colors: {
      waiting: {
        primary: '#FF9800',       // Vibrant orange for attention
        secondary: '#FFF3E0',     // Soft orange background
        accent: '#F57C00',        // Darker orange for accents
        text: '#7D4A00',          // Dark readable text on light backgrounds
        border: '#FFB74D',        // Lighter border
        icon: '#FF5722'           // Bright icon color
      },
      taken: {
        primary: '#2196F3',       // Engaging blue for active chats
        secondary: '#E3F2FD',     // Soft blue background
        accent: '#1976D2',        // Darker blue for accents
        text: '#0D47A1',          // Dark readable text on light backgrounds
        border: '#64B5F6',        // Lighter border
        icon: '#0D47A1'           // Icon color
      },
      resolved: {
        primary: '#4CAF50',       // Calm green for completed chats
        secondary: '#E8F5E9',     // Soft green background
        accent: '#388E3C',        // Darker green for accents
        text: '#1B5E20',          // Dark readable text on light backgrounds
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
    
    // Icons - Using Unicode characters for simplicity
    // Production version should use proper icon font or SVGs
    icons: {
      waiting: '⏳',
      taken: '👤',
      resolved: '✓'
    }
  };
  
  // Helper function to inject CSS
  function injectStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
  
  // Base styles for all chat items
  const baseStyles = `
    .chat-item {
      margin: 12px 0;
      padding: 16px;
      border-radius: ${DESIGN.borderRadius.standard};
      transition: all ${DESIGN.animation.standard};
      position: relative;
      overflow: hidden;
      box-shadow: ${DESIGN.shadows.light};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    .chat-item:hover {
      transform: translateY(-2px);
      box-shadow: ${DESIGN.shadows.hover};
      transition: all ${DESIGN.animation.hover};
    }
    
    .chat-item::before {
      position: absolute;
      font-size: 18px;
      top: 16px;
      left: 16px;
      opacity: 0.9;
    }
    
    .chat-item .chat-time {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 12px;
      opacity: 0.7;
      font-weight: 500;
    }
    
    .chat-item .chat-title {
      margin-top: 5px;
      margin-bottom: 8px;
      margin-left: 30px;
      font-weight: 600;
      font-size: 16px;
    }
    
    .chat-item .chat-snippet {
      margin-left: 30px;
      opacity: 0.8;
      font-size: 14px;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .chat-item .chat-metrics {
      display: flex;
      margin-top: 12px;
      font-size: 12px;
      margin-left: 30px;
    }
    
    .chat-item .chat-metric {
      margin-right: 16px;
      display: flex;
      align-items: center;
    }
    
    .chat-item .chat-metric::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
    }
    
    .chat-item::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
    }
  `;
  
  // Status-specific styles
  const waitingStyles = `
    .chat-item.waiting {
      background-color: ${DESIGN.colors.waiting.secondary};
      border: 1px solid ${DESIGN.colors.waiting.border};
      color: ${DESIGN.colors.waiting.text};
    }
    
    .chat-item.waiting::before {
      content: '${DESIGN.icons.waiting}';
      color: ${DESIGN.colors.waiting.icon};
    }
    
    .chat-item.waiting::after {
      background-color: ${DESIGN.colors.waiting.primary};
    }
    
    .chat-item.waiting .chat-time {
      color: ${DESIGN.colors.waiting.accent};
    }
    
    .chat-item.waiting .chat-metric::before {
      background-color: ${DESIGN.colors.waiting.accent};
    }
    
    .chat-item.waiting:hover {
      background-color: ${DESIGN.colors.waiting.secondary}dd;
    }
    
    /* Pulsing animation for waiting chats */
    @keyframes waitingPulse {
      0% { box-shadow: ${DESIGN.shadows.light}; }
      50% { box-shadow: 0 0 0 rgba(255, 152, 0, 0.4), 0 0 8px rgba(255, 152, 0, 0.6); }
      100% { box-shadow: ${DESIGN.shadows.light}; }
    }
    
    .chat-item.waiting {
      animation: waitingPulse 2s infinite;
    }
  `;
  
  const takenStyles = `
    .chat-item.taken {
      background-color: ${DESIGN.colors.taken.secondary};
      border: 1px solid ${DESIGN.colors.taken.border};
      color: ${DESIGN.colors.taken.text};
    }
    
    .chat-item.taken::before {
      content: '${DESIGN.icons.taken}';
      color: ${DESIGN.colors.taken.icon};
    }
    
    .chat-item.taken::after {
      background-color: ${DESIGN.colors.taken.primary};
    }
    
    .chat-item.taken .chat-time {
      color: ${DESIGN.colors.taken.accent};
    }
    
    .chat-item.taken .chat-metric::before {
      background-color: ${DESIGN.colors.taken.accent};
    }
    
    .chat-item.taken:hover {
      background-color: ${DESIGN.colors.taken.secondary}dd;
    }
    
    /* Subtle gradient animation for taken chats */
    @keyframes takenGradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .chat-item.taken {
      background-image: linear-gradient(120deg, ${DESIGN.colors.taken.secondary}, ${DESIGN.colors.taken.secondary}dd, ${DESIGN.colors.taken.secondary});
      background-size: 200% 100%;
      animation: takenGradient 3s ease infinite;
    }
  `;
  
  const resolvedStyles = `
    .chat-item.resolved {
      background-color: ${DESIGN.colors.resolved.secondary};
      border: 1px solid ${DESIGN.colors.resolved.border};
      color: ${DESIGN.colors.resolved.text};
    }
    
    .chat-item.resolved::before {
      content: '${DESIGN.icons.resolved}';
      color: ${DESIGN.colors.resolved.icon};
    }
    
    .chat-item.resolved::after {
      background-color: ${DESIGN.colors.resolved.primary};
    }
    
    .chat-item.resolved .chat-time {
      color: ${DESIGN.colors.resolved.accent};
    }
    
    .chat-item.resolved .chat-metric::before {
      background-color: ${DESIGN.colors.resolved.accent};
    }
    
    .chat-item.resolved:hover {
      background-color: ${DESIGN.colors.resolved.secondary}dd;
    }
    
    /* Slightly muted appearance for resolved chats */
    .chat-item.resolved {
      opacity: 0.85;
    }
    
    .chat-item.resolved:hover {
      opacity: 1;
    }
  `;
  
  // Badge counters styles
  const badgeStyles = `
    .status-badges {
      display: flex;
      margin-bottom: 20px;
    }
    
    .status-badge {
      border-radius: 20px;
      padding: 8px 16px;
      margin-right: 10px;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      box-shadow: ${DESIGN.shadows.light};
      transition: all ${DESIGN.animation.standard};
    }
    
    .status-badge:hover {
      box-shadow: ${DESIGN.shadows.medium};
      transform: translateY(-1px);
    }
    
    .status-badge.waiting {
      background-color: ${DESIGN.colors.waiting.primary};
      color: white;
    }
    
    .status-badge.taken {
      background-color: ${DESIGN.colors.taken.primary};
      color: white;
    }
    
    .status-badge.resolved {
      background-color: ${DESIGN.colors.resolved.primary};
      color: white;
    }
    
    .status-badge .count {
      margin-left: 8px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
    }
  `;
  
  // Transition effects for status changes
  const transitionStyles = `
    @keyframes highlightNew {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .chat-item.new-item {
      animation: highlightNew 0.5s forwards;
    }
    
    @keyframes statusChange {
      0% { transform: translateX(0); }
      10% { transform: translateX(-5px); }
      30% { transform: translateX(5px); }
      50% { transform: translateX(-3px); }
      70% { transform: translateX(3px); }
      90% { transform: translateX(-1px); }
      100% { transform: translateX(0); }
    }
    
    .chat-item.status-changed {
      animation: statusChange 0.5s forwards;
    }
  `;
  
  // Dark mode support
  const darkModeStyles = `
    @media (prefers-color-scheme: dark) {
      .chat-item {
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      }
      
      .chat-item.waiting {
        background-color: rgba(255, 152, 0, 0.15);
        border-color: rgba(255, 152, 0, 0.3);
        color: #FFD180;
      }
      
      .chat-item.taken {
        background-color: rgba(33, 150, 243, 0.15);
        border-color: rgba(33, 150, 243, 0.3);
        color: #90CAF9;
      }
      
      .chat-item.resolved {
        background-color: rgba(76, 175, 80, 0.15);
        border-color: rgba(76, 175, 80, 0.3);
        color: #A5D6A7;
      }
      
      .status-badge {
        box-shadow: 0 2px 4px rgba(0,0,0,0.4);
      }
    }
  `;
  
  // Accessibility styles
  const accessibilityStyles = `
    /* High contrast mode */
    @media (forced-colors: active) {
      .chat-item.waiting {
        border: 3px solid;
      }
      
      .chat-item.taken {
        border: 3px solid;
      }
      
      .chat-item.resolved {
        border: 3px solid;
      }
    }
    
    /* Reduce motion preferences */
    @media (prefers-reduced-motion: reduce) {
      .chat-item,
      .chat-item:hover,
      .status-badge,
      .status-badge:hover {
        transition: none;
        animation: none;
        transform: none;
      }
    }
  `;
  
  // Utility functions for working with chat items
  function applyEnhancedChatStyles() {
    // Combine all styles
    const allStyles = 
      baseStyles + 
      waitingStyles + 
      takenStyles + 
      resolvedStyles + 
      badgeStyles + 
      transitionStyles + 
      darkModeStyles + 
      accessibilityStyles;
    
    // Inject combined styles
    injectStyles(allStyles);
    
    // Update counters
    updateStatusCounts();
    
    // Add badges if they don't exist
    addStatusBadgesIfNeeded();
    
    // Observe DOM for new chat items or status changes
    observeChatChanges();
  }
  
  function updateStatusCounts() {
    const waiting = document.querySelectorAll('.chat-item.waiting').length;
    const taken = document.querySelectorAll('.chat-item.taken').length;
    const resolved = document.querySelectorAll('.chat-item.resolved').length;
    
    // Update badge counters
    updateBadgeCount('waiting', waiting);
    updateBadgeCount('taken', taken);
    updateBadgeCount('resolved', resolved);
  }
  
  function updateBadgeCount(status, count) {
    const badge = document.querySelector(`.status-badge.${status} .count`);
    if (badge) {
      badge.textContent = count;
    }
  }
  
  function addStatusBadgesIfNeeded() {
    // Check if badges already exist
    if (document.querySelector('.status-badges')) {
      return;
    }
    
    // Create badge container
    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'status-badges';
    
    // Create individual badges
    const statuses = ['waiting', 'taken', 'resolved'];
    const statusLabels = {
      waiting: 'Waiting',
      taken: 'In Progress',
      resolved: 'Resolved'
    };
    
    statuses.forEach(status => {
      const badge = document.createElement('div');
      badge.className = `status-badge ${status}`;
      
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = statusLabels[status];
      
      const count = document.createElement('span');
      count.className = 'count';
      count.textContent = '0';
      
      badge.appendChild(label);
      badge.appendChild(count);
      badgeContainer.appendChild(badge);
      
      // Add click event to filter chats
      badge.addEventListener('click', () => {
        filterChatsByStatus(status);
      });
    });
    
    // Find chat container and insert badges before it
    const chatContainer = document.querySelector('.chat-container') || 
                         document.querySelector('.chats-list') || 
                         document.getElementById('chats');
    
    if (chatContainer && chatContainer.parentNode) {
      chatContainer.parentNode.insertBefore(badgeContainer, chatContainer);
    }
  }
  
  function filterChatsByStatus(status) {
    // Get all chat items
    const allChats = document.querySelectorAll('.chat-item');
    
    // If all chats of this status are already visible and others are hidden,
    // then show all chats (toggle off filter)
    const allOthersHidden = Array.from(allChats).every(chat => {
      return chat.classList.contains(status) || chat.style.display === 'none';
    });
    
    const targetChatsVisible = Array.from(allChats).every(chat => {
      return !chat.classList.contains(status) || chat.style.display !== 'none';
    });
    
    if (allOthersHidden && targetChatsVisible) {
      // Show all chats (turn off filter)
      allChats.forEach(chat => {
        chat.style.display = '';
      });
      
      // Reset active status on badges
      document.querySelectorAll('.status-badge').forEach(badge => {
        badge.classList.remove('active');
      });
    } else {
      // Hide all chats first
      allChats.forEach(chat => {
        chat.style.display = 'none';
      });
      
      // Show only chats with the selected status
      document.querySelectorAll(`.chat-item.${status}`).forEach(chat => {
        chat.style.display = '';
      });
      
      // Update active status on badges
      document.querySelectorAll('.status-badge').forEach(badge => {
        badge.classList.remove('active');
      });
      document.querySelector(`.status-badge.${status}`).classList.add('active');
    }
  }
  
  function observeChatChanges() {
    // Create a mutation observer to watch for new chat items or status changes
    const observer = new MutationObserver(mutations => {
      let shouldUpdateCounts = false;
      
      mutations.forEach(mutation => {
        // If chat items were added or removed
        if (mutation.type === 'childList' && 
            (Array.from(mutation.addedNodes).some(node => node.classList && node.classList.contains('chat-item')) || 
             Array.from(mutation.removedNodes).some(node => node.classList && node.classList.contains('chat-item')))) {
          shouldUpdateCounts = true;
          
          // Add animation class to new items
          Array.from(mutation.addedNodes)
            .filter(node => node.classList && node.classList.contains('chat-item'))
            .forEach(newChat => {
              newChat.classList.add('new-item');
              setTimeout(() => {
                newChat.classList.remove('new-item');
              }, 500);
            });
        }
        
        // If class attribute changed (could be status change)
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'class' && 
            mutation.target.classList && 
            mutation.target.classList.contains('chat-item')) {
          shouldUpdateCounts = true;
          
          // Add animation for status change
          mutation.target.classList.add('status-changed');
          setTimeout(() => {
            mutation.target.classList.remove('status-changed');
          }, 500);
        }
      });
      
      // Update counters if needed
      if (shouldUpdateCounts) {
        updateStatusCounts();
      }
    });
    
    // Start observing
    const chatContainer = document.querySelector('.chat-container') || 
                          document.querySelector('.chats-list') || 
                          document.getElementById('chats');
    
    if (chatContainer) {
      observer.observe(chatContainer, { 
        childList: true,
        attributes: true,
        subtree: true,
        attributeFilter: ['class']
      });
    }
  }
  
  // Run the enhancement when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyEnhancedChatStyles);
  } else {
    applyEnhancedChatStyles();
  }
})();
