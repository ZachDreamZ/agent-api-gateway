# Read the landing page
with open('src/dashboard/src/pages/AuraLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import if not present
if 'StructuredData' not in content:
    # Find the import section and add structured data
    import_line = 'import { BackToTop } from ' + chr(39) + '../components/BackToTop' + chr(39) + ';'
    new_import = import_line + chr(10) + 'import { OrganizationStructuredData, WebSiteStructuredData, SoftwareApplicationStructuredData } from ' + chr(39) + '../components' + chr(39) + ';'
    content = content.replace(import_line, new_import)
    
    # Add structured data components at the beginning of the return statement
    # Find the main return and add after the opening fragment or div
    search_pattern = 'return (' + chr(10) + '    <>'
    if search_pattern in content:
        replacement = 'return (' + chr(10) + '    <>' + chr(10) + '      <OrganizationStructuredData />' + chr(10) + '      <WebSiteStructuredData />' + chr(10) + '      <SoftwareApplicationStructuredData />'
        content = content.replace(search_pattern, replacement, 1)
    
    with open('src/dashboard/src/pages/AuraLanding.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('Added structured data to landing page')
else:
    print('StructuredData already in landing page')
