/**
 * Input types for mobile controls
 */

export interface TouchPosition {
  x: number;
  y: number;
}

export interface JoystickState {
  active: boolean;
  direction: {
    x: number; // -1 to 1
    y: number; // -1 to 1
  };
  angle: number; // radians
  distance: number; // 0 to 1
}

export interface ButtonState {
  fire: boolean;
  sprint: boolean;
}

export interface MobileInput {
  joystick: JoystickState;
  buttons: ButtonState;
  hasChanged: boolean;
}
