# Survive the Night - Mobile Edition

A minimal React Native mobile adaptation of the Survive the Night multiplayer survival game. This mobile client connects to the same game server as the web version and provides touch-based controls for mobile gameplay.

## Project Overview

This React Native app is a lightweight mobile client that implements the core gameplay mechanics:

- **Real-time multiplayer** via Socket.io connection to the game server
- **Touch controls** with virtual joystick and action buttons
- **Entity-Component System (ECS)** for game objects
- **Client-side prediction** for responsive movement
- **2D rendering** using React Native Skia
- **Mobile-optimized UI** with HUD and health display

## Architecture

### Core Components

```
react-native/
├── src/
│   ├── client/          # Main game client and state management
│   ├── entities/        # Entity system (Player, Zombie, Bullet)
│   ├── extensions/      # ECS extensions (Positionable, Movable, etc.)
│   ├── input/           # Touch input handling
│   ├── networking/      # Socket.io connection and event handling
│   ├── rendering/       # React Native Skia renderer
│   ├── ui/              # Mobile UI components (Joystick, HUD, etc.)
│   ├── utils/           # Utilities (Vector2, math helpers)
│   └── types/           # TypeScript type definitions
```

### Key Features

1. **Entity-Component System**
   - Entities are containers for game objects
   - Extensions add behavior (position, movement, health, rendering)
   - Easily extensible for new entity types

2. **Networking**
   - Socket.io client connects to game server
   - Handles game state updates, player events, and synchronization
   - Automatic reconnection support

3. **Input System**
   - Virtual joystick for 8-directional movement
   - Fire and Sprint action buttons
   - Touch-optimized controls

4. **Rendering**
   - React Native Skia for 2D canvas rendering
   - Camera follows player
   - Frustum culling for performance

5. **Game Loop**
   - 60 FPS update/render cycle
   - Client-side prediction for player movement
   - Smooth interpolation

## Prerequisites

Before running the mobile app, ensure you have:

- **Node.js** 18+ installed
- **React Native development environment** set up:
  - For iOS: Xcode and CocoaPods
  - For Android: Android Studio and Android SDK
- **Game server** running (from main repository)

### Setting up React Native

Follow the official React Native environment setup guide:
https://reactnative.dev/docs/environment-setup

Choose the "React Native CLI Quickstart" tab for your development OS and target OS.

## Installation

1. **Navigate to the react-native directory:**
   ```bash
   cd react-native
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **For iOS only - Install CocoaPods:**
   ```bash
   cd ios && pod install && cd ..
   ```

## Running the App

### Start the Game Server

First, make sure the game server is running. From the root of the repository:

```bash
# In the root directory
npm run dev:server
```

The server should be running on `http://localhost:3000`.

### Run the Mobile App

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

**Or start Metro bundler separately:**
```bash
npm start
```

Then press `a` for Android or `i` for iOS.

## Configuration

### Server URL

By default, the app connects to `http://localhost:3000`. To change the server URL:

1. Open `src/types/index.ts`
2. Modify the `GAME_CONFIG.SERVER_URL` value:
   ```typescript
   export const GAME_CONFIG = {
     SERVER_URL: 'http://your-server-ip:3000',
     // ...
   };
   ```

**Note:** For Android emulator, use `http://10.0.2.2:3000` to connect to localhost.
**Note:** For iOS simulator, `http://localhost:3000` should work.
**Note:** For physical devices, use your computer's IP address (e.g., `http://192.168.1.100:3000`).

### Game Configuration

Other game parameters can be adjusted in `src/types/index.ts`:

```typescript
export const GAME_CONFIG = {
  PLAYER_SPEED: 60,           // Movement speed
  SPRINT_MULTIPLIER: 1.5,     // Sprint speed multiplier
  RENDER_RADIUS: 800,         // Render distance
  FPS: 60,                    // Target frame rate
  MAX_DELTA: 0.1,            // Max time delta
};
```

## Controls

- **Left Joystick**: Move your character in 8 directions
- **Fire Button** (red, right side): Attack/shoot
- **Sprint Button** (blue, right side): Hold to sprint

## Game Mechanics

### Players
- Green circles representing players
- Health bar displayed in HUD
- Client-side prediction for smooth movement

### Zombies
- Red circles: Normal zombies
- Yellow circles: Fast zombies
- Purple circles: Big/tank zombies

### Bullets
- Yellow small circles
- Fired when Fire button is pressed

## Project Structure Details

### Extensions System

Extensions are reusable components that can be attached to entities:

- **Positionable**: Position and size
- **Movable**: Velocity
- **Renderable**: Visual appearance (color, shape)
- **Health**: Hit points and damage

### Entity Types

- **Player**: Controlled by player input
- **Zombie**: AI-controlled enemies (synced from server)
- **Bullet**: Projectiles

### Networking Events

The client handles various server events:
- `yourId`: Player ID assignment
- `map`: Map data
- `gameStateUpdate`: Entity updates
- `dayNightCycle`: Day/night cycle info
- `playerDeath`, `zombieDeath`: Death events

## Development

### Adding New Entity Types

1. Create entity class in `src/entities/`
2. Add to `EntityFactory.ts`
3. Update `EntityType` enum in `src/types/index.ts`

### Adding New Extensions

1. Create extension class in `src/extensions/`
2. Extend base `Extension` class
3. Implement `serialize()` and `deserialize()` methods
4. Export from `src/extensions/index.ts`

### Debugging

- Enable remote debugging in React Native dev menu
- Use `console.log()` for logging (visible in Metro bundler)
- Use React Native Debugger for advanced debugging

## Performance Considerations

- **Frustum culling**: Only renders entities near the player
- **Efficient updates**: Only sends input when changed
- **Entity pooling**: Could be added for bullets/projectiles
- **Asset optimization**: Use optimized images and animations

## Limitations

This is a minimal backbone implementation. Features not yet implemented:

- Inventory system
- Crafting
- Building structures
- Map rendering (buildings, trees, etc.)
- Particle effects
- Sound effects
- Chat system
- Player list
- Day/night visual effects

## Future Improvements

- Add texture/sprite rendering
- Implement inventory UI
- Add minimap
- Improve touch controls with haptic feedback
- Add sound effects and music
- Implement settings menu
- Add particle effects
- Optimize rendering with sprite batching

## Troubleshooting

### Connection Issues

**Problem:** "Failed to connect to server"

**Solutions:**
- Ensure game server is running
- Check server URL configuration
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical devices, use your computer's IP address
- Disable any firewalls blocking port 3000

### Build Errors

**Problem:** Build fails on iOS

**Solutions:**
- Run `cd ios && pod install && cd ..`
- Clean build folder in Xcode
- Delete `ios/Pods` and `Podfile.lock`, then re-run `pod install`

**Problem:** Build fails on Android

**Solutions:**
- Check Android SDK is properly installed
- Run `cd android && ./gradlew clean && cd ..`
- Ensure ANDROID_HOME environment variable is set

### Metro Bundler Issues

**Problem:** Metro bundler cache issues

**Solution:**
```bash
npm start -- --reset-cache
```

## Contributing

This is a minimal implementation meant as a starting point. Feel free to extend it with:

- Additional entity types
- More sophisticated rendering
- Additional UI elements
- Performance optimizations
- New game features

## License

Part of the Survive the Night project.

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Native Skia](https://shopify.github.io/react-native-skia/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
