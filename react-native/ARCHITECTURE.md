# Survive the Night - Mobile Edition
## Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Core Architecture](#core-architecture)
3. [System Components](#system-components)
4. [Data Flow](#data-flow)
5. [Development Setup](#development-setup)
6. [Extending the Game](#extending-the-game)
7. [Performance Considerations](#performance-considerations)

---

## Overview

**Survive the Night - Mobile Edition** is a React Native multiplayer survival game client that connects to a Node.js game server via Socket.io. The game uses an Entity-Component System (ECS) architecture for flexible game object management, client-side prediction for responsive gameplay, and React Native Skia for hardware-accelerated 2D rendering.

### Key Technologies
- **React Native 0.76.1** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **Socket.io Client** - Real-time bidirectional communication
- **React Native Skia** - High-performance 2D graphics rendering
- **React Native Gesture Handler** - Touch input management

### Game Features
- Real-time multiplayer gameplay
- Touch-based controls (virtual joystick + action buttons)
- Client-side prediction for smooth movement
- Entity-Component System for game objects
- Camera system that follows the player
- Health system with visual HUD
- Day/night cycle support

---

## Core Architecture

### Entity-Component System (ECS)

The game uses a component-based architecture where:

**Entities** are containers that represent game objects (players, zombies, bullets)
**Extensions** are reusable components that add behavior to entities

```
Entity (Base Container)
├── Positionable Extension (position, size)
├── Movable Extension (velocity)
├── Renderable Extension (color, shape)
└── Health Extension (HP, damage)
```

#### Benefits of ECS
- **Modularity**: Extensions can be mixed and matched
- **Reusability**: Same extensions work across different entity types
- **Network Sync**: Extensions serialize/deserialize for network updates
- **Flexibility**: Easy to add new behaviors without modifying entity classes

### Project Structure

```
src/
├── client/              # Game client and state management
│   ├── GameClient.ts    # Main game controller, game loop
│   └── GameState.ts     # Centralized state container
│
├── entities/            # Entity definitions
│   ├── Entity.ts        # Base entity class
│   ├── EntityFactory.ts # Creates entities from network data
│   ├── Player.ts        # Player entity
│   ├── Zombie.ts        # Zombie entity (normal, fast, big)
│   └── Bullet.ts        # Projectile entity
│
├── extensions/          # ECS components
│   ├── Extension.ts     # Base extension class
│   ├── Positionable.ts  # Position and size
│   ├── Movable.ts       # Velocity and movement
│   ├── Renderable.ts    # Visual appearance
│   └── Health.ts        # Hit points and damage
│
├── input/               # Touch input system
│   ├── InputManager.ts  # Manages input state
│   └── types.ts         # Input type definitions
│
├── networking/          # Network communication
│   ├── SocketManager.ts # Socket.io connection manager
│   └── EventListener.ts # Server event handlers
│
├── rendering/           # Graphics rendering
│   └── GameCanvas.tsx   # Skia canvas renderer
│
├── ui/                  # User interface components
│   ├── GameScreen.tsx   # Main game screen
│   ├── Joystick.tsx     # Virtual joystick control
│   ├── ActionButtons.tsx # Fire/Sprint buttons
│   └── HUD.tsx          # Health and info display
│
├── utils/               # Utility functions
│   ├── Vector2.ts       # 2D vector math
│   └── math.ts          # Math helpers
│
└── types/               # TypeScript definitions
    └── index.ts         # Shared types and constants
```

---

## System Components

### 1. Game Client (`GameClient.ts`)

The main controller that orchestrates all game systems.

**Responsibilities:**
- Manages connection to game server
- Runs the game loop at 60 FPS
- Handles client-side prediction
- Sends player input to server
- Coordinates updates between systems

**Key Methods:**
```typescript
connect()              // Connect to game server
start(callback)        // Start game loop with render callback
update(deltaTime)      // Update game state each frame
predictLocalPlayerMovement() // Client-side prediction
sendInput(input)       // Send input to server
```

**Game Loop Flow:**
```
1. Calculate delta time
2. Update all entities
3. Apply client-side prediction for local player
4. Send input to server (if changed)
5. Trigger render callback
6. Schedule next frame
```

### 2. Game State (`GameState.ts`)

Centralized state container for all game data.

**Properties:**
```typescript
playerId: string | null           // Local player ID
entities: Map<string, Entity>     // All game entities
isConnected: boolean              // Connection status
isDay: boolean                    // Day/night cycle
dayNumber: number                 // Current day
cycleStartTime: number            // Cycle timing
cycleDuration: number             // Cycle duration
```

**Methods:**
```typescript
getPlayer()          // Get local player entity
getEntitiesArray()   // Get all entities as array
clear()              // Reset state
```

### 3. Entity System

#### Base Entity (`Entity.ts`)

Abstract base class for all game objects.

**Core Features:**
- Extension management (add, remove, get)
- Update loop for all extensions
- Serialization for network sync
- Convenience getters for common extensions

**Extension Management:**
```typescript
addExtension(ext)       // Add component to entity
getExtension<T>(type)   // Get component by type
hasExtension(type)      // Check if component exists
removeExtension(type)   // Remove component
```

#### Entity Factory (`EntityFactory.ts`)

Creates entities from network data.

**Process:**
1. Receive raw entity data from server
2. Instantiate correct entity class based on type
3. Deserialize extension data
4. Return fully constructed entity

**Supported Entity Types:**
- `PLAYER` → Player entity (green circle)
- `ZOMBIE` → Normal zombie (red circle)
- `FAST_ZOMBIE` → Fast zombie (yellow circle)
- `BIG_ZOMBIE` → Tank zombie (purple circle)
- `BULLET` → Projectile (yellow small circle)

### 4. Extension System

#### Positionable Extension

Manages entity position and size in 2D space.

```typescript
position: Vector2    // Top-left corner
size: Vector2        // Width and height

getPosition()        // Get position
getCenterPosition()  // Get center point
setPosition(pos)     // Update position
```

#### Movable Extension

Handles entity velocity and movement.

```typescript
velocity: Vector2    // Movement vector

getVelocity()        // Get current velocity
setVelocity(vel)     // Set velocity
```

#### Renderable Extension

Defines visual appearance for rendering.

```typescript
color: string        // Hex color code
shape: 'circle' | 'rect'
radius?: number      // For circles

getColor()           // Get color
getShape()           // Get shape type
getRadius()          // Get radius (circles)
```

#### Health Extension

Manages hit points and damage.

```typescript
currentHealth: number
maxHealth: number

getCurrentHealth()       // Get current HP
getHealthPercentage()    // Get HP as 0-1
damage(amount)           // Take damage
heal(amount)             // Restore health
isDead()                 // Check if dead
```

### 5. Input System (`InputManager.ts`)

Manages mobile touch input and converts it to game input.

**Input State:**
```typescript
joystick: {
  active: boolean
  direction: {x, y}    // Normalized -1 to 1
  angle: number        // Radians
  distance: number     // 0 to 1
}
buttons: {
  fire: boolean
  sprint: boolean
}
```

**Flow:**
1. UI components update input state
2. InputManager tracks changes
3. Converts to PlayerInput format
4. GameClient sends to server

### 6. Networking System

#### Socket Manager (`SocketManager.ts`)

Manages Socket.io connection and event handling.

**Features:**
- Connection management with auto-reconnect
- Event handler registration
- Event emission to server
- Connection status tracking

**Key Methods:**
```typescript
connect()                    // Connect to server
disconnect()                 // Disconnect
on(event, handler)           // Register event handler
emit(event, ...args)         // Send event to server
```

#### Event Listener (`EventListener.ts`)

Handles incoming server events and updates game state.

**Server Events:**
- `yourId` - Player ID assignment
- `map` - Map data
- `gameStateUpdate` - Entity updates (full or partial)
- `dayNightCycle` - Day/night cycle info
- `playerJoined` / `playerLeft` - Player events
- `playerDeath` / `zombieDeath` - Death events

**Update Types:**
- **Full State**: Replace all entities (on connect)
- **Partial Update**: Update/create specific entities

### 7. Rendering System (`GameCanvas.tsx`)

React Native Skia-based renderer with camera system.

**Features:**
- Camera follows player
- Frustum culling (only render visible entities)
- Shape rendering (circles and rectangles)
- Color-coded entities

**Rendering Process:**
```
1. Get all entities from game state
2. Calculate camera position (centered on player)
3. For each entity:
   - Get position, size, color, shape
   - Apply camera transform
   - Check if on screen (frustum culling)
   - Render shape (Circle or Rect)
```

**Camera System:**
```typescript
cameraX = screenWidth / 2 - playerX
cameraY = screenHeight / 2 - playerY
screenX = entityX + cameraX
screenY = entityY + cameraY
```

### 8. UI Components

#### GameScreen (`GameScreen.tsx`)

Main game screen that integrates all components.

**Lifecycle:**
1. Create GameClient instance
2. Connect to server
3. Start game loop with render callback
4. Force re-render on each update
5. Cleanup on unmount

**Layout:**
```
┌─────────────────────────────┐
│ HUD (Health, Info)          │
│                             │
│    Game Canvas (Skia)       │
│                             │
│                             │
│ [Joystick]      [Buttons]   │
└─────────────────────────────┘
```

#### Joystick (`Joystick.tsx`)

Virtual joystick using React Native Gesture Handler.

**Features:**
- Pan gesture detection
- Capped movement radius
- Normalized direction output
- Visual feedback

#### Action Buttons (`ActionButtons.tsx`)

Fire and Sprint buttons with press/release detection.

**Features:**
- Pressable components
- Visual press feedback
- Boolean state output

#### HUD (`HUD.tsx`)

Heads-up display showing game information.

**Displays:**
- Connection status
- Day/night cycle
- Entity count
- Health bar with color coding
- Current/max health values

---

## Data Flow

### Connection Flow

```
1. User opens app
   ↓
2. GameScreen creates GameClient
   ↓
3. GameClient.connect()
   ↓
4. SocketManager connects to server
   ↓
5. Server sends 'yourId' event
   ↓
6. EventListener sets playerId in GameState
   ↓
7. Server sends 'map' event
   ↓
8. Server sends full 'gameStateUpdate'
   ↓
9. EventListener creates entities via EntityFactory
   ↓
10. GameClient.start() begins game loop
```

### Input Flow

```
1. User touches joystick/button
   ↓
2. UI component detects gesture
   ↓
3. Component calls InputManager.updateJoystick/updateButtons
   ↓
4. InputManager updates internal state
   ↓
5. GameClient checks if input changed
   ↓
6. If changed: convert to PlayerInput format
   ↓
7. Send 'playerInput' event to server
   ↓
8. Server processes input and updates game state
   ↓
9. Server broadcasts 'gameStateUpdate' to all clients
```

### Update Flow

```
Game Loop (60 FPS):
1. Calculate deltaTime
   ↓
2. Update all entities (call entity.update())
   ↓
3. Each entity updates its extensions
   ↓
4. Apply client-side prediction for local player
   ↓
5. Send input to server (if changed)
   ↓
6. Trigger render callback
   ↓
7. GameScreen forces re-render
   ↓
8. GameCanvas renders all entities
   ↓
9. Schedule next frame
```

### Network Sync Flow

```
Server Update:
1. Server sends 'gameStateUpdate' event
   ↓
2. EventListener receives update
   ↓
3. For each entity in update:
   - Check if entity exists locally
   - If exists: deserialize and update extensions
   - If new: create via EntityFactory
   ↓
4. Trigger onGameStateUpdate callback
   ↓
5. Next render shows updated state
```

---

## Development Setup

### Prerequisites

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18 or higher
   ```

2. **React Native Development Environment**
   
   Follow the official guide: https://reactnative.dev/docs/environment-setup
   
   Choose "React Native CLI Quickstart" for your OS and target platform.

   **For iOS:**
   - macOS required
   - Xcode 14+
   - CocoaPods
   
   **For Android:**
   - Android Studio
   - Android SDK (API 31+)
   - Java Development Kit (JDK 17)

3. **Game Server**
   
   The mobile client requires a running game server. The server should be in the parent repository.

### Installation Steps

1. **Clone and navigate to project:**
   ```bash
   cd survive-the-night-mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **For iOS - Install pods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Configure server URL:**
   
   Edit `src/types/index.ts`:
   ```typescript
   export const GAME_CONFIG = {
     SERVER_URL: 'http://localhost:3000',  // Change as needed
     // ...
   };
   ```
   
   **Important URL Notes:**
   - **iOS Simulator**: Use `http://localhost:3000`
   - **Android Emulator**: Use `http://10.0.2.2:3000` (special alias for host)
   - **Physical Device**: Use your computer's IP (e.g., `http://192.168.1.100:3000`)

### Running the App

1. **Start the game server** (in parent repository):
   ```bash
   npm run dev:server
   ```

2. **Start Metro bundler:**
   ```bash
   npm start
   ```

3. **Run on platform:**
   
   **iOS:**
   ```bash
   npm run ios
   ```
   
   **Android:**
   ```bash
   npm run android
   ```

### Development Tools

**React Native Debugger:**
- Press `Cmd+D` (iOS) or `Cmd+M` (Android) for dev menu
- Enable "Debug" for Chrome DevTools
- Enable "Show Perf Monitor" for FPS

**Logs:**
- Metro bundler shows console.log output
- Use `console.log()` for debugging
- Check native logs: `npx react-native log-ios` or `npx react-native log-android`

**Hot Reload:**
- Fast Refresh is enabled by default
- Changes to React components reload automatically
- Native code changes require rebuild

---

## Extending the Game

### Adding a New Entity Type

1. **Define entity type** in `src/types/index.ts`:
   ```typescript
   export enum EntityType {
     // ... existing types
     BOSS = 'boss',
   }
   ```

2. **Create entity class** in `src/entities/Boss.ts`:
   ```typescript
   import {Entity} from './Entity';
   import {EntityType} from '../types';
   import {Positionable} from '../extensions/Positionable';
   import {Movable} from '../extensions/Movable';
   import {Renderable} from '../extensions/Renderable';
   import {Health} from '../extensions/Health';

   export class Boss extends Entity {
     constructor(id: string, x: number = 0, y: number = 0) {
       super(id, EntityType.BOSS);
       
       this.addExtension(new Positionable(this, x, y, 64, 64));
       this.addExtension(new Movable(this));
       this.addExtension(new Renderable(this, '#FF0000', 'circle', 32));
       this.addExtension(new Health(this, 500));
     }
   }
   ```

3. **Register in EntityFactory** (`src/entities/EntityFactory.ts`):
   ```typescript
   import {Boss} from './Boss';
   
   public createEntity(data: RawEntity): Entity | null {
     // ... existing cases
     case EntityType.BOSS:
       entity = new Boss(data.id);
       break;
   }
   ```

4. **Export from index** (`src/entities/index.ts`):
   ```typescript
   export * from './Boss';
   ```

### Adding a New Extension

1. **Define extension type** in `src/types/index.ts`:
   ```typescript
   export enum ExtensionType {
     // ... existing types
     INVENTORY = 'inventory',
   }
   ```

2. **Create extension class** in `src/extensions/Inventory.ts`:
   ```typescript
   import {Extension} from './Extension';
   import {ExtensionSerialized, ExtensionType} from '../types';

   export class Inventory extends Extension {
     private items: string[] = [];
     private maxSlots: number;

     constructor(entity: any, maxSlots: number = 10) {
       super(entity);
       this.maxSlots = maxSlots;
     }

     public getType(): string {
       return ExtensionType.INVENTORY;
     }

     public addItem(item: string): boolean {
       if (this.items.length < this.maxSlots) {
         this.items.push(item);
         return true;
       }
       return false;
     }

     public removeItem(item: string): boolean {
       const index = this.items.indexOf(item);
       if (index !== -1) {
         this.items.splice(index, 1);
         return true;
       }
       return false;
     }

     public getItems(): string[] {
       return [...this.items];
     }

     public serialize(): ExtensionSerialized {
       return {
         type: this.getType(),
         items: this.items,
         maxSlots: this.maxSlots,
       };
     }

     public deserialize(data: ExtensionSerialized): void {
       if (data.items) this.items = data.items;
       if (data.maxSlots) this.maxSlots = data.maxSlots;
     }
   }
   ```

3. **Add convenience getter to Entity** (`src/entities/Entity.ts`):
   ```typescript
   public getInventory(): Inventory | null {
     return this.getExtension<Inventory>('inventory');
   }
   ```

4. **Export from index** (`src/extensions/index.ts`):
   ```typescript
   export * from './Inventory';
   ```

### Adding a New UI Component

Example: Minimap

1. **Create component** in `src/ui/Minimap.tsx`:
   ```typescript
   import React from 'react';
   import {View, StyleSheet} from 'react-native';
   import {Canvas, Circle} from '@shopify/react-native-skia';
   import {GameState} from '../client/GameState';

   interface MinimapProps {
     gameState: GameState;
     size?: number;
   }

   export const Minimap: React.FC<MinimapProps> = ({gameState, size = 150}) => {
     const player = gameState.getPlayer();
     const playerPos = player?.getPositionable()?.getCenterPosition();
     
     return (
       <View style={[styles.container, {width: size, height: size}]}>
         <Canvas style={styles.canvas}>
           {/* Render minimap */}
         </Canvas>
       </View>
     );
   };

   const styles = StyleSheet.create({
     container: {
       position: 'absolute',
       top: 100,
       right: 16,
       borderRadius: 8,
       overflow: 'hidden',
       borderWidth: 2,
       borderColor: 'rgba(255, 255, 255, 0.3)',
     },
     canvas: {
       flex: 1,
     },
   });
   ```

2. **Add to GameScreen** (`src/ui/GameScreen.tsx`):
   ```typescript
   import {Minimap} from './Minimap';
   
   // In render:
   <Minimap gameState={gameClient.getGameState()} />
   ```

### Adding New Input Controls

Example: Reload button

1. **Update input types** (`src/input/types.ts`):
   ```typescript
   export interface ButtonState {
     fire: boolean;
     sprint: boolean;
     reload: boolean;  // Add new button
   }
   ```

2. **Update InputManager** (`src/input/InputManager.ts`):
   ```typescript
   private input: MobileInput = {
     // ...
     buttons: {
       fire: false,
       sprint: false,
       reload: false,  // Add default state
     },
   };
   ```

3. **Update PlayerInput type** (`src/types/index.ts`):
   ```typescript
   export interface PlayerInput {
     // ... existing fields
     reload: boolean;
   }
   ```

4. **Update ActionButtons** (`src/ui/ActionButtons.tsx`):
   ```typescript
   interface ActionButtonsProps {
     // ... existing props
     onReloadPress: (pressed: boolean) => void;
   }
   
   // Add button in render
   <Pressable
     style={styles.reloadButton}
     onPressIn={() => onReloadPress(true)}
     onPressOut={() => onReloadPress(false)}
   >
     <Text>Reload</Text>
   </Pressable>
   ```

5. **Wire up in GameScreen** (`src/ui/GameScreen.tsx`):
   ```typescript
   const handleReloadPress = useCallback(
     (pressed: boolean) => {
       gameClient.getInputManager().updateButtons({reload: pressed});
     },
     [gameClient]
   );
   
   <ActionButtons
     // ... existing props
     onReloadPress={handleReloadPress}
   />
   ```

### Customizing Rendering

Example: Add sprite rendering

1. **Load sprites** in GameCanvas:
   ```typescript
   import {useImage} from '@shopify/react-native-skia';
   
   const playerSprite = useImage(require('../assets/player.png'));
   ```

2. **Update Renderable extension** to support sprite type:
   ```typescript
   export class Renderable extends Extension {
     private spriteId?: string;
     
     public setSpriteId(id: string): void {
       this.spriteId = id;
     }
     
     public getSpriteId(): string | undefined {
       return this.spriteId;
     }
   }
   ```

3. **Render sprites** in GameCanvas:
   ```typescript
   if (renderable.getSpriteId() && playerSprite) {
     return (
       <Image
         key={entity.getId()}
         image={playerSprite}
         x={screenX - size.x / 2}
         y={screenY - size.y / 2}
         width={size.x}
         height={size.y}
       />
     );
   }
   ```

---

## Performance Considerations

### Optimization Strategies

1. **Frustum Culling**
   - Only render entities within screen bounds + margin
   - Implemented in GameCanvas.tsx
   - Reduces draw calls significantly

2. **Entity Updates**
   - Only update entities that need updating
   - Consider adding "active" flag to skip inactive entities
   - Use object pooling for frequently created/destroyed entities (bullets)

3. **Network Optimization**
   - Only send input when it changes
   - Server sends partial updates (not full state every frame)
   - Consider delta compression for position updates

4. **Rendering Optimization**
   - Use React.memo for UI components that don't change often
   - Minimize re-renders with useCallback
   - Consider using Skia's drawing commands directly for complex scenes

5. **Memory Management**
   - Clear entities map when disconnecting
   - Remove event listeners on unmount
   - Use object pooling for temporary objects (Vector2)

### Performance Monitoring

**Built-in Tools:**
```typescript
// Enable performance monitor in dev menu
// Shows FPS, JS thread usage, UI thread usage
```

**Custom Profiling:**
```typescript
// Add to GameClient.update()
const startTime = performance.now();
// ... update logic
const endTime = performance.now();
console.log(`Update took ${endTime - startTime}ms`);
```

### Common Performance Issues

**Issue: Low FPS**
- Check entity count (reduce render distance)
- Profile update loop (identify slow extensions)
- Reduce re-renders (use React.memo, useCallback)

**Issue: Network lag**
- Check server tick rate
- Reduce input send frequency
- Implement interpolation for smoother movement

**Issue: Memory leaks**
- Ensure event listeners are removed
- Clear entities on disconnect
- Check for circular references

---

## Configuration Reference

### Game Config (`src/types/index.ts`)

```typescript
export const GAME_CONFIG = {
  // Server connection
  SERVER_URL: 'http://localhost:3000',
  
  // Player movement
  PLAYER_SPEED: 60,              // Units per second
  SPRINT_MULTIPLIER: 1.5,        // Sprint speed multiplier
  
  // Rendering
  RENDER_RADIUS: 800,            // Render distance from player
  
  // Game loop
  TICK_RATE: 30,                 // Server tick rate (FPS)
  FPS: 60,                       // Client target FPS
  MAX_DELTA: 0.1,                // Max delta time (prevents huge jumps)
};
```

### TypeScript Configuration

The project uses strict TypeScript settings for type safety:
- Strict mode enabled
- ES2020 target
- ESNext modules
- Path aliases supported (`@/*` → `src/*`)

---

## Troubleshooting

### Connection Issues

**Problem:** "Failed to connect to server"

**Solutions:**
1. Verify server is running: `curl http://localhost:3000`
2. Check SERVER_URL in `src/types/index.ts`
3. For Android emulator, use `http://10.0.2.2:3000`
4. For physical device, use computer's IP address
5. Check firewall settings (allow port 3000)
6. Verify Socket.io versions match between client and server

### Build Issues

**iOS Build Fails:**
```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Clean Xcode build
# Open ios/*.xcworkspace in Xcode
# Product → Clean Build Folder
```

**Android Build Fails:**
```bash
# Clean Gradle cache
cd android
./gradlew clean
cd ..

# Clear Metro cache
npm start -- --reset-cache
```

### Runtime Issues

**White Screen:**
- Check Metro bundler is running
- Check for JavaScript errors in console
- Verify all imports are correct
- Try reloading: shake device → "Reload"

**Touch Controls Not Working:**
- Verify react-native-gesture-handler is installed
- Check GestureHandlerRootView wraps content
- Test on physical device (simulator touch can be finicky)

**Entities Not Rendering:**
- Check server is sending gameStateUpdate events
- Verify EntityFactory handles entity type
- Check console for errors in entity creation
- Verify extensions are properly deserialized

---

## Next Steps

### Recommended Enhancements

1. **Visual Improvements**
   - Add sprite rendering
   - Implement particle effects
   - Add animations (walk, attack, death)
   - Improve lighting for day/night cycle

2. **Gameplay Features**
   - Inventory system UI
   - Crafting interface
   - Building placement
   - Weapon switching
   - Item pickup

3. **UI Enhancements**
   - Minimap
   - Player list
   - Chat system
   - Settings menu
   - Death screen / respawn UI

4. **Performance**
   - Entity pooling
   - Sprite batching
   - Level of detail (LOD) system
   - Network interpolation

5. **Polish**
   - Sound effects
   - Music
   - Haptic feedback
   - Tutorial/onboarding
   - Achievements

### Learning Resources

- **React Native**: https://reactnative.dev/docs/getting-started
- **React Native Skia**: https://shopify.github.io/react-native-skia/
- **Socket.io**: https://socket.io/docs/v4/
- **ECS Pattern**: https://en.wikipedia.org/wiki/Entity_component_system
- **Game Development**: https://gameprogrammingpatterns.com/

---

## Summary

Survive the Night - Mobile Edition is a well-architected multiplayer game client built with modern React Native practices. The Entity-Component System provides flexibility for adding new game features, while client-side prediction ensures responsive gameplay. The modular architecture makes it easy to extend with new entities, components, and UI elements.

The codebase is designed as a minimal but complete foundation that can be expanded with additional features like inventory systems, crafting, building, and more sophisticated rendering.

Happy coding! 🎮
