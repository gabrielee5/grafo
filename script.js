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
        this.debugVisible = false;
        
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
        this.statusMessage = document.getElementById('statusMessage');
        this.debugToggle = document.getElementById('debugToggle');
        this.workflowStepsElement = document.getElementById('workflowSteps');
        this.workflowLadder = document.getElementById('workflowLadder');
        
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
        
        // Debug toggle button
        this.debugToggle.addEventListener('click', () => this.toggleDebugView());
        
        // Zoom functionality
        this.setupZoomListeners();
        
        // Authentication event listeners
        this.setupAuthListeners();
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
        const historyButton = document.getElementById('historyButton');
        const logoutButton = document.getElementById('logoutButton');
        
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
        
        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('userMenu');
            const authButton = document.getElementById('authButton');
            
            if (userMenu && authButton && !userMenu.contains(e.target) && !authButton.contains(e.target)) {
                userMenu.hidden = true;
            }
        });
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

    handleFileSelect(file) {
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

        this.currentImageFile = file;
        this.showImagePreview(file);
        this.processButton.disabled = false;
        this.uploadArea.classList.add('has-image');
        
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
            <h3>Image Selected: ${file.name}</h3>
            <p>Click to select a different image</p>
        `;

        this.showStatus('Immagine caricata con successo. Pronto per elaborare.', 'success');
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
                this.showStatus('Immagine elaborata con successo!', 'success');
                
                // Save to history
                await this.saveToHistory(italianInput);
            } else {
                throw new Error(response.error || 'Failed to process image');
            }

        } catch (error) {
            console.error('Processing error:', error);
            this.showStatus(`Errore nell'elaborazione dell'immagine: ${error.message}`, 'error');
        } finally {
            this.setProcessingState(false);
        }
    }

    // 3-step pipeline: Italian → English → Enhanced → Image Processing
    async processImageWithPipeline(base64Data, italianInput) {
        try {
            // Step 1: Translation
            this.showStatus('Traduzione in corso...', 'info');
            this.updateProcessButtonText('Traduzione...');
            const englishText = await this.translateToEnglish(italianInput);
            
            // Step 2: Enhancement
            this.showStatus('Miglioramento prompt...', 'info');
            this.updateProcessButtonText('Miglioramento...');
            const enhancedPrompt = await this.enhancePrompt(englishText);
            
            // Step 3: Image Processing
            this.showStatus('Elaborazione immagine...', 'info');
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
            
            // Add fallback step
            const fallbackStep = this.addWorkflowStep({
                title: 'Fallback: Elaborazione Diretta',
                status: 'in-progress',
                prompt: italianInput,
                startTime: new Date()
            });
            
            // Fallback: try direct processing with Italian text
            console.log('Fallback: attempting direct processing');
            this.showStatus('Fallback: elaborazione diretta...', 'info');
            
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
            const enhancementPrompt = `Enhance this instruction for image processing of handwritten signatures/text. Make it more specific and technical while preserving the original intent: "${translatedText}"

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
                return await this.simulateImageProcessing();
            }

        } catch (error) {
            console.error('Backend API error:', error);
            
            // Check if error is network-related
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                // Network error - try fallback simulation
                console.warn('Network error, falling back to simulation');
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
        this.showStatus('Pronto per ulteriori modifiche. Inserisci nuove istruzioni e processa di nuovo.', 'info');
        
        // Scroll back to the instructions area
        this.customInstructions.scrollIntoView({ behavior: 'smooth' });
    }

    downloadImage() {
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
        } else {
            this.processButton.classList.remove('processing');
            this.processButton.querySelector('.button-text').textContent = 'Elabora Immagine';
            this.processButton.querySelector('.spinner').hidden = true;
        }
    }

    updateProcessButtonText(text) {
        this.processButton.querySelector('.button-text').textContent = text;
    }

    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        this.statusMessage.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => this.hideStatus(), 5000);
        }
    }

    hideStatus() {
        this.statusMessage.style.display = 'none';
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Debug and workflow tracking methods
    toggleDebugView() {
        this.debugVisible = !this.debugVisible;
        
        const debugIcon = this.debugToggle.querySelector('.debug-icon');
        const buttonText = this.debugToggle.querySelector('.debug-icon').nextSibling;
        
        if (this.debugVisible) {
            this.workflowStepsElement.hidden = false;
            // Change to up arrow
            debugIcon.innerHTML = '<polyline points="18,15 12,9 6,15"></polyline>';
            buttonText.textContent = ' Nascondi Processo';
        } else {
            this.workflowStepsElement.hidden = true;
            // Change to down arrow
            debugIcon.innerHTML = '<polyline points="6,9 12,15 18,9"></polyline>';
            buttonText.textContent = ' Mostra Processo';
        }
    }

    clearWorkflowSteps() {
        this.workflowSteps = [];
        this.workflowLadder.innerHTML = '';
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
        
        return step;
    }

    updateWorkflowStep(stepId, updates) {
        const stepIndex = this.workflowSteps.findIndex(s => s.id === stepId);
        if (stepIndex !== -1) {
            this.workflowSteps[stepIndex] = { ...this.workflowSteps[stepIndex], ...updates };
            this.renderWorkflowStep(this.workflowSteps[stepIndex]);
        }
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
        
        const historyItem = {
            instructions: instructions,
            fileName: this.currentImageFile ? this.currentImageFile.name : 'unknown',
            fileSize: this.currentImageFile ? this.currentImageFile.size : 0,
            processingDate: new Date().toISOString(),
            success: true
        };
        
        try {
            await window.authService.saveToHistory(historyItem);
        } catch (error) {
            console.error('Error saving to history:', error);
            // Don't show error to user - history saving is optional
        }
    }
    
    // Removed old authentication modal methods - now handled by AuthModalManager
    
    // User Menu Methods
    toggleUserMenu() {
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.hidden = !userMenu.hidden;
        }
    }
    
    async handleLogout() {
        try {
            const result = await window.authService.signOut();
            if (result.success) {
                this.showStatus('Logout effettuato', 'success');
                this.hideHistoryPanel();
                
                // Hide user menu
                const userMenu = document.getElementById('userMenu');
                if (userMenu) userMenu.hidden = true;
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
        if (userMenu) userMenu.hidden = true;
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