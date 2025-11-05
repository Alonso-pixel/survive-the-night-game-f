/**
 * Zombie Entity
 */

import {Entity} from './Entity';
import {EntityType} from '../types';
import {Positionable} from '../extensions/Positionable';
import {Movable} from '../extensions/Movable';
import {Renderable} from '../extensions/Renderable';
import {Health} from '../extensions/Health';

export class Zombie extends Entity {
  constructor(id: string, x: number = 0, y: number = 0, type: EntityType = EntityType.ZOMBIE) {
    super(id, type);

    // Add core extensions
    this.addExtension(new Positionable(this, x, y, 32, 32));
    this.addExtension(new Movable(this));

    // Different colors for different zombie types
    let color = '#FF5252'; // red for normal zombie
    if (type === EntityType.FAST_ZOMBIE) {
      color = '#FFC107'; // yellow for fast zombie
    } else if (type === EntityType.BIG_ZOMBIE) {
      color = '#9C27B0'; // purple for big zombie
    }

    this.addExtension(new Renderable(this, color, 'circle', 16));
    this.addExtension(new Health(this, 50));
  }
}
