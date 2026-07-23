# Read CodeBlock.tsx
with open('src/dashboard/src/components/CodeBlock.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove the stray '); line after the split
new_lines = []
for i, line in enumerate(lines):
    # Skip the line that's just ');' after the split line
    if line.strip() == ');' and i > 0 and 'const lines = code.split' in lines[i-1]:
        continue
    new_lines.append(line)

# Write back
with open('src/dashboard/src/components/CodeBlock.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Removed leftover line')
