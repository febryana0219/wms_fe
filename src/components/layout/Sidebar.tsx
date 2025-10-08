import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  History, 
  FileBarChart,
  PackageOpen,
  Truck,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../ui/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [openGroups, setOpenGroups] = React.useState<string[]>([]);

  const menuGroups = [
    {
      id: 'dashboard',
      label: t('dashboard.title'),
      icon: LayoutDashboard,
      to: '/dashboard',
      adminOnly: false,
    },
    {
      id: 'inventory',
      label: t('nav.inventory'),
      icon: Package,
      adminOnly: false,
      items: [
        {
          to: '/products',
          icon: Package,
          label: t('products.title'),
          adminOnly: false,
        },
        {
          to: '/warehouses',
          icon: Warehouse,
          label: t('warehouses.title'),
          adminOnly: true,
        },
      ]
    },
    {
      id: 'operations',
      label: t('nav.operations'),
      icon: Truck,
      adminOnly: false, // Both Admin and Staff can access operations
      items: [
        {
          to: '/inbound',
          icon: PackageOpen,
          label: t('inbound.title'),
          adminOnly: false, // Staff can access inbound operations
        },
        {
          to: '/outbound',
          icon: Truck,
          label: t('outbound.title'),
          adminOnly: false, // Staff can access outbound operations
        },
        {
          to: '/orders',
          icon: ShoppingCart,
          label: t('orders.title'),
          adminOnly: false, // Staff can access orders
        },
      ]
    },
    {
      id: 'monitoring',
      label: t('nav.monitoring'),
      icon: History,
      adminOnly: false,
      items: [
        {
          to: '/transactions',
          icon: History,
          label: t('transactions.title'),
          adminOnly: false,
        }
      ]
    }
  ];

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isGroupOpen = (groupId: string) => openGroups.includes(groupId);

  const isGroupActive = (group: any) => {
    if (group.to) return location.pathname === group.to;
    return group.items?.some((item: any) => location.pathname === item.to);
  };

  const filteredMenuGroups = menuGroups.filter(group => {
    if (group.adminOnly && user?.role !== 'admin') return false;
    if (group.items) {
      const filteredItems = group.items.filter(item => 
        !item.adminOnly || user?.role === 'admin'
      );
      return filteredItems.length > 0;
    }
    return true;
  });

  return (
    <div className={cn(
      'bg-card/80 backdrop-blur-xl border-r border-border/50 transition-all duration-500 ease-in-out flex flex-col shadow-xl',
      'lg:flex hidden', // Hide sidebar on mobile/tablet, show on large screens
      isCollapsed ? 'w-16 lg:w-20' : 'w-64 lg:w-72'
    )}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 border-b border-primary/20 px-6 py-4 relative overflow-hidden h-[73px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative z-10 w-full">
          {!isCollapsed ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center p-2">
                <img 
                  src="https://sinergigroup.co.id/wp-content/uploads/2023/11/LOGO-SAS-White-768x421.png" 
                  alt="SAS Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                {/* <h1 className="text-lg font-bold text-primary-foreground leading-tight">WMS</h1> */}
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center p-1.5 mx-auto">
              <img 
                src="https://sinergigroup.co.id/wp-content/uploads/2023/11/LOGO-SAS-White-768x421.png" 
                alt="SAS Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuGroups.map((group) => {
            const Icon = group.icon;
            const groupActive = isGroupActive(group);
            
            // Single menu item (like Dashboard)
            if (group.to) {
              const isActive = location.pathname === group.to;
              return (
                <li key={group.id}>
                  <Link
                    to={group.to}
                    className={cn(
                      'group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden',
                      'hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-lg hover:shadow-primary/5',
                      isActive && 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:from-primary hover:to-primary/90'
                    )}
                    title={isCollapsed ? group.label : undefined}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                      isActive ? 'bg-white/20 text-primary-foreground' : 'bg-muted/50 group-hover:bg-primary/20'
                    )}>
                      <Icon size={20} />
                    </div>
                    {!isCollapsed && (
                      <span className="truncate font-medium">{group.label}</span>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl -z-10" />
                    )}
                  </Link>
                </li>
              );
            }

            // Group with submenu items
            const filteredItems = group.items?.filter(item => 
              !item.adminOnly || user?.role === 'admin'
            ) || [];

            if (filteredItems.length === 0) return null;

            return (
              <li key={group.id}>
                <Collapsible 
                  open={!isCollapsed && isGroupOpen(group.id)} 
                  onOpenChange={() => !isCollapsed && toggleGroup(group.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-4 px-4 py-3 h-auto rounded-2xl transition-all duration-300 relative overflow-hidden',
                        'hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-lg hover:shadow-primary/5',
                        groupActive && !isCollapsed && 'bg-gradient-to-r from-primary/5 to-primary/2 border border-primary/20'
                      )}
                      title={isCollapsed ? group.label : undefined}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                        groupActive ? 'bg-primary/20 text-primary' : 'bg-muted/50 group-hover:bg-primary/20'
                      )}>
                        <Icon size={20} />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="truncate font-medium flex-1 text-left">{group.label}</span>
                          {isGroupOpen(group.id) ? (
                            <ChevronDown size={16} className="text-muted-foreground" />
                          ) : (
                            <ChevronRight size={16} className="text-muted-foreground" />
                          )}
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {filteredItems.map((item) => {
                      const isActive = location.pathname === item.to;
                      const ItemIcon = item.icon;
                      
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={cn(
                            'group flex items-center gap-3 px-4 py-2.5 ml-6 rounded-xl transition-all duration-300 relative overflow-hidden',
                            'hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5',
                            isActive && 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300',
                            isActive ? 'bg-white/20 text-primary-foreground' : 'bg-muted/30 group-hover:bg-primary/20'
                          )}>
                            <ItemIcon size={16} />
                          </div>
                          <span className="truncate text-sm font-medium">{item.label}</span>
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl -z-10" />
                          )}
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};