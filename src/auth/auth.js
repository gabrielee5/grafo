/**
 * Authentication system for Signature Cleaner
 * Supports user registration, login, and session management
 */

import { createJWT, verifyJWT } from './jwt.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { generateUUID } from '../utils/uuid.js';

export class AuthService {
    constructor(env) {
        this.kv = env.KV;
        this.jwtSecret = env.JWT_SECRET;
    }

    async register(email, password, name = null) {
        try {
            // Validate input
            if (!email || !password) {
                throw new Error('Email e password sono richiesti');
            }

            if (!this.isValidEmail(email)) {
                throw new Error('Formato email non valido');
            }

            if (password.length < 8) {
                throw new Error('La password deve essere di almeno 8 caratteri');
            }

            // Check if user already exists
            const existingUser = await this.kv.get(`user-email:${email.toLowerCase()}`);
            if (existingUser) {
                throw new Error('Un utente con questa email esiste già');
            }

            // Create new user
            const userId = generateUUID();
            const hashedPassword = await hashPassword(password);
            
            const user = {
                id: userId,
                email: email.toLowerCase(),
                name: name || email.split('@')[0],
                hashedPassword,
                createdAt: Date.now(),
                lastLogin: null,
                isActive: true
            };

            // Save user data
            await Promise.all([
                this.kv.put(`user:${userId}`, JSON.stringify(user)),
                this.kv.put(`user-email:${email.toLowerCase()}`, userId),
                this.kv.put(`user-history:${userId}`, JSON.stringify([]))
            ]);

            // Generate JWT token
            const token = await createJWT(
                { userId, email: user.email, name: user.name },
                this.jwtSecret,
                '7d'
            );

            return {
                success: true,
                user: {
                    id: userId,
                    email: user.email,
                    name: user.name,
                    createdAt: user.createdAt
                },
                token
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async login(email, password) {
        try {
            // Validate input
            if (!email || !password) {
                throw new Error('Email e password sono richiesti');
            }

            // Find user by email
            const userId = await this.kv.get(`user-email:${email.toLowerCase()}`);
            if (!userId) {
                throw new Error('Credenziali non valide');
            }

            const userData = await this.kv.get(`user:${userId}`, 'json');
            if (!userData || !userData.isActive) {
                throw new Error('Credenziali non valide');
            }

            // Verify password
            const isValidPassword = await verifyPassword(password, userData.hashedPassword);
            if (!isValidPassword) {
                throw new Error('Credenziali non valide');
            }

            // Update last login
            userData.lastLogin = Date.now();
            await this.kv.put(`user:${userId}`, JSON.stringify(userData));

            // Generate JWT token
            const token = await createJWT(
                { 
                    userId: userData.id, 
                    email: userData.email, 
                    name: userData.name 
                },
                this.jwtSecret,
                '7d'
            );

            return {
                success: true,
                user: {
                    id: userData.id,
                    email: userData.email,
                    name: userData.name,
                    lastLogin: userData.lastLogin
                },
                token
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async verifyToken(token) {
        try {
            if (!token) {
                throw new Error('Token mancante');
            }

            // Remove "Bearer " prefix if present
            const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
            
            const payload = await verifyJWT(cleanToken, this.jwtSecret);
            
            // Verify user still exists and is active
            const userData = await this.kv.get(`user:${payload.userId}`, 'json');
            if (!userData || !userData.isActive) {
                throw new Error('Utente non valido');
            }

            return {
                success: true,
                user: {
                    id: userData.id,
                    email: userData.email,
                    name: userData.name
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getUserProfile(userId) {
        try {
            const userData = await this.kv.get(`user:${userId}`, 'json');
            if (!userData) {
                throw new Error('Utente non trovato');
            }

            return {
                success: true,
                user: {
                    id: userData.id,
                    email: userData.email,
                    name: userData.name,
                    createdAt: userData.createdAt,
                    lastLogin: userData.lastLogin
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateProfile(userId, updates) {
        try {
            const userData = await this.kv.get(`user:${userId}`, 'json');
            if (!userData) {
                throw new Error('Utente non trovato');
            }

            // Only allow certain fields to be updated
            const allowedFields = ['name'];
            const filteredUpdates = {};
            
            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    filteredUpdates[field] = updates[field];
                }
            }

            const updatedUser = { ...userData, ...filteredUpdates };
            await this.kv.put(`user:${userId}`, JSON.stringify(updatedUser));

            return {
                success: true,
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

export async function authenticateRequest(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return null;
    }

    const authService = new AuthService(env);
    const result = await authService.verifyToken(authHeader);
    
    return result.success ? result.user : null;
}