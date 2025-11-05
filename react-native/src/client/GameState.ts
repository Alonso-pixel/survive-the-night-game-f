/**
 * Game State
 * Centralized game state management
 */

import {GameState as IGameState} from '../types';
import {Entity} from '../entities/Entity';

export class GameState implements IGameState {
  public playerId: string | null = null;
  public entities: Map<string, Entity> = new Map();
  public isConnected: boolean = false;
  public isDay: boolean = true;
  public dayNumber: number = 1;
  public cycleStartTime: number = 0;
  public cycleDuration: number = 60000;

  public getPlayer(): Entity | null {
    if (!this.playerId) return null;
    return this.entities.get(this.playerId) || null;
  }

  public getEntitiesArray(): Entity[] {
    return Array.from(this.entities.values());
  }

  public clear(): void {
    this.entities.clear();
    this.playerId = null;
    this.isConnected = false;
  }
}
