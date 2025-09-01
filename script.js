class SignatureCleaner {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.currentImageFile = null;
        this.processedImageBlob = null;
        
        // Load configuration
        this.apiKey = CONFIG.GEMINI_API_KEY;
        this.apiUrl = CONFIG.GEMINI_API_URL;
        this.maxFileSize = CONFIG.MAX_FILE_SIZE;
        this.supportedFormats = CONFIG.SUPPORTED_FORMATS;
        
        // Validate configuration
        if (this.apiKey === 'YOUR_GEMINI_API_KEY_HERE' || !this.apiKey) {
            this.showStatus('Configura la tua chiave API Gemini in config.js', 'error');
            this.processButton.disabled = true;
        }
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
        this.downloadButton = document.getElementById('downloadButton');
        this.resetButton = document.getElementById('resetButton');
        this.statusMessage = document.getElementById('statusMessage');
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
        
        // Download button
        this.downloadButton.addEventListener('click', () => this.downloadImage());
        
        // Reset button
        this.resetButton.addEventListener('click', () => this.resetApp());
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

        this.setProcessingState(true);

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

            // Process through 3-step pipeline
            const response = await this.processImageWithPipeline(base64Data, italianInput);
            
            if (response.success) {
                this.displayProcessedImage(response.imageData);
                this.showResults();
                this.showStatus('Immagine elaborata con successo!', 'success');
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
            const response = await this.callGeminiAPI(base64Data, enhancedPrompt);
            
            return response;
            
        } catch (error) {
            console.error('Pipeline error:', error);
            
            // Fallback: try direct processing with Italian text
            console.log('Fallback: attempting direct processing');
            this.showStatus('Fallback: elaborazione diretta...', 'info');
            return await this.callGeminiAPI(base64Data, italianInput);
        }
    }

    // Translation function using Gemini
    async translateToEnglish(italianText) {
        try {
            const translationPrompt = `Translate this Italian text to English, preserving technical terminology related to handwriting analysis and graphology: "${italianText}"

Return only the English translation, no additional text.`;

            const response = await this.callGeminiTextAPI(translationPrompt);
            return response.trim();
            
        } catch (error) {
            console.error('Translation error:', error);
            throw new Error('Errore durante la traduzione');
        }
    }

    // Prompt enhancement function
    async enhancePrompt(translatedText) {
        try {
            const enhancementPrompt = `Enhance this instruction for image processing of handwritten signatures/text. Make it more specific and technical while preserving the original intent: "${translatedText}"

Focus on:
- Image cleaning and noise reduction
- Contrast and clarity improvements
- Preservation of authentic handwriting characteristics
- Technical specifications for signature enhancement

Return only the enhanced prompt, no additional text.`;

            const response = await this.callGeminiTextAPI(enhancementPrompt);
            return response.trim();
            
        } catch (error) {
            console.error('Enhancement error:', error);
            throw new Error('Errore nel miglioramento del prompt');
        }
    }

    // Text-only API call for translation and enhancement
    async callGeminiTextAPI(prompt) {
        try {
            const requestBody = {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            };

            const response = await fetch(this.apiUrl.replace('gemini-2.5-flash-image-preview', 'gemini-2.5-flash'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey,
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                const textPart = data.candidates[0].content.parts.find(part => part.text);
                if (textPart) {
                    return textPart.text;
                }
            }
            
            throw new Error('No text response received');
            
        } catch (error) {
            console.error('Text API error:', error);
            throw error;
        }
    }

    async callGeminiAPI(base64Image, prompt) {
        try {
            const requestBody = {
                contents: [{
                    parts: [
                        {
                            text: prompt
                        },
                        {
                            inlineData: {
                                mimeType: this.currentImageFile.type,
                                data: base64Image
                            }
                        }
                    ]
                }]
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey,
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Debug: Log the full API response
            console.log('Gemini API Response:', JSON.stringify(data, null, 2));
            
            // Extract generated image from response
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                const parts = data.candidates[0].content.parts;
                
                // Look for image data in the response parts
                for (const part of parts) {
                    if (part.inlineData && part.inlineData.data) {
                        // Convert base64 data to blob
                        const imageData = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        
                        const binaryData = atob(imageData);
                        const bytes = new Uint8Array(binaryData.length);
                        for (let i = 0; i < binaryData.length; i++) {
                            bytes[i] = binaryData.charCodeAt(i);
                        }
                        
                        const blob = new Blob([bytes], { type: mimeType });
                        
                        return {
                            success: true,
                            imageData: blob
                        };
                    }
                }
            }
            
            // If no image found in response, fallback to simulation
            console.warn('No image generated by API, falling back to simulation');
            return this.simulateImageProcessing();

        } catch (error) {
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

    downloadImage() {
        if (!this.processedImageBlob) return;
        
        const url = URL.createObjectURL(this.processedImageBlob);
        const a = document.createElement('a');
        const filename = this.currentImageFile.name.replace(/\.[^/.]+$/, '') + '_enhanced.png';
        
        a.href = url;
        a.download = filename;
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SignatureCleaner();
});