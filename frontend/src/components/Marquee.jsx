import React from "react";
import { motion } from "framer-motion";

const Marquee = ({
  className = "",
  reverse = false,
  pauseOnHover = false,
  children,
  repeat = 2,
  duration = 40,
  vertical = false,
  gradient = true,
  gradientWidth = "5rem",
  ...props
}) => {
  const gradientStyle = {
    background: `linear-gradient(${
      vertical ? "to bottom" : "to right"
    }, transparent)`,
    width: vertical ? "100%" : gradientWidth,
    height: vertical ? gradientWidth : "100%",
  };

  return (
    <div
      {...props}
      className={`group relative flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] ${
        vertical ? "flex-col h-full" : "flex-row w-full"
      } ${className}`}
    >
      {/* Leading gradient */}
      {gradient && (
        <div
          className="absolute left-0 top-0 z-10 pointer-events-none"
          style={gradientStyle}
        />
      )}

      {/* Trailing gradient */}
      {gradient && (
        <div
          className="absolute right-0 top-0 z-10 pointer-events-none rotate-180"
          style={gradientStyle}
        />
      )}

      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            className={`flex shrink-0 justify-around [gap:var(--gap)] ${
              vertical ? "flex-col" : "flex-row"
            } ${
              pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""
            }`}
            animate={{
              x: vertical ? 0 : reverse ? [0, -100 + "%"] : [-100 + "%", 0],
              y: vertical ? (reverse ? [0, -100 + "%"] : [-100 + "%", 0]) : 0,
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: duration,
                ease: "linear",
              },
              y: {
                repeat: Infinity,
                repeatType: "loop",
                duration: duration,
                ease: "linear",
              },
            }}
          >
            {children}
          </motion.div>
        ))}
    </div>
  );
};

export default Marquee;
