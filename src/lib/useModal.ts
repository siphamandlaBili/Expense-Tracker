import { useEffect, type RefObject } from "react";

/**
 * Shared behaviour for popups and drawers while they are mounted: focus
 * `initialFocus`, lock page scroll, close on Escape, and hand focus back to
 * whatever had it before when the popup closes. Focus moves never scroll the
 * page, so the content behind doesn't jump.
 */
export function useModal(
  onClose: () => void,
  initialFocus: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    initialFocus.current?.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [onClose, initialFocus]);
}
