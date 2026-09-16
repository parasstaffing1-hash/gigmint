"use client";

import * as React from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  delay?: number;
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  suffix = "",
  prefix = "",
  className,
  delay = 0,
  decimalPlaces = 0,
}: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 40, stiffness: 120 });

  React.useEffect(() => {
    if (inView) {
      const t = setTimeout(() => motionValue.set(value), delay * 1000);
      return () => clearTimeout(t);
    }
  }, [motionValue, inView, delay, value]);

  React.useEffect(() => {
    return springValue.on("change", (latest: number) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(latest)}${suffix}`;
      }
    });
  }, [springValue, prefix, suffix, decimalPlaces]);

  return (
    <span
      ref={ref}
      className={cn("inline-block tabular-nums", className)}
    >
      {prefix}0{suffix}
    </span>
  );
}
