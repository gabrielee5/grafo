class AuthService {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.initialized = false;
        this.initializeFirebase();
    }

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
            
            return { success: true, user: result.user };
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

    // User data methods
    isLoggedIn() {
        return this.currentUser !== null;
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

    // UI management
    updateAuthUI(user) {
        const authButton = document.getElementById('authButton');
        const userMenu = document.getElementById('userMenu');
        
        if (!authButton) return; // UI not ready yet
        
        if (user) {
            // User is logged in
            authButton.textContent = this.getUserDisplayName();
            authButton.className = 'auth-button logged-in';
            if (userMenu) userMenu.hidden = false;
            
            // Make sure auth modal is hidden when user logs in
            const authModal = document.getElementById('authModal');
            if (authModal) {
                authModal.setAttribute('hidden', '');
                authModal.style.display = 'none';
            }
            
            // Show history panel if exists
            const historyPanel = document.getElementById('historyPanel');
            if (historyPanel) {
                historyPanel.hidden = false;
                this.loadUserHistoryUI();
            }
        } else {
            // User is not logged in
            authButton.textContent = 'Accedi';
            authButton.className = 'auth-button';
            if (userMenu) userMenu.hidden = true;
            
            // Make sure auth modal is hidden for anonymous users too
            const authModal = document.getElementById('authModal');
            if (authModal) {
                authModal.setAttribute('hidden', '');
                authModal.style.display = 'none';
            }
            
            // Hide history panel
            const historyPanel = document.getElementById('historyPanel');
            if (historyPanel) historyPanel.hidden = true;
        }
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

    // Error message translation
    getItalianErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'Utente non trovato',
            'auth/wrong-password': 'Password errata',
            'auth/email-already-in-use': 'Email già in uso',
            'auth/weak-password': 'Password troppo debole',
            'auth/invalid-email': 'Email non valida',
            'auth/user-disabled': 'Account disabilitato',
            'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi',
            'auth/network-request-failed': 'Errore di connessione',
            'auth/internal-error': 'Errore interno del server'
        };
        
        return errorMessages[errorCode] || 'Errore di autenticazione';
    }

    // Utility methods
    isEmailValid(email) {
        // Use SecurityUtils if available, otherwise fallback to simple check
        if (window.SecurityUtils) {
            return SecurityUtils.isValidEmail(email);
        }
        
        // Fallback validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof email === 'string' && emailRegex.test(email) && email.length <= 254;
    }

    isPasswordValid(password) {
        // Use SecurityUtils if available for enhanced validation
        if (window.SecurityUtils) {
            const validation = SecurityUtils.validatePassword(password);
            return validation.isValid;
        }
        
        // Fallback validation
        return password && typeof password === 'string' && password.length >= 6 && password.length <= 128;
    }
}

// Create global auth service instance
window.authService = new AuthService();