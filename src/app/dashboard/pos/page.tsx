'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DashboardHeader } from '@/components/dashboard-header';
import {
  Search, Scan, Plus, Minus, Trash2, CreditCard, DollarSign,
  Smartphone, Printer, ShoppingCart, Phone, User, Mail,
  X, CheckCircle, AlertCircle, Receipt
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Dynamically import BarcodeScanner to avoid SSR issues
const BarcodeScanner = dynamic(() => import('@/components/barcode-scanner'), { ssr: false });

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const CART_KEY = 'smartmart-cart';

export default function POSPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerType, setCustomerType] = useState<'walk-in' | 'registered' | 'vip' | 'corporate'>('walk-in');
  const [customer, setCustomer] = useState<any>(null);
  const [phoneError, setPhoneError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'paystack'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = 0;
  const discount = 0;
  const total = subtotal - discount + tax;
  const change = parseFloat(cashReceived || '0') - total;

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Phone validation ────────────────────────────────────────────────────────
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid Nigerian phone number (10 or 11 digits)
    // or international format (with country code)
    if (cleanPhone.length === 10) {
      // Nigerian format without leading 0
      return /^([7-9][0-9]{9})$/.test(cleanPhone);
    } else if (cleanPhone.length === 11) {
      // Nigerian format with leading 0
      return /^0([7-9][0-9]{9})$/.test(cleanPhone);
    } else if (cleanPhone.length >= 12 && cleanPhone.length <= 15) {
      // International format
      return /^\+?[1-9][0-9]{10,14}$/.test(cleanPhone);
    }
    
    return false;
  };

  const handlePhoneChange = (value: string) => {
    setCustomerPhone(value);
    
    if (value && !validatePhoneNumber(value)) {
      setPhoneError('Invalid phone number format');
    } else if (value && validatePhoneNumber(value)) {
      setPhoneError('');
    } else {
      setPhoneError('');
    }
  };

  // ── localStorage sync ──────────────────────────────────────────────────────
  // Load cart from localStorage on mount (picks up items added via barcode page)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {
      console.error('Error reading cart from localStorage:', e);
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

  // ── Customer lookup ────────────────────────────────────────────────────────
  const lookupCustomer = async (phone: string) => {
    if (phone.length < 10) return;
    try {
      const res = await fetch(`/api/customers/lookup?phone=${phone}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCustomer(data.data);
        setCustomerName(data.data.name || '');
        setCustomerEmail(data.data.email || '');
        setCustomerType(data.data.customerType || 'walk-in');
      } else {
        setCustomer(null);
        setCustomerType('walk-in');
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    const timer = setTimeout(() => { if (customerPhone) lookupCustomer(customerPhone); }, 500);
    return () => clearTimeout(timer);
  }, [customerPhone]);

  // ── Product search ─────────────────────────────────────────────────────────
  const searchProducts = async (query: string) => {
    try {
      console.log('Searching for:', query);
      const res = await fetch(`/api/pos/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      console.log('Search response:', data);
      if (data.success) {
        setSearchResults(data.data);
        console.log('Found', data.data.length, 'products');
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchProducts(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // ── Cart operations ────────────────────────────────────────────────────────
  const addToCart = useCallback((product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          sku: product.sku,
          price: product.sellingPrice,
          quantity: 1,
          total: product.sellingPrice,
        },
      ];
    });
    showToast('success', `"${product.name}" added to cart`);
    setSearchQuery('');
    setSearchResults([]);
  }, [showToast]);

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty, total: newQty * item.price };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
  };

  // ── Barcode scanner handler ────────────────────────────────────────────────
  const handleBarcodeScan = async (barcode: string) => {
    setScannerOpen(false);
    try {
      const res = await fetch(`/api/pos/barcode/${barcode}`);
      const data = await res.json();
      if (data.success && data.data) {
        addToCart(data.data);
      } else {
        showToast('error', `No product found for barcode: ${barcode}`);
      }
    } catch {
      showToast('error', 'Failed to look up scanned barcode.');
    }
  };

  // ── Checkout ───────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (cart.length === 0) { showToast('error', 'Cart is empty. Add products first.'); return; }
    if (paymentMethod === 'cash' && parseFloat(cashReceived || '0') < total) {
      showToast('error', 'Cash received is less than the total amount.'); return;
    }
    
    // Phone validation
    if (customerPhone && !validatePhoneNumber(customerPhone)) {
      showToast('error', 'Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/pos/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone,
          customerName,
          customerEmail,
          customerType,
          customerId: customer?._id,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          paymentMethod,
          cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : total,
          notes: '',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCompletedSale({ ...data.data, cart, total, paymentMethod, cashReceived, change, customerName, customerPhone, customerType });
        setShowReceipt(true);
        clearCart();
        setCustomerPhone(''); setCustomerName(''); setCustomerEmail(''); setCustomerType('walk-in');
        setCustomer(null); setCashReceived(''); setPhoneError('');
        showToast('success', 'Sale completed successfully!');
      } else {
        showToast('error', data.error || 'Failed to complete the sale.');
      }
    } catch {
      showToast('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <DashboardHeader title="Point of Sale" userRole="cashier" />

      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[9999] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-center space-x-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-bold animate-in slide-in-from-right-4 duration-300 pointer-events-auto max-w-xs',
              toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-700'
                : 'bg-rose-50 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-700'
            )}
          >
            {toast.type === 'success'
              ? <CheckCircle className="h-5 w-5 flex-shrink-0" />
              : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Barcode Scanner Modal */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-md space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-white font-black text-lg uppercase tracking-tight">Scan Product Barcode</h3>
              <button
                onClick={() => setScannerOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <BarcodeScanner
              onScanSuccess={handleBarcodeScan}
              onScanFailure={(err) => showToast('error', 'Camera blocked: ' + err)}
              onClose={() => setScannerOpen(false)}
              className="aspect-video w-full"
            />
            <p className="text-center text-white/50 text-xs font-semibold uppercase tracking-widest">
              Point camera at product barcode
            </p>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && completedSale && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-10 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sale Complete</h3>
              <p className="text-sm text-slate-400 mt-1">Transaction recorded successfully</p>
            </div>

            <div className="space-y-3 mb-6">
              {completedSale.cart?.map((item: CartItem) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.name} × {item.quantity}</span>
                  <span className="font-black text-slate-900 dark:text-white">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 mb-8">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500">Payment Method</span>
                <span className="text-slate-700 dark:text-slate-300 uppercase">{completedSale.paymentMethod}</span>
              </div>
              {completedSale.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-500">Cash Received</span>
                    <span className="text-slate-700 dark:text-slate-300">{formatCurrency(parseFloat(completedSale.cashReceived || 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-500">Change</span>
                    <span className="text-emerald-600">{formatCurrency(completedSale.change || 0)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg font-black pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-900 dark:text-white">Total</span>
                <span className="text-blue-600 dark:text-blue-400">{formatCurrency(completedSale.total)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center space-x-2 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                <Printer className="h-5 w-5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => { setShowReceipt(false); setCompletedSale(null); }}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-sm uppercase tracking-widest transition-colors"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left – Product Search ───────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search + Scan bar */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name, SKU, or barcode..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white font-semibold outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={() => setScannerOpen(true)}
                  className="flex items-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                >
                  <Scan className="h-5 w-5" />
                  <span className="font-bold">Scan</span>
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => addToCart(product)}
                      className="group p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer transition-all duration-300"
                    >
                      {product.images?.[0] && (
                        <div className="overflow-hidden rounded-xl mb-3 h-24">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">{product.name}</h4>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{product.sku}</p>
                      <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-2">
                        {formatCurrency(product.sellingPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Category shortcuts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Beverages', 'Snacks', 'Dairy', 'Groceries', 'Personal Care', 'Household', 'Electronics', 'Others'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchQuery(cat)}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all text-center group"
                >
                  <p className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
                    {cat}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Right – Cart ────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Shopping Cart</h3>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Clear cart"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Customer info */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="09031585429 or +2349031585429"
                    className={cn(
                      "w-full pl-12 pr-4 py-3 border-none rounded-xl focus:ring-2 transition-all text-slate-900 dark:text-white font-semibold outline-none placeholder:text-slate-400 text-sm",
                      phoneError ? "bg-red-50 dark:bg-red-900/20 focus:ring-red-600/10" : "bg-slate-50 dark:bg-slate-800 focus:ring-blue-600/10 focus:bg-white dark:focus:bg-slate-800"
                    )}
                  />
                </div>
                {phoneError && (
                  <p className="mt-2 text-xs font-bold text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {phoneError}
                  </p>
                )}
                {customer && (
                  <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Returning Customer</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{customer.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{customer.loyaltyPoints} pts · {formatCurrency(customer.totalSpent)} spent · {customer.customerType || 'walk-in'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Customer Type</label>
                <div className="relative">
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value as any)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white font-semibold outline-none text-sm appearance-none cursor-pointer"
                  >
                    <option value="walk-in">Walk-in Customer</option>
                    <option value="registered">Registered Customer</option>
                    <option value="vip">VIP Customer</option>
                    <option value="corporate">Corporate Customer</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in customer"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white font-semibold outline-none placeholder:text-slate-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Email (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white font-semibold outline-none placeholder:text-slate-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Cart items */}
            <div className="space-y-3 mb-6 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                  <ShoppingCart className="h-10 w-10 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                  <p className="text-slate-400 dark:text-slate-600 font-semibold text-sm">Cart is empty</p>
                  <p className="text-slate-300 dark:text-slate-700 text-xs mt-1">Search products or scan a barcode</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight truncate">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-tighter">{item.sku}</p>
                      <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <Minus className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                        </button>
                        <span className="w-7 text-center font-bold text-slate-900 dark:text-white text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <Plus className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.productId)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-rose-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl mb-6">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500 dark:text-slate-400">Tax</span>
                <span className="text-slate-900 dark:text-white">{formatCurrency(tax)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <span className="text-base font-black text-slate-900 dark:text-white">Total</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="mb-5">
              <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cash', icon: DollarSign, label: 'Cash' },
                  { id: 'card', icon: CreditCard, label: 'Card' },
                  { id: 'transfer', icon: Smartphone, label: 'Transfer' },
                  { id: 'paystack', icon: Smartphone, label: 'Paystack' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={cn(
                      'flex items-center space-x-2 p-3 rounded-xl border-2 transition-all active:scale-95 text-sm',
                      paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400'
                        : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <method.icon className="h-4 w-4" />
                    <span className="font-bold">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cash received input */}
            {paymentMethod === 'cash' && (
              <div className="mb-5 animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Cash Received</label>
                <div className="relative">
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white text-xl font-black outline-none"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                </div>
                {parseFloat(cashReceived) >= total && total > 0 && (
                  <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Change to return</p>
                    <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(change)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white py-5 rounded-[1.5rem] font-black text-base shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center space-x-3 group"
            >
              {loading ? (
                <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Printer className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  <span>COMPLETE SALE</span>
                  {cart.length > 0 && (
                    <span className="bg-white/20 text-white text-xs font-black px-2 py-0.5 rounded-lg">
                      {cart.length} items
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
