# Deployment Guide

## Overview

WhisperSpace is deployed using a multi-platform architecture:
- **Frontend**: Vercel (Static site hosting)
- **Backend**: Render or Railway (Node.js hosting)
- **Database**: MongoDB Atlas (Cloud database)

## Environment Variables

### Client Environment Variables

**Location**: `client/.env`

**Variables**:
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

**Purpose**:
- `VITE_API_URL`: Backend REST API base URL
- `VITE_SOCKET_URL`: Backend WebSocket server URL

**Note**: Vite requires `VITE_` prefix for environment variables to be exposed to client.

**Defaults**: If not set, uses production backend URL from `utils/constants.ts`

### Server Environment Variables

**Location**: `server/.env`

**Required Variables**:
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whisperspace?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-256-bits
SESSION_SECRET=your-super-secret-session-key-min-256-bits

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback

# Client URL
CLIENT_URL=https://your-frontend.vercel.app

# Optional: Server URL for keep-alive
SERVER_URL=https://your-backend.onrender.com
```

**Security Notes**:
- Never commit `.env` file to version control
- Use strong, random secrets (256-bit minimum)
- Different secrets for each environment
- Rotate secrets periodically

**Secret Generation**:
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## MongoDB Atlas Setup

### 1. Create Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Verify email address

### 2. Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select cloud provider (AWS, Google Cloud, Azure)
4. Choose region (closest to your users)
5. Name cluster (e.g., "WhisperSpace")
6. Click "Create Cluster"

### 3. Configure Database Access
1. Navigate to "Database Access"
2. Click "Add New Database User"
3. Choose authentication method: "Password"
4. Username: `whisperspace_admin`
5. Generate secure password
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 4. Configure Network Access
1. Navigate to "Network Access"
2. Click "Add IP Address"
3. Option 1: "Allow Access from Anywhere" (0.0.0.0/0)
   - Easiest for cloud hosting
   - Less secure
4. Option 2: Add specific IP addresses
   - Get your hosting platform's outbound IPs
   - More secure
5. Click "Confirm"

### 5. Get Connection String
1. Navigate to "Database"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: "Node.js", Version: "4.1 or later"
5. Copy connection string
6. Replace `<password>` with database user password
7. Replace `<dbname>` with `whisperspace`

**Example**:
```
mongodb+srv://whisperspace_admin:your-password@cluster0.abcde.mongodb.net/whisperspace?retryWrites=true&w=majority
```

## Google OAuth Setup

### 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Project name: "WhisperSpace"
4. Click "Create"

### 2. Enable Google+ API
1. Navigate to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

### 3. Configure OAuth Consent Screen
1. Navigate to "APIs & Services" → "OAuth consent screen"
2. User Type: "External"
3. Click "Create"
4. Fill in required fields:
   - App name: "WhisperSpace"
   - User support email: your email
   - Developer contact email: your email
5. Scopes: Add "email" and "profile"
6. Test users: Add your email for testing
7. Click "Save and Continue"

### 4. Create OAuth Credentials
1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "WhisperSpace Production"
5. Authorized JavaScript origins:
   - `https://your-frontend.vercel.app`
6. Authorized redirect URIs:
   - `https://your-backend.onrender.com/api/auth/google/callback`
7. Click "Create"
8. Copy Client ID and Client Secret

### 5. Update Environment Variables
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback
```

## Backend Deployment (Render)

### Prerequisites
- GitHub account
- Render account (free tier available)
- Code pushed to GitHub repository

### 1. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 2. Create Web Service
1. Click "New +" → "Web Service"
2. Connect to GitHub repository
3. Select "WhisperSpace" repository
4. Configure service:
   - **Name**: whisperspace-backend
   - **Region**: Choose closest to users
   - **Branch**: main
   - **Root Directory**: server
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. Add Environment Variables
1. Scroll to "Environment Variables"
2. Add all required variables from `.env`
3. Click "Add Environment Variable" for each
4. Values are encrypted and secure

### 4. Deploy
1. Click "Create Web Service"
2. Render will:
   - Clone repository
   - Install dependencies
   - Run build command
   - Start server
3. Monitor deployment logs
4. Service URL: `https://whisperspace-backend.onrender.com`

### 5. Configure Keep-Alive (Free Tier)
Free tier sleeps after 15 minutes of inactivity.

**Solution**: Keep-alive service already implemented in code.

**Configuration**:
```env
NODE_ENV=production
SERVER_URL=https://whisperspace-backend.onrender.com
```

**How it works**:
- Pings `/api/health` every 14 minutes
- Prevents server from sleeping
- Only runs in production

### Alternative: Railway

**Steps**:
1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select repository
5. Configure:
   - **Root Directory**: /server
   - Add environment variables
6. Deploy automatically

**Advantage**: No sleep on free tier (for limited time)

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Code pushed to GitHub repository

### 1. Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access repositories

### 2. Import Project
1. Click "Add New..." → "Project"
2. Import Git Repository
3. Select "WhisperSpace" repository
4. Click "Import"

### 3. Configure Project
1. **Framework Preset**: Vite
2. **Root Directory**: client
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `dist` (auto-detected)
5. **Install Command**: `npm install` (auto-detected)

### 4. Add Environment Variables
1. Scroll to "Environment Variables"
2. Add variables:
   ```
   VITE_API_URL=https://whisperspace-backend.onrender.com
   VITE_SOCKET_URL=https://whisperspace-backend.onrender.com
   ```
3. Available for: Production, Preview, Development

### 5. Deploy
1. Click "Deploy"
2. Vercel will:
   - Clone repository
   - Install dependencies
   - Run build
   - Deploy to CDN
3. Monitor deployment logs
4. Site URL: `https://whisperspace.vercel.app`

### 6. Configure Domain (Optional)
1. Navigate to project settings
2. Click "Domains"
3. Add custom domain
4. Configure DNS records

### 7. Configure Deployment Settings
1. **Auto-Deploy**: Enable for main branch
2. **Preview Deployments**: Enable for pull requests
3. **Production Branch**: main

## Post-Deployment Configuration

### 1. Update OAuth Redirect URIs
1. Go to Google Cloud Console
2. Update OAuth credentials with actual URLs:
   - Origin: `https://your-actual-frontend.vercel.app`
   - Redirect: `https://your-actual-backend.onrender.com/api/auth/google/callback`

### 2. Update Client Environment Variables
Update client `.env` with actual backend URL:
```env
VITE_API_URL=https://whisperspace-backend.onrender.com
VITE_SOCKET_URL=https://whisperspace-backend.onrender.com
```

### 3. Update Server Environment Variables
Update server `.env` with actual client URL:
```env
CLIENT_URL=https://whisperspace.vercel.app
```

### 4. Redeploy
1. Push changes to GitHub
2. Vercel and Render auto-deploy
3. Or trigger manual deploy

## Monitoring and Logging

### Render Logs
1. Navigate to your service
2. Click "Logs" tab
3. View real-time logs
4. Search and filter

### Vercel Logs
1. Navigate to your project
2. Click "Deployments"
3. Select deployment
4. View build and function logs

### MongoDB Logs
1. Navigate to MongoDB Atlas
2. Click on cluster
3. Click "Metrics"
4. View database performance

## Troubleshooting

### Common Issues

**1. Connection Error: Cannot reach backend**
- Check `VITE_API_URL` in client
- Verify backend is running
- Check Render logs for errors

**2. OAuth Error: Redirect URI mismatch**
- Verify Google Cloud Console redirect URIs
- Check `GOOGLE_CALLBACK_URL` in server
- Ensure protocol (https) matches

**3. Database Connection Failed**
- Check MongoDB Atlas network access
- Verify connection string format
- Test connection string locally

**4. CORS Error**
- Check `CLIENT_URL` in server .env
- Verify CORS configuration in `server.ts`
- Ensure protocol matches (http vs https)

**5. WebSocket Connection Failed**
- Check `VITE_SOCKET_URL` in client
- Verify Socket.IO server running
- Check for proxy/firewall issues

**6. Build Failed**
- Check Node.js version compatibility
- Verify all dependencies installed
- Review build logs for errors

### Health Checks

**Backend Health Check**:
```bash
curl https://whisperspace-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "ChatFlow server is running"
}
```

**Database Connection**:
```bash
curl https://whisperspace-backend.onrender.com/
```

Should return server info without database errors.

## CI/CD Pipeline

### Automatic Deployments

**Vercel** (Frontend):
- Trigger: Push to main branch
- Actions: Build → Test → Deploy
- Rollback: Instant rollback to previous deployment

**Render** (Backend):
- Trigger: Push to main branch
- Actions: Build → Deploy
- Zero-downtime deployment

### Manual Deployments

**Vercel**:
1. Navigate to project
2. Click "Deployments"
3. Click "..." on deployment
4. Click "Redeploy"

**Render**:
1. Navigate to service
2. Click "Manual Deploy"
3. Select branch
4. Click "Deploy"

## Backup and Recovery

### Database Backups

**MongoDB Atlas Automatic Backups**:
- Frequency: Continuous
- Retention: 7 days (free tier)
- Location: Same region as cluster

**Manual Backup**:
```bash
mongodump --uri="your-mongodb-uri"
```

**Restore**:
```bash
mongorestore --uri="your-mongodb-uri" dump/
```

### Code Backups

- GitHub repository (version control)
- Vercel deployment history
- Render deployment history

## Performance Optimization

### Client Optimization
- Code splitting enabled (Vite)
- Asset compression
- CDN delivery (Vercel)
- Caching headers

### Server Optimization
- Gzip compression
- Connection pooling
- Rate limiting
- Efficient queries

### Database Optimization
- Indexes on frequently queried fields
- Connection pooling
- Atlas auto-scaling (paid tier)

## Scaling Considerations

### Current Limitations (Free Tier)
- Render: 512MB RAM, shared CPU
- MongoDB: 512MB storage, shared cluster
- Vercel: Unlimited bandwidth, 100GB/month

### Scaling Path
1. **Paid Tiers**: More resources and features
2. **Load Balancer**: Multiple backend instances
3. **Redis**: Session storage and Socket.IO adapter
4. **CDN**: Global content delivery
5. **Database**: Dedicated cluster, replica sets

## Security Checklist

- [ ] All environment variables set
- [ ] Secrets are strong and unique
- [ ] HTTPS enabled everywhere
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Database network access restricted
- [ ] OAuth configured properly
- [ ] No secrets in code repository
- [ ] Dependencies up to date
- [ ] Error messages don't leak info
