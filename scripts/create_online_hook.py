content = '''import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
'''

import os
os.makedirs('src/dashboard/src/hooks', exist_ok=True)

with open('src/dashboard/src/hooks/useOnlineStatus.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Created useOnlineStatus hook')
