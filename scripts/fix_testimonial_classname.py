# Read Testimonial.tsx
with open('src/dashboard/src/components/Testimonial.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the className
content = content.replace(
    '      <div className={surface-elevated rounded-xl p-6 hover-lift }>',
    '      <div className=' + chr(34) + 'surface-elevated rounded-xl p-6 hover-lift' + chr(34) + '>'
)

# Write back
with open('src/dashboard/src/components/Testimonial.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed Testimonial className')
