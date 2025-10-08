import React from 'react';
import { cn } from './utils';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className={cn("overflow-auto", className)}>
          {children}
        </div>
      </div>
      
      {/* Mobile/Tablet Card Layout */}
      <div className="lg:hidden">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              className: cn(child.props.className, "mobile-card-layout")
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

interface MobileCardProps {
  data: any;
  fields: Array<{
    label: string;
    value: string | React.ReactNode;
    className?: string;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  data,
  fields,
  actions,
  className
}) => {
  return (
    <div className={cn(
      "bg-card border rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      {fields.map((field, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {field.label}
          </span>
          <span className={cn("text-sm", field.className)}>
            {field.value}
          </span>
        </div>
      ))}
      
      {actions && (
        <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};