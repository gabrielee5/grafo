/**
 * History management handlers for user processing records
 */

import { HistoryService } from '../utils/history.js';
import { errorResponse, successResponse } from './middleware.js';

export async function handleHistory(request, user) {
    try {
        const historyService = new HistoryService(globalThis);
        const url = new URL(request.url);
        
        if (request.method === 'GET') {
            // Get user's history with optional query parameters
            const limit = parseInt(url.searchParams.get('limit')) || 20;
            const offset = parseInt(url.searchParams.get('offset')) || 0;
            const status = url.searchParams.get('status');
            const sortOrder = url.searchParams.get('sort') || 'desc';

            const result = await historyService.getUserHistory(user.id, {
                limit,
                offset,
                status,
                sortOrder
            });

            if (result.success) {
                return successResponse({
                    entries: result.entries,
                    totalCount: result.totalCount,
                    hasMore: result.hasMore,
                    pagination: {
                        limit,
                        offset,
                        currentCount: result.entries.length
                    }
                });
            } else {
                return errorResponse(result.error, 500);
            }

        } else if (request.method === 'DELETE') {
            // Clear all history for user
            // This would require additional implementation
            return errorResponse('Not implemented yet', 501);

        } else {
            return errorResponse('Method not allowed', 405);
        }

    } catch (error) {
        console.error('History handler error:', error);
        return errorResponse('Internal server error', 500);
    }
}

export async function handleHistoryItem(request, user, historyId) {
    try {
        const historyService = new HistoryService(globalThis);
        
        if (request.method === 'GET') {
            // Get specific history entry
            const result = await historyService.getHistoryEntry(historyId, user.id);
            
            if (result.success) {
                return successResponse({
                    entry: result.entry
                });
            } else {
                const status = result.error.includes('not found') ? 404 : 
                              result.error.includes('Access denied') ? 403 : 500;
                return errorResponse(result.error, status);
            }

        } else if (request.method === 'DELETE') {
            // Delete specific history entry
            const result = await historyService.deleteHistoryEntry(historyId, user.id);
            
            if (result.success) {
                return successResponse({
                    message: result.message
                });
            } else {
                const status = result.error.includes('not found') ? 404 : 
                              result.error.includes('Access denied') ? 403 : 500;
                return errorResponse(result.error, status);
            }

        } else if (request.method === 'PUT') {
            // Update history entry (limited updates allowed)
            try {
                const body = await request.json();
                
                // Only allow updating certain fields
                const allowedUpdates = {};
                if (body.metadata) allowedUpdates.metadata = body.metadata;
                
                const result = await historyService.updateHistoryEntry(historyId, allowedUpdates);
                
                if (result.success) {
                    return successResponse({
                        message: 'Entry aggiornato con successo',
                        entry: result.entry
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

    } catch (error) {
        console.error('History item handler error:', error);
        return errorResponse('Internal server error', 500);
    }
}

export async function handleHistoryStats(request, user) {
    try {
        if (request.method !== 'GET') {
            return errorResponse('Method not allowed', 405);
        }

        const historyService = new HistoryService(globalThis);
        const result = await historyService.getHistoryStats(user.id);
        
        if (result.success) {
            return successResponse({
                stats: result.stats
            });
        } else {
            return errorResponse(result.error, 500);
        }

    } catch (error) {
        console.error('History stats handler error:', error);
        return errorResponse('Internal server error', 500);
    }
}

export async function handleHistoryExport(request, user) {
    try {
        if (request.method !== 'GET') {
            return errorResponse('Method not allowed', 405);
        }

        const historyService = new HistoryService(globalThis);
        const result = await historyService.exportUserHistory(user.id);
        
        if (result.success) {
            const fileName = `signature_history_${user.id}_${new Date().toISOString().split('T')[0]}.json`;
            
            return new Response(JSON.stringify(result.data, null, 2), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="${fileName}"`,
                    'Access-Control-Allow-Origin': '*'
                }
            });
        } else {
            return errorResponse(result.error, 500);
        }

    } catch (error) {
        console.error('History export handler error:', error);
        return errorResponse('Internal server error', 500);
    }
}