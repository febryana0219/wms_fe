import { User, Product, Warehouse, ApiResponse, InboundRecord, OutboundRecord } from '../types';

// Order interface that matches our mock data structure  
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  status: 'pending_payment' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'expired';
  totalAmount: number;
  warehouseId: string;
  warehouseName: string;
  createdAt: string;
  expiresAt: string;
  notes?: string;
}

// Transaction interface that matches our mock data structure
export interface Transaction {
  id: string;
  type: 'inbound' | 'outbound' | 'transfer' | 'checkout' | 'release';
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
  toWarehouseId?: string;
  toWarehouseName?: string;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// Mock delay function
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Users
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',               // Tambahkan username
    email: 'admin@wms.com',
    name: 'Admin User',
    role: 'admin',
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    is_active: true,                 // Tambahkan is_active
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z', // Tambahkan updated_at
  },
  {
    id: '2',
    username: 'staff',               // Tambahkan username
    email: 'staff@wms.com',
    name: 'Staff User',
    role: 'staff',
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    is_active: true,                 // Tambahkan is_active
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z', // Tambahkan updated_at
  }
];


// Mock Products (Skin Care)
let mockProducts: Product[] = [
  {
    id: '1',
    name: 'Vitamin C Serum Brightening',
    sku: 'VITC-SER-001',
    description: 'Anti-aging serum with 20% Vitamin C for brightening skin',
    price: 350000,
    stock: 125,
    reservedStock: 12,
    availableStock: 113,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Serum',
    minStock: 20,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Hyaluronic Acid Moisturizer',
    sku: 'HYAL-MOIST-001',
    description: 'Intensive hydrating moisturizer with hyaluronic acid',
    price: 275000,
    stock: 85,
    reservedStock: 8,
    availableStock: 77,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Moisturizer',
    minStock: 15,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: '3',
    name: 'Niacinamide 10% + Zinc Serum',
    sku: 'NIAC-SER-001',
    description: 'Oil control serum for acne-prone skin',
    price: 285000,
    stock: 95,
    reservedStock: 15,
    availableStock: 80,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Serum',
    minStock: 18,
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-19T16:45:00Z'
  },
  {
    id: '4',
    name: 'Gentle Foaming Cleanser',
    sku: 'FOAM-CLEAN-001',
    description: 'pH balanced gentle cleanser for all skin types',
    price: 165000,
    stock: 150,
    reservedStock: 20,
    availableStock: 130,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Cleanser',
    minStock: 25,
    createdAt: '2024-01-08T13:00:00Z',
    updatedAt: '2024-01-17T09:15:00Z'
  },
  {
    id: '5',
    name: 'Retinol 0.5% Night Treatment',
    sku: 'RETIN-NIGHT-001',
    description: 'Anti-aging night treatment with retinol',
    price: 425000,
    stock: 60,
    reservedStock: 8,
    availableStock: 52,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Serum',
    minStock: 12,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-16T12:30:00Z'
  },
  {
    id: '6',
    name: 'Sunscreen SPF 50+ PA+++',
    sku: 'SUN-SPF50-001',
    description: 'Broad spectrum sunscreen with zinc oxide',
    price: 195000,
    stock: 180,
    reservedStock: 25,
    availableStock: 155,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Sunscreen',
    minStock: 30,
    createdAt: '2024-01-03T14:00:00Z',
    updatedAt: '2024-01-15T11:20:00Z'
  },
  {
    id: '7',
    name: 'AHA BHA Exfoliating Toner',
    sku: 'AHA-BHA-TON-001',
    description: 'Chemical exfoliant toner for smoother skin',
    price: 225000,
    stock: 75,
    reservedStock: 10,
    availableStock: 65,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Toner',
    minStock: 15,
    createdAt: '2024-01-07T09:30:00Z',
    updatedAt: '2024-01-14T16:00:00Z'
  },
  {
    id: '8',
    name: 'Ceramide Repair Cream',
    sku: 'CERAM-CREAM-001',
    description: 'Barrier repair cream with ceramides',
    price: 315000,
    stock: 65,
    reservedStock: 7,
    availableStock: 58,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Moisturizer',
    minStock: 12,
    createdAt: '2024-01-06T12:15:00Z',
    updatedAt: '2024-01-13T10:45:00Z'
  },
  {
    id: '9',
    name: 'Rose Hip Oil Face Serum',
    sku: 'ROSE-OIL-001',
    description: 'Nourishing face oil with rosehip extract',
    price: 265000,
    stock: 45,
    reservedStock: 5,
    availableStock: 40,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Serum',
    minStock: 10,
    createdAt: '2024-01-04T11:00:00Z',
    updatedAt: '2024-01-12T15:30:00Z'
  },
  {
    id: '10',
    name: 'Micellar Water Cleanser',
    sku: 'MIC-WATER-001',
    description: 'No-rinse micellar water for makeup removal',
    price: 145000,
    stock: 200,
    reservedStock: 30,
    availableStock: 170,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Cleanser',
    minStock: 35,
    createdAt: '2024-01-02T10:30:00Z',
    updatedAt: '2024-01-11T14:15:00Z'
  },
  {
    id: '11',
    name: 'Peptide Anti-Aging Cream',
    sku: 'PEPT-CREAM-001',
    description: 'Premium anti-aging cream with peptides',
    price: 495000,
    stock: 35,
    reservedStock: 3,
    availableStock: 32,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Moisturizer',
    minStock: 8,
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-10T13:20:00Z'
  },
  {
    id: '12',
    name: 'Salicylic Acid Spot Treatment',
    sku: 'SALIC-SPOT-001',
    description: 'Targeted acne spot treatment with 2% salicylic acid',
    price: 185000,
    stock: 90,
    reservedStock: 12,
    availableStock: 78,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Treatment',
    minStock: 15,
    createdAt: '2024-01-09T16:00:00Z',
    updatedAt: '2024-01-18T11:45:00Z'
  },
  // New Reglow-Inspired Products
  {
    id: '13',
    name: 'Barrier Recovery Serum',
    sku: 'BARR-SER-001',
    description: 'Intensive barrier repair serum with ceramides and cholesterol',
    price: 325000,
    stock: 75,
    reservedStock: 8,
    availableStock: 67,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Serum',
    minStock: 15,
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-19T09:30:00Z'
  },
  {
    id: '14',
    name: 'Glow Brightening Essence',
    sku: 'GLOW-ESS-001',
    description: 'Brightening essence with alpha arbutin and kojic acid',
    price: 245000,
    stock: 110,
    reservedStock: 15,
    availableStock: 95,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Essence',
    minStock: 20,
    createdAt: '2024-01-08T10:30:00Z',
    updatedAt: '2024-01-17T15:45:00Z'
  },
  {
    id: '15',
    name: 'Acne Clear Treatment Gel',
    sku: 'ACNE-GEL-001',
    description: 'Fast-acting acne treatment gel with tea tree oil and niacinamide',
    price: 195000,
    stock: 85,
    reservedStock: 10,
    availableStock: 75,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Treatment',
    minStock: 18,
    createdAt: '2024-01-12T11:15:00Z',
    updatedAt: '2024-01-20T08:20:00Z'
  },
  {
    id: '16',
    name: 'Hydrating Toner Mist',
    sku: 'HYDR-TON-001',
    description: 'Refreshing hydrating toner mist with hyaluronic acid',
    price: 165000,
    stock: 120,
    reservedStock: 18,
    availableStock: 102,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Toner',
    minStock: 25,
    createdAt: '2024-01-07T13:45:00Z',
    updatedAt: '2024-01-16T10:15:00Z'
  },
  {
    id: '17',
    name: 'Age Defense Eye Cream',
    sku: 'EYE-CREAM-001',
    description: 'Anti-aging eye cream with retinol and caffeine',
    price: 385000,
    stock: 55,
    reservedStock: 6,
    availableStock: 49,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Eye Care',
    minStock: 12,
    createdAt: '2024-01-05T09:20:00Z',
    updatedAt: '2024-01-15T14:35:00Z'
  },
  {
    id: '18',
    name: 'Gentle Exfoliating Scrub',
    sku: 'SCRUB-GEN-001',
    description: 'Physical exfoliating scrub with rice bran and jojoba beads',
    price: 155000,
    stock: 95,
    reservedStock: 12,
    availableStock: 83,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Cleanser',
    minStock: 20,
    createdAt: '2024-01-11T16:00:00Z',
    updatedAt: '2024-01-18T12:45:00Z'
  },
  {
    id: '19',
    name: 'Collagen Firming Mask',
    sku: 'COLL-MASK-001',
    description: 'Weekly firming sheet mask with marine collagen',
    price: 85000,
    stock: 200,
    reservedStock: 25,
    availableStock: 175,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Mask',
    minStock: 40,
    createdAt: '2024-01-03T12:30:00Z',
    updatedAt: '2024-01-14T11:20:00Z'
  },
  {
    id: '20',
    name: 'Daily Moisturizing Lotion',
    sku: 'DAILY-MOIST-001',
    description: 'Lightweight daily moisturizer with SPF 15',
    price: 225000,
    stock: 140,
    reservedStock: 20,
    availableStock: 120,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Moisturizer',
    minStock: 30,
    createdAt: '2024-01-06T14:15:00Z',
    updatedAt: '2024-01-17T09:40:00Z'
  },
  {
    id: '21',
    name: 'Vitamin E Night Oil',
    sku: 'VITE-OIL-001',
    description: 'Nourishing night facial oil with vitamin E and rosehip',
    price: 295000,
    stock: 65,
    reservedStock: 7,
    availableStock: 58,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Serum',
    minStock: 15,
    createdAt: '2024-01-09T10:45:00Z',
    updatedAt: '2024-01-19T16:30:00Z'
  },
  {
    id: '22',
    name: 'Brightening Clay Mask',
    sku: 'CLAY-MASK-001',
    description: 'Purifying clay mask with kaolin and turmeric',
    price: 175000,
    stock: 80,
    reservedStock: 9,
    availableStock: 71,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Mask',
    minStock: 18,
    createdAt: '2024-01-04T15:20:00Z',
    updatedAt: '2024-01-16T13:25:00Z'
  },
  {
    id: '23',
    name: 'Soothing Aloe Gel',
    sku: 'ALOE-GEL-001',
    description: 'Pure aloe vera gel for sensitive and irritated skin',
    price: 125000,
    stock: 160,
    reservedStock: 22,
    availableStock: 138,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Treatment',
    minStock: 35,
    createdAt: '2024-01-02T11:10:00Z',
    updatedAt: '2024-01-13T14:50:00Z'
  },
  {
    id: '24',
    name: 'Peptide Renewal Serum',
    sku: 'PEPT-SER-001',
    description: 'Advanced anti-aging serum with copper peptides',
    price: 445000,
    stock: 45,
    reservedStock: 5,
    availableStock: 40,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Serum',
    minStock: 10,
    createdAt: '2024-01-01T08:30:00Z',
    updatedAt: '2024-01-12T17:15:00Z'
  },
  {
    id: '25',
    name: 'Pore Minimizing Toner',
    sku: 'PORE-TON-001',
    description: 'Astringent toner with witch hazel for large pores',
    price: 185000,
    stock: 100,
    reservedStock: 14,
    availableStock: 86,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Toner',
    minStock: 22,
    createdAt: '2024-01-08T09:45:00Z',
    updatedAt: '2024-01-18T15:10:00Z'
  },
  {
    id: '26',
    name: 'Intensive Repair Balm',
    sku: 'REPAIR-BALM-001',
    description: 'Rich repair balm for extremely dry and cracked skin',
    price: 265000,
    stock: 70,
    reservedStock: 8,
    availableStock: 62,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Moisturizer',
    minStock: 16,
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-19T10:25:00Z'
  },
  {
    id: '27',
    name: 'Antioxidant Face Wash',
    sku: 'ANTI-WASH-001',
    description: 'Antioxidant-rich face wash with green tea and pomegranate',
    price: 145000,
    stock: 130,
    reservedStock: 17,
    availableStock: 113,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Cleanser',
    minStock: 28,
    createdAt: '2024-01-07T08:15:00Z',
    updatedAt: '2024-01-17T12:40:00Z'
  },
  {
    id: '28',
    name: 'Hydrogel Eye Patches',
    sku: 'EYE-PATCH-001',
    description: 'Cooling hydrogel patches for under-eye puffiness',
    price: 95000,
    stock: 180,
    reservedStock: 24,
    availableStock: 156,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Eye Care',
    minStock: 40,
    createdAt: '2024-01-05T14:30:00Z',
    updatedAt: '2024-01-15T11:55:00Z'
  },
  {
    id: '29',
    name: 'Brightening Vitamin C Cream',
    sku: 'VITC-CREAM-001',
    description: 'Day cream with stable vitamin C and SPF 30',
    price: 355000,
    stock: 85,
    reservedStock: 11,
    availableStock: 74,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    category: 'Moisturizer',
    minStock: 18,
    createdAt: '2024-01-09T13:20:00Z',
    updatedAt: '2024-01-20T16:45:00Z'
  },
  {
    id: '30',
    name: 'Purifying Charcoal Cleanser',
    sku: 'CHAR-CLEAN-001',
    description: 'Deep cleansing foam with activated charcoal',
    price: 165000,
    stock: 115,
    reservedStock: 15,
    availableStock: 100,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    category: 'Cleanser',
    minStock: 25,
    createdAt: '2024-01-06T10:50:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  }
];

// Mock Warehouses
let mockWarehouses: Warehouse[] = [
  {
    id: '1',
    name: 'Jakarta Main Warehouse',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    isActive: true,
    capacity: 10000,
    currentStock: 1245,
    kepalaGudang: 'Budi Santoso',
    createdAt: '2024-01-01T08:00:00Z'
  },
  {
    id: '2',
    name: 'Bandung Distribution Center',
    address: 'Jl. Asia Afrika No. 456, Bandung',
    isActive: true,
    capacity: 8000,
    currentStock: 890,
    kepalaGudang: 'Siti Nurhaliza',
    createdAt: '2024-01-02T08:00:00Z'
  },
  {
    id: '3',
    name: 'Surabaya Warehouse',
    address: 'Jl. Pemuda No. 789, Surabaya',
    isActive: false,
    capacity: 5000,
    currentStock: 0,
    kepalaGudang: 'Ahmad Hidayat',
    createdAt: '2024-01-03T08:00:00Z'
  }
];

let mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerId: 'CUST-001',
    customerName: 'Beauty Store Jakarta',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Vitamin C Serum Brightening',
        sku: 'VITC-SER-001',
        quantity: 5,
        price: 350000,
        totalPrice: 1750000
      },
      {
        id: '2',
        productId: '6',
        productName: 'Sunscreen SPF 50+ PA+++',
        sku: 'SUN-SPF50-001',
        quantity: 10,
        price: 195000,
        totalPrice: 1950000
      }
    ],
    status: 'pending_payment',
    totalAmount: 3700000,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    createdAt: '2024-01-20T10:00:00Z',
    expiresAt: '2024-01-21T10:00:00Z',
    notes: 'Urgent delivery for new store opening'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerId: 'CUST-002',
    customerName: 'Skincare Clinic Bandung',
    items: [
      {
        id: '3',
        productId: '3',
        productName: 'Niacinamide 10% + Zinc Serum',
        sku: 'NIAC-SER-001',
        quantity: 15,
        price: 285000,
        totalPrice: 4275000
      }
    ],
    status: 'confirmed',
    totalAmount: 4275000,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    createdAt: '2024-01-19T14:30:00Z',
    expiresAt: '2024-01-20T14:30:00Z',
    notes: 'Clinic bulk order - monthly supply'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customerId: 'CUST-003',
    customerName: 'Online Beauty Shop',
    items: [
      {
        id: '4',
        productId: '4',
        productName: 'Gentle Foaming Cleanser',
        sku: 'FOAM-CLEAN-001',
        quantity: 20,
        price: 165000,
        totalPrice: 3300000
      },
      {
        id: '5',
        productId: '10',
        productName: 'Micellar Water Cleanser',
        sku: 'MIC-WATER-001',
        quantity: 30,
        price: 145000,
        totalPrice: 4350000
      }
    ],
    status: 'processing',
    totalAmount: 7650000,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    createdAt: '2024-01-18T09:15:00Z',
    expiresAt: '2024-01-19T09:15:00Z',
    notes: 'High volume order for e-commerce platform'
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customerId: 'CUST-004',
    customerName: 'Premium Spa Resort',
    items: [
      {
        id: '6',
        productId: '11',
        productName: 'Peptide Anti-Aging Cream',
        sku: 'PEPT-CREAM-001',
        quantity: 3,
        price: 495000,
        totalPrice: 1485000
      },
      {
        id: '7',
        productId: '5',
        productName: 'Retinol 0.5% Night Treatment',
        sku: 'RETIN-NIGHT-001',
        quantity: 8,
        price: 425000,
        totalPrice: 3400000
      }
    ],
    status: 'shipped',
    totalAmount: 4885000,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    createdAt: '2024-01-17T11:00:00Z',
    expiresAt: '2024-01-18T11:00:00Z',
    notes: 'Luxury spa treatment products'
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customerId: 'CUST-005',
    customerName: 'Dermatology Center',
    items: [
      {
        id: '8',
        productId: '12',
        productName: 'Salicylic Acid Spot Treatment',
        sku: 'SALIC-SPOT-001',
        quantity: 12,
        price: 185000,
        totalPrice: 2220000
      },
      {
        id: '9',
        productId: '7',
        productName: 'AHA BHA Exfoliating Toner',
        sku: 'AHA-BHA-TON-001',
        quantity: 10,
        price: 225000,
        totalPrice: 2250000
      }
    ],
    status: 'delivered',
    totalAmount: 4470000,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    createdAt: '2024-01-16T13:45:00Z',
    expiresAt: '2024-01-17T13:45:00Z',
    notes: 'Medical grade skincare for dermatology practice'
  }
];

// Mock Transactions
let mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'inbound',
    productId: '1',
    productName: 'Vitamin C Serum Brightening',
    sku: 'VITC-SER-001',
    quantity: 50,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    reference: 'PO-2024-001',
    notes: 'Initial stock replenishment',
    createdBy: 'admin@wms.com',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    type: 'outbound',
    productId: '6',
    productName: 'Sunscreen SPF 50+ PA+++',
    sku: 'SUN-SPF50-001',
    quantity: 25,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    reference: 'ORD-2024-001',
    notes: 'Order fulfillment',
    createdBy: 'staff@wms.com',
    createdAt: '2024-01-20T11:30:00Z'
  },
  {
    id: '3',
    type: 'checkout',
    productId: '3',
    productName: 'Niacinamide 10% + Zinc Serum',
    sku: 'NIAC-SER-001',
    quantity: 15,
    warehouseId: '2',
    warehouseName: 'Bandung Distribution Center',
    reference: 'ORD-2024-002',
    notes: 'Stock reservation for confirmed order',
    createdBy: 'staff@wms.com',
    createdAt: '2024-01-19T14:45:00Z'
  },
  {
    id: '4',
    type: 'release',
    productId: '4',
    productName: 'Gentle Foaming Cleanser',
    sku: 'FOAM-CLEAN-001',
    quantity: 5,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    reference: 'ORD-2024-003',
    notes: 'Stock released due to payment timeout',
    createdBy: 'system',
    createdAt: '2024-01-18T23:59:00Z'
  },
  {
    id: '5',
    type: 'transfer',
    productId: '2',
    productName: 'Hyaluronic Acid Moisturizer',
    sku: 'HYAL-MOIST-001',
    quantity: 20,
    warehouseId: '1',
    warehouseName: 'Jakarta Main Warehouse',
    toWarehouseId: '2',
    toWarehouseName: 'Bandung Distribution Center',
    reference: 'TRF-2024-001',
    notes: 'Inter-warehouse stock transfer',
    createdBy: 'admin@wms.com',
    createdAt: '2024-01-17T10:15:00Z'
  }
];

// Mock API implementation
export const mockApi = {
  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay();
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || (email === 'admin@wms.com' && password !== 'admin123') || 
        (email === 'staff@wms.com' && password !== 'staff123')) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    return {
      success: true,
      data: {
        user,
        token: 'mock-jwt-token-' + user.id
      }
    };
  },

  async logout(): Promise<ApiResponse<void>> {
    await delay(200);
    return { success: true };
  },

  // Products
  async getProducts(params?: {
    search?: string;
    warehouseId?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ products: Product[]; total: number; pages: number }>> {
    await delay();
    
    let filteredProducts = [...mockProducts];
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (params?.warehouseId) {
      filteredProducts = filteredProducts.filter(p => p.warehouseId === params.warehouseId);
    }
    
    if (params?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === params.category);
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    const total = filteredProducts.length;
    const pages = Math.ceil(total / limit);
    
    return {
      success: true,
      data: {
        products: paginatedProducts,
        total,
        pages
      }
    };
  },

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    await delay();
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    return { success: true, data: product };
  },

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    await delay();
    const product: Product = {
      ...productData,
      id: String(mockProducts.length + 1),
      availableStock: productData.stock - (productData.reservedStock || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockProducts.push(product);
    return { success: true, data: product };
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    await delay();
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Product not found' };
    }
    
    mockProducts[index] = {
      ...mockProducts[index],
      ...updates,
      id: mockProducts[index].id,
      updatedAt: new Date().toISOString()
    };
    
    // Recalculate available stock
    mockProducts[index].availableStock = 
      mockProducts[index].stock - (mockProducts[index].reservedStock || 0);
    
    return { success: true, data: mockProducts[index] };
  },

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    await delay();
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Product not found' };
    }
    mockProducts.splice(index, 1);
    return { success: true };
  },

  // Warehouses
  async getWarehouses(): Promise<ApiResponse<Warehouse[]>> {
    await delay();
    return { success: true, data: mockWarehouses };
  },

  async getWarehouse(id: string): Promise<ApiResponse<Warehouse>> {
    await delay();
    const warehouse = mockWarehouses.find(w => w.id === id);
    if (!warehouse) {
      return { success: false, error: 'Warehouse not found' };
    }
    return { success: true, data: warehouse };
  },

  async createWarehouse(warehouseData: Omit<Warehouse, 'id' | 'createdAt'>): Promise<ApiResponse<Warehouse>> {
    await delay();
    const warehouse: Warehouse = {
      ...warehouseData,
      id: String(mockWarehouses.length + 1),
      createdAt: new Date().toISOString()
    };
    mockWarehouses.push(warehouse);
    return { success: true, data: warehouse };
  },

  async updateWarehouse(id: string, updates: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> {
    await delay();
    const index = mockWarehouses.findIndex(w => w.id === id);
    if (index === -1) {
      return { success: false, error: 'Warehouse not found' };
    }
    
    mockWarehouses[index] = {
      ...mockWarehouses[index],
      ...updates,
      id: mockWarehouses[index].id
    };
    
    return { success: true, data: mockWarehouses[index] };
  },

  async deleteWarehouse(id: string): Promise<ApiResponse<void>> {
    await delay();
    const index = mockWarehouses.findIndex(w => w.id === id);
    if (index === -1) {
      return { success: false, error: 'Warehouse not found' };
    }
    mockWarehouses.splice(index, 1);
    return { success: true };
  },

  // Orders
  async getOrders(params?: {
    search?: string;
    status?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ orders: Order[]; total: number; pages: number }>> {
    await delay();
    
    // Auto-expire orders that have passed their expiration time
    const now = new Date();
    mockOrders.forEach(order => {
      if (order.status === 'pending_payment' && new Date(order.expiresAt) < now) {
        // Auto-expire and release reserved stock
        order.status = 'expired';
        for (const item of order.items) {
          const productIndex = mockProducts.findIndex(p => p.id === item.productId);
          if (productIndex !== -1) {
            mockProducts[productIndex].reservedStock -= item.quantity;
            mockProducts[productIndex].availableStock += item.quantity;
          }
        }
      }
    });
    
    let filteredOrders = [...mockOrders];
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredOrders = filteredOrders.filter(o => 
        o.orderNumber.toLowerCase().includes(searchLower) ||
        o.customerName.toLowerCase().includes(searchLower)
      );
    }
    
    if (params?.status) {
      filteredOrders = filteredOrders.filter(o => o.status === params.status);
    }
    
    if (params?.warehouseId) {
      filteredOrders = filteredOrders.filter(o => o.warehouseId === params.warehouseId);
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    const total = filteredOrders.length;
    const pages = Math.ceil(total / limit);
    
    return {
      success: true,
      data: {
        orders: paginatedOrders,
        total,
        pages
      }
    };
  },

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    await delay();
    const order = mockOrders.find(o => o.id === id);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    return { success: true, data: order };
  },

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'expiresAt'>): Promise<ApiResponse<Order>> {
    await delay();
    
    // Check stock availability
    for (const item of orderData.items) {
      const product = mockProducts.find(p => p.id === item.productId);
      if (!product) {
        return { success: false, error: `Product ${item.productName} not found` };
      }
      if (product.availableStock < item.quantity) {
        return { success: false, error: `Insufficient stock for ${item.productName}` };
      }
    }
    
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24); // Order expires in 24 hours
    
    const order: Order = {
      ...orderData,
      id: String(mockOrders.length + 1),
      orderNumber: `ORD-2024-${String(mockOrders.length + 1).padStart(3, '0')}`,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      expiresAt: expirationTime.toISOString()
    };
    
    // Reserve stock for order items
    for (const item of order.items) {
      const productIndex = mockProducts.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        mockProducts[productIndex].reservedStock += item.quantity;
        mockProducts[productIndex].availableStock -= item.quantity;
      }
    }
    
    mockOrders.push(order);
    return { success: true, data: order };
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<ApiResponse<Order>> {
    await delay();
    const index = mockOrders.findIndex(o => o.id === id);
    if (index === -1) {
      return { success: false, error: 'Order not found' };
    }
    
    const order = mockOrders[index];
    const oldStatus = order.status;
    
    // Check if order is expired
    const isExpired = new Date(order.expiresAt) < new Date() && order.status === 'pending_payment';
    if (isExpired && status !== 'expired') {
      return { success: false, error: 'Order has expired and cannot be updated' };
    }
    
    order.status = status;
    
    // Handle stock changes based on status
    if (oldStatus === 'pending_payment' && status === 'confirmed') {
      // Stock already reserved, no changes needed
    } else if ((oldStatus === 'pending_payment' && status === 'cancelled') || status === 'expired') {
      // Release reserved stock
      for (const item of order.items) {
        const productIndex = mockProducts.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
          mockProducts[productIndex].reservedStock -= item.quantity;
          mockProducts[productIndex].availableStock += item.quantity;
        }
      }
    } else if (status === 'processing') {
      // Order confirmed and started processing - keep stock reserved
    } else if (status === 'shipped') {
      // Move from reserved to actual stock reduction
      for (const item of order.items) {
        const productIndex = mockProducts.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
          mockProducts[productIndex].reservedStock -= item.quantity;
          mockProducts[productIndex].stock -= item.quantity;
        }
      }
    } else if (status === 'delivered') {
      // Final status - stock already reduced when shipped
    }
    
    return { success: true, data: order };
  },

  // Transactions
  async getTransactions(params?: {
    type?: string;
    warehouseId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ transactions: Transaction[]; total: number; pages: number }>> {
    await delay();
    
    let filteredTransactions = [...mockTransactions];
    
    if (params?.type && params.type !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.type === params.type);
    }
    
    if (params?.warehouseId) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.warehouseId === params.warehouseId || t.toWarehouseId === params.warehouseId
      );
    }
    
    if (params?.dateFrom) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.createdAt) >= new Date(params.dateFrom!)
      );
    }
    
    if (params?.dateTo) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.createdAt) <= new Date(params.dateTo!)
      );
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    const total = filteredTransactions.length;
    const pages = Math.ceil(total / limit);
    
    return {
      success: true,
      data: {
        transactions: paginatedTransactions,
        total,
        pages
      }
    };
  },

  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<ApiResponse<Transaction>> {
    await delay();
    
    const transaction: Transaction = {
      ...transactionData,
      id: String(mockTransactions.length + 1),
      createdAt: new Date().toISOString()
    };
    
    // Update product stock based on transaction type
    const productIndex = mockProducts.findIndex(p => p.id === transaction.productId);
    if (productIndex !== -1) {
      const product = mockProducts[productIndex];
      
      switch (transaction.type) {
        case 'inbound':
          product.stock += transaction.quantity;
          product.availableStock += transaction.quantity;
          break;
        case 'outbound':
          product.stock -= transaction.quantity;
          product.availableStock -= transaction.quantity;
          break;
        case 'checkout':
          product.reservedStock += transaction.quantity;
          product.availableStock -= transaction.quantity;
          break;
        case 'release':
          product.reservedStock -= transaction.quantity;
          product.availableStock += transaction.quantity;
          break;
      }
      
      product.updatedAt = new Date().toISOString();
    }
    
    mockTransactions.push(transaction);
    return { success: true, data: transaction };
  },

  // Dashboard Data
  async getDashboardStats(): Promise<ApiResponse<{
    totalProducts: number;
    totalWarehouses: number;
    totalOrders: number;
    totalTransactions: number;
    activeWarehouses: number;
    pendingOrders: number;
    recentTransactions: Transaction[];
    lowStockProducts: Product[];
  }>> {
    await delay();
    
    const totalProducts = mockProducts.length;
    const totalWarehouses = mockWarehouses.length;
    const activeWarehouses = mockWarehouses.filter(w => w.isActive).length;
    const totalOrders = mockOrders.length;
    const pendingOrders = mockOrders.filter(o => o.status === 'pending_payment').length;
    const totalTransactions = mockTransactions.length;
    
    // Get recent transactions (last 5)
    const recentTransactions = mockTransactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    // Get low stock products (stock <= minStock)
    const lowStockProducts = mockProducts
      .filter(p => p.stock <= p.minStock)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
    
    return {
      success: true,
      data: {
        totalProducts,
        totalWarehouses,
        totalOrders,
        totalTransactions,
        activeWarehouses,
        pendingOrders,
        recentTransactions,
        lowStockProducts
      }
    };
  }
};

// Additional API functions for Inbound and Outbound Records
Object.assign(mockApi, {
  // Inbound Records
  async getInboundRecords(params?: {
    search?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<InboundRecord[]>> {
    await delay();
    
    // Mock inbound records data
    const mockInboundRecords: InboundRecord[] = [
      {
        id: '1',
        product_id: '1',
        product_name: 'Vitamin C Serum Brightening',
        product_sku: 'VITC-SER-001',
        warehouse_id: '1',
        warehouse_name: 'Jakarta Main Warehouse',
        quantity: 100,
        supplier_name: 'BeautySupply Co.',
        supplier_contact: 'info@beautysupply.com',
        reference_number: 'PO-2024-001',
        unit_cost: 280000,
        total_cost: 28000000,
        notes: 'Initial stock replenishment',
        received_date: '2024-01-15T08:00:00Z',
        created_at: '2024-01-15T08:30:00Z',
        created_by: 'admin@wms.com',
        created_by_name: 'Admin User'
      },
      {
        id: '2',
        product_id: '4',
        product_name: 'Gentle Foaming Cleanser',
        product_sku: 'FOAM-CLEAN-001',
        warehouse_id: '1',
        warehouse_name: 'Jakarta Main Warehouse',
        quantity: 200,
        supplier_name: 'SkinCare Distributors',
        supplier_contact: '+62-21-555-0123',
        reference_number: 'PO-2024-002',
        unit_cost: 120000,
        total_cost: 24000000,
        notes: 'Bulk order for cleanser line',
        received_date: '2024-01-16T10:00:00Z',
        created_at: '2024-01-16T10:30:00Z',
        created_by: 'staff@wms.com',
        created_by_name: 'Staff User'
      }
    ];
    
    let filteredRecords = [...mockInboundRecords];
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredRecords = filteredRecords.filter(r => 
        r.product_name?.toLowerCase().includes(searchLower) ||
        r.product_sku?.toLowerCase().includes(searchLower) ||
        r.supplier_name.toLowerCase().includes(searchLower) ||
        r.reference_number?.toLowerCase().includes(searchLower)
      );
    }
    
    if (params?.warehouseId && params.warehouseId !== 'all') {
      filteredRecords = filteredRecords.filter(r => r.warehouse_id === params.warehouseId);
    }
    
    return {
      success: true,
      data: filteredRecords
    };
  },

  async createInboundRecord(recordData: Omit<InboundRecord, 'id' | 'created_at' | 'created_by_name'>): Promise<ApiResponse<InboundRecord>> {
    await delay();
    
    const product = mockProducts.find(p => p.id === recordData.product_id);
    const warehouse = mockWarehouses.find(w => w.id === recordData.warehouse_id);
    
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    
    if (!warehouse) {
      return { success: false, error: 'Warehouse not found' };
    }
    
    const record: InboundRecord = {
      ...recordData,
      id: String(Date.now()),
      product_name: product.name,
      product_sku: product.sku,
      warehouse_name: warehouse.name,
      total_cost: recordData.unit_cost ? recordData.unit_cost * recordData.quantity : undefined,
      created_at: new Date().toISOString(),
      created_by_name: 'Current User'
    };
    
    // Update product stock
    const productIndex = mockProducts.findIndex(p => p.id === recordData.product_id);
    if (productIndex !== -1) {
      mockProducts[productIndex].stock += recordData.quantity;
      mockProducts[productIndex].availableStock += recordData.quantity;
      mockProducts[productIndex].updatedAt = new Date().toISOString();
    }
    
    return { success: true, data: record };
  },

  // Outbound Records
  async getOutboundRecords(params?: {
    search?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<OutboundRecord[]>> {
    await delay();
    
    // Mock outbound records data
    const mockOutboundRecords: OutboundRecord[] = [
      {
        id: '1',
        product_id: '1',
        product_name: 'Vitamin C Serum Brightening',
        product_sku: 'VITC-SER-001',
        warehouse_id: '1',
        warehouse_name: 'Jakarta Main Warehouse',
        quantity: 25,
        destination_type: 'customer',
        destination_name: 'Beauty Store Jakarta',
        destination_contact: '+62-812-345-6789',
        reference_number: 'SO-2024-001',
        unit_price: 350000,
        total_price: 8750000,
        notes: 'Bulk order for retail store',
        shipped_date: '2024-01-20T10:00:00Z',
        created_at: '2024-01-20T10:15:00Z',
        created_by: 'staff@wms.com',
        created_by_name: 'Staff User'
      },
      {
        id: '2',
        product_id: '6',
        product_name: 'Sunscreen SPF 50+ PA+++',
        product_sku: 'SUN-SPF50-001',
        warehouse_id: '1',
        warehouse_name: 'Jakarta Main Warehouse',
        quantity: 50,
        destination_type: 'customer',
        destination_name: 'Skincare Clinic Menteng',
        destination_contact: 'clinic@menteng.com',
        reference_number: 'SO-2024-002',
        unit_price: 195000,
        total_price: 9750000,
        notes: 'Medical clinic order',
        shipped_date: '2024-01-20T14:30:00Z',
        created_at: '2024-01-20T14:45:00Z',
        created_by: 'staff@wms.com',
        created_by_name: 'Staff User'
      }
    ];
    
    let filteredRecords = [...mockOutboundRecords];
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredRecords = filteredRecords.filter(r => 
        r.product_name?.toLowerCase().includes(searchLower) ||
        r.product_sku?.toLowerCase().includes(searchLower) ||
        r.destination_name.toLowerCase().includes(searchLower) ||
        r.reference_number?.toLowerCase().includes(searchLower)
      );
    }
    
    if (params?.warehouseId && params.warehouseId !== 'all') {
      filteredRecords = filteredRecords.filter(r => r.warehouse_id === params.warehouseId);
    }
    
    return {
      success: true,
      data: filteredRecords
    };
  },

  async createOutboundRecord(recordData: Omit<OutboundRecord, 'id' | 'created_at' | 'created_by_name'>): Promise<ApiResponse<OutboundRecord>> {
    await delay();
    
    const product = mockProducts.find(p => p.id === recordData.product_id);
    const warehouse = mockWarehouses.find(w => w.id === recordData.warehouse_id);
    
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    
    if (!warehouse) {
      return { success: false, error: 'Warehouse not found' };
    }
    
    // Check available stock
    if (product.availableStock < recordData.quantity) {
      return { success: false, error: `Insufficient stock. Available: ${product.availableStock}` };
    }
    
    const record: OutboundRecord = {
      ...recordData,
      id: String(Date.now()),
      product_name: product.name,
      product_sku: product.sku,
      warehouse_name: warehouse.name,
      total_price: recordData.unit_price ? recordData.unit_price * recordData.quantity : undefined,
      created_at: new Date().toISOString(),
      created_by_name: 'Current User'
    };
    
    // Update product stock
    const productIndex = mockProducts.findIndex(p => p.id === recordData.product_id);
    if (productIndex !== -1) {
      mockProducts[productIndex].stock -= recordData.quantity;
      mockProducts[productIndex].availableStock -= recordData.quantity;
      mockProducts[productIndex].updatedAt = new Date().toISOString();
    }
    
    return { success: true, data: record };
  }
});

export type { User, Product, Warehouse, Transaction, Order };