/**
 * HUD Component
 * Heads-up display showing game info
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {GameState} from '../client/GameState';

interface HUDProps {
  gameState: GameState;
}

export const HUD: React.FC<HUDProps> = ({gameState}) => {
  const player = gameState.getPlayer();
  const health = player?.getHealth();
  const healthPercent = health ? health.getHealthPercentage() * 100 : 0;

  const connectionStatus = gameState.isConnected ? 'Connected' : 'Disconnected';
  const dayStatus = gameState.isDay ? 'Day' : 'Night';

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.infoText}>
          {connectionStatus} | {dayStatus} {gameState.dayNumber}
        </Text>
        <Text style={styles.infoText}>
          Entities: {gameState.getEntitiesArray().length}
        </Text>
      </View>

      {/* Health bar */}
      {health && (
        <View style={styles.healthContainer}>
          <Text style={styles.healthText}>Health</Text>
          <View style={styles.healthBarBackground}>
            <View
              style={[
                styles.healthBarFill,
                {
                  width: `${healthPercent}%`,
                  backgroundColor: healthPercent > 50 ? '#4CAF50' : healthPercent > 25 ? '#FFC107' : '#F44336',
                },
              ]}
            />
          </View>
          <Text style={styles.healthValue}>
            {Math.round(health.getCurrentHealth())} / {health.getMaxHealth()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  healthContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  healthText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  healthBarBackground: {
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthValue: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});
