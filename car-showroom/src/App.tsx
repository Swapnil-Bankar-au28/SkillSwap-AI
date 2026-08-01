import { useState } from 'react';
import { MERCEDES_FLEET } from './data/content';
import type { MercedesCarModel } from './data/content';
import { useScrollProgress } from './hooks/useScrollProgress';
import { Experience } from './components/scene/Experience';
import { Loader } from './components/scene/Loader';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/Hero';
import { FleetCatalogSection } from './components/sections/FleetCatalog';
import { DesignSection } from './components/sections/Design';
import { PerformanceSection } from './components/sections/Performance';
import { InteriorSection } from './components/sections/Interior';
import { ConfiguratorSection } from './components/sections/Configurator';
import { FeaturesSection } from './components/sections/Features';
import { TestDriveSection } from './components/sections/TestDrive';
import { ComparisonMatrixSection } from './components/sections/ComparisonMatrix';
import { EngineSoundStudioSection } from './components/sections/EngineSoundStudio';
import { FinancialCalculatorSection } from './components/sections/FinancialCalculator';
import { ExecutiveDashboardSection } from './components/sections/ExecutiveDashboard';
import { ScrollProgressBar } from './components/ui/ScrollProgressBar';
import { AIChatbot } from './components/ui/AIChatbot';
import { CartDrawer } from './components/ui/CartDrawer';
import type { CartItem } from './components/ui/CartDrawer';
import { CheckoutModal } from './components/ui/CheckoutModal';

export function App() {
  const [activeCarId, setActiveCarId] = useState<string>('amg-one');
  const [activeTab, setActiveTab] = useState<string>('showroom');
  
  const selectedCar = MERCEDES_FLEET.find((car) => car.id === activeCarId) || MERCEDES_FLEET[0];
  const [paintColor, setPaintColor] = useState<string>(selectedCar.colors[0]?.hex || '#d1d5db');

  // Shopping Cart & Checkout Modal State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const { scrollProgressRef } = useScrollProgress();

  const handleSelectCar = (carId: string) => {
    setActiveCarId(carId);
    const newCar = MERCEDES_FLEET.find((car) => car.id === carId);
    if (newCar && newCar.colors[0]) {
      setPaintColor(newCar.colors[0].hex);
    }
  };

  const handleAddToCart = (carToAdd: MercedesCarModel) => {
    const newItem: CartItem = {
      id: `${carToAdd.id}-${Date.now()}`,
      car: carToAdd,
      paintColorHex: carToAdd.colors[0]?.hex || '#101216',
      paintColorName: carToAdd.colors[0]?.name || 'Obsidian Black',
      unitPrice: carToAdd.basePriceRaw,
      totalPrice: carToAdd.basePriceRaw,
      quantity: 1,
    };

    setCartItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="relative min-h-screen bg-carbon-950 text-white selection:bg-emerald-400 selection:text-black font-body overflow-x-hidden">
      {/* Persistent Three.js 3D Canvas Stage */}
      <Experience
        paintColor={paintColor}
        scrollProgressRef={scrollProgressRef}
        selectedCar={selectedCar}
      />

      <Loader />
      <ScrollProgressBar scrollProgressRef={scrollProgressRef} />
      <Navbar
        selectedCar={selectedCar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartItemsCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main View Area based on Active Tab */}
      <main className="relative z-10 pt-20">
        {activeTab === 'showroom' && (
          <div className="space-y-16 sm:space-y-24">
            <HeroSection selectedCar={selectedCar} />
            <FleetCatalogSection
              activeCarId={activeCarId}
              onSelectCar={handleSelectCar}
              onAddToCart={handleAddToCart}
            />
            <DesignSection selectedCar={selectedCar} />
            <PerformanceSection selectedCar={selectedCar} />
            <InteriorSection selectedCar={selectedCar} />
            <ConfiguratorSection
              selectedCar={selectedCar}
              paintColor={paintColor}
              setPaintColor={setPaintColor}
            />
            <FeaturesSection />
            <TestDriveSection selectedCar={selectedCar} />
          </div>
        )}

        {activeTab === 'configurator' && (
          <div className="min-h-screen">
            <ConfiguratorSection
              selectedCar={selectedCar}
              paintColor={paintColor}
              setPaintColor={setPaintColor}
            />
            <FleetCatalogSection
              activeCarId={activeCarId}
              onSelectCar={handleSelectCar}
              onAddToCart={handleAddToCart}
            />
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="min-h-screen">
            <ComparisonMatrixSection onSelectCar={handleSelectCar} />
          </div>
        )}

        {activeTab === 'sound' && (
          <div className="min-h-screen">
            <EngineSoundStudioSection />
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="min-h-screen">
            <FinancialCalculatorSection />
          </div>
        )}

        {activeTab === 'crm' && (
          <div className="min-h-screen">
            <ExecutiveDashboardSection />
          </div>
        )}
      </main>

      <Footer />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Credit Card Payment Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onClearCart={handleClearCart}
      />

      {/* AI Studio Automotive Assistant Floating Widget */}
      <AIChatbot
        selectedCar={selectedCar}
        onSelectCar={handleSelectCar}
        onNavigateTab={setActiveTab}
      />
    </div>
  );
}

export default App;
