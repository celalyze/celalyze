import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit'

interface WalletContextType {
  isConnected: boolean
  isMiniPay: boolean
  address: string | undefined
  shortAddress: string | undefined
  connectWallet: () => void
  openAccountModal: () => void
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect, connectors } = useConnect()
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()

  const [isMiniPay, setIsMiniPay] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum
      const provider = (window as any).provider
      const isMP = Boolean(ethereum?.isMiniPay || provider?.isMiniPay)
      setIsMiniPay(isMP)

      if (isMP && !isConnected) {
        const injectedConnector =
          connectors.find((c) => c.id === 'injected' || c.type === 'injected') || connectors[0]
        if (injectedConnector) {
          connect({ connector: injectedConnector })
        }
      }
    }
  }, [connect, connectors, isConnected])

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : undefined

  const connectWallet = () => {
    if (openConnectModal) {
      openConnectModal()
    }
  }

  const handleOpenAccountModal = () => {
    if (openAccountModal) {
      openAccountModal()
    }
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isMiniPay,
        address,
        shortAddress,
        connectWallet,
        openAccountModal: handleOpenAccountModal,
        disconnectWallet: disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
