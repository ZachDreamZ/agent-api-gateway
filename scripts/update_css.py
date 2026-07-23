import os

# Read existing CSS
with open('src/dashboard/src/index.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Check if animation already exists
if '@keyframes slide-in' not in css_content:
    # Add the animation at the end, before the closing brace if any
    animation_css = '''
/* Toast animations */
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
'''
    
    # Append to the end of the file
    with open('src/dashboard/src/index.css', 'a', encoding='utf-8') as f:
        f.write(animation_css)
    
    print('Added slide-in animation to CSS')
else:
    print('Animation already exists')
