/**
 * Health Extension
 * Handles entity health and damage
 */

import {Extension} from './Extension';
import {ExtensionSerialized, ExtensionType} from '../types';

export class Health extends Extension {
  private currentHealth: number;
  private maxHealth: number;

  constructor(entity: any, maxHealth: number = 100) {
    super(entity);
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
  }

  public getType(): string {
    return ExtensionType.HEALTH;
  }

  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public getHealthPercentage(): number {
    return this.currentHealth / this.maxHealth;
  }

  public setHealth(health: number): void {
    this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
  }

  public damage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
  }

  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }

  public isDead(): boolean {
    return this.currentHealth <= 0;
  }

  public serialize(): ExtensionSerialized {
    return {
      type: this.getType(),
      currentHealth: this.currentHealth,
      maxHealth: this.maxHealth,
    };
  }

  public deserialize(data: ExtensionSerialized): void {
    if (data.currentHealth !== undefined) this.currentHealth = data.currentHealth;
    if (data.maxHealth !== undefined) this.maxHealth = data.maxHealth;
  }
}
