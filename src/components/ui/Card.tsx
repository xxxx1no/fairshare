import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', glass = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={`rounded-[24px] bg-white p-6 soft-shadow ${
          glass ? 'glass-panel' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
