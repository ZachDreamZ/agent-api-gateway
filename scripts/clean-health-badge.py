import sys

# Read the file
with open('src/dashboard/src/pages/AuraLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and remove duplicate ApiHealthBadge
marker = '''          <div className="mt-6 mb-4 flex justify-center">
            <ApiHealthBadge />
          </div>
'''

# Count occurrences
count = content.count(marker)
print(f"Found {count} occurrences of ApiHealthBadge")

if count > 1:
    # Remove the first occurrence, keep the last one
    first_pos = content.find(marker)
    content = content[:first_pos] + content[first_pos + len(marker):]
    print("Removed duplicate ApiHealthBadge")
elif count == 0:
    print("No ApiHealthBadge found")
    sys.exit(1)

# Write back
with open('src/dashboard/src/pages/AuraLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("File cleaned successfully")
