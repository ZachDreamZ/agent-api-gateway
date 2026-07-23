import sys

# Read the file
with open('src/dashboard/src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the closing </BrowserRouter> tag and add CookieConsent before it
marker = '</BrowserRouter>'
pos = content.find(marker)

if pos != -1:
    insert_text = '        <CookieConsent />\n      '
    content = content[:pos] + insert_text + content[pos:]
    print("Successfully added CookieConsent to App")
else:
    print("Could not find BrowserRouter closing tag")
    sys.exit(1)

# Write back
with open('src/dashboard/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("CookieConsent added successfully")
