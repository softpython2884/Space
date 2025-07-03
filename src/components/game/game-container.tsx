'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlayerShip } from './player-ship';
import { GameMap } from './game-map';

const useKeyPress = () => {
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeysPressed((prevKeys) => new Set(prevKeys).add(event.key.toLowerCase()));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeysPressed((prevKeys) => {
        const newKeys = new Set(prevKeys);
        newKeys.delete(event.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keysPressed;
};


export function GameContainer() {
  const [position, setPosition] = useState({ x: 400, y: 300 });
  const keysPressed = useKeyPress();
  const speed = 5;

  const movePlayer = useCallback(() => {
    setPosition((prevPos) => {
      let { x, y } = prevPos;
      if (keysPressed.has('arrowup') || keysPressed.has('w')) {
        y -= speed;
      }
      if (keysPressed.has('arrowdown') || keysPressed.has('s')) {
        y += speed;
      }
      if (keysPressed.has('arrowleft') || keysPressed.has('a')) {
        x -= speed;
      }
      if (keysPressed.has('arrowright') || keysPressed.has('d')) {
        x += speed;
      }
      return { x, y };
    });
  }, [keysPressed]);

  useEffect(() => {
    let animationFrameId: number;
    const gameLoop = () => {
      movePlayer();
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    animationFrameId = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };

  }, [movePlayer]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <GameMap />
      <PlayerShip x={position.x} y={position.y} />
    </div>
  );
}
