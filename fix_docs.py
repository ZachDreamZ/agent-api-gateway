import re

with open("D:\\micro-saas-agent-api\\src\\dashboard\\src\\pages\\Docs.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_import = "import { Menu, Copy, Check, BookOpen } from 'lucide-react';"

new_import = """import {
  Menu,
  Copy,
  Check,
  BookOpen,
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

content = content.replace(old_import, new_import)

with open("D:\\micro-saas-agent-api\\src\\dashboard\\src\\pages\\Docs.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
