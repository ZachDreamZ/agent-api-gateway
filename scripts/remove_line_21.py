# Read CodeBlock.tsx
with open('src/dashboard/src/components/CodeBlock.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove line index 20 (0-based, which is line 21)
if len(lines) > 20:
    del lines[20]

# Write back
with open('src/dashboard/src/components/CodeBlock.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Removed line 21')
