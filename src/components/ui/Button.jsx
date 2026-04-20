import { motion } from "framer-motion";

export const Button = ({ children, onClick, className = "", variant = "primary" }) => {
  const baseStyles = "px-6 py-2.5 rounded-xl font-medium transition-all duration-300 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-primary hover:bg-blue-500 text-white glow hover:glow-purple",
    secondary: "bg-secondary hover:bg-purple-500 text-white glow-purple",
    outline: "border border-white/10 hover:bg-white/5 text-gray-300",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};
