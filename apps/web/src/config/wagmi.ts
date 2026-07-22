import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { celo, celoSepolia } from 'wagmi/chains'

const appName = import.meta.env.VITE_APP_NAME || 'Celalyze'
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '044651f655b882496d7d8188d64a3431'

export const wagmiConfig = getDefaultConfig({
  appName,
  projectId,
  chains: [celo, celoSepolia],
  ssr: false,
})
