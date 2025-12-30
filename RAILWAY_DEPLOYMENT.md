# Railway Deployment Guide

Deploy "Survive the Night" multiplayer game to Railway with this step-by-step guide.

## Prerequisites

- [Railway account](https://railway.app) (free tier available)
- GitHub repository with the game code connected to Railway
- Railway CLI (optional): `npm install -g @railway/cli`

## Project Overview

This monorepo deploys as two Railway services:

| Service | Package | Port | Purpose |
|---------|---------|------|---------|
| game-server | `packages/game-server` | 3001 | WebSocket server (Socket.io) |
| website | `packages/website` | 3000 | React Router 7 frontend |

Both services depend on `packages/game-shared` for shared TypeScript types.

## Environment Variables

### Game Server Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `ADMIN_PASSWORD` | Yes | Admin command authentication | `your-secure-password` |
| `PORT` | No | Server port (default: 3001) | `3001` |

### Website Variables

| Variable | Required | Type | Description | Example |
|----------|----------|------|-------------|---------|
| `NODE_ENV` | Yes | Runtime | Environment mode | `production` |
| `VITE_WSS_URL` | Yes | Build-time | WebSocket server URL | `wss://game-server-xxx.railway.app` |
| `VITE_API_BASE_URL` | No | Build-time | REST API base URL | `https://game-server-xxx.railway.app` |
| `PORT` | No | Runtime | Website port (default: 3000) | `3000` |

> **Important:** `VITE_*` variables are injected at build time. Changing them requires a rebuild of the website service.

## Step-by-Step Deployment

### Step 1: Create Railway Project

1. Log in to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your repository
5. Select the survive-the-night repository

### Step 2: Deploy Game Server

1. In your Railway project, click **"New Service"**
2. Select **"GitHub Repo"** → choose your repo
3. Configure the service:

**Settings Tab:**
```
Service Name: game-server
Root Directory: / (leave empty for root)
```

**Build Tab:**
```
Builder: Dockerfile
Dockerfile Path: packages/game-server/Dockerfile
```

**Variables Tab:**
```
NODE_ENV=production
ADMIN_PASSWORD=your-secure-password-here
```

4. Click **"Deploy"**
5. Wait for build to complete
6. Copy the generated domain (e.g., `game-server-xxx.railway.app`)

### Step 3: Deploy Website

1. Click **"New Service"** again
2. Select the same GitHub repo
3. Configure the service:

**Settings Tab:**
```
Service Name: website
Root Directory: / (leave empty for root)
```

**Build Tab:**
```
Builder: Dockerfile
Dockerfile Path: packages/website/Dockerfile
```

**Variables Tab:**
```
NODE_ENV=production
VITE_WSS_URL=wss://game-server-xxx.railway.app
```

> Replace `game-server-xxx.railway.app` with your actual game-server domain from Step 2.

4. Click **"Deploy"**
5. Wait for build to complete

### Step 4: Configure Custom Domains (Optional)

1. Select a service in Railway
2. Go to **Settings → Domains**
3. Click **"Add Custom Domain"**
4. Add your domain (e.g., `game.yourdomain.com`)
5. Configure DNS with your provider:

```
Type: CNAME
Name: game (or your subdomain)
Value: your-service.railway.app
```

6. Wait for SSL certificate provisioning (automatic)



## Troubleshooting

### Build Errors

#### "Cannot find module '@survive-the-night/game-shared'"

**Cause:** Build context doesn't include the shared package.

**Solution:** Ensure the Dockerfile uses the repository root as build context and copies the shared package:
```dockerfile
COPY packages/game-shared ./packages/game-shared
```

#### "npm ERR! Workspaces not supported"

**Cause:** Old npm version in Docker image.

**Solution:** Use `node:20-alpine` or later as the base image in your Dockerfile.

#### "ENOMEM: not enough memory" / Build Timeout

**Cause:** Build exceeds Railway's memory limits (500MB on free tier).

**Solutions:**
1. Ensure `.dockerignore` excludes unnecessary files (node_modules, .git, docs, aseprite, react-native)
2. Use multi-stage Docker builds (already implemented in this project)
3. Upgrade Railway plan for more build resources

### WebSocket Connection Issues

#### Website shows "Connecting..." forever

**Diagnosis:**
1. Open browser DevTools → Console
2. Look for WebSocket connection errors
3. Check Network tab for failed WS connections

**Solutions:**

1. **Verify VITE_WSS_URL format:**
   - Must use `wss://` protocol (not `ws://` or `https://`)
   - Must match game-server's Railway domain exactly
   - Example: `wss://game-server-abc123.railway.app`

2. **Rebuild website after changing VITE_WSS_URL:**
   - Railway Dashboard → website service → Deployments → Redeploy
   - VITE_* variables are build-time only

3. **Check game-server is running:**
   - Railway Dashboard → game-server → Deployments → View logs

#### "CORS policy blocked" errors

**Cause:** Socket.io CORS configuration mismatch.

**Solution:** The game server is configured with `cors: { origin: "*" }`. If using a custom domain, verify the SSL certificate is valid and fully provisioned.

#### "Connection refused on port 3001"

**Cause:** Railway internal port mapping issue.

**Solution:** Don't set the PORT environment variable manually. Railway auto-maps internal ports to the public domain.

### Environment Variable Problems

#### Game client connects to localhost instead of production server

**Cause:** VITE_WSS_URL not set during build.

**Solutions:**
1. Set VITE_WSS_URL as a variable in Railway (it's used at build time)
2. Trigger a rebuild of the website service after setting the variable
3. Verify the variable appears in build logs

#### Admin commands not working

**Cause:** ADMIN_PASSWORD not set or incorrect.

**Solution:** Set the ADMIN_PASSWORD environment variable in the game-server service variables.

### Runtime Errors

#### Game server crashes on startup

**Diagnosis:** Check Railway logs for error messages.

**Common causes and solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `ADMIN_PASSWORD not set` | Missing env var | Add ADMIN_PASSWORD to service variables |
| `EADDRINUSE` | Port conflict | Remove PORT variable, let Railway handle it |
| `JavaScript heap out of memory` | Memory exceeded | Upgrade Railway plan |

#### Players can't see each other

**Diagnosis:** WebSocket broadcast issues.

**Solutions:**
1. Verify both players connect to the same game-server instance
2. Check game-server logs for connection events
3. Ensure no firewall/proxy is blocking WebSocket frames

#### High latency / lag

**Solutions:**
1. Choose Railway region closest to your players
2. Check game-server CPU/memory usage in Railway metrics
3. Consider upgrading Railway plan for dedicated resources



## Verification Checklist

After deployment, verify everything is working correctly:

### 1. Game Server Health Check

Test the game server's health endpoint:

```bash
curl https://your-game-server.railway.app/test
```

**Expected response:**
```json
{"message":"Express is working!"}
```

If you get a 200 OK with this JSON response, the game server is running correctly.

### 2. WebSocket Connection Test

Open your browser's Developer Console (F12) and run:

```javascript
// Test WebSocket connection
const socket = io('wss://your-game-server.railway.app');

socket.on('connect', () => {
  console.log('✅ WebSocket connected successfully!');
  console.log('Socket ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection failed:', error.message);
});

// Disconnect after test
setTimeout(() => socket.disconnect(), 5000);
```

**Expected output:** `✅ WebSocket connected successfully!` with a socket ID.

### 3. Website Loading Test

1. Navigate to your website URL
2. Open browser DevTools → Network tab
3. Filter by "WS" (WebSocket)
4. Refresh the page
5. Verify a WebSocket connection is established to the game server

### 4. Full Game Test

1. Open the website in your browser
2. Enter a player name
3. Click "Play" to start the game
4. Verify:
   - Player spawns in the game world
   - No console errors appear
   - Game responds to keyboard/mouse input

### 5. Multiplayer Test

1. Open the game in two different browser windows/tabs
2. Enter different player names
3. Verify both players can see each other in the game world

### Quick Verification Commands

```bash
# Replace with your actual domains
GAME_SERVER="https://your-game-server.railway.app"
WEBSITE="https://your-website.railway.app"

# Test game server health
curl -s "$GAME_SERVER/test" | jq .

# Test website is serving (should return HTML)
curl -s -o /dev/null -w "%{http_code}" "$WEBSITE"

# Test WebSocket upgrade headers
curl -s -I "$GAME_SERVER" | grep -i upgrade
```

## Security Recommendations

1. **Never commit ADMIN_PASSWORD** to your repository
2. **Use Railway's secret management** for sensitive values
3. **Regularly rotate admin credentials**
4. **Monitor access logs** for suspicious activity

## Cost Optimization

1. Use Railway's **sleep feature** for development environments
2. **Monitor usage** in Railway dashboard to avoid unexpected charges
3. Use **private networking** for service-to-service communication (reduces egress costs)

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Project Architecture](./ARCHITECTURE.md)
