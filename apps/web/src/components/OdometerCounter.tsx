import { motion } from 'framer-motion'

interface OdometerProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

function DigitWheel({ digit }: { digit: number }) {
  return (
    <div className="inline-block h-[1em] overflow-hidden leading-none relative select-none">
      <motion.div
        initial={false}
        animate={{ y: `-${digit * 10}%` }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[1em] flex items-center justify-center">
            {n}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function OdometerCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  className = '',
}: OdometerProps) {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  // Split into character tokens
  const chars = formatted.split('')

  return (
    <span className={`inline-flex items-baseline font-mono ${className}`}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {chars.map((char, idx) => {
        const isDigit = !isNaN(parseInt(char, 10))

        if (isDigit) {
          const digit = parseInt(char, 10)
          return <DigitWheel key={`digit-${idx}`} digit={digit} />
        }

        return (
          <span key={`char-${idx}`} className="inline-block">
            {char}
          </span>
        )
      })}
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </span>
  )
}
