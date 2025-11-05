/**
 * Shared type definitions for mobile game client
 */

import {Vector2} from '../utils/Vector2';

// Entity types
export enum EntityType {
  PLAYER = 'player',
  ZOMBIE = 'zombie',
  FAST_ZOMBIE = 'fast_zombie',
  BIG_ZOMBIE = 'big_zombie',
  BULLET = 'bullet',
  ITEM = 'item',
}

// Extension types
export enum ExtensionType {
  POSITIONABLE = 'positionable',
  MOVABLE = 'movable',
  RENDERABLE = 'renderable',
  HEALTH = 'health',
}

// Game state
export interface GameState {
  playerId: string | null;
  entities: Map<string, any>;
  isConnected: boolean;
  isDay: boolean;
  dayNumber: number;
  cycleStartTime: number;
  cycleDuration: number;
}

// Player input
export interface PlayerInput {
  dx: number; // -1, 0, 1
  dy: number; // -1, 0, 1
  fire: boolean;
  facing: number; // angle in radians
  sprint: boolean;
}

// Network event types
export interface RawEntity {
  id: string;
  type: EntityType;
  extensions?: ExtensionSerialized[];
  removedExtensions?: string[];
}

export interface ExtensionSerialized {
  type: string;
  [key: string]: any;
}

// Socket.io event interfaces
export interface GameStateUpdateEvent {
  entities: RawEntity[];
  isFullState: boolean;
  gameTime: number;
}

export interface MapData {
  width: number;
  height: number;
  chunks: any[];
}

// Rendering
export interface RenderContext {
  canvas: any; // Skia canvas
  camera: {
    x: number;
    y: number;
    zoom: number;
  };
  screenWidth: number;
  screenHeight: number;
}

// Constants
export const GAME_CONFIG = {
  SERVER_URL: 'http://localhost:3000',
  PLAYER_SPEED: 60,
  SPRINT_MULTIPLIER: 1.5,
  RENDER_RADIUS: 800,
  TICK_RATE: 30,
  FPS: 60,
  MAX_DELTA: 0.1,
};
