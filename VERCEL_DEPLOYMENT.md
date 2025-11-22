# Vercel Deployment Guide for VideoDQ

This guide will help you deploy the VideoDQ Next.js frontend to Vercel.

## 🚀 Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (already done)
   ```powershell
   git status
   # Ensure you're on: claude/complete-survey-app-0111Z5Gnii84wm9xomc1uyhn
   ```

2. **Go to Vercel**
   - Visit: https://vercel.com/new
   - Sign in with GitHub

3. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `islamwell/videodq`
   - Branch: `claude/complete-survey-app-0111Z5Gnii84wm9xomc1uyhn` (or merge to `ai` first)

4. **Configure Project** (Auto-detected)
   - Framework Preset: **Next.js** ✅
   - Root Directory: **`.`** (root)
   - Build Command: `npm run build` ✅
   - Output Directory: `.next` ✅
   - Install Command: `npm install` ✅

5. **Environment Variables** (Important!)
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-url.com
   ```
   Or for development:
   ```
   NEXT_PUBLIC_API_URL = http://localhost:5000
   ```

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your URL: `https://videodq-xxx.vercel.app`

---

### Option 2: Deploy via Vercel CLI

**PowerShell commands:**

```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: [Your account]
# - Link to existing project: No
# - Project name: videodq
# - Directory: ./
# - Override settings: No
```

---

## ⚙️ Configuration Files

The following files have been created for Vercel:

### `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### `.vercelignore`
Ignores:
- `backend/` (separate deployment)
- `mobile/` (separate deployment)
- `android/`, `ios/` (mobile builds)
- `node_modules/`, build artifacts

### `next.config.ts`
Configured with:
- ✅ Standalone output for Vercel
- ✅ Image optimization
- ✅ Service Worker support
- ✅ Security headers
- ✅ Environment variables

---

## 🔧 Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Your backend API URL | Production |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Development |

**Important:** Variables starting with `NEXT_PUBLIC_` are exposed to the browser.

---

## 📱 PWA Features on Vercel

Your app includes PWA capabilities that work on Vercel:

✅ **Service Worker** (`/sw.js`)
- Cached automatically
- Offline support enabled

✅ **Manifest** (`/manifest.json`)
- Install prompts on mobile
- App shortcuts

✅ **Icons**
- 5 icon sizes generated
- Apple touch icon included

**Test PWA:**
1. Visit your Vercel URL on mobile
2. Look for "Add to Home Screen" prompt
3. Test offline by enabling airplane mode

---

## 🏗️ Build Configuration

**Build Command:**
```bash
npm run build
```

**Build Time:**
- ~30-60 seconds (Vercel is fast!)
- Uses Next.js 15 with App Router
- Optimized static generation

**Output:**
- Static pages: Pre-rendered at build time
- API routes: Serverless functions
- Dynamic pages: Server-rendered on demand

---

## 🔍 Troubleshooting

### Issue: "No entrypoint found"

**Solution:** ✅ Fixed!
- Created `vercel.json` with framework config
- Updated `next.config.ts` with standalone output
- Added `.vercelignore` to exclude backend/mobile

### Issue: Build fails with "Module not found"

**Solution:**
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules, .next
npm install
npm run build
```

### Issue: Environment variables not working

**Solution:**
- Ensure variables start with `NEXT_PUBLIC_` for browser access
- Redeploy after adding variables
- Check Vercel Dashboard → Deployments → [deployment] → Environment Variables

### Issue: API routes return 404

**Check:**
1. API routes are in `/app/api/` directory ✅
2. Files are named `route.ts` or `route.js` ✅
3. Routes export GET, POST, etc. functions ✅

### Issue: Service Worker not updating

**Solution:**
```javascript
// In your browser console:
navigator.serviceWorker.getRegistrations().then(regs =>
  regs.forEach(reg => reg.unregister())
);
// Then hard refresh: Ctrl+Shift+R
```

---

## 📊 Performance Optimization

Vercel automatically provides:

✅ **Edge Network**
- Global CDN (190+ locations)
- Automatic HTTPS
- HTTP/2 & HTTP/3

✅ **Image Optimization**
- Automatic WebP conversion
- Responsive images
- Lazy loading

✅ **Caching**
- Static assets cached at edge
- API routes with cache headers
- Service worker for offline

---

## 🔐 Security Headers

Configured in `next.config.ts` and `vercel.json`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` (via Helmet in API routes)

---

## 🚦 Deployment Status

**Check deployment:**
```powershell
# Visit Vercel dashboard
Start-Process "https://vercel.com/dashboard"

# Or check via CLI
vercel ls
```

**View logs:**
```powershell
vercel logs [deployment-url]
```

**Redeploy:**
```powershell
vercel --prod
```

---

## 📱 Backend Deployment (Separate)

The backend (`/backend`) should be deployed separately:

**Options:**
1. **Railway** - https://railway.app
2. **Render** - https://render.com
3. **Heroku** - https://heroku.com
4. **AWS EC2** - For full control
5. **DigitalOcean** - App Platform or Droplet

**Then update environment variable:**
```
NEXT_PUBLIC_API_URL = https://your-backend.railway.app
```

---

## 🎯 Post-Deployment Checklist

After deploying to Vercel:

- [ ] Visit your Vercel URL
- [ ] Test PWA installation on mobile
- [ ] Test service worker (go offline, check cached pages)
- [ ] Verify API routes work
- [ ] Check console for errors
- [ ] Test on different devices
- [ ] Configure custom domain (optional)
- [ ] Set up analytics (Vercel Analytics - free)

---

## 🌐 Custom Domain (Optional)

**Add custom domain:**

1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `videodq.com`
3. Configure DNS records (Vercel provides instructions)
4. Wait for SSL certificate (automatic)

**DNS Configuration:**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 📞 Support

**Vercel Documentation:**
- https://vercel.com/docs
- https://vercel.com/docs/frameworks/nextjs

**VideoDQ Issues:**
- Check build logs in Vercel Dashboard
- Run `npm run build` locally first
- Contact: [Your support channel]

---

## 🎉 Success!

Your VideoDQ app is now live on Vercel with:
- ✅ PWA capabilities
- ✅ Offline support
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Edge functions
- ✅ Image optimization

**Share your deployment:**
```
https://videodq-[your-id].vercel.app
```

---

**Last Updated:** 2025-11-22
**Next.js Version:** 15.5.6
**Vercel Version:** 2
