// Configuration for Production Signature Cleaner
const CONFIG = {
    // API Base URL - will be set to worker domain in production
    API_BASE_URL: window.location.origin,
    
    // Authentication endpoints
    AUTH_ENDPOINTS: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        VERIFY: '/auth/verify',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile'
    },
    
    // API endpoints
    API_ENDPOINTS: {
        PROCESS_IMAGE: '/api/process-image',
        HISTORY: '/api/history',
        HISTORY_ITEM: '/api/history/',
        HISTORY_STATS: '/api/history/stats',
        HISTORY_EXPORT: '/api/history/export'
    },
    
    // Application settings
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    PROCESSING_TIMEOUT: 60000, // 60 seconds
    
    // UI Configuration
    HISTORY_PAGE_SIZE: 20,
    AUTO_SAVE_DELAY: 2000,
    
    // Local Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'signature_cleaner_token',
        USER_DATA: 'signature_cleaner_user',
        LAST_PROMPT: 'signature_cleaner_last_prompt'
    }
};

// Environment detection
CONFIG.IS_DEVELOPMENT = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';

// Adjust API base URL for development
if (CONFIG.IS_DEVELOPMENT) {
    // In development, you might want to point to your deployed worker
    // CONFIG.API_BASE_URL = 'https://your-worker.your-subdomain.workers.dev';
}