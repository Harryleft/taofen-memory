import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'md', 
  asChild = false,
  className,
  onClick,
  disabled = false
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
  }
  
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 py-2 text-lg'
  }

  const buttonClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  )

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      className: clsx(buttonClasses, children.props.className)
    })
  }

  return (
    <button 
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}