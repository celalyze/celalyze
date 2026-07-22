import { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Wallet, LogOut, LayoutDashboard, FileText, History, Bot } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { Logo } from './Logo'

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isConnected, shortAddress, connectWallet, openAccountModal, disconnectWallet } = useWallet()

  // Scroll to top automatically on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  // Auto redirect effect based on Wallet connection state
  useEffect(() => {
    if (isConnected && location.pathname === '/') {
      navigate('/dashboard')
    } else if (!isConnected && location.pathname !== '/') {
      navigate('/')
    }
  }, [isConnected, location.pathname, navigate])

  // 1. Unconnected Navbar Items (4 Landing Page Section Links)
  const landingNavItems = [
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/#features', label: 'Features' },
    { href: '/#contracts', label: 'Smart Contracts' },
    { href: '/#get-started', label: 'Get Started' },
  ]

  // 2. Connected Navbar Items (App Pages) with Icons for Mobile Bottom Nav
  const appNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tax-reports', label: 'Tax Reports', icon: FileText },
    { path: '/history', label: 'History', icon: History },
    { path: '/chat', label: 'AI Chat', icon: Bot },
  ]

  const handleConnect = () => {
    connectWallet()
  }

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const sectionId = href.replace('/#', '')
      if (location.pathname !== '/') {
        navigate('/', { replace: false })
        setTimeout(() => {
          const el = document.getElementById(sectionId)
          el?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        const el = document.getElementById(sectionId)
        el?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-secondary text-dark flex flex-col font-sans">
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-50 border-b-2 border-dark bg-card px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Section Kiri: Direct Image Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <Logo size={32} />
            <span className="hero-title text-2xl font-normal text-dark">
              Celalyze
            </span>
          </Link>

          {/* Section Kanan: Links + Connect Wallet Button */}
          <div className="flex items-center gap-6">
            {!isConnected ? (
              /* --- NAVBAR MODE 1: UNCONNECTED WALLET --- */
              <nav className="hidden md:flex items-center gap-6">
                {landingNavItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleNavClick(item.href)}
                    className="text-sm font-medium text-dark/70 hover:text-dark transition-colors cursor-pointer bg-transparent border-none p-0"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            ) : (
              /* --- NAVBAR MODE 2: CONNECTED WALLET --- */
              <nav className="hidden md:flex items-center gap-6">
                {appNavItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path)

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`text-sm font-medium transition-colors no-underline ${
                        isActive
                          ? 'text-dark font-bold underline underline-offset-4 decoration-2 decoration-dark'
                          : 'text-dark/70 hover:text-dark'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            )}

            {/* RainbowKit Real Wallet Action Button */}
            {!isConnected ? (
              <button
                type="button"
                onClick={handleConnect}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-dark text-xs font-semibold border border-dark hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openAccountModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-dark text-xs font-semibold border border-dark hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{shortAddress}</span>
                </button>
                <button
                  type="button"
                  title="Disconnect Wallet"
                  onClick={disconnectWallet}
                  className="p-2 rounded-full bg-secondary border border-dark text-dark hover:bg-red-100 transition-colors cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${isConnected ? 'pb-20 md:pb-0' : ''}`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (Visible only when connected on small screens) */}
      {isConnected && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-dark md:hidden flex items-center justify-around py-3 px-4 shadow-lg">
          {appNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`p-2.5 rounded-full no-underline transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-dark border border-dark shadow-2xs'
                    : 'bg-transparent text-dark/70 hover:text-dark hover:bg-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
        </nav>
      )}

      {/* Proper Footer */}
      <footer className="border-t-2 border-dark bg-card pt-12 pb-28 md:pb-8 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand & Info */}
            <div className="space-y-3 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 no-underline">
                <Logo size={28} />
                <span className="hero-title text-xl font-normal text-dark">
                  Celalyze
                </span>
              </Link>
              <p className="text-xs text-dark/70 leading-relaxed">
                Onchain tax & portfolio insights for Celo wallets. Read-only, secure, and agentic.
              </p>
            </div>

            {/* Column 2: Product Navigation */}
            <div className="space-y-3">
              <p className="text-xs font-bold tracking-wider text-dark">Product</p>
              <ul className="space-y-2 text-xs text-dark/70 list-none p-0 m-0">
                <li>
                  <Link to="/dashboard" className="hover:text-dark transition-colors no-underline">Dashboard</Link>
                </li>
                <li>
                  <Link to="/tax-reports" className="hover:text-dark transition-colors no-underline">Tax Reports</Link>
                </li>
                <li>
                  <Link to="/history" className="hover:text-dark transition-colors no-underline">History & Labels</Link>
                </li>
                <li>
                  <Link to="/chat" className="hover:text-dark transition-colors no-underline">AI Assistant Chat</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Ecosystem */}
            <div className="space-y-3">
              <p className="text-xs font-bold tracking-wider text-dark">Ecosystem</p>
              <ul className="space-y-2 text-xs text-dark/70 list-none p-0 m-0">
                <li>
                  <span className="text-dark/80">Celo Protocol</span>
                </li>
                <li>
                  <span className="text-dark/80">GoldRush API Integration</span>
                </li>
                <li>
                  <span className="text-dark/80">Natural Language AI</span>
                </li>
                <li>
                  <span className="text-dark/80">Agentic Analytics Engine</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Status & Security */}
            <div className="space-y-3">
              <p className="text-xs font-bold tracking-wider text-dark">Network Status</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary border border-dark rounded-full text-xs font-medium text-dark">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Celo</span>
              </div>
              <p className="text-xs text-dark/60">
                100% read-only agent architecture. No private key storage or write operations.
              </p>
            </div>
          </div>

          {/* Bottom copyright line */}
          <div className="border-t border-dark/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-dark/60">
            <p>&copy; {new Date().getFullYear()} Celalyze. Onchain Tax & Portfolio Agent.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-dark transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-dark transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
