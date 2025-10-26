# Pondemand

> Transform any content into engaging, AI-powered podcast conversations

Pondemand is an AI-powered platform that converts articles, PDFs, documents, and URLs into dynamic, conversational podcast episodes. Upload your sources, customize the conversation style and voices, and get instant audio content perfect for on-the-go listening.

## 🎯 Features

- **Multi-Source Input**: Upload PDFs, paste URLs, Google Docs/Slides, YouTube links, or raw text
- **AI-Powered Conversations**: Generate natural dialogue between AI hosts using state-of-the-art language models
- **Voice Customization**: Choose from preset voices or clone custom voices for a personalized touch
- **Flexible Controls**: Adjust conversation length, style (educational, entertaining, debate), and depth
- **Interactive Transcripts**: Follow along with timestamped transcripts synced to audio playback
- **Share & Export**: Download episodes or share them via email and social media
- **User Library**: Save and organize your generated podcasts
- **Google OAuth**: Secure authentication with Google Sign-In
- **Credit System**: Daily credits for free users, with premium options available

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 (React 18)
- **UI Library**: Material-UI (MUI) with custom theming
- **Styling**: Tailwind CSS + CSS Modules
- **Authentication**: Google OAuth 2.0
- **State Management**: React Hooks
- **Audio Playback**: Custom audio player components

### Backend
- **Framework**: Flask (Python)
- **Database**: Firebase Firestore
- **Storage**: AWS S3 for audio files
- **Task Queue**: Celery with Redis broker
- **AI/ML APIs**:
  - Google Gemini for content analysis and script generation
  - ElevenLabs for text-to-speech and voice cloning
  - Perplexity (Sonar) for research and fact-checking
- **Web Scraping**: BeautifulSoup4, Newspaper3k, Trafilatura
- **PDF Processing**: PyPDF2

## 📁 Project Structure

```
newsaggregator/
├── app/                          # Next.js frontend
│   ├── components/               # Reusable React components
│   │   ├── Nav.js               # Navigation bar with auth
│   │   ├── TodoApp.js           # Main podcast generation interface
│   │   ├── MediaPlayer.js       # Audio playback component
│   │   ├── MediaClips.js        # Podcast library view
│   │   └── ...
│   ├── byyou/                   # User's custom podcasts page
│   ├── library/                 # Saved podcasts page
│   ├── feedback/                # Landing/marketing page
│   ├── settings/                # User settings page
│   ├── shared/                  # Publicly shared podcasts
│   ├── styles/                  # CSS modules and global styles
│   └── layout.js                # Root layout
│
├── flask-backend/               # Flask backend
│   ├── app.py                   # Main Flask application & API routes
│   ├── ondemand.py             # Podcast generation from topics/articles
│   ├── ondemandfromfile.py     # Podcast generation from files
│   ├── tasks.py                 # Celery async task workers
│   ├── audio.py                 # ElevenLabs audio generation
│   ├── gensummary.py           # Content summarization
│   ├── gentitle.py             # Title generation
│   ├── scrape.py               # Web scraping utilities
│   ├── getvoiceids.py          # Voice management for ElevenLabs
│   ├── requirements.txt         # Python dependencies
│   └── Procfile                # Deployment configuration
│
├── .env                         # Environment variables (not in repo)
└── package.json                 # Node.js dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Redis (for Celery task queue)
- Firebase project with Firestore enabled
- AWS S3 bucket
- API keys for:
  - Google Cloud (Gemini API, OAuth)
  - ElevenLabs
  - Perplexity (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Pondemand.git
   cd Pondemand
   ```

2. **Frontend Setup**
   ```bash
   # Install dependencies
   npm install

   # Create environment file
   cp .env.example .env
   
   # Add your Google Client ID to .env
   # NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

3. **Backend Setup**
   ```bash
   cd flask-backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

4. **Environment Variables**

   Set these environment variables in your deployment environment or create a `.env` file in `flask-backend/`:

   ```bash
   # AI/ML APIs
   GEMINI_API_KEY=your-gemini-api-key
   ELEVEN_API_KEY=your-elevenlabs-api-key
   SONAR_API_KEY=your-perplexity-api-key

   # AWS
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   S3_BUCKET_NAME=your-s3-bucket-name

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_PROJECT_ID=your-google-project-id

   # Firebase
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-service-account.json

   # Flask
   SECRET_KEY=your-flask-secret-key
   
   # Celery/Redis
   REDIS_BROKER_URL=redis://localhost:6379/0
   REDIS_BACKEND_URL=redis://localhost:6379/0
   ```

5. **Firebase Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Download service account credentials JSON file
   - Set `GOOGLE_APPLICATION_CREDENTIALS` to point to this file

6. **Run the Application**

   ```bash
   # Terminal 1: Start Redis (if running locally)
   redis-server

   # Terminal 2: Start Celery worker
   cd flask-backend
   celery -A tasks.app worker --loglevel=info

   # Terminal 3: Start Flask backend
   cd flask-backend
   python app.py

   # Terminal 4: Start Next.js frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔑 API Endpoints

### Authentication
- `POST /googleauth` - Google OAuth callback
- `GET /check_session` - Verify user session
- `POST /logout` - Log out user

### Podcast Generation
- `POST /add_todo` - Generate podcast from topic/article
- `POST /add_todo_file` - Generate podcast from uploaded PDF
- `GET /get_task_status/<task_id>` - Check generation progress

### User Content
- `GET /get_user_audio_files/<userId>` - Get user's podcasts
- `GET /get_user_audio_file/<id>/<userId>` - Get specific podcast
- `GET /custom/<filename>` - Get presigned S3 URL for audio

### Library Management
- `POST /mark_as_listened/<id>` - Mark podcast as listened
- `POST /add_audio_to_share` - Share podcast publicly
- `GET /check_credits/<userId>` - Check user's remaining credits

## 🎨 Key Components

### Frontend
- **TodoApp**: Main interface for creating podcasts with customization options
- **MediaClips**: Library view with filtering and playback
- **MediaPlayer**: Custom audio player with transcript sync
- **Nav**: Navigation with authentication and credit display

### Backend
- **ondemandworker**: Async Celery task for podcast generation
- **on_demand()**: Core logic for AI conversation generation
- **Voice Management**: ElevenLabs API integration with custom voice support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini for advanced language understanding
- ElevenLabs for high-quality text-to-speech
- Perplexity for research capabilities
- Firebase for seamless backend infrastructure
- The open-source community for amazing tools and libraries

## 📧 Contact

For questions, feedback, or support, please reach out:
- Email: prathik@pondemand.ai, rishi@pondemand.ai
- Website: https://pondemand.ai

---

Made with ❤️ by the Pondemand team
