/**
 * Input Manager
 * Manages mobile touch input state
 */

import {PlayerInput} from '../types';
import {MobileInput, JoystickState, ButtonState} from './types';

export class InputManager {
  private input: MobileInput = {
    joystick: {
      active: false,
      direction: {x: 0, y: 0},
      angle: 0,
      distance: 0,
    },
    buttons: {
      fire: false,
      sprint: false,
    },
    hasChanged: false,
  };

  private previousInput: MobileInput;

  constructor() {
    this.previousInput = JSON.parse(JSON.stringify(this.input));
  }

  // Update joystick state
  public updateJoystick(state: JoystickState): void {
    this.input.joystick = {...state};
    this.checkForChanges();
  }

  // Update button state
  public updateButtons(buttons: Partial<ButtonState>): void {
    this.input.buttons = {...this.input.buttons, ...buttons};
    this.checkForChanges();
  }

  // Convert mobile input to game input format
  public getPlayerInput(): PlayerInput {
    const joystick = this.input.joystick;

    return {
      dx: joystick.active ? joystick.direction.x : 0,
      dy: joystick.active ? joystick.direction.y : 0,
      fire: this.input.buttons.fire,
      facing: joystick.angle,
      sprint: this.input.buttons.sprint,
    };
  }

  public hasChanged(): boolean {
    return this.input.hasChanged;
  }

  public resetChanged(): void {
    this.input.hasChanged = false;
    this.previousInput = JSON.parse(JSON.stringify(this.input));
  }

  private checkForChanges(): void {
    // Check if input has changed from previous state
    const current = JSON.stringify(this.input);
    const previous = JSON.stringify(this.previousInput);
    this.input.hasChanged = current !== previous;
  }

  // Get raw input state (for debugging)
  public getRawInput(): MobileInput {
    return this.input;
  }
}
