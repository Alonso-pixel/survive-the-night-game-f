/**
 * Action Buttons Component
 * Fire and Sprint buttons
 */

import React from 'react';
import {View, StyleSheet, Text, Pressable} from 'react-native';

interface ActionButtonsProps {
  onFirePress: (pressed: boolean) => void;
  onSprintPress: (pressed: boolean) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onFirePress,
  onSprintPress,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={({pressed}) => [styles.button, styles.sprintButton, pressed && styles.buttonPressed]}
        onPressIn={() => onSprintPress(true)}
        onPressOut={() => onSprintPress(false)}
      >
        <Text style={styles.buttonText}>Sprint</Text>
      </Pressable>

      <Pressable
        style={({pressed}) => [styles.button, styles.fireButton, pressed && styles.buttonPressed]}
        onPressIn={() => onFirePress(true)}
        onPressOut={() => onFirePress(false)}
      >
        <Text style={styles.buttonText}>Fire</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'flex-end',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  fireButton: {
    backgroundColor: 'rgba(255, 82, 82, 0.6)',
    borderColor: 'rgba(255, 82, 82, 0.9)',
  },
  sprintButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.6)',
    borderColor: 'rgba(33, 150, 243, 0.9)',
  },
  buttonPressed: {
    opacity: 0.5,
    transform: [{scale: 0.95}],
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
