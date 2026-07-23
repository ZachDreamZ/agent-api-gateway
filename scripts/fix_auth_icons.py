import re

# Read the Auth.tsx file
with open('src/dashboard/src/pages/Auth.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the icon positioning and input padding
# Change left-3 to left-3.5 for better icon positioning
# Change pl-10 to pl-11 for more space
# Change pr-10 to pr-11 for password field

# Fix Name field
content = re.sub(
    r'<User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"',
    '<User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"',
    content
)
content = re.sub(
    r'className="input pl-10"(\s*/>)',
    r'className="input pl-11"\1',
    content
)

# Fix Email field
content = re.sub(
    r'<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"',
    '<Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"',
    content
)

# Fix Lock field
content = re.sub(
    r'<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"',
    '<Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"',
    content
)

# Fix password field with both pl and pr
content = re.sub(
    r'className="input pl-10 pr-10"',
    'className="input pl-11 pr-11"',
    content
)

# Write back
with open('src/dashboard/src/pages/Auth.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed icon positioning in Auth.tsx')
