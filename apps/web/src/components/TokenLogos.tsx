export function TokenLogo({ symbol, className = 'w-6 h-6' }: { symbol: string; className?: string }) {
  const sym = symbol.toUpperCase()

  if (sym === 'CELO') {
    return <img src="/celo-logo.png" alt="CELO" className={`${className} object-cover rounded-full`} />
  }
  if (sym === 'USDT') {
    return <img src="/usdt-logo.png" alt="USDT" className={`${className} object-cover rounded-full`} />
  }
  if (sym === 'USDM' || sym === 'CUSD') {
    return <img src="/usdm-logo.png" alt="USDm" className={`${className} object-cover rounded-full`} />
  }
  if (sym.startsWith('USDC')) {
    return <img src="/usdc-logo.png" alt="USDC" className={`${className} object-cover rounded-full`} />
  }

  return (
    <span className={`${className} rounded-full bg-primary border border-dark flex items-center justify-center text-2xs font-bold text-dark flex-shrink-0`}>
      {symbol.slice(0, 3)}
    </span>
  )
}
