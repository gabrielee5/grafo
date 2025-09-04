class AuthService {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.initialized = false;
        this.initializeFirebase();
    }

    // Constants for better error handling
    static ERROR_CODES = {
        WEAK_PASSWORD: 'auth/weak-password',
        EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
        USER_NOT_FOUND: 'auth/user-not-found',
        WRONG_PASSWORD: 'auth/wrong-password',
        INVALID_EMAIL: 'auth/invalid-email',
        USER_DISABLED: 'auth/user-disabled',
        TOO_MANY_REQUESTS: 'auth/too-many-requests',
        NETWORK_REQUEST_FAILED: 'auth/network-request-failed'
    };

    async initializeFirebase() {
        try {
            // Load Firebase configuration from backend
            if (!window.configLoader) {
                throw new Error('Configuration loader not available');
            }

            const firebaseConfig = await window.configLoader.loadFirebaseConfig();
            
            // Initialize Firebase with loaded configuration
            if (firebase.apps.length === 0) {
                firebase.initializeApp(firebaseConfig);
            }
            
            this.auth = firebase.auth();
            this.firestore = firebase.firestore();
            
            // Set up auth state listener
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.notifyAuthStateListeners(user);
                
                // Update UI based on auth state
                this.updateAuthUI(user);
            });
            
            this.initialized = true;
            console.log('Firebase initialized successfully');
            
        } catch (error) {
            console.error('Firebase initialization error:', error);
            // Show user-friendly error message
            const authButton = document.getElementById('authButton');
            if (authButton) {
                authButton.textContent = 'Auth unavailable';
                authButton.disabled = true;
                authButton.title = 'Authentication service is currently unavailable. Please ensure the backend server is running.';
            }
            // App should still work without auth if Firebase fails
        }
    }

    // Auth state management
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
        if (this.currentUser !== null) {
            callback(this.currentUser);
        }
    }

    notifyAuthStateListeners(user) {
        this.authStateListeners.forEach(callback => callback(user));
    }

    // Authentication methods
    async signIn(email, password) {
        try {
            const result = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: result.user };
        } catch (error) {
            return { 
                success: false, 
                error: this.getItalianErrorMessage(error.code) 
            };
        }
    }

    async signUp(email, password, displayName = '') {
        try {
            const result = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Update display name if provided
            if (displayName) {
                await result.user.updateProfile({ displayName });
            }
            
            // Send email verification
            await result.user.sendEmailVerification();
            
            return { 
                success: true, 
                user: result.user,
                emailVerificationSent: true,
                message: 'Account creato con successo! Ti abbiamo inviato un\'email di verifica. Controlla la tua casella di posta e clicca sul link per attivare il tuo account.'
            };
        } catch (error) {
            return { 
                success: false, 
                error: this.getItalianErrorMessage(error.code) 
            };
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: 'Errore durante il logout' 
            };
        }
    }

    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return { 
                success: true, 
                message: 'Email di reset password inviata' 
            };
        } catch (error) {
            return { 
                success: false, 
                error: this.getItalianErrorMessage(error.code) 
            };
        }
    }

    // Email verification methods
    async sendEmailVerification() {
        try {
            if (!this.currentUser) {
                return { 
                    success: false, 
                    error: 'Nessun utente autenticato' 
                };
            }
            
            if (this.currentUser.emailVerified) {
                return { 
                    success: false, 
                    error: 'Email già verificata' 
                };
            }
            
            await this.currentUser.sendEmailVerification();
            return { 
                success: true, 
                message: 'Email di verifica inviata. Controlla la tua casella di posta.' 
            };
        } catch (error) {
            return { 
                success: false, 
                error: this.getItalianErrorMessage(error.code) 
            };
        }
    }

    async reloadUserData() {
        try {
            if (!this.currentUser) return false;
            await this.currentUser.reload();
            return this.currentUser.emailVerified;
        } catch (error) {
            console.error('Error reloading user data:', error);
            return false;
        }
    }

    // User data methods
    isLoggedIn() {
        return this.currentUser !== null;
    }

    isEmailVerified() {
        return this.currentUser !== null && this.currentUser.emailVerified;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserDisplayName() {
        if (!this.currentUser) return null;
        return this.currentUser.displayName || this.currentUser.email.split('@')[0];
    }

    // History management
    async saveToHistory(historyItem) {
        if (!this.isLoggedIn() || !this.initialized) {
            // Save to localStorage as fallback
            this.saveToLocalStorage(historyItem);
            return { success: false, error: 'Utente non autenticato' };
        }

        if (!this.isEmailVerified()) {
            // Save to localStorage as fallback
            this.saveToLocalStorage(historyItem);
            return { success: false, error: 'Email non verificata' };
        }

        try {
            const historyData = {
                ...historyItem,
                userId: this.currentUser.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userEmail: this.currentUser.email
            };

            await this.firestore
                .collection('userHistory')
                .add(historyData);

            return { success: true };
        } catch (error) {
            console.error('Error saving to history:', error);
            // Fallback to localStorage
            this.saveToLocalStorage(historyItem);
            return { 
                success: false, 
                error: 'Errore nel salvataggio della cronologia' 
            };
        }
    }

    async getUserHistory(limit = 50) {
        if (!this.isLoggedIn() || !this.initialized) {
            return this.getLocalStorageHistory();
        }

        if (!this.isEmailVerified()) {
            return this.getLocalStorageHistory();
        }

        try {
            const query = await this.firestore
                .collection('userHistory')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            const history = [];
            query.forEach(doc => {
                history.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return history;
        } catch (error) {
            console.error('Error fetching history:', error);
            return this.getLocalStorageHistory();
        }
    }

    // LocalStorage fallback methods
    saveToLocalStorage(historyItem) {
        try {
            const existingHistory = JSON.parse(localStorage.getItem('signatureHistory') || '[]');
            const newItem = {
                ...historyItem,
                id: Date.now().toString(),
                timestamp: new Date().toISOString()
            };
            
            existingHistory.unshift(newItem);
            
            // Keep only last 20 items in localStorage
            if (existingHistory.length > 20) {
                existingHistory.splice(20);
            }
            
            localStorage.setItem('signatureHistory', JSON.stringify(existingHistory));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    getLocalStorageHistory() {
        try {
            return JSON.parse(localStorage.getItem('signatureHistory') || '[]');
        } catch (error) {
            console.error('Error reading localStorage history:', error);
            return [];
        }
    }

    // Simplified UI management - modals are now handled by AuthModalManager
    updateAuthUI(user) {
        const authButton = document.getElementById('authButton');
        const userMenu = document.getElementById('userMenu');
        const emailVerificationBanner = document.getElementById('emailVerificationBanner');
        
        if (!authButton) return; // UI not ready yet
        
        // Get UI elements for enhanced auth button
        const authButtonText = document.getElementById('authButtonText');
        
        // User menu elements
        const userMenuName = document.getElementById('userMenuName');
        const userMenuEmail = document.getElementById('userMenuEmail');
        const userMenuStatus = document.getElementById('userMenuStatus');
        
        if (user) {
            const displayName = this.getUserDisplayName();
            
            if (user.emailVerified) {
                // User is logged in and email is verified
                authButton.className = 'auth-button logged-in verified';
                
                // Update button text to show user name
                if (authButtonText) authButtonText.textContent = displayName;
                
                // Update user menu
                if (userMenuName) userMenuName.textContent = displayName;
                if (userMenuEmail) userMenuEmail.textContent = user.email;
                if (userMenuStatus) {
                    userMenuStatus.textContent = 'Email verificata';
                    userMenuStatus.className = 'user-menu-status verified';
                }
                
                // Keep user menu hidden by default - user must click to open it
                if (userMenu) userMenu.hidden = true;
                
                // Hide verification banner
                if (emailVerificationBanner) emailVerificationBanner.hidden = true;
                
                // Hide any open auth modals
                if (window.authModalManager) {
                    window.authModalManager.hideAllModals();
                }
                
                // Enable process button
                const processButton = document.getElementById('processButton');
                if (processButton && processButton.textContent !== 'Elabora Immagine') {
                    processButton.title = '';
                }
                
                // Show history panel if exists
                const historyPanel = document.getElementById('historyPanel');
                if (historyPanel) {
                    historyPanel.hidden = false;
                    this.loadUserHistoryUI();
                }
            } else {
                // User is logged in but email is not verified
                authButton.className = 'auth-button logged-in unverified';
                
                // Update button text to show user name
                if (authButtonText) authButtonText.textContent = displayName;
                
                // Update user menu
                if (userMenuName) userMenuName.textContent = displayName;
                if (userMenuEmail) userMenuEmail.textContent = user.email;
                if (userMenuStatus) {
                    userMenuStatus.textContent = 'Email non verificata';
                    userMenuStatus.className = 'user-menu-status unverified';
                }
                
                // Keep user menu hidden by default - user must click to open it
                if (userMenu) userMenu.hidden = true;
                
                // Show verification banner
                if (emailVerificationBanner) {
                    emailVerificationBanner.hidden = false;
                    // Update banner content
                    const bannerText = emailVerificationBanner.querySelector('.banner-text');
                    if (bannerText) {
                        bannerText.textContent = 'Ti abbiamo inviato un\'email di verifica. Controlla la tua casella di posta per attivare tutte le funzionalità.';
                    }
                }
                
                // Hide any open auth modals
                if (window.authModalManager) {
                    window.authModalManager.hideAllModals();
                }
                
                // Disable process button
                const processButton = document.getElementById('processButton');
                if (processButton) {
                    processButton.title = 'Verifica la tua email per utilizzare il servizio';
                }
                
                // Hide history panel
                const historyPanel = document.getElementById('historyPanel');
                if (historyPanel) historyPanel.hidden = true;
            }
        } else {
            // User is not logged in
            authButton.className = 'auth-button';
            
            // Show login text
            if (authButtonText) authButtonText.textContent = 'Accedi';
            
            if (userMenu) userMenu.hidden = true;
            
            // Hide verification banner
            if (emailVerificationBanner) emailVerificationBanner.hidden = true;
            
            // Hide any open auth modals
            if (window.authModalManager) {
                window.authModalManager.hideAllModals();
            }
            
            // Update process button to show authentication requirement
            const processButton = document.getElementById('processButton');
            if (processButton) {
                processButton.title = 'Accesso richiesto per utilizzare il servizio';
            }
            
            // Hide history panel
            const historyPanel = document.getElementById('historyPanel');
            if (historyPanel) historyPanel.hidden = true;
        }
    }
    
    // Helper method to generate user initials
    getUserInitials() {
        if (!this.currentUser) return '?';
        
        const displayName = this.currentUser.displayName;
        const email = this.currentUser.email;
        
        if (displayName) {
            // Get initials from display name
            const names = displayName.trim().split(' ');
            if (names.length >= 2) {
                return names[0][0] + names[names.length - 1][0];
            } else if (names.length === 1) {
                return names[0][0] + (names[0][1] || '');
            }
        }
        
        // Fallback to email initials
        if (email) {
            const emailParts = email.split('@')[0];
            return emailParts[0] + (emailParts[1] || '');
        }
        
        return '?';
    }

    async loadUserHistoryUI() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        try {
            const history = await this.getUserHistory(10);
            
            if (history.length === 0) {
                historyList.innerHTML = '<p class="no-history">Nessuna cronologia disponibile</p>';
                return;
            }

            // Clear existing content
            historyList.innerHTML = '';

            // Create history items safely without XSS vulnerability
            history.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';

                // Create date element
                const dateElement = document.createElement('div');
                dateElement.className = 'history-item-date';
                const date = new Date(item.timestamp?.toDate?.() || item.timestamp);
                dateElement.textContent = date.toLocaleDateString('it-IT');

                // Create instructions element with safe text content
                const instructionsElement = document.createElement('div');
                instructionsElement.className = 'history-item-instructions';
                
                // Use SecurityUtils to safely set content
                if (window.SecurityUtils) {
                    SecurityUtils.safeSetTextContent(
                        instructionsElement, 
                        item.instructions || 'Nessuna istruzione',
                        { maxLength: 200, allowNewlines: false }
                    );
                } else {
                    // Fallback if SecurityUtils not loaded
                    instructionsElement.textContent = (item.instructions || 'Nessuna istruzione').substring(0, 200);
                }

                historyItem.appendChild(dateElement);
                historyItem.appendChild(instructionsElement);
                historyList.appendChild(historyItem);
            });
            
        } catch (error) {
            console.error('Error loading history UI:', error);
            historyList.innerHTML = '<p class="history-error">Errore nel caricamento della cronologia</p>';
        }
    }

    // Enhanced error message translation with user guidance
    getItalianErrorMessage(errorCode) {
        const errorMessages = {
            [AuthService.ERROR_CODES.USER_NOT_FOUND]: 'Email non registrata. Verifica l\'indirizzo o registrati.',
            [AuthService.ERROR_CODES.WRONG_PASSWORD]: 'Password errata. Riprova o reimposta la password.',
            [AuthService.ERROR_CODES.EMAIL_ALREADY_IN_USE]: 'Questa email è già registrata. Prova ad accedere.',
            [AuthService.ERROR_CODES.WEAK_PASSWORD]: 'Password troppo debole. Usa almeno 6 caratteri.',
            [AuthService.ERROR_CODES.INVALID_EMAIL]: 'Formato email non valido.',
            [AuthService.ERROR_CODES.USER_DISABLED]: 'Account disabilitato. Contatta il supporto.',
            [AuthService.ERROR_CODES.TOO_MANY_REQUESTS]: 'Troppi tentativi. Riprova tra qualche minuto.',
            [AuthService.ERROR_CODES.NETWORK_REQUEST_FAILED]: 'Errore di connessione. Verifica la rete.',
            'auth/internal-error': 'Errore interno del server. Riprova più tardi.'
        };
        
        return errorMessages[errorCode] || 'Errore di autenticazione. Riprova.';
    }

    // Enhanced validation with specific feedback
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { isValid: false, error: 'Email richiesta' };
        }
        
        if (email.length > 254) {
            return { isValid: false, error: 'Email troppo lunga' };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, error: 'Formato email non valido' };
        }
        
        return { isValid: true };
    }

    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { isValid: false, error: 'Password richiesta' };
        }
        
        if (password.length < 6) {
            return { isValid: false, error: 'Password troppo corta (minimo 6 caratteri)' };
        }
        
        if (password.length > 128) {
            return { isValid: false, error: 'Password troppo lunga (massimo 128 caratteri)' };
        }
        
        return { isValid: true };
    }

    // Legacy utility methods for backward compatibility
    isEmailValid(email) {
        return this.validateEmail(email).isValid;
    }

    isPasswordValid(password) {
        return this.validatePassword(password).isValid;
    }
}

// Authentication Modal Manager - handles the improved modal system
class AuthModalManager {
    constructor() {
        this.signInModal = document.getElementById('signInModal');
        this.signUpModal = document.getElementById('signUpModal');
        this.accountSettingsModal = document.getElementById('accountSettingsModal');
        this.activeModal = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Sign In Modal Events
        const closeSignInButton = document.getElementById('closeSignInButton');
        const signInForm = document.getElementById('signInForm');
        const showSignUpLink = document.getElementById('showSignUpLink');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');

        // Sign Up Modal Events  
        const closeSignUpButton = document.getElementById('closeSignUpButton');
        const signUpForm = document.getElementById('signUpForm');
        const showSignInLink = document.getElementById('showSignInLink');

        // Account Settings Modal Events
        const closeAccountSettingsButton = document.getElementById('closeAccountSettingsButton');
        const profileForm = document.getElementById('profileForm');
        const passwordForm = document.getElementById('passwordForm');

        // Close button events
        if (closeSignInButton) {
            closeSignInButton.addEventListener('click', () => this.hideSignInModal());
        }
        if (closeSignUpButton) {
            closeSignUpButton.addEventListener('click', () => this.hideSignUpModal());
        }
        if (closeAccountSettingsButton) {
            closeAccountSettingsButton.addEventListener('click', () => this.hideAccountSettingsModal());
        }

        // Form submission events
        if (signInForm) {
            signInForm.addEventListener('submit', (e) => this.handleSignInSubmit(e));
        }
        if (signUpForm) {
            signUpForm.addEventListener('submit', (e) => this.handleSignUpSubmit(e));
        }
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        }
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordSubmit(e));
        }

        // Modal switching events
        if (showSignUpLink) {
            showSignUpLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToSignUp();
            });
        }
        if (showSignInLink) {
            showSignInLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToSignIn();
            });
        }

        // Forgot password
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => this.handleForgotPassword(e));
        }

        // Password visibility toggles
        this.setupPasswordToggles();

        // Tab switching for account settings
        this.setupAccountSettingsTabs();

        // Email verification banner events
        this.setupVerificationBannerEvents();

        // Click outside to close
        this.signInModal?.addEventListener('click', (e) => {
            if (e.target === this.signInModal) this.hideSignInModal();
        });
        this.signUpModal?.addEventListener('click', (e) => {
            if (e.target === this.signUpModal) this.hideSignUpModal();
        });
        this.accountSettingsModal?.addEventListener('click', (e) => {
            if (e.target === this.accountSettingsModal) this.hideAccountSettingsModal();
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.hideAllModals();
            }
        });
    }

    setupPasswordToggles() {
        const toggles = document.querySelectorAll('.password-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const passwordInput = toggle.previousElementSibling;
                if (passwordInput) {
                    const isVisible = passwordInput.type === 'text';
                    passwordInput.type = isVisible ? 'password' : 'text';
                    toggle.setAttribute('aria-label', isVisible ? 'Mostra password' : 'Nascondi password');
                }
            });
        });
    }

    setupVerificationBannerEvents() {
        const resendButton = document.getElementById('resendVerificationButton');
        const checkButton = document.getElementById('checkVerificationButton');
        const dismissButton = document.getElementById('dismissBannerButton');

        if (resendButton) {
            resendButton.addEventListener('click', () => this.handleResendVerification());
        }

        if (checkButton) {
            checkButton.addEventListener('click', () => this.handleCheckVerification());
        }

        if (dismissButton) {
            dismissButton.addEventListener('click', () => this.handleDismissBanner());
        }
    }

    showSignInModal() {
        if (!this.signInModal) {
            return;
        }
        
        this.hideAllModals();
        this.signInModal.removeAttribute('hidden');
        this.activeModal = 'signIn';
        this.clearForm('signInForm');
        
        // Focus first input
        setTimeout(() => {
            const emailInput = document.getElementById('signInEmail');
            if (emailInput) {
                emailInput.focus();
            }
        }, 100);
    }

    showSignUpModal() {
        this.hideAllModals();
        this.signUpModal.removeAttribute('hidden');
        this.activeModal = 'signUp';
        this.clearForm('signUpForm');
        
        // Focus first input
        setTimeout(() => {
            const nameInput = document.getElementById('signUpName');
            if (nameInput) nameInput.focus();
        }, 100);
    }

    hideSignInModal() {
        this.signInModal.setAttribute('hidden', '');
        if (this.activeModal === 'signIn') this.activeModal = null;
        this.clearForm('signInForm');
    }

    hideSignUpModal() {
        this.signUpModal.setAttribute('hidden', '');
        if (this.activeModal === 'signUp') this.activeModal = null;
        this.clearForm('signUpForm');
    }

    showAccountSettingsModal() {
        this.hideAllModals();
        this.accountSettingsModal.removeAttribute('hidden');
        this.activeModal = 'accountSettings';
        
        // Load current user data
        this.loadCurrentUserData();
        
        // Focus first tab
        setTimeout(() => {
            const firstTabInput = document.getElementById('currentDisplayName');
            if (firstTabInput) firstTabInput.focus();
        }, 100);
    }

    hideAccountSettingsModal() {
        this.accountSettingsModal.setAttribute('hidden', '');
        if (this.activeModal === 'accountSettings') this.activeModal = null;
        this.clearForm('profileForm');
        this.clearForm('passwordForm');
    }

    hideAllModals() {
        this.hideSignInModal();
        this.hideSignUpModal();
        this.hideAccountSettingsModal();
    }

    switchToSignUp() {
        this.hideSignInModal();
        this.showSignUpModal();
    }

    switchToSignIn() {
        this.hideSignUpModal();
        this.showSignInModal();
    }

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            // Clear all error messages
            const errors = form.querySelectorAll('.field-error');
            errors.forEach(error => error.textContent = '');
            // Clear invalid states
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => input.classList.remove('invalid'));
        }
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        let errorElement;
        
        // Handle sign up field error IDs correctly
        if (fieldId === 'signUpEmail') {
            errorElement = document.getElementById('signup-email-error');
        } else if (fieldId === 'signUpPassword') {
            errorElement = document.getElementById('signup-password-error');
        } else if (fieldId === 'currentDisplayName') {
            errorElement = document.getElementById('displayname-error');
        } else if (fieldId === 'currentEmail') {
            errorElement = document.getElementById('email-change-error');
        } else if (fieldId === 'currentPassword') {
            errorElement = document.getElementById('current-password-error');
        } else if (fieldId === 'newPassword') {
            errorElement = document.getElementById('new-password-error');
        } else if (fieldId === 'confirmPassword') {
            errorElement = document.getElementById('confirm-password-error');
        } else {
            // Handle sign in fields and fallback
            errorElement = document.getElementById(fieldId.replace(/([A-Z])/g, '-$1').toLowerCase() + '-error') || 
                          document.getElementById(fieldId.replace('signIn', '').replace('signUp', '').toLowerCase() + '-error');
        }
        
        if (field) field.classList.add('invalid');
        if (errorElement) errorElement.textContent = message;
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        let errorElement;
        
        // Handle sign up field error IDs correctly
        if (fieldId === 'signUpEmail') {
            errorElement = document.getElementById('signup-email-error');
        } else if (fieldId === 'signUpPassword') {
            errorElement = document.getElementById('signup-password-error');
        } else if (fieldId === 'currentDisplayName') {
            errorElement = document.getElementById('displayname-error');
        } else if (fieldId === 'currentEmail') {
            errorElement = document.getElementById('email-change-error');
        } else if (fieldId === 'currentPassword') {
            errorElement = document.getElementById('current-password-error');
        } else if (fieldId === 'newPassword') {
            errorElement = document.getElementById('new-password-error');
        } else if (fieldId === 'confirmPassword') {
            errorElement = document.getElementById('confirm-password-error');
        } else {
            // Handle sign in fields and fallback
            errorElement = document.getElementById(fieldId.replace(/([A-Z])/g, '-$1').toLowerCase() + '-error') || 
                          document.getElementById(fieldId.replace('signIn', '').replace('signUp', '').toLowerCase() + '-error');
        }
        
        if (field) field.classList.remove('invalid');
        if (errorElement) errorElement.textContent = '';
    }

    setSubmitButtonState(formId, isLoading, text = null) {
        const submitButton = document.getElementById(formId.replace('Form', 'SubmitButton'));
        const buttonText = submitButton?.querySelector('.button-text');
        const spinner = submitButton?.querySelector('.button-spinner');

        if (submitButton) {
            submitButton.disabled = isLoading;
            if (buttonText && text) buttonText.textContent = text;
            if (spinner) spinner.hidden = !isLoading;
        }
    }

    async handleSignInSubmit(e) {
        e.preventDefault();
        if (!window.authService) return;

        const email = document.getElementById('signInEmail').value.trim();
        const password = document.getElementById('signInPassword').value;

        // Clear previous errors
        this.clearFieldError('signInEmail');
        this.clearFieldError('signInPassword');

        // Validate inputs
        const emailValidation = window.authService.validateEmail(email);
        const passwordValidation = window.authService.validatePassword(password);

        if (!emailValidation.isValid) {
            this.showFieldError('signInEmail', emailValidation.error);
            return;
        }

        if (!passwordValidation.isValid) {
            this.showFieldError('signInPassword', passwordValidation.error);
            return;
        }

        this.setSubmitButtonState('signInForm', true, 'Accesso...');

        try {
            const result = await window.authService.signIn(email, password);
            
            if (result.success) {
                this.hideSignInModal();
                window.signatureCleaner?.showStatus('Accesso effettuato con successo!', 'success');
            } else {
                // Show error on appropriate field
                if (result.error.includes('email') || result.error.includes('trovato')) {
                    this.showFieldError('signInEmail', result.error);
                } else {
                    this.showFieldError('signInPassword', result.error);
                }
            }
        } catch (error) {
            this.showFieldError('signInPassword', 'Errore di connessione');
        } finally {
            this.setSubmitButtonState('signInForm', false, 'Accedi');
        }
    }

    async handleSignUpSubmit(e) {
        e.preventDefault();
        if (!window.authService) return;

        const name = document.getElementById('signUpName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const password = document.getElementById('signUpPassword').value;

        // Clear previous errors
        this.clearFieldError('signUpEmail');
        this.clearFieldError('signUpPassword');

        // Validate inputs
        const emailValidation = window.authService.validateEmail(email);
        const passwordValidation = window.authService.validatePassword(password);

        if (!emailValidation.isValid) {
            this.showFieldError('signUpEmail', emailValidation.error);
            return;
        }

        if (!passwordValidation.isValid) {
            this.showFieldError('signUpPassword', passwordValidation.error);
            return;
        }

        this.setSubmitButtonState('signUpForm', true, 'Registrazione...');

        try {
            const result = await window.authService.signUp(email, password, name);
            
            if (result.success) {
                this.hideSignUpModal();
                // Show email verification message
                const message = result.message || 'Registrazione completata con successo! Controlla la tua email per la verifica.';
                window.signatureCleaner?.showStatus(message, 'success');
            } else {
                // Show error on appropriate field
                if (result.error.includes('email') || result.error.includes('uso')) {
                    this.showFieldError('signUpEmail', result.error);
                } else {
                    this.showFieldError('signUpPassword', result.error);
                }
            }
        } catch (error) {
            this.showFieldError('signUpPassword', 'Errore di connessione');
        } finally {
            this.setSubmitButtonState('signUpForm', false, 'Crea Account');
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        if (!window.authService) return;

        const email = document.getElementById('signInEmail').value.trim();
        
        if (!email) {
            this.showFieldError('signInEmail', 'Inserisci la tua email per il reset della password');
            return;
        }

        const emailValidation = window.authService.validateEmail(email);
        if (!emailValidation.isValid) {
            this.showFieldError('signInEmail', emailValidation.error);
            return;
        }

        try {
            const result = await window.authService.resetPassword(email);
            if (result.success) {
                window.signatureCleaner?.showStatus(result.message, 'success');
                this.hideSignInModal();
            } else {
                this.showFieldError('signInEmail', result.error);
            }
        } catch (error) {
            this.showFieldError('signInEmail', 'Errore durante il reset della password');
        }
    }

    async handleResendVerification() {
        if (!window.authService) return;

        const resendButton = document.getElementById('resendVerificationButton');
        if (resendButton) {
            resendButton.disabled = true;
            resendButton.textContent = 'Invio in corso...';
        }

        try {
            const result = await window.authService.sendEmailVerification();
            
            if (result.success) {
                window.signatureCleaner?.showStatus(result.message, 'success');
            } else {
                window.signatureCleaner?.showStatus(result.error, 'error');
            }
        } catch (error) {
            window.signatureCleaner?.showStatus('Errore durante l\'invio dell\'email', 'error');
        } finally {
            if (resendButton) {
                resendButton.disabled = false;
                resendButton.textContent = 'Rinvia Email';
            }
        }
    }

    async handleCheckVerification() {
        if (!window.authService) return;

        const checkButton = document.getElementById('checkVerificationButton');
        if (checkButton) {
            checkButton.disabled = true;
            checkButton.textContent = 'Controllo...';
        }

        try {
            const isVerified = await window.authService.reloadUserData();
            
            if (isVerified) {
                window.signatureCleaner?.showStatus('Email verificata con successo!', 'success');
                // The auth state change will automatically update the UI
            } else {
                window.signatureCleaner?.showStatus('Email non ancora verificata. Controlla la tua casella di posta e clicca sul link di verifica.', 'warning');
            }
        } catch (error) {
            window.signatureCleaner?.showStatus('Errore durante la verifica', 'error');
        } finally {
            if (checkButton) {
                checkButton.disabled = false;
                checkButton.textContent = 'Ho Verificato';
            }
        }
    }

    handleDismissBanner() {
        const banner = document.getElementById('emailVerificationBanner');
        if (banner) {
            banner.hidden = true;
        }
    }

    // Account Settings Methods
    setupAccountSettingsTabs() {
        const tabButtons = document.querySelectorAll('#accountSettingsModal .tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('#accountSettingsModal .tab-btn');
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tabName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Update tab content
        const tabContents = document.querySelectorAll('#accountSettingsModal .tab-content');
        tabContents.forEach(content => {
            if (content.id === tabName + 'Tab') {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    loadCurrentUserData() {
        if (!window.authService || !window.authService.currentUser) return;

        const user = window.authService.currentUser;
        const displayNameInput = document.getElementById('currentDisplayName');
        const emailInput = document.getElementById('currentEmail');

        if (displayNameInput) {
            displayNameInput.value = user.displayName || '';
        }
        if (emailInput) {
            emailInput.value = user.email || '';
        }
    }

    async handleProfileSubmit(e) {
        e.preventDefault();
        if (!window.authService || !window.authService.currentUser) return;

        const displayName = document.getElementById('currentDisplayName').value.trim();
        const email = document.getElementById('currentEmail').value.trim();
        const currentUser = window.authService.currentUser;

        // Clear previous errors
        this.clearFieldError('currentDisplayName');
        this.clearFieldError('currentEmail');

        let hasChanges = false;
        let requiresReauth = false;

        this.setSubmitButtonState('profileForm', true, 'Aggiornamento...');

        try {
            // Update display name if changed
            if (displayName !== (currentUser.displayName || '')) {
                await currentUser.updateProfile({ displayName: displayName });
                hasChanges = true;
            }

            // Update email if changed
            if (email !== currentUser.email) {
                const emailValidation = window.authService.validateEmail(email);
                if (!emailValidation.isValid) {
                    this.showFieldError('currentEmail', emailValidation.error);
                    return;
                }

                try {
                    await currentUser.updateEmail(email);
                    hasChanges = true;
                    requiresReauth = false;
                } catch (error) {
                    if (error.code === 'auth/requires-recent-login') {
                        this.showFieldError('currentEmail', 'Per cambiare email è necessario effettuare nuovamente l\'accesso. Fai logout e accedi di nuovo.');
                        requiresReauth = true;
                    } else {
                        this.showFieldError('currentEmail', window.authService.getItalianErrorMessage(error.code));
                    }
                    return;
                }
            }

            if (hasChanges) {
                let message = 'Profilo aggiornato con successo!';
                if (email !== currentUser.email && !requiresReauth) {
                    message += ' Controlla la tua nuova email per la verifica.';
                }
                window.signatureCleaner?.showStatus(message, 'success');
                this.hideAccountSettingsModal();
            } else {
                // No changes detected - no toast needed
            }

        } catch (error) {
            console.error('Profile update error:', error);
            window.signatureCleaner?.showStatus('Errore durante l\'aggiornamento del profilo', 'error');
        } finally {
            this.setSubmitButtonState('profileForm', false, 'Aggiorna Profilo');
        }
    }

    async handlePasswordSubmit(e) {
        e.preventDefault();
        if (!window.authService || !window.authService.currentUser) return;

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Clear previous errors
        this.clearFieldError('currentPassword');
        this.clearFieldError('newPassword');
        this.clearFieldError('confirmPassword');

        // Validate inputs
        const currentPasswordValidation = window.authService.validatePassword(currentPassword);
        const newPasswordValidation = window.authService.validatePassword(newPassword);

        if (!currentPasswordValidation.isValid) {
            this.showFieldError('currentPassword', currentPasswordValidation.error);
            return;
        }

        if (!newPasswordValidation.isValid) {
            this.showFieldError('newPassword', newPasswordValidation.error);
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showFieldError('confirmPassword', 'Le password non coincidono');
            return;
        }

        if (currentPassword === newPassword) {
            this.showFieldError('newPassword', 'La nuova password deve essere diversa da quella attuale');
            return;
        }

        this.setSubmitButtonState('passwordForm', true, 'Cambiando password...');

        try {
            const user = window.authService.currentUser;
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
            
            // Reauthenticate user
            await user.reauthenticateWithCredential(credential);
            
            // Update password
            await user.updatePassword(newPassword);
            
            window.signatureCleaner?.showStatus('Password cambiata con successo!', 'success');
            this.hideAccountSettingsModal();

        } catch (error) {
            console.error('Password change error:', error);
            
            if (error.code === 'auth/wrong-password') {
                this.showFieldError('currentPassword', 'Password attuale errata');
            } else {
                this.showFieldError('currentPassword', window.authService.getItalianErrorMessage(error.code));
            }
        } finally {
            this.setSubmitButtonState('passwordForm', false, 'Cambia Password');
        }
    }
}

// Create global instances
window.authService = new AuthService();

// Initialize AuthModalManager after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authModalManager = new AuthModalManager();
});