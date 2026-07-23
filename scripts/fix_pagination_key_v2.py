# Read Pagination.tsx
with open('src/dashboard/src/components/Pagination.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the key prop
content = content.replace(
    '                key={dots-}',
    '                key={' + chr(96) + 'dots-' + chr(36) + '{i}' + chr(96) + '}'
)

# Write back
with open('src/dashboard/src/components/Pagination.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed Pagination key prop v2')
