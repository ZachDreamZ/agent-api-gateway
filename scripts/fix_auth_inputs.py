import re

# Read the Auth.tsx file
with open('src/dashboard/src/pages/Auth.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix name input - ensure proper padding
content = re.sub(
    r'<input\s+type=\"text\"\s+value=\{name\}[^>]+className=\"input pl-11\"',
    '<input\n                        type=\"text\"\n                        value={name}\n                        onChange={(e) => setName(e.target.value)}\n                        placeholder=\"Jane Doe\"\n                        required\n                        autoComplete=\"name\"\n                        className=\"input pl-11 pr-3 py-2.5\"',
    content
)

# Fix email input - ensure proper padding
content = re.sub(
    r'<input\s+type=\"email\"\s+value=\{email\}[^>]+className=\"input pl-11\"',
    '<input\n                    type=\"email\"\n                    value={email}\n                    onChange={(e) => setEmail(e.target.value)}\n                    placeholder=\"you@example.com\"\n                    required\n                    autoComplete=\"email\"\n                    className=\"input pl-11 pr-3 py-2.5\"',
    content
)

# Fix password input - ensure proper padding on both sides
content = re.sub(
    r'<input\s+type=\{showPassword \? \'text\' : \'password\'\}[^>]+className=\"input pl-11 pr-11\"',
    '<input\n                      type={showPassword ? \'text\' : \'password\'}\n                      value={password}\n                      onChange={(e) => setPassword(e.target.value)}\n                      placeholder=\"••••••••\"\n                      required\n                      minLength={10}\n                      autoComplete={mode === \'signin\' ? \'current-password\' : \'new-password\'}\n                      className=\"input pl-11 pr-11 py-2.5\"',
    content
)

# Write back
with open('src/dashboard/src/pages/Auth.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed Auth.tsx input padding classes')
