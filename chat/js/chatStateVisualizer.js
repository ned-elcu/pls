// Add filter buttons to the interface
  function addStatusFilters() {
    // Check if filters already exist
    if (document.querySelector('.status-filters')) {
      return;
    }
    
    // Create filter container
    const filterContainer = document.createElement('div');
    filterContainer.className = 'status-filters';
    
    // Filter options (All + status-based filters)
    const filters = [
      { id: 'all', label: 'Toate', icon: 'list' },
      { id: 'waiting', label: 'În așteptare', icon: DESIGN.icons.waiting },
      { id: 'taken', label: 'Preluate', icon: DESIGN.icons.taken },
      { id: 'resolved', label: 'Rezolvate', icon: DESIGN.icons.resolved }
    ];
    
    // Create filter buttons
    filters.forEach(filter => {
      const button = document.createElement('button');
      button.className = `status-filter ${filter.id}`;
      button.dataset.filter = filter.id;
      
      const icon = document.createElement('span');
      icon.className = 'material-icons';
      icon.textContent = filter.icon;
      
      const label = document.createElement('span');
      label.textContent = filter.label;
      
      button.appendChild(icon);
      button.appendChild(label);
      
      // Add click handler
      button.addEventListener('click', () => {
        filterConversations(filter.id);
        
        // Update active state
        document.querySelectorAll('.status-filter').forEach(btn => {
          btn.classList.remove('active');
        });
        button.classList.add('active');
      });
      
      filterContainer.appendChild(button);
    });
    
    // Find insertion point - try to find tab container or navigation
    let insertionPoint = document.querySelector('.nav-tabs, .tabs, nav, .navigation');
    
    // If no obvious insertion point, insert at top of content area
    if (!insertionPoint) {
      insertionPoint = document.querySelector('.content, main, .container, .container-fluid');
    }
    
    // Insert filters
    if (insertionPoint) {
      if (insertionPoint.parentNode) {
        insertionPoint.parentNode.insertBefore(filterContainer, insertionPoint.nextSibling);
      } else {
        document.body.insertBefore(filterContainer, document.body.firstChild);
      }
    }
  }
  
  // Filter conversations by status
  function filterConversations(status) {
    const allItems = document.querySelectorAll('.card, .conversation-item, .list-group-item, .chat-list-item');
    
    allItems.forEach(item => {
      if (status === 'all') {
        item.style.display = '';
      } else {
        if (item.classList.contains(status)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      }
    });
  }/**
 * chatStateVisualizer.js
 * 
 * A comprehensive visual design system for chat states in the admin panel
 * This file enhances the visual representation of chats in waiting, taken, and resolved states
 */

(function() {
  // Configuration - Visual Design System
  const DESIGN = {
    // Color Palette - Adapted for Romanian interface
    colors: {
      waiting: {  // În așteptare
        primary: '#FF9800',       // Vibrant orange for attention
        secondary: 'rgba(255, 243, 224, 0.8)',  // Soft orange background with transparency
        accent: '#F57C00',        // Darker orange for accents
        text: '#7D4A00',          // Dark readable text
        icon: '#FF5722'           // Icon color
      },
      taken: {    // Preluate
        primary: '#2196F3',       // Engaging blue for active chats
        secondary: 'rgba(227, 242, 253, 0.8)',  // Soft blue background with transparency
        accent: '#1976D2',        // Darker blue for accents
        text: '#0D47A1',          // Dark readable text
        icon: '#0D47A1'           // Icon color
      },
      resolved: { // Rezolvate
        primary: '#4CAF50',       // Calm green for completed chats
        secondary: 'rgba(232, 245, 233, 0.8)',  // Soft green background with transparency
        accent: '#388E3C',        // Darker green for accents
        text: '#1B5E20',          // Dark readable text
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
    
    // Icons - Using Material Icons
    icons: {
      waiting: 'schedule',      // Clock icon for waiting
      taken: 'person',          // Person icon for taken chats
      resolved: 'check_circle'  // Check icon for resolved chats
    }
  };B5E20',          // Dark readable text on light backgrounds
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
    
    // Icons - Using Material Icons
    icons: {
      waiting: 'schedule',      // Hour glass/clock icon for waiting
      taken: 'person',          // Person icon for taken chats
      resolved: 'check_circle'  // Check icon for resolved chats
    }
  };
  
  // Helper function to inject CSS with high priority
  function injectStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
  
  // Identify chat items and detect their status
  function detectChatItemStatus() {
    // First, let's get all chat items
    const chatItems = document.querySelectorAll('.card, .card-body, .list-group-item, .conversation-item');
    
    chatItems.forEach(item => {
      // Default status is "waiting" unless we find otherwise
      let status = 'waiting';
      
      // Look for status indicators in the item
      const statusText = item.innerText.toLowerCase();
      const statusAttr = item.getAttribute('data-status');
      
      // Check data attribute first (if it exists)
      if (statusAttr) {
        if (statusAttr.includes('preluat') || statusAttr.includes('taken')) {
          status = 'taken';
        } else if (statusAttr.includes('rezolvat') || statusAttr.includes('resolved')) {
          status = 'resolved';
        }
      } 
      // Otherwise check for text indicators
      else {
        // Check for Romanian status terms
        if (statusText.includes('preluat') || statusText.includes('în lucru')) {
          status = 'taken';
        } else if (statusText.includes('rezolvat') || statusText.includes('închis')) {
          status = 'resolved';
        }
      }
      
      // Apply the appropriate status class
      item.classList.add(status);
      
      // Add status icon at the beginning of each card
      const statusIcon = document.createElement('div');
      statusIcon.className = 'status-icon material-icons';
      statusIcon.textContent = DESIGN.icons[status];
      statusIcon.style.color = DESIGN.colors[status].icon;
      statusIcon.style.position = 'absolute';
      statusIcon.style.top = '16px';
      statusIcon.style.left = '16px';
      statusIcon.style.fontSize = '20px';
      
      // Only add if doesn't already exist
      if (!item.querySelector('.status-icon')) {
        item.style.position = 'relative';
        item.style.paddingLeft = '40px';
        item.appendChild(statusIcon);
      }
    });
  }
  
  // Base styles for all chat items - targeting all possible selectors
  const baseStyles = `
    /* Target various possible chat item container classes */
    .card,
    .conversation-item,
    .list-group-item,
    .chat-list-item,
    div[class*="conversation"],
    div[class*="chat-item"],
    div[class*="message-item"] {
      position: relative !important;
      border-radius: ${DESIGN.borderRadius.standard} !important;
      margin: 8px 0 !important;
      transition: transform ${DESIGN.animation.standard}, box-shadow ${DESIGN.animation.standard} !important;
      box-shadow: ${DESIGN.shadows.light} !important;
      overflow: hidden !important;
    }
    
    /* Hover effect */
    .card:hover,
    .conversation-item:hover,
    .list-group-item:hover,
    .chat-list-item:hover,
    div[class*="conversation"]:hover,
    div[class*="chat-item"]:hover,
    div[class*="message-item"]:hover {
      transform: translateY(-2px) !important;
      box-shadow: ${DESIGN.shadows.hover} !important;
      cursor: pointer;
    }
    
    /* Status indicator stripe on the left side */
    .card::before,
    .conversation-item::before,
    .list-group-item::before,
    .chat-list-item::before,
    div[class*="conversation"]::before,
    div[class*="chat-item"]::before,
    div[class*="message-item"]::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 5px;
      z-index: 2;
    }
    
    /* Status icon styles */
    .status-icon {
      position: absolute;
      top: 16px;
      left: 16px;
      font-size: 20px;
      z-index: 2;
    }
  `;
    
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
      font-family: 'Material Icons' !important;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
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
  
  // Status-specific styles with increased specificity and !important
  const waitingStyles = `
    /* High specificity selectors to override existing styles */
    .chat-item.waiting,
    div.chat-item.waiting,
    body .chat-container .chat-item.waiting,
    #chats .chat-item.waiting,
    .chats-list .chat-item.waiting {
      background-color: ${DESIGN.colors.waiting.secondary} !important;
      border: 1px solid ${DESIGN.colors.waiting.border} !important;
      color: ${DESIGN.colors.waiting.text} !important;
    }
    
    /* High specificity selectors to override existing styles */
    .chat-item.waiting::before,
    div.chat-item.waiting::before,
    body .chat-container .chat-item.waiting::before,
    #chats .chat-item.waiting::before,
    .chats-list .chat-item.waiting::before {
      content: '${DESIGN.icons.waiting}' !important;
      color: ${DESIGN.colors.waiting.icon} !important;
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
    /* Taken status (Preluate) - Blue theme */
    .taken,
    div.taken,
    .card.taken,
    .conversation-item.taken,
    .list-group-item.taken,
    .chat-list-item.taken,
    div[class*="conversation"].taken,
    div[class*="chat-item"].taken,
    div[class*="message-item"].taken {
      background-color: ${DESIGN.colors.taken.secondary} !important;
      border-left: 5px solid ${DESIGN.colors.taken.primary} !important;
    }
    
    .taken::before,
    div.taken::before,
    .card.taken::before,
    .conversation-item.taken::before,
    .list-group-item.taken::before,
    .chat-list-item.taken::before,
    div[class*="conversation"].taken::before,
    div[class*="chat-item"].taken::before,
    div[class*="message-item"].taken::before {
      background-color: ${DESIGN.colors.taken.primary} !important;
    }
    
    /* Subtle gradient animation for taken chats */
    @keyframes takenGradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .taken,
    div.taken,
    .card.taken,
    .conversation-item.taken {
      background-image: linear-gradient(120deg, ${DESIGN.colors.taken.secondary}, rgba(227, 242, 253, 0.9), ${DESIGN.colors.taken.secondary}) !important;
      background-size: 200% 100% !important;
      animation: takenGradient 5s ease infinite !important;
    }
  `;
    
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
    /* Resolved status (Rezolvate) - Green theme */
    .resolved,
    div.resolved,
    .card.resolved,
    .conversation-item.resolved,
    .list-group-item.resolved,
    .chat-list-item.resolved,
    div[class*="conversation"].resolved,
    div[class*="chat-item"].resolved,
    div[class*="message-item"].resolved {
      background-color: ${DESIGN.colors.resolved.secondary} !important;
      border-left: 5px solid ${DESIGN.colors.resolved.primary} !important;
      opacity: 0.85 !important;
    }
    
    .resolved::before,
    div.resolved::before,
    .card.resolved::before,
    .conversation-item.resolved::before,
    .list-group-item.resolved::before,
    .chat-list-item.resolved::before,
    div[class*="conversation"].resolved::before,
    div[class*="chat-item"].resolved::before,
    div[class*="message-item"].resolved::before {
      background-color: ${DESIGN.colors.resolved.primary} !important;
    }
    
    .resolved:hover,
    div.resolved:hover,
    .card.resolved:hover,
    .conversation-item.resolved:hover {
      opacity: 1 !important;
    }
  `;
    
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
  
  // Status filter buttons styles
  const filterButtonsStyles = `
    /* Status filter buttons */
    .status-filters {
      display: flex;
      margin: 16px 0;
      justify-content: center;
    }
    
    .status-filter {
      padding: 8px 16px;
      margin: 0 8px;
      border-radius: 20px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      border: none;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    
    .status-filter .material-icons {
      margin-right: 8px;
      font-size: 18px;
    }
    
    .status-filter.waiting {
      background-color: ${DESIGN.colors.waiting.secondary};
      color: ${DESIGN.colors.waiting.text};
    }
    
    .status-filter.waiting:hover, .status-filter.waiting.active {
      background-color: ${DESIGN.colors.waiting.primary};
      color: white;
    }
    
    .status-filter.taken {
      background-color: ${DESIGN.colors.taken.secondary};
      color: ${DESIGN.colors.taken.text};
    }
    
    .status-filter.taken:hover, .status-filter.taken.active {
      background-color: ${DESIGN.colors.taken.primary};
      color: white;
    }
    
    .status-filter.resolved {
      background-color: ${DESIGN.colors.resolved.secondary};
      color: ${DESIGN.colors.resolved.text};
    }
    
    .status-filter.resolved:hover, .status-filter.resolved.active {
      background-color: ${DESIGN.colors.resolved.primary};
      color: white;
    }
    
    .status-filter.all {
      background-color: #f5f5f5;
      color: #333;
    }
    
    .status-filter.all:hover, .status-filter.all.active {
      background-color: #9e9e9e;
      color: white;
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
  
  // Main function to apply all enhancements
  function applyConversationEnhancements() {
    // Inject all styles
    injectStyles(
      baseStyles + 
      waitingStyles + 
      takenStyles + 
      resolvedStyles + 
      filterButtonsStyles
    );
    
    // Detect and apply status classes to conversation items
    detectChatItemStatus();
    
    // Add filter buttons
    addStatusFilters();
    
    // Set up mutation observer to handle dynamically added content
    observeConversationChanges();
  }
  
  // Observe DOM for changes
  function observeConversationChanges() {
    const observer = new MutationObserver(mutations => {
      let needsUpdate = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any added nodes are conversation items
          Array.from(mutation.addedNodes).forEach(node => {
            if (node.nodeType === 1) { // Element node
              if (node.classList && 
                 (node.classList.contains('card') || 
                  node.classList.contains('conversation-item') || 
                  node.classList.contains('list-group-item') ||
                  node.className.includes('chat') ||
                  node.className.includes('conversation'))) {
                needsUpdate = true;
              }
              
              // Check for conversation items within the added node
              if (node.querySelectorAll) {
                const conversationItems = node.querySelectorAll('.card, .conversation-item, .list-group-item, .chat-list-item');
                if (conversationItems.length > 0) {
                  needsUpdate = true;
                }
              }
            }
          });
        }
      });
      
      // Reapply status detection if new items were added
      if (needsUpdate) {
        detectChatItemStatus();
      }
    });
    
    // Start observing the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyConversationEnhancements);
  } else {
    applyConversationEnhancements();
  }
})();
  
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
  
  // Add style priority ensurance function
  function ensureStylePriority() {
    // Force recalculation of styles by triggering a reflow
    document.querySelectorAll('.chat-item').forEach(item => {
      item.style.display = item.style.display;
    });
    
    // Check if our styles have been applied, and if not, try again with higher specificity
    const waitingItem = document.querySelector('.chat-item.waiting');
    if (waitingItem && getComputedStyle(waitingItem).backgroundColor !== DESIGN.colors.waiting.secondary) {
      console.log('Styles were overridden - applying emergency override');
      
      // Create an emergency style with the highest possible specificity
      const emergencyStyle = document.createElement('style');
      emergencyStyle.textContent = `
        /* Maximum specificity override */
        html body div[class] .chat-item.waiting {
          background-color: ${DESIGN.colors.waiting.secondary} !important;
          border: 2px solid ${DESIGN.colors.waiting.border} !important;
        }
        
        html body div[class] .chat-item.taken {
          background-color: ${DESIGN.colors.taken.secondary} !important;
          border: 2px solid ${DESIGN.colors.taken.border} !important;
        }
        
        html body div[class] .chat-item.resolved {
          background-color: ${DESIGN.colors.resolved.secondary} !important;
          border: 2px solid ${DESIGN.colors.resolved.border} !important;
        }
      `;
      document.head.appendChild(emergencyStyle);
    }
  }
  
  // Run the enhancement when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyEnhancedChatStyles();
      // Ensure styles are applied even after any async loads
      setTimeout(ensureStylePriority, 1000);
    });
  } else {
    applyEnhancedChatStyles();
    setTimeout(ensureStylePriority, 1000);
  }
})();
