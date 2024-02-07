import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function Container({
  children,
  ...props
}: {
  children: ReactNode;
  [key: string]: any;
}) {
  return (
    <div className="bg-slate-100 max-w-3xl w-full rounded-lg p-4 lg:p-12 my-2">
      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.25 }}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  );
}
