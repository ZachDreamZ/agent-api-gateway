# Read Toast.tsx
with open('src/dashboard/src/components/Toast.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the border property
content = content.replace(
    '                  border: 1px solid ,',
    '                  border: ' + chr(39) + '1px solid var(--color-border-subtle)' + chr(39) + ','
)

# Write back
with open('src/dashboard/src/components/Toast.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed Toast border property')
