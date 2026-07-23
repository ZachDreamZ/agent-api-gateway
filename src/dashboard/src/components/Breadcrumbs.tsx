import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  if (paths.length === 0 || paths[0] === 'dashboard') {
    return null;
  }

  const breadcrumbs = [{ name: 'Home', path: '/dashboard' }];
  
  let currentPath = '/dashboard';
  paths.forEach((segment, index) => {
    if (segment !== 'dashboard') {
      currentPath += `/${segment}`;
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({ name, path: currentPath });
    }
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-6">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span style={{ color: 'var(--color-text-secondary)' }}>{crumb.name}</span>
          ) : (
            <Link
              to={crumb.path}
              className="interactive hover:underline"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
