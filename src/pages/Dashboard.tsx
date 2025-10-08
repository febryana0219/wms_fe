import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Package, Warehouse, ShoppingCart, History, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { apiClient } from '../services/apiClient';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<{
    totalProducts: number;
    totalWarehouses: number;
    totalOrders: number;
    totalTransactions: number;
    activeWarehouses: number;
    pendingOrders: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: typeof dashboardData;
      }>('/dashboard/stats');

      if (response.success) {
        setDashboardData(response.data);
      } else {
        toast.error(response.message || 'Failed to load dashboard data');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 p-1">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-background rounded-3xl p-8 border border-primary/10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <p className="text-center text-muted-foreground mt-10">No dashboard data available.</p>;
  }

  const stats = [
    {
      title: t('dashboard.total_products'),
      value: dashboardData.totalProducts.toString(),
      change: `+${Math.round((dashboardData.totalProducts / 25) * 100)}%`,
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      progress: Math.min((dashboardData.totalProducts / 50) * 100, 100),
    },
    {
      title: t('dashboard.total_warehouses'),
      value: `${dashboardData.activeWarehouses}/${dashboardData.totalWarehouses}`,
      change: `${dashboardData.activeWarehouses} Active`,
      icon: Warehouse,
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      progress: dashboardData.totalWarehouses
        ? (dashboardData.activeWarehouses / dashboardData.totalWarehouses) * 100
        : 0,
    },
    {
      title: t('orders.title'),
      value: dashboardData.totalOrders.toString(),
      change: `${dashboardData.pendingOrders} Pending`,
      icon: ShoppingCart,
      gradient: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      progress:
        dashboardData.totalOrders > 0
          ? ((dashboardData.totalOrders - dashboardData.pendingOrders) / dashboardData.totalOrders) * 100
          : 100,
    },
    {
      title: t('transactions.title'),
      value: dashboardData.totalTransactions.toString(),
      change: '+18%',
      icon: History,
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      progress: Math.min((dashboardData.totalTransactions / 10) * 100, 100),
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-background rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-primary/10">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent break-words">
                {t('dashboard.welcome')}, {user?.name}!
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1">
                {t('dashboard.title')} - Overview of your warehouse management system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
            >
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div
                    className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                  >
                    <div
                      className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}
                    >
                      <Icon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 text-xs lg:text-sm"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-2 lg:space-y-3">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl lg:text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{parseFloat(stat.progress?.toFixed(2) || '0')}%</span>
                    </div>
                    <Progress value={stat.progress || 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
