import re

# Read the file
with open('src/dashboard/src/pages/Blog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the import line with BackToTop
old_import = "import { BackToTop } from '../components/BackToTop';"
new_import = "import { BackToTop, ShareButton } from '../components';"

# Replace the import
content = content.replace(old_import, new_import)

# Write back
with open('src/dashboard/src/pages/Blog.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added ShareButton to imports')
