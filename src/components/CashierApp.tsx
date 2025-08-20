import React, { useState } from 'react';
import { Search, Plus, Minus, X, CreditCard, Smartphone, Banknote, Receipt } from 'lucide-react';
import { Product, CartItem, Transaction, User, PaymentMethod } from '../types';

interface CashierAppProps {
  products: Product[];
  onAddTransaction: (transaction: Transaction) => void;
  currentUser: User;
}

const CashierApp: React.FC<CashierAppProps> = ({ products, onAddTransaction, currentUser }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const categories = ['Semua', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const itemTotal = item.product.price * item.quantity;
      const discountAmount = item.discount 
        ? item.discountType === 'percentage' 
          ? itemTotal * (item.discount / 100)
          : item.discount
        : 0;
      return sum + (itemTotal - discountAmount);
    }, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.1; // 10% PPN
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  const handlePayment = () => {
    setShowPayment(true);
  };

  const processTransaction = (payments: PaymentMethod[]) => {
    const transaction: Transaction = {
      id: `TXN-${Date.now()}`,
      date: new Date(),
      items: cart,
      subtotal,
      tax,
      discount: 0,
      total,
      payment: payments,
      cashier: currentUser,
      status: 'completed',
      receiptNumber: `R${Date.now().toString().slice(-6)}`
    };

    onAddTransaction(transaction);
    setCart([]);
    setShowPayment(false);
    setPaymentMethods([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Product Selection */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari produk atau SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-280px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">{product.sku}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-lg font-bold text-emerald-600">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <span className="text-sm text-gray-500">
                    Stok: {product.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shopping Cart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Keranjang Belanja</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <p>Keranjang kosong</p>
              <p className="text-sm">Pilih produk untuk memulai transaksi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
                    <p className="text-sm text-emerald-600">
                      Rp {item.product.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>PPN (10%):</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-emerald-600">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <button
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all"
            >
              Proses Pembayaran
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={total}
          onComplete={processTransaction}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

// Payment Modal Component
interface PaymentModalProps {
  total: number;
  onComplete: (payments: PaymentMethod[]) => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ total, onComplete, onCancel }) => {
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'digital_wallet'>('cash');
  const [amount, setAmount] = useState(total);
  const [cashReceived, setCashReceived] = useState(total);

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = total - totalPaid;
  const change = selectedMethod === 'cash' ? Math.max(0, cashReceived - remaining) : 0;

  const addPayment = () => {
    if (amount <= 0 || amount > remaining) return;

    const payment: PaymentMethod = {
      type: selectedMethod,
      amount: selectedMethod === 'cash' ? remaining : amount,
      reference: selectedMethod !== 'cash' ? `REF-${Date.now()}` : undefined
    };

    setPayments(prev => [...prev, payment]);
    setAmount(Math.max(0, remaining - payment.amount));
  };

  const completeTransaction = () => {
    if (remaining <= 0) {
      onComplete(payments);
    }
  };

  const paymentMethods = [
    { id: 'cash', label: 'Tunai', icon: Banknote },
    { id: 'card', label: 'Kartu', icon: CreditCard },
    { id: 'digital_wallet', label: 'E-Wallet', icon: Smartphone }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Pembayaran</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            Rp {total.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Method Selection */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Metode Pembayaran</h3>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map(method => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as any)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <IconComponent className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-sm">{method.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedMethod === 'cash' ? 'Uang Diterima' : 'Jumlah Bayar'}
            </label>
            <input
              type="number"
              value={selectedMethod === 'cash' ? cashReceived : amount}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                if (selectedMethod === 'cash') {
                  setCashReceived(value);
                } else {
                  setAmount(value);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            {selectedMethod === 'cash' && (
              <p className="text-sm text-gray-600 mt-1">
                Kembalian: Rp {change.toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* Add Payment Button */}
          {remaining > 0 && (
            <button
              onClick={addPayment}
              disabled={
                (selectedMethod === 'cash' && cashReceived < remaining) ||
                (selectedMethod !== 'cash' && (amount <= 0 || amount > remaining))
              }
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tambah Pembayaran
            </button>
          )}

          {/* Payment Summary */}
          {payments.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Pembayaran:</h4>
              <div className="space-y-1 text-sm">
                {payments.map((payment, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="capitalize">{payment.type.replace('_', ' ')}:</span>
                    <span>Rp {payment.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))}
                <div className="border-t pt-1 mt-2 font-medium">
                  <div className="flex justify-between">
                    <span>Sisa:</span>
                    <span>Rp {remaining.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Complete Transaction */}
          {remaining <= 0 && (
            <button
              onClick={completeTransaction}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all"
            >
              Selesaikan Transaksi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierApp;