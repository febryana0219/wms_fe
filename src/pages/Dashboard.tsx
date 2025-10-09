import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Package, Warehouse, ShoppingCart, History, TrendingUp, AlertTriangle, Clock, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Progress } from '../components/ui/progress';
import { apiClient } from '../services/apiClient';
import type { Transaction, Product } from '../types';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { effectiveTheme } = useTheme();
  const [dashboardData, setDashboardData] = useState<{
    totalProducts: number;
    totalWarehouses: number;
    totalOrders: number;
    totalTransactions: number;
    activeWarehouses: number;
    pendingOrders: number;
    recentTransactions: Transaction[];
    lowStockProducts: Product[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: any;
      }>('/dashboard/stats');

      if (response.success) {
        const d = response.data;

        setDashboardData({
          totalProducts: d.totalProducts,
          totalWarehouses: d.totalWarehouses,
          totalOrders: d.totalOrders,
          totalTransactions: d.totalTransactions,
          activeWarehouses: d.activeWarehouses,
          pendingOrders: d.pendingOrders,
          recentTransactions: d.transactionHistories || [], // map dari backend
          lowStockProducts: d.lowStockProducts || [],
        });
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

  const getTransactionTypeLabel = (type: string) => {
    return t(`transactions.${type}`);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${t('common.minutes_ago') || 'minutes ago'}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${t('common.hours_ago') || 'hours ago'}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${t('common.days_ago') || 'days ago'}`;
    }
  };

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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent -z-10" />
        <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12 lg:-translate-y-16 lg:translate-x-16 -z-10" />
        <div className="absolute bottom-0 left-0 w-16 h-16 lg:w-24 lg:h-24 bg-primary/3 rounded-full translate-y-8 -translate-x-8 lg:translate-y-12 lg:-translate-x-12 -z-10" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                      <Icon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs lg:text-sm">
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
                      <span>{parseFloat(stat.progress.toFixed(2))}%</span>
                    </div>
                    <Progress value={stat.progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">{t('dashboard.recent_transactions')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentTransactions.map((transaction, index) => (
                <div key={transaction.id} className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-background/50 to-background border hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.type === 'inbound' ? 'bg-green-50 dark:bg-green-950/20' :
                      transaction.type === 'outbound' ? 'bg-red-50 dark:bg-red-950/20' :
                      transaction.type === 'checkout' ? 'bg-orange-50 dark:bg-orange-950/20' :
                      transaction.type === 'release' ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                      'bg-blue-50 dark:bg-blue-950/20'
                    }`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        transaction.type === 'inbound' ? 'bg-green-500' :
                        transaction.type === 'outbound' ? 'bg-red-500' :
                        transaction.type === 'checkout' ? 'bg-orange-500' :
                        transaction.type === 'release' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}>
                        <Package className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium">{transaction.product_name}</span>
                        <Badge variant="outline" className={`text-xs ${
                          transaction.type === 'inbound' ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-950/20' :
                          transaction.type === 'outbound' ? 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-950/20' :
                          transaction.type === 'checkout' ? 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:bg-orange-950/20' :
                          transaction.type === 'release' ? 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-300 dark:bg-yellow-950/20' :
                          'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/20'
                        }`}>
                          {getTransactionTypeLabel(transaction.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.to_warehouse_name ? 
                          `${transaction.warehouse_name} → ${transaction.to_warehouse_name}` : 
                          transaction.warehouse_name
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">{getTimeAgo(transaction.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{transaction.quantity}</p>
                    <p className="text-xs text-muted-foreground">{t('warehouses.quantity')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg text-orange-600">{t('dashboard.low_stock_alert')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.lowStockProducts.length > 0 ? (
                dashboardData.lowStockProducts.map((product, index) => (
                  <div key={product.id} className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-orange-50/50 to-orange-50/20 dark:from-orange-950/10 dark:to-orange-950/5 border border-orange-100 dark:border-orange-900/20 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center">
                          <Package className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                        <p className="text-xs text-muted-foreground">{product.warehouseName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-orange-600">{product.stock}</p>
                      <p className="text-xs text-muted-foreground">{t('products.stock')}</p>
                      <p className="text-xs text-orange-500">Min: {product.minStock}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-muted-foreground">{t('dashboard.no_low_stock') || 'All products have sufficient stock'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};