import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-surface border border-border shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
      aria-label="Back to top"
      style={{
        backdropFilter: 'blur(12px)',
        background: 'oklch(0.98 0.008 195 / 0.9)',
      }}
    >
      <ArrowUp className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
    </button>
  );
}
