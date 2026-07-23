import re

with open('src/dashboard/src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if animations already exist
if '@keyframes fade-in' in content:
    print('Animations already exist')
else:
    # Find the end of the file or a good insertion point
    animation_css = '''

/* ─── Animations ────────────────────────────────────────────────────────── */

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 var(--color-accent-aura);
  }
  50% {
    box-shadow: 0 0 0 8px transparent;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Animation utility classes */
.animate-fade-in {
  animation: fade-in var(--dur-slow) var(--ease-out);
}

.animate-fade-in-up {
  animation: fade-in-up var(--dur-slow) var(--ease-out);
}

.animate-fade-in-down {
  animation: fade-in-down var(--dur-slow) var(--ease-out);
}

.animate-slide-in-right {
  animation: slide-in-right var(--dur-slow) var(--ease-out);
}

.animate-slide-in-left {
  animation: slide-in-left var(--dur-slow) var(--ease-out);
}

.animate-scale-in {
  animation: scale-in var(--dur-slow) var(--ease-out);
}

.animate-pulse-glow {
  animation: pulse-glow 2s var(--ease-in-out) infinite;
}

/* Stagger delays for sequential animations */
.animation-delay-100 {
  animation-delay: 100ms;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

.animation-delay-500 {
  animation-delay: 500ms;
}

/* Hover lift effect */
.hover-lift {
  transition: transform var(--dur-normal) var(--ease-out), box-shadow var(--dur-normal) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Interactive glow */
.interactive-glow {
  position: relative;
  overflow: hidden;
}

.interactive-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--color-accent-aura), transparent 50%);
  opacity: 0;
  transition: opacity var(--dur-normal) var(--ease-out);
  pointer-events: none;
}

.interactive-glow:hover::before {
  opacity: 1;
}
'''
    
    # Append to the end of the file
    content += animation_css
    
    with open('src/dashboard/src/index.css', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('Added animation utilities to CSS')
