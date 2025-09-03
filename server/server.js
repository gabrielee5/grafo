require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '15 minutes'
    }
});

const processImageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 image processing requests per minute
    message: {
        error: 'Too many image processing requests, please try again in a minute.',
        retryAfter: '1 minute'
    }
});

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] // Replace with your actual domain
        : [
            'http://localhost:3000', 
            'http://127.0.0.1:3000', 
            'http://localhost:5500',
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'http://localhost:8081',
            'http://127.0.0.1:8081',  // Added for your http-server
            'http://localhost:5173',  // Vite default
            'http://127.0.0.1:5173'
        ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use('/api/', apiLimiter);
app.use(express.json({ limit: '10mb' }));

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
        }
    }
});

// Utility function to convert file to base64
function fileToBase64(buffer, mimeType) {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV 
    });
});

// Firebase config endpoint (returns public config only)
app.get('/api/firebase-config', (req, res) => {
    const config = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
    };
    
    res.json(config);
});

// Text translation endpoint
app.post('/api/translate-text', apiLimiter, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                error: 'Text is required and must be a string',
                success: false
            });
        }

        if (text.length > 2000) {
            return res.status(400).json({
                error: 'Text too long. Maximum 2000 characters.',
                success: false
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Server configuration error',
                success: false
            });
        }

        const translationPrompt = `Translate this Italian text to English, preserving technical terminology related to handwriting analysis and graphology: "${text}"

Return only the English translation, no additional text.`;

        const geminiPayload = {
            contents: [{
                parts: [{ text: translationPrompt }]
            }],
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.3,
                topP: 1,
                topK: 32
            }
        };

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify(geminiPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error for translation:', response.status, errorText);
            return res.status(response.status).json({
                error: 'Translation service temporarily unavailable',
                success: false
            });
        }

        const geminiResponse = await response.json();

        // Debug: Log the response in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Translation Gemini Response:', JSON.stringify(geminiResponse, null, 2));
        }

        if (geminiResponse.candidates && 
            geminiResponse.candidates[0] && 
            geminiResponse.candidates[0].content && 
            geminiResponse.candidates[0].content.parts) {
            
            const textPart = geminiResponse.candidates[0].content.parts.find(part => part.text);
            if (textPart) {
                res.json({
                    success: true,
                    translatedText: textPart.text.trim()
                });
            } else {
                res.status(400).json({
                    error: 'No translation found in response',
                    success: false,
                    debug: process.env.NODE_ENV === 'development' ? geminiResponse : undefined
                });
            }
        } else {
            res.status(400).json({
                error: 'Invalid response from translation service',
                success: false,
                debug: process.env.NODE_ENV === 'development' ? geminiResponse : undefined
            });
        }

    } catch (error) {
        console.error('Error in translation:', error);
        res.status(500).json({
            error: 'Internal server error during translation',
            success: false
        });
    }
});

// Prompt enhancement endpoint
app.post('/api/enhance-prompt', apiLimiter, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                error: 'Text is required and must be a string',
                success: false
            });
        }

        if (text.length > 2000) {
            return res.status(400).json({
                error: 'Text too long. Maximum 2000 characters.',
                success: false
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Server configuration error',
                success: false
            });
        }

        const enhancementPrompt = `Enhance this image processing instruction: "${text}"

Make it more technical. Focus on image cleaning, contrast improvement, and handwriting preservation. Return only the enhanced prompt.`;

        const geminiPayload = {
            contents: [{
                parts: [{ text: enhancementPrompt }]
            }],
            generationConfig: {
                maxOutputTokens: 512,
                temperature: 0.3,
                topP: 1,
                topK: 16
            }
        };

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify(geminiPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error for enhancement:', response.status, errorText);
            return res.status(response.status).json({
                error: 'Enhancement service temporarily unavailable',
                success: false
            });
        }

        const geminiResponse = await response.json();

        // Debug: Log the response in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Enhancement Gemini Response:', JSON.stringify(geminiResponse, null, 2));
        }

        if (geminiResponse.candidates && geminiResponse.candidates[0]) {
            const candidate = geminiResponse.candidates[0];
            
            // Check for MAX_TOKENS or other finish reasons
            if (candidate.finishReason === 'MAX_TOKENS') {
                res.status(400).json({
                    error: 'Enhancement prompt too long, using original text',
                    success: false,
                    fallback: text // Return original text as fallback
                });
                return;
            }
            
            if (candidate.content && candidate.content.parts) {
                const textPart = candidate.content.parts.find(part => part.text);
                if (textPart) {
                    res.json({
                        success: true,
                        enhancedText: textPart.text.trim()
                    });
                    return;
                }
            }
            
            res.status(400).json({
                error: 'No enhancement found in response',
                success: false,
                debug: process.env.NODE_ENV === 'development' ? geminiResponse : undefined
            });
        } else {
            res.status(400).json({
                error: 'Invalid response from enhancement service',
                success: false,
                debug: process.env.NODE_ENV === 'development' ? geminiResponse : undefined
            });
        }

    } catch (error) {
        console.error('Error in enhancement:', error);
        res.status(500).json({
            error: 'Internal server error during enhancement',
            success: false
        });
    }
});

// Gemini API proxy endpoint
app.post('/api/process-image', processImageLimiter, upload.single('image'), async (req, res) => {
    try {
        // Validate required fields
        if (!req.file) {
            return res.status(400).json({
                error: 'No image file provided',
                success: false
            });
        }

        if (!req.body.instructions) {
            return res.status(400).json({
                error: 'No instructions provided',
                success: false
            });
        }

        // Validate environment variables
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not configured');
            return res.status(500).json({
                error: 'Server configuration error',
                success: false
            });
        }

        // Prepare the request to Gemini API
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        const geminiPayload = {
            contents: [{
                parts: [
                    {
                        text: req.body.instructions
                    },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image
                        }
                    }
                ]
            }],
            generationConfig: {
                maxOutputTokens: 4096,
                temperature: 0.4,
                topP: 1,
                topK: 32
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH", 
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent`;

        // Make request to Gemini API
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify(geminiPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);
            return res.status(response.status).json({
                error: 'Image processing service temporarily unavailable',
                success: false
            });
        }

        const geminiResponse = await response.json();

        // Parse the response to extract the image data (matches original format)
        if (geminiResponse.candidates && 
            geminiResponse.candidates[0] && 
            geminiResponse.candidates[0].content && 
            geminiResponse.candidates[0].content.parts) {
            
            const parts = geminiResponse.candidates[0].content.parts;
            
            // Look for image data in the response parts (like original)
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    // Found image data - return as data URL
                    const imageData = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    
                    res.json({
                        success: true,
                        imageData: `data:${mimeType};base64,${imageData}`,
                        originalFileName: req.file.originalname
                    });
                    return;
                }
            }
            
            // If no image found, look for text response with base64 data
            const textPart = parts.find(part => part.text);
            if (textPart) {
                const responseText = textPart.text;
                const base64Match = responseText.match(/data:image\/[^;]+;base64,([^"'\s]+)/);
                
                if (base64Match) {
                    res.json({
                        success: true,
                        imageData: base64Match[0],
                        originalFileName: req.file.originalname
                    });
                    return;
                }
            }
            
            res.status(400).json({
                error: 'No processed image found in response',
                success: false,
                debug: process.env.NODE_ENV === 'development' ? JSON.stringify(parts, null, 2) : undefined
            });
        } else {
            res.status(400).json({
                error: 'Invalid response from image processing service',
                success: false
            });
        }

    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({
            error: 'Internal server error during image processing',
            success: false
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File size too large. Maximum size is 10MB.',
                success: false
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Unexpected file field.',
                success: false
            });
        }
    }
    
    if (error.message === 'Invalid file type. Only JPEG, PNG and WebP are allowed.') {
        return res.status(400).json({
            error: error.message,
            success: false
        });
    }

    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        success: false
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        success: false
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Firma Pulita API server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔑 Gemini API Key configured: ${process.env.GEMINI_API_KEY ? '✅' : '❌'}`);
    console.log(`🔥 Firebase configured: ${process.env.FIREBASE_PROJECT_ID ? '✅' : '❌'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});