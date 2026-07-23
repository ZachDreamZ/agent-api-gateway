import sys

# Read the CSS file
with open('src/dashboard/src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if slideUp animation already exists
if '@keyframes slideUp' in content:
    print("slideUp animation already exists")
    sys.exit(0)

# Add slideUp animation at the end
slideup_animation = '''
/* Modal slide up animation */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
'''

content += slideup_animation

# Write back
with open('src/dashboard/src/index.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added slideUp animation to CSS")
