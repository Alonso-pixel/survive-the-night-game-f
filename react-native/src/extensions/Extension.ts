/**
 * Base Extension class
 * Extensions are components that can be attached to entities
 */

import {ExtensionSerialized} from '../types';

export abstract class Extension {
  protected entity: any;

  constructor(entity: any) {
    this.entity = entity;
  }

  public abstract getType(): string;

  public abstract serialize(): ExtensionSerialized;

  public abstract deserialize(data: ExtensionSerialized): void;

  public update?(deltaTime: number): void;

  public onRemove?(): void;
}
