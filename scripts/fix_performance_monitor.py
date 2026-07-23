import re

file_path = r'D:\micro-saas-agent-api\src\dashboard\src\components\PerformanceMonitor.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace escaped quotes in className attributes
content = content.replace('className=\\"', 'className="')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed PerformanceMonitor.tsx')
