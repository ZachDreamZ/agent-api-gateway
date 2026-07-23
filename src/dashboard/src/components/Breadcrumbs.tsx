import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  
  // Parse pathname into breadcrumb segments
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0) return null;
  
  // Build breadcrumb items
  const breadcrumbs = [
    { label: 'Home', path: '/' },
  ];
  
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Format label (capitalize and replace hyphens)
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      path: currentPath,
    });
  });
  
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
              )}
              {isLast ? (
                <span style={{ color: 'var(--color-text-primary)' }} aria-current="page">
                  {index === 0 ? <Home className="w-4 h-4" /> : crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="transition-colors hover:underline"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {index === 0 ? <Home className="w-4 h-4" /> : crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
