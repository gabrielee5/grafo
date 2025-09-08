# Firma Pulita

**Firma Pulita** is a modern web application designed for Italian graphologists to enhance and clean handwritten signatures and text from images.  It uses Google Gemini 2.5 Flash for AI-powered processing and provides a professional, intuitive user experience.

---

## Key Features

The application's core functionality is its **AI-powered image enhancement**. Users can easily drag and drop image files, add custom instructions in Italian, and a multi-step pipeline translates the text, processes the image, and provides the enhanced result. A side-by-side viewer with zoom and pan controls allows for detailed comparison of the original and processed images. Users can also save the enhanced images and perform iterative edits for fine-tuning.

For user management, the app uses secure **Firebase authentication** with email verification, enabling users to create accounts, manage their profiles, and securely track a history of all their processed images.

The user interface (UI) is designed with **modern glassmorphism** and a beautiful gradient-based color palette, providing a fully responsive and accessible experience across all devices. The design includes smooth animations, professional image viewing controls, and a toast notification system for contextual feedback.

The backend infrastructure is built with **enterprise-grade security**. A Node.js/Express server ensures all sensitive API keys are protected. The system includes features like rate limiting, CORS protection, and comprehensive input validation to prevent abuse and ensure data integrity.

---

## Technical Architecture & Setup

### Architecture

The application is built with a simple but robust architecture. The **frontend** is powered by pure web technologies (HTML5, CSS3, Vanilla JavaScript) and integrates with Firebase for authentication. The **backend** is a Node.js/Express RESTful API that handles AI processing and serves as a secure gateway for all sensitive operations.

### Setup Instructions

To run the project, you need Node.js, a Google Gemini API key, and a Firebase project. After cloning the repository, you'll install the backend dependencies and configure a `.env` file with your API and Firebase keys. The backend server runs on `http://localhost:3001`. The frontend can then be served with any simple HTTP server (like Python's `http.server`) and accessed in a web browser.

```bash
# to deploy (reminder)
vercel --prod
```
---

## Usage Guide & API

### Usage

After creating and verifying an account, users can upload an image, provide instructions, and initiate the processing. The app provides real-time status updates and allows users to access their processing history. An optional debug mode is available to view the AI prompts and processing steps for full transparency.

### API Endpoints

The core functionality is exposed via a secure API that requires a Firebase authentication token. Key endpoints include:

-   `POST /api/process-image`: The main endpoint for uploading an image and processing it with custom instructions.
-   `GET /api/health`: A simple health check to ensure the server is running.
-   `POST /api/translate-text` and `POST /api/enhance-prompt`: Internal endpoints used by the application for text translation and prompt enhancement, respectively.