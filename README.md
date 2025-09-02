# Firma Pulita 🖋️

A modern, professional web application for Italian graphologists to clean and enhance handwritten signatures and text from images. The app uses advanced AI processing to remove imperfections while preserving authentic handwriting characteristics.

## ✨ Features

### Core Functionality
- **🤖 AI-Powered Enhancement**: Integrated with Google Gemini 2.5 Flash for intelligent image processing
- **📤 Drag & Drop Upload**: Intuitive file upload with visual feedback and validation
- **📝 Custom Instructions**: Italian text input with automatic translation to English for optimal AI processing
- **🔄 Multi-Step Pipeline**: Translation → Enhancement → Processing workflow for best results
- **📊 Before/After Comparison**: Side-by-side display with zoom and pan functionality
- **💾 Smart Download**: Save enhanced images with custom filenames
- **🔄 Iterative Editing**: Further edit processed images for fine-tuning

### Modern UI/UX Design
- **🎨 Glassmorphism Design**: Modern glass-effect cards with backdrop blur
- **🌈 Beautiful Gradients**: Professional color palette with smooth transitions
- **✨ Smooth Animations**: Staggered fade-in effects and micro-interactions
- **📱 Fully Responsive**: Optimized experience across all devices
- **♿ Accessibility First**: Proper focus states, keyboard navigation, and screen reader support
- **🔍 Image Zoom & Pan**: Professional image viewing with zoom controls
- **⚡ Performance Optimized**: Hardware-accelerated animations and efficient rendering

### Advanced Features
- **🔍 Workflow Debugging**: Optional display of processing steps and prompts
- **🌐 Multi-Language Support**: Italian interface with intelligent English processing
- **📋 Process Transparency**: View all AI prompts and responses used in enhancement
- **🔄 Fallback Processing**: Automatic fallback if translation/enhancement fails
- **⏱️ Real-time Status**: Live updates during processing with detailed progress

## Setup Instructions

### 1. Configure API Key

1. Get your Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open `config.js` and replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:

```javascript
const CONFIG = {
    GEMINI_API_KEY: 'your_actual_api_key_here',
    // ... other settings
};
```

### 2. Environment Variables (Optional)

For additional security, you can use the `.env` file:

1. Copy `.env` to `.env.local`
2. Edit `.env.local` and add your API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Run the Application

#### Local Development
1. Open `index.html` in a modern web browser
2. Or serve with a local HTTP server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (with npx)
npx http-server

# Using PHP
php -S localhost:8000
```

#### Production Deployment
- Deploy to any web server (Netlify, Vercel, GitHub Pages, etc.)
- **Important**: HTTPS is required for Gemini API calls
- Ensure `config.js` is properly configured with your API key

## 🚀 Usage

### Basic Workflow
1. **📤 Upload Image**: Drag and drop or click to select a signature/handwriting image (JPG, PNG, WEBP)
2. **📝 Add Instructions**: Describe specific enhancements in Italian (required)
   - Example: *"Pulisci e migliora questa firma rimuovendo il rumore di sfondo, aumentando il contrasto ed eliminando le imperfezioni preservando le caratteristiche autentiche della scrittura"*
3. **⚙️ Process**: Click "Elabora Immagine" to start the AI enhancement
4. **👁️ Review**: Compare original and enhanced images side-by-side
5. **💾 Download**: Save the enhanced image with a custom filename
6. **🔄 Edit Further**: Optionally process the enhanced image again for additional improvements

### Advanced Features
- **🔍 Zoom & Pan**: Use zoom controls on any image for detailed inspection
- **🐛 Debug Mode**: Click "Mostra Processo" to view the complete processing pipeline
- **📊 Workflow Transparency**: See all translation steps, enhanced prompts, and AI responses
- **🔄 Iterative Enhancement**: Use "Modifica Ulteriormente" to refine results

## Supported File Formats

- JPG/JPEG
- PNG
- WEBP
- Maximum file size: 10MB

## Security

- API keys are git-ignored to prevent accidental commits
- The `.env` file is excluded from version control
- Use HTTPS in production for secure API calls

## 📁 File Structure

```
firma-pulita/
├── index.html          # Main application interface with modern HTML5 structure
├── style.css          # Modern CSS with glassmorphism, animations, and responsive design
├── script.js          # Advanced JavaScript with AI pipeline and workflow tracking
├── config.js          # Configuration file with API settings
├── LICENSE            # MIT License
├── README.md          # This documentation
├── AUTH_OPTIONS.md    # Authentication options documentation
└── .gitignore         # Git exclusions
```

## 🔧 Technical Details

### Technology Stack
- **Frontend**: Modern HTML5, CSS3 with advanced features, Vanilla JavaScript ES6+
- **AI Processing**: Google Gemini 2.5 Flash API with multi-model support
- **Image Processing**: HTML5 Canvas API with advanced pixel manipulation
- **Architecture**: Pure client-side SPA (Single Page Application)
- **Styling**: CSS Grid, Flexbox, CSS Custom Properties, Glassmorphism design
- **Animations**: CSS Keyframes, Transforms, and Transitions with hardware acceleration

### Advanced Features
- **Multi-Step AI Pipeline**: Translation → Enhancement → Image Processing
- **Workflow Tracking**: Complete audit trail of all processing steps
- **Responsive Images**: Optimized loading and display across all screen sizes
- **Performance**: Efficient DOM manipulation, requestAnimationFrame for smooth animations
- **Error Handling**: Comprehensive error recovery with fallback processing
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Required APIs**: Fetch API, Canvas API, File API, Drag & Drop API
- **Progressive Enhancement**: Graceful degradation for older browsers

## Troubleshooting

### Common Issues

1. **"Please configure your Gemini API key"**
   - Edit `config.js` and add your actual API key

2. **Processing fails**
   - Check your API key is valid
   - Ensure you have credits in your Google Cloud account
   - Verify the image file is under 10MB

3. **CORS errors**
   - Serve the app over HTTP/HTTPS, not file:// protocol
   - Use a local server for development

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Gabriele Fabietti**
- Created for professional graphological analysis in Italy
- Designed with modern UI/UX principles and accessibility in mind

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 🌟 Acknowledgments

- Google Gemini API for powerful AI image processing
- Italian graphology community for requirements and feedback
- Modern web standards and accessibility guidelines