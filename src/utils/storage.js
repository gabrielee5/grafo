/**
 * R2 Storage utilities for image management
 * Handles uploading, retrieving, and managing images in Cloudflare R2
 */

export class StorageService {
    constructor(env) {
        this.r2 = env.R2;
        this.bucketName = 'signature-images'; // Match wrangler.toml config
    }

    /**
     * Upload an image to R2 storage
     */
    async uploadImage(imageBuffer, fileName, userId, options = {}) {
        try {
            const {
                mimeType = 'image/png',
                isOriginal = false,
                metadata = {}
            } = options;

            // Generate unique key with user segregation
            const timestamp = Date.now();
            const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const prefix = isOriginal ? 'original' : 'processed';
            const key = `users/${userId}/${prefix}/${timestamp}-${sanitizedFileName}`;

            // Prepare metadata
            const customMetadata = {
                userId,
                uploadedAt: new Date().toISOString(),
                originalFileName: fileName,
                isOriginal: isOriginal.toString(),
                ...metadata
            };

            // Upload to R2
            await this.r2.put(key, imageBuffer, {
                httpMetadata: {
                    contentType: mimeType,
                    cacheControl: 'public, max-age=31536000', // 1 year cache
                    contentDisposition: `inline; filename="${sanitizedFileName}"`
                },
                customMetadata
            });

            // Generate public URL (assuming custom domain is configured)
            const publicUrl = `https://${this.bucketName}.your-domain.com/${key}`;

            return {
                success: true,
                url: publicUrl,
                key,
                size: imageBuffer.byteLength
            };

        } catch (error) {
            console.error('Error uploading image:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get an image from R2 storage
     */
    async getImage(key) {
        try {
            const object = await this.r2.get(key);
            
            if (!object) {
                throw new Error('Image not found');
            }

            return {
                success: true,
                data: await object.arrayBuffer(),
                metadata: {
                    contentType: object.httpMetadata?.contentType,
                    size: object.size,
                    lastModified: object.uploaded,
                    customMetadata: object.customMetadata
                }
            };

        } catch (error) {
            console.error('Error retrieving image:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete an image from R2 storage
     */
    async deleteImage(key) {
        try {
            await this.r2.delete(key);
            
            return {
                success: true,
                message: 'Image deleted successfully'
            };

        } catch (error) {
            console.error('Error deleting image:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * List images for a user
     */
    async listUserImages(userId, options = {}) {
        try {
            const {
                limit = 100,
                prefix = '',
                cursor = null
            } = options;

            const listOptions = {
                limit,
                prefix: `users/${userId}/${prefix}`,
            };

            if (cursor) {
                listOptions.cursor = cursor;
            }

            const result = await this.r2.list(listOptions);

            const images = result.objects.map(obj => ({
                key: obj.key,
                size: obj.size,
                lastModified: obj.uploaded,
                url: `https://${this.bucketName}.your-domain.com/${obj.key}`,
                metadata: obj.customMetadata
            }));

            return {
                success: true,
                images,
                truncated: result.truncated,
                cursor: result.truncated ? result.cursor : null
            };

        } catch (error) {
            console.error('Error listing user images:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get storage usage statistics for a user
     */
    async getUserStorageStats(userId) {
        try {
            let totalSize = 0;
            let totalCount = 0;
            let cursor = null;
            let hasMore = true;

            while (hasMore) {
                const result = await this.r2.list({
                    limit: 1000,
                    prefix: `users/${userId}/`,
                    cursor
                });

                totalCount += result.objects.length;
                totalSize += result.objects.reduce((sum, obj) => sum + obj.size, 0);

                hasMore = result.truncated;
                cursor = result.cursor;
            }

            return {
                success: true,
                stats: {
                    totalFiles: totalCount,
                    totalSizeBytes: totalSize,
                    totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100
                }
            };

        } catch (error) {
            console.error('Error getting storage stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Clean up old images (for maintenance)
     */
    async cleanupOldImages(userId, daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            let deletedCount = 0;
            let cursor = null;
            let hasMore = true;

            while (hasMore) {
                const result = await this.r2.list({
                    limit: 1000,
                    prefix: `users/${userId}/`,
                    cursor
                });

                // Filter objects older than cutoff date
                const oldObjects = result.objects.filter(obj => obj.uploaded < cutoffDate);

                // Delete old objects
                for (const obj of oldObjects) {
                    await this.r2.delete(obj.key);
                    deletedCount++;
                }

                hasMore = result.truncated;
                cursor = result.cursor;
            }

            return {
                success: true,
                deletedCount,
                message: `Cleaned up ${deletedCount} old images`
            };

        } catch (error) {
            console.error('Error cleaning up old images:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate a pre-signed URL for direct upload (if needed)
     */
    async generatePresignedUploadUrl(userId, fileName, options = {}) {
        try {
            const {
                mimeType = 'image/png',
                expiresIn = 3600, // 1 hour
                isOriginal = false
            } = options;

            const timestamp = Date.now();
            const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const prefix = isOriginal ? 'original' : 'processed';
            const key = `users/${userId}/${prefix}/${timestamp}-${sanitizedFileName}`;

            // Note: R2 presigned URLs require additional configuration
            // This is a placeholder for the actual implementation
            const presignedUrl = `https://your-worker-domain.com/api/upload/${key}?expires=${Date.now() + expiresIn * 1000}`;

            return {
                success: true,
                uploadUrl: presignedUrl,
                key,
                expiresIn
            };

        } catch (error) {
            console.error('Error generating presigned URL:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate image format and size
     */
    validateImage(buffer, options = {}) {
        const {
            maxSizeBytes = 10 * 1024 * 1024, // 10MB default
            allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        } = options;

        // Check size
        if (buffer.byteLength > maxSizeBytes) {
            return {
                valid: false,
                error: `File size exceeds maximum allowed size of ${Math.round(maxSizeBytes / (1024 * 1024))}MB`
            };
        }

        // Basic format validation by checking file headers
        const uint8Array = new Uint8Array(buffer.slice(0, 12));
        const header = Array.from(uint8Array).map(byte => byte.toString(16).padStart(2, '0')).join('');

        let detectedType = null;
        
        // Check common image file signatures
        if (header.startsWith('ffd8ff')) {
            detectedType = 'image/jpeg';
        } else if (header.startsWith('89504e47')) {
            detectedType = 'image/png';
        } else if (header.startsWith('52494646')) {
            // Check for WebP signature (RIFF followed by WEBP)
            const webpHeader = Array.from(new Uint8Array(buffer.slice(8, 12)))
                .map(byte => String.fromCharCode(byte))
                .join('');
            if (webpHeader === 'WEBP') {
                detectedType = 'image/webp';
            }
        }

        if (!detectedType || !allowedTypes.includes(detectedType)) {
            return {
                valid: false,
                error: 'Unsupported image format. Only JPEG, PNG, and WebP are allowed.'
            };
        }

        return {
            valid: true,
            detectedType,
            size: buffer.byteLength
        };
    }
}