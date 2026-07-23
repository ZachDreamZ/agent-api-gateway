import sys

# Read the file
with open('src/dashboard/src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove duplicate CookieConsent import
import_line = "import { CookieConsent } from './components/CookieConsent';"
first_pos = content.find(import_line)
if first_pos != -1:
    second_pos = content.find(import_line, first_pos + 1)
    if second_pos != -1:
        # Remove the second occurrence
        content = content[:second_pos] + content[second_pos + len(import_line) + 1:]
        print("Removed duplicate CookieConsent import")
    else:
        print("No duplicate found")
else:
    print("CookieConsent import not found")
    sys.exit(1)

# Write back
with open('src/dashboard/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("File cleaned successfully")
