# Read CodeBlock.tsx
with open('src/dashboard/src/components/CodeBlock.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix all className={ ... } patterns
import re
content = re.sub(
    r'className=\{([^}]+?)\s*\}>',
    lambda m: 'className=' + chr(34) + m.group(1).strip() + chr(34) + '>',
    content
)

# Fix remaining broken ones manually
content = content.replace(
    '        className={px-1.5 py-0.5 rounded text-sm font-mono }',
    '        className=' + chr(34) + 'px-1.5 py-0.5 rounded text-sm font-mono' + chr(34)
)

# Write back
with open('src/dashboard/src/components/CodeBlock.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed all CodeBlock classNames')
