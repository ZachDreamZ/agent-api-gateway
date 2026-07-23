import sys

# Read the AuraLanding.tsx file
with open('src/dashboard/src/pages/AuraLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if NewsletterSignup already exists
if 'NewsletterSignup' in content:
    print("NewsletterSignup already integrated")
    sys.exit(0)

# Add NewsletterSignup import after other component imports
# Look for any component import line
import_patterns = [
    "import { BrandLockup",
    "import { SectionLabel",
    "from '../components/Brand'"
]

import_added = False
for pattern in import_patterns:
    if pattern in content:
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if pattern in line and '../components/' in line:
                # Add after this import
                lines.insert(i + 1, "import { NewsletterSignup } from '../components/NewsletterSignup';")
                content = '\n'.join(lines)
                print(f"Added NewsletterSignup import after line {i}")
                import_added = True
                break
        if import_added:
            break

if not import_added:
    print("Could not find suitable import location")
    sys.exit(1)

# Add NewsletterSignup before the footer
# Look for footer tag
footer_idx = content.find('<footer')
if footer_idx != -1:
    # Insert newsletter section before footer
    newsletter_section = '''      {/* Newsletter Signup */}
      <section className="relative z-10 py-16">
        <div className="mx-auto max-w-3xl px-5 md:px-6">
          <NewsletterSignup />
        </div>
      </section>

      '''
    content = content[:footer_idx] + newsletter_section + content[footer_idx:]
    print("Added NewsletterSignup section before footer")
else:
    print("Could not find footer")
    sys.exit(1)

# Write back
with open('src/dashboard/src/pages/AuraLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("NewsletterSignup integration completed successfully")
