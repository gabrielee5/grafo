class SignatureCleaner {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.currentImageFile = null;
        this.processedImageBlob = null;
        this.originalImageFile = null;
        this.originalImageBlob = null;
        
        // Workflow tracking
        this.workflowSteps = [];
        this.processingUsedFallback = false;
        
        // Step mapping for user-friendly names
        this.stepMapping = {
            'Input Utente Ricevuto': { 
                key: 'validation', 
                userFriendlyName: 'Validazione Input' 
            },
            'Traduzione Italiano → Inglese': { 
                key: 'translation', 
                userFriendlyName: 'Traduzione' 
            },
            'Miglioramento Prompt Tecnico': { 
                key: 'enhancement', 
                userFriendlyName: 'Ottimizzazione' 
            },
            'Elaborazione Immagine': { 
                key: 'processing', 
                userFriendlyName: 'Elaborazione' 
            },
            'Fallback: Elaborazione Diretta': { 
                key: 'processing', 
                userFriendlyName: 'Elaborazione' 
            }
        };
        
        // Load configuration
        this.maxFileSize = CONFIG.MAX_FILE_SIZE;
        this.supportedFormats = CONFIG.SUPPORTED_FORMATS;
        
        // Check backend connectivity
        this.checkBackendConnection();
        
        // Initialize authentication UI after a delay
        setTimeout(() => {
            this.initializeAuthUI();
        }, 500);
    }

    initializeElements() {
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
        this.editFurtherButton = document.getElementById('editFurtherButton');
        this.downloadButton = document.getElementById('downloadButton');
        this.resetButton = document.getElementById('resetButton');
        this.toastContainer = document.getElementById('toastContainer');
        this.workflowStepsElement = document.getElementById('workflowSteps');
        this.workflowLadder = document.getElementById('workflowLadder');
        
        // Progress bar elements
        this.progressSection = document.getElementById('progressSection');
        this.progressCurrentStep = document.getElementById('progressCurrentStep');
        this.stepsCompleted = document.getElementById('stepsCompleted');
        
        // Zoom control elements
        this.initializeZoomElements();
    }

    async checkBackendConnection() {
        try {
            const healthUrl = window.configLoader?.getHealthUrl() || `${CONFIG.API_BASE_URL}/health`;
            const response = await fetch(healthUrl);
            
            if (response.ok) {
                const health = await response.json();
                console.log('✅ Backend server connected:', health);
            } else {
                throw new Error(`Health check failed: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Backend server connection failed:', error);
            this.showStatus('Backend server non disponibile. Avvia il server per usare l\'app.', 'error');
            this.processButton.disabled = true;
            this.processButton.title = 'Backend server not available. Please start the server on port 3001.';
        }
    }

    setupEventListeners() {
        // File input change
        this.imageInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        
        // Upload area click
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Process button
        this.processButton.addEventListener('click', () => this.processImage());
        
        // Edit further button
        this.editFurtherButton.addEventListener('click', () => this.editFurther());
        
        // Download button
        this.downloadButton.addEventListener('click', () => this.downloadImage());
        
        // Reset button
        this.resetButton.addEventListener('click', () => this.resetApp());
        
        // Debug functionality removed from UI
        
        // Zoom functionality
        this.setupZoomListeners();
        
        // Authentication event listeners
        this.setupAuthListeners();
        
        // Footer links
        this.setupFooterListeners();
        
        // Content modal controls
        this.setupContentModalListeners();
    }
    
    setupAuthListeners() {
        // Auth button - now uses the new modal manager
        const authButton = document.getElementById('authButton');
        if (authButton) {
            authButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.authService && window.authService.isLoggedIn()) {
                    this.toggleUserMenu();
                } else {
                    // Show sign in modal by default
                    if (window.authModalManager) {
                        window.authModalManager.showSignInModal();
                    } else {
                        // If AuthModalManager isn't ready yet, wait a bit and try again
                        setTimeout(() => {
                            if (window.authModalManager) {
                                window.authModalManager.showSignInModal();
                            }
                        }, 100);
                    }
                }
            });
        }
        
        // User menu controls
        const accountSettingsButton = document.getElementById('accountSettingsButton');
        const historyButton = document.getElementById('historyButton');
        const logoutButton = document.getElementById('logoutButton');
        
        if (accountSettingsButton) {
            accountSettingsButton.addEventListener('click', () => this.showAccountSettings());
        }
        
        if (historyButton) {
            historyButton.addEventListener('click', () => this.showHistoryPanel());
        }
        
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.handleLogout());
        }
        
        // History panel controls
        const closeHistoryButton = document.getElementById('closeHistoryButton');
        if (closeHistoryButton) {
            closeHistoryButton.addEventListener('click', () => this.hideHistoryPanel());
        }
        
        // Close user menu and history panel when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('userMenu');
            const authButton = document.getElementById('authButton');
            const historyPanel = document.getElementById('historyPanel');
            const historyButton = document.getElementById('historyButton');
            
            // Close user menu when clicking outside
            if (userMenu && authButton && !userMenu.contains(e.target) && !authButton.contains(e.target)) {
                userMenu.hidden = true;
                authButton.classList.remove('menu-open');
            }
            
            // Close history panel when clicking outside (but not when clicking the history button)
            if (historyPanel && !historyPanel.hidden && 
                !historyPanel.contains(e.target) && 
                historyButton && !historyButton.contains(e.target)) {
                if (window.signatureCleaner) {
                    window.signatureCleaner.hideHistoryPanel();
                }
            }
        });
    }
    
    setupFooterListeners() {
        // Footer navigation links
        const footerLinks = {
            'guideLink': 'guide',
            'faqLink': 'faq',
            'examplesLink': 'examples',
            'contactLink': 'contact',
            'technicalSupportLink': 'support',
            'feedbackLink': 'feedback',
            'privacyLink': 'privacy',
            'termsLink': 'terms',
            'aboutLink': 'about'
        };
        
        // Add event listeners to all footer links
        Object.entries(footerLinks).forEach(([linkId, page]) => {
            const link = document.getElementById(linkId);
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateToPage(page);
                });
            }
        });
    }
    
    navigateToPage(page) {
        const pageContent = this.getPageContent(page);
        if (pageContent) {
            this.showContentModal(pageContent.title, pageContent.content);
        } else {
            this.showStatus('Pagina non trovata', 'error');
        }
    }
    
    getPageContent(page) {
        if (window.PAGES_DATA && window.PAGES_DATA[page]) {
            return window.PAGES_DATA[page];
        }
        
        console.error(`Page content not found for: ${page}`);
        return {
            title: 'Pagina non trovata',
            content: '<p>Contenuto non disponibile.</p>'
        };
    }
    
    
    lockBodyScroll() {
        document.body.style.overflow = 'hidden';
    }
    
    unlockBodyScroll() {
        document.body.style.overflow = '';
    }

    showContentModal(title, content) {
        const modal = document.getElementById('contentModal');
        const modalTitle = document.getElementById('contentModalTitle');
        const modalBody = document.getElementById('contentModalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            this.lockBodyScroll();
            modal.removeAttribute('hidden');
            
            // Force scroll reset after DOM is updated
            setTimeout(() => {
                modalBody.scrollTop = 0;
            }, 0);
        }
    }
    
    setupContentModalListeners() {
        const closeButton = document.getElementById('closeContentButton');
        const modal = document.getElementById('contentModal');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                if (modal) {
                    modal.setAttribute('hidden', '');
                    this.unlockBodyScroll();
                }
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.setAttribute('hidden', '');
                    this.unlockBodyScroll();
                }
            });
        }
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

    async handleFileSelect(file) {
        if (!file) return;
        
        // Validate file type
        if (!this.supportedFormats.includes(file.type)) {
            this.showStatus('Seleziona un file immagine valido (JPG, PNG, WEBP)', 'error');
            return;
        }

        // Validate file size
        if (file.size > this.maxFileSize) {
            const maxSizeMB = Math.round(this.maxFileSize / (1024 * 1024));
            this.showStatus(`La dimensione del file immagine deve essere inferiore a ${maxSizeMB}MB`, 'error');
            return;
        }

        try {
            // Analyze metadata before stripping (silently)
            const metadataAnalysis = await ImagePrivacyUtils.analyzeMetadata(file);
            
            // Strip metadata for privacy (silently)
            const cleanFile = await ImagePrivacyUtils.stripMetadata(file);

            this.currentImageFile = cleanFile;
            this.originalImageFile = file; // Keep original for size comparison
            this.metadataAnalysis = metadataAnalysis;
            
            this.showImagePreview(cleanFile);
            this.processButton.disabled = false;
            this.uploadArea.classList.add('has-image');
            
            // Update upload area to show selected file with simple privacy info
            const placeholder = this.uploadArea.querySelector('.upload-placeholder');
            
            placeholder.innerHTML = `
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <h3>${cleanFile.name}</h3>
                <p>Privacy protetta • Click per cambiare immagine</p>
            `;

            this.showStatus('Immagine caricata con successo. Pronto per elaborare.', 'success');

        } catch (error) {
            console.error('Privacy processing failed:', error);
            // Fallback to original file if stripping fails
            this.currentImageFile = file;
            this.showImagePreview(file);
            this.processButton.disabled = false;
            this.uploadArea.classList.add('has-image');
            
            const placeholder = this.uploadArea.querySelector('.upload-placeholder');
            placeholder.innerHTML = `
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                <h3>Image Selected: ${file.name}</h3>
                <p>Click to select a different image</p>
            `;
            
            this.showStatus('Immagine caricata con successo. Pronto per elaborare.', 'success');
        }
    }

    showImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Show preview section
            this.previewSection.hidden = false;
            
            // Set preview image
            this.previewImage.src = e.target.result;
            
            // Set file info
            this.previewFileName.textContent = file.name;
            this.previewFileSize.textContent = this.formatFileSize(file.size);
            
            // Also set original image for results section
            this.originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async processImage() {
        if (!this.currentImageFile) return;

        // Check if user is authenticated
        if (!window.authService || !window.authService.isLoggedIn()) {
            this.showStatus('Accesso richiesto per utilizzare il servizio', 'error');
            if (window.authModalManager) {
                window.authModalManager.showSignInModal();
            }
            return;
        }

        // Check if user's email is verified
        if (!window.authService.isEmailVerified()) {
            this.showStatus('Verifica la tua email per utilizzare il servizio. Controlla la tua casella di posta e clicca sul link di verifica.', 'error');
            return;
        }

        this.setProcessingState(true);
        this.clearWorkflowSteps(); // Clear previous workflow steps
        this.processingUsedFallback = false; // Reset fallback flag
        
        // Hide previous results when starting new processing
        this.resultsSection.hidden = true;

        try {
            // Convert image to base64
            const base64Image = await this.fileToBase64(this.currentImageFile);
            const base64Data = base64Image.split(',')[1]; // Remove data:image/... prefix

            // Get Italian user input
            const italianInput = this.customInstructions.value.trim();
            
            if (!italianInput) {
                this.showStatus('Fornire le istruzioni di elaborazione nell\'area di testo', 'error');
                return;
            }

            // Add initial step
            this.addWorkflowStep({
                title: 'Input Utente Ricevuto',
                status: 'completed',
                prompt: `Input originale in italiano:\n"${italianInput}"`,
                response: 'Input validato e pronto per la traduzione',
                startTime: new Date(),
                endTime: new Date()
            });

            // Process through 3-step pipeline
            const response = await this.processImageWithPipeline(base64Data, italianInput);
            
            if (response.success) {
                this.displayProcessedImage(response.imageData);
                this.showResults();
                
                // Show different messages based on processing quality
                if (this.processingUsedFallback) {
                    this.showStatus('Immagine elaborata con elaborazione semplificata.', 'warning');
                } else {
                    this.showStatus('Immagine elaborata con successo!', 'success');
                }
                
                // Save to history
                await this.saveToHistory(italianInput);
            } else {
                throw new Error(response.error || 'Failed to process image');
            }

        } catch (error) {
            console.error('Processing error:', error);
            this.showStatus(`Errore nell'elaborazione dell'immagine: ${error.message} `, 'error');
        } finally {
            this.setProcessingState(false);
        }
    }

    // 3-step pipeline: Italian → English → Enhanced → Image Processing
    async processImageWithPipeline(base64Data, italianInput) {
        try {
            // Step 1: Translation
            this.updateProcessButtonText('Traduzione...');
            const englishText = await this.translateToEnglish(italianInput);
            
            // Step 2: Enhancement
            this.updateProcessButtonText('Miglioramento...');
            const enhancedPrompt = await this.enhancePrompt(englishText);
            
            // Step 3: Image Processing
            this.updateProcessButtonText('Elaborazione...');
            
            const imageStep = this.addWorkflowStep({
                title: 'Elaborazione Immagine',
                status: 'in-progress',
                prompt: enhancedPrompt,
                startTime: new Date()
            });
            
            const response = await this.callGeminiAPI(base64Data, enhancedPrompt);
            
            this.updateWorkflowStep(imageStep.id, {
                status: response.success ? 'completed' : 'failed',
                response: response.success ? 'Immagine elaborata con successo' : response.error,
                endTime: new Date()
            });
            
            return response;
            
        } catch (error) {
            console.error('Pipeline error:', error);
            
            // Mark that fallback is being used
            this.processingUsedFallback = true;
            
            // Add fallback step
            const fallbackStep = this.addWorkflowStep({
                title: 'Fallback: Elaborazione Diretta',
                status: 'in-progress',
                prompt: italianInput,
                startTime: new Date()
            });
            
            // Fallback: try direct processing with Italian text
            console.log('Fallback: attempting direct processing');
            
            try {
                const response = await this.callGeminiAPI(base64Data, italianInput);
                this.updateWorkflowStep(fallbackStep.id, {
                    status: response.success ? 'completed' : 'failed',
                    response: response.success ? 'Elaborazione fallback riuscita' : response.error,
                    endTime: new Date()
                });
                return response;
            } catch (fallbackError) {
                this.updateWorkflowStep(fallbackStep.id, {
                    status: 'failed',
                    response: `Errore fallback: ${fallbackError.message}`,
                    endTime: new Date()
                });
                throw fallbackError;
            }
        }
    }

    // Translation function using backend API
    async translateToEnglish(italianText) {
        const translationStep = this.addWorkflowStep({
            title: 'Traduzione Italiano → Inglese',
            status: 'in-progress',
            startTime: new Date()
        });

        try {
            const translationPrompt = `Translate this Italian text to English, preserving technical terminology related to handwriting analysis and graphology: "${italianText}"

Return only the English translation, no additional text.`;

            this.updateWorkflowStep(translationStep.id, { prompt: translationPrompt });

            // Use backend translation endpoint
            const translateUrl = window.configLoader?.getTranslateTextUrl() || `${CONFIG.API_BASE_URL}/translate-text`;
            
            const response = await fetch(translateUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: italianText })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Translation failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success || !data.translatedText) {
                throw new Error(data.error || 'No translation received');
            }

            const result = data.translatedText.trim();
            
            this.updateWorkflowStep(translationStep.id, {
                status: 'completed',
                response: result,
                endTime: new Date()
            });

            return result;
            
        } catch (error) {
            console.error('Translation error:', error);
            this.updateWorkflowStep(translationStep.id, {
                status: 'failed',
                response: `Errore: ${error.message}`,
                endTime: new Date()
            });
            throw new Error('Errore durante la traduzione');
        }
    }

    // Prompt enhancement function using backend API
    async enhancePrompt(translatedText) {
        const enhancementStep = this.addWorkflowStep({
            title: 'Miglioramento Prompt Tecnico',
            status: 'in-progress',
            startTime: new Date()
        });

        try {
            // Original enhancement prompt
            const enhancementPrompt = `Enhance this instruction for image processing of handwritten signatures/text. Make it more specific and technical while preserving the original intent: "${translatedText}"

Focus on:
- Image cleaning and noise reduction
- Contrast and clarity improvements
- Preservation of authentic handwriting characteristics
- Technical specifications for signature enhancement

Return only the enhanced prompt, no additional text.`;

            // New detailed enhancement prompt, as per first tests is worse then the original
            const enhancementPrompt2 = `You are a professional prompt engineer for an AI image processing model. Your task is to generate a highly specific and technical prompt for cleaning and isolating handwritten signatures or text from a digital image, based on a user's request.

The user's original request is: "${translatedText}"

Your prompt must include the following specifications:
- The core action is to isolate and remove the background.
- The desired output is an image with a white background.
- It must explicitly command the removal of common imperfections like smudges, stains, wrinkles, shadows, and any underlying typed or printed text.
- The prompt should emphasize maintaining the authentic characteristics of the handwriting, such as line weight and texture.
- The final output should be high-resolution and have sharp, high-contrast lines.

You must also analyze the user's request for any specific instructions. If the user asks to "keep," "preserve," or "leave" a certain element (e.g., a color, a mark, a line), you must add an explicit instruction at the end of the prompt to ensure that element is not removed.

Return only the final, enhanced prompt. Do not include any additional text, explanations, or conversational phrases.`;

            // mix of the two prompts, seems to work worse than the original
            const enhancementPrompt3 = `You are a professional prompt engineer for an AI image processing model. Your task is to generate a highly specific and technical prompt for cleaning and isolating handwritten signatures or text from a digital image, based on a user's request.
            
Enhance this instruction for image processing of handwritten signatures/text. Make it more specific and technical while preserving the original intent: "${translatedText}"

Focus on:
- Image cleaning and noise reduction
- Contrast and clarity improvements
- Preservation of authentic handwriting characteristics
- Technical specifications for signature enhancement

Return only the enhanced prompt, no additional text.`;

            this.updateWorkflowStep(enhancementStep.id, { prompt: enhancementPrompt });

            // Use backend enhancement endpoint
            const enhanceUrl = window.configLoader?.getEnhancePromptUrl() || `${CONFIG.API_BASE_URL}/enhance-prompt`;
            
            const response = await fetch(enhanceUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: translatedText })
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                // Check if backend provided a fallback
                if (errorData.fallback) {
                    console.warn('Enhancement failed, using fallback text:', errorData.error);
                    this.processingUsedFallback = true; // Mark fallback usage
                    this.updateWorkflowStep(enhancementStep.id, {
                        status: 'completed',
                        response: `Fallback: ${errorData.error}`,
                        endTime: new Date()
                    });
                    return errorData.fallback; // Use original text
                }
                
                throw new Error(errorData.error || `Enhancement failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success || !data.enhancedText) {
                throw new Error(data.error || 'No enhancement received');
            }

            const result = data.enhancedText.trim();
            
            this.updateWorkflowStep(enhancementStep.id, {
                status: 'completed',
                response: result,
                endTime: new Date()
            });

            return result;
            
        } catch (error) {
            console.error('Enhancement error:', error);
            this.updateWorkflowStep(enhancementStep.id, {
                status: 'failed',
                response: `Errore: ${error.message}`,
                endTime: new Date()
            });
            throw new Error('Errore nel miglioramento del prompt');
        }
    }

    // Removed callGeminiTextAPI - now using backend endpoints for translation and enhancement

    async callGeminiAPI(base64Image, prompt) {
        try {
            // Prepare form data for multipart upload
            const formData = new FormData();
            
            // Convert base64 back to file for upload
            const binaryData = atob(base64Image);
            const bytes = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
                bytes[i] = binaryData.charCodeAt(i);
            }
            
            const imageBlob = new Blob([bytes], { type: this.currentImageFile.type });
            formData.append('image', imageBlob, this.currentImageFile.name);
            formData.append('instructions', prompt);

            // Get the backend API URL
            const processUrl = window.configLoader?.getProcessImageUrl() || `${CONFIG.API_BASE_URL}/process-image`;

            // Get authentication token
            const authToken = await window.authService.getCurrentUser()?.getIdToken();
            const headers = {};
            
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(processUrl, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Process the API response
            
            if (data.success && data.imageData) {
                // The backend returns a data URL (data:image/...;base64,...)
                // Convert it to blob for consistent handling
                const response = await fetch(data.imageData);
                const blob = await response.blob();
                
                return {
                    success: true,
                    imageData: blob
                };
            } else {
                // If no processed image received, fallback to simulation
                console.warn('No image generated by API, falling back to simulation');
                this.processingUsedFallback = true; // Mark fallback usage
                return await this.simulateImageProcessing();
            }

        } catch (error) {
            console.error('Backend API error:', error);
            
            // Check if error is network-related
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                // Network error - try fallback simulation
                console.warn('Network error, falling back to simulation');
                this.processingUsedFallback = true; // Mark fallback usage
                try {
                    return await this.simulateImageProcessing();
                } catch (simError) {
                    return {
                        success: false,
                        error: 'Unable to connect to the backend server. Please ensure the server is running on port 3001.'
                    };
                }
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Temporary simulation of image processing until proper API integration
    async simulateImageProcessing() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Create a canvas to apply basic enhancements
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const img = new Image();
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Draw original image
                    ctx.drawImage(img, 0, 0);
                    
                    // Apply basic enhancements
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    this.applyBasicEnhancements(imageData.data);
                    ctx.putImageData(imageData, 0, 0);
                    
                    // Convert to blob
                    canvas.toBlob((blob) => {
                        resolve({
                            success: true,
                            imageData: blob
                        });
                    }, 'image/png');
                };
                
                img.src = this.originalImage.src;
            }, 2000); // Simulate processing time
        });
    }

    applyBasicEnhancements(data) {
        // Basic image enhancement: increase contrast and reduce noise
        for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale for better text processing
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            
            // Increase contrast
            const contrast = 1.5;
            const enhanced = Math.min(255, Math.max(0, (gray - 128) * contrast + 128));
            
            // Apply threshold for cleaner text
            const threshold = enhanced > 180 ? 255 : enhanced < 80 ? 0 : enhanced;
            
            data[i] = threshold;     // Red
            data[i + 1] = threshold; // Green  
            data[i + 2] = threshold; // Blue
            // data[i + 3] is alpha, leave unchanged
        }
    }

    displayProcessedImage(imageBlob) {
        this.processedImageBlob = imageBlob;
        const url = URL.createObjectURL(imageBlob);
        this.processedImage.src = url;
    }

    showResults() {
        this.resultsSection.hidden = false;
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    editFurther() {
        if (!this.processedImageBlob) return;
        
        // Create a File object from the processed image blob
        const processedFile = new File([this.processedImageBlob], 'processed_image.png', {
            type: 'image/png'
        });
        
        // Store the original image as backup
        this.originalImageFile = this.currentImageFile;
        this.originalImageBlob = this.processedImageBlob;
        
        // Set the processed image as the new current image
        this.currentImageFile = processedFile;
        
        // Update the preview to show the processed image
        this.showImagePreview(processedFile);
        
        // Clear the instructions textarea for new input
        this.customInstructions.value = '';
        this.customInstructions.focus();
        
        // Hide the results section temporarily
        this.resultsSection.hidden = true;
        
        // Show the preview section
        this.previewSection.hidden = false;
        
        // Enable the process button
        this.processButton.disabled = false;
        
        // Update status
        // Ready for further editing - no toast needed
        
        // Scroll back to the instructions area
        this.customInstructions.scrollIntoView({ behavior: 'smooth' });
    }

    async downloadImage() {
        if (!this.processedImageBlob) return;
        
        // Generate default filename
        const defaultFilename = this.currentImageFile.name.replace(/\.[^/.]+$/, '') + '_enhanced.png';
        
        // Prompt user to edit filename
        const filename = prompt('Inserisci il nome del file:', defaultFilename);
        
        // If user cancelled or entered empty string, don't download
        if (!filename || filename.trim() === '') {
            return;
        }
        
        // Ensure filename has .png extension
        const finalFilename = filename.endsWith('.png') ? filename : filename + '.png';
        
        try {
            // Create a temporary file from blob to strip any remaining metadata
            const tempFile = new File([this.processedImageBlob], finalFilename, {
                type: 'image/png',
                lastModified: Date.now()
            });
            
            // Strip metadata from processed image before download
            const cleanProcessedFile = await ImagePrivacyUtils.stripMetadata(tempFile);
            const cleanBlob = new Blob([cleanProcessedFile], { type: 'image/png' });
            
            const url = URL.createObjectURL(cleanBlob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = finalFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showStatus('Immagine migliorata scaricata con successo!', 'success');
            
        } catch (error) {
            console.error('Error stripping metadata from download:', error);
            
            // Fallback to regular download if stripping fails
            const url = URL.createObjectURL(this.processedImageBlob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = finalFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showStatus('Immagine migliorata scaricata con successo!', 'success');
        }
    }

    resetApp() {
        // Reset all state
        this.currentImageFile = null;
        this.processedImageBlob = null;
        this.originalImageFile = null;
        this.originalImageBlob = null;
        this.clearWorkflowSteps();
        
        // Reset UI
        this.imageInput.value = '';
        this.customInstructions.value = '';
        this.processButton.disabled = true;
        this.previewSection.hidden = true;
        this.resultsSection.hidden = true;
        this.progressSection.hidden = true;
        this.uploadArea.classList.remove('has-image');
        
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
    }

    setProcessingState(isProcessing) {
        this.processButton.disabled = isProcessing;
        
        if (isProcessing) {
            this.processButton.classList.add('processing');
            this.processButton.querySelector('.button-text').textContent = 'Elaborazione...';
            this.processButton.querySelector('.spinner').hidden = false;
            
            // Show progress bar
            this.showProgressBar();
        } else {
            this.processButton.classList.remove('processing');
            this.processButton.querySelector('.button-text').textContent = 'Elabora Immagine';
            this.processButton.querySelector('.spinner').hidden = true;
            
            // Hide progress bar
            this.hideProgressBar();
        }
    }

    updateProcessButtonText(text) {
        this.processButton.querySelector('.button-text').textContent = text;
    }

    showStatus(message, type = 'info') {
        this.showToast(message, type);
    }

    hideStatus() {
        // Legacy method - kept for compatibility
        // Individual toasts now handle their own dismissal
    }

    showToast(message, type = 'info', duration = null) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Set default duration based on type
        if (duration === null) {
            duration = type === 'error' ? 8000 : type === 'success' ? 5000 : 6000;
        }

        // Get icon for toast type
        const icon = this.getToastIcon(type);
        
        // Create progress bar if auto-dismiss is enabled
        const progressBar = duration > 0 ? '<div class="toast-progress"></div>' : '';
        
        // Check if message is very long and needs wrapping
        const isLongMessage = message.length > 80;
        const messageClass = isLongMessage ? 'toast-message long' : 'toast-message';
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${icon}</div>
                <div class="${messageClass}">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" aria-label="Chiudi notifica">✕</button>
            ${progressBar}
        `;

        // Handle toast stacking - limit to 3 toasts max
        const existingToasts = this.toastContainer.children;
        if (existingToasts.length >= 3) {
            // Remove oldest toast
            this.removeToast(existingToasts[0]);
        }

        // Add to container
        this.toastContainer.appendChild(toast);

        // Close button functionality
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => {
            this.removeToast(toast);
        });

        // Pause progress on hover
        if (duration > 0) {
            const progress = toast.querySelector('.toast-progress');
            let timeoutId;
            let startTime;
            let remainingTime = duration;

            const startProgress = () => {
                if (progress && remainingTime > 0) {
                    startTime = Date.now();
                    progress.style.animationDuration = `${remainingTime}ms`;
                    progress.classList.add('running');
                    
                    timeoutId = setTimeout(() => {
                        this.removeToast(toast);
                    }, remainingTime);
                }
            };

            const pauseProgress = () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    const elapsed = Date.now() - startTime;
                    remainingTime = Math.max(0, remainingTime - elapsed);
                    progress.classList.remove('running');
                }
            };

            toast.addEventListener('mouseenter', pauseProgress);
            toast.addEventListener('mouseleave', startProgress);

            // Start initial progress
            setTimeout(startProgress, 100);
        }

        // Show toast with animation and haptic feedback
        requestAnimationFrame(() => {
            toast.classList.add('show');
            // Add subtle haptic feedback for supported devices
            if ('vibrate' in navigator && type === 'error') {
                navigator.vibrate([50, 30, 50]);
            } else if ('vibrate' in navigator && type === 'success') {
                navigator.vibrate(50);
            }
        });

        return toast;
    }

    removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.add('hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300); // Match CSS transition duration
    }

    getToastIcon(type) {
        const icons = {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22,4 12,14.01 9,11.01"></polyline>
                      </svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <circle cx="12" cy="12" r="10"></circle>
                     <path d="M12,16v-4"></path>
                     <path d="M12,8h.01"></path>
                   </svg>`,
            warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>`
        };
        return icons[type] || icons.info;
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Workflow tracking methods (background only)

    // Progress bar methods
    showProgressBar() {
        this.progressSection.hidden = false;
        this.resetProgressBar();
    }
    
    hideProgressBar() {
        this.progressSection.hidden = true;
    }
    
    resetProgressBar() {
        const segments = document.querySelectorAll('.progress-bar-segment');
        segments.forEach(segment => {
            const fill = segment.querySelector('.segment-fill');
            fill.className = 'segment-fill waiting';
        });
        
        this.progressCurrentStep.textContent = 'Inizializzazione...';
        this.stepsCompleted.textContent = '0';
    }
    
    updateProgressStep(stepKey, status) {
        const stepElement = document.querySelector(`[data-step="${stepKey}"]`);
        if (!stepElement) return;
        
        const fill = stepElement.querySelector('.segment-fill');
        
        // Remove all status classes
        fill.classList.remove('waiting', 'active', 'completed', 'failed');
        
        // Add new status class
        fill.classList.add(status);
        
        // Update current step text
        const stepNames = {
            'validation': 'Validazione input...',
            'translation': 'Traduzione in corso...',
            'enhancement': 'Ottimizzazione prompt...',
            'processing': 'Elaborazione immagine...'
        };
        
        if (status === 'active') {
            this.progressCurrentStep.textContent = stepNames[stepKey] || 'Elaborazione...';
        }
        
        // Update completed count
        const completedCount = document.querySelectorAll('.segment-fill.completed').length;
        this.stepsCompleted.textContent = completedCount.toString();
        
        // If all steps completed, update final message
        if (completedCount === 4) {
            this.progressCurrentStep.textContent = 'Elaborazione completata!';
        }
    }

    clearWorkflowSteps() {
        this.workflowSteps = [];
        this.workflowLadder.innerHTML = '';
        this.processingUsedFallback = false;
        this.resetProgressBar();
    }

    addWorkflowStep(stepData) {
        const step = {
            id: this.workflowSteps.length + 1,
            title: stepData.title,
            status: stepData.status || 'in-progress',
            prompt: stepData.prompt || null,
            response: stepData.response || null,
            startTime: stepData.startTime || new Date(),
            endTime: stepData.endTime || null,
            ...stepData
        };
        
        this.workflowSteps.push(step);
        this.renderWorkflowStep(step);
        
        // Update progress bar
        this.updateProgressBarFromStep(step);
        
        return step;
    }

    updateWorkflowStep(stepId, updates) {
        const stepIndex = this.workflowSteps.findIndex(s => s.id === stepId);
        if (stepIndex !== -1) {
            this.workflowSteps[stepIndex] = { ...this.workflowSteps[stepIndex], ...updates };
            this.renderWorkflowStep(this.workflowSteps[stepIndex]);
            
            // Update progress bar
            this.updateProgressBarFromStep(this.workflowSteps[stepIndex]);
        }
    }
    
    updateProgressBarFromStep(step) {
        const mapping = this.stepMapping[step.title];
        if (!mapping) return;
        
        let progressStatus = 'waiting';
        if (step.status === 'in-progress') {
            progressStatus = 'active';
        } else if (step.status === 'completed') {
            progressStatus = 'completed';
        } else if (step.status === 'failed') {
            progressStatus = 'failed';
        }
        
        this.updateProgressStep(mapping.key, progressStatus);
    }

    renderWorkflowStep(step) {
        const existingStep = document.getElementById(`workflow-step-${step.id}`);
        if (existingStep) {
            existingStep.remove();
        }

        const stepElement = document.createElement('div');
        stepElement.id = `workflow-step-${step.id}`;
        stepElement.className = 'workflow-step';

        const statusClass = step.status === 'completed' ? 'completed' : 
                           step.status === 'failed' ? 'failed' : '';

        const timing = step.endTime ? 
            `${Math.round((step.endTime - step.startTime) / 1000 * 100) / 100}s` : 
            'In corso...';

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
                <div class="step-timing">Tempo: ${timing}</div>
            </div>
        `;

        this.workflowLadder.appendChild(stepElement);
    }

    getStatusText(status) {
        const statusMap = {
            'in-progress': 'In corso',
            'completed': 'Completato',
            'failed': 'Fallito'
        };
        return statusMap[status] || status;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initializeZoomElements() {
        // Store zoom states for each image
        this.zoomStates = {
            preview: { scale: 1, isDragging: false, startX: 0, startY: 0, translateX: 0, translateY: 0 },
            original: { scale: 1, isDragging: false, startX: 0, startY: 0, translateX: 0, translateY: 0 },
            processed: { scale: 1, isDragging: false, startX: 0, startY: 0, translateX: 0, translateY: 0 }
        };

        // Get control elements
        this.zoomElements = {
            preview: {
                controls: document.getElementById('previewZoomControls'),
                zoomIn: document.getElementById('previewZoomIn'),
                zoomOut: document.getElementById('previewZoomOut'),
                level: document.getElementById('previewZoomLevel'),
                image: this.previewImage,
                wrapper: this.previewImage?.parentElement
            },
            original: {
                controls: document.getElementById('originalZoomControls'),
                zoomIn: document.getElementById('originalZoomIn'),
                zoomOut: document.getElementById('originalZoomOut'),
                level: document.getElementById('originalZoomLevel'),
                image: this.originalImage,
                wrapper: this.originalImage?.parentElement
            },
            processed: {
                controls: document.getElementById('processedZoomControls'),
                zoomIn: document.getElementById('processedZoomIn'),
                zoomOut: document.getElementById('processedZoomOut'),
                level: document.getElementById('processedZoomLevel'),
                image: this.processedImage,
                wrapper: this.processedImage?.parentElement
            }
        };
    }

    setupZoomListeners() {
        Object.keys(this.zoomElements).forEach(key => {
            const elements = this.zoomElements[key];
            if (!elements.image || !elements.wrapper) return;

            // Zoom in button
            elements.zoomIn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.zoomImage(key, 0.25);
            });

            // Zoom out button
            elements.zoomOut.addEventListener('click', (e) => {
                e.stopPropagation();
                this.zoomImage(key, -0.25);
            });

            // Double click to reset
            elements.image.addEventListener('dblclick', (e) => {
                e.preventDefault();
                this.resetZoom(key);
            });

            // Mouse wheel zoom
            elements.wrapper.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                this.zoomImage(key, delta);
            });

            // Pan functionality
            this.setupPanListeners(key);
        });
    }

    setupPanListeners(imageKey) {
        const elements = this.zoomElements[imageKey];
        const state = this.zoomStates[imageKey];
        let rafId = null;

        const updateTransform = () => {
            this.updateImageTransform(imageKey);
            rafId = null;
        };

        elements.image.addEventListener('mousedown', (e) => {
            if (state.scale <= 1) return;
            
            e.preventDefault();
            state.isDragging = true;
            state.startX = e.clientX - state.translateX;
            state.startY = e.clientY - state.translateY;
            
            elements.image.style.cursor = 'grabbing';
            elements.wrapper.classList.add('active');
            
            // Disable transitions during dragging for smoother performance
            elements.image.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;

            state.translateX = e.clientX - state.startX;
            state.translateY = e.clientY - state.startY;
            
            // Use requestAnimationFrame to throttle updates and reduce lag
            if (!rafId) {
                rafId = requestAnimationFrame(updateTransform);
            }
        });

        document.addEventListener('mouseup', () => {
            if (state.isDragging) {
                state.isDragging = false;
                elements.image.style.cursor = state.scale > 1 ? 'grab' : 'default';
                elements.wrapper.classList.remove('active');
                
                // Re-enable transitions
                elements.image.style.transition = 'transform 0.2s ease';
                
                // Cancel any pending animation frame
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            }
        });
    }

    zoomImage(imageKey, delta) {
        const state = this.zoomStates[imageKey];
        const elements = this.zoomElements[imageKey];
        
        const newScale = Math.min(4, Math.max(0.5, state.scale + delta));
        
        if (newScale !== state.scale) {
            state.scale = newScale;
            
            // Reset pan when zooming out to 1 or less
            if (state.scale <= 1) {
                state.translateX = 0;
                state.translateY = 0;
                elements.wrapper.classList.remove('zoomed');
                elements.image.style.cursor = 'default';
            } else {
                elements.wrapper.classList.add('zoomed');
                elements.image.style.cursor = 'grab';
            }
            
            this.updateImageTransform(imageKey);
            this.updateZoomControls(imageKey);
        }
    }

    resetZoom(imageKey) {
        const state = this.zoomStates[imageKey];
        const elements = this.zoomElements[imageKey];
        
        state.scale = 1;
        state.translateX = 0;
        state.translateY = 0;
        
        elements.wrapper.classList.remove('zoomed');
        elements.image.style.cursor = 'default';
        
        this.updateImageTransform(imageKey);
        this.updateZoomControls(imageKey);
    }

    updateImageTransform(imageKey) {
        const state = this.zoomStates[imageKey];
        const elements = this.zoomElements[imageKey];
        
        const transform = `scale(${state.scale}) translate(${state.translateX / state.scale}px, ${state.translateY / state.scale}px)`;
        elements.image.style.transform = transform;
    }

    updateZoomControls(imageKey) {
        const state = this.zoomStates[imageKey];
        const elements = this.zoomElements[imageKey];
        
        // Update zoom level display
        elements.level.textContent = `${Math.round(state.scale * 100)}%`;
        
        // Update button states
        elements.zoomOut.disabled = state.scale <= 0.5;
        elements.zoomIn.disabled = state.scale >= 4;
        
        // Show/hide controls based on activity
        if (state.scale !== 1) {
            elements.controls.classList.add('active');
        } else {
            elements.controls.classList.remove('active');
        }
    }
    
    // Authentication UI Methods
    initializeAuthUI() {
        // Wait for authService to initialize, then set up auth state listener
        if (window.authService) {
            window.authService.onAuthStateChanged((user) => {
                this.onAuthStateChanged(user);
            });
        } else {
            // Retry after a short delay if authService isn't ready yet
            setTimeout(() => this.initializeAuthUI(), 100);
        }
    }
    
    onAuthStateChanged(user) {
        // This will be called by the authService when auth state changes
        // The authService already handles updating the UI, so we just need to 
        // handle any app-specific logic here if needed
        console.log('Auth state changed:', user ? 'logged in' : 'logged out');
    }
    
    async saveToHistory(instructions) {
        if (!window.authService) return;
        
        // Generate session ID
        const sessionId = this.generateSessionId();
        
        // Extract step data from existing workflowSteps
        const steps = this.workflowSteps.map(step => ({
            name: step.title,
            input: step.prompt || instructions,
            output: step.response || (step.status === 'failed' ? 'Error occurred' : 'Completed'),
            duration: step.endTime && step.startTime ? (step.endTime - step.startTime) : 0,
            status: step.status
        }));
        
        // Calculate total processing time
        const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
        
        const historyItem = {
            sessionId: sessionId,
            timestamp: new Date().toISOString(),
            
            // User view - simple data for user interface
            userView: {
                prompt: instructions,
                fileName: this.currentImageFile ? this.currentImageFile.name : 'unknown',
                result: this.processedImageBlob ? (this.processingUsedFallback ? 'simplified' : 'success') : 'failed',
                processingTime: this.formatDuration(totalDuration),
                outputFileName: this.processedImageBlob ? this.generateResultFileName() : null,
                userRating: null
            },
            
            // Debug info - step details for debugging
            steps: steps,
            totalDuration: totalDuration,
            finalResult: this.processedImageBlob ? 'success' : 'failed',
            usedFallback: this.processingUsedFallback
        };
        
        try {
            await window.authService.saveToHistory(historyItem);
        } catch (error) {
            console.error('Error saving to history:', error);
            // Don't show error to user - history saving is optional
        }
    }
    
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateResultFileName() {
        if (!this.currentImageFile) return 'processed_image.png';
        const baseName = this.currentImageFile.name.replace(/\.[^/.]+$/, '');
        return baseName + '_enhanced.png';
    }
    
    formatDuration(milliseconds) {
        if (milliseconds < 1000) return milliseconds + 'ms';
        const seconds = Math.round(milliseconds / 1000);
        if (seconds < 60) return seconds + 's';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return minutes + 'm ' + remainingSeconds + 's';
    }
    
    // Removed old authentication modal methods - now handled by AuthModalManager
    
    // User Menu Methods
    toggleUserMenu() {
        const userMenu = document.getElementById('userMenu');
        const authButton = document.getElementById('authButton');
        
        if (userMenu) {
            const isOpening = userMenu.hidden;
            userMenu.hidden = !userMenu.hidden;
            
            // Add/remove menu-open class for chevron animation
            if (authButton) {
                if (isOpening) {
                    authButton.classList.add('menu-open');
                } else {
                    authButton.classList.remove('menu-open');
                }
            }
        }
    }
    
    showAccountSettings() {
        if (window.authModalManager) {
            window.authModalManager.showAccountSettingsModal();
        }
        
        // Hide user menu
        const userMenu = document.getElementById('userMenu');
        const authButton = document.getElementById('authButton');
        if (userMenu) userMenu.hidden = true;
        if (authButton) authButton.classList.remove('menu-open');
    }
    
    async handleLogout() {
        try {
            const result = await window.authService.signOut();
            if (result.success) {
                this.showStatus('Logout effettuato', 'success');
                this.hideHistoryPanel();
                
                // Hide user menu
                const userMenu = document.getElementById('userMenu');
                const authButton = document.getElementById('authButton');
                if (userMenu) userMenu.hidden = true;
                if (authButton) authButton.classList.remove('menu-open');
            }
        } catch (error) {
            this.showStatus('Errore durante il logout', 'error');
        }
    }
    
    // History Panel Methods
    showHistoryPanel() {
        const historyPanel = document.getElementById('historyPanel');
        if (historyPanel) {
            historyPanel.hidden = false;
            historyPanel.classList.add('active');
            
            // Load history when panel is shown
            if (window.authService) {
                window.authService.loadUserHistoryUI();
            }
        }
        
        // Hide user menu
        const userMenu = document.getElementById('userMenu');
        const authButton = document.getElementById('authButton');
        if (userMenu) userMenu.hidden = true;
        if (authButton) authButton.classList.remove('menu-open');
    }
    
    hideHistoryPanel() {
        const historyPanel = document.getElementById('historyPanel');
        if (historyPanel) {
            historyPanel.hidden = true;
            historyPanel.classList.remove('active');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all scripts have loaded
    setTimeout(() => {
        window.signatureCleaner = new SignatureCleaner();
    }, 50);
});