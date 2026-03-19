import React, { useState } from 'react'
import {
  useAccount, useBalance, useChainId, usePublicClient,
} from 'wagmi'
import { CHAIN_META, SUPPORTED_CHAINS } from '../config/chains'
import { Panel, SectionLabel, Btn, Divider, Tag } from './UI'

function shortAddr(a) { return a ? `${a.slice(0, 8)}…${a.slice(-6)}` : '' }

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: copied ? 'var(--green)' : 'var(--muted)',
        fontSize: '11px', fontFamily: 'var(--font-mono)',
        padding: '0 4px', transition: 'color 0.15s',
      }}
    >
      {copied ? '✓ copied' : '⎘ copy'}
    </button>
  )
}

function BalanceRow({ chainId, address }) {
  const meta = CHAIN_META[chainId]
  const { data: bal, isLoading } = useBalance({ address, chainId })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 10px',
      borderBottom: '1px solid var(--border)',
      transition: 'background 0.1s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: meta?.color || 'var(--muted)', fontSize: '13px' }}>{meta?.icon}</span>
        <span style={{ color: 'var(--text)', fontSize: '12px' }}>{meta?.label}</span>
        {meta?.testnet && <Tag color="var(--yellow)">testnet</Tag>}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)' }}>
        {isLoading
          ? <span style={{ color: 'var(--muted)' }}>…</span>
          : bal
            ? `${parseFloat(bal.formatted).toFixed(6)} ${bal.symbol}`
            : <span style={{ color: 'var(--muted)' }}>—</span>
        }
      </div>
    </div>
  )
}

export default function WalletsTab() {
  const { address, isConnected, connector } = useAccount()
  const chainId = useChainId()
  const [showAll, setShowAll] = useState(false)

  const visibleChains = showAll
    ? SUPPORTED_CHAINS
    : SUPPORTED_CHAINS.filter(c => !CHAIN_META[c.id]?.testnet)

  if (!isConnected) {
    return (
      <Panel style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-head)', fontSize: '11px', letterSpacing: '0.15em', marginBottom: '8px' }}>
          NO WALLET CONNECTED
        </div>
        <div style={{ color: 'var(--border2)', fontSize: '12px' }}>
          tap CONNECT to link Smart Wallet or Coinbase Wallet
        </div>
      </Panel>
    )
  }

  const isSmartWallet = connector?.id === 'coinbaseWalletSDK'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">

      {/* Wallet identity */}
      <Panel>
        <SectionLabel>CONNECTED WALLET</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                fontFamily: 'var(--font-head)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: isSmartWallet ? 'var(--accent)' : 'var(--yellow)',
                background: isSmartWallet ? 'rgba(0,229,255,0.08)' : 'rgba(255,204,0,0.08)',
                border: `1px solid ${isSmartWallet ? 'rgba(0,229,255,0.3)' : 'rgba(255,204,0,0.3)'}`,
                borderRadius: '2px',
                padding: '2px 8px',
              }}>
                {isSmartWallet ? '◈ SMART WALLET' : '⬡ EOA WALLET'}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)', marginBottom: '4px' }}>
              {address}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CopyBtn text={address} />
              <span style={{ color: 'var(--border2)' }}>|</span>
              <a
                href={`https://basescan.org/address/${address}`}
                target="_blank" rel="noreferrer"
                style={{ color: 'var(--muted)', fontSize: '11px', textDecoration: 'none' }}
              >
                ↗ basescan
              </a>
              <span style={{ color: 'var(--border2)' }}>|</span>
              <a
                href={`https://etherscan.io/address/${address}`}
                target="_blank" rel="noreferrer"
                style={{ color: 'var(--muted)', fontSize: '11px', textDecoration: 'none' }}
              >
                ↗ etherscan
              </a>
            </div>
          </div>
        </div>

        {isSmartWallet && (
          <>
            <Divider />
            <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: '1.8' }}>
              <div>✓ <span style={{ color: 'var(--text)' }}>ERC-4337 Account Abstraction</span></div>
              <div>✓ <span style={{ color: 'var(--text)' }}>Gasless transactions (sponsored)</span></div>
              <div>✓ <span style={{ color: 'var(--text)' }}>Batch transactions</span></div>
              <div>✓ <span style={{ color: 'var(--text)' }}>Social / passkey recovery</span></div>
            </div>
          </>
        )}
      </Panel>

      {/* Multi-chain balances */}
      <Panel style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionLabel>BALANCES</SectionLabel>
          <Btn small variant="ghost" onClick={() => setShowAll(a => !a)}>
            {showAll ? 'hide testnets' : 'show testnets'}
          </Btn>
        </div>
        {visibleChains.map(c => (
          <BalanceRow key={c.id} chainId={c.id} address={address} />
        ))}
      </Panel>

    </div>
  )
}
