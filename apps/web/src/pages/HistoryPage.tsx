import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  History,
  Tag,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ExternalLink,
  Download,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { getWalletOverview, type TransactionItem, DEFAULT_MENTO_ADDRESS } from '../services/celoService'
import { TableRowSkeleton } from '../components/Skeleton'

export function HistoryPage() {
  const { address: connectedAddress } = useWallet()
  const activeAddress = connectedAddress || DEFAULT_MENTO_ADDRESS

  // Search & Filter state
  const [filterType, setFilterType] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  // Manual Tax Label Corrections state
  const [manualLabels, setManualLabels] = useState<Record<string, TransactionItem['type']>>({})
  const [editingTxHash, setEditingTxHash] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  // Real-time live query fetching real onchain data
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['wallet-history', activeAddress],
    queryFn: () => getWalletOverview(activeAddress),
    enabled: Boolean(activeAddress),
    staleTime: 10000,
    refetchInterval: 15000,
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(text)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const handleLabelCorrection = (txHash: string, newLabel: TransactionItem['type']) => {
    setManualLabels((prev) => ({
      ...prev,
      [txHash]: newLabel,
    }))
    setEditingTxHash(null)
  }

  // Process and filter transaction list with manual corrections applied
  const rawTxs = data?.recentTransactions || []
  const processedTxs = rawTxs.map((tx) => ({
    ...tx,
    type: manualLabels[tx.hash] || tx.type,
    isManual: Boolean(manualLabels[tx.hash]),
  }))

  const filteredTxs = processedTxs.filter((tx) => {
    const matchesType = filterType === 'All' || tx.type === filterType
    const matchesStatus = filterStatus === 'All' || tx.status === filterStatus
    const matchesSearch =
      !searchTerm ||
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesType && matchesStatus && matchesSearch
  })

  // Pagination calculation
  const totalItems = filteredTxs.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const paginatedTxs = filteredTxs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // CSV Export handler
  const exportToCSV = () => {
    if (filteredTxs.length === 0) return
    const headers = ['TxHash', 'BlockNumber', 'Timestamp', 'Type', 'ValueCELO', 'ValueUSD', 'From', 'To', 'Status', 'Confidence']
    const rows = filteredTxs.map((tx) => [
      tx.hash,
      tx.blockNumber,
      new Date(tx.timestamp).toISOString(),
      tx.type,
      tx.valueEth,
      tx.valueUsd.toFixed(2),
      tx.from,
      tx.to,
      tx.status,
      `${tx.confidence}%`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `celalyze_tax_history_${activeAddress.slice(0, 8)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate breakdown stats
  const typeCounts = processedTxs.reduce(
    (acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const avgConfidence =
    isLoading
      ? '0'
      : processedTxs.length > 0
      ? (processedTxs.reduce((sum, t) => sum + t.confidence, 0) / processedTxs.length).toFixed(1)
      : '0'

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 font-sans pb-24 sm:pb-8">
      {/* Header Banner & Real Address Inspector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary text-dark text-xs font-semibold rounded-full border border-dark whitespace-nowrap">
              <Tag className="w-3.5 h-3.5" />
              <span>AI Tax Classification Engine</span>
            </span>
          </div>
          <h1 className="hero-title text-3xl sm:text-4xl text-dark">
            Transaction History & Labels
          </h1>
          <p className="text-xs text-dark/70 font-mono mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="whitespace-nowrap">Indexing Celo Address:</span>
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border-2 border-dark rounded-none p-4 space-y-1">
          <p className="text-2xs font-semibold tracking-wider text-dark/70 uppercase">Total Indexed Txs</p>
          <p className="hero-title text-2xl text-dark">{processedTxs.length}</p>
          <p className="text-2xs text-dark/60">Live block height scanned</p>
        </div>
        <div className="bg-card border-2 border-dark rounded-none p-4 space-y-1">
          <p className="text-2xs font-semibold tracking-wider text-dark/70 uppercase">Taxable Income Txs</p>
          <p className="hero-title text-2xl text-emerald-700">{typeCounts['Income'] || 0}</p>
          <p className="text-2xs text-dark/60">Inbound transfers & mints</p>
        </div>
        <div className="bg-card border-2 border-dark rounded-none p-4 space-y-1">
          <p className="text-2xs font-semibold tracking-wider text-dark/70 uppercase">DEX Swaps</p>
          <p className="hero-title text-2xl text-indigo-700">{typeCounts['Swap'] || 0}</p>
          <p className="text-2xs text-dark/60">Multi-token exchanges</p>
        </div>
        <div className="bg-card border-2 border-dark rounded-none p-4 space-y-1">
          <p className="text-2xs font-semibold tracking-wider text-dark/70 uppercase">AI Classification Confidence</p>
          <div className="flex items-center gap-1.5">
            <span className="hero-title text-2xl text-dark">{avgConfidence}%</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xs text-dark/60">Deterministic rule validation</p>
        </div>
      </div>

      {/* Filter, Search & Export Toolbar */}
      <div className="bg-card border-2 border-dark rounded-none p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', 'Income', 'Swap', 'Yield', 'Transfer', 'Gas Fee'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setFilterType(cat)
                setCurrentPage(1)
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                filterType === cat
                  ? 'bg-primary text-dark border-dark shadow-xs'
                  : 'bg-secondary text-dark/70 border-dark/30 hover:border-dark hover:text-dark'
              }`}
            >
              {cat}
              {cat !== 'All' && typeCounts[cat] !== undefined && (
                <span className="ml-1 px-1.5 py-0.2 text-2xs bg-dark/10 rounded-full">
                  {typeCounts[cat]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right Action Controls: Text Search, Status Filter & CSV Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dark/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search tx hash or address..."
              className="pl-8 pr-3 py-1.5 bg-secondary border border-dark rounded-full text-xs text-dark focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-56"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-1.5 bg-secondary border border-dark rounded-full text-xs text-dark font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 bg-secondary border border-dark rounded-full text-dark hover:bg-primary/50 transition-colors cursor-pointer"
            title="Refresh Onchain Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            disabled={filteredTxs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-dark text-xs font-semibold rounded-full border border-dark hover:bg-primary/90 transition-colors enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Transactions Table Container */}
      <div className="bg-card border-2 border-dark rounded-none overflow-hidden">
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-secondary border-b-2 border-dark text-dark font-semibold">
                  <th className="py-3 px-4">Tx Hash & Block</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">AI Category Label</th>
                  <th className="py-3 px-4">From / To</th>
                  <th className="py-3 px-4 text-right">Amount (CELO)</th>
                  <th className="py-3 px-4 text-right">Value (USD)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <TableRowSkeleton key={idx} cols={7} />
                ))}
              </tbody>
            </table>
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs font-semibold text-red-600">Failed to load live onchain transactions.</p>
            <p className="text-2xs text-dark/60">{(error as Error)?.message || 'Network error occurred'}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-1.5 bg-primary text-dark text-xs font-semibold rounded-full border border-dark hover:bg-primary/90 transition-colors cursor-pointer mt-2"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredTxs.length === 0 ? (
          <div className="p-12 text-center text-xs text-dark/60 space-y-2 flex flex-col items-center justify-center">
            <History className="w-8 h-8 text-dark/40" />
            <p className="font-semibold text-dark">No transactions match your current filters.</p>
            <p className="text-2xs">Try switching category filters or search another Celo address.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-secondary border-b-2 border-dark text-dark font-semibold">
                  <th className="py-3 px-4">Tx Hash & Block</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">AI Category Label</th>
                  <th className="py-3 px-4">From / To</th>
                  <th className="py-3 px-4 text-right">Amount (CELO)</th>
                  <th className="py-3 px-4 text-right">Value (USD)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark/15 text-dark">
                {paginatedTxs.map((tx) => {
                  const isIncome = tx.type === 'Income'
                  const isSwap = tx.type === 'Swap'
                  const isYield = tx.type === 'Yield'
                  const isEditing = editingTxHash === tx.hash

                  return (
                    <tr key={tx.hash} className="hover:bg-secondary/40 transition-colors">
                      {/* Tx Hash & Explorer Link */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          {tx.status === 'Success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                          )}
                          <span className="font-semibold">{tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tx.hash)}
                            className="p-1 text-dark/50 hover:text-dark transition-colors cursor-pointer"
                            title="Copy transaction hash"
                          >
                            {copiedHash === tx.hash ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={`https://celo.blockscout.com/tx/${tx.hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-dark/60 hover:text-dark transition-colors"
                            title="View on Celo Blockscout"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-2xs text-dark/50 font-sans mt-0.5">Block #{tx.blockNumber}</p>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap text-dark/80">
                        {new Date(tx.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        <p className="text-2xs text-dark/50">
                          {new Date(tx.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      {/* AI Category Label + Confidence Badge */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={tx.type}
                              onChange={(e) =>
                                handleLabelCorrection(tx.hash, e.target.value as TransactionItem['type'])
                              }
                              className="px-2 py-1 bg-card border border-dark rounded-full text-2xs font-semibold focus:outline-none"
                            >
                              <option value="Income">Income</option>
                              <option value="Swap">Swap</option>
                              <option value="Yield">Yield</option>
                              <option value="Transfer">Transfer</option>
                              <option value="Gas Fee">Gas Fee</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => setEditingTxHash(null)}
                              className="px-2 py-0.5 text-2xs bg-dark text-card rounded-full"
                            >
                              Done
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-2xs font-bold rounded-full border ${
                                isIncome
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                  : isSwap
                                  ? 'bg-indigo-100 text-indigo-900 border-indigo-400'
                                  : isYield
                                  ? 'bg-amber-100 text-amber-900 border-amber-400'
                                  : 'bg-gray-100 text-gray-900 border-gray-400'
                              }`}
                            >
                              {tx.type}
                            </span>
                            {tx.isManual ? (
                              <span className="px-1.5 py-0.2 text-2xs bg-amber-200 text-amber-900 font-medium rounded-full border border-amber-400">
                                Corrected
                              </span>
                            ) : (
                              <span className="text-2xs text-dark/60 font-mono">
                                {tx.confidence}% confidence
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* From / To */}
                      <td className="py-3 px-4 font-mono text-2xs space-y-0.5">
                        <div className="flex items-center gap-1 text-dark/70">
                          <span className="w-8 text-dark/40 font-sans">From:</span>
                          <span>{tx.from ? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}` : 'Mint/Bridge'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-dark/70">
                          <span className="w-8 text-dark/40 font-sans">To:</span>
                          <span>{tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : 'Contract'}</span>
                        </div>
                      </td>

                      {/* Amount in CELO */}
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        <div className="flex items-center justify-end gap-1">
                          {isIncome ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-dark/50" />
                          )}
                          <span className={isIncome ? 'text-emerald-700' : 'text-dark'}>
                            {isIncome ? '+' : '-'}{tx.valueEth} CELO
                          </span>
                        </div>
                      </td>

                      {/* Value in USD */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-dark/80">
                        ${tx.valueUsd.toFixed(2)}
                      </td>

                      {/* Reclassify Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setEditingTxHash(isEditing ? null : tx.hash)}
                          className="p-1.5 rounded-full bg-secondary border border-dark text-dark/70 hover:text-dark hover:bg-primary transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Manually reclassify / correct label"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredTxs.length > 0 && (
          <div className="border-t-2 border-dark bg-secondary px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-xs text-dark/70">
                Showing <span className="font-bold text-dark">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-bold text-dark">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                <span className="font-bold text-dark">{totalItems}</span> transactions
              </p>

              {/* Rows Per Page / Limit Control */}
              <div className="flex items-center gap-1.5 border-l border-dark/20 pl-4">
                <span className="text-xs text-dark/70 font-medium">Limit:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2.5 py-1 bg-card border border-dark rounded-full text-xs text-dark font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-full bg-card border border-dark text-dark disabled:opacity-40 hover:bg-primary transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-dark px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-full bg-card border border-dark text-dark disabled:opacity-40 hover:bg-primary transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
