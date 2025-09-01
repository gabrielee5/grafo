# Production Deployment Guide

This guide walks you through deploying the Signature Cleaner app to Cloudflare Workers with full authentication and history features.

## Prerequisites

1. **Cloudflare Account**: [Sign up](https://dash.cloudflare.com/sign-up) for a free account
2. **Domain** (Optional): For custom domain setup
3. **Google Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. **Node.js**: Version 16 or higher
5. **Git**: For version control

## Step 1: Initial Setup

### Install Dependencies
```bash
npm install
npm install -g wrangler
```

### Login to Cloudflare
```bash
wrangler login
```

## Step 2: Create Required Resources

### Create KV Namespace for Data Storage
```bash
# Production namespace
wrangler kv:namespace create "KV"
# Preview namespace for development
wrangler kv:namespace create "KV" --preview
```

**Important**: Copy the namespace IDs from the output and update `wrangler.toml`:
```toml
[env.production]
kv_namespaces = [
    { binding = "KV", id = "your-production-kv-id-here" },
    { binding = "KV", preview_id = "your-preview-kv-id-here" },
]
```

### Create R2 Bucket for Image Storage
```bash
wrangler r2 bucket create signature-images
```

## Step 3: Configure Secrets

### Set Environment Variables
```bash
# Set your Gemini API key
wrangler secret put GEMINI_API_KEY
# When prompted, paste your API key

# Set JWT secret (generate a random 32+ character string)
wrangler secret put JWT_SECRET
# When prompted, paste your JWT secret
```

### Generate JWT Secret
You can generate a secure JWT secret using:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

## Step 4: Update Worker Configuration

### Fix Worker Handler
Edit `src/worker.js` and replace the global references:

```javascript
// Replace globalThis references with proper env parameter
export default {
    async fetch(request, env, ctx) {
        return handleRequest(request, env, ctx);
    }
};

async function handleRequest(request, env, ctx) {
    // Pass env to handlers
    const corsResponse = setupCORS(request);
    if (corsResponse) return corsResponse;

    try {
        const url = new URL(request.url);
        const path = url.pathname;

        if (path.startsWith('/auth/')) {
            return await handleAuth(request, env);
        }

        // ... rest of routing logic
        const user = await authenticateRequest(request, env);
        if (!user) {
            return jsonResponse({ error: 'Unauthorized' }, { status: 401 });
        }

        switch (true) {
            case path === '/api/process-image':
                return await handleProcessImage(request, user, env);
            case path === '/api/history':
                return await handleHistory(request, user, env);
            case path.startsWith('/api/history/'):
                const historyId = path.split('/').pop();
                return await handleHistoryItem(request, user, historyId, env);
            default:
                return new Response('Not Found', { status: 404 });
        }
    } catch (error) {
        console.error('Request handling error:', error);
        return jsonResponse({ 
            error: 'Internal Server Error',
            message: error.message 
        }, { status: 500 });
    }
}
```

## Step 5: Set Up Custom Domain (Optional)

### Add Custom Domain to R2 Bucket
```bash
# Replace with your domain
wrangler r2 bucket domain add signature-images --domain images.yourdomain.com
```

### Update Storage Service
Edit `src/utils/storage.js` and update the public URL generation:
```javascript
// Replace this line:
const publicUrl = `https://${this.bucketName}.your-domain.com/${key}`;

// With your actual domain:
const publicUrl = `https://images.yourdomain.com/${key}`;
```

## Step 6: Deploy

### Test Deployment (Preview)
```bash
wrangler dev
```

### Production Deployment
```bash
wrangler publish --env production
```

## Step 7: Frontend Configuration

### Update API Base URL
If using a custom domain, update `config.js`:
```javascript
const CONFIG = {
    API_BASE_URL: 'https://your-worker-domain.workers.dev', // or your custom domain
    // ... rest of config
};
```

### Replace Script Reference
In `index.html`, replace the script reference:
```html
<!-- Replace this line -->
<script src="script.js"></script>

<!-- With this -->
<script src="script-enhanced.js"></script>
```

## Step 8: Static Asset Hosting

### Option A: Cloudflare Pages (Recommended)

1. **Connect Repository**:
   - Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
   - Connect your GitHub repository

2. **Build Settings**:
   - Build command: `echo "No build needed"`
   - Build output directory: `/`
   - Root directory: `/`

3. **Environment Variables**:
   - No environment variables needed for static assets

### Option B: Update Worker to Serve Static Assets

Embed your static files in the worker by updating the placeholder functions in `src/worker.js`:

```javascript
async function getIndexHTML() {
    return `<!DOCTYPE html>
    <!-- Paste your complete index.html content here -->
    `;
}

async function getStyleCSS() {
    return `/* Paste your complete style.css content here */`;
}

async function getScriptJS() {
    return `/* Paste your complete script-enhanced.js content here */`;
}
```

## Step 9: Verify Deployment

### Test Authentication
1. Visit your deployed URL
2. Try registering a new account
3. Test login functionality

### Test Image Processing
1. Upload a signature image
2. Add Italian instructions
3. Process the image
4. Verify workflow steps are displayed

### Test History
1. Process multiple images
2. View history panel
3. Test filtering and pagination
4. Try exporting history

## Step 10: Monitoring and Maintenance

### View Logs
```bash
wrangler tail
```

### Monitor Usage
- Check [Cloudflare Dashboard](https://dash.cloudflare.com) for:
  - Worker invocations
  - KV operations
  - R2 storage usage

### Backup Strategy
```bash
# Export KV data (implement backup script)
wrangler kv:bulk get --namespace-id=your-kv-id > kv-backup.json
```

## Security Considerations

### Rate Limiting
Add rate limiting to protect against abuse:
```javascript
// In worker.js
const RATE_LIMIT = 10; // requests per minute
const rateLimiter = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const userRequests = rateLimiter.get(ip) || [];
    const recentRequests = userRequests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= RATE_LIMIT) {
        return false;
    }
    
    recentRequests.push(now);
    rateLimiter.set(ip, recentRequests);
    return true;
}
```

### CORS Security
Update CORS to restrict to your domain:
```javascript
export function setupCORS(request) {
    const origin = request.headers.get('Origin');
    const allowedOrigins = ['https://yourdomain.com', 'https://www.yourdomain.com'];
    
    if (method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400',
            },
        });
    }
}
```

### Input Validation
Always validate:
- File sizes and types
- Email formats
- Password strength
- Prompt lengths

## Troubleshooting

### Common Issues

1. **KV Namespace Error**:
   ```
   Error: No namespace binding found for KV
   ```
   - Solution: Update `wrangler.toml` with correct namespace IDs

2. **CORS Errors**:
   ```
   Access-Control-Allow-Origin error
   ```
   - Solution: Check CORS configuration and allowed origins

3. **Authentication Fails**:
   ```
   JWT verification failed
   ```
   - Solution: Ensure JWT_SECRET is set correctly

4. **Image Processing Fails**:
   ```
   API request failed: 401
   ```
   - Solution: Verify GEMINI_API_KEY is set correctly

### Getting Help

1. Check [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
2. View logs with `wrangler tail`
3. Test locally with `wrangler dev`

## Cost Estimation

### Cloudflare Workers (Free Tier)
- 100,000 requests/day
- 10ms CPU time/request
- Free for most use cases

### Cloudflare KV (Free Tier)
- 1GB storage
- 100,000 read operations/day
- 1,000 write operations/day

### Cloudflare R2 (Free Tier)
- 10GB storage/month
- 1 million Class A operations/month
- 10 million Class B operations/month

### Estimated Monthly Cost
For moderate usage (1000 users, 5000 processes/month):
- **Free tier**: $0/month
- **Paid tier**: ~$5-15/month

## Performance Optimization

### Caching Strategy
```javascript
// Cache processed images
const cache = caches.default;
const cacheKey = new Request(url, request);
const cachedResponse = await cache.match(cacheKey);

if (cachedResponse) {
    return cachedResponse;
}

// Process and cache response
const response = await processImage();
ctx.waitUntil(cache.put(cacheKey, response.clone()));
```

### Database Optimization
- Index frequently queried fields
- Implement pagination for large datasets
- Use KV TTL for temporary data

This completes your production deployment! Your Signature Cleaner app is now running with enterprise-grade features on Cloudflare's global network.