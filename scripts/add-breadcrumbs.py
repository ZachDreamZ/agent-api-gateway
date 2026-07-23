import sys

# Read Blog.tsx
with open('src/dashboard/src/pages/Blog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if Breadcrumbs is already imported
if 'Breadcrumbs' in content:
    print("Breadcrumbs already integrated")
    sys.exit(0)

# Add Breadcrumbs import after other component imports
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'from \'../components/' in line and 'import' in line:
        # Add after the last component import
        lines.insert(i + 1, "import { Breadcrumbs } from '../components/Breadcrumbs';")
        print(f"Added Breadcrumbs import at line {i+1}")
        break

content = '\n'.join(lines)

# Add Breadcrumbs to BlogPost component
# Find the main content div in BlogPost
blogpost_start = content.find('export function BlogPost()')
if blogpost_start != -1:
    # Find the first <div className after the function
    first_div = content.find('<div className=', blogpost_start)
    if first_div != -1:
        # Insert breadcrumbs after this div opens
        next_newline = content.find('\n', first_div)
        if next_newline != -1:
            # Add breadcrumbs with proper indentation
            indent = '        '
            breadcrumb_line = f"{indent}<Breadcrumbs />\n"
            content = content[:next_newline+1] + breadcrumb_line + content[next_newline+1:]
            print("Added Breadcrumbs to BlogPost component")

# Write back
with open('src/dashboard/src/pages/Blog.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Breadcrumbs integration completed")
