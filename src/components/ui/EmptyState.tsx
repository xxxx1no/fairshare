import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  iconColor = 'text-zinc-400', 
  iconBgColor = 'bg-zinc-100' 
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${iconBgColor}`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-500 mb-6">{description}</p>
    </div>
  );
}
