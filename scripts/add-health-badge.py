import sys

# Read the file
with open('src/dashboard/src/pages/AuraLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the copyright section with exact spacing
marker = 'className="mx-auto max-w-6xl px-5 md:px-6 pb-8 text-center text-[11px]"'
pos = content.find(marker)

if pos != -1:
    # Find the start of the <div tag
    div_start = content.rfind('<div', pos - 100, pos)
    if div_start != -1:
        insert_text = '''          <div className="mt-6 mb-4 flex justify-center">
            <ApiHealthBadge />
          </div>
'''
        content = content[:div_start] + insert_text + content[div_start:]
        print("Successfully added ApiHealthBadge before copyright")
    else:
        print("Could not find div start")
        sys.exit(1)
else:
    print("Could not find copyright div className")
    sys.exit(1)

# Write back
with open('src/dashboard/src/pages/AuraLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ApiHealthBadge added successfully")
