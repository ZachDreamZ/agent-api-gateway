# Read the index
with open('src/dashboard/src/components/index.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove FAQAccordion export
filtered = [line for line in lines if 'FAQAccordion' not in line]

# Write back
with open('src/dashboard/src/components/index.ts', 'w', encoding='utf-8') as f:
    f.writelines(filtered)

print('Removed FAQAccordion from index')
