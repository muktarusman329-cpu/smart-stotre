'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search, Scan, Plus, Minus, Trash2, CreditCard, DollarSign,
  Smartphone, Printer, ShoppingCart, Phone, User as UserIcon, Mail,
  X, CheckCircle, AlertCircle, Receipt
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  const router = useRouter();
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
        const salePayload = { ...data.data, cart, total, paymentMethod, cashReceived, change, customerName, customerPhone, customerType };
        setCompletedSale(salePayload);
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
    <div className="min-h-screen bg-background transition-colors duration-300">
      <DashboardHeader title="Point of Sale" userRole="cashier" />

      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[9999] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={cn(
              'flex items-center space-x-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-bold pointer-events-auto max-w-xs',
              toast.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
            )}
          >
            {toast.type === 'success'
              ? <CheckCircle className="h-5 w-5 flex-shrink-0" />
              : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>

      {/* Barcode Scanner Modal */}
      {scannerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md space-y-4"
          >
            <div className="flex justify-between items-center px-2">
              <h3 className="text-white font-black text-lg uppercase tracking-tight">Scan Product Barcode</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setScannerOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
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
          </motion.div>
        </motion.div>
      )}

      {/* Receipt Modal */}
      {showReceipt && completedSale && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-2xl border border-border p-10 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Sale Complete</h3>
              <p className="text-sm text-muted-foreground mt-1">Transaction recorded successfully</p>
            </div>

            <div className="space-y-3 mb-6">
              {completedSale.cart?.map((item: CartItem) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-foreground font-semibold">{item.name} × {item.quantity}</span>
                  <span className="font-bold text-foreground">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 mb-8">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="text-foreground uppercase">{completedSale.paymentMethod}</span>
              </div>
              {completedSale.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-muted-foreground">Cash Received</span>
                    <span className="text-foreground">{formatCurrency(parseFloat(completedSale.cashReceived || 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-muted-foreground">Change</span>
                    <span className="text-emerald-600">{formatCurrency(completedSale.change || 0)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{formatCurrency(completedSale.total)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="secondary"
                onClick={() => window.print()}
                className="flex-1 gap-2"
              >
                <Printer className="h-5 w-5" />
                <span>Print</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setShowReceipt(false); setCompletedSale(null); }}
                className="flex-1"
              >
                New Sale
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowReceipt(false);
                  setCompletedSale(null);
                  if (completedSale?._id) {
                    router.push(`/dashboard/receipts/${completedSale._id}`);
                  }
                }}
                className="flex-1"
              >
                Open Receipt
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left – Product Search ───────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search + Scan bar */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products by name, SKU, or barcode..."
                      className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-ring/10 focus:bg-background transition-all text-foreground font-semibold outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setScannerOpen(true)}
                    className="gap-2"
                  >
                    <Scan className="h-5 w-5" />
                    <span className="font-bold">Scan</span>
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {searchResults.map((product) => (
                      <motion.div
                        key={product._id}
                        onClick={() => addToCart(product)}
                        className="group p-4 bg-card border border-border rounded-2xl hover:border-primary hover:shadow-xl hover:shadow-primary/5 cursor-pointer transition-all duration-300"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
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
                        <h4 className="font-bold text-foreground text-sm line-clamp-2 leading-snug">{product.name}</h4>
                        <p className="text-xs font-medium text-muted-foreground mt-1">{product.sku}</p>
                        <p className="text-sm font-bold text-primary mt-2">
                          {formatCurrency(product.sellingPrice)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Category shortcuts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Beverages', 'Snacks', 'Dairy', 'Groceries', 'Personal Care', 'Household', 'Electronics', 'Others'].map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setSearchQuery(cat)}
                  className="p-5 bg-card border border-border rounded-2xl hover:border-primary hover:shadow-lg transition-all text-center group"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                    {cat}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── Right – Cart ────────────────────────────────────────────── */}
          <Card className="h-fit sticky top-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Shopping Cart</h3>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearCart}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Clear cart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Customer info */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="09031585429 or +2349031585429"
                      className={cn(
                        "w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/10 transition-all text-foreground font-semibold outline-none placeholder:text-muted-foreground text-sm bg-background",
                        phoneError ? "border-destructive focus:ring-destructive/10" : ""
                      )}
                    />
                  </div>
                  {phoneError && (
                    <p className="mt-2 text-xs font-bold text-destructive flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {phoneError}
                    </p>
                  )}
                  {customer && (
                    <div className="mt-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Returning Customer</p>
                      <p className="text-sm font-bold text-foreground mt-1">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.loyaltyPoints} pts · {formatCurrency(customer.totalSpent)} spent · {customer.customerType || 'walk-in'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Customer Type</label>
                  <div className="relative">
                    <select
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value as any)}
                      className="w-full pl-4 pr-10 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-ring/10 focus:bg-background transition-all text-foreground font-semibold outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="walk-in">Walk-in Customer</option>
                      <option value="registered">Registered Customer</option>
                      <option value="vip">VIP Customer</option>
                      <option value="corporate">Corporate Customer</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Customer Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Walk-in customer"
                      className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-ring/10 focus:bg-background transition-all text-foreground font-semibold outline-none placeholder:text-muted-foreground text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Email (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@email.com"
                      className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-ring/10 focus:bg-background transition-all text-foreground font-semibold outline-none placeholder:text-muted-foreground text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Cart items */}
              <div className="space-y-3 mb-6 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-semibold text-sm">Cart is empty</p>
                    <p className="text-muted-foreground/50 text-xs mt-1">Search products or scan a barcode</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.productId}
                      className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-transparent hover:border-border transition-all group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="font-bold text-foreground text-sm leading-tight truncate">{item.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-tighter">{item.sku}</p>
                        <p className="text-sm font-bold text-primary mt-1">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex items-center bg-background rounded-xl border border-border p-1">
                          <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-accent rounded-lg transition-colors">
                            <Minus className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <span className="w-7 text-center font-bold text-foreground text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-accent rounded-lg transition-colors">
                            <Plus className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 bg-secondary/30 p-5 rounded-2xl mb-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">{formatCurrency(tax)}</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between">
                  <span className="text-base font-bold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Payment Method</label>
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
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-secondary/50'
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
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5"
                >
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Cash Received</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-4 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-ring/10 focus:bg-background transition-all text-foreground text-xl font-bold outline-none"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₦</span>
                  </div>
                  {parseFloat(cashReceived) >= total && total > 0 && (
                    <div className="mt-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Change to return</p>
                      <p className="text-lg font-bold text-emerald-700">{formatCurrency(change)}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Checkout button */}
              <Button
                variant="primary"
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className="w-full py-5 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center space-x-3 group"
              >
                {loading ? (
                  <div className="h-6 w-6 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Printer className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span>COMPLETE SALE</span>
                    {cart.length > 0 && (
                      <span className="bg-primary-foreground/20 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-lg">
                        {cart.length} items
                      </span>
                    )}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
