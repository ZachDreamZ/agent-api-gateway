import re

# Read the CSS file
with open('src/dashboard/src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and update the .input style to not include padding (let Tailwind handle it)
old_input = r'\.input \{[^}]+padding: 0\.625rem 0\.875rem;[^}]+\}'

new_input = '''\.input {
    width: 100%;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-family: var(--font-family-sans);
    color: var(--color-text-primary);
    outline: none;
    transition: border-color var(--dur-fast) var(--ease-out),
                box-shadow var(--dur-fast) var(--ease-out);
  }
  
  /* Input without icon - default padding */
  .input:not([class*=\"pl-\"]):not([class*=\"pr-\"]) {
    padding: 0.625rem 0.875rem;
  }'''

content = re.sub(old_input, new_input, content, flags=re.DOTALL)

# Write back
with open('src/dashboard/src/index.css', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed input padding to allow Tailwind utilities to work properly')
