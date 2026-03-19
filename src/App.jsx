import React, { useState } from 'react'
import Header from './components/Header'
import WalletsTab from './components/WalletsTab'
import SendTab from './components/SendTab'
import ActivityTab from './components/ActivityTab'
import EOAGenTab from './components/EOAGenTab'

export default function App() {
  const [activeTab, setActiveTab] = useState('WALLETS')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, padding: '20px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'WALLETS'  && <WalletsTab />}
        {activeTab === 'SEND'     && <SendTab />}
        {activeTab === 'ACTIVITY' && <ActivityTab />}
        {activeTab === 'EOA GEN'  && <EOAGenTab />}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '10px',
        color: 'var(--muted)',
        fontFamily: 'var(--font-mono)',
      }}>
        <span>CDP WALLET // n0b0dy · project <span style={{ color: 'var(--border2)' }}>d6b3ae4e</span></span>
        <span>smart wallet · EOA · 17 chains</span>
      </footer>
    </div>
  )
}
