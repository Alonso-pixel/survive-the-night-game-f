/**
 * Player Entity
 */

import {Entity} from './Entity';
import {EntityType} from '../types';
import {Positionable} from '../extensions/Positionable';
import {Movable} from '../extensions/Movable';
import {Renderable} from '../extensions/Renderable';
import {Health} from '../extensions/Health';

export class Player extends Entity {
  constructor(id: string, x: number = 0, y: number = 0) {
    super(id, EntityType.PLAYER);

    // Add core extensions
    this.addExtension(new Positionable(this, x, y, 32, 32));
    this.addExtension(new Movable(this));
    this.addExtension(new Renderable(this, '#4CAF50', 'circle', 16));
    this.addExtension(new Health(this, 100));
  }
}
