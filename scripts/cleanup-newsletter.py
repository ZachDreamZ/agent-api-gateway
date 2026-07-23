# Read the file
with open('src/dashboard/src/pages/AuraLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if there's still a newsletter section issue
if 'Newsletter Signup' in content:
    # Find and remove it completely
    start = content.find('{/* Newsletter Signup */}')
    if start != -1:
        # Find the closing </section>
        end = content.find('</section>', start)
        if end != -1:
            # Remove the entire section including whitespace
            content = content[:start] + content[end+11:]
            print("Removed remaining newsletter section")
        
# Write back
with open('src/dashboard/src/pages/AuraLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned up newsletter references")
