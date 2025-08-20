export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  image?: string;
  barcode?: string;
  description?: string;
  minStock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
}

export interface Transaction {
  id: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment: PaymentMethod[];
  cashier: User;
  customer?: Customer;
  status: 'completed' | 'refunded' | 'partial-refund';
  receiptNumber: string;
}

export interface PaymentMethod {
  type: 'cash' | 'card' | 'digital_wallet' | 'qris';
  amount: number;
  reference?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  points?: number;
}

export interface CashSession {
  id: string;
  cashier: User;
  startTime: Date;
  endTime?: Date;
  initialCash: number;
  finalCash?: number;
  totalSales: number;
  status: 'open' | 'closed';
}