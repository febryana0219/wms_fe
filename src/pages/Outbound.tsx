import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { Truck, Plus, Search, Calendar, Building, FileText, Users, ArrowRight, RotateCcw, Trash2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { OutboundRecord, Warehouse, Product } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function Outbound() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [records, setRecords] = useState<OutboundRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    quantity: '',
    destination_type: 'customer' as 'customer' | 'return',
    destination_name: '',
    destination_contact: '',
    reference_number: '',
    unit_price: '',
    notes: '',
    shipped_date: new Date().toISOString().split('T')[0],
    created_by: '',
  });

  // Load outbounds
  const loadOutbounds = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.append('page', currentPage.toString());
      query.append('limit', '10');
      if (searchQuery) query.append('search', searchQuery);
      if (selectedWarehouse !== 'all') query.append('warehouseId', selectedWarehouse);

      const response = await apiClient.get<{
        data: { outbounds: OutboundRecord[]; total: number; pages?: number }
      }>('/outbounds?' + query.toString());

      setRecords(response.data.outbounds);
      setTotal(response.data.total);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error loading outbounds:', error);
      toast.error('Failed to load outbounds');
    } finally {
      setLoading(false);
    }
  };

  // Load warehouses
  const loadWarehouses = async () => {
    try {
      const response = await apiClient.get<{ data: Warehouse[] }>('/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      toast.error('Failed to load warehouses');
    }
  };

  // Load products
  const loadProducts = async () => {
    try {
      const response = await apiClient.get<{ data: Product[] }>('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    }
  };

  useEffect(() => {
    loadWarehouses();
    loadProducts();
  }, []);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    loadOutbounds();
  }, [currentPage, debouncedSearch, selectedWarehouse]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_id || !formData.warehouse_id || !formData.quantity || !formData.destination_name) {
      toast.error(t('errors.validation_error'));
      return;
    }

    const userId = user?.id;
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Payload untuk outbound
      const outboundPayload = {
        product_id: formData.product_id,
        warehouse_id: formData.warehouse_id,
        quantity: parseInt(formData.quantity),
        destination_type: formData.destination_type,
        destination_name: formData.destination_name,
        destination_contact: formData.destination_contact || undefined,
        reference_number: formData.reference_number || undefined,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : undefined,
        notes: formData.notes || undefined,
        shipped_date: new Date(formData.shipped_date).toISOString(),
        created_by: userId
      };

      // Post ke outbounds
      await apiClient.post('/outbounds', outboundPayload);

      // Payload untuk transactions
      const transactionPayload = {
        type: 'outbound',
        product_id: formData.product_id,
        quantity: parseInt(formData.quantity),
        warehouse_id: formData.warehouse_id,
        reference: formData.reference_number || undefined,
        notes: formData.notes || undefined,
        created_by: userId
      };

      // Post ke transactions
      await apiClient.post('/transactions', transactionPayload);

      toast.success(t('outbound.outbound_added'));
      setIsAddDialogOpen(false);
      setFormData({
        product_id: '',
        warehouse_id: '',
        quantity: '',
        destination_type: 'customer',
        destination_name: '',
        destination_contact: '',
        reference_number: '',
        unit_price: '',
        notes: '',
        shipped_date: new Date().toISOString().split('T')[0],
        created_by: userId
      });
      loadOutbounds();
    } catch (error: any) {
      console.error('Error creating outbound record:', error);
      toast.error(t('errors.something_went_wrong'));
    }
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDestinationIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <Users className="h-4 w-4" />;
      case 'return':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getDestinationBadgeVariant = (type: string) => {
    switch (type) {
      case 'customer':
        return 'secondary';
      case 'return':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Filter products by selected warehouse for the form
  const filteredProducts = products.filter(p => 
    !formData.warehouse_id || p.warehouseId === formData.warehouse_id
  );

  // Get available stock for selected product
  const selectedProduct = products.find(p => p.id === formData.product_id);
  const availableStock = selectedProduct?.availableStock || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1>{t('outbound.title')}</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1>{t('outbound.title')}</h1>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('outbound.add_outbound')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{t('outbound.add_outbound')}</DialogTitle>
              <DialogDescription>
                Add a new outbound record to track outgoing inventory
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"> {/* Mengubah grid */}
              {/* Warehouse Selection */}
              <div className="space-y-2 col-span-2 sm:col-span-3 lg:col-span-3">
                <Label htmlFor="warehouse_id">{t('warehouses.warehouse_name')}</Label>
                <Select
                  value={formData.warehouse_id}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, warehouse_id: value, product_id: '' }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.filter(w => w.isActive).map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Selection */}
              <div className="space-y-2 col-span-3 sm:col-span-4 lg:col-span-4">
                <Label htmlFor="product_id">{t('orders.product')}</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, product_id: value }))}
                  required
                  disabled={!formData.warehouse_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku}) - Available: {product.availableStock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-2">
                <Label htmlFor="quantity">{t('warehouses.quantity')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  required
                  min="1"
                  max={availableStock}
                />
                {selectedProduct && (
                  <p className="text-sm text-muted-foreground">
                    Available stock: {availableStock}
                  </p>
                )}
              </div>

              {/* Destination Type */}
              <div className="space-y-2 col-span-2 sm:col-span-3 lg:col-span-3">
                <Label htmlFor="destination_type">{t('outbound.destination_type')}</Label>
                <Select
                  value={formData.destination_type}
                  onValueChange={(value: 'customer' | 'return') => setFormData(prev => ({ 
                    ...prev, 
                    destination_type: value 
                  }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">{t('outbound.customer')}</SelectItem>
                    <SelectItem value="return">{t('outbound.return')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Destination Name */}
              <div className="space-y-2 col-span-2 sm:col-span-3 lg:col-span-3">
                <Label htmlFor="destination_name">{t('outbound.destination_name')}</Label>
                <Input
                  id="destination_name"
                  value={formData.destination_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination_name: e.target.value }))}
                  required
                  placeholder="Company name, customer name, or destination"
                />
              </div>

              {/* Destination Contact */}
              <div className="space-y-2 col-span-2 sm:col-span-3 lg:col-span-3">
                <Label htmlFor="destination_contact">{t('outbound.destination_contact')}</Label>
                <Input
                  id="destination_contact"
                  value={formData.destination_contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination_contact: e.target.value }))}
                  placeholder="Phone, email, or address"
                />
              </div>

              {/* Reference Number */}
              <div className="space-y-2 col-span-2 sm:col-span-3 lg:col-span-3">
                <Label htmlFor="reference_number">{t('inbound.reference_number')}</Label>
                <Input
                  id="reference_number"
                  value={formData.reference_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                  placeholder="SO number, invoice number, etc."
                />
              </div>

              {/* Unit Price */}
              <div className="space-y-2 col-span-2 sm:col-span-3 lg:col-span-3">
                <Label htmlFor="unit_price">{t('outbound.unit_price')}</Label>
                <Input
                  id="unit_price"
                  type="number"
                  value={formData.unit_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_price: e.target.value }))}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Shipped Date */}
              <div className="space-y-2 col-span-2 sm:col-span-3 lg:col-span-3">
                <Label htmlFor="shipped_date">{t('outbound.shipped_date')}</Label>
                <Input
                  id="shipped_date"
                  type="date"
                  value={formData.shipped_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipped_date: e.target.value }))}
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-4">
                <Label htmlFor="notes">{t('transactions.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <DialogFooter className="col-span-1 sm:col-span-2 lg:col-span-3">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product, SKU, destination, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            {warehouses.filter(w => w.isActive).map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Outbound Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No outbound records found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Shipped Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.product_name}</div>
                          <div className="text-sm text-muted-foreground">{record.product_sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{record.warehouse_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getDestinationBadgeVariant(record.destination_type)} className="text-xs">
                              {getDestinationIcon(record.destination_type)}
                              <span className="ml-1">{record.destination_type}</span>
                            </Badge>
                          </div>
                          <div>
                            <div className="font-medium">{record.destination_name}</div>
                            {record.destination_contact && (
                              <div className="text-sm text-muted-foreground">{record.destination_contact}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{record.quantity}</Badge>
                      </TableCell>
                      <TableCell>
                        {record.reference_number ? (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{record.reference_number}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          {record.unit_price && (
                            <div className="text-sm">{formatCurrency(record.unit_price)}/unit</div>
                          )}
                          {record.total_price && (
                            <div className="font-medium">{formatCurrency(record.total_price)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(record.shipped_date)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

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
    </div>
  );
}
