import { useRef, useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";

interface SwipeBackNavigationProps {
  children: React.ReactNode;
}

export function SwipeBackNavigation({ children }: SwipeBackNavigationProps) {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [offset, setOffset] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isEdgeSwipe = useRef(false);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  
  const edgeThreshold = 30;
  const swipeThreshold = 100;
  const maxOffset = 150;

  const canGoBack = location !== "/" && location !== "/auth";

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!canGoBack) return;
    
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    
    isEdgeSwipe.current = touch.clientX <= edgeThreshold;
    isHorizontalSwipe.current = null;
    
    if (isEdgeSwipe.current) {
      setIsActive(true);
    }
  }, [canGoBack]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isEdgeSwipe.current || !canGoBack) return;
    
    const touch = e.touches[0];
    const diffX = touch.clientX - startX.current;
    const diffY = touch.clientY - startY.current;
    
    if (isHorizontalSwipe.current === null) {
      isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
    }
    
    if (isHorizontalSwipe.current && diffX > 0) {
      e.preventDefault();
      const newOffset = Math.min(diffX, maxOffset);
      setOffset(newOffset);
    }
  }, [canGoBack]);

  const handleTouchEnd = useCallback(() => {
    if (!isEdgeSwipe.current || !canGoBack) {
      setOffset(0);
      setIsActive(false);
      return;
    }
    
    if (offset >= swipeThreshold) {
      window.history.back();
    }
    
    setOffset(0);
    setIsActive(false);
    startX.current = 0;
    startY.current = 0;
    isEdgeSwipe.current = false;
    isHorizontalSwipe.current = null;
  }, [offset, canGoBack]);

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(offset / swipeThreshold, 1);
  const indicatorOpacity = progress;
  const indicatorScale = 0.5 + (progress * 0.5);
  const arrowRotation = progress * 180;

  return (
    <div className="relative">
      {isActive && canGoBack && (
        <>
          <div 
            className="fixed inset-y-0 left-0 z-50 pointer-events-none"
            style={{
              width: `${offset}px`,
              background: `linear-gradient(to right, rgba(168, 85, 247, ${0.1 * progress}), transparent)`,
            }}
          />
          
          <div
            className="fixed left-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
            style={{
              opacity: indicatorOpacity,
              transform: `translateY(-50%) scale(${indicatorScale})`,
              transition: offset === 0 ? "all 0.2s ease-out" : "none",
            }}
          >
            <div 
              className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
              style={{
                boxShadow: `0 0 ${20 * progress}px rgba(168, 85, 247, ${0.5 * progress})`,
              }}
            >
              <ChevronLeft 
                className="w-6 h-6 text-white" 
                style={{
                  transform: `translateX(${-2 + (progress * 4)}px)`,
                }}
              />
            </div>
          </div>
        </>
      )}
      
      <div
        style={{
          transform: isActive && offset > 0 ? `translateX(${offset * 0.3}px)` : "none",
          transition: offset === 0 ? "transform 0.2s ease-out" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
