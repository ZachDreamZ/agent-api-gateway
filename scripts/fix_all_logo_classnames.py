import re

# Read Logo.tsx
with open('src/dashboard/src/components/Logo.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix all malformed classNames with pattern className={+"..."+}
content = re.sub(r'className=\{\+' + chr(34) + r'([^' + chr(34) + r']*)' + chr(34) + r'\+\}', r'className=' + chr(34) + r'\1' + chr(34), content)

# Write back
with open('src/dashboard/src/components/Logo.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed all Logo classNames')
