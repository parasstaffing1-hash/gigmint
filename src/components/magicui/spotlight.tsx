"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SpotlightProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  fill?: string;
}

/**
 * Aceternity-style spotlight: a large soft elliptical glow rendered as SVG,
 * positioned by the parent. Cheap to render and animates with CSS/Framer.
 */
export function Spotlight({
  className,
  fill = "#3b82f6",
  ...props
}: SpotlightProps) {
  return (
    <svg
      viewBox="0 0 3787 2842"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none absolute select-none", className)}
      {...props}
    >
      <ellipse
        cx="1924.71"
        cy="273.501"
        rx="1924.71"
        ry="273.501"
        transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
        fill={fill}
        fillOpacity="0.21"
      />
      <ellipse
        cx="1924.71"
        cy="273.501"
        rx="1924.71"
        ry="273.501"
        transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
        fill={`url(#spotlight-gradient-${fill.replace("#", "")})`}
      />
      <defs>
        <radialGradient
          id={`spotlight-gradient-${fill.replace("#", "")}`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1706.64 2243.7) rotate(-55.3247) scale(1969.84 1738.83)"
        >
          <stop stopColor="white" stopOpacity="0.35" />
          <stop offset="0.8" stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
