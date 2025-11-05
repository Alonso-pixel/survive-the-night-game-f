/**
 * Survive the Night - Mobile Edition
 * Main App Component
 */

import React from 'react';
import {SafeAreaView, StyleSheet, StatusBar} from 'react-native';
import GameScreen from './src/ui/GameScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <GameScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
