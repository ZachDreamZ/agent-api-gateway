import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === e.ctrlKey;
        const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === e.shiftKey;
        const altMatch = shortcut.altKey === undefined || shortcut.altKey === e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            continue;
          }
          e.preventDefault();
          shortcut.handler();
          break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export function useGlobalShortcuts() {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      description: 'Go to home/overview',
      handler: () => navigate('/dashboard')
    },
    {
      key: 'k',
      description: 'Go to API keys',
      handler: () => navigate('/dashboard/keys')
    },
    {
      key: 'b',
      description: 'Go to billing',
      handler: () => navigate('/dashboard/billing')
    },
    {
      key: 'd',
      description: 'Go to documentation',
      handler: () => navigate('/docs')
    },
    {
      key: '/',
      description: 'Focus search (if available)',
      handler: () => {
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]');
        searchInput?.focus();
      }
    }
  ];

  useKeyboardShortcuts(shortcuts);
}
