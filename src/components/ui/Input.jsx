import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2 } from 'lucide-react';

const Input = forwardRef(({ className, type, isValid, ...props }, ref) => {
    return (
        <div className="relative w-full">
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary transition-all duration-150 font-mono",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary",
                    "focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-glow-primary",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    isValid && "pr-10 border-primary/50",
                    className
                )}
                ref={ref}
                {...props}
            />
            {isValid && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                </div>
            )}
        </div>
    );
});

Input.displayName = "Input";

export { Input };
