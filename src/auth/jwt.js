/**
 * JWT utilities for Cloudflare Workers
 * Implements secure JWT token creation and verification
 */

export async function createJWT(payload, secret, expiresIn = '7d') {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const exp = now + parseExpiresIn(expiresIn);

    const jwtPayload = {
        ...payload,
        iat: now,
        exp: exp
    };

    const encodedHeader = base64URLEncode(JSON.stringify(header));
    const encodedPayload = base64URLEncode(JSON.stringify(jwtPayload));
    
    const signature = await signData(`${encodedHeader}.${encodedPayload}`, secret);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyJWT(token, secret) {
    try {
        const [encodedHeader, encodedPayload, signature] = token.split('.');
        
        if (!encodedHeader || !encodedPayload || !signature) {
            throw new Error('Invalid token format');
        }

        // Verify signature
        const data = `${encodedHeader}.${encodedPayload}`;
        const expectedSignature = await signData(data, secret);
        
        if (signature !== expectedSignature) {
            throw new Error('Invalid signature');
        }

        // Decode payload
        const payload = JSON.parse(base64URLDecode(encodedPayload));
        
        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            throw new Error('Token expired');
        }

        return payload;
        
    } catch (error) {
        throw new Error(`JWT verification failed: ${error.message}`);
    }
}

async function signData(data, secret) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const dataBuffer = encoder.encode(data);
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
    return base64URLEncode(new Uint8Array(signature));
}

function base64URLEncode(data) {
    let base64;
    if (typeof data === 'string') {
        base64 = btoa(unescape(encodeURIComponent(data)));
    } else {
        base64 = btoa(String.fromCharCode.apply(null, data));
    }
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64URLDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return decodeURIComponent(escape(atob(str)));
}

function parseExpiresIn(expiresIn) {
    const units = {
        's': 1,
        'm': 60,
        'h': 3600,
        'd': 86400,
        'w': 604800
    };
    
    const match = expiresIn.match(/^(\d+)([smhdw])$/);
    if (!match) {
        throw new Error('Invalid expiresIn format');
    }
    
    const [, value, unit] = match;
    return parseInt(value) * units[unit];
}