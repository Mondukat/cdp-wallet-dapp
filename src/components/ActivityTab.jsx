import React, { useState, useEffect } from 'react'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import { CHAIN_META } from '../config/chains'
import { Panel, SectionLabel, Btn } from './UI'

function shortAddr(a) { return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—' }
function shortHash(h) { return h ? `${h.slice(0, 10)}…${h.slice(-8)}` : '—' }

function explorerUrl(chainId, hash) {
  const explorers = {
    1: 'https://etherscan.io/tx/',
    8453: 'https://basescan.org/tx/',
    137: 'https://polygonscan.com/tx/',
    10: 'https://optimistic.etherscan.io/tx/',
    42161: 'https://arbiscan.io/tx/',
    43114: 'https://snowtrace.io/tx/',
    56: 'https://bscscan.com/tx/',
    84532: 'https://sepolia.basescan.org/tx/',
  }
  return (explorers[chainId] || `https://blockscan.com/tx/`) + hash
}

export default function ActivityTab() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const chain = CHAIN_META[chainId]

  const [txns, setTxns] = useState([])
  const [loading, setLoading] = useState(false)
  const [blockNum, setBlockNum] = useState(null)
  const [error, setError] = useState('')

  const fetchActivity = async () => {
    if (!address || !publicClient) return
    setLoading(true)
    setError('')
    try {
      const latest = await publicClient.getBlockNumber()
      setBlockNum(latest.toString())

      // Fetch last 5 blocks of transactions involving this address
      const blocks = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          publicClient.getBlock({
            blockNumber: latest - BigInt(i),
            includeTransactions: true,
          })
        )
      )

      const relevant = blocks
        .flatMap(b => b.transactions || [])
        .filter(tx =>
          tx.from?.toLowerCase() === address.toLowerCase() ||
          tx.to?.toLowerCase() === address.toLowerCase()
        )
        .slice(0, 20)

      setTxns(relevant)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected) fetchActivity()
  }, [address, chainId, isConnected])

  if (!isConnected) {
    return (
      <Panel style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-head)', fontSize: '11px', letterSpacing: '0.15em' }}>
          CONNECT WALLET TO VIEW ACTIVITY
        </div>
      </Panel>
    )
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: chain?.color, fontSize: '13px' }}>{chain?.icon}</span>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '10px', color: chain?.color, letterSpacing: '0.1em' }}>
            {chain?.label}
          </span>
          {blockNum && (
            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
              block #{blockNum}
            </span>
          )}
        </div>
        <Btn small variant="ghost" onClick={fetchActivity} disabled={loading}>
          {loading ? 'scanning…' : '↻ refresh'}
        </Btn>
      </div>

      {error && (
        <div style={{ padding: '10px 12px', background: 'rgba(255,51,102,0.06)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: '11px', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      <Panel style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <SectionLabel>RECENT TRANSACTIONS (last 5 blocks)</SectionLabel>
        </div>

        {loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
            scanning chain…
          </div>
        )}

        {!loading && txns.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
            no recent transactions found in last 5 blocks
          </div>
        )}

        {txns.map((tx, i) => {
          const isOut = tx.from?.toLowerCase() === address.toLowerCase()
          const valueEth = tx.value ? (Number(tx.value) / 1e18).toFixed(6) : '0'
          return (
            <div
              key={tx.hash}
              style={{
                padding: '10px 16px',
                borderBottom: i < txns.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'grid',
                gridTemplateColumns: '60px 1fr 1fr auto',
                gap: '12px',
                alignItems: 'center',
                fontSize: '11px',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{
                background: isOut ? 'rgba(255,51,102,0.1)' : 'rgba(0,255,136,0.1)',
                border: `1px solid ${isOut ? 'rgba(255,51,102,0.3)' : 'rgba(0,255,136,0.3)'}`,
                color: isOut ? 'var(--red)' : 'var(--green)',
                borderRadius: '2px',
                padding: '2px 6px',
                fontFamily: 'var(--font-head)',
                fontSize: '9px',
                letterSpacing: '0.1em',
                textAlign: 'center',
              }}>
                {isOut ? 'OUT' : 'IN'}
              </span>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '10px', marginBottom: '2px' }}>
                  {isOut ? `to: ${shortAddr(tx.to)}` : `from: ${shortAddr(tx.from)}`}
                </div>
                <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {valueEth} ETH
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                {shortHash(tx.hash)}
              </div>
              <a
                href={explorerUrl(chainId, tx.hash)}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '12px' }}
              >
                ↗
              </a>
            </div>
          )
        })}
      </Panel>

      <div style={{ marginTop: '12px', fontSize: '10px', color: 'var(--muted)', textAlign: 'center' }}>
        showing wallet transactions from last 5 blocks only ·{' '}
        <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noreferrer" style={{ color: 'var(--muted)' }}>
          full history on explorer ↗
        </a>
      </div>
    </div>
  )
}
