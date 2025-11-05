/**
 * Renderable Extension
 * Handles entity rendering properties
 */

import {Extension} from './Extension';
import {ExtensionSerialized, ExtensionType} from '../types';

export class Renderable extends Extension {
  private color: string;
  private shape: 'circle' | 'rect';
  private radius?: number;

  constructor(entity: any, color: string = '#ffffff', shape: 'circle' | 'rect' = 'circle', radius?: number) {
    super(entity);
    this.color = color;
    this.shape = shape;
    this.radius = radius;
  }

  public getType(): string {
    return ExtensionType.RENDERABLE;
  }

  public getColor(): string {
    return this.color;
  }

  public getShape(): 'circle' | 'rect' {
    return this.shape;
  }

  public getRadius(): number | undefined {
    return this.radius;
  }

  public setColor(color: string): void {
    this.color = color;
  }

  public serialize(): ExtensionSerialized {
    return {
      type: this.getType(),
      color: this.color,
      shape: this.shape,
      radius: this.radius,
    };
  }

  public deserialize(data: ExtensionSerialized): void {
    if (data.color) this.color = data.color;
    if (data.shape) this.shape = data.shape;
    if (data.radius !== undefined) this.radius = data.radius;
  }
}
