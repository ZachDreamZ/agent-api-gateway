# Read the current index
with open('src/dashboard/src/components/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add StructuredData export if not present
if 'StructuredData' not in content:
    new_export = chr(10) + 'export { StructuredData, OrganizationStructuredData, WebSiteStructuredData, SoftwareApplicationStructuredData } from ' + chr(39) + './StructuredData' + chr(39) + ';' + chr(10)
    content += new_export
    
    with open('src/dashboard/src/components/index.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('Updated component index with StructuredData')
else:
    print('StructuredData already in index')
