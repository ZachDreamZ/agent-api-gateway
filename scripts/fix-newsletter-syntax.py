# Read the file
with open('src/dashboard/src/pages/AuraLanding.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the newsletter section
newsletter_line = None
for i, line in enumerate(lines):
    if 'Newsletter Signup' in line:
        newsletter_line = i
        break

if newsletter_line is None:
    print("Could not find newsletter section")
    exit(0)

# Remove the newsletter section
end_line = None
for i in range(newsletter_line, min(len(lines), newsletter_line + 10)):
    if '</section>' in lines[i]:
        end_line = i
        break

if end_line:
    # Remove the newsletter section
    del lines[newsletter_line:end_line+2]
    print(f"Removed newsletter section from {newsletter_line} to {end_line}")

# Write back
with open('src/dashboard/src/pages/AuraLanding.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed - removed newsletter section")
