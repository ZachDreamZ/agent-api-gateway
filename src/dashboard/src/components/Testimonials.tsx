import React from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  variant?: 'default' | 'compact' | 'featured';
}

export const Testimonials: React.FC<TestimonialsProps> = ({ 
  testimonials, 
  variant = 'default' 
}) => {
  if (variant === 'featured') {
    return (
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Quote className="w-12 h-12 text-blue-600 mx-auto mb-6" />
          <blockquote className="text-2xl md:text-3xl font-serif italic mb-8">
            "{testimonials[0].quote}"
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            {testimonials[0].avatar && (
              <img 
                src={testimonials[0].avatar} 
                alt={testimonials[0].author}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div className="text-left">
              <div className="font-semibold">{testimonials[0].author}</div>
              <div className="text-sm text-gray-600">
                {testimonials[0].role} at {testimonials[0].company}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="surface p-6">
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <p className="text-sm mb-4 italic">"{testimonial.quote}"</p>
            <div className="text-sm">
              <div className="font-semibold">{testimonial.author}</div>
              <div className="text-gray-600">{testimonial.role}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="font-serif text-4xl font-bold mb-4">
          Trusted by Developers Worldwide
        </h2>
        <p className="text-xl text-gray-600">
          See what our customers have to say
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="surface p-8 relative">
            <Quote className="w-8 h-8 text-blue-200 absolute top-4 left-4" />
            
            <div className="relative z-10 mt-6">
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4">
                {testimonial.avatar ? (
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                )}
                
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Pre-built testimonials data
export const defaultTestimonials: Testimonial[] = [
  {
    quote: "This API has transformed how we handle data extraction. The accuracy is incredible and the integration was seamless.",
    author: "Sarah Chen",
    role: "Lead Developer",
    company: "TechFlow Inc",
    rating: 5,
  },
  {
    quote: "Best documentation I've seen. We went from zero to production in less than a week. Highly recommend!",
    author: "Michael Rodriguez",
    role: "CTO",
    company: "DataSync Solutions",
    rating: 5,
  },
  {
    quote: "The performance and reliability are outstanding. It's become an essential part of our infrastructure.",
    author: "Emily Watson",
    role: "Engineering Manager",
    company: "CloudScale",
    rating: 5,
  },
  {
    quote: "Pricing is transparent and fair. The free tier was perfect for testing, and scaling up was effortless.",
    author: "David Kim",
    role: "Founder",
    company: "StartupLab",
    rating: 5,
  },
  {
    quote: "Support team is incredibly responsive. They helped us optimize our implementation and now it's blazing fast.",
    author: "Jessica Martinez",
    role: "Full Stack Developer",
    company: "WebWorks",
    rating: 5,
  },
  {
    quote: "The AI-powered extraction is next level. It handles edge cases better than any solution we've tried.",
    author: "Alex Thompson",
    role: "ML Engineer",
    company: "IntelliData",
    rating: 5,
  },
];
