import React from 'react';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image?: string;
  tags?: string[];
}

interface BlogGridProps {
  posts: BlogPost[];
  variant?: 'grid' | 'list' | 'featured';
  columns?: 2 | 3;
}

export const BlogGrid: React.FC<BlogGridProps> = ({ 
  posts, 
  variant = 'grid',
  columns = 3
}) => {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
  };

  if (variant === 'featured' && posts.length > 0) {
    const featured = posts[0];
    const others = posts.slice(1);
    
    return (
      <div className="space-y-8">
        {/* Featured post */}
        <article className="surface-hover grid md:grid-cols-2 gap-8 overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            {featured.image ? (
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">📝</span>
            )}
          </div>
          
          <div className="p-8 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium mb-4">
              <Tag size={16} />
              {featured.category}
            </div>
            
            <h2 className="font-serif text-3xl font-bold mb-4">
              <a href={/blog/} className="hover:text-blue-600 transition-colors">
                {featured.title}
              </a>
            </h2>
            
            <p className="text-gray-600 mb-6">{featured.excerpt}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                {featured.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                {featured.readTime}
              </div>
            </div>
            
            <a 
              href={/blog/}
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:gap-3 transition-all"
            >
              Read article <ArrowRight size={16} />
            </a>
          </div>
        </article>
        
        {/* Other posts */}
        {others.length > 0 && (
          <div className="grid grid-cols-1  gap-6">
            {others.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-6">
        {posts.map(post => (
          <article key={post.id} className="surface-hover flex gap-6 p-6">
            <div className="flex-shrink-0 w-48 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              {post.image ? (
                <img src={post.image} alt={post.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-4xl">📝</span>
              )}
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium mb-2">
                <Tag size={14} />
                {post.category}
              </div>
              
              <h3 className="text-xl font-semibold mb-2">
                <a href={/blog/} className="hover:text-blue-600 transition-colors">
                  {post.title}
                </a>
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 flex-1">{post.excerpt}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{post.author}</span>
                <span>·</span>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1  gap-6">
      {posts.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
};

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  return (
    <article className="surface-hover overflow-hidden flex flex-col h-full">
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        {post.image ? (
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">📝</span>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium mb-3">
          <Tag size={14} />
          {post.category}
        </div>
        
        <h3 className="text-xl font-semibold mb-3 flex-1">
          <a href={/blog/} className="hover:text-blue-600 transition-colors">
            {post.title}
          </a>
        </h3>
        
        <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            {post.date}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {post.readTime}
          </div>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => (
              <span 
                key={tag}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

// Sample blog posts for demo
export const samplePosts: BlogPost[] = [
  {
    id: 'structured-data-extraction',
    title: 'Building AI Agents with Structured Data Extraction',
    excerpt: 'Learn how to build reliable AI agents using schema-validated web scraping.',
    author: 'Engineering Team',
    date: 'Dec 15, 2024',
    readTime: '5 min read',
    category: 'Tutorial',
    tags: ['AI', 'Agents', 'Web Scraping'],
  },
  {
    id: 'mcp-integration-guide',
    title: 'Integrating with Claude Desktop via MCP',
    excerpt: 'Step-by-step guide to connecting our API with Claude Desktop using Model Context Protocol.',
    author: 'Developer Relations',
    date: 'Dec 10, 2024',
    readTime: '8 min read',
    category: 'Guide',
    tags: ['MCP', 'Claude', 'Integration'],
  },
  {
    id: 'rate-limiting-best-practices',
    title: 'Rate Limiting and API Optimization',
    excerpt: 'Best practices for managing API calls and staying within rate limits.',
    author: 'Product Team',
    date: 'Dec 5, 2024',
    readTime: '4 min read',
    category: 'Best Practices',
    tags: ['API', 'Optimization'],
  },
];
