"use client";

import { useEffect, useState } from "react";

export function CursorGlow() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initialize cursor glow effect
    const handleMouseMove = (e: MouseEvent) => {
      // Set the cursor pseudo-element position using CSS variables
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
      
      // Add active class if not already present
      if (!document.body.classList.contains('cursor-active')) {
        document.body.classList.add('cursor-active');
      }
      
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      document.body.classList.remove('cursor-active');
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      document.body.classList.add('cursor-active');
      setIsVisible(true);
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Show real cursor when hovering over interactive elements
    const handleInteractiveElements = () => {
      const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
      
      interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
          document.body.style.cursor = 'pointer';
        });
        
        element.addEventListener('mouseleave', () => {
          document.body.style.cursor = 'none';
        });
      });
    };

    // Call once and then observe DOM changes to handle dynamically added elements
    handleInteractiveElements();
    
    const observer = new MutationObserver(handleInteractiveElements);
    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up event listeners and observer when component unmounts
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      observer.disconnect();
      document.body.style.cursor = '';
      document.body.classList.remove('cursor-active');
    };
  }, []);

  return null; // This component doesn't render anything visible
}