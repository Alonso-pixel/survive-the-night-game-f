/**
 * Virtual Joystick Component
 * Touch-based movement control
 */

import React, {useState, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {JoystickState} from '../input/types';

interface JoystickProps {
  onUpdate: (state: JoystickState) => void;
  size?: number;
}

export const Joystick: React.FC<JoystickProps> = ({onUpdate, size = 120}) => {
  const [position, setPosition] = useState({x: 0, y: 0});
  const maxDistance = size / 2 - 20;

  const panGesture = Gesture.Pan()
    .onStart(() => {
      setPosition({x: 0, y: 0});
    })
    .onUpdate(event => {
      const dx = event.translationX;
      const dy = event.translationY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const capped = Math.min(distance, maxDistance);

      let newX = dx;
      let newY = dy;

      if (distance > maxDistance) {
        newX = (dx / distance) * maxDistance;
        newY = (dy / distance) * maxDistance;
      }

      setPosition({x: newX, y: newY});

      // Calculate normalized direction
      const normalizedX = newX / maxDistance;
      const normalizedY = newY / maxDistance;
      const angle = Math.atan2(normalizedY, normalizedX);

      onUpdate({
        active: true,
        direction: {
          x: normalizedX,
          y: normalizedY,
        },
        angle: angle,
        distance: capped / maxDistance,
      });
    })
    .onEnd(() => {
      setPosition({x: 0, y: 0});
      onUpdate({
        active: false,
        direction: {x: 0, y: 0},
        angle: 0,
        distance: 0,
      });
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.container, {width: size, height: size}]}>
        <View style={[styles.base, {width: size, height: size, borderRadius: size / 2}]} />
        <View
          style={[
            styles.stick,
            {
              transform: [{translateX: position.x}, {translateY: position.y}],
            },
          ]}
        />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  base: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
  },
  stick: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
});
