import { createConfig, http } from 'wagmi'
import { coinbaseWallet } from 'wagmi/connectors'
import {
  mainnet, base, baseSepolia, polygon, polygonAmoy,
  optimism, arbitrum, avalanche, bsc, zora, gnosis,
  celo, scroll, linea, blast, mode, fraxtal,
} from 'wagmi/chains'

export const CDP_PROJECT_ID = 'd6b3ae4e-a17e-4f9e-8bc1-93bed560c96e'

export const SUPPORTED_CHAINS = [
  base, mainnet, polygon, optimism, arbitrum, avalanche,
  bsc, zora, gnosis, celo, scroll, linea, blast, mode,
  fraxtal, baseSepolia, polygonAmoy,
]

export const CHAIN_META = {
  [base.id]:        { color: '#0052FF', icon: '⬡', label: 'Base', testnet: false },
  [mainnet.id]:     { color: '#627EEA', icon: '⟠', label: 'Ethereum', testnet: false },
  [polygon.id]:     { color: '#8247E5', icon: '⬡', label: 'Polygon', testnet: false },
  [optimism.id]:    { color: '#FF0420', icon: '◎', label: 'Optimism', testnet: false },
  [arbitrum.id]:    { color: '#12AAFF', icon: '◈', label: 'Arbitrum', testnet: false },
  [avalanche.id]:   { color: '#E84142', icon: '▲', label: 'Avalanche', testnet: false },
  [bsc.id]:         { color: '#F0B90B', icon: '⬡', label: 'BNB Chain', testnet: false },
  [zora.id]:        { color: '#A855F7', icon: '◉', label: 'Zora', testnet: false },
  [gnosis.id]:      { color: '#04795B', icon: '◈', label: 'Gnosis', testnet: false },
  [celo.id]:        { color: '#35D07F', icon: '◎', label: 'Celo', testnet: false },
  [scroll.id]:      { color: '#EEB967', icon: '◎', label: 'Scroll', testnet: false },
  [linea.id]:       { color: '#61DFFF', icon: '◈', label: 'Linea', testnet: false },
  [blast.id]:       { color: '#FCFC03', icon: '◎', label: 'Blast', testnet: false },
  [mode.id]:        { color: '#DFFE00', icon: '⬡', label: 'Mode', testnet: false },
  [fraxtal.id]:     { color: '#00D4AA', icon: '◈', label: 'Fraxtal', testnet: false },
  [baseSepolia.id]: { color: '#0052FF', icon: '⬡', label: 'Base Sepolia', testnet: true },
  [polygonAmoy.id]: { color: '#8247E5', icon: '⬡', label: 'Polygon Amoy', testnet: true },
}

const transports = Object.fromEntries(
  SUPPORTED_CHAINS.map((c) => [c.id, http()])
)

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [
    coinbaseWallet({
      appName: 'CDP Wallet // n0b0dy',
      preference: 'all',
    }),
  ],
  transports,
})
