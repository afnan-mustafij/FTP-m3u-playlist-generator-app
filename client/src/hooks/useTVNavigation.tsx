import { useEffect, useRef } from 'react';

interface UseTVNavigationOptions {
  enabled?: boolean;
  selector?: string;
  onDirection?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect?: () => void;
  onBack?: () => void;
}

export function useTVNavigation({
  enabled = true,
  selector = '[tabindex]:not([tabindex="-1"])',
  onDirection,
  onSelect,
  onBack
}: UseTVNavigationOptions = {}) {
  const currentIndex = useRef<number>(0);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Only apply TV navigation on large screens
    const isTVMode = window.innerWidth >= 1200;
    if (!isTVMode) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const focusableElements = Array.from(
        document.querySelectorAll(selector)
      ) as HTMLElement[];
      
      if (focusableElements.length === 0) return;
      
      // Handle arrow navigation
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (onDirection) onDirection('up');
          
          currentIndex.current = Math.max(0, currentIndex.current - 1);
          focusableElements[currentIndex.current]?.focus();
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          if (onDirection) onDirection('down');
          
          currentIndex.current = Math.min(
            focusableElements.length - 1,
            currentIndex.current + 1
          );
          focusableElements[currentIndex.current]?.focus();
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          if (onDirection) onDirection('left');
          // Default left navigation can be added if needed
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          if (onDirection) onDirection('right');
          // Default right navigation can be added if needed
          break;
          
        case 'Enter':
          if (onSelect) {
            e.preventDefault();
            onSelect();
          }
          break;
          
        case 'Escape':
        case 'Backspace':
          if (onBack) {
            e.preventDefault();
            onBack();
          }
          break;
      }
    };
    
    // Set initial focus
    const focusableElements = Array.from(
      document.querySelectorAll(selector)
    ) as HTMLElement[];
    
    if (focusableElements.length > 0) {
      setTimeout(() => {
        focusableElements[0]?.focus();
      }, 100);
    }
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, selector, onDirection, onSelect, onBack]);
}

export default useTVNavigation;
