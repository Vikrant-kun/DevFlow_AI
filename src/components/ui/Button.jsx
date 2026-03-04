import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Button = forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50";

    const variants = {
        primary: "bg-primary text-background hover:shadow-btn-primary-hover hover:-translate-y-[2px]",
        ghost: "bg-transparent text-text-primary border border-border hover:shadow-btn-ghost-hover hover:border-text-secondary hover:-translate-y-[2px]",
        dark: "bg-surface-2 text-text-primary border border-border hover:border-primary/50 hover:shadow-glow-primary hover:-translate-y-[2px]",
    };

    const sizes = {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button };
