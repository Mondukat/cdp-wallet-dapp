import React, { useState } from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { Panel, SectionLabel, Btn, Divider } from './UI'

function MaskReveal({ label, value, sensitive }) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{
      marginBottom: '10px',
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '10px 12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-head)', letterSpacing: '0.1em' }}>
          {label}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {sensitive && (
            <button
              onClick={() => setRevealed(r => !r)}
              style={{ fontSize: '11px', color: 'var(--yellow)', fontFamily: 'var(--font-mono)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {revealed ? '◉ hide' : '◎ reveal'}
            </button>
          )}
          <button
            onClick={copy}
            style={{ fontSize: '11px', color: copied ? 'var(--green)' : 'var(--muted)', fontFamily: 'var(--font-mono)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {copied ? '✓ copied' : '⎘ copy'}
          </button>
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: sensitive && !revealed ? 'transparent' : 'var(--text)',
        background: sensitive && !revealed ? 'var(--border)' : 'transparent',
        borderRadius: '2px',
        wordBreak: 'break-all',
        userSelect: sensitive && !revealed ? 'none' : 'text',
        transition: 'all 0.2s',
      }}>
        {value}
      </div>
    </div>
  )
}

export default function EOAGenTab() {
  const [wallets, setWallets] = useState([])
  const [count, setCount] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [warning, setWarning] = useState(true)

  const generate = () => {
    setGenerating(true)
    setTimeout(() => {
      const newWallets = Array.from({ length: count }, (_, i) => {
        const pk = generatePrivateKey()
        const account = privateKeyToAccount(pk)
        return {
          id: Date.now() + i,
          privateKey: pk,
          address: account.address,
          generatedAt: new Date().toISOString(),
        }
      })
      setWallets(prev => [...newWallets, ...prev])
      setGenerating(false)
    }, 100)
  }

  const clear = () => {
    if (confirm('clear all generated wallets from memory?')) setWallets([])
  }

  return (
    <div style={{ maxWidth: '680px' }} className="animate-in">

      {warning && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'rgba(255, 204, 0, 0.05)',
          border: '1px solid rgba(255, 204, 0, 0.3)',
          borderRadius: 'var(--radius)',
          fontSize: '11px',
          lineHeight: '1.8',
          color: 'var(--yellow)',
        }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '6px' }}>
            ⚠ SECURITY NOTICE
          </div>
          <div style={{ color: 'var(--text)' }}>
            Keys are generated <strong>locally in your browser</strong> using CSPRNG — never transmitted anywhere.
            Save private keys offline immediately. <strong>Do not screenshot on a compromised device.</strong>
          </div>
          <button onClick={() => setWarning(false)} style={{ marginTop: '8px', fontSize: '10px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            [dismiss]
          </button>
        </div>
      )}

      <Panel style={{ marginBottom: '16px' }}>
        <SectionLabel>EOA KEY GENERATOR</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0' }}>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-head)', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              COUNT
            </label>
            <input
              type="number"
              value={count}
              min={1} max={20}
              onChange={e => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              style={{ width: '80px' }}
            />
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
            <Btn variant="primary" onClick={generate} disabled={generating}>
              {generating ? 'GENERATING…' : `GENERATE ${count > 1 ? count + ' WALLETS' : 'WALLET'}`}
            </Btn>
            {wallets.length > 0 && (
              <Btn variant="danger" onClick={clear}>CLEAR ALL</Btn>
            )}
          </div>
        </div>
      </Panel>

      {wallets.map((w, i) => (
        <Panel key={w.id} style={{ marginBottom: '12px' }} className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.1em' }}>
              WALLET #{wallets.length - i}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
              {new Date(w.generatedAt).toLocaleTimeString()}
            </span>
          </div>

          <MaskReveal label="ADDRESS" value={w.address} sensitive={false} />
          <MaskReveal label="PRIVATE KEY" value={w.privateKey} sensitive={true} />

          <Divider />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: '↗ etherscan', url: `https://etherscan.io/address/${w.address}` },
              { label: '↗ basescan', url: `https://basescan.org/address/${w.address}` },
              { label: '↗ polygonscan', url: `https://polygonscan.com/address/${w.address}` },
            ].map(link => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '11px', color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </Panel>
      ))}

      {wallets.length === 0 && (
        <Panel style={{ textAlign: 'center', padding: '32px', border: '1px dashed var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
            no wallets generated yet
          </div>
        </Panel>
      )}
    </div>
  )
}
