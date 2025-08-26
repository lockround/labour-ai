import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 border',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground shadow hover:opacity-90',
				outline: 'bg-transparent hover:bg-accent',
				ghost: 'hover:bg-accent',
			},
			size: {
				default: 'h-9 px-4 py-2',
				sm: 'h-8 rounded-md px-3',
				lg: 'h-10 rounded-md px-8',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
	return (
		<button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
	)
})
Button.displayName = 'Button'

export { Button, buttonVariants }