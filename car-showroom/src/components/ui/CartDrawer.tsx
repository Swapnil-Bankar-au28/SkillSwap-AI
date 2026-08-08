import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Plus, Minus } from 'lucide-react';
import type { MercedesCarModel } from '../../data/content';

export interface CartItem {
  id: string;
  car: MercedesCarModel;
  paintColorHex: string;
  paintColorName: string;
  selectedWheelName?: string;
  selectedInteriorName?: string;
  selectedPackageNames?: string[];
  unitPrice: number;
  totalPrice: number;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onUpdateQuantity,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0);
  const destinationFee = cartItems.length > 0 ? 2950 : 0;
  const estimatedTax = Math.round(subtotal * 0.08);
  const grandTotal = subtotal + destinationFee + estimatedTax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-950 border-l border-neutral-800 text-white flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>My Allocation Cart</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-mono">
                    {cartItems.length}
                  </span>
                </h3>
                <p className="text-[11px] font-mono text-neutral-400">Mercedes-AMG Franchise Reserve</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 divide-y divide-neutral-800/60">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto" />
                <h4 className="text-base font-bold text-neutral-300">Your Allocation Cart is Empty</h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Browse our paginated fleet catalog or 3D configurator to reserve your next AMG hypercar.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{item.car.badge}</span>
                      <h4 className="text-sm font-bold text-white">{item.car.name}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-emerald-400">
                        ${(item.totalPrice * item.quantity).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">${item.totalPrice.toLocaleString()} ea</div>
                    </div>
                  </div>

                  {/* Config Details */}
                  <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-300 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: item.paintColorHex }} />
                      <span>Paint: {item.paintColorName}</span>
                    </div>
                    {item.selectedWheelName && <div>Wheels: {item.selectedWheelName}</div>}
                    {item.selectedInteriorName && <div>Interior: {item.selectedInteriorName}</div>}
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center bg-neutral-900 rounded-lg border border-neutral-800">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1.5 text-neutral-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-mono font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1.5 text-neutral-400 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-mono"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-neutral-900 border-t border-neutral-800 space-y-4">
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Vehicles Subtotal</span>
                  <span className="text-white">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Enclosed Transport Fee</span>
                  <span className="text-emerald-400">+${destinationFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Estimated Luxury Tax (8%)</span>
                  <span className="text-emerald-400">+${estimatedTax.toLocaleString()}</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-sm font-bold">
                  <span className="text-white">Total Amount</span>
                  <span className="text-emerald-400 font-display text-base">${grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
              >
                <span>Proceed to Credit Card Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
