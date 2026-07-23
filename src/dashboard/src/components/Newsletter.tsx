import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface NewsletterProps {
  variant?: 'default' | 'inline' | 'minimal';
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
}

export const Newsletter: React.FC<NewsletterProps> = ({
  variant = 'default',
  title = 'Stay updated',
  description = 'Get the latest updates, tutorials, and product news delivered to your inbox.',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    
    try {
      // TODO: Implement actual newsletter subscription API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setMessage('Thanks for subscribing! Check your inbox to confirm.');
      setEmail('');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'loading' ? 'Subscribing...' : buttonText}
        </button>
      </form>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="text-blue-600" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {status === 'loading' ? 'Subscribing...' : buttonText}
              </button>
            </form>
            
            {status === 'success' && (
              <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
                <CheckCircle size={16} />
                {message}
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
                <AlertCircle size={16} />
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto text-center px-6">
        <div className="inline-flex w-14 h-14 bg-blue-100 rounded-2xl items-center justify-center mb-6">
          <Mail className="text-blue-600" size={28} />
        </div>
        
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-gray-600 mb-8">{description}</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center sm:text-left"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
          >
            {status === 'loading' ? 'Subscribing...' : buttonText}
          </button>
        </form>
        
        {status === 'success' && (
          <div className="flex items-center justify-center gap-2 mt-4 text-green-600">
            <CheckCircle size={20} />
            <span>{message}</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex items-center justify-center gap-2 mt-4 text-red-600">
            <AlertCircle size={20} />
            <span>{message}</span>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};

// Footer newsletter variant
export const NewsletterFooter: React.FC = () => {
  return (
    <Newsletter
      variant="inline"
      title="Get product updates"
      description="New features, tutorials, and API tips in your inbox."
      placeholder="your@email.com"
      buttonText="Subscribe"
    />
  );
};
