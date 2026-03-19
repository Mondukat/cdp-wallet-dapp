import React, { useState } from 'react'
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useBalance, useChainId } from 'wagmi'
import { parseEther, isAddress } from 'viem'
import { CHAIN_META } from '../config/chains'
import { Panel, SectionLabel, Btn, Divider } from './UI'

export default function SendTab() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const chain = CHAIN_META[chainId]

  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const { data: bal } = useBalance({ address, chainId })

  const {
    sendTransaction,
    data: txHash,
    isPending,
    error: sendError,
    reset,
  } = useSendTransaction()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const handleSend = () => {
    setError('')
    if (!isAddress(to)) { setError('invalid recipient address'); return }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { setError('invalid amount'); return }
    try {
      sendTransaction({ to, value: parseEther(amount) })
    } catch (e) {
      setError(e.message)
    }
  }

  const handleReset = () => { reset(); setTo(''); setAmount(''); setError('') }

  if (!isConnected) {
    return (
      <Panel style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-head)', fontSize: '11px', letterSpacing: '0.15em' }}>
          CONNECT WALLET TO SEND
        </div>
      </Panel>
    )
  }

  return (
    <div style={{ maxWidth: '560px' }} className="animate-in">
      <Panel>
        <SectionLabel>SEND TRANSACTION</SectionLabel>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ color: chain?.color || 'var(--text)', fontSize: '14px' }}>{chain?.icon}</span>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '10px', color: chain?.color || 'var(--text)', letterSpacing: '0.1em' }}>
            {chain?.label}
          </span>
          {bal && (
            <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: '11px' }}>
              bal: <span style={{ color: 'var(--accent)' }}>{parseFloat(bal.formatted).toFixed(6)} {bal.symbol}</span>
            </span>
          )}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-head)', letterSpacing: '0.1em', marginBottom: '6px' }}>
            RECIPIENT ADDRESS
          </label>
          <input
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="0x..."
            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          />
          {to && isAddress(to) && (
            <div style={{ fontSize: '10px', color: 'var(--green)', marginTop: '4px' }}>✓ valid address</div>
          )}
          {to && !isAddress(to) && (
            <div style={{ fontSize: '10px', color: 'var(--red)', marginTop: '4px' }}>✗ invalid address</div>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-head)', letterSpacing: '0.1em', marginBottom: '6px' }}>
            AMOUNT ({bal?.symbol || 'ETH'})
          </label>
          <div style={{ position: 'relative' }}>
            <input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.0"
              type="number"
              min="0"
              step="0.001"
            />
            {bal && (
              <button
                onClick={() => setAmount(parseFloat(bal.formatted).toFixed(6))}
                style={{
                  position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)',
                  borderRadius: '2px', padding: '2px 6px', color: 'var(--accent)',
                  fontSize: '10px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
                }}
              >
                MAX
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: '12px' }}>
            ✗ {error}
          </div>
        )}

        {sendError && (
          <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: '11px' }}>
            ✗ {sendError.shortMessage || sendError.message}
          </div>
        )}

        {txHash && (
          <div style={{ marginBottom: '12px', padding: '10px 12px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 'var(--radius)' }}>
            <div style={{ color: 'var(--green)', fontSize: '11px', marginBottom: '4px' }}>
              {isConfirming ? '⏳ confirming…' : isSuccess ? '✓ confirmed' : '✓ submitted'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text)', wordBreak: 'break-all' }}>
              {txHash}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          {isSuccess ? (
            <Btn variant="ghost" onClick={handleReset}>← new tx</Btn>
          ) : (
            <Btn
              variant="primary"
              onClick={handleSend}
              disabled={isPending || isConfirming}
              style={{ flex: 1 }}
            >
              {isPending ? 'CONFIRM IN WALLET…' : isConfirming ? 'CONFIRMING…' : 'SEND'}
            </Btn>
          )}
        </div>

        <Divider />
        <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: '1.8' }}>
          <div>✓ Smart Wallet: gas can be sponsored by CDP paymaster</div>
          <div>✓ EOA: standard on-chain tx with gas from connected wallet</div>
        </div>
      </Panel>
    </div>
  )
}
