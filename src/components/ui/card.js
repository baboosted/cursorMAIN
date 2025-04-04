import React from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, children, ...props }) {
  return (
    <div 
      className={cn(
        "rounded-lg shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 