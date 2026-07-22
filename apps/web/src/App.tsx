import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import { wagmiConfig } from './config/wagmi'
import { WalletProvider } from './context/WalletContext'
import { Layout } from './components/Layout'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { TaxReportsPage } from './pages/TaxReportsPage'
import { HistoryPage } from './pages/HistoryPage'
import { ChatPage } from './pages/ChatPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme()}>
          <WalletProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="tax-reports" element={<TaxReportsPage />} />
                  <Route path="history" element={<HistoryPage />} />
                  <Route path="chat" element={<ChatPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </WalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
