/**
 * Movable Extension
 * Handles entity velocity and movement
 */

import {Extension} from './Extension';
import {Vector2} from '../utils/Vector2';
import {ExtensionSerialized, ExtensionType} from '../types';

export class Movable extends Extension {
  private velocity: Vector2;

  constructor(entity: any, vx: number = 0, vy: number = 0) {
    super(entity);
    this.velocity = new Vector2(vx, vy);
  }

  public getType(): string {
    return ExtensionType.MOVABLE;
  }

  public getVelocity(): Vector2 {
    return this.velocity.clone();
  }

  public setVelocity(vel: Vector2): void {
    this.velocity = vel.clone();
  }

  public serialize(): ExtensionSerialized {
    return {
      type: this.getType(),
      velocity: {x: this.velocity.x, y: this.velocity.y},
    };
  }

  public deserialize(data: ExtensionSerialized): void {
    if (data.velocity) {
      this.velocity.set(data.velocity.x, data.velocity.y);
    }
  }
}
