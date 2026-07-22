import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Receipt,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Coins,
  Activity,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { getWalletOverview, DEFAULT_MENTO_ADDRESS } from '../services/celoService'
import { OdometerCounter } from '../components/OdometerCounter'
import { TokenLogo } from '../components/TokenLogos'
import { Skeleton, TokenListSkeleton } from '../components/Skeleton'

export function DashboardPage() {
  const { address: connectedAddress } = useAccount()
  const activeAddress = connectedAddress || DEFAULT_MENTO_ADDRESS

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['wallet-overview', activeAddress],
    queryFn: () => getWalletOverview(activeAddress),
    enabled: Boolean(activeAddress),
    staleTime: 10000,
    refetchInterval: 12000, // Real-time polling every 12 seconds (average Celo block time ~5s)
  })

  const [txPage, setTxPage] = useState(1)
  const itemsPerPage = 5
  const totalTxs = data?.recentTransactions?.length || 0
  const totalPages = Math.ceil(totalTxs / itemsPerPage) || 1
  const paginatedTxs = data?.recentTransactions ? data.recentTransactions.slice((txPage - 1) * itemsPerPage, txPage * itemsPerPage) : []

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 font-sans pb-24 sm:pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary text-dark text-xs font-semibold rounded-full border border-dark whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Celo Mainnet</span>
            </span>
          </div>
          <h1 className="hero-title text-3xl sm:text-4xl text-dark">
            Portfolio & Tax Dashboard
          </h1>
          <p className="text-xs text-dark/70 font-mono mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="whitespace-nowrap">Querying Address:</span>
            <span className="font-bold text-dark break-all">{activeAddress}</span>
            <a
              href={`https://celo.blockscout.com/address/${activeAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-dark hover:underline inline-flex items-center gap-0.5 flex-shrink-0"
              title="View on Celo Blockscout Explorer"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Sync Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="px-4 py-2 rounded-full bg-primary text-dark text-xs font-semibold border border-dark hover:bg-primary/90 transition-colors flex items-center gap-1.5 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching || isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Portfolio Value */}
        <div className="bg-card border-2 border-dark rounded-none p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-dark/70">
            <span className="text-xs font-semibold tracking-wider whitespace-nowrap">TOTAL BALANCE</span>
            <DollarSign className="w-4 h-4 text-dark flex-shrink-0" />
          </div>
          <div className="text-3xl font-bold text-dark font-mono flex items-baseline gap-1">
            <span>$</span>
            <OdometerCounter value={data?.portfolioValueUsd ?? 0} />
          </div>
          <div className="text-2xs text-dark/60 whitespace-nowrap">
            CELO @ ${data?.celoPriceUsd.toFixed(4) ?? '0.0000'} USD
          </div>
        </div>

        {/* Card 2: Realized Capital Gains */}
        <div className="bg-card border-2 border-dark rounded-none p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-dark/70">
            <span className="text-xs font-semibold tracking-wider whitespace-nowrap">REALIZED PNL</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          </div>
          <div className="text-3xl font-bold text-emerald-700 font-mono flex items-baseline gap-1">
            <span>+$</span>
            <OdometerCounter value={data?.realizedPnLUsd ?? 0} />
          </div>
          <div className="text-2xs text-dark/60">
            Based on onchain swaps & realized gains
          </div>
        </div>

        {/* Card 3: Portfolio Yield / Unrealized */}
        <div className="bg-card border-2 border-dark rounded-none p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-dark/70">
            <span className="text-xs font-semibold tracking-wider whitespace-nowrap">UNREALIZED PNL</span>
            <PieChart className="w-4 h-4 text-dark flex-shrink-0" />
          </div>
          <div className="text-3xl font-bold text-dark font-mono flex items-baseline gap-1">
            <span>+$</span>
            <OdometerCounter value={data?.unrealizedPnLUsd ?? 0} />
          </div>
          <div className="text-2xs text-dark/60">
            Estimated holding gains
          </div>
        </div>

        {/* Card 4: Taxable Income */}
        <div className="bg-card border-2 border-dark rounded-none p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-dark/70">
            <span className="text-xs font-semibold tracking-wider whitespace-nowrap">TAXABLE INCOME</span>
            <Receipt className="w-4 h-4 text-dark flex-shrink-0" />
          </div>
          <div className="text-3xl font-bold text-dark font-mono flex items-baseline gap-1">
            <span>$</span>
            <OdometerCounter value={data?.taxableIncomeUsd ?? 0} />
          </div>
          <div className="text-2xs text-dark/60">
            Incoming rewards, airdrops & transfers
          </div>
        </div>
      </div>

      {/* Error / Loading Indicator */}
      {isError && (
        <div className="p-4 bg-red-100 border border-dark rounded-none text-xs text-red-800">
          Failed to fetch Celo wallet metrics: {(error as Error)?.message || 'RPC Error'}
        </div>
      )}

      {/* Split Section: Real Token Balances & Onchain Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Real Token Balances Table */}
        <div className="lg:col-span-2 bg-card border-2 border-dark rounded-none p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-dark/15 pb-4 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Coins className="w-5 h-5 text-dark flex-shrink-0" />
              <h2 className="hero-title text-lg sm:text-xl text-dark whitespace-nowrap">Real Token Balances</h2>
            </div>
            <span className="px-3 py-1 bg-secondary text-dark text-xs font-medium rounded-full border border-dark whitespace-nowrap flex-shrink-0">
              {data?.tokens.length || 0} Assets Found
            </span>
          </div>

          {!activeAddress ? (
            <div className="py-12 text-center text-xs text-dark/60 font-mono">
              Please connect your wallet or enter a Celo address above.
            </div>
          ) : isLoading ? (
            <TokenListSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-dark/20 text-dark/60 tracking-wider text-2xs font-semibold">
                    <th className="py-3 px-2 whitespace-nowrap">Asset</th>
                    <th className="py-3 px-2 whitespace-nowrap">Balance</th>
                    <th className="py-3 px-2 whitespace-nowrap">Unit Price</th>
                    <th className="py-3 px-2 text-right whitespace-nowrap">Value (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark/10 font-mono">
                  {data?.tokens.map((t) => (
                    <tr key={t.symbol} className="hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-2 font-sans font-medium text-dark">
                        <div className="flex items-center gap-2">
                          <TokenLogo symbol={t.symbol} className="w-7 h-7 rounded-full border border-dark/30 shadow-2xs flex-shrink-0" />
                          <div>
                            <div className="font-bold text-xs text-dark">{t.symbol}</div>
                            <div className="text-2xs text-dark/60 font-sans">{t.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-dark font-semibold whitespace-nowrap">{t.balance}</td>
                      <td className="py-3 px-2 text-dark/70 whitespace-nowrap">${t.priceUsd.toFixed(4)}</td>
                      <td className="py-3 px-2 text-right font-bold text-dark whitespace-nowrap">
                        ${t.valueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Onchain Transactions Feed */}
        <div className="bg-card border-2 border-dark rounded-none p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-dark/15 pb-4 gap-3">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <Activity className="w-5 h-5 text-dark flex-shrink-0" />
              <h2 className="hero-title text-base sm:text-lg text-dark whitespace-nowrap">Recent Onchain History</h2>
            </div>
            <span className="px-2.5 py-1 bg-secondary border border-dark/20 text-2xs font-mono text-dark/70 rounded-full whitespace-nowrap flex-shrink-0">
              {data?.recentTransactions?.length || 0} Total Txs
            </span>
          </div>

          {!activeAddress ? (
            <div className="py-12 text-center text-xs text-dark/60 font-mono">
              Connect wallet to view history.
            </div>
          ) : isLoading ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 bg-secondary/60 border border-dark/20 rounded-none space-y-2 animate-pulse">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.recentTransactions || data.recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-dark/60 font-mono">
              No recent transactions found on Celo Mainnet for this address.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-3 min-h-[360px]">
                {paginatedTxs.map((tx) => (
                  <div
                    key={tx.hash}
                    className="p-3 bg-secondary border border-dark rounded-none space-y-1 hover:border-dark transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs gap-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold border border-dark whitespace-nowrap flex-shrink-0 ${tx.type === 'Income'
                          ? 'bg-emerald-300 text-emerald-950'
                          : tx.type === 'Swap'
                            ? 'bg-primary text-dark'
                            : 'bg-card text-dark'
                          }`}
                      >
                        {tx.type === 'Income' ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        <span>{tx.type}</span>
                      </span>
                      <a
                        href={`https://celo.blockscout.com/tx/${tx.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-2xs text-dark/70 hover:text-dark hover:underline flex items-center gap-0.5 whitespace-nowrap flex-shrink-0"
                      >
                        <span>{tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-mono font-bold text-dark whitespace-nowrap">{tx.valueEth} CELO</span>
                      <span className="text-2xs text-dark/60 font-mono whitespace-nowrap">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-dark/15 text-xs font-mono">
                  <span className="text-dark/70 text-2xs">
                    Page {txPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTxPage((p) => Math.max(p - 1, 1))}
                      disabled={txPage === 1}
                      className="p-1.5 rounded-full border border-dark bg-card text-dark hover:bg-primary transition-colors disabled:opacity-30 disabled:hover:bg-card cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxPage((p) => Math.min(p + 1, totalPages))}
                      disabled={txPage === totalPages}
                      className="p-1.5 rounded-full border border-dark bg-card text-dark hover:bg-primary transition-colors disabled:opacity-30 disabled:hover:bg-card cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
