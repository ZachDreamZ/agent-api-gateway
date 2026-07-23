from datetime import datetime, timedelta

# Expires in 1 year
expires = (datetime.utcnow() + timedelta(days=365)).strftime('%Y-%m-%dT%H:%M:%S.000Z')

security_content = f'''Contact: mailto:security@agentapigw.dpdns.org
Expires: {expires}
Preferred-Languages: en
Canonical: https://agentapigw.dpdns.org/.well-known/security.txt
Policy: https://agentapigw.dpdns.org/legal/security
Acknowledgments: https://agentapigw.dpdns.org/security/hall-of-fame

# Agent API Gateway Security Policy
# We take security seriously. If you discover a vulnerability, please report it responsibly.
'''

# Create .well-known directory if it doesn't exist
import os
os.makedirs('public/.well-known', exist_ok=True)

with open('public/.well-known/security.txt', 'w', encoding='utf-8') as f:
    f.write(security_content)

print('Generated security.txt')
