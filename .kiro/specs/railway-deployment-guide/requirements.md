# Requirements Document

## Introduction

This document specifies the requirements for deploying the "Survive the Night" multiplayer game to Railway. The project is a monorepo containing four packages: game-server (Node.js/Socket.io WebSocket server), game-client (Canvas-based game client bundled with website), game-shared (shared TypeScript types), and website (React Router 7 frontend). The deployment requires proper configuration of WebSocket connections, environment variables, and inter-service communication.

## Glossary

- **Railway**: A cloud platform for deploying applications with automatic builds, networking, and scaling
- **Monorepo**: A single repository containing multiple related packages/projects
- **WebSocket (WSS)**: A protocol providing full-duplex communication channels over a single TCP connection
- **Socket.io**: A library enabling real-time, bidirectional communication between web clients and servers
- **VITE_WSS_URL**: Environment variable specifying the WebSocket server URL for the game client
- **VITE_API_BASE_URL**: Environment variable specifying the REST API base URL
- **Nixpacks**: Railway's default build system that auto-detects and builds applications
- **Service**: A Railway deployment unit representing a single application or container
- **Private Networking**: Railway's internal network allowing services to communicate without public exposure

## Requirements

### Requirement 1: Project Structure Configuration

**User Story:** As a developer, I want Railway to correctly identify and build each service from the monorepo, so that both the game server and website deploy successfully.

#### Acceptance Criteria

1. WHEN deploying the game-server service THEN Railway SHALL use the Dockerfile at `packages/game-server/Dockerfile` with the repository root as build context
2. WHEN deploying the website service THEN Railway SHALL use the Dockerfile at `packages/website/Dockerfile` with the repository root as build context
3. WHEN building either service THEN Railway SHALL have access to the `packages/game-shared` directory for shared dependencies
4. WHEN the build process runs THEN Railway SHALL execute `npm ci` at the monorepo root to install all workspace dependencies

### Requirement 2: Game Server Deployment

**User Story:** As a developer, I want the game server to be accessible via WebSocket connections, so that players can connect and play the multiplayer game.

#### Acceptance Criteria

1. WHEN the game-server service starts THEN the system SHALL listen on port 3001 for incoming connections
2. WHEN Railway assigns a public domain THEN the system SHALL accept WebSocket connections on the `wss://` protocol
3. WHEN a client connects THEN the Socket.io server SHALL handle CORS requests from any origin
4. WHEN the ADMIN_PASSWORD environment variable is set THEN the system SHALL use it for admin command authentication
5. WHEN the NODE_ENV environment variable is set to "production" THEN the system SHALL disable the biome editor API routes

### Requirement 3: Website Deployment

**User Story:** As a developer, I want the website to connect to the deployed game server, so that players can access the game through the web interface.

#### Acceptance Criteria

1. WHEN building the website THEN Railway SHALL inject the VITE_WSS_URL build argument with the game server's public WebSocket URL
2. WHEN the website service starts THEN the system SHALL serve the React Router application on port 3000
3. WHEN a player loads the game THEN the client SHALL establish a WebSocket connection to the URL specified in VITE_WSS_URL
4. WHEN the VITE_API_BASE_URL environment variable is set THEN the system SHALL use it for REST API calls to the game server

### Requirement 4: Environment Variable Configuration

**User Story:** As a developer, I want to configure environment variables correctly, so that services can communicate and authenticate properly.

#### Acceptance Criteria

1. WHEN deploying the game-server THEN the system SHALL require the ADMIN_PASSWORD environment variable for security
2. WHEN deploying the website THEN the system SHALL require the VITE_WSS_URL environment variable pointing to the game server
3. WHEN the game server URL changes THEN the website service SHALL be rebuilt with the updated VITE_WSS_URL
4. IF the VITE_WSS_URL is not set during build THEN the website SHALL fail to connect to the game server

### Requirement 5: Networking and Domain Configuration

**User Story:** As a developer, I want proper networking between services and public access for players, so that the game is accessible and functional.

#### Acceptance Criteria

1. WHEN Railway generates a domain for game-server THEN the domain SHALL support WebSocket upgrade requests
2. WHEN Railway generates a domain for website THEN the domain SHALL serve HTTPS traffic
3. WHEN configuring custom domains THEN Railway SHALL provision SSL certificates automatically
4. IF WebSocket connections fail THEN the system SHALL provide clear error messages in browser console

### Requirement 6: Build and Deployment Process

**User Story:** As a developer, I want reliable builds that handle the monorepo structure, so that deployments are consistent and reproducible.

#### Acceptance Criteria

1. WHEN Railway builds the game-server THEN the build SHALL complete the TypeScript compilation via tsup
2. WHEN Railway builds the website THEN the build SHALL complete the React Router build process
3. WHEN dependencies change in package.json THEN Railway SHALL reinstall dependencies before building
4. IF the build fails THEN Railway SHALL display the build logs with error details
5. WHEN the build succeeds THEN Railway SHALL start the service using the Dockerfile CMD instruction

### Requirement 7: Error Handling and Troubleshooting

**User Story:** As a developer, I want clear guidance on common deployment errors, so that I can quickly resolve issues.

#### Acceptance Criteria

1. WHEN a "Cannot find module" error occurs THEN the documentation SHALL explain workspace dependency resolution
2. WHEN WebSocket connections fail with CORS errors THEN the documentation SHALL explain origin configuration
3. WHEN the game client shows "disconnected" THEN the documentation SHALL explain WSS URL verification steps
4. WHEN builds timeout THEN the documentation SHALL explain Railway build limits and optimization strategies
5. WHEN memory errors occur THEN the documentation SHALL explain Railway resource allocation options
