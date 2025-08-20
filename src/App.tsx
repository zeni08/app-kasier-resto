import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, BarChart3, Users, Settings, LogOut } from 'lucide-react';
import CashierApp from './components/CashierApp';
import AdminDashboard from './components/AdminDashboard';
import LoginForm from './components/LoginForm';
import { User, Product, Transaction } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'cashier' | 'admin'>('cashier');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Initialize sample data
  useEffect(() => {
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Kopi Espresso',
        sku: 'ESP001',
        price: 25000,
        cost: 15000,
        stock: 50,
        category: 'Minuman',
        image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300',
        barcode: '1234567890123'
      },
      {
        id: '2',
        name: 'Nasi Goreng Special',
        sku: 'NSG001',
        price: 35000,
        cost: 20000,
        stock: 30,
        category: 'Makanan',
        image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
        barcode: '1234567890124'
      },
      {
        id: '3',
        name: 'Cappuccino',
        sku: 'CAP001',
        price: 30000,
        cost: 18000,
        stock: 40,
        category: 'Minuman',
        image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=300',
        barcode: '1234567890125'
      },
      {
        id: '4',
        name: 'Sandwich Tuna',
        sku: 'SAN001',
        price: 28000,
        cost: 16000,
        stock: 25,
        category: 'Makanan',
        image: 'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=300',
        barcode: '1234567890126'
      }
    ];
    setProducts(sampleProducts);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView(user.role === 'admin' || user.role === 'manager' ? 'admin' : 'cashier');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    // Update stock
    transaction.items.forEach(item => {
      setProducts(prev => prev.map(product => 
        product.id === item.product.id 
          ? { ...product, stock: product.stock - item.quantity }
          : product
      ));
    });
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Zamirzz</h1>
              </div>
              
              {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                <nav className="flex space-x-1">
                  <button
                    onClick={() => setCurrentView('cashier')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'cashier'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 inline mr-2" />
                    Kasir
                  </button>
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Dashboard
                  </button>
                </nav>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{currentUser.name}</span>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs capitalize">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'cashier' ? (
          <CashierApp
            products={products}
            onAddTransaction={handleAddTransaction}
            currentUser={currentUser}
          />
        ) : (
          <AdminDashboard
            products={products}
            transactions={transactions}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            currentUser={currentUser}
          />
        )}
      </main>
    </div>
  );
}

export default App;