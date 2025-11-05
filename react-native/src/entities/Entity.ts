/**
 * Base Entity class
 * Entities are containers for extensions (ECS pattern)
 */

import {EntityType, RawEntity, ExtensionSerialized} from '../types';
import {Extension} from '../extensions/Extension';
import {Positionable} from '../extensions/Positionable';
import {Movable} from '../extensions/Movable';
import {Renderable} from '../extensions/Renderable';
import {Health} from '../extensions/Health';

export abstract class Entity {
  protected id: string;
  protected type: EntityType;
  protected extensions: Map<string, Extension>;

  constructor(id: string, type: EntityType) {
    this.id = id;
    this.type = type;
    this.extensions = new Map();
  }

  public getId(): string {
    return this.id;
  }

  public getType(): EntityType {
    return this.type;
  }

  // Extension management
  public hasExtension(type: string): boolean {
    return this.extensions.has(type);
  }

  public getExtension<T extends Extension>(type: string): T | null {
    return (this.extensions.get(type) as T) || null;
  }

  public addExtension(extension: Extension): void {
    this.extensions.set(extension.getType(), extension);
  }

  public removeExtension(type: string): void {
    const ext = this.extensions.get(type);
    if (ext && ext.onRemove) {
      ext.onRemove();
    }
    this.extensions.delete(type);
  }

  // Convenience getters for common extensions
  public getPositionable(): Positionable | null {
    return this.getExtension<Positionable>('positionable');
  }

  public getMovable(): Movable | null {
    return this.getExtension<Movable>('movable');
  }

  public getRenderable(): Renderable | null {
    return this.getExtension<Renderable>('renderable');
  }

  public getHealth(): Health | null {
    return this.getExtension<Health>('health');
  }

  // Update all extensions
  public update(deltaTime: number): void {
    this.extensions.forEach(ext => {
      if (ext.update) {
        ext.update(deltaTime);
      }
    });
  }

  // Serialization for network sync
  public serialize(): RawEntity {
    const extensionData: ExtensionSerialized[] = [];
    this.extensions.forEach(ext => {
      extensionData.push(ext.serialize());
    });

    return {
      id: this.id,
      type: this.type,
      extensions: extensionData,
    };
  }

  // Deserialization from server
  public deserialize(data: RawEntity): void {
    // Update existing extensions
    if (data.extensions) {
      data.extensions.forEach(extData => {
        const ext = this.extensions.get(extData.type);
        if (ext) {
          ext.deserialize(extData);
        }
      });
    }

    // Remove extensions that server says to remove
    if (data.removedExtensions) {
      data.removedExtensions.forEach(type => {
        this.removeExtension(type);
      });
    }
  }
}
