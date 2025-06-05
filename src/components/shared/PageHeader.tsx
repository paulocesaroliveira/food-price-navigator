
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  badges?: Array<{
    icon: LucideIcon;
    text: string;
  }>;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  gradient,
  badges = [],
  actions
}) => {
  return (
    <div className={`page-header ${gradient}`}>
      <div className="page-header-overlay"></div>
      <div className="page-header-decoration-1"></div>
      <div className="page-header-decoration-2"></div>
      
      <div className="page-header-content">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="page-header-icon">
                <Icon className="page-header-icon-size" />
              </div>
              <div>
                <h1 className="page-header-title">{title}</h1>
                {subtitle && (
                  <p className="page-header-subtitle">{subtitle}</p>
                )}
              </div>
            </div>
            
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                {badges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-full bg-white/20 px-2 py-1 sm:px-3 sm:py-2 backdrop-blur-sm">
                    <badge.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {actions && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
