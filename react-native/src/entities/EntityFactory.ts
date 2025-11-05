/**
 * Entity Factory
 * Creates entities from raw network data
 */

import {Entity} from './Entity';
import {Player} from './Player';
import {Zombie} from './Zombie';
import {Bullet} from './Bullet';
import {EntityType, RawEntity} from '../types';

export class EntityFactory {
  public createEntity(data: RawEntity): Entity | null {
    let entity: Entity | null = null;

    // Create entity based on type
    switch (data.type) {
      case EntityType.PLAYER:
        entity = new Player(data.id);
        break;

      case EntityType.ZOMBIE:
      case EntityType.FAST_ZOMBIE:
      case EntityType.BIG_ZOMBIE:
        entity = new Zombie(data.id, 0, 0, data.type);
        break;

      case EntityType.BULLET:
        entity = new Bullet(data.id);
        break;

      default:
        console.warn(`Unknown entity type: ${data.type}`);
        return null;
    }

    // Deserialize entity data from server
    if (entity) {
      entity.deserialize(data);
    }

    return entity;
  }
}
