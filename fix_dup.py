import re

with open("D:\\micro-saas-agent-api\\src\\dashboard\\src\\pages\\Docs.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove the duplicate import block (the original one that's now duplicated)
old_duplicate = """import {
  Layout,
  KeyRound,
  Braces,
  Terminal,
  Activity,
  CreditCard,
  Bot,
  Code2,
  AlertTriangle,
  Gauge,
  Compass,
  Scale,
} from 'lucide-react';"""

content = content.replace(old_duplicate, "")

with open("D:\\micro-saas-agent-api\\src\\dashboard\\src\\pages\\Docs.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
