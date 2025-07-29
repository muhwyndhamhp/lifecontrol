import { useEffect } from 'react';
import { useAppStore } from '@lib/store';

export function useKeyboard() {
  const setKeys = useAppStore((store) => store.setKeys);

  useEffect(() => {
    const pressedKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (!pressedKeys.has(e.key)) {
        pressedKeys.add(e.key);
        setKeys(Array.from(pressedKeys));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (pressedKeys.delete(e.key)) {
        setKeys(Array.from(pressedKeys));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      setKeys([]);
    };
  }, [setKeys]);
}
