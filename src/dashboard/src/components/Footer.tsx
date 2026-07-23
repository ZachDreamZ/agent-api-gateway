import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  companyName?: string;
  description?: string;
  sections?: FooterSection[];
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
  bottomLinks?: FooterLink[];
}

export const Footer: React.FC<FooterProps> = ({
  companyName = 'Agent API Gateway',
  description = 'Transform unstructured HTML into clean, structured JSON with AI-powered extraction.',
  sections = defaultSections,
  socialLinks = defaultSocialLinks,
  bottomLinks = defaultBottomLinks,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-2xl font-bold mb-3">{companyName}</h3>
            <p className="text-gray-600 mb-4 max-w-md">{description}</p>
            <div className="flex items-center gap-3">
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="GitHub"
                >
                  <Github size={20} className="text-gray-600" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={20} className="text-gray-600" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} className="text-gray-600" />
                </a>
              )}
              {socialLinks.email && (
                <a
                  href={mailto:}
                  className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Email"
                >
                  <Mail size={20} className="text-gray-600" />
                </a>
              )}
            </div>
          </div>

          {/* Link sections */}
          {sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-gray-900 mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {currentYear} {companyName}. All rights reserved.
          </p>
          {bottomLinks && bottomLinks.length > 0 && (
            <div className="flex items-center gap-6 text-sm">
              {bottomLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

// Default footer configuration
const defaultSections: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/docs#api' },
      { label: 'For Agents', href: '/for-agents' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Status', href: 'https://status.agentapigw.dpdns.org' },
      { label: 'Community', href: '/community' },
      { label: 'GitHub', href: 'https://github.com/ZachDreamZ/agent-api-gateway' },
    ],
  },
];

const defaultSocialLinks = {
  github: 'https://github.com/ZachDreamZ/agent-api-gateway',
  twitter: 'https://twitter.com/agentapi',
  linkedin: 'https://linkedin.com/company/agentapi',
  email: 'support@agentapigw.dpdns.org',
};

const defaultBottomLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/legal#privacy' },
  { label: 'Terms of Service', href: '/legal#terms' },
  { label: 'Cookie Policy', href: '/legal#cookies' },
];

// Minimal footer variant
interface MinimalFooterProps {
  companyName?: string;
  links?: FooterLink[];
}

export const FooterMinimal: React.FC<MinimalFooterProps> = ({
  companyName = 'Agent API Gateway',
  links = defaultBottomLinks,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p>
            © {currentYear} {companyName}. All rights reserved.
          </p>
          {links && links.length > 0 && (
            <div className="flex items-center gap-6">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
