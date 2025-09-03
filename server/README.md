# Firma Pulita API Server

A secure backend API proxy for the Firma Pulita application that handles Gemini AI image processing and Firebase configuration.

## Features

- ✅ Secure API key management with environment variables
- ✅ Rate limiting (100 requests/15min, 5 image processing/min)
- ✅ File upload validation (10MB limit, JPEG/PNG/WebP only)
- ✅ CORS protection with configurable origins
- ✅ Security headers with Helmet.js
- ✅ Comprehensive error handling
- ✅ Health check endpoint

## Quick Start

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

The server will run on http://localhost:3001

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and configuration info.

### Firebase Configuration
```
GET /api/firebase-config
```
Returns Firebase configuration for frontend initialization.

### Process Image
```
POST /api/process-image
Content-Type: multipart/form-data

Fields:
- image: Image file (JPEG/PNG/WebP, max 10MB)
- instructions: Text instructions for processing
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `FIREBASE_API_KEY` | Firebase API key | Yes |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `FIREBASE_APP_ID` | Firebase app ID | Yes |
| `FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | No |
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Security Features

- **API Key Protection**: All sensitive keys are server-side only
- **Rate Limiting**: Prevents API abuse
- **File Validation**: Type and size restrictions
- **CORS Protection**: Configurable allowed origins
- **Security Headers**: Helmet.js protection
- **Error Sanitization**: No sensitive data in error responses

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure allowed origins in CORS
3. Use process manager (PM2, systemd)
4. Set up reverse proxy (nginx)
5. Enable HTTPS
6. Monitor logs and performance

## Development Notes

- Server auto-restarts are not configured - use nodemon if needed
- Debug information only shown in development mode
- All errors are logged to console with full details