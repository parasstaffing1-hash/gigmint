"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Reverse the scroll direction.
   */
  reverse?: boolean;
  /**
   * Pause the marquee on hover.
   */
  pauseOnHover?: boolean;
  children: React.ReactNode;
}

export function Marquee({
  reverse,
  pauseOnHover,
  children,
  className,
  ...props
}: MarqueeProps) {
  // Duplicate content so the loop is seamless.
  const items = React.Children.toArray(children);

  return (
    <div
      className={cn(
        "relative flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className
      )}
      {...props}
    >
      <motion.div
        className={cn(
          "flex w-max shrink-0 items-stretch gap-6 pr-6",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{
          duration: 40,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            {items.map((child, i) => (
              <div key={`${copy}-${i}`} className="w-[340px] shrink-0 sm:w-[380px]">
                {child}
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
