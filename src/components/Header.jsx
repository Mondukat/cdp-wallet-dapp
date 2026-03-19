import React, { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { CHAIN_META, SUPPORTED_CHAINS } from '../config/chains'
import { Btn } from './UI'

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ''
}

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span style={{ color: 'var(--muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
      {time.toUTCString().slice(17, 25)} UTC
    </span>
  )
}

export default function Header({ activeTab, setActiveTab }) {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [chainMenuOpen, setChainMenuOpen] = useState(false)

  const chain = CHAIN_META[chainId]
  const mainChains = SUPPORTED_CHAINS.filter(c => !CHAIN_META[c.id]?.testnet)
  const testChains = SUPPORTED_CHAINS.filter(c => CHAIN_META[c.id]?.testnet)

  const tabs = ['WALLETS', 'SEND', 'ACTIVITY', 'EOA GEN']

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontFamily: 'var(--font-head)',
            fontSize: '13px',
            letterSpacing: '0.15em',
            color: 'var(--accent)',
            textShadow: '0 0 12px rgba(0,229,255,0.5)',
          }}>
            ◈ CDP WALLET
          </span>
          <span style={{ color: 'var(--border2)', fontSize: '10px' }}>//</span>
          <span style={{ color: 'var(--muted)', fontSize: '10px', fontFamily: 'var(--font-head)', letterSpacing: '0.1em' }}>
            n0b0dy
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock />

          {isConnected && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setChainMenuOpen(o => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border2)',
                  borderRadius: 'var(--radius)',
                  padding: '5px 10px',
                  color: chain?.color || 'var(--text)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                <span>{chain?.icon}</span>
                <span>{chain?.label || `Chain ${chainId}`}</span>
                <span style={{ color: 'var(--muted)', fontSize: '9px' }}>▾</span>
              </button>

              {chainMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border2)',
                  borderRadius: 'var(--radius)',
                  minWidth: '180px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 200,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}>
                  <div style={{ padding: '6px 10px', fontSize: '10px', color: 'var(--muted)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-head)', letterSpacing: '0.1em' }}>
                    MAINNETS
                  </div>
                  {mainChains.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { switchChain({ chainId: c.id }); setChainMenuOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', padding: '7px 12px', textAlign: 'left',
                        background: c.id === chainId ? 'rgba(0,229,255,0.06)' : 'transparent',
                        color: c.id === chainId ? 'var(--accent)' : 'var(--text)',
                        fontSize: '12px', fontFamily: 'var(--font-mono)',
                        cursor: 'pointer', border: 'none', transition: 'background 0.1s',
                      }}
                    >
                      <span>{CHAIN_META[c.id]?.icon}</span>
                      <span>{CHAIN_META[c.id]?.label}</span>
                      {c.id === chainId && <span style={{ marginLeft: 'auto', fontSize: '9px' }}>●</span>}
                    </button>
                  ))}
                  <div style={{ padding: '6px 10px', fontSize: '10px', color: 'var(--muted)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-head)', letterSpacing: '0.1em' }}>
                    TESTNETS
                  </div>
                  {testChains.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { switchChain({ chainId: c.id }); setChainMenuOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', padding: '7px 12px', textAlign: 'left',
                        background: c.id === chainId ? 'rgba(0,229,255,0.06)' : 'transparent',
                        color: c.id === chainId ? 'var(--accent)' : 'var(--muted)',
                        fontSize: '12px', fontFamily: 'var(--font-mono)',
                        cursor: 'pointer', border: 'none',
                      }}
                    >
                      <span>{CHAIN_META[c.id]?.icon}</span>
                      <span>{CHAIN_META[c.id]?.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: 'rgba(0,255,136,0.08)',
                border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: 'var(--radius)',
                padding: '4px 10px',
                color: 'var(--green)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
              }}>
                ● {shortAddr(address)}
              </span>
              <Btn small variant="danger" onClick={() => disconnect()}>DISC</Btn>
            </div>
          ) : (
            <Btn
              variant="primary"
              onClick={() => connect({ connector: connectors[0] })}
            >
              CONNECT
            </Btn>
          )}
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', padding: '0 20px', gap: '0' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 16px',
              fontSize: '10px',
              fontFamily: 'var(--font-head)',
              letterSpacing: '0.12em',
              color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </header>
  )
}
