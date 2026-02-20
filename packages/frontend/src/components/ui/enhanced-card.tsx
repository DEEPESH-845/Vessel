"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "glass-md" | "glass-strong" | "default";
  animated?: boolean;
  children: React.ReactNode;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", animated = false, children, ...props }, ref) => {
    const variantClasses = {
      glass: "glass",
      "glass-md": "glass-md",
      "glass-strong": "glass-strong",
      default: "",
    };

    if (animated) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ type: "spring" as const, stiffness: 100, damping: 20 }}
          className="gpu-accelerated"
        >
          <Card
            className={cn(variantClasses[variant], className)}
            {...props}
          >
            {children}
          </Card>
        </motion.div>
      );
    }

    return (
      <Card
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

export { EnhancedCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
