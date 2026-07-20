import { Link } from 'react-router-dom';
import { ProductMark } from '../components/Brand';

export default function NotFound() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 text-center"
      style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}
    >
      <ProductMark className="w-9 h-9 mb-5" style={{ color: 'var(--color-accent-base)' }} />
      <p className="text-eyebrow mb-3" style={{ color: 'var(--color-accent-base)' }}>
        404
      </p>
      <h1 className="text-display-sm mb-2">Page not found</h1>
      <p className="text-sm max-w-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        The page you’re looking for doesn’t exist or may have moved. Try one of these instead.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link to="/" className="btn btn-primary text-sm">
          Go home
        </Link>
        <Link to="/docs" className="btn btn-secondary text-sm">
          API docs
        </Link>
        <Link to="/login" className="btn btn-secondary text-sm">
          Sign in
        </Link>
      </div>
    </div>
  );
}
