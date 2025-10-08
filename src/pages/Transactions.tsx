import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { History, TrendingUp, TrendingDown, ArrowRightLeft, Filter, Download, Calendar as CalendarIcon, BarChart3, ShoppingCart, RotateCcw } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../components/ui/utils';
import { ApiResponse, Transaction, Warehouse } from '../types';

export const Transactions: React.FC = () => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedType, setSelectedType] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalInbound: 0,
    totalOutbound: 0,
    totalTransfer: 0,
    todayTransactions: 0
  });

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.append('page', currentPage.toString());
      query.append('limit', '10');

      if (selectedWarehouse !== 'all') query.append('warehouseId', selectedWarehouse);
      if (selectedType !== 'all') query.append('type', selectedType);

      // Filter tanggal: langsung format 'YYYY-MM-DD' karena backend pakai timestamptz
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      if (startDate) query.append('dateFrom', formatDate(startDate));
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query.append('dateTo', formatDate(nextDay));
      }

      const response = await apiClient.get<ApiResponse<{
        transactions: Transaction[];
        total: number;
        pages: number;
        currentPage: number;
      }>>(`/transactions?${query.toString()}`);

      if (response.success) {
        const { transactions, total, pages } = response.data;
        setTransactions(transactions);
        setTotal(total);
        setTotalPages(pages);

        // Statistik
        const allTxResp = await apiClient.get<ApiResponse<{
          transactions: Transaction[];
        }>>('/transactions?limit=1000');

        if (allTxResp.success) {
          const allTx = allTxResp.data.transactions;
          const today = new Date().toDateString();

          setStats({
            totalInbound: allTx.filter((t) => t.type === 'inbound').length,
            totalOutbound: allTx.filter((t) =>
              ['outbound', 'release'].includes(t.type)
            ).length,
            totalTransfer: allTx.filter((t) => t.type === 'transfer').length,
            todayTransactions: allTx.filter(
              (t) => new Date(t.created_at).toDateString() === today
            ).length,
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ data: Warehouse[] }>('/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      toast.error('Failed to load warehouses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [currentPage, selectedType, selectedWarehouse, startDate, endDate]);

  const exportTransactions = () => {
    // Create CSV content
    const headers = ['Date', 'Type', 'Product', 'SKU', 'Quantity', 'From Warehouse', 'To Warehouse', 'Order', 'User', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        new Date(t.created_at).toLocaleString(),
        t.type,
        t.product_name,
        t.sku,
        t.quantity,
        t.warehouse_name || '-',
        t.to_warehouse_name || '-',
        t.reference_number || '-',
        t.created_by,
        t.notes || '-'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Transactions exported successfully');
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'inbound':
        return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300';
      case 'outbound':
        return 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300';
      case 'checkout':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-300';
      case 'release':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-300';
      case 'transfer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'inbound':
        return <TrendingUp className="w-3 h-3" />;
      case 'outbound':
        return <TrendingDown className="w-3 h-3" />;
      case 'checkout':
        return <ShoppingCart className="w-3 h-3" />;
      case 'release':
        return <RotateCcw className="w-3 h-3" />;
      case 'transfer':
        return <ArrowRightLeft className="w-3 h-3" />;
      default:
        return <History className="w-3 h-3" />;
    }
  };

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedWarehouse('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-8 p-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('transactions.title')}</h1>
          <p className="text-muted-foreground">
            Transaction reports and analytics ({total} transactions)
          </p>
        </div>
        <Button 
          onClick={exportTransactions} 
          variant="outline"
          className="border-border hover:bg-muted hover:text-foreground gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
                Inbound
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Inbound</p>
              <p className="text-3xl font-bold">{stats.totalInbound}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800">
                Outbound
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Outbound</p>
              <p className="text-3xl font-bold">{stats.totalOutbound}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4 text-white" />
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800">
                Transfer
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Transfer</p>
              <p className="text-3xl font-bold">{stats.totalTransfer}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-800">
                Today
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Today's Transactions</p>
              <p className="text-3xl font-bold">{stats.todayTransactions}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="checkout">Checkout</SelectItem>
                  <SelectItem value="release">Release</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Warehouse</Label>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="All warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All warehouses</SelectItem>
                  {warehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-border hover:bg-muted hover:text-foreground",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? startDate.toLocaleDateString() : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date?: Date) =>
                      !!date && (date > new Date() || (endDate && date > endDate))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-border hover:bg-muted hover:text-foreground",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? endDate.toLocaleDateString() : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date?: Date) =>
                      !!date && (date > new Date() || (startDate && date < startDate))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                className="w-full border-border hover:bg-muted hover:text-foreground"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Warehouses</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(transaction.created_at).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`gap-1 ${getTypeColor(transaction.type)}`}>
                          {getTypeIcon(transaction.type)}
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.product_name}</div>
                          <div className="text-sm text-muted-foreground font-mono">{transaction.sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          transaction.type === 'inbound' ? 'text-green-600' :
                          ['outbound', 'checkout'].includes(transaction.type) ? 'text-red-600' :
                          transaction.type === 'release' ? 'text-green-600' :
                          'text-blue-600'
                        }`}>
                          {['outbound', 'checkout'].includes(transaction.type) ? '-' : '+'}
                          {transaction.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {transaction.type === 'transfer' ? (
                            <>
                              <div className="text-muted-foreground">From: {transaction.warehouse_name}</div>
                              <div>To: {transaction.to_warehouse_name}</div>
                            </>
                          ) : (
                            <div>{transaction.warehouse_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {transaction.reference_number || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{transaction.created_by_name || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {transaction.notes || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-border hover:bg-muted hover:text-foreground"
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-border hover:bg-muted hover:text-foreground"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
