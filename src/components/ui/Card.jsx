import { motion } from "framer-motion";

export const Card = ({ children, className = "", noHover = false }) => {
  return (
    <motion.div
      whileHover={!noHover ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.3 }}
      className={`glass rounded-2xl p-6 transition-shadow ${!noHover ? 'hover:glow' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};
