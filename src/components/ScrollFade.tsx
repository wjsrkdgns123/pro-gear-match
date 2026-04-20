import { ReactNode } from 'react';
import { motion } from 'motion/react';

export function ScrollFade({ children, delay = 0, className, direction = 'up' }: {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'left' | 'right';
}) {
  const variants = {
    up: { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: -28 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 28 }, visible: { opacity: 1, x: 0 } },
  };
  const v = variants[direction];
  return (
    <motion.div
      initial={v.hidden}
      whileInView={v.visible}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
