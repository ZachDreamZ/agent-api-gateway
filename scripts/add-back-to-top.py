import sys

# Read the Blog.tsx file
with open('src/dashboard/src/pages/Blog.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where to add BackToTop - look for the export line and work backwards
export_line = None
for i, line in enumerate(lines):
    if 'export { BlogListing, BlogPost };' in line:
        export_line = i
        break

if export_line is None:
    print("Could not find export line")
    sys.exit(1)

# Now work backwards to find the two closing sections
# We need to add BackToTop before the closing </div> of each function
added_count = 0
for i in range(export_line - 1, 0, -1):
    line = lines[i]
    # Look for the pattern: </footer> followed by closing divs
    if '</footer>' in line and added_count < 2:
        # Find the next </div> after </footer>
        for j in range(i + 1, min(i + 10, len(lines))):
            if '</div>' in lines[j] and '<BackToTop' not in lines[j-1]:
                # Insert BackToTop before this closing div
                indent = len(lines[j]) - len(lines[j].lstrip())
                lines.insert(j, ' ' * indent + '<BackToTop />\n')
                added_count += 1
                print(f"Added BackToTop at line {j}")
                break
        if added_count >= 2:
            break

# Write back
with open('src/dashboard/src/pages/Blog.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"BackToTop integration completed - added {added_count} instances")
