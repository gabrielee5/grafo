/**
 * Enhanced Signature Cleaner with Authentication and History
 * Production-ready version with Cloudflare Workers backend
 */

class ProductionSignatureCleaner {
    constructor() {
        this.authToken = null;
        this.currentUser = null;
        this.currentImageFile = null;
        this.processedImageBlob = null;
        this.workflowSteps = [];
        this.debugVisible = false;
        
        // History management
        this.historyCurrentPage = 1;
        this.historyTotalPages = 1;
        this.historyFilter = '';
        
        this.initializeApplication();
    }

    async initializeApplication() {
        // Check for existing authentication
        this.authToken = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        
        if (this.authToken && savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                // Verify token is still valid
                const isValid = await this.verifyToken();
                if (isValid) {
                    this.showApplication();
                    return;
                }
            } catch (error) {
                console.error('Error parsing saved user data:', error);
            }
        }
        
        // Show authentication if no valid session
        this.showAuthentication();
        this.setupAuthenticationListeners();
    }

    showAuthentication() {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }

    showApplication() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        
        // Initialize application elements and listeners
        this.initializeElements();
        this.setupEventListeners();
        this.updateUserInterface();
    }

    setupAuthenticationListeners() {
        // Form switching
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        });

        // Form submissions
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(e);
        });
    }

    async handleLogin(event) {
        const formData = new FormData(event.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        this.showLoading('Accesso in corso...');

        try {
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.AUTH_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (result.success) {
                this.authToken = result.token;
                this.currentUser = result.user;
                
                // Save to localStorage
                localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, this.authToken);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(this.currentUser));
                
                this.hideLoading();
                this.showApplication();
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            this.hideLoading();
            this.showAuthError('Errore nel login: ' + error.message);
        }
    }

    async handleRegister(event) {
        const formData = new FormData(event.target);
        const registerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        this.showLoading('Registrazione in corso...');

        try {
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.AUTH_ENDPOINTS.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            const result = await response.json();

            if (result.success) {
                this.authToken = result.token;
                this.currentUser = result.user;
                
                // Save to localStorage
                localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, this.authToken);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(this.currentUser));
                
                this.hideLoading();
                this.showApplication();
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            this.hideLoading();
            this.showAuthError('Errore nella registrazione: ' + error.message);
        }
    }

    async verifyToken() {
        try {
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.AUTH_ENDPOINTS.VERIFY, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            const result = await response.json();
            return result.success;

        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }

    handleLogout() {
        this.authToken = null;
        this.currentUser = null;
        
        // Clear localStorage
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        
        // Reset application state
        this.resetApplicationState();
        
        // Show authentication
        this.showAuthentication();
    }

    initializeElements() {
        // Existing elements from original script
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.customInstructions = document.getElementById('customInstructions');
        this.processButton = document.getElementById('processButton');
        this.previewSection = document.getElementById('previewSection');
        this.previewImage = document.getElementById('previewImage');
        this.previewFileName = document.getElementById('previewFileName');
        this.previewFileSize = document.getElementById('previewFileSize');
        this.resultsSection = document.getElementById('resultsSection');
        this.originalImage = document.getElementById('originalImage');
        this.processedImage = document.getElementById('processedImage');
        this.downloadButton = document.getElementById('downloadButton');
        this.resetButton = document.getElementById('resetButton');
        this.statusMessage = document.getElementById('statusMessage');
        this.debugToggle = document.getElementById('debugToggle');
        this.workflowStepsElement = document.getElementById('workflowSteps');
        this.workflowLadder = document.getElementById('workflowLadder');

        // New elements for authentication and history
        this.userNameElement = document.getElementById('user-name');
        this.logoutBtn = document.getElementById('logout-btn');
        this.viewHistoryBtn = document.getElementById('view-history-btn');
        this.historyPanel = document.getElementById('history-panel');
        this.closeHistoryBtn = document.getElementById('close-history-btn');
        this.historyList = document.getElementById('history-list');
        this.historyStatusFilter = document.getElementById('history-status-filter');
        this.exportHistoryBtn = document.getElementById('export-history-btn');
        this.historyPrevBtn = document.getElementById('history-prev-btn');
        this.historyNextBtn = document.getElementById('history-next-btn');
        this.historyPageInfo = document.getElementById('history-page-info');
    }

    setupEventListeners() {
        // Existing listeners (adapted from original script)
        this.imageInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.processButton.addEventListener('click', () => this.processImage());
        this.downloadButton.addEventListener('click', () => this.downloadImage());
        this.resetButton.addEventListener('click', () => this.resetApp());
        this.debugToggle.addEventListener('click', () => this.toggleDebugView());

        // New listeners for authentication and history
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        this.viewHistoryBtn.addEventListener('click', () => this.showHistoryPanel());
        this.closeHistoryBtn.addEventListener('click', () => this.hideHistoryPanel());
        this.historyStatusFilter.addEventListener('change', () => this.filterHistory());
        this.exportHistoryBtn.addEventListener('click', () => this.exportHistory());
        this.historyPrevBtn.addEventListener('click', () => this.previousHistoryPage());
        this.historyNextBtn.addEventListener('click', () => this.nextHistoryPage());

        // Auto-save prompt
        this.customInstructions.addEventListener('input', this.debounce(() => {
            localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_PROMPT, this.customInstructions.value);
        }, CONFIG.AUTO_SAVE_DELAY));
    }

    updateUserInterface() {
        if (this.currentUser) {
            this.userNameElement.textContent = this.currentUser.name || this.currentUser.email;
        }

        // Restore last prompt if available
        const lastPrompt = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_PROMPT);
        if (lastPrompt) {
            this.customInstructions.value = lastPrompt;
        }

        // Enable process button if we have the required elements
        this.updateProcessButtonState();
    }

    updateProcessButtonState() {
        const hasImage = this.currentImageFile !== null;
        const hasPrompt = this.customInstructions.value.trim() !== '';
        this.processButton.disabled = !(hasImage && hasPrompt);
    }

    // File handling methods (adapted from original)
    handleFileSelect(file) {
        if (!file) return;
        
        // Validate file type
        if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
            this.showStatus('Seleziona un file immagine valido (JPG, PNG, WEBP)', 'error');
            return;
        }

        // Validate file size
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            const maxSizeMB = Math.round(CONFIG.MAX_FILE_SIZE / (1024 * 1024));
            this.showStatus(`La dimensione del file immagine deve essere inferiore a ${maxSizeMB}MB`, 'error');
            return;
        }

        this.currentImageFile = file;
        this.showImagePreview(file);
        this.uploadArea.classList.add('has-image');
        this.updateProcessButtonState();
        
        // Update upload area to show selected file
        const placeholder = this.uploadArea.querySelector('.upload-placeholder');
        placeholder.innerHTML = `
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            <h3>Immagine Selezionata: ${file.name}</h3>
            <p>Clicca per selezionare un'immagine diversa</p>
        `;

        this.showStatus('Immagine caricata con successo. Pronto per elaborare.', 'success');
    }

    showImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewSection.hidden = false;
            this.previewImage.src = e.target.result;
            this.previewFileName.textContent = file.name;
            this.previewFileSize.textContent = this.formatFileSize(file.size);
            this.originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileSelect(files[0]);
        }
    }

    // Image processing with backend API
    async processImage() {
        if (!this.currentImageFile) return;

        this.setProcessingState(true);
        this.clearWorkflowSteps();

        try {
            const formData = new FormData();
            formData.append('image', this.currentImageFile);
            formData.append('prompt', this.customInstructions.value.trim());

            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.API_ENDPOINTS.PROCESS_IMAGE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Display workflow steps if available
                if (result.workflowSteps) {
                    this.workflowSteps = result.workflowSteps;
                    this.renderWorkflowSteps();
                }

                // Display processed image
                if (result.processedImageUrl) {
                    this.displayProcessedImageFromUrl(result.processedImageUrl);
                    this.showResults();
                }

                this.showStatus('Immagine elaborata con successo!', 'success');
                
                // Refresh history in background
                this.refreshHistoryInBackground();
                
            } else {
                throw new Error(result.error || 'Errore sconosciuto');
            }

        } catch (error) {
            console.error('Processing error:', error);
            this.showStatus(`Errore nell'elaborazione dell'immagine: ${error.message}`, 'error');
        } finally {
            this.setProcessingState(false);
        }
    }

    displayProcessedImageFromUrl(imageUrl) {
        this.processedImage.src = imageUrl;
        // Also create a downloadable blob
        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                this.processedImageBlob = blob;
            })
            .catch(error => console.error('Error creating blob for download:', error));
    }

    // History management
    async showHistoryPanel() {
        this.historyPanel.style.display = 'block';
        await this.loadHistory();
    }

    hideHistoryPanel() {
        this.historyPanel.style.display = 'none';
    }

    async loadHistory(page = 1) {
        try {
            document.getElementById('history-loading').style.display = 'block';
            
            const params = new URLSearchParams({
                limit: CONFIG.HISTORY_PAGE_SIZE,
                offset: (page - 1) * CONFIG.HISTORY_PAGE_SIZE
            });
            
            if (this.historyFilter) {
                params.append('status', this.historyFilter);
            }

            const response = await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.API_ENDPOINTS.HISTORY}?${params}`, 
                {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            const result = await response.json();

            if (result.success) {
                this.renderHistoryList(result.entries);
                this.updateHistoryPagination(page, result.totalCount);
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Error loading history:', error);
            this.showStatus('Errore nel caricamento della cronologia', 'error');
        } finally {
            document.getElementById('history-loading').style.display = 'none';
        }
    }

    renderHistoryList(entries) {
        const historyList = this.historyList;
        const loadingElement = document.getElementById('history-loading');
        
        // Clear existing entries except loading element
        Array.from(historyList.children).forEach(child => {
            if (child !== loadingElement) {
                child.remove();
            }
        });

        if (entries.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'history-empty';
            emptyMessage.textContent = 'Nessuna elaborazione trovata';
            historyList.appendChild(emptyMessage);
            return;
        }

        entries.forEach(entry => {
            const historyItem = this.createHistoryItemElement(entry);
            historyList.appendChild(historyItem);
        });
    }

    createHistoryItemElement(entry) {
        const item = document.createElement('div');
        item.className = `history-item status-${entry.status}`;
        item.dataset.entryId = entry.id;

        const date = new Date(entry.timestamp).toLocaleString('it-IT');
        const processingTime = entry.processingTime ? 
            `${Math.round(entry.processingTime / 1000 * 100) / 100}s` : 
            'N/A';

        item.innerHTML = `
            <div class="history-item-header">
                <div class="history-date">${date}</div>
                <div class="history-status">${this.getStatusText(entry.status)}</div>
            </div>
            <div class="history-prompt">${this.truncateText(entry.originalPrompt, 100)}</div>
            <div class="history-meta">
                <span class="processing-time">Tempo: ${processingTime}</span>
                ${entry.fileName ? `<span class="file-name">${entry.fileName}</span>` : ''}
            </div>
            <div class="history-actions">
                ${entry.processedImageUrl ? `
                    <button class="history-action-btn view-btn" onclick="signatureCleaner.viewHistoryItem('${entry.id}')">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                ` : ''}
                <button class="history-action-btn delete-btn" onclick="signatureCleaner.deleteHistoryItem('${entry.id}')">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        return item;
    }

    async viewHistoryItem(entryId) {
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.API_ENDPOINTS.HISTORY_ITEM}${entryId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            const result = await response.json();

            if (result.success) {
                this.displayHistoryItemDetails(result.entry);
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Error viewing history item:', error);
            this.showStatus('Errore nel visualizzare l\'elemento', 'error');
        }
    }

    displayHistoryItemDetails(entry) {
        // Hide history panel and show the main interface with historical data
        this.hideHistoryPanel();
        
        // Load the historical images and data
        if (entry.originalImageUrl) {
            this.originalImage.src = entry.originalImageUrl;
            this.previewImage.src = entry.originalImageUrl;
            this.previewSection.hidden = false;
        }
        
        if (entry.processedImageUrl) {
            this.processedImage.src = entry.processedImageUrl;
            this.resultsSection.hidden = false;
            
            // Create downloadable blob
            fetch(entry.processedImageUrl)
                .then(response => response.blob())
                .then(blob => {
                    this.processedImageBlob = blob;
                })
                .catch(error => console.error('Error creating blob:', error));
        }
        
        // Load the original prompt
        this.customInstructions.value = entry.originalPrompt;
        
        // Show workflow steps if available
        if (entry.workflowSteps) {
            this.workflowSteps = entry.workflowSteps;
            this.renderWorkflowSteps();
        }
        
        this.showStatus('Elemento storico caricato', 'info');
    }

    async deleteHistoryItem(entryId) {
        if (!confirm('Sei sicuro di voler eliminare questo elemento dalla cronologia?')) {
            return;
        }

        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.API_ENDPOINTS.HISTORY_ITEM}${entryId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            const result = await response.json();

            if (result.success) {
                // Reload current page of history
                await this.loadHistory(this.historyCurrentPage);
                this.showStatus('Elemento eliminato dalla cronologia', 'success');
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Error deleting history item:', error);
            this.showStatus('Errore nell\'eliminazione dell\'elemento', 'error');
        }
    }

    updateHistoryPagination(currentPage, totalCount) {
        this.historyCurrentPage = currentPage;
        this.historyTotalPages = Math.ceil(totalCount / CONFIG.HISTORY_PAGE_SIZE);
        
        this.historyPrevBtn.disabled = currentPage <= 1;
        this.historyNextBtn.disabled = currentPage >= this.historyTotalPages;
        this.historyPageInfo.textContent = `Pagina ${currentPage} di ${this.historyTotalPages}`;
    }

    async previousHistoryPage() {
        if (this.historyCurrentPage > 1) {
            await this.loadHistory(this.historyCurrentPage - 1);
        }
    }

    async nextHistoryPage() {
        if (this.historyCurrentPage < this.historyTotalPages) {
            await this.loadHistory(this.historyCurrentPage + 1);
        }
    }

    async filterHistory() {
        this.historyFilter = this.historyStatusFilter.value;
        this.historyCurrentPage = 1;
        await this.loadHistory(1);
    }

    async exportHistory() {
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.API_ENDPOINTS.HISTORY_EXPORT}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const filename = `cronologia_${new Date().toISOString().split('T')[0]}.json`;
                
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showStatus('Cronologia esportata con successo', 'success');
            } else {
                throw new Error('Export failed');
            }

        } catch (error) {
            console.error('Error exporting history:', error);
            this.showStatus('Errore nell\'esportazione della cronologia', 'error');
        }
    }

    async refreshHistoryInBackground() {
        // Silently refresh history if panel is open
        if (this.historyPanel.style.display === 'block') {
            await this.loadHistory(this.historyCurrentPage);
        }
    }

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'In corso',
            'completed': 'Completato',
            'failed': 'Fallito'
        };
        return statusMap[status] || status;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Workflow and debug methods (adapted from original)
    toggleDebugView() {
        this.debugVisible = !this.debugVisible;
        
        if (this.debugVisible) {
            this.workflowStepsElement.hidden = false;
            this.debugToggle.textContent = 'Nascondi Processo';
        } else {
            this.workflowStepsElement.hidden = true;
            this.debugToggle.textContent = 'Mostra Processo';
        }
    }

    clearWorkflowSteps() {
        this.workflowSteps = [];
        this.workflowLadder.innerHTML = '';
    }

    renderWorkflowSteps() {
        this.workflowLadder.innerHTML = '';
        this.workflowSteps.forEach((step, index) => {
            this.renderWorkflowStep({ ...step, id: index + 1 });
        });
    }

    renderWorkflowStep(step) {
        const stepElement = document.createElement('div');
        stepElement.className = 'workflow-step';

        const statusClass = step.status === 'completed' ? 'completed' : 
                           step.status === 'failed' ? 'failed' : '';

        stepElement.innerHTML = `
            <div class="step-header">
                <div class="step-number ${statusClass}">${step.id}</div>
                <div class="step-title">${step.title}</div>
                <div class="step-status">${this.getStatusText(step.status)}</div>
            </div>
            <div class="step-content">
                ${step.prompt ? `
                    <div class="step-prompt">
                        <div class="step-prompt-label">Prompt Inviato</div>
                        <div class="step-prompt-text">${this.escapeHtml(step.prompt)}</div>
                    </div>
                ` : ''}
                ${step.response ? `
                    <div class="step-response">
                        <div class="step-response-label">Risposta Ricevuta</div>
                        <div class="step-response-text">${this.escapeHtml(step.response)}</div>
                    </div>
                ` : ''}
                ${step.details ? `
                    <div class="step-details">
                        <div class="step-details-label">Dettagli</div>
                        <div class="step-details-text">${this.escapeHtml(step.details)}</div>
                    </div>
                ` : ''}
                ${step.timestamp ? `
                    <div class="step-timing">Timestamp: ${new Date(step.timestamp).toLocaleTimeString()}</div>
                ` : ''}
            </div>
        `;

        this.workflowLadder.appendChild(stepElement);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // UI state management
    showResults() {
        this.resultsSection.hidden = false;
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    downloadImage() {
        if (!this.processedImageBlob) return;
        
        const url = URL.createObjectURL(this.processedImageBlob);
        const a = document.createElement('a');
        const filename = this.currentImageFile ? 
            this.currentImageFile.name.replace(/\.[^/.]+$/, '') + '_enhanced.png' :
            'enhanced_signature.png';
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showStatus('Immagine migliorata scaricata con successo!', 'success');
    }

    resetApp() {
        this.currentImageFile = null;
        this.processedImageBlob = null;
        this.clearWorkflowSteps();
        
        // Reset UI
        this.imageInput.value = '';
        this.customInstructions.value = '';
        this.previewSection.hidden = true;
        this.resultsSection.hidden = true;
        this.uploadArea.classList.remove('has-image');
        this.updateProcessButtonState();
        
        // Reset upload area placeholder
        const placeholder = this.uploadArea.querySelector('.upload-placeholder');
        placeholder.innerHTML = `
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <h3>Drop your signature image here</h3>
            <p>or <span class="browse-link">browse to upload</span></p>
            <small>Supports JPG, PNG, WEBP formats</small>
        `;
        
        this.hideStatus();
        
        // Clear saved prompt
        localStorage.removeItem(CONFIG.STORAGE_KEYS.LAST_PROMPT);
    }

    resetApplicationState() {
        this.resetApp();
        this.clearWorkflowSteps();
        this.hideHistoryPanel();
    }

    setProcessingState(isProcessing) {
        this.processButton.disabled = isProcessing;
        
        if (isProcessing) {
            this.processButton.classList.add('processing');
            this.processButton.querySelector('.button-text').textContent = 'Elaborazione...';
            this.processButton.querySelector('.spinner').hidden = false;
        } else {
            this.processButton.classList.remove('processing');
            this.processButton.querySelector('.button-text').textContent = 'Elabora Immagine';
            this.processButton.querySelector('.spinner').hidden = true;
        }
    }

    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        this.statusMessage.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => this.hideStatus(), 5000);
        }
    }

    hideStatus() {
        this.statusMessage.style.display = 'none';
    }

    showAuthError(message) {
        // Create or update auth error element
        let errorElement = document.querySelector('.auth-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'auth-error';
            document.querySelector('.auth-card').appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    showLoading(message) {
        const overlay = document.getElementById('loading-overlay');
        const messageElement = document.getElementById('loading-message');
        messageElement.textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

// Initialize the application
let signatureCleaner;

document.addEventListener('DOMContentLoaded', () => {
    signatureCleaner = new ProductionSignatureCleaner();
});

// Make instance globally available for HTML onclick handlers
window.signatureCleaner = signatureCleaner;