import os

# Read the index
with open('src/dashboard/src/components/index.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check each export and keep only if file exists
valid_lines = []
for line in lines:
    if 'export' in line and 'from' in line:
        # Extract component name from export
        if chr(39) + './' in line:
            component = line.split(chr(39) + './')[1].split(chr(39))[0]
            file_path = f'src/dashboard/src/components/{component}.tsx'
            if os.path.exists(file_path):
                valid_lines.append(line)
            else:
                print(f'Removing missing: {component}')
    else:
        valid_lines.append(line)

# Write back
with open('src/dashboard/src/components/index.ts', 'w', encoding='utf-8') as f:
    f.writelines(valid_lines)

print('Cleaned component index')
