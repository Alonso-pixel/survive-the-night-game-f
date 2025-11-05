/**
 * Game Screen Component
 * Main game screen that integrates all components
 */

import React, {useEffect, useState, useCallback} from 'react';
import {View, StyleSheet, Dimensions, Text, ActivityIndicator} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {GameClient} from '../client/GameClient';
import {GameCanvas} from '../rendering/GameCanvas';
import {Joystick} from './Joystick';
import {ActionButtons} from './ActionButtons';
import {HUD} from './HUD';
import {JoystickState} from '../input/types';

const {width, height} = Dimensions.get('window');

export default function GameScreen() {
  const [gameClient] = useState(() => new GameClient('http://localhost:3000', 'MobilePlayer'));
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const connectToServer = async () => {
      try {
        setIsLoading(true);
        await gameClient.connect();
        setIsConnected(true);
        setIsLoading(false);

        // Start game loop with render callback
        gameClient.start(() => {
          // Force re-render on each game update
          forceUpdate({});
        });
      } catch (err) {
        console.error('Failed to connect:', err);
        setError('Failed to connect to server');
        setIsLoading(false);
      }
    };

    connectToServer();

    return () => {
      gameClient.stop();
      gameClient.disconnect();
    };
  }, [gameClient]);

  const handleJoystickUpdate = useCallback(
    (state: JoystickState) => {
      gameClient.getInputManager().updateJoystick(state);
    },
    [gameClient]
  );

  const handleFirePress = useCallback(
    (pressed: boolean) => {
      gameClient.getInputManager().updateButtons({fire: pressed});
    },
    [gameClient]
  );

  const handleSprintPress = useCallback(
    (pressed: boolean) => {
      gameClient.getInputManager().updateButtons({sprint: pressed});
    },
    [gameClient]
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.statusText}>Connecting to server...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.statusText}>
          Make sure the game server is running on localhost:3000
        </Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.statusText}>Not connected</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Game Canvas */}
      <GameCanvas gameState={gameClient.getGameState()} width={width} height={height} />

      {/* HUD Overlay */}
      <HUD gameState={gameClient.getGameState()} />

      {/* Controls Overlay */}
      <View style={styles.controlsOverlay}>
        {/* Left side - Joystick */}
        <View style={styles.leftControls}>
          <Joystick onUpdate={handleJoystickUpdate} />
        </View>

        {/* Right side - Action Buttons */}
        <View style={styles.rightControls}>
          <ActionButtons onFirePress={handleFirePress} onSprintPress={handleSprintPress} />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  leftControls: {
    flex: 0,
  },
  rightControls: {
    flex: 0,
  },
});
