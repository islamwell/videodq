# VideoDQ - Testing and Deployment Guide

## Quick Start Testing (Local Development)

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally on default port 27017
- Terminal/Command prompt

### Step 1: Start MongoDB
```bash
# If MongoDB is installed as a service:
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS

# Or run MongoDB directly:
mongod --dbpath /path/to/your/data/directory
```

### Step 2: Start the Backend API

```bash
# Navigate to backend directory
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies (first time only)
npm install

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

The backend will be running at `http://localhost:5000`

**Test the API:**
```bash
# Health check
curl http://localhost:5000/api/health

# Get all videos
curl http://localhost:5000/api/videos

# Get specific video (replace ID)
curl http://localhost:5000/api/videos/VIDEO_ID_HERE
```

### Step 3: Start the Web Application

**Open a new terminal window:**

```bash
# Navigate to web directory
cd web

# Copy environment file
cp .env.example .env.local

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The web app will be running at `http://localhost:3000`

**Test in browser:**
- Open http://localhost:3000
- You should see the video grid
- Click on a video to view details
- Toggle dark/light mode using the button in the sidebar

### Step 4: Start the Mobile Application

**Open a new terminal window:**

```bash
# Navigate to mobile directory
cd mobile

# Copy environment file
cp .env.example .env

# IMPORTANT: Update the API URL in .env for testing on devices
# For iOS Simulator/Android Emulator: http://localhost:5000/api (works)
# For Physical Device: http://YOUR_COMPUTER_IP:5000/api (e.g., http://192.168.1.100:5000/api)

# Install dependencies (first time only)
npm install

# Start Expo development server
npm start
```

**Test the mobile app:**

1. **Using Web Browser:**
   - Press `w` in the terminal or click "Run in web browser"
   - The app will open at http://localhost:19006

2. **Using iOS Simulator (macOS only):**
   - Press `i` in the terminal or click "Run on iOS simulator"
   - Install Xcode if not already installed

3. **Using Android Emulator:**
   - Press `a` in the terminal or click "Run on Android device/emulator"
   - Make sure Android Studio and an emulator are set up

4. **Using Physical Device:**
   - Install "Expo Go" app from App Store (iOS) or Google Play (Android)
   - Scan the QR code shown in the terminal
   - Make sure your device is on the same network as your computer
   - Update the API URL in mobile/.env to use your computer's local IP

## Testing Checklist

### Backend API Tests
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] GET /api/videos returns list of videos
- [ ] GET /api/videos/:id returns single video
- [ ] POST /api/videos creates new video
- [ ] PUT /api/videos/:id updates video
- [ ] DELETE /api/videos/:id deletes video
- [ ] GET /api/videos/meta/categories returns categories

### Web Application Tests
- [ ] Home page loads and displays video grid
- [ ] Videos are displayed with thumbnails, titles, and metadata
- [ ] Clicking a video navigates to detail page
- [ ] Video player loads and controls work
- [ ] Dark/Light mode toggle works
- [ ] Sidebar navigation is functional
- [ ] Responsive design works on different screen sizes

### Mobile Application Tests
- [ ] App launches successfully
- [ ] Home tab shows video grid
- [ ] Videos display with thumbnails and metadata
- [ ] Tapping a video opens detail screen
- [ ] Video player works with custom controls
- [ ] Bottom tab navigation works
- [ ] Settings screen displays
- [ ] Dark/Light mode toggle works
- [ ] Pull-to-refresh works on video list

## Production Deployment

### Backend Deployment

**Option 1: Traditional Server (VPS/Dedicated)**

1. Set up Node.js and MongoDB on your server
2. Clone the repository
3. Install dependencies: `npm install`
4. Create .env file with production values
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name videodq-api
   pm2 save
   pm2 startup
   ```

**Option 2: Cloud Platforms**

- **Heroku**: Use Heroku MongoDB add-on or MongoDB Atlas
- **AWS**: Deploy on EC2 with RDS/DocumentDB
- **DigitalOcean**: App Platform with managed MongoDB
- **Railway**: Supports Node.js with MongoDB add-on

**Environment Variables for Production:**
```
PORT=5000
MONGODB_URI=mongodb://your-production-mongodb-uri
NODE_ENV=production
```

### Web Application Deployment

**Option 1: Vercel (Recommended for Next.js)**

```bash
cd web
npm install -g vercel
vercel
```

Set environment variable in Vercel dashboard:
- `NEXT_PUBLIC_API_URL=https://your-api-domain.com/api`

**Option 2: Netlify**

```bash
cd web
npm run build
```

Deploy the `.next` folder and set environment variables.

**Option 3: Traditional Server**

```bash
cd web
npm run build
npm start  # Runs on port 3000
```

Use nginx as reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Mobile Application Deployment

**iOS (Requires macOS and Apple Developer Account)**

1. Build for iOS:
   ```bash
   cd mobile
   npx expo build:ios
   ```

2. Follow Expo's prompts to configure your Apple credentials
3. Wait for build to complete
4. Download the IPA file
5. Submit to App Store using Xcode or Transporter

**Android**

1. Build for Android:
   ```bash
   cd mobile
   npx expo build:android
   ```

2. Choose APK or App Bundle format
3. Wait for build to complete
4. Download the APK/AAB file
5. Submit to Google Play Console

**Alternative: Expo Application Services (EAS)**

EAS is the modern way to build and deploy Expo apps:

```bash
npm install -g eas-cli
eas login
eas build --platform android
eas build --platform ios
```

**Update Mobile App Configuration for Production:**

In `mobile/.env`:
```
EXPO_PUBLIC_API_URL=https://your-production-api.com/api
```

## Environment Configuration

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/videodq
NODE_ENV=development
```

### Web (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify firewall/network settings

**Port Already in Use:**
- Change PORT in .env
- Or kill process using port 5000: `lsof -ti:5000 | xargs kill`

### Web App Issues

**API Connection Error:**
- Verify backend is running
- Check NEXT_PUBLIC_API_URL in .env.local
- Check CORS settings in backend

**Build Errors:**
- Clear .next folder: `rm -rf .next`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Mobile App Issues

**Cannot Connect to API:**
- For physical devices, use your computer's IP address
- Ensure both device and computer are on same network
- Check firewall settings

**Expo Won't Start:**
- Clear Expo cache: `npx expo start -c`
- Check if port 19000/19006 is available

**Metro Bundler Errors:**
- Clear watchman: `watchman watch-del-all` (if watchman is installed)
- Clear node_modules: `rm -rf node_modules && npm install`

## Performance Optimization

### Backend
- Enable MongoDB indexing on frequently queried fields
- Implement caching (Redis) for frequent requests
- Use compression middleware
- Implement rate limiting

### Web
- Enable Next.js Image Optimization
- Implement lazy loading for videos
- Use CDN for video content
- Enable gzip compression

### Mobile
- Optimize images and thumbnails
- Implement pagination for video lists
- Use FlatList optimization props
- Cache API responses

## Security Considerations

1. **API Security:**
   - Implement authentication/authorization
   - Use HTTPS in production
   - Validate and sanitize all inputs
   - Implement rate limiting

2. **Database Security:**
   - Use strong MongoDB credentials
   - Enable MongoDB authentication
   - Regularly backup database
   - Keep MongoDB updated

3. **Environment Variables:**
   - Never commit .env files
   - Use different credentials for production
   - Rotate secrets regularly

## Monitoring

- Use PM2 for backend process monitoring
- Implement logging (Winston, Bunyan)
- Set up error tracking (Sentry)
- Monitor API performance (New Relic, DataDog)
- Track user analytics (Google Analytics, Mixpanel)

## Backup and Recovery

1. **Database Backups:**
   ```bash
   mongodump --uri="mongodb://localhost:27017/videodq" --out=/backup/path
   ```

2. **Restore Database:**
   ```bash
   mongorestore --uri="mongodb://localhost:27017/videodq" /backup/path/videodq
   ```

3. Schedule regular automated backups using cron jobs or cloud backup solutions.
