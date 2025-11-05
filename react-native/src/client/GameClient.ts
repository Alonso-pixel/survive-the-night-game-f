/**
 * Game Client
 * Main game client controller
 */

import {SocketManager} from '../networking/SocketManager';
import {EventListener} from '../networking/EventListener';
import {InputManager} from '../input/InputManager';
import {GameState} from './GameState';
import {GAME_CONFIG, PlayerInput} from '../types';
import {Vector2} from '../utils/Vector2';
import {Positionable} from '../extensions/Positionable';
import {Movable} from '../extensions/Movable';

export class GameClient {
  private socketManager: SocketManager;
  private eventListener: EventListener;
  private inputManager: InputManager;
  public gameState: GameState;

  private isRunning: boolean = false;
  private lastUpdateTime: number = 0;
  private updateCallback?: () => void;

  constructor(serverUrl: string = GAME_CONFIG.SERVER_URL, playerName: string = 'Player') {
    this.gameState = new GameState();
    this.socketManager = new SocketManager(serverUrl, playerName);
    this.inputManager = new InputManager();

    this.eventListener = new EventListener(
      this.socketManager,
      this.gameState,
      {
        onYourId: (id: string) => {
          console.log('Player ID set:', id);
        },
        onMap: (mapData: any) => {
          console.log('Map received');
        },
        onGameStateUpdate: () => {
          this.onGameStateUpdate();
        },
      }
    );
  }

  public async connect(): Promise<void> {
    await this.socketManager.connect();
  }

  public disconnect(): void {
    this.stop();
    this.socketManager.disconnect();
    this.gameState.clear();
  }

  public start(updateCallback?: () => void): void {
    this.isRunning = true;
    this.lastUpdateTime = Date.now();
    this.updateCallback = updateCallback;
    this.startGameLoop();
  }

  public stop(): void {
    this.isRunning = false;
  }

  public getInputManager(): InputManager {
    return this.inputManager;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  private startGameLoop(): void {
    const loop = () => {
      if (!this.isRunning) return;

      const now = Date.now();
      const deltaTime = Math.min((now - this.lastUpdateTime) / 1000, GAME_CONFIG.MAX_DELTA);
      this.lastUpdateTime = now;

      this.update(deltaTime);

      // Schedule next update
      setTimeout(loop, 1000 / GAME_CONFIG.FPS);
    };

    loop();
  }

  private update(deltaTime: number): void {
    // Update all entities
    this.gameState.getEntitiesArray().forEach(entity => {
      entity.update(deltaTime);
    });

    // Apply client-side prediction for local player
    this.predictLocalPlayerMovement(deltaTime);

    // Send input to server if changed
    if (this.inputManager.hasChanged()) {
      const input = this.inputManager.getPlayerInput();
      this.sendInput(input);
      this.inputManager.resetChanged();
    }

    // Trigger render callback
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  private predictLocalPlayerMovement(deltaTime: number): void {
    const player = this.gameState.getPlayer();
    if (!player) return;

    const positionable = player.getPositionable();
    const movable = player.getMovable();
    if (!positionable || !movable) return;

    const input = this.inputManager.getPlayerInput();

    // Calculate movement
    if (input.dx !== 0 || input.dy !== 0) {
      const direction = new Vector2(input.dx, input.dy).normalize();
      const speed = GAME_CONFIG.PLAYER_SPEED * (input.sprint ? GAME_CONFIG.SPRINT_MULTIPLIER : 1);

      const velocity = direction.mul(speed);
      movable.setVelocity(velocity);

      // Update position
      const currentPos = positionable.getPosition();
      const newPos = currentPos.add(velocity.mul(deltaTime));
      positionable.setPosition(newPos);
    } else {
      movable.setVelocity(new Vector2(0, 0));
    }
  }

  private sendInput(input: PlayerInput): void {
    this.socketManager.emit('playerInput', input);
  }

  private onGameStateUpdate(): void {
    // Game state has been updated by EventListener
    // Could reconcile server position with client prediction here
  }

  public isConnected(): boolean {
    return this.gameState.isConnected;
  }
}
