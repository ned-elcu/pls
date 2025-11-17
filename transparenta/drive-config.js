/**
 * Google Drive API Configuration
 * 
 * IMPORTANT: This file contains the API key and folder IDs for the Google Drive integration.
 * The API key is restricted to the Google Drive API and specific domains for security.
 * 
 * Place this file in the root of your transparenta/ folder.
 */

const DRIVE_CONFIG = {
    // Google Drive API Key
    apiKey: 'AIzaSyACBtj1wHWZhWPYuC9qtPZjjma-9BIp2rA',
    
    // Folder IDs for each document category
    folders: {
        'declaratii-avere': '1nKH3W0rJCqVizRqalaYJXevfOWWKbkFO',
        'declaratii-interese': '13FG_7eHyjdjwskvi-U-SZ9iN5iTV_qfr',
        'raportare-salariala': '1w3FbAth2AsMqESx_JXoiBvEGDRhsAsP1',
        'rapoarte-544': '1k5Xv4s_fPUqizIhaYhSEGCW5vQR1ZKBs',
        'cadouri': '1LCvY_nzWPsneWH_6N-fFmrNMLd_9pD-Z',
        'bilanturi-bugete': '1GndSXLzUjoljgwgqmOCZV8mI-28lekX9',
        'program-achizitii': '1BCQMfAk1DVwgsU80pprlpnE05fy9Pykh',
        'formare-profesionala': '1g0PNmLkMiElwuVYfxs8bPQ0FuYE5ZEmz'
    },
    
    // API endpoint
    apiEndpoint: 'https://www.googleapis.com/drive/v3/files'
};

// Make config available globally
window.DRIVE_CONFIG = DRIVE_CONFIG;
