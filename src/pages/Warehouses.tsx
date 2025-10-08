import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Plus, Edit, Trash2, Warehouse as WarehouseIcon, MapPin, User, Package, ArrowRightLeft, Building2 } from 'lucide-react';  // Gunakan WarehouseIcon
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../services/apiClient';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { Progress } from '../components/ui/progress';
import { Warehouse, Product } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Warehouses: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    isActive: true,
    capacity: '',
    manager: ''
  });

  const [transferData, setTransferData] = useState({
    productId: '',
    quantity: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    notes: ''
  });

  // ==================== API Calls ====================
  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ data: Warehouse[] }>('/warehouses');
      setWarehouses(response.data);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await apiClient.get<{ data: Product[] }>('/products');
      setProducts(response.data);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load products');
    }
  };

  useEffect(() => {
    loadWarehouses();
    loadProducts();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', address: '', isActive: true, capacity: '', manager: '' });
    setEditingWarehouse(null);
  };

  const resetTransferForm = () => {
    setTransferData({ productId: '', quantity: '', fromWarehouseId: '', toWarehouseId: '', notes: '' });
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name || '',
      address: warehouse.address || '',
      isActive: warehouse.isActive,
      capacity: warehouse.capacity?.toString() || '',
      manager: warehouse.manager || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.address || !formData.capacity || !formData.manager) {
        toast.error('Please fill in all required fields');
        return;
      }

      const payload = {
        name: formData.name,
        address: formData.address,
        isActive: formData.isActive,
        capacity: parseInt(formData.capacity),
        manager: formData.manager,
        currentUtilization: editingWarehouse?.currentUtilization || 0
      };

      if (editingWarehouse) {
        await apiClient.put(`/warehouses/${editingWarehouse.id}`, payload);
        toast.success('Warehouse updated successfully');
      } else {
        await apiClient.post('/warehouses', payload);
        toast.success('Warehouse created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      loadWarehouses();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save warehouse');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/warehouses/${id}`);
      toast.success('Warehouse deleted successfully');
      loadWarehouses();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to delete warehouse');
    }
  };

  const handleStockTransfer = async () => {
    try {
      // === Validasi awal ===
      if (
        !transferData.productId ||
        !transferData.quantity ||
        !transferData.fromWarehouseId ||
        !transferData.toWarehouseId
      ) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (transferData.fromWarehouseId === transferData.toWarehouseId) {
        toast.error('Source and destination warehouses cannot be the same');
        return;
      }

      const product = products.find(p => p.id === transferData.productId);
      if (!product) throw new Error('Product not found');

      const fromWarehouse = warehouses.find(w => w.id === transferData.fromWarehouseId);
      const toWarehouse = warehouses.find(w => w.id === transferData.toWarehouseId);
      if (!fromWarehouse || !toWarehouse) throw new Error('Warehouse not found');

      const transferQty = parseInt(transferData.quantity);

      // === VALIDASI UTAMA: stok tidak boleh kurang ===
      if (transferQty > (product.stock || 0)) {
        toast.error(`Transfer quantity cannot exceed available stock (${product.stock || 0})`);
        return;
      }

      if (transferQty <= 0) {
        toast.error('Transfer quantity must be greater than zero');
        return;
      }

      const userId = user?.id;
      if (!userId) {
        toast.error('User not authenticated');
        return;
      }

      // === Kirim request ke API ===
      await apiClient.post('/transactions', {
        type: 'transfer',
        product_id: product.id,
        quantity: transferQty,
        warehouse_id: fromWarehouse.id,
        to_warehouse_id: toWarehouse.id,
        notes: transferData.notes || 'Stock transfer',
        created_by: userId,
      });

      toast.success('Stock transfer completed successfully');
      setIsTransferDialogOpen(false);
      resetTransferForm();
      loadProducts();
      loadWarehouses();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to transfer stock');
    }
  };

  const getCapacityPercentage = (warehouse: Warehouse) =>
    warehouse?.capacity && warehouse?.currentUtilization
      ? (warehouse?.currentUtilization / warehouse?.capacity) * 100
      : 0;

  const getProductsInWarehouse = (warehouseId: string) =>
    products.filter(p => p.warehouseId === warehouseId);

  const getAvailableProducts = (warehouseId: string) =>
    products.filter(p => p.warehouseId === warehouseId && p.stock > 0);

  // ==================== JSX ====================
  if (loading) {
    return (
      <div className="space-y-8 p-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('warehouses.title')}</h1>
          <p className="text-muted-foreground">
            Manage warehouse locations and stock transfers
          </p>
        </div>
        <div className="flex gap-2">
          {/* Transfer Dialog */}
          <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetTransferForm} className="gap-2">
                <ArrowRightLeft className="w-4 h-4" />
                Transfer Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stock Transfer</DialogTitle>
                <DialogDescription>
                  Transfer products between warehouses. Select source and destination warehouses, then choose the product and quantity to transfer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fromWarehouse">From Warehouse *</Label>
                  <Select value={transferData.fromWarehouseId} onValueChange={(value: string) => {
                    setTransferData({ ...transferData, fromWarehouseId: value, productId: '' });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.filter(w => w.isActive).map(warehouse => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toWarehouse">To Warehouse *</Label>
                  <Select value={transferData.toWarehouseId} onValueChange={(value: string) => setTransferData({ ...transferData, toWarehouseId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.filter(w => w.isActive && w.id !== transferData.fromWarehouseId).map(warehouse => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product">Product *</Label>
                  <Select value={transferData.productId} onValueChange={(value: string) => setTransferData({ ...transferData, productId: value })} disabled={!transferData.fromWarehouseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product to transfer" />
                    </SelectTrigger>
                    <SelectContent>
                      {transferData.fromWarehouseId && getAvailableProducts(transferData.fromWarehouseId).map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku}) - Stock: {product.stock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transferQuantity">Quantity *</Label>
                  <Input
                    id="transferQuantity"
                    type="number"
                    value={transferData.quantity}
                    onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    max={transferData.productId ? products.find(p => p.id === transferData.productId)?.stock : undefined}
                    disabled={!transferData.productId}
                  />
                  {transferData.productId && (
                    <p className="text-sm text-muted-foreground">
                      Available: {products.find(p => p.id === transferData.productId)?.stock || 0}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transferNotes">Notes</Label>
                  <Textarea
                    id="transferNotes"
                    value={transferData.notes}
                    onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                    placeholder="Optional notes for the transfer"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStockTransfer}>
                  Transfer Stock
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add/Edit Warehouse Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
                </DialogTitle>
                <DialogDescription>
                  {editingWarehouse 
                    ? 'Update warehouse information including name, address, capacity, and warehouse manager details.'
                    : 'Create a new warehouse by providing location details, capacity, and assigning a warehouse manager.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Warehouse Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter warehouse name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter warehouse address"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="Maximum capacity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">{t('warehouses.kepala_gudang')} *</Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      placeholder={t('warehouses.kepala_gudang')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.isActive.toString()} onValueChange={(value: string) => setFormData({ ...formData, isActive: value === 'true' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingWarehouse ? 'Update' : 'Create'} Warehouse
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => {
          const productsInWarehouse = getProductsInWarehouse(warehouse.id);
          const capacityPercentage = getCapacityPercentage(warehouse);

          return (
            <Card key={warehouse.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      warehouse.isActive 
                        ? 'bg-green-50 dark:bg-green-950/20' 
                        : 'bg-gray-50 dark:bg-gray-950/20'
                    }`}>
                      <Building2 className={`w-6 h-6 ${
                        warehouse.isActive ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                      <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                        {warehouse.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(warehouse)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Warehouse</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{warehouse.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(warehouse.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{warehouse.address}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{t('warehouses.kepala_gudang')}: {warehouse.manager}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Capacity Usage</span>
                    <span>{warehouse.currentUtilization?.toLocaleString()} / {warehouse.capacity?.toLocaleString()}</span>
                  </div>
                  <Progress value={capacityPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {capacityPercentage.toFixed(1)}% utilized
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                      <Package className="w-4 h-4" />
                      {productsInWarehouse.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                      <WarehouseIcon className="w-4 h-4" /> {/* Ganti dengan WarehouseIcon */}
                      {productsInWarehouse.reduce((sum, p) => sum + p.stock, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {warehouses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No warehouses found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first warehouse to start managing inventory.
            </p>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Warehouse
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
