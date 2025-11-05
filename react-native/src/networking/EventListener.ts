/**
 * Event Listener
 * Handles game events from server
 */

import {SocketManager} from './SocketManager';
import {EntityFactory} from '../entities/EntityFactory';
import {GameStateUpdateEvent, MapData} from '../types';

export class EventListener {
  private entityFactory: EntityFactory;

  constructor(
    private socketManager: SocketManager,
    private gameState: any, // Reference to game state
    private callbacks: {
      onYourId?: (id: string) => void;
      onMap?: (mapData: MapData) => void;
      onGameStateUpdate?: () => void;
    } = {}
  ) {
    this.entityFactory = new EntityFactory();
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    // Player ID assignment
    this.socketManager.on('yourId', (id: string) => {
      console.log('Received player ID:', id);
      this.gameState.playerId = id;
      if (this.callbacks.onYourId) {
        this.callbacks.onYourId(id);
      }
    });

    // Map data
    this.socketManager.on('map', (mapData: MapData) => {
      console.log('Received map data');
      if (this.callbacks.onMap) {
        this.callbacks.onMap(mapData);
      }
    });

    // Game state updates
    this.socketManager.on('gameStateUpdate', (data: GameStateUpdateEvent) => {
      this.handleGameStateUpdate(data);
    });

    // Day/night cycle
    this.socketManager.on('dayNightCycle', (data: any) => {
      this.gameState.isDay = data.isDay;
      this.gameState.dayNumber = data.dayNumber;
      this.gameState.cycleStartTime = data.cycleStartTime;
      this.gameState.cycleDuration = data.cycleDuration;
    });

    // Player events
    this.socketManager.on('playerJoined', (data: any) => {
      console.log('Player joined:', data);
    });

    this.socketManager.on('playerLeft', (data: any) => {
      console.log('Player left:', data);
    });

    this.socketManager.on('playerDeath', (data: any) => {
      console.log('Player died:', data);
    });

    // Zombie events
    this.socketManager.on('zombieDeath', (data: any) => {
      console.log('Zombie died:', data);
    });

    // Connection status
    this.socketManager.on('connect', () => {
      this.gameState.isConnected = true;
    });

    this.socketManager.on('disconnect', () => {
      this.gameState.isConnected = false;
    });
  }

  private handleGameStateUpdate(data: GameStateUpdateEvent): void {
    const {entities, isFullState} = data;

    if (isFullState) {
      // Full state: replace all entities
      this.gameState.entities.clear();
      entities.forEach(rawEntity => {
        const entity = this.entityFactory.createEntity(rawEntity);
        if (entity) {
          this.gameState.entities.set(entity.getId(), entity);
        }
      });
    } else {
      // Partial update: update or create entities
      entities.forEach(rawEntity => {
        const existing = this.gameState.entities.get(rawEntity.id);
        if (existing) {
          // Update existing entity
          existing.deserialize(rawEntity);
        } else {
          // Create new entity
          const entity = this.entityFactory.createEntity(rawEntity);
          if (entity) {
            this.gameState.entities.set(entity.getId(), entity);
          }
        }
      });
    }

    // Trigger callback
    if (this.callbacks.onGameStateUpdate) {
      this.callbacks.onGameStateUpdate();
    }
  }
}
