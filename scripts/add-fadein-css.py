import sys

# Read the CSS file
with open('src/dashboard/src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if fadeIn animation already exists
if '@keyframes fadeIn' in content:
    print("fadeIn animation already exists")
    sys.exit(0)

# Add fadeIn animation at the end
fadein_animation = '''
/* Tooltip fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
'''

content += fadein_animation

# Write back
with open('src/dashboard/src/index.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added fadeIn animation to CSS")
