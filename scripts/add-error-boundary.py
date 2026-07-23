import sys

# Read App.tsx
with open('src/dashboard/src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if ErrorBoundary is already imported
if 'ErrorBoundary' in content:
    print("ErrorBoundary already integrated")
    sys.exit(0)

# Add ErrorBoundary import after other component imports
import_location = content.find("import { BrowserRouter")
if import_location != -1:
    # Add import before BrowserRouter
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'import { BrowserRouter' in line:
            lines.insert(i, "import { ErrorBoundary } from './components/ErrorBoundary';")
            content = '\n'.join(lines)
            print(f"Added ErrorBoundary import at line {i}")
            break

# Wrap the Routes component with ErrorBoundary
# Find <Routes> and wrap it
routes_start = content.find('<Routes>')
if routes_start != -1:
    # Find the closing </Routes>
    routes_end = content.find('</Routes>', routes_start)
    if routes_end != -1:
        # Get indentation
        line_start = content.rfind('\n', 0, routes_start)
        indent = content[line_start+1:routes_start]
        
        # Insert ErrorBoundary wrapper
        before_routes = content[:routes_start]
        routes_content = content[routes_start:routes_end+9]  # Include </Routes>
        after_routes = content[routes_end+9:]
        
        wrapped = f"{indent}<ErrorBoundary>\n{indent}  {routes_content.strip()}\n{indent}</ErrorBoundary>"
        content = before_routes + wrapped + after_routes
        print("Wrapped Routes with ErrorBoundary")

# Write back
with open('src/dashboard/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ErrorBoundary integration completed")
