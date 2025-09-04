# Firma Pulita 🖋️

A modern, professional web application for Italian graphologists to clean and enhance handwritten signatures and text from images. The app uses advanced AI processing with secure user authentication and enterprise-grade backend infrastructure.

## ✨ Features

### Core Functionality
- **🤖 AI-Powered Enhancement**: Integrated with Google Gemini 2.5 Flash for intelligent image processing
- **📤 Drag & Drop Upload**: Intuitive file upload with visual feedback and validation
- **📝 Custom Instructions**: Italian text input with automatic translation to English for optimal AI processing
- **🔄 Multi-Step Pipeline**: Translation → Enhancement → Processing workflow for best results
- **📊 Before/After Comparison**: Side-by-side display with zoom and pan functionality
- **💾 Smart Download**: Save enhanced images with custom filenames
- **🔄 Iterative Editing**: Further edit processed images for fine-tuning

### User Authentication & Management
- **🔐 Firebase Authentication**: Secure user registration and login
- **📧 Email Verification**: Required for service access with automated verification
- **👤 User Profile Management**: Update name, email, and password
- **📱 Responsive Auth UI**: Beautiful modal-based authentication system
- **🔒 Session Management**: Persistent login with secure token handling
- **📊 User History**: Track all processed images with timestamps

### Modern UI/UX Design
- **🎨 Glassmorphism Design**: Modern glass-effect cards with backdrop blur
- **🌈 Beautiful Gradients**: Professional color palette with smooth transitions
- **✨ Smooth Animations**: Staggered fade-in effects and micro-interactions
- **📱 Fully Responsive**: Optimized experience across all devices
- **♿ Accessibility First**: Proper focus states, keyboard navigation, and screen reader support
- **🔍 Image Zoom & Pan**: Professional image viewing with zoom controls
- **⚡ Performance Optimized**: Hardware-accelerated animations and efficient rendering
- **🎯 Toast Notifications**: Beautiful, contextual user feedback system

### Advanced Features
- **🔍 Workflow Debugging**: Optional display of processing steps and prompts
- **🌐 Multi-Language Support**: Italian interface with intelligent English processing
- **📋 Process Transparency**: View all AI prompts and responses used in enhancement
- **🔄 Fallback Processing**: Automatic fallback if translation/enhancement fails
- **⏱️ Real-time Status**: Live updates during processing with detailed progress
- **📚 Processing History**: View and re-download previous enhancements

### Enterprise Security & Infrastructure
- **🛡️ Secure Backend API**: Node.js/Express server with comprehensive security
- **🔑 API Key Protection**: All sensitive keys stored server-side only
- **📊 Rate Limiting**: Configurable limits to prevent API abuse
- **🚦 CORS Protection**: Strict origin validation for production security
- **🔒 Input Validation**: Comprehensive file type and size validation
- **📝 Audit Logging**: Complete request/response logging for monitoring
- **⚡ Performance Monitoring**: Health checks and system status endpoints

## 🏗️ Architecture

### Frontend
- **Pure Web Technologies**: HTML5, CSS3, Vanilla JavaScript ES6+
- **Firebase Integration**: Authentication, user management, and data storage
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Security**: Client-side token management with automatic refresh

### Backend
- **Node.js/Express**: RESTful API with comprehensive middleware
- **Firebase Admin**: Server-side user verification and management
- **Security Middleware**: Helmet.js, CORS, rate limiting, input validation
- **Environment Management**: Secure configuration with environment variables

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ installed
- Google Gemini API account and key
- Firebase project configured
- Modern web browser with ES6+ support

### 1. Clone and Install

```bash
git clone <repository-url>
cd grafo

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Backend Configuration

1. **Create environment file:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Configure environment variables in `server/.env`:**
   ```env
   # Google AI API
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Firebase Configuration
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

3. **Start the backend server:**
   ```bash
   cd server
   npm start
   ```
   The server will run on `http://localhost:3001`

### 3. Frontend Setup

1. **Serve the frontend:**
   ```bash
   # From project root directory
   # Using Python
   python -m http.server 8080
   
   # Using Node.js (with npx)
   npx http-server -p 8080
   
   # Using PHP
   php -S localhost:8080
   ```

2. **Access the application:**
   Open `http://localhost:8080` in your browser

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Configure Firestore Database (optional, for user data)
4. Add your domain to authorized domains
5. Copy configuration values to your `.env` file

## 📖 Usage Guide

### Getting Started
1. **Create Account**: Click "Accedi" → "Registrati" to create your account
2. **Verify Email**: Check your email and verify your account
3. **Upload Image**: Drag and drop or select a signature/handwriting image
4. **Add Instructions**: Describe desired enhancements in Italian
5. **Process**: Click "Elabora Immagine" to enhance your image
6. **Review & Download**: Compare results and download the enhanced image

### Advanced Features
- **Account Settings**: Click your username → "Impostazioni Account" to update profile
- **View History**: Access "Cronologia" to see all previous enhancements
- **Debug Mode**: Click "Mostra Processo" to see detailed processing steps
- **Iterative Enhancement**: Use "Modifica Ulteriormente" for additional improvements
- **Image Zoom**: Use zoom controls for detailed inspection of results

### File Requirements
- **Supported formats**: JPG, JPEG, PNG, WEBP
- **Maximum file size**: 10MB
- **Recommended**: High-resolution images for best results

## 🔧 API Documentation

### Authentication
All image processing endpoints require Firebase Authentication:
```javascript
Authorization: Bearer <firebase_id_token>
```

### Endpoints

#### Health Check
```http
GET /api/health
```
Returns server status and configuration.

#### Process Image
```http
POST /api/process-image
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- image: File (required)
- instructions: String (required)
```

#### Text Translation
```http
POST /api/translate-text
Content-Type: application/json

Body:
{
  "text": "Italian text to translate"
}
```

#### Prompt Enhancement
```http
POST /api/enhance-prompt
Content-Type: application/json

Body:
{
  "text": "Basic instructions to enhance"
}
```

## 🛡️ Security Features

### Frontend Security
- **Authentication Required**: All core features require verified email
- **Secure Token Storage**: Firebase tokens stored securely with auto-refresh
- **Input Validation**: Client-side file type and size validation
- **HTTPS Enforcement**: Production deployment requires HTTPS
- **Privacy Protection**: No sensitive data logged or stored client-side

### Backend Security
- **API Key Protection**: All AI API keys stored server-side only
- **Rate Limiting**: 
  - General API: 100 requests per 15 minutes
  - Image processing: 5 requests per minute
- **File Validation**: Server-side mime type and size verification
- **CORS Protection**: Strict origin validation
- **Security Headers**: Helmet.js with comprehensive header protection
- **Error Sanitization**: No sensitive information in error responses
- **Input Sanitization**: Comprehensive request validation and sanitization

## 📁 Project Structure

```
grafo/
├── 📁 server/                    # Backend API server
│   ├── server.js                 # Main Express server
│   ├── package.json              # Backend dependencies
│   ├── .env.example              # Environment template
│   └── README.md                 # Backend documentation
├── 📄 index.html                 # Main application interface
├── 🎨 style.css                  # Modern CSS with glassmorphism
├── 📜 script.js                  # Main application logic
├── 🔐 auth.js                    # Firebase authentication service
├── ⚙️ config.js                  # Configuration and API management
├── 🛠️ utils.js                   # Utility functions
├── 📄 LICENSE                    # Non-commercial license
└── 📖 README.md                  # This documentation
```

## 🚀 Production Deployment

### Frontend Deployment
1. **Static Host**: Deploy to Netlify, Vercel, or GitHub Pages
2. **HTTPS Required**: SSL certificate mandatory for Firebase Auth
3. **Environment**: Update CORS origins in backend configuration
4. **CDN**: Consider CloudFlare for global performance

### Backend Deployment
1. **Platform**: Deploy to Heroku, Railway, or AWS
2. **Environment**: Set `NODE_ENV=production`
3. **Process Manager**: Use PM2 for process management
4. **Reverse Proxy**: Configure nginx for SSL termination
5. **Monitoring**: Implement logging and health monitoring
6. **Scaling**: Configure auto-scaling based on load

### Security Checklist
- ✅ All environment variables configured
- ✅ Firebase security rules implemented
- ✅ CORS origins restricted to production domains
- ✅ Rate limiting configured appropriately
- ✅ SSL certificates installed
- ✅ Error logging and monitoring enabled
- ✅ Backup and recovery procedures tested

## 🔧 Technical Details

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript ES6+, Firebase SDK
- **Backend**: Node.js, Express.js, Firebase Admin SDK
- **AI Processing**: Google Gemini 2.5 Flash API
- **Authentication**: Firebase Authentication
- **Database**: Firestore (optional, for user data)
- **Security**: Helmet.js, CORS, Express Rate Limit, Multer

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Required APIs**: Fetch API, Canvas API, File API, Drag & Drop API
- **Progressive Enhancement**: Graceful degradation for older browsers

### Performance Features
- **Lazy Loading**: Images and components loaded on demand
- **Efficient Rendering**: RequestAnimationFrame for smooth animations
- **Memory Management**: Proper cleanup of resources and event listeners
- **Network Optimization**: Compression and efficient API calls

## 🐛 Troubleshooting

### Common Issues

#### Backend Connection Problems
```
Error: Unable to connect to backend server
```
- **Solution**: Ensure backend server is running on port 3001
- **Check**: `npm start` in the `server/` directory
- **Verify**: Server logs show "🚀 Firma Pulita API server running"

#### Authentication Issues
```
Error: Email verification required
```
- **Solution**: Check email and click verification link
- **Alternative**: Use "Reinvia Email" button to resend verification

#### Image Processing Failures
```
Error: Image processing service temporarily unavailable
```
- **Check**: Gemini API key is valid and has quota
- **Verify**: Image is under 10MB and in supported format
- **Retry**: Wait a moment and try again due to rate limiting

#### CORS Errors
```
Error: CORS policy blocked request
```
- **Solution**: Serve frontend via HTTP server, not file:// protocol
- **Development**: Use `http://localhost:8080` or similar
- **Production**: Ensure frontend domain is in CORS allowed origins

### Debug Mode
Enable debug mode by clicking "Mostra Processo" to see:
- All translation steps and results
- Enhanced prompts sent to AI
- Complete API request/response cycle
- Processing timestamps and performance metrics

## 📄 License

This project is licensed under a **Non-Commercial License** - see the [LICENSE](LICENSE) file for details.

**Key License Points:**
- ✅ Free for personal and educational use
- ✅ Can modify and distribute for non-commercial purposes  
- ❌ Commercial use prohibited without separate license
- 📧 Contact for commercial licensing inquiries

## 👨‍💻 Author

**Gabriele Fabietti**
- Created for professional graphological analysis in Italy
- Designed with modern security principles and enterprise architecture
- Focused on user experience and professional-grade reliability

## 🌟 Recent Updates

### Authentication & Security (Latest)
- ✅ Complete Firebase authentication integration
- ✅ Email verification requirement system
- ✅ User profile management with password changes
- ✅ Secure backend API with authentication middleware
- ✅ Advanced notification system with contextual messages
- ✅ Enhanced privacy controls and data protection

### Infrastructure Improvements
- ✅ Production-ready Node.js/Express backend
- ✅ Comprehensive rate limiting and security headers
- ✅ Environment-based configuration management
- ✅ Health monitoring and error handling
- ✅ CORS protection and input validation

### User Experience Enhancements
- ✅ Beautiful toast notification system
- ✅ Responsive authentication modals
- ✅ Processing history with timestamps
- ✅ Enhanced error messages and user guidance
- ✅ Mobile-optimized interface improvements

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please ensure:

1. **Security**: Never commit API keys or sensitive configuration
2. **Testing**: Test both frontend and backend thoroughly
3. **Documentation**: Update README for any new features
4. **Code Style**: Follow existing patterns and conventions

## 🌟 Acknowledgments

- Google Gemini API for powerful AI image processing
- Firebase for robust authentication and user management
- Italian graphology community for requirements and feedback
- Modern web standards and security best practices
- Open source community for inspiration and tools

---

*Built with ❤️ for the Italian graphology community*