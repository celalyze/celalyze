import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Download,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Scale,
  ExternalLink,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Globe,
} from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import {
  getWalletOverview,
  buildTaxReport,
  DEFAULT_MENTO_ADDRESS,
  type TaxReportSummary,
} from '../services/celoService'
import { TableRowSkeleton } from '../components/Skeleton'

export function TaxReportsPage() {
  const { address: connectedAddress } = useWallet()

  const activeAddress = connectedAddress || DEFAULT_MENTO_ADDRESS

  // Tax calculation settings state
  const [taxYear, setTaxYear] = useState<string>('2026')
  const [costBasisMethod, setCostBasisMethod] = useState<'FIFO' | 'LIFO' | 'HIFO'>('FIFO')
  const [jurisdiction, setJurisdiction] = useState<string>('IRS 8949 (US)')

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  // Real-time live query fetching real Celo transaction history
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['tax-report-data', activeAddress],
    queryFn: () => getWalletOverview(activeAddress),
    enabled: Boolean(activeAddress),
    staleTime: 10000,
    refetchInterval: 15000,
  })

  // Compute deterministic tax report breakdown from real onchain transactions
  const taxReport: TaxReportSummary = data
    ? buildTaxReport(data.recentTransactions, data.celoPriceUsd, costBasisMethod, taxYear)
    : {
        taxYear,
        costBasisMethod,
        totalTaxableIncomeUsd: 0,
        realizedCapitalGainsUsd: 0,
        realizedCapitalLossesUsd: 0,
        netCapitalGainsUsd: 0,
        totalDeductibleGasUsd: 0,
        netTaxableBaseUsd: 0,
        taxableEvents: [],
      }

  // Pagination calculation
  const totalEvents = taxReport.taxableEvents.length
  const totalPages = Math.ceil(totalEvents / itemsPerPage) || 1
  const paginatedEvents = taxReport.taxableEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Export Tax Report CSV (IRS Form 8949 Compatible)
  const exportTaxCSV = () => {
    if (taxReport.taxableEvents.length === 0) return
    const headers = [
      'TxHash',
      'DateTimestamp',
      'BlockNumber',
      'TaxEventType',
      'Asset',
      'Amount',
      'ProceedsUSD',
      'CostBasisUSD',
      'GainLossUSD',
      'HoldingPeriod',
      'Jurisdiction',
      'AccountingMethod',
    ]
    const rows = taxReport.taxableEvents.map((e) => [
      e.hash,
      new Date(e.timestamp).toISOString(),
      e.blockNumber,
      e.eventType,
      e.asset,
      e.amount,
      e.proceedsUsd.toFixed(2),
      e.costBasisUsd.toFixed(2),
      e.gainLossUsd.toFixed(2),
      e.holdingPeriod,
      jurisdiction,
      costBasisMethod,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `celalyze_tax_report_${taxYear}_${costBasisMethod}_${activeAddress.slice(0, 8)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print Report Handler
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 font-sans pb-24 sm:pb-8">
      {/* PRINT-ONLY OFFICIAL AUDIT STATEMENT HEADER */}
      <div className="print-only mb-6 border-b-2 border-dark pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="hero-title text-2xl text-dark font-bold">Celalyze Onchain Tax Audit Statement</h1>
          <span className="text-xs font-mono text-dark/70">Generated: {new Date().toLocaleDateString('en-US')}</span>
        </div>
        <div className="grid grid-cols-2 text-xs font-mono gap-1.5 text-dark/80 pt-2 border-t border-dark/20">
          <div><span className="font-bold">Audited Wallet:</span> {activeAddress}</div>
          <div><span className="font-bold">Accounting Method:</span> {costBasisMethod}</div>
          <div><span className="font-bold">Tax Jurisdiction:</span> {jurisdiction}</div>
          <div><span className="font-bold">Tax Period:</span> {taxYear}</div>
        </div>
      </div>

      {/* Header & Real Address Inspector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary text-dark text-xs font-semibold rounded-full border border-dark whitespace-nowrap">
              <FileText className="w-3.5 h-3.5" />
              <span>Celo Onchain Tax Engine</span>
            </span>
          </div>
          <h1 className="hero-title text-3xl sm:text-4xl text-dark">
            Tax Reports & Capital Gains
          </h1>
          <p className="text-xs text-dark/70 font-mono mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="whitespace-nowrap">Auditing Address:</span>
            <span className="font-bold text-dark break-all">{activeAddress}</span>
            <a
              href={`https://celo.blockscout.com/address/${activeAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-dark hover:underline inline-flex items-center gap-0.5 flex-shrink-0 no-print"
              title="View on Celo Blockscout Explorer"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Action Controls: CSV Export, Print */}
        <div className="flex items-center gap-2 no-print flex-shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="p-2.5 bg-secondary border border-dark rounded-full text-dark hover:bg-primary/50 transition-colors cursor-pointer flex-shrink-0"
            title="Print Tax Summary Statement"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={exportTaxCSV}
            disabled={taxReport.taxableEvents.length === 0}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-dark text-xs font-semibold rounded-full border border-dark hover:bg-primary/90 transition-colors enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap flex-shrink-0 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Export IRS Form 8949 CSV</span>
          </button>
        </div>
      </div>

      {/* Tax Calculation Control Bar (Method, Year, Jurisdiction) */}
      <div className="bg-card border-2 border-dark rounded-none p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs no-print overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap w-full lg:w-auto">
          {/* Cost Basis Method Picker */}
          <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap sm:flex-nowrap">
            <span className="text-xs font-semibold text-dark flex items-center gap-1 shrink-0">
              <Scale className="w-3.5 h-3.5 text-dark/70" />
              <span>Accounting Method:</span>
            </span>
            <div className="flex items-center gap-1 bg-secondary p-1 border border-dark rounded-full">
              {(['FIFO', 'LIFO', 'HIFO'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setCostBasisMethod(method)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-0.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    costBasisMethod === method
                      ? 'bg-primary text-dark border border-dark shadow-2xs'
                      : 'text-dark/60 hover:text-dark'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Tax Year Filter Picker */}
          <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap sm:flex-nowrap">
            <span className="text-xs font-semibold text-dark flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-dark/70" />
              <span>Tax Year:</span>
            </span>
            <select
              value={taxYear}
              onChange={(e) => {
                setTaxYear(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-1 bg-secondary border border-dark rounded-full text-xs text-dark font-semibold focus:outline-none cursor-pointer max-w-full"
            >
              <option value="2026">Tax Year 2026</option>
              <option value="2025">Tax Year 2025</option>
              <option value="All">All Time History</option>
            </select>
          </div>
        </div>

        {/* Tax Jurisdiction Badge */}
        <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto">
          <span className="text-xs font-semibold text-dark flex items-center gap-1 shrink-0">
            <Globe className="w-3.5 h-3.5 text-dark/70" />
            <span>Rule Framework:</span>
          </span>
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="px-3 py-1 bg-secondary border border-dark rounded-full text-xs text-dark font-semibold focus:outline-none cursor-pointer max-w-[210px] sm:max-w-xs truncate"
          >
            <option value="IRS 8949 (US)">US (IRS Form 8949)</option>
            <option value="Indonesia PMK 68">Indonesia (PMK 68)</option>
            <option value="Generic Global">Global FIFO</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ordinary Taxable Income */}
        <div className="bg-card border-2 border-dark rounded-none p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-dark/70">
            <span className="text-xs font-semibold tracking-wider uppercase">Ordinary Income</span>
            <Receipt className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          </div>
          <div className="hero-title text-2xl text-emerald-700 font-mono">
            ${taxReport.totalTaxableIncomeUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-2xs text-dark/60">Inbound transfers, mints & rewards</p>
        </div>

        {/* Card 2: Net Realized Capital Gains */}
        <div className="bg-card border-2 border-dark rounded-none p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-dark/70">
            <span className="text-xs font-semibold tracking-wider uppercase">Net Capital Gains</span>
            <TrendingUp className="w-4 h-4 text-dark flex-shrink-0" />
          </div>
          <div className="hero-title text-2xl text-dark font-mono">
            ${taxReport.netCapitalGainsUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-2xs text-dark/60">Calculated via {costBasisMethod} method</p>
        </div>

        {/* Card 3: Deductible Network Gas Fees */}
        <div className="bg-card border-2 border-dark rounded-none p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-dark/70">
            <span className="text-xs font-semibold tracking-wider uppercase">Deductible Gas Fees</span>
            <DollarSign className="w-4 h-4 text-dark flex-shrink-0" />
          </div>
          <div className="hero-title text-2xl text-dark font-mono">
            ${taxReport.totalDeductibleGasUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-2xs text-dark/60">Paid on Celo Mainnet RPC</p>
        </div>

        {/* Card 4: Net Taxable Base Output */}
        <div className="bg-card border-2 border-dark rounded-none p-5 space-y-2 shadow-xs bg-primary/20">
          <div className="flex items-center justify-between text-dark/70">
            <span className="text-xs font-semibold tracking-wider uppercase">Net Taxable Base</span>
            <ShieldCheck className="w-4 h-4 text-dark flex-shrink-0" />
          </div>
          <div className="hero-title text-2xl text-dark font-mono font-bold">
            ${taxReport.netTaxableBaseUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-2xs text-dark/70 font-medium">Income + Net Gains - Gas Deductions</p>
        </div>
      </div>

      {/* Main Tax Events Itemization Table */}
      <div className="bg-card border-2 border-dark rounded-none overflow-hidden shadow-xs">
        <div className="border-b-2 border-dark bg-secondary px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="hero-title text-xl text-dark">
              Taxable Events Itemization ({taxReport.taxableEvents.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-1.5 bg-card border border-dark rounded-full text-dark hover:bg-primary/50 transition-colors cursor-pointer"
              title="Re-audit Onchain History"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
            <span className="px-3 py-1 bg-primary text-dark text-xs font-semibold rounded-full border border-dark font-mono">
              {costBasisMethod} Accounting Active
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-secondary/70 border-b border-dark text-dark font-semibold">
                  <th className="py-3 px-4">Date & Block</th>
                  <th className="py-3 px-4">Event Classification</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4 text-right">Proceeds (USD)</th>
                  <th className="py-3 px-4 text-right">Cost Basis (USD)</th>
                  <th className="py-3 px-4 text-right">Gain / Loss (USD)</th>
                  <th className="py-3 px-4 text-center">Holding Period</th>
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
            <p className="text-xs font-semibold text-red-600">Failed to generate real-time tax report.</p>
            <p className="text-2xs text-dark/60">{(error as Error)?.message || 'RPC Error'}</p>
          </div>
        ) : taxReport.taxableEvents.length === 0 ? (
          <div className="p-12 text-center text-xs text-dark/60 space-y-2 flex flex-col items-center justify-center">
            <FileText className="w-8 h-8 text-dark/40" />
            <p className="font-semibold text-dark">No taxable events recorded for Tax Year {taxYear}.</p>
            <p className="text-2xs">Try switching the Tax Year filter or inspect another Celo address.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-secondary/70 border-b-2 border-dark text-dark font-semibold">
                  <th className="py-3 px-4">Date & Block</th>
                  <th className="py-3 px-4">Event Classification</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4 text-right">Proceeds (USD)</th>
                  <th className="py-3 px-4 text-right">Cost Basis (USD)</th>
                  <th className="py-3 px-4 text-right">Gain / Loss (USD)</th>
                  <th className="py-3 px-4 text-center">Holding Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark/15 text-dark font-mono">
                {paginatedEvents.map((evt, i) => {
                  const isOrdinary = evt.eventType === 'Ordinary Income'
                  const isGain = evt.gainLossUsd >= 0

                  return (
                    <tr key={`${evt.hash}-${i}`} className="hover:bg-secondary/40 transition-colors">
                      {/* Date & Block */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-sans font-semibold text-dark">
                          {new Date(evt.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <a
                          href={`https://celo.blockscout.com/tx/${evt.hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-2xs text-dark/50 hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          Block #{evt.blockNumber} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>

                      {/* Event Classification */}
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-2xs font-bold rounded-full border whitespace-nowrap ${
                            isOrdinary
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                              : isGain
                              ? 'bg-indigo-100 text-indigo-900 border-indigo-400'
                              : 'bg-red-100 text-red-900 border-red-400'
                          }`}
                        >
                          {evt.eventType}
                        </span>
                      </td>

                      {/* Asset */}
                      <td className="py-3 px-4 font-bold text-dark whitespace-nowrap">{evt.asset}</td>

                      {/* Proceeds */}
                      <td className="py-3 px-4 text-right font-semibold whitespace-nowrap">${evt.proceedsUsd.toFixed(2)}</td>

                      {/* Cost Basis */}
                      <td className="py-3 px-4 text-right text-dark/70 whitespace-nowrap">${evt.costBasisUsd.toFixed(2)}</td>

                      {/* Net Gain/Loss */}
                      <td
                        className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                          isOrdinary || isGain ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {isOrdinary || isGain ? '+' : '-'}${Math.abs(evt.gainLossUsd).toFixed(2)}
                      </td>

                      {/* Holding Period */}
                      <td className="py-3 px-4 text-center font-sans whitespace-nowrap">
                        <span className="px-2 py-0.5 text-2xs bg-secondary border border-dark/30 rounded-full font-medium text-dark/80 whitespace-nowrap">
                          {evt.holdingPeriod}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {taxReport.taxableEvents.length > 0 && (
          <div className="border-t-2 border-dark bg-secondary px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto flex-wrap">
              <p className="text-xs text-dark/70 whitespace-nowrap">
                Showing <span className="font-bold text-dark">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-bold text-dark">{Math.min(currentPage * itemsPerPage, totalEvents)}</span> of{' '}
                <span className="font-bold text-dark">{totalEvents}</span> tax events
              </p>

              {/* Rows Per Page / Limit Control */}
              <div className="flex items-center gap-1.5 border-l-0 sm:border-l border-dark/20 pl-0 sm:pl-3">
                <span className="text-xs text-dark/70 font-medium whitespace-nowrap">Limit:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2.5 py-1 bg-card border border-dark rounded-full text-xs text-dark font-semibold focus:outline-none cursor-pointer whitespace-nowrap shadow-2xs"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>

            {/* Page Navigation Controls */}
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-full bg-card border border-dark text-dark disabled:opacity-40 enabled:hover:bg-primary transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-dark px-2 whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-full bg-card border border-dark text-dark disabled:opacity-40 enabled:hover:bg-primary transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                title="Next Page"
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
