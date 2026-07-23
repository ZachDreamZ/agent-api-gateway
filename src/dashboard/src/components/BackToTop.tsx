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
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      aria-label="Back to top"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: '#3C5A78',
        border: '1px solid #3C5A78',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#2E4760';
        e.currentTarget.style.borderColor = '#2E4760';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#3C5A78';
        e.currentTarget.style.borderColor = '#3C5A78';
      }}
    >
      <ArrowUp className="w-5 h-5 text-white" />
    </button>
  );
}
