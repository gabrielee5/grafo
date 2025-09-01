# Signature Cleaner

A professional web application for Italian graphologists to clean and enhance handwritten signatures and text from photos. The app removes imperfections while preserving authentic handwriting characteristics.

## Features

- **Clean Interface**: Simple, professional UI designed for graphologists
- **Drag & Drop Upload**: Easy image upload with visual feedback
- **Custom Instructions**: Text input for specific enhancement requests
- **AI Processing**: Google Gemini 2.5 Flash integration for advanced image enhancement
- **Before/After Comparison**: Side-by-side display of original and processed images
- **Download Functionality**: Save enhanced images in high quality
- **Responsive Design**: Works on desktop and mobile devices

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

## Usage

1. **Upload Image**: Drag and drop or click to select a signature/handwriting image
2. **Add Instructions** (Optional): Describe specific enhancements needed
3. **Process**: Click "Process Image" to enhance the image
4. **Download**: Save the cleaned image to your device

## Supported File Formats

- JPG/JPEG
- PNG
- WEBP
- Maximum file size: 10MB

## Security

- API keys are git-ignored to prevent accidental commits
- The `.env` file is excluded from version control
- Use HTTPS in production for secure API calls

## File Structure

```
signature-cleaner/
├── index.html          # Main application interface
├── style.css          # Responsive styling
├── script.js          # Core functionality
├── config.js          # Configuration (git-ignored)
├── .env               # Environment template
├── .gitignore         # Git exclusions
└── README.md          # This file
```

## Technical Details

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **AI Processing**: Google Gemini 2.5 Flash API
- **Image Processing**: Canvas API for basic enhancements
- **No Backend Required**: Pure client-side application

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

### Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

Created for professional graphological analysis in Italy.