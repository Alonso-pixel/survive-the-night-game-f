# Railway Deployment Error History

This document chronicles the errors encountered during the Railway deployment of the "Survive the Night" multiplayer game, along with explanations and educational resources.

---

## Error 1: Railway Auto-Detection Creates Extra Services

### What Happened
When connecting the GitHub repository to Railway, three services were automatically created instead of the expected two:
- `@survive-the-night/game-server`
- `@survive-the-night/game-client`
- `@survive-the-night/website`

### Root Cause
Railway's auto-detection feature scans the repository for Dockerfiles and creates a service for each one found. Since the monorepo had Dockerfiles in multiple packages, Railway created services for all of them.

### Solution
Delete the unnecessary `game-client` service since it's bundled into the website during build. Only `game-server` and `website` services are needed.

### Educational Resources
- [Railway Monorepo Documentation](https://docs.railway.app/guides/monorepo)
- [Understanding Monorepo Deployments](https://docs.railway.app/tutorials/deploying-a-monorepo)

---

## Error 2: Railpack Builder with Workspace Command Fails

### Error Message
```
sh: tsx: not found
npm error Lifecycle script `dev` failed with error:
npm error code 127
npm error command sh -c tsx watch src/server.ts
```

### What Happened
Railway was using the Railpack builder (default) with a custom build command `npm run build --workspace=@survive-the-night/game-server`, but it was trying to run the `dev` script instead of using the Dockerfile.

### Root Cause
The Railpack builder doesn't handle monorepo workspace dependencies well, especially when packages depend on shared code that needs to be built first. The `tsx` command is a dev dependency not available in the production build context.

### Solution
Switch from Railpack to Dockerfile builder:
1. Change Builder to "Dockerfile"
2. Set Dockerfile Path to `packages/game-server/Dockerfile`
3. Clear Custom Build Command and Custom Start Command

### Educational Resources
- [Railway Builders Documentation](https://docs.railway.app/reference/builders)
- [Dockerfile vs Nixpacks](https://docs.railway.app/guides/dockerfiles)
- [TSX - TypeScript Execute](https://github.com/privatenumber/tsx)

---

## Error 3: Health Check Path Applied to Wrong Service

### Error Message
```
GET /test 404 - - 3.266 ms
Error: No route matches URL "/test"
at getInternalRouterError (react-router/...)
```

### What Happened
The `railway.toml` configuration file at the repository root specified a health check path of `/test`, which was being applied to all services. The website service doesn't have a `/test` endpoint - only the game-server does.

### Root Cause
Railway applies `railway.toml` configuration globally to all services in the project. The `/test` endpoint exists only on the Express game-server, not on the React Router website.

### Solution
Remove the `healthcheckPath` from `railway.toml` or configure health checks per-service in the Railway dashboard.

```toml
# Updated railway.toml
[build]
builder = "dockerfile"

[deploy]
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

### Educational Resources
- [Railway Health Checks](https://docs.railway.app/reference/healthchecks)
- [railway.toml Configuration](https://docs.railway.app/reference/config-as-code)

---

## Error 4: Missing TypeScript Configuration Files During Build

### Error Message
```
TSConfckParseError: parsing /app/packages/game-server/tsconfig.json failed: 
Error: ENOENT: no such file or directory, open '/app/packages/game-server/tsconfig.json'
```

### What Happened
The website build process (via `vite-tsconfig-paths`) tried to resolve TypeScript paths from the root `tsconfig.json`, which references all workspace packages including `game-server`. Since the Dockerfile only copied website-related packages, the game-server tsconfig was missing.

### Root Cause
The root `tsconfig.json` uses project references to all packages in the monorepo. When building the website, the TypeScript path resolution plugin attempts to parse all referenced tsconfig files, even if those packages aren't needed for the build.

### Solution
Add the game-server's `package.json` and `tsconfig.json` to the Dockerfile:

```dockerfile
COPY packages/game-server/package*.json ./packages/game-server/
# ... later ...
COPY packages/game-server/tsconfig.json ./packages/game-server/
```

### Educational Resources
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [vite-tsconfig-paths Plugin](https://github.com/aleclarson/vite-tsconfig-paths)
- [Monorepo TypeScript Setup](https://turborepo.org/docs/handbook/sharing-code/internal-packages)

---

## Error 5: Missing VITE_WSS_URL Protocol Prefix

### What Happened
The `VITE_WSS_URL` environment variable was set without the `wss://` protocol prefix:
```
VITE_WSS_URL=survive-the-nightgame-server-production.up.railway.app
```

### Root Cause
WebSocket URLs require a protocol prefix (`ws://` for unencrypted, `wss://` for encrypted/SSL). Without it, the Socket.io client cannot establish a connection.

### Solution
Include the full protocol in the URL:
```
VITE_WSS_URL=wss://survive-the-nightgame-server-production.up.railway.app
```

### Educational Resources
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Socket.io Client Configuration](https://socket.io/docs/v4/client-initialization/)
- [WSS vs WS](https://javascript.info/websocket#encrypted-connections)

---

## Error 6: "Cannot GET /" - React Router Serve Not Finding Routes

### Error Message
```
Cannot GET /
```

### What Happened
The website deployed successfully but returned a 404 error when accessing the root URL.

### Root Cause
Multiple potential causes:
1. The build output wasn't in the expected location
2. The server wasn't properly serving the built React Router application
3. Port mismatch between what the app listens on and what Railway expects

### Solution
Ensure the Dockerfile:
1. Builds from the correct working directory
2. Uses `npm run start` which runs `react-router-serve ./build/server/index.js`
3. Exposes the correct port (8080 for react-router-serve default)

### Educational Resources
- [React Router v7 Deployment](https://reactrouter.com/en/main/guides/deploying)
- [react-router-serve Documentation](https://www.npmjs.com/package/@react-router/serve)

---

## Error 7: Container Stops Immediately After Starting

### Observed Behavior
```
Dec 30 2025 16:24:39  Starting Container
Dec 30 2025 16:24:40  [react-router-serve] http://localhost:8080
Dec 30 2025 16:24:43  Stopping Container
```

### What Happened
The container started, the server began listening on port 8080, but then Railway stopped the container 3 seconds later.

### Root Cause
Potential causes:
1. **Port mismatch**: Railway's public networking was configured for a different port than the app was listening on
2. **Health check failure**: Railway's default health check couldn't reach the application
3. **Missing public domain**: No public domain was assigned to the service
4. **Environment variable issues**: The PORT environment variable wasn't properly set

### Solution
1. Ensure public domain is assigned in Settings → Networking
2. Set the port in Public Networking to match the app (8080)
3. Add `PORT=8080` as an environment variable
4. Update Dockerfile to explicitly set `ENV PORT=8080`

### Educational Resources
- [Railway Networking](https://docs.railway.app/reference/public-networking)
- [Railway Port Configuration](https://docs.railway.app/guides/public-networking#railway-provided-domain)
- [Container Health Checks](https://docs.railway.app/reference/healthchecks)
- [Debugging Railway Deployments](https://docs.railway.app/guides/debugging-deployments)

---

## Error 8: Build-Time vs Runtime Environment Variables

### What Happened
The `VITE_WSS_URL` was set as a runtime environment variable, but the website still couldn't connect to the game server.

### Root Cause
Vite environment variables prefixed with `VITE_` are **build-time** variables. They get baked into the JavaScript bundle during the build process. Setting them as runtime variables has no effect because the code has already been compiled.

### Solution
1. Set `VITE_WSS_URL` in Railway Variables tab
2. **Trigger a rebuild** (not just a restart) after changing the variable
3. In Dockerfile, pass it as a build argument:
   ```dockerfile
   ARG VITE_WSS_URL
   ENV VITE_WSS_URL=$VITE_WSS_URL
   ```

### Educational Resources
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Build-time vs Runtime Config](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Docker ARG vs ENV](https://vsupalov.com/docker-arg-vs-env/)

---

## Summary of Key Learnings

### Monorepo Deployments
- Railway auto-detects Dockerfiles and creates services for each
- Use Dockerfile builder instead of Railpack for complex monorepos
- Ensure all workspace dependencies are available during build

### Environment Variables
- `VITE_*` variables are build-time only - require rebuild after changes
- Use Docker `ARG` for build-time and `ENV` for runtime variables
- WebSocket URLs need protocol prefix (`wss://`)

### Port Configuration
- Railway auto-assigns ports but you can override
- Ensure app listens on the same port Railway expects
- react-router-serve defaults to port 8080

### Health Checks
- `railway.toml` applies globally to all services
- Configure per-service health checks in the dashboard
- Not all services have the same health check endpoints

### Debugging
- Check Railway logs for startup errors
- Verify public domain is assigned
- Test endpoints manually with curl before assuming deployment works

---

## Additional Resources

### Railway Documentation
- [Railway Docs Home](https://docs.railway.app/)
- [Deploying from GitHub](https://docs.railway.app/guides/github-autodeploys)
- [Environment Variables](https://docs.railway.app/guides/variables)
- [Troubleshooting Guide](https://docs.railway.app/guides/debugging-deployments)

### Docker & Containers
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker for Node.js](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

### React Router & Vite
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Deploying Vite Apps](https://vitejs.dev/guide/static-deploy.html)

### WebSockets & Socket.io
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

### Video Tutorials
- [Railway Deployment Tutorial (YouTube)](https://www.youtube.com/results?search_query=railway+deployment+tutorial)
- [Docker for Beginners (YouTube)](https://www.youtube.com/results?search_query=docker+tutorial+beginners)
- [Monorepo Setup Guide (YouTube)](https://www.youtube.com/results?search_query=monorepo+npm+workspaces)
