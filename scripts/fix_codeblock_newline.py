# Read CodeBlock.tsx
with open('src/dashboard/src/components/CodeBlock.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and fix the broken split line (should be around line 20)
for i, line in enumerate(lines):
    if 'const lines = code.split' in line:
        # Replace with proper escaped newline
        lines[i] = '  const lines = code.split(' + chr(39) + chr(92) + 'n' + chr(39) + ');' + chr(10)
        # Remove the next line if it's just ');'
        if i + 1 < len(lines) and lines[i + 1].strip() == ');':
            lines[i + 1] = ''
        break

# Write back
with open('src/dashboard/src/components/CodeBlock.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Fixed CodeBlock newline')
