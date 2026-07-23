import os

index_content = """// Component Library Index
export { Accordion } from './Accordion';
export { Alert } from './Alert';
export { BackToTop } from './BackToTop';
export { Badge } from './Badge';
export { BlogGrid, samplePosts } from './BlogGrid';
export { Breadcrumb } from './Breadcrumb';
export { Button } from './Button';
export { Card } from './Card';
export { ComparisonTable, SimpleComparison, sampleComparison } from './ComparisonTable';
export { CTA, CTASimple, CTABottom, CTAMinimal } from './CTA';
export { DataTable } from './DataTable';
export { Dropdown } from './Dropdown';
export { EmptyState } from './EmptyState';
export { ErrorBoundary } from './ErrorBoundary';
export { FAQ, agentAPIFAQ } from './FAQ';
export { Features, FeatureBlock } from './Features';
export { Footer, FooterMinimal } from './Footer';
export { FormField, useForm } from './Form';
export { Hero, HeroAnimated } from './Hero';
export { Icon, FeatureIcon, Icons, AppIcons, ActionIcons, NavIcons, StatusIcons } from './Icons';
export { Input } from './Input';
export { LoadingStates } from './LoadingStates';
export { Logo, LogoLink } from './Logo';
export { Modal } from './Modal';
export { Newsletter, NewsletterFooter } from './Newsletter';
export { Pagination, SimplePagination } from './Pagination';
export { PricingCalculator } from './PricingCalculator';
export { ProgressBar } from './ProgressBar';
export { SearchBar } from './SearchBar';
export { SEO, createOrganizationSchema, createWebApplicationSchema, createBreadcrumbSchema, createFAQSchema } from './SEO';
export { Skeleton, SkeletonCard, SkeletonTable, SkeletonDashboard, SkeletonList } from './Skeleton';
export { Stats, AnimatedStat, SocialProof } from './Stats';
export { Switch } from './Switch';
export { Tabs } from './Tabs';
export { Testimonials, defaultTestimonials } from './Testimonials';
export { Toast, ToastProvider, useToast } from './Toast';
export { Tooltip } from './Tooltip';
"""

with open('src/dashboard/src/components/index.ts', 'w', encoding='utf-8') as f:
    f.write(index_content)

print('Updated component index')
