/**
 * Middleware functions for authentication and CORS
 */

import { AuthService } from '../auth/auth.js';

/**
 * Authenticate incoming requests
 */
export async function authenticateRequest(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return null;
    }

    try {
        const authService = new AuthService(globalThis);
        const result = await authService.verifyToken(authHeader);
        return result.success ? result.user : null;
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

/**
 * Setup CORS headers for cross-origin requests
 */
export function setupCORS(request) {
    const origin = request.headers.get('Origin');
    const method = request.method;

    // Handle preflight requests
    if (method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    return null; // Continue with normal request processing
}

/**
 * Add CORS headers to response
 */
export function addCORSHeaders(response) {
    const newResponse = new Response(response.body, response);
    
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return newResponse;
}

/**
 * Create JSON response with CORS headers
 */
export function jsonResponse(data, options = {}) {
    const { status = 200, headers = {} } = options;
    
    const response = new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            ...headers
        }
    });
    
    return response;
}

/**
 * Error response helper
 */
export function errorResponse(message, status = 400) {
    return jsonResponse({ 
        success: false, 
        error: message 
    }, { status });
}

/**
 * Success response helper
 */
export function successResponse(data, status = 200) {
    return jsonResponse({ 
        success: true, 
        ...data 
    }, { status });
}