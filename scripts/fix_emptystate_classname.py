# Read EmptyState.tsx
with open('src/dashboard/src/components/EmptyState.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the className
content = content.replace(
    '      className={' + chr(10) + 'ounded-xl p-12 text-center }',
    '      className=' + chr(34) + 'rounded-xl p-12 text-center' + chr(34)
)

# Write back
with open('src/dashboard/src/components/EmptyState.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed EmptyState className')
