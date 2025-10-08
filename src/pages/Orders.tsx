import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Plus, ShoppingCart, Eye, CheckCircle, XCircle, Clock, AlertTriangle, Minus, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../services/apiClient';
import { Order, Warehouse, Product } from '../types';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';

export const Orders: React.FC = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Checkout form
  const [checkoutData, setCheckoutData] = useState({
    customerId: '',
    customerName: '',
    warehouseId: '',
    notes: ''
  });
  const [cartItems, setCartItems] = useState<{ productId: string; quantity: number }[]>([]);

  // --- Load Data ---
  const loadOrders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.append('page', currentPage.toString());
      query.append('limit', '10');
      if (selectedWarehouse !== 'all') query.append('warehouse_id', selectedWarehouse);
      if (selectedStatus !== 'all') query.append('status', selectedStatus);

      const response = await apiClient.get<{
        data: { orders: Order[]; total: number; pages?: number; currentPage?: number }
      }>(`/orders?${query.toString()}`);

      const respData = response.data;
      setOrders(respData.orders);
      setTotal(respData.total);
      setTotalPages(respData.pages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await apiClient.get<{ data: Product[] }>('/products');
      setProducts(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await apiClient.get<{ data: Warehouse[] }>('/warehouses');
      setWarehouses(response.data.filter(w => w.isActive));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load warehouses');
    }
  };

  useEffect(() => {
    loadProducts();
    loadWarehouses();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [currentPage, selectedStatus, selectedWarehouse]);

  // --- Cart Logic ---
  const resetCheckoutForm = () => {
    setCheckoutData({ customerId: '', customerName: '', warehouseId: '', notes: '' });
    setCartItems([]);
  };

  const addToCart = (productId: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCartItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      return acc + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleCheckout = async () => {
    try {
      if (!checkoutData.customerId || !checkoutData.customerName || !checkoutData.warehouseId) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (cartItems.length === 0) {
        toast.error('Please add items to cart');
        return;
      }

      // Validate stock
      for (const item of cartItems) {
        const product = products.find(p => p.id === item.productId && p.warehouseId === checkoutData.warehouseId);
        if (!product) {
          toast.error(`Product not available in selected warehouse`);
          return;
        }
        if (product.stock < item.quantity) {
          toast.error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
          return;
        }
      }

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');

      const orderNumber = `ORD${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 jam = 60*60*1000 ms

      // Payload
      const payload = {
        order_number: orderNumber,
        customer_id: checkoutData.customerId,
        customer_name: checkoutData.customerName,
        warehouse_id: checkoutData.warehouseId,
        items: cartItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        notes: checkoutData.notes,
        expires_at: expiresAt.toISOString(),
      };

      await apiClient.post('/orders', payload);

      toast.success('Order created successfully');
      setIsCheckoutDialogOpen(false);
      resetCheckoutForm();
      loadOrders();
      loadProducts();
      loadWarehouses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order ${status.replace('_', ' ')} successfully`);
      loadOrders();
      loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
    setIsViewDialogOpen(true);
  };

  const formatCurrency = (amount?: number | null) => {
    const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value);
  };


  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300';
      case 'processing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-300';
      case 'shipped':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending_payment':
        return <Clock className="w-3 h-3" />;
      case 'confirmed':
        return <CheckCircle className="w-3 h-3" />;
      case 'processing':
        return <ShoppingCart className="w-3 h-3" />;
      case 'shipped':
        return <ShoppingCart className="w-3 h-3" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3" />;
      case 'expired':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const isOrderExpired = (order: Order) => {
    if (new Date(order.expires_at) < new Date() && order.status === 'pending_payment') {
      handleUpdateStatus(order.id, 'expired');
      return true;
    }
    return false;
  };

  const availableProducts = products.filter(p => 
    !checkoutData.warehouseId || p.warehouseId === checkoutData.warehouseId
  );

  const showSkeleton = loading && orders.length === 0;

  if (showSkeleton) {
    return (
      <div className="space-y-8 p-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
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
          <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
          <p className="text-muted-foreground">
            Manage orders and checkout process ({total} orders)
          </p>
        </div>
        <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetCheckoutForm} className="gap-2">
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Create a new order by selecting products and specifying customer details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Customer & Warehouse Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID *</Label>
                  <Input
                    id="customerId"
                    value={checkoutData.customerId}
                    onChange={(e) => setCheckoutData({ ...checkoutData, customerId: e.target.value })}
                    placeholder="Enter customer ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={checkoutData.customerName}
                    onChange={(e) => setCheckoutData({ ...checkoutData, customerName: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse *</Label>
                <Select value={checkoutData.warehouseId} onValueChange={(value: string) => {
                  setCheckoutData({ ...checkoutData, warehouseId: value });
                  setCartItems([]); // Clear cart when warehouse changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Selection */}
              {checkoutData.warehouseId && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Select Products</h3>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">{product.sku}</div>
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(product.price)}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => addToCart(product.id)}
                                disabled={(cartItems.find(item => item.productId === product.id)?.quantity ?? 0) >= product.stock}
                              >
                                Add to Cart
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Cart */}
              {cartItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Shopping Cart</h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cartItems.map((item) => {
                          const product = products.find(p => p.id === item.productId);
                          if (!product) return null;
                          
                          return (
                            <TableRow key={item.productId}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">{product.sku}</div>
                                </div>
                              </TableCell>
                              <TableCell>{formatCurrency(product.price)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                    disabled={item.quantity >= product.stock}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>{formatCurrency(product.price * item.quantity)}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFromCart(item.productId)}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <div className="p-4 border-t">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(getCartTotal())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={checkoutData.notes}
                  onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                  placeholder="Optional order notes"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCheckout} disabled={cartItems.length === 0}>
                Create Order ({formatCurrency(getCartTotal())})
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedWarehouse('all');
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Orders List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className={isOrderExpired(order) ? "bg-red-50 dark:bg-red-950/20" : ""}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.length} items
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.warehouse_name}</TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge className={`gap-1 ${getStatusColor(isOrderExpired(order) ? 'expired' : order.status)}`}>
                          {getStatusIcon(isOrderExpired(order) ? 'expired' : order.status)}
                          {isOrderExpired(order) ? 'Expired' : (order.status || 'unknown').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(order.created_at).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {/* Confirm Payment Button */}
                          {order.status === 'pending_payment' && !isOrderExpired(order) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                              title="Confirm Payment"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {/* Start Processing Button */}
                          {order.status === 'confirmed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'processing')}
                              title="Start Processing"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {/* Ship Order Button */}
                          {order.status === 'processing' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'shipped')}
                              title="Ship Order"
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {/* Mark as Delivered Button */}
                          {order.status === 'shipped' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                              title="Mark as Delivered"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {/* Cancel Order Button */}
                          {(['pending_payment', 'confirmed'].includes(order.status)) && !isOrderExpired(order) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  title="Cancel Order"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel order "{order.order_number}"? This will release all reserved stock.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No, keep order</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleUpdateStatus(order.id, 'cancelled')}>
                                    Yes, cancel order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
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
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View complete order information and items.
            </DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order Number</Label>
                  <p className="font-medium">{viewingOrder.order_number}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={`gap-1 ${getStatusColor(viewingOrder.status)}`}>
                    {getStatusIcon(viewingOrder.status)}
                    {viewingOrder.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Customer</Label>
                  <p className="font-medium">{viewingOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{viewingOrder.customer_id}</p>
                </div>
                <div>
                  <Label>Warehouse</Label>
                  <p className="font-medium">{viewingOrder.warehouse_name}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">{new Date(viewingOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Expires</Label>
                  <p className="text-sm">{new Date(viewingOrder.expires_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label>Order Items</Label>
                <div className="border rounded-lg mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.product_name}</div>
                              <div className="text-sm text-muted-foreground">{item.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell>{formatCurrency(item.total_price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-4 border-t">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(viewingOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {viewingOrder.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm bg-muted p-3 rounded-lg mt-2">{viewingOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};