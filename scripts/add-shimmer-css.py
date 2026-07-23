import sys

# Read the CSS file
with open('src/dashboard/src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if shimmer animation already exists
if 'shimmer' in content:
    print("Shimmer animation already exists")
    sys.exit(0)

# Add shimmer animation at the end
shimmer_animation = '''
/* Loading skeleton shimmer animation */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
'''

content += shimmer_animation

# Write back
with open('src/dashboard/src/index.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added shimmer animation to CSS")
