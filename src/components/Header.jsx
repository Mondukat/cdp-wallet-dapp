import React from 'react';

export default function Header({
  activeTab,
  onTabChange,
  walletAddress,
  onConnect,
  onDisconnect,
}) {
  const tabs = ['Dashboard', 'Tokens', 'NFTs', 'Activity'];

  return (
    <header
      style={{
        width: '100%',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Top Row: Logo + Wallet */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>CDP Wallet</h1>

        {/* Wallet Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {walletAddress && (
            <span
              style={{
                padding: '0.4rem 0.8rem',
                background: 'var(--bg-secondary)',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
              }}
            >
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          )}

          <button
            onClick={walletAddress ? onDisconnect : onConnect}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            {walletAddress ? 'Disconnect' : 'Connect Wallet'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          marginTop: '0.5rem',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              padding: '0.5rem 0',
              fontSize: '1rem',
              borderBottom:
                activeTab === tab
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </header>
  );
}


