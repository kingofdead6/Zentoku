import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Logo from "../../assets/Logo.jpg";
export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-200 flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated background gradients */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-600/20 to-green-600/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-gradient-to-l from-pink-600/20 to-rose-600/20 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
            {/* Logo container with animation */}
            <motion.div
              className="relative"
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{
                duration: 1,
                ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
              }}
            >
              {/* Glow effect behind logo */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-green-500/30 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Replace this div with your actual logo image */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                {/* Placeholder - replace with: <img src="/path/to/logo.png" alt="Logo" className="w-full h-full object-contain" /> */}
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700/50 shadow-2xl flex items-center justify-center">
                  <img src={Logo} alt="Logo" className="w-16 h-16 object-contain" />
                </div>
              </div>
            </motion.div>

            {/* App name with staggered animation */}
            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Zentoku
                </span>
              </h1>
              <p className="text-zinc-400 text-sm md:text-base font-medium tracking-wide">
                Discover • Watch • Enjoy
              </p>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              className="flex space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}