import { useEffect, useState } from "react";
import { useSpring } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  precision?: number;
  className?: string;
}

/**
 * High-performance spring-based animated number ticker.
 * Rapidly ticks through values when physics parameters change.
 */
export function AnimatedNumber({
  value,
  precision = 1,
  className,
}: AnimatedNumberProps) {
  const spring = useSpring(value, {
    mass: 0.5,
    stiffness: 90,
    damping: 18,
  });

  const [displayValue, setDisplayValue] = useState(value.toFixed(precision));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(latest.toFixed(precision));
    });
    return () => unsubscribe();
  }, [spring, precision]);

  return <span className={className}>{displayValue}</span>;
}
