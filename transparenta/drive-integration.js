/**
 * Google Drive Integration Module
 * 
 * This module handles all interactions with the Google Drive API.
 * It fetches files from specified folders, sorts them by date, groups them by year,
 * and provides search functionality.
 * 
 * Dependencies: drive-config.js must be loaded first
 * 
 * Usage:
 *   const integration = new DriveIntegration('declaratii-avere');
 *   const files = await integration.getFiles();
 *   const grouped = integration.groupByYear(files);
 */

class DriveIntegration {
    constructor(folderKey) {
        if (!window.DRIVE_CONFIG) {
            throw new Error('DRIVE_CONFIG not loaded. Please include drive-config.js before drive-integration.js');
        }
        
        this.config = window.DRIVE_CONFIG;
        this.folderId = this.config.folders[folderKey];
        
        if (!this.folderId) {
            throw new Error(`Invalid folder key: ${folderKey}. Available keys: ${Object.keys(this.config.folders).join(', ')}`);
        }
    }
    
    /**
     * Fetch all files from the Google Drive folder
     * @returns {Promise<Array>} Array of file objects
     */
    async getFiles() {
        try {
            const url = new URL(this.config.apiEndpoint);
            url.searchParams.append('key', this.config.apiKey);
            url.searchParams.append('q', `'${this.folderId}' in parents and trashed=false`);
            url.searchParams.append('fields', 'files(id,name,mimeType,createdTime,modifiedTime,webViewLink,webContentLink,size)');
            url.searchParams.append('orderBy', 'createdTime desc');
            url.searchParams.append('pageSize', '1000');
            
            const response = await fetch(url.toString());
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Filter only PDF files and process them
            return (data.files || [])
                .filter(file => file.mimeType === 'application/pdf')
                .map(file => this.processFile(file));
                
        } catch (error) {
            console.error('Error fetching files from Google Drive:', error);
            throw error;
        }
    }
    
    /**
     * Process a file object from the API
     * @param {Object} file - Raw file object from API
     * @returns {Object} Processed file object
     */
    processFile(file) {
        const createdDate = new Date(file.createdTime);
        const modifiedDate = new Date(file.modifiedTime);
        
        return {
            id: file.id,
            name: file.name,
            displayName: this.extractDisplayName(file.name),
            year: createdDate.getFullYear(),
            month: createdDate.getMonth() + 1,
            createdTime: file.createdTime,
            createdDate: createdDate,
            modifiedTime: file.modifiedTime,
            modifiedDate: modifiedDate,
            viewLink: file.webViewLink,
            downloadLink: file.webContentLink,
            size: file.size,
            formattedDate: this.formatDate(createdDate),
            formattedSize: this.formatFileSize(file.size)
        };
    }
    
    /**
     * Extract a clean display name from filename
     * Removes .pdf extension and cleans up common patterns
     * @param {string} filename
     * @returns {string} Clean display name
     */
    extractDisplayName(filename) {
        // Remove .pdf extension
        let name = filename.replace(/\.pdf$/i, '');
        
        // Try to extract year pattern and remove it if it's at the start/end
        name = name.replace(/^(\d{4})[-_\s]+/, ''); // Remove year from start
        name = name.replace(/[-_\s]+(\d{4})$/, ''); // Remove year from end
        
        // Replace underscores and multiple spaces with single space
        name = name.replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
        
        return name;
    }
    
    /**
     * Format a date object to Romanian locale string
     * @param {Date} date
     * @returns {string} Formatted date
     */
    formatDate(date) {
        const months = [
            'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
            'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
        ];
        
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    
    /**
     * Format file size to human-readable format
     * @param {number} bytes
     * @returns {string} Formatted size
     */
    formatFileSize(bytes) {
        if (!bytes) return 'N/A';
        
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }
    
    /**
     * Group files by year
     * @param {Array} files - Array of processed file objects
     * @returns {Object} Object with years as keys and arrays of files as values
     */
    groupByYear(files) {
        const grouped = {};
        
        files.forEach(file => {
            const year = file.year;
            if (!grouped[year]) {
                grouped[year] = [];
            }
            grouped[year].push(file);
        });
        
        // Sort years in descending order
        const sortedYears = Object.keys(grouped).sort((a, b) => b - a);
        const sortedGrouped = {};
        sortedYears.forEach(year => {
            sortedGrouped[year] = grouped[year];
        });
        
        return sortedGrouped;
    }
    
    /**
     * Search through files by name
     * @param {Array} files - Array of file objects
     * @param {string} query - Search query
     * @returns {Array} Filtered array of files
     */
    searchFiles(files, query) {
        if (!query || query.trim() === '') {
            return files;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return files.filter(file => {
            return file.name.toLowerCase().includes(searchTerm) ||
                   file.displayName.toLowerCase().includes(searchTerm) ||
                   file.year.toString().includes(searchTerm) ||
                   file.formattedDate.toLowerCase().includes(searchTerm);
        });
    }
    
    /**
     * Get unique years from files array
     * @param {Array} files - Array of file objects
     * @returns {Array} Sorted array of unique years (descending)
     */
    getYears(files) {
        const years = [...new Set(files.map(file => file.year))];
        return years.sort((a, b) => b - a);
    }
}

/**
 * UI Helper Class
 * Provides methods for rendering Drive files to HTML
 */
class DriveUIHelper {
    /**
     * Create a document card HTML element
     * @param {Object} file - Processed file object
     * @param {Object} options - Rendering options
     * @returns {string} HTML string
     */
    static createDocumentCard(file, options = {}) {
        const showIcon = options.showIcon !== false;
        const showDate = options.showDate !== false;
        const showSize = options.showSize === true;
        
        return `
            <div class="document-card" data-file-id="${file.id}">
                <h4 class="document-card-title">
                    ${showIcon ? '<i class="material-icons">description</i>' : ''}
                    ${file.displayName}
                </h4>
                ${showDate ? `<p class="document-card-date">${file.formattedDate}${showSize ? ` • ${file.formattedSize}` : ''}</p>` : ''}
                <a href="${file.viewLink}" target="_blank" rel="noopener" class="document-card-link">
                    Vizualizează documentul <i class="material-icons">open_in_new</i>
                </a>
            </div>
        `;
    }
    
    /**
     * Create a loading state HTML
     * @returns {string} HTML string
     */
    static createLoadingState() {
        return `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Se încarcă documentele...</p>
            </div>
        `;
    }
    
    /**
     * Create an empty state HTML
     * @param {string} message - Custom message (optional)
     * @returns {string} HTML string
     */
    static createEmptyState(message = 'Nu există documente disponibile momentan.') {
        return `
            <div class="empty-state">
                <i class="material-icons empty-state-icon">folder_open</i>
                <p class="empty-state-text">${message}</p>
            </div>
        `;
    }
    
    /**
     * Create an error state HTML
     * @param {string} message - Error message
     * @returns {string} HTML string
     */
    static createErrorState(message = 'A apărut o eroare la încărcarea documentelor.') {
        return `
            <div class="error-state">
                <i class="material-icons error-state-icon">error_outline</i>
                <p class="error-state-text">${message}</p>
                <button class="error-state-button" onclick="location.reload()">
                    <i class="material-icons">refresh</i>
                    Reîncearcă
                </button>
            </div>
        `;
    }
    
    /**
     * Render files grouped by year with year tabs
     * @param {Object} groupedFiles - Files grouped by year
     * @param {string} containerId - ID of container element
     * @param {Object} options - Rendering options
     */
    static renderGroupedByYear(groupedFiles, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID "${containerId}" not found`);
            return;
        }
        
        const years = Object.keys(groupedFiles);
        
        if (years.length === 0) {
            container.innerHTML = this.createEmptyState();
            return;
        }
        
        // Create year tabs
        const tabsHTML = years.map((year, index) => 
            `<button class="year-tab ${index === 0 ? 'active' : ''}" data-year="${year}">${year}</button>`
        ).join('');
        
        // Create year content sections
        const contentHTML = years.map((year, index) => {
            const files = groupedFiles[year];
            const filesHTML = files.map(file => this.createDocumentCard(file, options)).join('');
            
            return `
                <div class="year-content ${index === 0 ? 'active' : ''}" id="year-${year}">
                    <div class="document-grid">
                        ${filesHTML}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = `
            <div class="year-tabs-container">
                <div class="year-tabs">${tabsHTML}</div>
                ${contentHTML}
            </div>
        `;
        
        // Add event listeners to year tabs
        const yearTabs = container.querySelectorAll('.year-tab');
        yearTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const year = this.getAttribute('data-year');
                
                // Remove active class from all tabs
                yearTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Hide all year content
                container.querySelectorAll('.year-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show target year content
                const targetContent = container.querySelector(`#year-${year}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
    
    /**
     * Render files as a simple list (no year grouping)
     * @param {Array} files - Array of file objects
     * @param {string} containerId - ID of container element
     * @param {Object} options - Rendering options
     */
    static renderSimpleList(files, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID "${containerId}" not found`);
            return;
        }
        
        if (files.length === 0) {
            container.innerHTML = this.createEmptyState();
            return;
        }
        
        const filesHTML = files.map(file => this.createDocumentCard(file, options)).join('');
        
        container.innerHTML = `
            <div class="document-grid">
                ${filesHTML}
            </div>
        `;
    }
}

// Make classes available globally
window.DriveIntegration = DriveIntegration;
window.DriveUIHelper = DriveUIHelper;
