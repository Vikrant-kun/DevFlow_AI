import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Card = forwardRef(({ className, children, hoverEffect = false, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "rounded-xl border border-border bg-surface-1 text-text-primary shadow-sm transition-all duration-150 relative overflow-hidden",
                hoverEffect && "hover:border-t-2 hover:border-t-primary hover:shadow-glow-primary hover:-translate-y-1",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = "Card";

export { Card };
