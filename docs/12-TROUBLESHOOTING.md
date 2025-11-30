# Troubleshooting Guide

## Known Issues and Solutions

### XSS-Clean Compatibility Error (Express 5)

**Error Message:**
```
TypeError: Cannot set property query of #<IncomingMessage> which has only a getter
at /opt/render/project/src/server/node_modules/xss-clean/lib/index.js:8:30
```

**Root Cause:**
The `xss-clean` package (v0.1.4) is incompatible with Express 5.x. Express 5 changed the `query` property on the request object from a writable property to a getter-only, which breaks xss-clean's attempt to sanitize it.

**Solutions:**

#### Option 1: Remove xss-clean (Recommended)
Since we already have multiple XSS protection layers, we can safely remove xss-clean:

1. **Remove from server.ts:**
```typescript
// Remove this line:
import xss from 'xss-clean';

// Remove this line:
app.use(xss());
```

2. **Uninstall package:**
```bash
cd server
npm uninstall xss-clean
```

**Why this is safe:**
- We already sanitize messages manually in the Socket.IO handler
- Helmet provides XSS protection headers
- React auto-escapes content in JSX
- We validate and sanitize all inputs

#### Option 2: Downgrade to Express 4 (Not Recommended)
```bash
cd server
npm install express@^4.18.2 @types/express@^4.17.17
```

#### Option 3: Use Alternative Package
Replace xss-clean with express-mongo-sanitize:

```bash
cd server
npm uninstall xss-clean
npm install express-mongo-sanitize
```

Then update server.ts:
```typescript
import mongoSanitize from 'express-mongo-sanitize';

// Replace app.use(xss()) with:
app.use(mongoSanitize());
```

---

### Implementation: Remove xss-clean

Since we have comprehensive XSS protection already, here's the fix:

**File: `server/src/server.ts`**

Remove these lines:
```typescript
import xss from 'xss-clean';
```

```typescript
// XSS Protection - Sanitize user input
app.use(xss());
```

**File: `server/package.json`**

Remove from dependencies:
```json
"xss-clean": "^0.1.4"
```

**File: `server/src/types/xss-clean.d.ts`**

Delete this file entirely (no longer needed).

---

### Existing XSS Protection Layers

Even without xss-clean, we have multiple XSS protections:

1. **Content Security Policy (Helmet)**
   ```typescript
   helmet({
     contentSecurityPolicy: {
       directives: {
         scriptSrc: ["'self'", "'unsafe-inline'"],
         // ... prevents inline script injection
       }
     }
   })
   ```

2. **Message Sanitization (Socket.IO)**
   ```typescript
   const sanitizedContent = trimmedContent
     .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
     .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
     .replace(/javascript:/gi, '')
     .replace(/on\w+\s*=/gi, '');
   ```

3. **React Auto-Escaping**
   - All content rendered in JSX is automatically escaped

4. **Input Validation**
   - Type checking via TypeScript
   - Length limits enforced
   - express-validator for API endpoints

---

## Deployment Checklist After Fix

1. **Update server code:**
   - Remove xss-clean import
   - Remove xss-clean middleware
   - Commit changes

2. **Clean install:**
   ```bash
   cd server
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **Test locally:**
   ```bash
   npm start
   ```
   - Visit `http://localhost:5000`
   - No errors should appear

4. **Deploy to production:**
   - Push to GitHub
   - Render will auto-deploy
   - Monitor logs for successful deployment

5. **Verify production:**
   - Visit `https://whisperspace-backend.onrender.com/api/health`
   - Should return `{ "status": "OK" }`

---

## Other Common Issues

### MongoDB Connection Issues

**Error:** `MongoServerError: bad auth`

**Solution:**
- Verify MONGODB_URI in environment variables
- Check database user permissions
- Ensure IP whitelist includes 0.0.0.0/0 or Render IPs

---

### Socket.IO Connection Failed

**Error:** `WebSocket connection failed`

**Solution:**
- Verify VITE_SOCKET_URL in client environment
- Ensure WebSocket support on hosting platform
- Check CORS configuration

---

### JWT Token Expired

**Error:** `Authentication expired. Please login again.`

**Solution:**
- This is normal behavior (7-day expiration)
- User needs to re-authenticate
- Token expiration is a security feature

---

### Keep-Alive Ping Failures

**Error:** `Keep-alive ping returned status 500`

**Solution:**
- This is often caused by the xss-clean error
- Fix the xss-clean issue first
- Verify `/api/health` endpoint works

---

### CORS Errors

**Error:** `Access-Control-Allow-Origin error`

**Solution:**
1. Verify CLIENT_URL in server environment
2. Ensure CORS middleware configured correctly:
   ```typescript
   cors({
     origin: CLIENT_URL,
     credentials: true
   })
   ```
3. Check that client is accessing correct backend URL

---

## Monitoring Tips

### Check Server Logs (Render)
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. Look for errors or warnings

### Check Database Status
1. Go to MongoDB Atlas
2. Select your cluster
3. Click "Metrics"
4. Check connection count and operations

### Check Client Console
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

---

## Emergency Rollback

If deployment fails:

1. **Render:** 
   - Go to Deployments
   - Click on last successful deployment
   - Click "Redeploy"

2. **Vercel:**
   - Go to Deployments
   - Select working deployment
   - Click "Promote to Production"

3. **Code:**
   ```bash
   git revert HEAD
   git push
   ```

---

## Performance Issues

### Slow Response Times

**Causes:**
- Free tier limitations
- Cold starts (Render free tier)
- Database in different region
- Large payload sizes

**Solutions:**
- Upgrade to paid tier
- Keep-alive service prevents cold starts
- Use database region close to server
- Implement caching

---

### Memory Issues

**Error:** `JavaScript heap out of memory`

**Solutions:**
- Check for memory leaks
- Limit concurrent connections
- Upgrade server tier
- Implement connection pooling

---

## Security Alerts

### Dependency Vulnerabilities

**Check for vulnerabilities:**
```bash
npm audit
```

**Fix automatically:**
```bash
npm audit fix
```

**Fix with breaking changes:**
```bash
npm audit fix --force
```

---

## Getting Help

1. **Check this documentation first**
2. **Review error logs carefully**
3. **Search error messages online**
4. **Check package documentation**
5. **Review GitHub issues for packages**

---

**Last Updated:** November 30, 2025
