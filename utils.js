/**
 * Security utilities for input sanitization and validation
 */

/**
 * EXIF/Metadata Stripping Utility
 * Removes all metadata from images for privacy protection
 */
class ImagePrivacyUtils {
    /**
     * Strips all EXIF/metadata from an image file
     * @param {File} file - The image file to process
     * @returns {Promise<File>} - Clean image file without metadata
     */
    static async stripMetadata(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                try {
                    // Set canvas size to match image
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    
                    // Draw image to canvas (this strips all metadata)
                    ctx.drawImage(img, 0, 0);
                    
                    // Convert back to file
                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Create new file with same name but no metadata
                            const cleanFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            });
                            resolve(cleanFile);
                        } else {
                            reject(new Error('Failed to create clean image'));
                        }
                    }, file.type, 0.95); // High quality
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image for metadata stripping'));
            };
            
            // Load image
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Checks if a file contains potentially sensitive metadata
     * @param {File} file - The image file to check
     * @returns {Promise<Object>} - Metadata analysis result
     */
    static async analyzeMetadata(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                const view = new DataView(arrayBuffer);
                
                let hasExif = false;
                let hasGPS = false;
                let estimatedMetadataSize = 0;
                
                try {
                    // Check for EXIF marker (0xFFE1)
                    for (let i = 0; i < Math.min(arrayBuffer.byteLength - 4, 65536); i++) {
                        if (view.getUint16(i, false) === 0xFFE1) {
                            hasExif = true;
                            const segmentLength = view.getUint16(i + 2, false);
                            estimatedMetadataSize += segmentLength;
                            
                            // Check for GPS data within EXIF
                            const segment = new Uint8Array(arrayBuffer.slice(i, i + segmentLength));
                            const segmentStr = String.fromCharCode.apply(null, segment);
                            if (segmentStr.includes('GPS')) {
                                hasGPS = true;
                            }
                        }
                    }
                } catch (error) {
                    console.warn('Error analyzing metadata:', error);
                }
                
                resolve({
                    hasMetadata: hasExif,
                    hasGPS: hasGPS,
                    originalSize: file.size,
                    estimatedMetadataSize: estimatedMetadataSize,
                    format: file.type
                });
            };
            
            reader.onerror = () => {
                resolve({
                    hasMetadata: false,
                    hasGPS: false,
                    originalSize: file.size,
                    estimatedMetadataSize: 0,
                    format: file.type
                });
            };
            
            // Only read first 64KB to check for metadata
            const chunk = file.slice(0, 65536);
            reader.readAsArrayBuffer(chunk);
        });
    }

    /**
     * Formats metadata analysis for user display
     * @param {Object} analysis - Result from analyzeMetadata
     * @returns {string} - User-friendly description
     */
    static formatPrivacyReport(analysis) {
        if (!analysis.hasMetadata) {
            return "✅ Nessun metadato rilevato";
        }
        
        let report = "🔒 Metadati rimossi per privacy";
        if (analysis.hasGPS) {
            report += " (inclusi dati GPS)";
        }
        
        if (analysis.estimatedMetadataSize > 0) {
            const sizeSaved = (analysis.estimatedMetadataSize / 1024).toFixed(1);
            report += ` • ${sizeSaved}KB risparmiati`;
        }
        
        return report;
    }
}

class SecurityUtils {
    /**
     * Escapes HTML special characters to prevent XSS attacks
     * @param {string} text - The text to escape
     * @returns {string} - The escaped text
     */
    static escapeHtml(text) {
        if (typeof text !== 'string') {
            return '';
        }
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Sanitizes user input by removing potentially dangerous content
     * @param {string} input - The input to sanitize
     * @param {Object} options - Sanitization options
     * @returns {string} - The sanitized input
     */
    static sanitizeInput(input, options = {}) {
        if (typeof input !== 'string') {
            return '';
        }

        const {
            maxLength = 1000,
            allowNewlines = true,
            trimWhitespace = true
        } = options;

        let sanitized = input;

        // Trim whitespace if requested
        if (trimWhitespace) {
            sanitized = sanitized.trim();
        }

        // Limit length
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength) + '...';
        }

        // Handle newlines
        if (!allowNewlines) {
            sanitized = sanitized.replace(/\n/g, ' ');
        }

        // Escape HTML
        sanitized = this.escapeHtml(sanitized);

        return sanitized;
    }

    /**
     * Creates a safe text node for DOM insertion
     * @param {string} text - The text to create a node for
     * @returns {Text} - A text node with the safe content
     */
    static createTextNode(text) {
        return document.createTextNode(this.sanitizeInput(text));
    }

    /**
     * Safely sets text content of an element
     * @param {HTMLElement} element - The element to set text for
     * @param {string} text - The text to set
     * @param {Object} options - Sanitization options
     */
    static safeSetTextContent(element, text, options = {}) {
        if (!element || typeof element.textContent !== 'string') {
            console.error('Invalid element provided to safeSetTextContent');
            return;
        }
        
        element.textContent = this.sanitizeInput(text, options);
    }

    /**
     * Safely sets innerHTML with sanitized content
     * @param {HTMLElement} element - The element to set HTML for
     * @param {string} html - The HTML content (will be sanitized)
     * @param {Object} options - Sanitization options
     */
    static safeSetInnerHTML(element, html, options = {}) {
        if (!element) {
            console.error('Invalid element provided to safeSetInnerHTML');
            return;
        }

        // For safety, we'll only allow text content and basic formatting
        const sanitized = this.sanitizeInput(html, options);
        
        // Convert newlines to <br> tags if allowed
        const formatted = options.allowNewlines 
            ? sanitized.replace(/\n/g, '<br>')
            : sanitized;
            
        element.innerHTML = formatted;
    }

    /**
     * Validates email format
     * @param {string} email - Email to validate
     * @returns {boolean} - Whether the email is valid
     */
    static isValidEmail(email) {
        if (typeof email !== 'string') return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254; // RFC compliant max length
    }

    /**
     * Validates password strength
     * @param {string} password - Password to validate
     * @returns {Object} - Validation result with isValid and messages
     */
    static validatePassword(password) {
        const result = {
            isValid: false,
            messages: []
        };

        if (typeof password !== 'string') {
            result.messages.push('Password must be a string');
            return result;
        }

        if (password.length < 6) {
            result.messages.push('Password must be at least 6 characters long');
        }

        if (password.length > 128) {
            result.messages.push('Password must be less than 128 characters');
        }

        // Check for common weak passwords
        const weakPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123', 'password123'];
        if (weakPasswords.includes(password.toLowerCase())) {
            result.messages.push('Password is too common and weak');
        }

        result.isValid = result.messages.length === 0;
        return result;
    }

    /**
     * Generates a safe random string for IDs
     * @param {number} length - Length of the string
     * @returns {string} - Random string
     */
    static generateSafeId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

    /**
     * Rate limiter for preventing abuse
     */
    static createRateLimiter(maxAttempts = 5, windowMs = 900000) {
        const attempts = new Map();
        
        return {
            canProceed(identifier) {
                const now = Date.now();
                const userAttempts = attempts.get(identifier) || [];
                const recentAttempts = userAttempts.filter(time => now - time < windowMs);
                
                if (recentAttempts.length >= maxAttempts) {
                    return false;
                }
                
                recentAttempts.push(now);
                attempts.set(identifier, recentAttempts);
                return true;
            },
            
            getRemainingTime(identifier) {
                const userAttempts = attempts.get(identifier) || [];
                if (userAttempts.length === 0) return 0;
                
                const oldestAttempt = Math.min(...userAttempts);
                const remainingTime = windowMs - (Date.now() - oldestAttempt);
                return Math.max(0, remainingTime);
            }
        };
    }
}

// Make SecurityUtils available globally
window.SecurityUtils = SecurityUtils;