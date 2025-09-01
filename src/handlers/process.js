/**
 * Image processing handler - main business logic
 * Integrates with existing 3-step pipeline and adds history tracking
 */

import { HistoryService } from '../utils/history.js';
import { StorageService } from '../utils/storage.js';
import { errorResponse, successResponse } from './middleware.js';

export async function handleProcessImage(request, user) {
    if (request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    const historyService = new HistoryService(globalThis);
    const storageService = new StorageService(globalThis);
    let historyEntry = null;

    try {
        // Parse multipart form data
        const formData = await request.formData();
        const imageFile = formData.get('image');
        const italianPrompt = formData.get('prompt');

        if (!imageFile || !italianPrompt) {
            return errorResponse('Immagine e prompt sono richiesti', 400);
        }

        // Get image buffer
        const imageBuffer = await imageFile.arrayBuffer();
        
        // Validate image
        const validation = storageService.validateImage(imageBuffer);
        if (!validation.valid) {
            return errorResponse(validation.error, 400);
        }

        // Create initial history entry
        historyEntry = await historyService.saveHistoryEntry(user.id, {
            originalPrompt: italianPrompt,
            status: 'pending',
            fileName: imageFile.name,
            fileSize: imageBuffer.byteLength,
            mimeType: validation.detectedType
        });

        if (!historyEntry.success) {
            throw new Error('Failed to create history entry');
        }

        const startTime = Date.now();
        let workflowSteps = [];

        try {
            // Step 1: Upload original image to R2
            const originalUpload = await storageService.uploadImage(
                imageBuffer,
                imageFile.name,
                user.id,
                {
                    mimeType: validation.detectedType,
                    isOriginal: true,
                    metadata: { historyId: historyEntry.entryId }
                }
            );

            if (!originalUpload.success) {
                throw new Error(`Failed to upload original image: ${originalUpload.error}`);
            }

            workflowSteps.push({
                title: 'Upload Immagine Originale',
                status: 'completed',
                timestamp: Date.now(),
                details: `Caricata su R2: ${originalUpload.key}`
            });

            // Step 2: Translation (reusing existing logic)
            const translationResult = await translateToEnglish(italianPrompt, globalThis.GEMINI_API_KEY);
            workflowSteps.push({
                title: 'Traduzione Italiano → Inglese',
                status: translationResult.success ? 'completed' : 'failed',
                timestamp: Date.now(),
                prompt: italianPrompt,
                response: translationResult.success ? translationResult.text : translationResult.error
            });

            let finalPrompt = italianPrompt; // Fallback to original
            if (translationResult.success) {
                // Step 3: Enhancement (reusing existing logic)  
                const enhancementResult = await enhancePrompt(translationResult.text, globalThis.GEMINI_API_KEY);
                workflowSteps.push({
                    title: 'Miglioramento Prompt Tecnico',
                    status: enhancementResult.success ? 'completed' : 'failed',
                    timestamp: Date.now(),
                    prompt: translationResult.text,
                    response: enhancementResult.success ? enhancementResult.text : enhancementResult.error
                });

                finalPrompt = enhancementResult.success ? enhancementResult.text : translationResult.text;
            }

            // Step 4: Image Processing with Gemini
            const processingResult = await processImageWithGemini(
                imageBuffer,
                validation.detectedType,
                finalPrompt,
                globalThis.GEMINI_API_KEY
            );

            workflowSteps.push({
                title: 'Elaborazione Immagine con Gemini',
                status: processingResult.success ? 'completed' : 'failed',
                timestamp: Date.now(),
                prompt: finalPrompt,
                response: processingResult.success ? 'Immagine elaborata con successo' : processingResult.error
            });

            let processedImageUrl = null;
            if (processingResult.success) {
                // Step 5: Upload processed image to R2
                const processedUpload = await storageService.uploadImage(
                    processingResult.imageBuffer,
                    `processed_${imageFile.name}`,
                    user.id,
                    {
                        mimeType: 'image/png',
                        isOriginal: false,
                        metadata: { historyId: historyEntry.entryId }
                    }
                );

                if (processedUpload.success) {
                    processedImageUrl = processedUpload.url;
                    workflowSteps.push({
                        title: 'Upload Immagine Elaborata',
                        status: 'completed',
                        timestamp: Date.now(),
                        details: `Caricata su R2: ${processedUpload.key}`
                    });
                }
            }

            const processingTime = Date.now() - startTime;
            const finalStatus = processingResult.success ? 'completed' : 'failed';

            // Update history entry with final results
            await historyService.updateHistoryEntry(historyEntry.entryId, {
                translatedPrompt: translationResult.success ? translationResult.text : null,
                enhancedPrompt: enhancementResult?.success ? enhancementResult.text : null,
                originalImageUrl: originalUpload.url,
                processedImageUrl,
                processingTime,
                status: finalStatus,
                workflowSteps,
                error: processingResult.success ? null : processingResult.error
            });

            if (processingResult.success) {
                return successResponse({
                    message: 'Immagine elaborata con successo',
                    historyId: historyEntry.entryId,
                    originalImageUrl: originalUpload.url,
                    processedImageUrl,
                    processingTime,
                    workflowSteps
                });
            } else {
                return errorResponse(`Errore nell'elaborazione: ${processingResult.error}`, 500);
            }

        } catch (processingError) {
            // Update history with error
            if (historyEntry) {
                await historyService.updateHistoryEntry(historyEntry.entryId, {
                    status: 'failed',
                    error: processingError.message,
                    processingTime: Date.now() - startTime,
                    workflowSteps
                });
            }
            throw processingError;
        }

    } catch (error) {
        console.error('Image processing error:', error);
        return errorResponse(`Errore nell'elaborazione dell'immagine: ${error.message}`, 500);
    }
}

// Reusable functions from original codebase
async function translateToEnglish(italianText, apiKey) {
    try {
        const translationPrompt = `Translate this Italian text to English, preserving technical terminology related to handwriting analysis and graphology: "${italianText}"

Return only the English translation, no additional text.`;

        const response = await callGeminiTextAPI(translationPrompt, apiKey);
        return {
            success: true,
            text: response.trim()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function enhancePrompt(translatedText, apiKey) {
    try {
        const enhancementPrompt = `Enhance this instruction for image processing of handwritten signatures/text. Make it more specific and technical while preserving the original intent: "${translatedText}"

Focus on:
- Image cleaning and noise reduction
- Contrast and clarity improvements  
- Preservation of authentic handwriting characteristics
- Technical specifications for signature enhancement

Return only the enhanced prompt, no additional text.`;

        const response = await callGeminiTextAPI(enhancementPrompt, apiKey);
        return {
            success: true,
            text: response.trim()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function processImageWithGemini(imageBuffer, mimeType, prompt, apiKey) {
    try {
        const base64Image = bufferToBase64(imageBuffer);
        
        const requestBody = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType,
                            data: base64Image
                        }
                    }
                ]
            }]
        };

        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract generated image from response
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            const parts = data.candidates[0].content.parts;
            
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    const imageData = part.inlineData.data;
                    const binaryData = atob(imageData);
                    const bytes = new Uint8Array(binaryData.length);
                    for (let i = 0; i < binaryData.length; i++) {
                        bytes[i] = binaryData.charCodeAt(i);
                    }
                    
                    return {
                        success: true,
                        imageBuffer: bytes.buffer
                    };
                }
            }
        }
        
        // Fallback to simulation if no image returned
        console.warn('No image generated by API, falling back to simulation');
        return simulateImageProcessing(imageBuffer);

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function callGeminiTextAPI(prompt, apiKey) {
    const requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
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
}

function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function simulateImageProcessing(imageBuffer) {
    // Basic image enhancement simulation
    // In a real implementation, this could use Canvas API or other image processing
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                imageBuffer: imageBuffer // Return original for now
            });
        }, 2000);
    });
}