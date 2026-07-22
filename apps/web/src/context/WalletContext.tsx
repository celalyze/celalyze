import { createContext, useContext, type ReactNode } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit'

interface WalletContextType {
  isConnected: boolean
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
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()

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
