/**
 * History management for user processing records
 * Handles storing, retrieving, and organizing user history data in KV store
 */

import { generateUUID } from './uuid.js';

export class HistoryService {
    constructor(env) {
        this.kv = env.KV;
        this.r2 = env.R2;
    }

    /**
     * Save a new history entry for a user
     */
    async saveHistoryEntry(userId, entry) {
        try {
            const entryId = generateUUID();
            const timestamp = Date.now();
            
            const historyEntry = {
                id: entryId,
                userId,
                timestamp,
                originalPrompt: entry.originalPrompt,
                translatedPrompt: entry.translatedPrompt || null,
                enhancedPrompt: entry.enhancedPrompt || null,
                originalImageUrl: entry.originalImageUrl || null,
                processedImageUrl: entry.processedImageUrl || null,
                processingTime: entry.processingTime || 0,
                status: entry.status || 'pending',
                error: entry.error || null,
                workflowSteps: entry.workflowSteps || [],
                metadata: {
                    fileSize: entry.fileSize || null,
                    fileName: entry.fileName || null,
                    mimeType: entry.mimeType || null,
                    ...entry.metadata
                }
            };

            // Save individual entry
            const entryKey = `history-entry:${entryId}`;
            await this.kv.put(entryKey, JSON.stringify(historyEntry));

            // Update user's history list
            await this.addToUserHistory(userId, entryId);

            return {
                success: true,
                entryId,
                entry: historyEntry
            };

        } catch (error) {
            console.error('Error saving history entry:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update an existing history entry
     */
    async updateHistoryEntry(entryId, updates) {
        try {
            const entryKey = `history-entry:${entryId}`;
            const existingEntry = await this.kv.get(entryKey, 'json');
            
            if (!existingEntry) {
                throw new Error('History entry not found');
            }

            const updatedEntry = {
                ...existingEntry,
                ...updates,
                updatedAt: Date.now()
            };

            await this.kv.put(entryKey, JSON.stringify(updatedEntry));

            return {
                success: true,
                entry: updatedEntry
            };

        } catch (error) {
            console.error('Error updating history entry:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get user's processing history
     */
    async getUserHistory(userId, options = {}) {
        try {
            const { 
                limit = 20, 
                offset = 0, 
                status = null,
                sortOrder = 'desc' 
            } = options;

            const userHistoryKey = `user-history:${userId}`;
            const historyIds = await this.kv.get(userHistoryKey, 'json') || [];

            // Apply offset and limit
            const slicedIds = historyIds.slice(offset, offset + limit);

            // Fetch entries in parallel
            const entries = await Promise.all(
                slicedIds.map(async id => {
                    try {
                        const entry = await this.kv.get(`history-entry:${id}`, 'json');
                        return entry;
                    } catch (error) {
                        console.error(`Error fetching entry ${id}:`, error);
                        return null;
                    }
                })
            );

            // Filter out null entries and apply status filter
            let filteredEntries = entries.filter(entry => entry !== null);
            
            if (status) {
                filteredEntries = filteredEntries.filter(entry => entry.status === status);
            }

            // Sort by timestamp
            filteredEntries.sort((a, b) => {
                return sortOrder === 'desc' 
                    ? b.timestamp - a.timestamp
                    : a.timestamp - b.timestamp;
            });

            return {
                success: true,
                entries: filteredEntries,
                totalCount: historyIds.length,
                hasMore: offset + limit < historyIds.length
            };

        } catch (error) {
            console.error('Error fetching user history:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get a specific history entry by ID
     */
    async getHistoryEntry(entryId, userId = null) {
        try {
            const entryKey = `history-entry:${entryId}`;
            const entry = await this.kv.get(entryKey, 'json');

            if (!entry) {
                throw new Error('History entry not found');
            }

            // Verify ownership if userId provided
            if (userId && entry.userId !== userId) {
                throw new Error('Access denied');
            }

            return {
                success: true,
                entry
            };

        } catch (error) {
            console.error('Error fetching history entry:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete a history entry
     */
    async deleteHistoryEntry(entryId, userId) {
        try {
            const entryKey = `history-entry:${entryId}`;
            const entry = await this.kv.get(entryKey, 'json');

            if (!entry) {
                throw new Error('History entry not found');
            }

            // Verify ownership
            if (entry.userId !== userId) {
                throw new Error('Access denied');
            }

            // Delete entry
            await this.kv.delete(entryKey);

            // Remove from user's history list
            await this.removeFromUserHistory(userId, entryId);

            // Clean up associated images from R2
            if (entry.originalImageUrl || entry.processedImageUrl) {
                await this.cleanupImages([entry.originalImageUrl, entry.processedImageUrl]);
            }

            return {
                success: true,
                message: 'History entry deleted successfully'
            };

        } catch (error) {
            console.error('Error deleting history entry:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get history statistics for a user
     */
    async getHistoryStats(userId) {
        try {
            const userHistoryKey = `user-history:${userId}`;
            const historyIds = await this.kv.get(userHistoryKey, 'json') || [];

            if (historyIds.length === 0) {
                return {
                    success: true,
                    stats: {
                        totalProcessed: 0,
                        completedCount: 0,
                        failedCount: 0,
                        averageProcessingTime: 0,
                        totalProcessingTime: 0
                    }
                };
            }

            // Fetch recent entries to calculate stats
            const recentIds = historyIds.slice(0, 100); // Last 100 entries
            const entries = await Promise.all(
                recentIds.map(id => this.kv.get(`history-entry:${id}`, 'json'))
            );

            const validEntries = entries.filter(entry => entry !== null);
            
            const stats = {
                totalProcessed: historyIds.length,
                completedCount: validEntries.filter(e => e.status === 'completed').length,
                failedCount: validEntries.filter(e => e.status === 'failed').length,
                averageProcessingTime: 0,
                totalProcessingTime: 0
            };

            const completedEntries = validEntries.filter(e => e.status === 'completed' && e.processingTime);
            if (completedEntries.length > 0) {
                stats.totalProcessingTime = completedEntries.reduce((sum, e) => sum + e.processingTime, 0);
                stats.averageProcessingTime = Math.round(stats.totalProcessingTime / completedEntries.length);
            }

            return {
                success: true,
                stats
            };

        } catch (error) {
            console.error('Error fetching history stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Add entry ID to user's history list
     */
    async addToUserHistory(userId, entryId) {
        const userHistoryKey = `user-history:${userId}`;
        const currentHistory = await this.kv.get(userHistoryKey, 'json') || [];
        
        // Add to beginning and keep only last 500 entries
        currentHistory.unshift(entryId);
        const trimmedHistory = currentHistory.slice(0, 500);
        
        await this.kv.put(userHistoryKey, JSON.stringify(trimmedHistory));
    }

    /**
     * Remove entry ID from user's history list
     */
    async removeFromUserHistory(userId, entryId) {
        const userHistoryKey = `user-history:${userId}`;
        const currentHistory = await this.kv.get(userHistoryKey, 'json') || [];
        
        const updatedHistory = currentHistory.filter(id => id !== entryId);
        await this.kv.put(userHistoryKey, JSON.stringify(updatedHistory));
    }

    /**
     * Clean up image URLs from R2
     */
    async cleanupImages(imageUrls) {
        if (!this.r2) return;

        for (const url of imageUrls) {
            if (!url) continue;
            
            try {
                // Extract key from URL
                const urlObj = new URL(url);
                const key = urlObj.pathname.substring(1); // Remove leading slash
                await this.r2.delete(key);
            } catch (error) {
                console.error('Error cleaning up image:', error);
            }
        }
    }

    /**
     * Export user history as JSON
     */
    async exportUserHistory(userId) {
        try {
            const result = await this.getUserHistory(userId, { limit: 1000 });
            
            if (!result.success) {
                throw new Error(result.error);
            }

            const exportData = {
                userId,
                exportedAt: new Date().toISOString(),
                totalEntries: result.totalCount,
                entries: result.entries.map(entry => ({
                    ...entry,
                    // Remove sensitive data from export
                    userId: undefined
                }))
            };

            return {
                success: true,
                data: exportData
            };

        } catch (error) {
            console.error('Error exporting user history:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}