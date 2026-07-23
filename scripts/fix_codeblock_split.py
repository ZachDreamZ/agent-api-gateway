# Read CodeBlock.tsx
with open('src/dashboard/src/components/CodeBlock.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the split with proper newline
content = content.replace(
    '  const lines = code.split(' + chr(39) + chr(10) + chr(39) + chr(10) + ');',
    '  const lines = code.split(' + chr(39) + chr(92) + 'n' + chr(39) + ');'
)

# Write back
with open('src/dashboard/src/components/CodeBlock.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed CodeBlock split')
