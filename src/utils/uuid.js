/**
 * UUID v4 generation utility for Cloudflare Workers
 */

export function generateUUID() {
    // Use crypto.randomUUID if available (modern browsers/workers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    
    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}