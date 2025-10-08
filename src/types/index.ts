export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  warehouseId: string;
  warehouseName: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface LoginResponse {
  data: {
    token: AuthTokens;
    user: User;
  };
  message: string;
  success: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Warehouse {
  id: string;
  name: string;
  isActive: boolean;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  capacity?: number;
  currentStock?: number;
  currentUtilization?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  warehouseId: string;
  warehouseName: string;
  category: string;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'inbound' | 'outbound' | 'transfer' | 'checkout' | 'release';
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  warehouse_id: string;
  warehouse_name: string;
  to_warehouse_id?: string;
  to_warehouse_name?: string;
  reference_number?: string;
  notes?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  warehouse_id: string;
  warehouse_name: string;
  status: 'pending_payment' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'expired';
  items: OrderItem[];
  total_amount: number;
  notes?: string;
  created_at: string;
  expires_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  message: string;
  success: boolean;
}

export interface InboundRecord {
  id: string;
  product_id: string;
  product_name?: string;
  product_sku?: string;
  warehouse_id: string;
  warehouse_name?: string;
  quantity: number;
  supplier_name: string;
  supplier_contact?: string;
  reference_number?: string;
  unit_cost?: number;
  total_cost?: number;
  notes?: string;
  received_date: string;
  created_at: string;
  created_by: string;
  created_by_name?: string;
}

export interface OutboundRecord {
  id: string;
  product_id: string;
  product_name?: string;
  product_sku?: string;
  warehouse_id: string;
  warehouse_name?: string;
  quantity: number;
  destination_type: 'customer' | 'transfer' | 'return' | 'disposal';
  destination_name: string;
  destination_contact?: string;
  reference_number?: string;
  unit_price?: number;
  total_price?: number;
  notes?: string;
  shipped_date: string;
  created_at: string;
  created_by: string;
  created_by_name?: string;
}

export type Language = 'id' | 'en';
export type Theme = 'light' | 'dark' | 'system';