// Configuration for Signature Cleaner
// Security: API keys are now handled by backend server

const CONFIG = {
    // Backend API endpoints - no sensitive keys exposed
    API_BASE_URL: (function() {
        const hostname = window.location.hostname;
        const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1' || 
                            hostname.startsWith('192.168.') || hostname === '0.0.0.0';
        
        return isDevelopment 
            ? 'http://localhost:3001/api'  // Development - always use localhost:3001 for backend
            : '/api';  // Production (assuming reverse proxy)
    })(),
    
    // Application settings
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    PROCESSING_TIMEOUT: 60000, // 60 seconds (increased for network calls)
    
    // Firebase configuration will be fetched from backend
    FIREBASE_CONFIG: null // Will be loaded dynamically
};

// Configuration loader class
class ConfigLoader {
    constructor() {
        this.firebaseConfigLoaded = false;
        this.loadingPromise = null;
    }

    async loadFirebaseConfig() {
        if (this.firebaseConfigLoaded && CONFIG.FIREBASE_CONFIG) {
            return CONFIG.FIREBASE_CONFIG;
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this._fetchFirebaseConfig();
        return this.loadingPromise;
    }

    async _fetchFirebaseConfig() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/firebase-config`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const config = await response.json();
            CONFIG.FIREBASE_CONFIG = config;
            this.firebaseConfigLoaded = true;
            return config;
        } catch (error) {
            console.error('Failed to load Firebase configuration:', error);
            throw new Error('Unable to load Firebase configuration. Please check if the backend server is running.');
        }
    }

    // API utility methods
    getProcessImageUrl() {
        return `${CONFIG.API_BASE_URL}/process-image`;
    }

    getTranslateTextUrl() {
        return `${CONFIG.API_BASE_URL}/translate-text`;
    }

    getEnhancePromptUrl() {
        return `${CONFIG.API_BASE_URL}/enhance-prompt`;
    }

    getHealthUrl() {
        return `${CONFIG.API_BASE_URL}/health`;
    }
}

// Global configuration loader instance
window.configLoader = new ConfigLoader();