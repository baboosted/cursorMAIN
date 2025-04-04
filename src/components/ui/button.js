import React from "react";
import { Slot } from "@radix-ui/react-slot";

const Button = React.forwardRef(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    
    // Get the appropriate styles based on variant
    let variantStyles = "";
    if (variant === "ghost") {
      variantStyles = "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800";
    }
    
    return (
      <Comp
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantStyles} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button }; 