import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollProgress() {
  const scrollProgressRef = useRef<number>(0);
  const [activeSection, setActiveSection] = useState<number>(0);

  useEffect(() => {
    // Single ScrollTrigger watching full document scroll height
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        scrollProgressRef.current = progress;

        // Calculate discrete active section index (0 to 6)
        const sectionIdx = Math.min(Math.floor(progress * 7), 6);
        setActiveSection((prev) => (prev !== sectionIdx ? sectionIdx : prev));
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return { scrollProgressRef, activeSection };
}
