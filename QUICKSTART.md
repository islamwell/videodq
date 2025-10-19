# Quick Start Guide - VideoDQ

Get the VideoDQ platform running in under 10 minutes!

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18 or higher installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MongoDB installed and running
- [ ] A terminal/command prompt
- [ ] A code editor (optional, for viewing code)

## 5-Minute Quick Start

### Step 1: Clone and Setup (1 minute)

```bash
# Clone the repository
git clone https://github.com/islamwell/videodq.git
cd videodq

# Set up environment files
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env
cp web/.env.example web/.env.local
```

### Step 2: Start Backend (2 minutes)

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run seed    # Load sample videos
npm run dev
```

✅ Backend running at `http://localhost:5000`

### Step 3: Start Web App (1 minute)

```bash
# Terminal 2 - Web
cd web
npm install
npm run dev
```

✅ Web app running at `http://localhost:3000`

### Step 4: Start Mobile App (1 minute)

```bash
# Terminal 3 - Mobile
cd mobile
npm install
npm start
```

Press `w` to open in web browser or scan QR code with Expo Go app.

✅ Mobile app running!

## Testing the Application

### Backend API Test

```bash
# Health check
curl http://localhost:5000/api/health

# Get videos
curl http://localhost:5000/api/videos
```

Expected response:
```json
{
  "success": true,
  "data": [...],
  "total": 6,
  "limit": 50,
  "skip": 0
}
```

### Web App Test

1. Open `http://localhost:3000` in your browser
2. You should see a grid of 6 sample videos
3. Click on any video to view it
4. Try the dark/light mode toggle in the sidebar

### Mobile App Test

1. Press `w` in the terminal where you ran `npm start`
2. Or scan the QR code with Expo Go app on your phone
3. Navigate through the app using bottom tabs
4. Play a video to test the player
5. Toggle dark/light mode in Settings

## Sample Data

The seed script creates 6 sample videos with these categories:
- Islamic Studies
- Seerah
- Quran
- Ethics
- Fiqh
- History

## Common Issues & Solutions

### Issue: MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```bash
# Start MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
# Or run directly: mongod
```

### Issue: Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Change port in backend/.env
PORT=5001

# Or kill the process using the port
lsof -ti:5000 | xargs kill
```

### Issue: Mobile App Can't Connect to API

**Error:** Network request failed

**Solution:**

For testing on physical device, update `mobile/.env`:
```bash
# Replace YOUR_IP with your computer's local IP
EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api

# To find your IP:
# macOS/Linux: ifconfig | grep "inet "
# Windows: ipconfig
```

### Issue: Web Build Fails

**Solution:**
```bash
cd web
rm -rf .next node_modules
npm install
npm run build
```

## Next Steps

Now that you have the app running:

1. **Explore the Code:**
   - `backend/src/` - API endpoints and database models
   - `web/app/` - Next.js pages and components
   - `mobile/src/` - React Native screens and components

2. **Add Your Own Videos:**
   ```bash
   curl -X POST http://localhost:5000/api/videos \
     -H "Content-Type: application/json" \
     -d '{
       "title": "My Islamic Lecture",
       "url": "https://your-video-url.mp4",
       "speaker": "Sheikh Name",
       "category": "Category"
     }'
   ```

3. **Read the Documentation:**
   - [README.md](README.md) - Full overview
   - [API.md](API.md) - API documentation
   - [TESTING.md](TESTING.md) - Testing & deployment
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design
   - [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute

4. **Customize the App:**
   - Change colors in theme contexts
   - Add new features (search, playlists, etc.)
   - Deploy to production

## Production Deployment

When ready to deploy:

1. **Backend:** Deploy to Heroku, AWS, or DigitalOcean
2. **Web:** Deploy to Vercel (recommended) or Netlify
3. **Mobile:** Build with Expo and publish to App Store/Play Store

See [TESTING.md](TESTING.md) for detailed deployment instructions.

## Getting Help

- Check [TESTING.md](TESTING.md) for troubleshooting
- Review [API.md](API.md) for API usage
- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
- Open an issue on GitHub for bugs or questions

## What You've Built

✅ A complete video platform with:
- RESTful API backend
- Responsive web application
- Cross-platform mobile app
- Dark/Light mode support
- Video playback with custom controls
- Sample Islamic educational content

**Happy coding! 🎉**
