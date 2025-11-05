/**
 * Game Canvas Component
 * Renders the game using React Native Skia
 */

import React, {useCallback} from 'react';
import {Canvas, useCanvasRef, Circle, Rect, Paint} from '@shopify/react-native-skia';
import {StyleSheet, Dimensions} from 'react-native';
import {GameState} from '../client/GameState';
import {Entity} from '../entities/Entity';
import {Positionable} from '../extensions/Positionable';
import {Renderable} from '../extensions/Renderable';
import {Vector2} from '../utils/Vector2';

interface GameCanvasProps {
  gameState: GameState;
  width: number;
  height: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({gameState, width, height}) => {
  const renderEntities = useCallback(() => {
    const entities = gameState.getEntitiesArray();
    const player = gameState.getPlayer();
    const playerPos = player?.getPositionable()?.getCenterPosition() || new Vector2(0, 0);

    // Camera centered on player
    const cameraX = width / 2 - playerPos.x;
    const cameraY = height / 2 - playerPos.y;

    return entities.map(entity => {
      const positionable = entity.getPositionable();
      const renderable = entity.getRenderable();

      if (!positionable || !renderable) return null;

      const pos = positionable.getCenterPosition();
      const size = positionable.getSize();
      const color = renderable.getColor();
      const shape = renderable.getShape();

      // Apply camera transform
      const screenX = pos.x + cameraX;
      const screenY = pos.y + cameraY;

      // Only render if on screen
      if (
        screenX < -100 ||
        screenX > width + 100 ||
        screenY < -100 ||
        screenY > height + 100
      ) {
        return null;
      }

      if (shape === 'circle') {
        const radius = renderable.getRadius() || size.x / 2;
        return (
          <Circle
            key={entity.getId()}
            cx={screenX}
            cy={screenY}
            r={radius}
            color={color}
          />
        );
      } else {
        return (
          <Rect
            key={entity.getId()}
            x={screenX - size.x / 2}
            y={screenY - size.y / 2}
            width={size.x}
            height={size.y}
            color={color}
          />
        );
      }
    });
  }, [gameState, width, height]);

  return (
    <Canvas style={styles.canvas}>
      {/* Background */}
      <Rect x={0} y={0} width={width} height={height} color="#1a1a1a" />

      {/* Render entities */}
      {renderEntities()}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
