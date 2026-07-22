import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  ArrowRight,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Wallet,
  Database,
  BarChart3,
  CheckCircle2,
  Brain,
  Layers,
  Trophy,
  Terminal,
  Download,
  Code2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { OdometerCounter } from '../components/OdometerCounter'
import { useWallet } from '../context/WalletContext'

// 20 Live Mockup Data States (Numeric values for odometer animation & rich activity feed)
const balanceStates = [
  { balanceNum: 42890.12, pnlNum: 12.4 },
  { balanceNum: 42935.12, pnlNum: 12.8 },
  { balanceNum: 43185.12, pnlNum: 13.4 },
  { balanceNum: 43064.67, pnlNum: 13.1 },
  { balanceNum: 43420.80, pnlNum: 14.0 },
  { balanceNum: 43580.25, pnlNum: 14.5 },
  { balanceNum: 43515.10, pnlNum: 14.3 },
  { balanceNum: 43890.45, pnlNum: 15.2 },
  { balanceNum: 43760.00, pnlNum: 14.9 },
  { balanceNum: 44120.30, pnlNum: 15.8 },
  { balanceNum: 44010.88, pnlNum: 15.5 },
  { balanceNum: 44350.50, pnlNum: 16.1 },
  { balanceNum: 44290.15, pnlNum: 15.9 },
  { balanceNum: 44780.00, pnlNum: 16.8 },
  { balanceNum: 44640.20, pnlNum: 16.5 },
  { balanceNum: 45010.75, pnlNum: 17.3 },
  { balanceNum: 44920.00, pnlNum: 17.1 },
  { balanceNum: 45280.60, pnlNum: 17.9 },
  { balanceNum: 45150.25, pnlNum: 17.6 },
  { balanceNum: 45600.00, pnlNum: 18.5 },
]

const taxReportStates = [
  { capitalGains: 1240.00, ordinaryIncome: 450.21 },
  { capitalGains: 1285.00, ordinaryIncome: 495.21 },
  { capitalGains: 1535.00, ordinaryIncome: 495.21 },
  { capitalGains: 1414.55, ordinaryIncome: 610.41 },
  { capitalGains: 1620.00, ordinaryIncome: 610.41 },
  { capitalGains: 1780.25, ordinaryIncome: 655.41 },
  { capitalGains: 1715.10, ordinaryIncome: 655.41 },
  { capitalGains: 1940.45, ordinaryIncome: 700.41 },
  { capitalGains: 1810.00, ordinaryIncome: 700.41 },
  { capitalGains: 2170.30, ordinaryIncome: 785.41 },
  { capitalGains: 2060.88, ordinaryIncome: 785.41 },
  { capitalGains: 2320.50, ordinaryIncome: 830.41 },
  { capitalGains: 2260.15, ordinaryIncome: 830.41 },
  { capitalGains: 2550.00, ordinaryIncome: 915.41 },
  { capitalGains: 2410.20, ordinaryIncome: 915.41 },
  { capitalGains: 2780.75, ordinaryIncome: 980.41 },
  { capitalGains: 2690.00, ordinaryIncome: 980.41 },
  { capitalGains: 2950.60, ordinaryIncome: 1045.41 },
  { capitalGains: 2820.25, ordinaryIncome: 1045.41 },
  { capitalGains: 3200.00, ordinaryIncome: 1120.41 },
]

const activitySnapshots = [
  [
    { id: 'act-1', title: 'CELO / USDm Swap', time: '2 mins ago', amount: '-$120.45', type: 'swap', isNew: false },
    { id: 'act-2', title: 'Received Reward', time: '1 hour ago', amount: '+$45.00', type: 'in', isNew: false },
    { id: 'act-3', title: 'Sent cEUR', time: '5 hours ago', amount: '-$2,100.00', type: 'out', isNew: false },
  ],
  [
    { id: 'act-4', title: 'Staking Reward Claimed', time: 'Just now', amount: '+$45.00', type: 'in', isNew: true },
    { id: 'act-1', title: 'CELO / USDm Swap', time: '4 mins ago', amount: '-$120.45', type: 'swap', isNew: false },
    { id: 'act-2', title: 'Received Reward', time: '1 hour ago', amount: '+$45.00', type: 'in', isNew: false },
  ],
  [
    { id: 'act-5', title: 'USDm Yield Received', time: 'Just now', amount: '+$250.00', type: 'in', isNew: true },
    { id: 'act-4', title: 'Staking Reward Claimed', time: '2 mins ago', amount: '+$45.00', type: 'in', isNew: false },
    { id: 'act-1', title: 'CELO / USDm Swap', time: '6 mins ago', amount: '-$120.45', type: 'swap', isNew: false },
  ],
  [
    { id: 'act-6', title: 'Mento FX Swap', time: 'Just now', amount: '-$120.45', type: 'swap', isNew: true },
    { id: 'act-5', title: 'USDm Yield Received', time: '3 mins ago', amount: '+$250.00', type: 'in', isNew: false },
    { id: 'act-4', title: 'Staking Reward Claimed', time: '5 mins ago', amount: '+$45.00', type: 'in', isNew: false },
  ],
  [
    { id: 'act-7', title: 'Uniswap V3 LP Fee', time: 'Just now', amount: '+$356.13', type: 'in', isNew: true },
    { id: 'act-6', title: 'Mento FX Swap', time: '2 mins ago', amount: '-$120.45', type: 'swap', isNew: false },
    { id: 'act-5', title: 'USDm Yield Received', time: '5 mins ago', amount: '+$250.00', type: 'in', isNew: false },
  ],
  [
    { id: 'act-8', title: 'GoodDollar Airdrop', time: 'Just now', amount: '+$159.45', type: 'in', isNew: true },
    { id: 'act-7', title: 'Uniswap V3 LP Fee', time: '3 mins ago', amount: '+$356.13', type: 'in', isNew: false },
    { id: 'act-6', title: 'Mento FX Swap', time: '5 mins ago', amount: '-$120.45', type: 'swap', isNew: false },
  ],
  [
    { id: 'act-9', title: 'Valora Cash Out (KESm)', time: 'Just now', amount: '-$65.15', type: 'out', isNew: true },
    { id: 'act-8', title: 'GoodDollar Airdrop', time: '2 mins ago', amount: '+$159.45', type: 'in', isNew: false },
    { id: 'act-7', title: 'Uniswap V3 LP Fee', time: '5 mins ago', amount: '+$356.13', type: 'in', isNew: false },
  ],
  [
    { id: 'act-10', title: 'stCELO Liquid Staking', time: 'Just now', amount: '+$375.35', type: 'in', isNew: true },
    { id: 'act-9', title: 'Valora Cash Out (KESm)', time: '3 mins ago', amount: '-$65.15', type: 'out', isNew: false },
    { id: 'act-8', title: 'GoodDollar Airdrop', time: '5 mins ago', amount: '+$159.45', type: 'in', isNew: false },
  ],
  [
    { id: 'act-11', title: 'ImpactMarket Donation', time: 'Just now', amount: '-$130.45', type: 'out', isNew: true },
    { id: 'act-10', title: 'stCELO Liquid Staking', time: '2 mins ago', amount: '+$375.35', type: 'in', isNew: false },
    { id: 'act-9', title: 'Valora Cash Out (KESm)', time: '5 mins ago', amount: '-$65.15', type: 'out', isNew: false },
  ],
  [
    { id: 'act-12', title: 'eREAL (BRLm) Yield', time: 'Just now', amount: '+$360.30', type: 'in', isNew: true },
    { id: 'act-11', title: 'ImpactMarket Donation', time: '3 mins ago', amount: '-$130.45', type: 'out', isNew: false },
    { id: 'act-10', title: 'stCELO Liquid Staking', time: '5 mins ago', amount: '+$375.35', type: 'in', isNew: false },
  ],
  [
    { id: 'act-13', title: 'Squid Cross-Chain Swap', time: 'Just now', amount: '-$109.42', type: 'swap', isNew: true },
    { id: 'act-12', title: 'eREAL (BRLm) Yield', time: '2 mins ago', amount: '+$360.30', type: 'in', isNew: false },
    { id: 'act-11', title: 'ImpactMarket Donation', time: '5 mins ago', amount: '-$130.45', type: 'out', isNew: false },
  ],
  [
    { id: 'act-14', title: 'Mentofi Farm Reward', time: 'Just now', amount: '+$339.62', type: 'in', isNew: true },
    { id: 'act-13', title: 'Squid Cross-Chain Swap', time: '3 mins ago', amount: '-$109.42', type: 'swap', isNew: false },
    { id: 'act-12', title: 'eREAL (BRLm) Yield', time: '5 mins ago', amount: '+$360.30', type: 'in', isNew: false },
  ],
  [
    { id: 'act-15', title: 'Curve Pool Rebalance', time: 'Just now', amount: '-$60.35', type: 'swap', isNew: true },
    { id: 'act-14', title: 'Mentofi Farm Reward', time: '2 mins ago', amount: '+$339.62', type: 'in', isNew: false },
    { id: 'act-13', title: 'Squid Cross-Chain Swap', time: '5 mins ago', amount: '-$109.42', type: 'swap', isNew: false },
  ],
  [
    { id: 'act-16', title: 'Aave V3 Deposit (USDm)', time: 'Just now', amount: '+$489.85', type: 'in', isNew: true },
    { id: 'act-15', title: 'Curve Pool Rebalance', time: '3 mins ago', amount: '-$60.35', type: 'swap', isNew: false },
    { id: 'act-14', title: 'Mentofi Farm Reward', time: '5 mins ago', amount: '+$339.62', type: 'in', isNew: false },
  ],
  [
    { id: 'act-17', title: 'MiniPay P2P Transfer', time: 'Just now', amount: '-$139.80', type: 'out', isNew: true },
    { id: 'act-16', title: 'Aave V3 Deposit (USDm)', time: '2 mins ago', amount: '+$489.85', type: 'in', isNew: false },
    { id: 'act-15', title: 'Curve Pool Rebalance', time: '5 mins ago', amount: '-$60.35', type: 'swap', isNew: false },
  ],
  [
    { id: 'act-18', title: 'NFT Royalty Yield', time: 'Just now', amount: '+$370.55', type: 'in', isNew: true },
    { id: 'act-17', title: 'MiniPay P2P Transfer', time: '3 mins ago', amount: '-$139.80', type: 'out', isNew: false },
    { id: 'act-16', title: 'Aave V3 Deposit (USDm)', time: '5 mins ago', amount: '+$489.85', type: 'in', isNew: false },
  ],
  [
    { id: 'act-19', title: 'Gov Voting Reward', time: 'Just now', amount: '-$90.75', type: 'out', isNew: true },
    { id: 'act-18', title: 'NFT Royalty Yield', time: '2 mins ago', amount: '+$370.55', type: 'in', isNew: false },
    { id: 'act-17', title: 'MiniPay P2P Transfer', time: '5 mins ago', amount: '-$139.80', type: 'out', isNew: false },
  ],
  [
    { id: 'act-20', title: 'CELO / KESm Mento Swap', time: 'Just now', amount: '+$360.60', type: 'swap', isNew: true },
    { id: 'act-19', title: 'Gov Voting Reward', time: '3 mins ago', amount: '-$90.75', type: 'out', isNew: false },
    { id: 'act-18', title: 'NFT Royalty Yield', time: '5 mins ago', amount: '+$370.55', type: 'in', isNew: false },
  ],
  [
    { id: 'act-21', title: 'Valora Cash Out (NGNm)', time: 'Just now', amount: '-$130.35', type: 'out', isNew: true },
    { id: 'act-20', title: 'CELO / KESm Mento Swap', time: '2 mins ago', amount: '+$360.60', type: 'swap', isNew: false },
    { id: 'act-19', title: 'Gov Voting Reward', time: '5 mins ago', amount: '-$90.75', type: 'out', isNew: false },
  ],
  [
    { id: 'act-22', title: 'USDT / USDm Mento Swap', time: 'Just now', amount: '+$449.75', type: 'swap', isNew: true },
    { id: 'act-21', title: 'Valora Cash Out (NGNm)', time: '3 mins ago', amount: '-$130.35', type: 'out', isNew: false },
    { id: 'act-20', title: 'CELO / KESm Mento Swap', time: '5 mins ago', amount: '+$360.60', type: 'swap', isNew: false },
  ],
]

const statusMessages = [
  'Scanning Celo network for reward distributions.',
  'Detected new Staking Reward (+$45.00).',
  'Indexing USDm Yield event on GoldRush API...',
  'Updating FIFO cost basis tax ledger...',
  'Traversing Uniswap V3 Celo liquidity pools...',
  'Indexed GoodDollar Airdrop distribution (+$159.45).',
  'Analyzing Valora off-ramp cash out transaction...',
  'Calculated stCELO liquid staking yield accrual...',
  'Classified ImpactMarket community donation expense.',
  'Traversing eREAL (BRLm) stablecoin distribution...',
  'Auditing Squid Router cross-chain bridge fees...',
  'Recalculating Mentofi yield farm tax basis...',
  'Matching Curve USDm liquidity pool rebalance event...',
  'Verified Aave V3 Celo collateral deposit...',
  'Logged MiniPay mobile P2P remittance transfer...',
  'Extracted NFT creator royalty yield tax classification...',
  'Recorded Celo Governance voting reward distribution...',
  'Parsed Mento FX engine exchange rate logs...',
  'Classified Valora NGNm fiat gateway off-ramp event...',
  'Updated total portfolio value and PnL analytics ledger.',
]

export function LandingPage() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { isConnected, connectWallet } = useWallet()

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prevStep) => (prevStep + 1) % balanceStates.length)
    }, 3200)

    return () => clearInterval(timer)
  }, [])

  const handleStartAnalysis = () => {
    if (!isConnected) {
      connectWallet()
    } else {
      navigate('/dashboard')
    }
  }

  const currentBalance = balanceStates[step]
  const currentTaxReport = taxReportStates[step]
  const currentActivities = activitySnapshots[step]
  const currentStatus = statusMessages[step]

  return (
    <div className="w-full font-sans">
      {/* SECTION 1: HERO SECTION */}
      <section className="w-full bg-secondary border-b-2 border-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary text-dark text-xs font-semibold px-3.5 py-1.5 rounded-full border border-dark">
              <Zap className="w-3.5 h-3.5" />
              <span>Agentic Analysis Ready</span>
            </div>
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-normal text-dark leading-tight">
              Onchain tax & portfolio insights for <span className="accent-italic">Celo wallets.</span>
            </h1>
            <p className="text-sm sm:text-base text-dark/80 max-w-xl leading-relaxed">
              Connect a Celo address, let the agent read your onchain history, and get clear PnL and tax-ready reports—without executing any trades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="flex items-center justify-center gap-2 bg-primary text-dark px-7 py-3 rounded-full text-xs font-semibold border border-dark hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <span>Analyze my Celo wallet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="flex items-center justify-center gap-2 bg-card text-dark px-7 py-3 rounded-full text-xs font-semibold border border-dark hover:bg-secondary transition-colors cursor-pointer"
              >
                <span>View dashboard</span>
              </button>
            </div>
          </div>

          {/* Motorcycle Odometer Rolling Digit Card */}
          <div className="relative">
            <div className="bg-card border-2 border-dark rounded-none p-6 space-y-6">
              {/* Header Balance Row */}
              <div className="flex justify-between items-start border-b border-dark/20 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-dark/60">Total Balance</p>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  
                  {/* Motorcycle Odometer Rolling Digit Wheel */}
                  <div className="hero-title text-3xl text-dark mt-1">
                    <OdometerCounter value={currentBalance.balanceNum} prefix="$" decimals={2} />
                  </div>
                </div>

                {/* Motorcycle Odometer Rolling PnL Percentage */}
                <span className="bg-primary text-dark text-xs font-semibold px-3 py-1 rounded-full border border-dark flex items-center gap-1 font-mono">
                  <OdometerCounter
                    value={currentBalance.pnlNum}
                    prefix={currentBalance.pnlNum >= 0 ? '+' : ''}
                    suffix="%"
                    decimals={1}
                  />
                </span>
              </div>

              {/* Recent Activity List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-dark/60">Recent Activity</p>
                  <span className="text-2xs font-mono text-dark/50">
                    Live Feed
                  </span>
                </div>

                {/* Framer Motion Activity Items Stack */}
                <div className="space-y-2 min-h-40">
                  <AnimatePresence initial={false} mode="popLayout">
                    {currentActivities.map((act) => {
                      const isPositive = act.amount.startsWith('+')

                      return (
                        <motion.div
                          key={act.id}
                          layout
                          initial={{ opacity: 0, y: -16, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 16, scale: 0.95 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className={`flex justify-between items-center p-3 border border-dark rounded-none ${
                            act.isNew
                              ? 'bg-primary/40 border-l-4 border-l-dark'
                              : 'bg-secondary'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-card border border-dark rounded-none">
                              {act.type === 'swap' && <ArrowLeftRight className="w-4 h-4 text-dark" />}
                              {act.type === 'in' && <ArrowDownLeft className="w-4 h-4 text-dark" />}
                              {act.type === 'out' && <ArrowUpRight className="w-4 h-4 text-dark" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-semibold text-dark">{act.title}</p>
                                {act.isNew && (
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-2xs bg-primary text-dark font-bold px-1.5 py-0.5 rounded-full border border-dark"
                                  >
                                    New
                                  </motion.span>
                                )}
                              </div>
                              <p className="text-2xs text-dark/60">{act.time}</p>
                            </div>
                          </div>
                          <p className={`text-xs font-mono font-semibold ${isPositive ? 'text-dark font-bold' : 'text-dark'}`}>
                            {act.amount}
                          </p>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Agent Syncing Badge */}
            <div className="hidden md:block absolute -bottom-5 -right-5 bg-dark text-white p-3.5 rounded-none border border-dark max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-3 h-3 text-primary animate-spin" />
                <span className="text-2xs font-bold">Agent Syncing...</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentStatus}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs opacity-80 leading-tight"
                >
                  {currentStatus}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="w-full bg-card border-b-2 border-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="hero-title text-3xl sm:text-4xl text-dark">
              Automated analytical workflow
            </h2>
            <p className="text-xs sm:text-sm text-dark/70">
              Celalyze leverages agentic technology to reconstruct your history without requiring private keys or transaction approval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-secondary border-2 border-dark rounded-none p-6 space-y-4">
              <div className="w-10 h-10 bg-primary rounded-full border border-dark flex items-center justify-center font-bold text-sm text-dark">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="hero-title text-xl text-dark">1. Connect Celo wallet</h3>
              <p className="text-xs text-dark/70 leading-relaxed">
                Simply enter any Celo public address. No sign-up or wallet signatures required for read-only analytics.
              </p>
            </div>

            <div className="bg-secondary border-2 border-dark rounded-none p-6 space-y-4">
              <div className="w-10 h-10 bg-primary rounded-full border border-dark flex items-center justify-center font-bold text-sm text-dark">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="hero-title text-xl text-dark">2. Agent reads onchain data</h3>
              <p className="text-xs text-dark/70 leading-relaxed">
                Our analytical agent utilizes GoldRush API to crawl Celo's history, mapping DeFi interactions and price data automatically.
              </p>
            </div>

            <div className="bg-secondary border-2 border-dark rounded-none p-6 space-y-4">
              <div className="w-10 h-10 bg-primary rounded-full border border-dark flex items-center justify-center font-bold text-sm text-dark">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="hero-title text-xl text-dark">3. See tax & PnL insights</h3>
              <p className="text-xs text-dark/70 leading-relaxed">
                Access a comprehensive dashboard with deterministic PnL tracking and exportable tax-ready financial reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: KEY FEATURES */}
      <section id="features" className="w-full bg-secondary border-b-2 border-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="hero-title text-3xl sm:text-4xl text-dark">
                Financial clarity for the Celo ecosystem.
              </h2>
              <p className="text-xs sm:text-sm text-dark/70">
                We strip away the complexity of block explorers to give you a pure financial view of your assets.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-dark fill-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-dark">Portfolio & PnL dashboard</p>
                  <p className="text-xs text-dark/70">Real-time performance tracking of all Celo native and ERC-20 assets.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-dark fill-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-dark">Tax reports with CSV/PDF export</p>
                  <p className="text-xs text-dark/70">Generate FIFO/LIFO cost basis reports compatible with major tax software.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-dark fill-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-dark">History & labels</p>
                  <p className="text-xs text-dark/70">Automated labeling of Mento, Valora, and Uniswap V3 interactions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-dark fill-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-dark">Deterministic read-only analytics</p>
                  <p className="text-xs text-dark/70">100% security by design. We only read data, never ask for access.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Stack of Cards with Odometer Rolling Animation */}
          <div className="bg-card border-2 border-dark rounded-none p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-dark/20 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-dark" />
                <p className="text-xs font-bold text-dark">Tax Reports</p>
              </div>
              <span className="px-2.5 py-0.5 bg-primary text-dark text-2xs font-semibold rounded-full border border-dark">Export Ready</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-secondary border border-dark p-3 rounded-none">
                <p className="text-2xs font-semibold text-dark/60">Capital Gains</p>
                <div className="text-sm font-mono font-bold text-dark mt-1">
                  <OdometerCounter value={currentTaxReport.capitalGains} prefix="$" decimals={2} />
                </div>
              </div>
              <div className="bg-secondary border border-dark p-3 rounded-none">
                <p className="text-2xs font-semibold text-dark/60">Ordinary Income</p>
                <div className="text-sm font-mono font-bold text-dark mt-1">
                  <OdometerCounter value={currentTaxReport.ordinaryIncome} prefix="$" decimals={2} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SMART CONTRACTS & ONCHAIN VERIFICATION */}
      <section id="contracts" className="w-full bg-card border-b-2 border-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="bg-secondary border-2 border-dark rounded-none p-8 sm:p-12 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary px-3 py-1 border border-dark rounded-full text-xs font-semibold text-dark">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Onchain Verifiable Architecture</span>
                </div>
                <h2 className="hero-title text-3xl text-dark">Smart Contracts & Verification</h2>
                <p className="text-xs sm:text-sm text-dark/80 leading-relaxed">
                  Celalyze deploys immutable smart contracts on Celo Mainnet to register its agent identity and enable tamper-proof tax report attestations.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-xs text-dark">
                    <div className="w-5 h-5 rounded-full bg-primary border border-dark flex items-center justify-center text-dark flex-shrink-0">
                      <Brain className="w-3 h-3" />
                    </div>
                    <span><strong>AgentRegistry:</strong> Registered as Agent ID #0 on Celo Mainnet</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-dark">
                    <div className="w-5 h-5 rounded-full bg-primary border border-dark flex items-center justify-center text-dark flex-shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                    <span><strong>TaxReportAttestation:</strong> Publish keccak256 report hash on-chain</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-dark">
                    <div className="w-5 h-5 rounded-full bg-primary border border-dark flex items-center justify-center text-dark flex-shrink-0">
                      <Trophy className="w-3 h-3" />
                    </div>
                    <span>100% Verified Code on Sourcify & Celo Mainnet</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card border-2 border-dark rounded-none p-6 space-y-4">
                <div className="flex items-center gap-2 text-dark border-b border-dark/20 pb-3">
                  <Code2 className="w-4 h-4 text-dark" />
                  <span className="text-xs font-semibold text-dark uppercase tracking-wider">Verified Celo Contracts</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-secondary border border-dark rounded-none space-y-1">
                    <div className="text-dark/60 text-2xs font-sans uppercase font-bold">TaxReportAttestation</div>
                    <a
                      href="https://celoscan.io/address/0xB21D6470363e7d2E4a75d5386fA369E9FcB5BA6f"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark hover:underline font-semibold flex items-center gap-1 text-2xs sm:text-xs truncate"
                    >
                      <span>0xB21D6470...5BA6f</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="p-3 bg-secondary border border-dark rounded-none space-y-1">
                    <div className="text-dark/60 text-2xs font-sans uppercase font-bold">AgentRegistry</div>
                    <a
                      href="https://celoscan.io/address/0x60EeCE2904bBF0f4B8eD4ec35cD69658cAFeE1da"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark hover:underline font-semibold flex items-center gap-1 text-2xs sm:text-xs truncate"
                    >
                      <span>0x60EeCE29...eE1da</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>

                <p className="text-2xs text-dark/70 text-center font-sans">
                  Targeting Celo Hackathon Track 3 (Askbots) & Track 4 (Aigora)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CTA */}
      <section id="get-started" className="w-full bg-secondary">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24 text-center">
          <div className="bg-card border-2 border-dark rounded-none p-8 sm:p-12 space-y-6">
            <h2 className="hero-title text-3xl sm:text-4xl text-dark max-w-2xl mx-auto">
              Start with your first Celo wallet analysis.
            </h2>
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="flex items-center justify-center gap-2 bg-primary text-dark px-10 py-3.5 rounded-full text-xs font-semibold border border-dark hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <span>Get started now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-dark/60">
                No subscription required for basic portfolio scans. Read-only and secure.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
