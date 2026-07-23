import re

with open('src/dashboard/src/pages/Blog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useEffect import if not present
if 'useEffect' not in content:
    content = content.replace(
        "import { useParams } from 'react-router-dom';",
        "import { useEffect } from 'react';\nimport { useParams } from 'react-router-dom';"
    )

# Find the BlogPost function and add JSON-LD injection after post is found
injection_point = content.index('const lines = post.content.split')

jsonld_code = """
  // Inject BlogPosting structured data for SEO
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'blog-post-structured-data';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: {
        '@type': 'Organization',
        name: 'NexusCore',
      },
      publisher: {
        '@type': 'Organization',
        name: 'NexusCore',
        logo: {
          '@type': 'ImageObject',
          url: 'https://agentapigw.dpdns.org/brand/agent-api-gateway-mark.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://agentapigw.dpdns.org/blog/${post.slug}`,
      },
      keywords: post.tags.join(', '),
      articleSection: post.tags[0],
      timeRequired: post.readTime,
    });
    document.head.appendChild(script);
    return () => {
      const existing = document.getElementById('blog-post-structured-data');
      if (existing) existing.remove();
    };
  }, [post]);

"""

content = content[:injection_point] + jsonld_code + '  ' + content[injection_point:]

with open('src/dashboard/src/pages/Blog.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done - BlogPosting JSON-LD added')
