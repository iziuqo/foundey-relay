import { forwardRef, type ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[14px] gap-1.5',
  md: 'h-10 px-4 text-[14px] gap-2',
  lg: 'h-12 px-5 text-[15px] gap-2',
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-n-900 text-n-0 hover:bg-n-800 disabled:bg-n-200 disabled:text-n-400',
  secondary: 'bg-n-0 text-n-900 border border-n-200 hover:bg-n-25 disabled:text-n-400',
  ghost: 'bg-transparent text-n-600 hover:bg-n-75 disabled:text-n-300',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'secondary', size = 'md', icon: Icon, iconPosition = 'left', className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md font-medium leading-none transition-colors duration-hover ease-std active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'lg' ? 18 : 16} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'lg' ? 18 : 16} />}
    </button>
  )
})
