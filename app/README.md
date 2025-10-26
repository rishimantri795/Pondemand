# Pondemand

Pondemand is a web application that allows users to discover and create on-demand audio news content. It combines the power of AI-generated summaries with text-to-speech technology to provide an engaging audio news experience.

## Features

- Discover curated news articles converted to audio format
- Create custom audio news content by entering topics of interest
- User authentication with Google Sign-In
- Personalized "By You" section for user-generated content
- Audio playback with progress tracking
- Like and share functionality for news items

## Technologies Used

- Frontend:
  - Next.js
  - React
  - Material-UI
  - @react-oauth/google for Google authentication
- Backend:
  - Flask
  - Firebase (Firestore)
  - AWS S3 for audio file storage
  - Google Cloud APIs (Text-to-Speech, OAuth)
- APIs:
  - News APIs for content aggregation
  - OpenAI API for text summarization

## Getting Started

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up environment variables for API keys and credentials
4. Run the Flask backend server
5. Run the Next.js frontend development server
6. Access the application in your web browser

## Project Structure

- `app/`: Next.js frontend application
  - `components/`: Reusable React components
  - `styles/`: CSS modules and global styles
  - `main/`: Main page for discovering news
  - `byyou/`: Personal page for user-generated content
- `flask-backend/`: Flask backend application
  - `app.py`: Main Flask application file
  - `ondemand.py`: Logic for generating on-demand content

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
