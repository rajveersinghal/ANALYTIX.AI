export const Loader = ({ className = "" }) => {
  return (
    <div className={`animate-pulse h-24 rounded-xl glass bg-white/5 bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] animate-[shimmer_2s_infinite] ${className}`}></div>
  );
};

// Add shimmer animation to Tailwind if needed, but pulsing the background is a good start.
