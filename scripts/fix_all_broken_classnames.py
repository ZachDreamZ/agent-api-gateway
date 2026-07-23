import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Pattern 1: className={ with content and closing }> - fix to className='...'
    content = re.sub(
        r'className=\{([^}'"'"']+)\}>',
        lambda m: 'className=' + chr(34) + m.group(1).strip() + chr(34) + '>',
        content
    )
    
    # Pattern 2: Multi-line className={ ... }> 
    content = re.sub(
        r'className=\{[\r\n]+([^}]+)\}>',
        lambda m: 'className=' + chr(34) + m.group(1).strip() + chr(34) + '>',
        content
    )
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Fix all TSX files in components
components_dir = 'src/dashboard/src/components'
fixed = []
for filename in os.listdir(components_dir):
    if filename.endswith('.tsx'):
        filepath = os.path.join(components_dir, filename)
        if fix_file(filepath):
            fixed.append(filename)

print(f'Fixed {len(fixed)} files: {fixed}')
