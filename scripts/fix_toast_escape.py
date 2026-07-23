with open('src/dashboard/src/components/Toast.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the escape sequence
content = content.replace(
    '                  border: \1px solid \20\,',
    '                  border: 1px solid ' + '' + '20,'
)

with open('src/dashboard/src/components/Toast.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed Toast escape sequence')
