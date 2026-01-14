import clsx from 'clsx'
import './Button.css'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}) => {
    return (
        <button
            className={clsx(
                'button',
                `button--${variant}`,
                `button--${size}`,
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}
