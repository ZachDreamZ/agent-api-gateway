# Read Logo.tsx
with open('src/dashboard/src/components/Logo.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the className
content = content.replace(
    '      <div className={+' + chr(34) + 'inline-flex ' + chr(34) + '+}>',
    '      <div className=' + chr(34) + 'inline-flex' + chr(34) + '>'
)

# Write back
with open('src/dashboard/src/components/Logo.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed Logo className')
