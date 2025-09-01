/**
 * Cryptographic utilities for password hashing and verification
 */

export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        data,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    
    // Derive key using PBKDF2
    const key = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        256 // 32 bytes
    );
    
    // Combine salt and key
    const combined = new Uint8Array(salt.length + key.byteLength);
    combined.set(salt);
    combined.set(new Uint8Array(key), salt.length);
    
    // Return base64 encoded result
    return btoa(String.fromCharCode.apply(null, combined));
}

export async function verifyPassword(password, hashedPassword) {
    try {
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);
        
        // Decode the stored hash
        const combined = new Uint8Array(
            atob(hashedPassword).split('').map(c => c.charCodeAt(0))
        );
        
        // Extract salt (first 16 bytes) and hash (rest)
        const salt = combined.slice(0, 16);
        const storedKey = combined.slice(16);
        
        // Import password as key material
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordData,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );
        
        // Derive key using same parameters
        const key = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256
        );
        
        // Compare keys
        const newKey = new Uint8Array(key);
        return timingSafeEqual(storedKey, newKey);
        
    } catch (error) {
        return false;
    }
}

// Timing-safe comparison to prevent timing attacks
function timingSafeEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }
    
    return result === 0;
}