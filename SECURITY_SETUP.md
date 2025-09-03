# 🔒 Security Setup Guide

This guide explains how to set up the secure version of Firma Pulita with the backend API proxy.

## 🚨 Critical Security Improvements

### ✅ **What's Been Fixed**
1. **API Key Exposure**: Moved all sensitive keys to backend server
2. **XSS Vulnerability**: Added input sanitization for history display
3. **Backend Proxy**: Created secure Node.js server to handle API calls
4. **Input Validation**: Enhanced email and password validation
5. **Rate Limiting**: Added protection against API abuse

## 📋 Setup Instructions

### 1. **Backend Server Setup**

#### Install Dependencies
```bash
cd server
npm install
```

#### Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual API keys
nano .env
```

Your `.env` file should look like this:
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
FIREBASE_API_KEY=your_actual_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
PORT=3001
NODE_ENV=development
```

#### Start the Server
```bash
npm start
```

The server will run on http://localhost:3001

### 2. **Frontend Setup**

#### Serve the Frontend
You can use any static file server:

**Option A: Live Server (VS Code)**
- Install Live Server extension
- Right-click on `index.html` → "Open with Live Server"

**Option B: Python HTTP Server**
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

**Option C: Node.js http-server**
```bash
npx http-server -p 3000
```

#### Access the Application
Open http://localhost:3000 (or your chosen port)

## 🔧 Configuration Details

### Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/firebase-config` | GET | Firebase configuration |
| `/api/process-image` | POST | Image processing via Gemini AI |

### Security Features

#### Rate Limiting
- **API Requests**: 100 requests per 15 minutes per IP
- **Image Processing**: 5 requests per minute per IP
- **Authentication**: Built-in Firebase rate limiting

#### Input Sanitization
- All user inputs are escaped to prevent XSS
- File uploads validated for type and size
- History display uses safe DOM manipulation

#### CORS Protection
- Development: `localhost:3000`, `localhost:5500`, `127.0.0.1:3000`
- Production: Configure your actual domain

## 🛡️ Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use different keys for development/production
- ✅ Rotate API keys regularly
- ✅ Monitor API usage

### File Security
- ✅ `.env` files are gitignored
- ✅ API keys removed from client-side code
- ✅ Server logs excluded from version control

### Frontend Security
- ✅ XSS protection with input sanitization
- ✅ Content Security Policy headers (via Helmet.js)
- ✅ Safe DOM manipulation for dynamic content

## 🚀 Production Deployment

### 1. Backend Deployment
1. Set `NODE_ENV=production`
2. Update CORS origins with your domain
3. Use process manager (PM2, systemd)
4. Set up reverse proxy (nginx)
5. Enable HTTPS

### 2. Environment Variables
```bash
NODE_ENV=production
GEMINI_API_KEY=prod_gemini_key
# ... other production keys
```

### 3. Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend static files
    location / {
        root /path/to/frontend;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:3001/api/health
```
Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "development"
}
```

### Frontend Connection Test
1. Open browser console on your frontend
2. Look for: `✅ Backend server connected: {status: "ok", ...}`
3. If you see `❌ Backend server connection failed`, check if server is running

### Image Processing Test
1. Upload an image
2. Add processing instructions
3. Click "Elabora Immagine"
4. Check browser network tab for successful API calls

## ⚠️ Troubleshooting

### "Backend server non disponibile"
- Ensure server is running: `npm start` in `/server` directory
- Check server logs for errors
- Verify `.env` file exists and has correct values

### CORS Errors
- Add your frontend URL to `corsOptions` in `server.js`
- Ensure frontend is running on allowed port

### Firebase Errors
- Verify Firebase project configuration
- Check Firebase API keys in `.env`
- Ensure Firestore rules allow authenticated access

### API Key Issues
- Double-check Gemini API key is valid
- Verify API key has necessary permissions
- Check API quotas and limits

## 📞 Support

If you encounter issues:
1. Check server logs: `console.log` output when running `npm start`
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test API endpoints individually

## 🔄 Next Steps

### Recommended Enhancements
1. **Add text-only endpoints** for translation and prompt enhancement
2. **Implement session management** for better security
3. **Add user analytics** and usage tracking
4. **Set up monitoring** and alerting
5. **Add automated backups** for user data

### Optional Features
- Two-factor authentication
- API key rotation mechanism
- Advanced rate limiting with user-based quotas
- Image processing queue for high-volume usage