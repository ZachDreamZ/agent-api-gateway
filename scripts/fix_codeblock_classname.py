# Read CodeBlock.tsx
with open('src/dashboard/src/components/CodeBlock.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken className that spans lines
content = content.replace(
    '    <div className={' + chr(10) + 'elative group }>',
    '    <div className=' + chr(34) + 'relative group' + chr(34) + '>'
)

# Write back
with open('src/dashboard/src/components/CodeBlock.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed CodeBlock className')
