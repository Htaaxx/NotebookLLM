import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#E48D44] text-[#F2F5DA] hover:bg-[#d47d34]",
        destructive: "bg-[#E48D44] text-[#F2F5DA] hover:bg-[#d47d34]",
        outline: "border border-[#86AB5D] bg-[#F2F5DA] text-[#518650] hover:bg-[#E7E7C9]",
        secondary: "bg-[#86AB5D] text-[#F2F5DA] hover:bg-[#518650]",
        ghost: "hover:bg-[#E7E7C9] hover:text-[#518650]",
        link: "text-[#E48D44] underline-offset-4 hover:underline",
        navProfile: "bg-white text-[#86AB5D] rounded-full hover:bg-gray-100 font-quicksand font-bold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10",
        navProfile: "h-8 py-1 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
