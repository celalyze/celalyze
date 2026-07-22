import { getWalletOverview, buildTaxReport, DEFAULT_MENTO_ADDRESS } from './celoService'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
}

type WalletOverviewResult = Awaited<ReturnType<typeof getWalletOverview>>
type TaxReportResult = ReturnType<typeof buildTaxReport>

/**
 * Deterministic agent tool function to summarize portfolio & tax insights in English.
 * Follows PRD.md Section 4.1 Agent Tool specifications without LLM dependencies.
 */
export function summarizeInsights(
  userQuery: string,
  overview: WalletOverviewResult,
  taxReport: TaxReportResult,
  activeAddress: string
): string {
  const queryLower = userQuery.trim().toLowerCase()
  const shortAddr = `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`

  // 1. Greetings / Introduction
  if (/^(hello|hi|hey|greetings|good morning|good afternoon|good evening|ping|test|who are you)/i.test(queryLower)) {
    return `Hello! I am Celalyze AI Agent (Onchain Tax & Portfolio Agent for Celo Mainnet).\n\n` +
      `I am ready to help audit your tax reports, Capital Gains (PnL), portfolio balances, and deductible gas fees for wallet ${shortAddr}.\n\n` +
      `Feel free to ask about your portfolio, FIFO tax calculations, or deductible gas expenses!`
  }

  // 2. Capital Gains / PnL / Profit / Revenue / Income
  if (queryLower.includes('gain') || queryLower.includes('profit') || queryLower.includes('pnl') || queryLower.includes('income') || queryLower.includes('revenue') || queryLower.includes('earning')) {
    return `Capital Gains (PnL) Audit for wallet ${shortAddr}:\n\n` +
      `- Realized Net Capital Gains (FIFO 2026): $${taxReport.netCapitalGainsUsd.toFixed(2)}\n` +
      `- Ordinary Taxable Income: $${taxReport.totalTaxableIncomeUsd.toFixed(2)}\n` +
      `- Total Classified Tax Events: ${taxReport.taxableEvents.length} events\n\n` +
      `Calculations are processed deterministically using FIFO accounting standards (IRS Form 8949 / PMK 68). Complete summary reports can be exported in the Tax Reports menu.`
  }

  // 3. Gas Fees / Deductions / Expenses / Costs
  if (queryLower.includes('gas') || queryLower.includes('fee') || queryLower.includes('cost') || queryLower.includes('deduct') || queryLower.includes('expense')) {
    return `Gas Fee Audit (Deductible Expenses) for wallet ${shortAddr}:\n\n` +
      `- Total Deductible Gas Fees: $${taxReport.totalDeductibleGasUsd.toFixed(2)}\n` +
      `- Net Taxable Base After Gas: $${taxReport.netTaxableBaseUsd.toFixed(2)}\n\n` +
      `All Celo Mainnet transaction gas fees are automatically classified as deductible expenses to reduce your net taxable income.`
  }

  // 4. Balances / Portfolio / Holdings / Tokens / Assets
  if (queryLower.includes('balance') || queryLower.includes('portfolio') || queryLower.includes('asset') || queryLower.includes('holding') || queryLower.includes('token') || queryLower.includes('celo')) {
    const holdings = overview.tokens
      .map((t: { symbol: string; balance: string; valueUsd: number }) => `- ${t.symbol}: ${t.balance} ($${t.valueUsd.toFixed(2)})`)
      .join('\n')

    return `Celo Onchain Portfolio Summary (${shortAddr}):\n\n` +
      `- Total Portfolio USD Value: $${overview.portfolioValueUsd.toFixed(2)}\n` +
      `- Native CELO Balance: ${overview.celoBalance} CELO\n\n` +
      `Token Asset Holdings:\n${holdings || '- No additional ERC-20 tokens found'}\n\n` +
      `Data fetched in real-time from Celo Mainnet RPC & Blockscout API.`
  }

  // 5. Accounting Methods / IRS / PMK 68 / Tax Rules / Export / Report
  if (queryLower.includes('fifo') || queryLower.includes('method') || queryLower.includes('rule') || queryLower.includes('tax') || queryLower.includes('report') || queryLower.includes('irs') || queryLower.includes('form')) {
    return `Celalyze Onchain Tax Engine Accounting Rules:\n\n` +
      `- Primary Method: First-In, First-Out (FIFO)\n` +
      `- Active Tax Year: 2026\n` +
      `- Regulatory Standards: IRS Form 8949 & PMK 68/2022 (Crypto Tax)\n\n` +
      `Transactions are classified deterministically into 6 categories: Income, Swap, Yield, Airdrop, Transfer, and Gas Fee.`
  }

  // 6. Summary / Audit / Overall Status Queries
  if (queryLower.includes('audit') || queryLower.includes('summary') || queryLower.includes('all') || queryLower.includes('total') || queryLower.includes('wallet') || queryLower.includes('overview')) {
    const holdingsSummary = overview.tokens
      .slice(0, 3)
      .map((t: { symbol: string; valueUsd: number }) => `${t.symbol} ($${t.valueUsd.toFixed(2)})`)
      .join(', ')

    return `Deterministic Onchain Audit Results for wallet ${shortAddr}:\n\n` +
      `- Total Portfolio Value: $${overview.portfolioValueUsd.toFixed(2)}\n` +
      `- Realized Net Capital Gains: $${taxReport.netCapitalGainsUsd.toFixed(2)}\n` +
      `- Ordinary Taxable Income: $${taxReport.totalTaxableIncomeUsd.toFixed(2)}\n` +
      `- Deductible Gas Expenses: $${taxReport.totalDeductibleGasUsd.toFixed(2)}\n` +
      `- Net Taxable Base: $${taxReport.netTaxableBaseUsd.toFixed(2)}\n` +
      `- Key Assets: ${holdingsSummary || 'CELO'}\n\n` +
      `All data calculated in real-time via Deterministic Celo Tax Engine without synthetic estimation.`
  }

  // 7. Fallback / Out-of-Scope Response
  return `Sorry, your query is outside the scope of Celalyze AI Agent's onchain analysis.\n\n` +
    `I am specifically built to audit tax liabilities and portfolio holdings on Celo Mainnet.\n\n` +
    `You can ask questions such as:\n` +
    `- What is my Net Capital Gain (PnL)?\n` +
    `- How much gas fee can I claim as tax deduction?\n` +
    `- Show my current Celo token holdings and portfolio balance\n` +
    `- Explain FIFO tax accounting rules (IRS Form 8949)`
}

/**
 * Ask Celalyze Agent using Deterministic Agent Tools (PRD Spec Section 4.1)
 */
export async function askAIAgent(
  userQuery: string,
  walletAddress: string = DEFAULT_MENTO_ADDRESS,
  _conversationHistory: ChatMessage[] = []
): Promise<{ reply: string; sources: string[] }> {
  const activeAddress = walletAddress || DEFAULT_MENTO_ADDRESS
  const sources: string[] = []

  // 1. Tool: get_wallet_overview(wallet_address)
  const overview = await getWalletOverview(activeAddress)
  sources.push(`Celo Blockscout RPC (${overview.tokens.length} assets audited)`)

  // 2. Tool: build_tax_report(classified_transactions, tax_rules)
  const taxReport = buildTaxReport(overview.recentTransactions, overview.celoPriceUsd, 'FIFO', '2026')
  sources.push(`Celalyze Onchain Tax Engine (FIFO 2026 Report)`)

  // 3. Tool: summarize_insights(tax_report_data, query)
  const reply = summarizeInsights(userQuery, overview, taxReport, activeAddress)

  return {
    reply,
    sources,
  }
}
