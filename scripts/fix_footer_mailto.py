# Read Footer.tsx
with open('src/dashboard/src/components/Footer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the mailto href
content = content.replace(
    '                  href={mailto:}',
    '                  href={' + chr(96) + 'mailto:' + chr(36) + '{socialLinks.email}' + chr(96) + '}'
)

# Write back
with open('src/dashboard/src/components/Footer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed Footer mailto href')
