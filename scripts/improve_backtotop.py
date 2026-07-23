content = '''import React, { useState, useEffect } from 'react';
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
      className=\"fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110\"
      aria-label=\"Back to top\"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'var(--color-accent-base)',
        color: 'var(--color-bg-surface)',
        border: '1px solid var(--color-accent-base)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-accent-hover)';
        e.currentTarget.style.borderColor = 'var(--color-accent-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-accent-base)';
        e.currentTarget.style.borderColor = 'var(--color-accent-base)';
      }}
    >
      <ArrowUp className=\"w-5 h-5\" strokeWidth={2.5} />
    </button>
  );
}
'''

with open('src/dashboard/src/components/BackToTop.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Improved BackToTop component with proper accent colors')
