# 🚀 Complete Vercel Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:
- A Vercel account (sign up at https://vercel.com)
- Git repository (push your code to GitHub/GitLab/Bitbucket)
- Your API keys and tokens ready

## 🔧 Environment Variables Setup

### Required Environment Variables:

Add these in your Vercel dashboard under **Settings > Environment Variables**:

```bash
# Google Gemini AI API
GEMINI_API_KEY=AIzaSyDJdVlgW1DhjToCRpy9pAQQINJO6e9S4zA

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=7967015500:AAFZpy-cxWsx2A_AKUOyxEuaw42mtz5WvbI
TELEGRAM_GROUP_CHAT_ID=-1002509876545

# Optional Settings
TELEGRAM_NOTIFY_LOGIN=true
NODE_ENV=production
```

⚠️ **SECURITY WARNING**: Replace the example values above with your actual API keys!

## 🎯 Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to Git Repository**:
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push origin main
   ```

2. **Import Project**:
   - Go to https://vercel.com/dashboard
   - Click "Add New" > "Project"
   - Import your repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables**:
   - In the import screen, add your environment variables
   - Or add them later in Settings > Environment Variables

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Add Environment Variables** (if not added via dashboard):
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add TELEGRAM_BOT_TOKEN
   vercel env add TELEGRAM_GROUP_CHAT_ID
   ```

5. **Redeploy with Environment Variables**:
   ```bash
   vercel --prod
   ```

## ⚙️ Project Structure for Vercel

```
project-root/
├── vercel.json              # Vercel configuration
├── package.json             # Frontend dependencies & build script
├── vite.config.ts          # Vite configuration
├── dist/                   # Built frontend (auto-generated)
├── server/
│   ├── server.js           # Main server (modified for Vercel)
│   ├── index.js            # Vercel entry point
│   ├── package.json        # Server dependencies
│   └── public/             # Static assets
└── components/             # React components
```

## 🔍 Vercel Configuration Explained

### vercel.json Features:
- **Frontend**: Static build from React/Vite
- **Backend**: Node.js serverless functions
- **Routing**: All API calls routed to server
- **Static Files**: Served directly

### Key Routes:
- `/api/*` → Server API endpoints
- `/api-proxy/*` → Gemini API proxy
- `/public/*` → Static assets
- `/service-worker.js` → Service worker
- `/*` → React app (catch-all)

## 🚨 Important Limitations

1. **WebSocket Support**: 
   - Vercel has limited WebSocket support
   - Real-time features may be affected
   - Consider using Server-Sent Events (SSE) for real-time updates

2. **Function Timeout**: 
   - Max 30 seconds per function execution
   - Configured in vercel.json

3. **Cold Starts**: 
   - Serverless functions may have cold start delays
   - First request might be slower

## 🎯 Post-Deployment Steps

1. **Test All Features**:
   - Frontend loading
   - Telegram authentication
   - Receipt generation
   - File downloads
   - API proxy functionality

2. **Update Telegram Bot Settings** (if needed):
   - Update webhook URLs if using webhooks
   - Test bot commands

3. **Monitor Performance**:
   - Check Vercel Analytics
   - Monitor function logs
   - Watch for errors in dashboard

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**:
   ```bash
   # Check build locally first
   npm run build
   ```

2. **Environment Variable Issues**:
   - Ensure all required variables are set
   - Check variable names match exactly
   - Redeploy after adding variables

3. **API Proxy Not Working**:
   - Verify GEMINI_API_KEY is set correctly
   - Check function logs in Vercel dashboard

4. **Static Files 404**:
   - Ensure dist/ folder is built correctly
   - Check vercel.json routing configuration

### Debugging Commands:

```bash
# View deployment logs
vercel logs <deployment-url>

# Check project status
vercel ls

# Remove project (if needed)
vercel remove <project-name>
```

## 🔐 Security Best Practices

1. **Environment Variables**:
   - Never commit .env files
   - Use Vercel's environment variable system
   - Rotate API keys regularly

2. **CORS Configuration**:
   - Update CORS settings if needed
   - Restrict to your domain in production

3. **Rate Limiting**:
   - Configured for 100 requests per 15 minutes
   - Adjust based on your needs

## 📊 Monitoring & Analytics

- **Vercel Analytics**: Automatic performance monitoring
- **Function Logs**: Available in Vercel dashboard
- **Error Tracking**: Built-in error reporting
- **Usage Metrics**: Track API calls and performance

## 🔄 Continuous Deployment

Once connected to Git:
- Automatic deployments on push to main branch
- Preview deployments for pull requests
- Rollback capabilities
- Branch-based deployments

---

## 📞 Support

If you encounter issues:
1. Check the Vercel dashboard logs
2. Review this guide
3. Check Vercel documentation
4. Contact support if needed

Your KIIT Tuition Receipt Generator is now ready for production! 🎉