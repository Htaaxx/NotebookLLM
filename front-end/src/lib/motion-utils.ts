"use client"

import type { Variants } from "framer-motion"

// Fade in animation
export const fadeIn = (direction: "up" | "down" | "left" | "right" = "up", delay = 0): Variants => {
  return {
    hidden: {
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
      opacity: 0,
    },
    show: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 0.8,
        delay,
      },
    },
  }
}

// Stagger children animation
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0): Variants => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  }
}

// Zoom in animation
export const zoomIn = (delay = 0, duration = 0.8): Variants => {
  return {
    hidden: {
      scale: 0.8,
      opacity: 0,
    },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "tween",
        delay,
        duration,
        ease: "easeOut",
      },
    },
  }
}

// Slide in animation
export const slideIn = (
  direction: "up" | "down" | "left" | "right",
  type = "spring",
  delay = 0,
  duration = 0.8,
): Variants => {
  return {
    hidden: {
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
      y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0,
    },
    show: {
      x: 0,
      y: 0,
      transition: {
        type,
        delay,
        duration,
        ease: "easeOut",
      },
    },
  }
}

