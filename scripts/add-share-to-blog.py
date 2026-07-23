import sys

# Read the file
with open('src/dashboard/src/pages/Blog.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with prose-container and insert ShareButton before it
insert_line = None
for i, line in enumerate(lines):
    if 'className="prose-container"' in line:
        insert_line = i
        break

if insert_line is None:
    print("Could not find prose-container")
    sys.exit(1)

# Insert the ShareButton div before prose-container
share_button_code = [
    '\n',
    '            <div className="mt-6 flex justify-center">\n',
    '              <ShareButton url={`/blog/${post.slug}`} title={post.title} description={post.description} />\n',
    '            </div>\n',
    '\n'
]

lines = lines[:insert_line] + share_button_code + lines[insert_line:]

# Write back
with open('src/dashboard/src/pages/Blog.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"Added ShareButton at line {insert_line}")
print("ShareButton integration completed successfully")
