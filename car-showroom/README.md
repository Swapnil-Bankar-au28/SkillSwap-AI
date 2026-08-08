# Mercedes-Benz & Mercedes-AMG 3D Franchise Showroom

An official-grade, highly interactive single-page 3D franchise showroom website for **Mercedes-Benz & Mercedes-AMG** high-performance vehicles.

Built with React, Three.js, React Three Fiber, Drei, GSAP ScrollTrigger, and Tailwind CSS.

---

## 🌟 Key Features & Franchise Capabilities

- **3D Mercedes-AMG Hypercar Stage**: Custom 3D Mercedes model featuring:
  - **Mercedes Panamericana AMG Front Grille** with 12 vertical chrome bars.
  - **Centered 3D Mercedes 3-Pointed Star Emblem** on front grille, wheel hub caps, and rear trunk.
  - **AMG Quad Exhaust Tips** and **AMG Petronas Cyan (`#00d2be`) underglow lighting**.
- **Multi-Model Fleet Catalog**:
  1. **Mercedes-AMG ONE** (Formula 1 1.6L V6 Turbo Hybrid, 1,063 HP, 0-60 in 2.9s)
  2. **Mercedes-AMG GT Black Series** (4.0L V8 Biturbo Flat-Plane Crank, 720 HP, 0-60 in 3.1s)
  3. **Mercedes-AMG EQS 53 4MATIC+** (Dual Electric Motors, 751 HP, 0-60 in 3.4s)
  4. **Mercedes-AMG SL 63 Roadster** (4.0L V8 Biturbo Convertible, 577 HP, 0-60 in 3.5s)
- **Active 3D Stage Vehicle Switcher**: Selecting any vehicle card in the Fleet Catalog immediately updates the active 3D stage model, telemetry specs, color configurator options, and test drive reservation form.
- **Single Canvas Stage Architecture**: Exactly **one** Three.js `<Canvas>` mounted once at `position: fixed; inset: 0`, full-viewport behind the page. All HTML content scrolls smoothly on top.
- **Scroll-Driven Camera Choreography**: Mapped across total scroll progress (0.0 to 1.0) using GSAP `ScrollTrigger`. Smooth vector lerping (`THREE.MathUtils.damp`) interpolates camera position, pitch, and lookAt across 6 keyframe shots.
- **Interactive Bespoke Paint Configurator**: Real-time material color modification on body meshes with official Mercedes metallic and MANUFAKTUR matte swatches (Petronas Silver, Green Hell Magno, Obsidian Black, Magma Beam Orange, Spectral Blue, MANUFAKTUR Patagonia Red).
- **VIP Track Test Drive Reservation**: Model-bound booking form generating official Mercedes Concierge confirmation receipts.

---

## 🎨 Design System & Palette

- **Background Stage**: Obsidian Carbon Slate (`#090a0f`) with studio floor contact shadows and fog.
- **Brand Accent**: Official Mercedes AMG Petronas Cyan (`#00d2be`) & High-Gloss Chrome.
- **Surface Cards**: Glassmorphism Panels (`rgba(16, 18, 26, 0.65)` with `backdrop-filter: blur(16px)` and subtle white/emerald borders).
- **Typography**:
  - **Headings**: `Space Grotesk` (Geometric & technical display face)
  - **Body**: `Plus Jakarta Sans` (Clean humanist sans-serif)
  - **Telemetry Specs**: `JetBrains Mono` (Utility monospace face)

---

## 🚀 How to Run Locally

```bash
# Navigate to the project directory
cd car-showroom

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🚘 Swapping to a Real `.glb` Model

By default, the showroom uses a custom high-detail procedural Mercedes-AMG hypercar built from Three.js primitives inside `src/components/scene/CarModel.tsx`.

### How to Swap with a Real `.glb` Model:

1. Place your license-clear 3D car model `.glb` file at `public/models/car.glb`.
2. Open `src/components/scene/CarModel.tsx`.
3. Uncomment the `CarModelGLTF` component snippet marked with `// SWAP: replace with a real GLTF at /models/car.glb via useGLTF`:

```tsx
import { useGLTF } from '@react-three/drei';

export function CarModelGLTF({ paintColor }: { paintColor: string }) {
  const { scene } = useGLTF('/models/car.glb');
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.name.includes('Body')) {
        ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(paintColor);
      }
    });
  }, [scene, paintColor]);
  return <primitive object={scene} />;
}
```

4. Render `<CarModelGLTF paintColor={paintColor} />` inside `CarModel`.
