/**
 * Socket.io Manager
 * Handles connection to game server
 */

import {io, Socket} from 'socket.io-client';
import {GAME_CONFIG} from '../types';

export class SocketManager {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(
    private serverUrl: string = GAME_CONFIG.SERVER_URL,
    private playerName: string = 'Player'
  ) {}

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Connect to server with player name
        this.socket = io(`${this.serverUrl}?displayName=${this.playerName}`, {
          forceNew: true,
          transports: ['websocket'],
        });

        // Connection handlers
        this.socket.on('connect', () => {
          console.log('Connected to server:', this.socket?.id);
          this.connected = true;

          // Request full game state
          this.emit('requestFullState');

          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from server');
          this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });

        // Forward all events to registered handlers
        this.socket.onAny((eventName, ...args) => {
          this.triggerHandlers(eventName, ...args);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  // Register event handler
  public on(eventName: string, handler: Function): void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName)!.push(handler);
  }

  // Remove event handler
  public off(eventName: string, handler: Function): void {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Emit event to server
  public emit(eventName: string, ...args: any[]): void {
    if (this.socket && this.connected) {
      this.socket.emit(eventName, ...args);
    } else {
      console.warn(`Cannot emit ${eventName}: not connected`);
    }
  }

  // Trigger registered handlers for an event
  private triggerHandlers(eventName: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in handler for ${eventName}:`, error);
        }
      });
    }
  }
}
