# VideoDQ - Islamic Educational Video Platform

A full-stack video application for Islamic MP4 videos of lectures with dark/light mode support, featuring a centralized backend and multiple frontend platforms.

## Architecture

- **Backend**: Node.js/Express API with MongoDB
- **Mobile**: React Native (iOS/Android) with Expo
- **Web**: Next.js frontend
- **State Management**: React Query for API state management
- **Features**:
  - Video grid with thumbnails
  - Bottom tab navigation (mobile)
  - Sidebar navigation (web)
  - Custom video player controls
  - Dark/Light mode support

## Project Structure

```
videodq/
├── backend/          # Node.js/Express API
├── mobile/           # React Native Expo app
└── web/              # Next.js web app
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+ (running locally or connection string)
- Expo CLI (for mobile development)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start MongoDB (if running locally)
# mongod

# Start the server
npm run dev
```

The backend API will run on `http://localhost:5000`

**Environment Variables** (backend/.env):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/videodq
```

### 2. Mobile App Setup

```bash
cd mobile

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on specific platform
npm run android  # For Android
npm run ios      # For iOS (macOS only)
npm run web      # For web preview
```

**Environment Variables** (mobile/.env):
```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

**Note**: For testing on physical devices, update the API URL to your computer's local IP address.

### 3. Web App Setup

```bash
cd web

# Copy environment file
cp .env.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

The web app will run on `http://localhost:3000`

**Environment Variables** (web/.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Endpoints

### Videos

- `GET /api/videos` - Get all videos (supports query params: category, search, limit, skip)
- `GET /api/videos/:id` - Get video by ID
- `POST /api/videos` - Create new video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `GET /api/videos/meta/categories` - Get all categories

### Health Check

- `GET /api/health` - API health check

## Features

### Backend Features
- RESTful API with Express
- MongoDB database with Mongoose ODM
- CORS enabled for cross-origin requests
- Video CRUD operations
- Category management
- View counting
- Search and filtering

### Mobile App Features
- Cross-platform (iOS/Android) with React Native
- Bottom tab navigation
- Video grid with thumbnails
- Custom video player with controls
- Dark/Light mode toggle
- Pull-to-refresh
- Responsive design

### Web App Features
- Server-side rendering with Next.js
- Responsive sidebar navigation
- Video grid layout
- Custom video player
- Dark/Light mode toggle
- SEO optimized
- Fast page transitions

## Data Model

### Video Schema

```javascript
{
  title: String (required),
  description: String,
  url: String (required),
  thumbnail: String,
  duration: Number,
  speaker: String,
  category: String,
  tags: [String],
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Mobile Development
```bash
cd mobile
npm start    # Start Expo dev server
```

### Web Development
```bash
cd web
npm run dev  # Start Next.js dev server
```

## Building for Production

### Backend
```bash
cd backend
npm start
```

### Mobile
```bash
cd mobile
npx expo build:android  # Build Android APK
npx expo build:ios      # Build iOS (requires macOS)
```

### Web
```bash
cd web
npm run build
npm start
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Middleware**: CORS, dotenv

### Mobile
- **Framework**: React Native
- **Platform**: Expo
- **Navigation**: React Navigation
- **State Management**: TanStack React Query
- **Video**: expo-av
- **UI**: React Native components

### Web
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query
- **Video**: HTML5 Video API

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue in the GitHub repository.