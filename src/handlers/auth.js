/**
 * Authentication handler for login and registration endpoints
 */

import { AuthService } from '../auth/auth.js';
import { jsonResponse, errorResponse, successResponse } from './middleware.js';

export async function handleAuth(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    try {
        const authService = new AuthService(globalThis);
        
        switch (path) {
            case '/auth/register':
                return await handleRegister(request, authService);
            case '/auth/login':
                return await handleLogin(request, authService);
            case '/auth/logout':
                return await handleLogout(request);
            case '/auth/verify':
                return await handleVerifyToken(request, authService);
            case '/auth/profile':
                return await handleProfile(request, authService);
            default:
                return errorResponse('Auth endpoint not found', 404);
        }
    } catch (error) {
        console.error('Auth handler error:', error);
        return errorResponse('Internal server error', 500);
    }
}

async function handleRegister(request, authService) {
    if (request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        const body = await request.json();
        const { email, password, name } = body;

        const result = await authService.register(email, password, name);
        
        if (result.success) {
            return successResponse({
                message: 'Registrazione completata con successo',
                user: result.user,
                token: result.token
            }, 201);
        } else {
            return errorResponse(result.error, 400);
        }
    } catch (error) {
        return errorResponse('Invalid request body', 400);
    }
}

async function handleLogin(request, authService) {
    if (request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        const body = await request.json();
        const { email, password } = body;

        const result = await authService.login(email, password);
        
        if (result.success) {
            return successResponse({
                message: 'Login effettuato con successo',
                user: result.user,
                token: result.token
            });
        } else {
            return errorResponse(result.error, 401);
        }
    } catch (error) {
        return errorResponse('Invalid request body', 400);
    }
}

async function handleLogout(request) {
    if (request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    // For JWT tokens, logout is typically handled client-side
    // by removing the token from storage
    return successResponse({
        message: 'Logout effettuato con successo'
    });
}

async function handleVerifyToken(request, authService) {
    if (request.method !== 'GET') {
        return errorResponse('Method not allowed', 405);
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return errorResponse('Token mancante', 401);
    }

    const result = await authService.verifyToken(authHeader);
    
    if (result.success) {
        return successResponse({
            message: 'Token valido',
            user: result.user
        });
    } else {
        return errorResponse(result.error, 401);
    }
}

async function handleProfile(request, authService) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return errorResponse('Token mancante', 401);
    }

    const tokenResult = await authService.verifyToken(authHeader);
    if (!tokenResult.success) {
        return errorResponse(tokenResult.error, 401);
    }

    const userId = tokenResult.user.id;

    if (request.method === 'GET') {
        // Get profile
        const result = await authService.getUserProfile(userId);
        
        if (result.success) {
            return successResponse({
                user: result.user
            });
        } else {
            return errorResponse(result.error, 400);
        }

    } else if (request.method === 'PUT') {
        // Update profile
        try {
            const body = await request.json();
            const result = await authService.updateProfile(userId, body);
            
            if (result.success) {
                return successResponse({
                    message: 'Profilo aggiornato con successo',
                    user: result.user
                });
            } else {
                return errorResponse(result.error, 400);
            }
        } catch (error) {
            return errorResponse('Invalid request body', 400);
        }

    } else {
        return errorResponse('Method not allowed', 405);
    }
}