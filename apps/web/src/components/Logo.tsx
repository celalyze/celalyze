interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Celalyze Logo"
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`rounded-full object-cover border border-dark flex-shrink-0 ${className}`}
    />
  )
}
