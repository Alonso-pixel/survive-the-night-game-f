/**
 * Positionable Extension
 * Handles entity position and size
 */

import {Extension} from './Extension';
import {Vector2} from '../utils/Vector2';
import {ExtensionSerialized, ExtensionType} from '../types';

export class Positionable extends Extension {
  private position: Vector2;
  private size: Vector2;

  constructor(entity: any, x: number = 0, y: number = 0, width: number = 32, height: number = 32) {
    super(entity);
    this.position = new Vector2(x, y);
    this.size = new Vector2(width, height);
  }

  public getType(): string {
    return ExtensionType.POSITIONABLE;
  }

  public getPosition(): Vector2 {
    return this.position.clone();
  }

  public getCenterPosition(): Vector2 {
    return new Vector2(
      this.position.x + this.size.x / 2,
      this.position.y + this.size.y / 2
    );
  }

  public getSize(): Vector2 {
    return this.size.clone();
  }

  public setPosition(pos: Vector2): void {
    this.position = pos.clone();
  }

  public setSize(size: Vector2): void {
    this.size = size.clone();
  }

  public serialize(): ExtensionSerialized {
    return {
      type: this.getType(),
      position: {x: this.position.x, y: this.position.y},
      size: {x: this.size.x, y: this.size.y},
    };
  }

  public deserialize(data: ExtensionSerialized): void {
    if (data.position) {
      this.position.set(data.position.x, data.position.y);
    }
    if (data.size) {
      this.size.set(data.size.x, data.size.y);
    }
  }
}
