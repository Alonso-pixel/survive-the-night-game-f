/**
 * Bullet Entity
 */

import {Entity} from './Entity';
import {EntityType} from '../types';
import {Positionable} from '../extensions/Positionable';
import {Movable} from '../extensions/Movable';
import {Renderable} from '../extensions/Renderable';

export class Bullet extends Entity {
  constructor(id: string, x: number = 0, y: number = 0) {
    super(id, EntityType.BULLET);

    // Add core extensions
    this.addExtension(new Positionable(this, x, y, 8, 8));
    this.addExtension(new Movable(this));
    this.addExtension(new Renderable(this, '#FFEB3B', 'circle', 4));
  }
}
