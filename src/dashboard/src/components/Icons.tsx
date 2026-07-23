import React from 'react';
import { 
  Code2, 
  Database, 
  Zap, 
  Shield, 
  BarChart3, 
  Globe, 
  Lock,
  Sparkles,
  Cpu,
  FileText,
  Image,
  MessageSquare,
  Search,
  Users,
  Settings,
  Bell,
  Calendar,
  Clock,
  Download,
  Upload,
  Check,
  X,
  AlertCircle,
  Info,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
  Play,
  Pause,
  Stop,
  type LucideIcon
} from 'lucide-react';

// App-specific icons mapped by category
export const AppIcons = {
  // API & Development
  api: Code2,
  database: Database,
  webhook: Zap,
  schema: FileText,
  
  // Security
  security: Shield,
  encryption: Lock,
  
  // Analytics & Monitoring
  analytics: BarChart3,
  monitoring: Clock,
  
  // AI & ML
  ai: Sparkles,
  processing: Cpu,
  
  // Content
  text: FileText,
  image: Image,
  chat: MessageSquare,
  
  // General
  web: Globe,
  search: Search,
  users: Users,
  settings: Settings,
  notifications: Bell,
  calendar: Calendar,
} as const;

// Action icons
export const ActionIcons = {
  download: Download,
  upload: Upload,
  check: Check,
  close: X,
  edit: Edit,
  delete: Trash2,
  copy: Copy,
  external: ExternalLink,
  refresh: RefreshCw,
  play: Play,
  pause: Pause,
  stop: Stop,
} as const;

// Navigation icons
export const NavIcons = {
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  plus: Plus,
  minus: Minus,
} as const;

// Status icons
export const StatusIcons = {
  error: AlertCircle,
  info: Info,
  help: HelpCircle,
  success: Check,
  warning: AlertCircle,
} as const;

// Icon wrapper component with consistent sizing
interface IconProps {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export const Icon: React.FC<IconProps> = ({ icon: IconComponent, size = 'md', className = '' }) => {
  return <IconComponent size={sizeMap[size]} className={className} />;
};

// Feature icon with background
interface FeatureIconProps {
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export const FeatureIcon: React.FC<FeatureIconProps> = ({ 
  icon: IconComponent, 
  variant = 'default',
  size = 'md' 
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <div className={${sizeClasses[size]}  rounded-lg flex items-center justify-center}>
      <IconComponent size={iconSizes[size]} />
    </div>
  );
};

// Export all icon sets
export const Icons = {
  ...AppIcons,
  ...ActionIcons,
  ...NavIcons,
  ...StatusIcons,
};
