import { Bot } from 'lucide-react'

interface SkeletonProps {
  className?: string
  circle?: boolean
}

export function Skeleton({ className = 'h-4 w-full', circle = false }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-dark/10 ${circle ? 'rounded-full' : 'rounded-none'} ${className}`}
    />
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-card border-2 border-dark rounded-none p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-6 w-6 circle" circle />
      </div>
      <Skeleton className="h-8 w-36 font-mono rounded-none" />
      <Skeleton className="h-3 w-24 rounded-full" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-pulse border-b border-dark/10">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <Skeleton className={`h-4 rounded-none ${i === 0 ? 'w-28' : i === cols - 1 ? 'w-16 ml-auto' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  )
}

export function TokenListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-dark/10 animate-pulse">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-7 h-7" circle />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </div>
          <div className="space-y-1 text-right">
            <Skeleton className="h-3.5 w-20 ml-auto" />
            <Skeleton className="h-2.5 w-14 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 justify-start items-start animate-pulse">
      <div className="w-8 h-8 rounded-full bg-primary/50 border border-dark flex items-center justify-center text-dark flex-shrink-0 mt-0.5 shadow-2xs">
        <Bot className="w-4 h-4 text-dark/50" />
      </div>
      <div className="bg-secondary border border-dark p-4 rounded-none space-y-2.5 w-64 sm:w-80 shadow-2xs">
        <div className="flex items-center justify-between border-b border-dark/15 pb-1">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-2.5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-full rounded-none" />
        <Skeleton className="h-3.5 w-4/5 rounded-none" />
        <Skeleton className="h-3.5 w-2/3 rounded-none" />
      </div>
    </div>
  )
}
