import { useEffect, useEffectEvent, useRef } from "react";

/**
 * Tracks the currently pressed movement keys and exposes them through a stable ref.
 */
export function useKeyboard() {
  const pressedKeysRef = useRef(new Set<string>());

  /**
   * Adds or removes a key code from the pressed-key set when keyboard state changes.
   */
  const handleKeyChange = useEffectEvent((event: KeyboardEvent, isPressed: boolean) => {
    if (isPressed) {
      pressedKeysRef.current.add(event.code);
      return;
    }

    pressedKeysRef.current.delete(event.code);
  });

  useEffect(() => {
    /**
     * Marks a key as pressed when the browser reports a keydown event.
     */
    const handleKeyDown = (event: KeyboardEvent) => handleKeyChange(event, true);

    /**
     * Marks a key as released when the browser reports a keyup event.
     */
    const handleKeyUp = (event: KeyboardEvent) => handleKeyChange(event, false);

    /**
     * Clears all tracked input when the window loses focus.
     */
    const clearPressedKeys = () => pressedKeysRef.current.clear();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearPressedKeys);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearPressedKeys);
    };
  }, [handleKeyChange]);

  return pressedKeysRef;
}
