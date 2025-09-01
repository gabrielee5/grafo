import { 
    handleAuth, 
    handleProcessImage, 
    handleHistory, 
    handleHistoryItem,
    authenticateRequest,
    setupCORS 
} from './handlers/index.js';

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // Add CORS headers for all requests
    const corsResponse = setupCORS(request);
    if (corsResponse) return corsResponse;

    try {
        const url = new URL(request.url);
        const path = url.pathname;

        // Authentication routes (no auth required)
        if (path.startsWith('/auth/')) {
            return await handleAuth(request);
        }

        // Serve static assets for root path
        if (path === '/' || path === '/index.html') {
            return serveStaticAsset(request, 'index.html');
        }

        // Serve static assets
        if (path.startsWith('/static/') || 
            path.endsWith('.css') || 
            path.endsWith('.js') || 
            path.endsWith('.html')) {
            return serveStaticAsset(request);
        }

        // Protected API routes - require authentication
        const user = await authenticateRequest(request);
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Route API endpoints
        switch (true) {
            case path === '/api/process-image':
                return await handleProcessImage(request, user);
            case path === '/api/history':
                return await handleHistory(request, user);
            case path.startsWith('/api/history/'):
                const historyId = path.split('/').pop();
                return await handleHistoryItem(request, user, historyId);
            default:
                return new Response('Not Found', { status: 404 });
        }

    } catch (error) {
        console.error('Request handling error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal Server Error',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function serveStaticAsset(request, filename = null) {
    const url = new URL(request.url);
    const pathname = filename || url.pathname;
    
    // Map paths to actual files
    const fileMap = {
        '/': '/index.html',
        '/index.html': '/index.html',
        '/style.css': '/style.css', 
        '/script.js': '/script.js',
        '/config.js': '/config.js'
    };

    const actualPath = fileMap[pathname] || pathname;
    
    try {
        // In a real deployment, you'd serve these from R2 or embed them
        // For now, return a placeholder response
        const staticFiles = {
            '/index.html': await getIndexHTML(),
            '/style.css': await getStyleCSS(),
            '/script.js': await getScriptJS(),
            '/config.js': await getConfigJS()
        };

        const content = staticFiles[actualPath];
        if (!content) {
            return new Response('Static file not found', { status: 404 });
        }

        const contentType = getContentType(actualPath);
        return new Response(content, {
            headers: { 
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (error) {
        return new Response('Error serving static file', { status: 500 });
    }
}

function getContentType(path) {
    if (path.endsWith('.html')) return 'text/html';
    if (path.endsWith('.css')) return 'text/css';
    if (path.endsWith('.js')) return 'application/javascript';
    return 'text/plain';
}

// Placeholder functions - these would load actual file contents
async function getIndexHTML() {
    // This would embed the actual index.html content
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Signature Cleaner - Production Ready</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div id="auth-container"></div>
    <div id="app-container"></div>
    <script src="/config.js"></script>
    <script src="/script.js"></script>
</body>
</html>`;
}

async function getStyleCSS() {
    return '/* Enhanced CSS with auth and history styles */';
}

async function getScriptJS() {
    return '/* Enhanced JavaScript with auth and history features */';
}

async function getConfigJS() {
    return `const CONFIG = {
        API_BASE_URL: '${self.location.origin}',
        SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        MAX_FILE_SIZE: 10 * 1024 * 1024
    };`;
}