# Read Stats.tsx
with open('src/dashboard/src/components/Stats.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the className with different spacing
content = content.replace(
    '    <div className={surface-elevated rounded-xl p-6 }>',
    '    <div className=' + chr(34) + 'surface-elevated rounded-xl p-6' + chr(34) + '>'
)

# Write back
with open('src/dashboard/src/components/Stats.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed Stats className v2')
