import { useState, useEffect, useCallback } from "react";

// ─── CDP Client (inline — no import needed in artifact) ───────────────────────
const API_BASE = "/api/cdp";

async function cdpGet(path) {
  const res = await fetch(`${API_BASE}?path=${encodeURIComponent(path)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `CDP ${res.status}`);
  }
  return res.json();
}

async function cdpPost(path, body) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: "POST", path, body }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `CDP ${res.status}`);
  }
  return res.json();
}

async function listAccounts() {
  return cdpGet("/platform/v2/evm/accounts");
}

async function getTokenBalances(network, address) {
  return cdpGet(`/platform/v2/data/evm/token-balances/${network}/${address}?pageSize=20`);
}

async function listTrades(accountName) {
  return cdpGet(`/platform/v2/evm/accounts/${accountName}/trades`);
}

async function createTrade(accountName, trade) {
  return cdpPost(`/platform/v2/evm/accounts/${accountName}/trades`, trade);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shortAddr(addr) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatAmount(amount, decimals) {
  if (!amount) return "0";
  const val = parseFloat(amount) / Math.pow(10, decimals || 18);
  if (val === 0) return "0";
  if (val < 0.0001) return val.toExponential(2);
  if (val < 1) return val.toFixed(6);
  if (val < 1000) return val.toFixed(4);
  return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatUsd(amount, decimals, rate) {
  if (!amount || !rate) return null;
  const val = (parseFloat(amount) / Math.pow(10, decimals || 18)) * parseFloat(rate);
  if (val < 0.01) return null;
  return val.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

const NETWORKS = {
  base: { label: "Base", color: "#0052FF" },
  "base-mainnet": { label: "Base", color: "#0052FF" },
  ethereum: { label: "Ethereum", color: "#627EEA" },
  "ethereum-mainnet": { label: "Ethereum", color: "#627EEA" },
  polygon: { label: "Polygon", color: "#8247E5" },
  "polygon-mainnet": { label: "Polygon", color: "#8247E5" },
};

function netColor(network) {
  return NETWORKS[network]?.color || "#888";
}
function netLabel(network) {
  return NETWORKS[network]?.label || network;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NetworkBadge({ network }) {
  const color = netColor(network);
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 4, padding: "2px 8px", fontSize: 11,
      fontFamily: "'Space Mono', monospace", fontWeight: 700,
    }}>
      {netLabel(network)}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 20, height: 20, border: "2px solid rgba(255,255,255,0.1)",
      borderTop: "2px solid #00D4AA", borderRadius: "50%",
      animation: "spin 0.7s linear infinite", display: "inline-block",
    }} />
  );
}

function ErrorBanner({ msg, onRetry }) {
  return (
    <div style={{
      background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)",
      borderRadius: 10, padding: "12px 16px", display: "flex",
      justifyContent: "space-between", alignItems: "center", gap: 12,
    }}>
      <span style={{ fontSize: 13, color: "#FF6B6B" }}>⚠ {msg}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: "none", border: "1px solid rgba(255,107,107,0.4)",
          borderRadius: 6, color: "#FF6B6B", padding: "4px 12px",
          fontSize: 12, cursor: "pointer",
        }}>Retry</button>
      )}
    </div>
  );
}

function WalletCard({ account, selected, onSelect }) {
  const [copied, setCopied] = useState(false);
  const color = netColor(account.network);
  const isSelected = selected?.name === account.name;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const totalUsd = account.balances
    ? account.balances.reduce((sum, b) => {
        const usd = b.usdValue ? parseFloat(b.usdValue.replace(/[^0-9.]/g, "")) : 0;
        return sum + usd;
      }, 0)
    : null;

  return (
    <div onClick={() => onSelect(account)} style={{
      background: isSelected ? "rgba(0,212,170,0.05)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isSelected ? "rgba(0,212,170,0.35)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 12, padding: "16px 18px", cursor: "pointer",
      transition: "all 0.18s", position: "relative", overflow: "hidden",
    }}>
      {isSelected && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: 3, height: "100%",
          background: `linear-gradient(180deg, #00D4AA, ${color})`,
        }} />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 4 }}>
            {account.displayName || account.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#666", fontFamily: "'Space Mono', monospace" }}>
              {shortAddr(account.address)}
            </span>
            <button onClick={handleCopy} style={{
              background: "none", border: "none", cursor: "pointer",
              color: copied ? "#00D4AA" : "#555", fontSize: 11, padding: 0,
            }}>
              {copied ? "✓" : "⧉"}
            </button>
          </div>
        </div>
        <NetworkBadge network={account.network} />
      </div>

      {account.loadingBalances ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <Spinner /><span style={{ fontSize: 12, color: "#555" }}>Loading balances…</span>
        </div>
      ) : account.balances?.length > 0 ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {account.balances.slice(0, 3).map(b => (
              <div key={b.symbol}>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>{b.symbol}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ccc", fontFamily: "'Space Mono', monospace" }}>
                  {b.formatted}
                </div>
              </div>
            ))}
            {account.balances.length > 3 && (
              <div style={{ fontSize: 11, color: "#555", alignSelf: "flex-end" }}>
                +{account.balances.length - 3} more
              </div>
            )}
          </div>
          {totalUsd > 0 && (
            <div style={{ fontSize: 16, fontWeight: 800, color: "#00D4AA", fontFamily: "'Space Mono', monospace" }}>
              ${totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>No balances found</div>
      )}
    </div>
  );
}

function TradeModal({ account, onClose, onSuccess }) {
  const NATIVE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const tokens = [
    { symbol: "ETH", address: NATIVE },
    { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
    { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
  ];

  const [fromSymbol, setFromSymbol] = useState("USDC");
  const [toSymbol, setToSymbol] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fromToken = tokens.find(t => t.symbol === fromSymbol);
  const toToken = tokens.find(t => t.symbol === toSymbol);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError(null);
    try {
      // Amount in base units (USDC = 6 decimals, ETH = 18)
      const decimals = fromSymbol === "USDC" || fromSymbol === "USDT" ? 6 : 18;
      const baseAmount = (parseFloat(amount) * Math.pow(10, decimals)).toFixed(0);

      const result = await createTrade(account.name, {
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount: baseAmount,
        network: account.network,
        slippageBps: 50,
      });

      setSuccess(result);
      setTimeout(() => { onSuccess?.(); onClose(); }, 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "#0D1117", border: "1px solid rgba(0,212,170,0.3)",
        borderRadius: 16, padding: 28, width: 400, maxWidth: "92vw",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, color: "#fff", fontWeight: 700 }}>New Trade</h3>
            <div style={{ fontSize: 11, color: "#555", marginTop: 3, fontFamily: "'Space Mono', monospace" }}>
              {shortAddr(account.address)} · <NetworkBadge network={account.network} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        {/* From */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 10, color: "#555", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.1em" }}>From</label>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={fromSymbol} onChange={e => setFromSymbol(e.target.value)} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, color: "#fff", padding: "9px 10px", fontSize: 13, flex: "0 0 90px",
            }}>
              {tokens.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
            </select>
            <input type="number" placeholder="0.00" value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{
                flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#fff", padding: "9px 12px", fontSize: 16,
                fontFamily: "'Space Mono', monospace",
              }} />
          </div>
        </div>

        {/* Swap arrow */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <button onClick={() => { setFromSymbol(toSymbol); setToSymbol(fromSymbol); }} style={{
            background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.25)",
            borderRadius: "50%", width: 34, height: 34, color: "#00D4AA", cursor: "pointer", fontSize: 16,
          }}>⇅</button>
        </div>

        {/* To */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 10, color: "#555", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.1em" }}>To</label>
          <select value={toSymbol} onChange={e => setToSymbol(e.target.value)} style={{
            width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, color: "#fff", padding: "9px 12px", fontSize: 13,
          }}>
            {tokens.filter(t => t.symbol !== fromSymbol).map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
          </select>
        </div>

        {error && <div style={{ fontSize: 12, color: "#FF6B6B", background: "rgba(255,68,68,0.08)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>{error}</div>}
        {success && <div style={{ fontSize: 12, color: "#00D4AA", background: "rgba(0,212,170,0.08)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>✓ Trade submitted — {shortAddr(success.transactionHash || "")}</div>}

        <button onClick={handleTrade} disabled={loading || !amount} style={{
          width: "100%", background: loading ? "rgba(0,212,170,0.2)" : "linear-gradient(135deg, #00D4AA, #0052FF)",
          border: "none", borderRadius: 10, color: "#fff", padding: 13,
          fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {loading ? <><Spinner /> Submitting…</> : "Execute Trade"}
        </button>

        <p style={{ fontSize: 11, color: "#3a3a3a", textAlign: "center", marginTop: 10, marginBottom: 0 }}>
          Requires CDP_API_KEY_ID + CDP_API_KEY_SECRET in Vercel env vars
        </p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function CDPDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [trades, setTrades] = useState([]);
  const [tab, setTab] = useState("overview");
  const [showTrade, setShowTrade] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [error, setError] = useState(null);

  // Load accounts + their balances
  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAccounts();
      const rawAccounts = res.accounts || [];

      // Stub accounts with loading state
      const stubbed = rawAccounts.map(a => ({ ...a, loadingBalances: true, balances: [] }));
      setAccounts(stubbed);
      if (stubbed.length > 0) setSelected(stubbed[0]);

      // Fetch balances for each account in parallel
      const withBalances = await Promise.all(
        stubbed.map(async (a) => {
          try {
            const balRes = await getTokenBalances(a.network, a.address);
            const balances = (balRes.tokenBalances || [])
              .map(b => ({
                symbol: b.token.symbol,
                name: b.token.name,
                contractAddress: b.token.contractAddress,
                formatted: formatAmount(b.amount.amount, b.amount.decimals),
                raw: b.amount.amount,
                decimals: b.amount.decimals,
              }))
              .filter(b => b.formatted !== "0");
            return { ...a, loadingBalances: false, balances };
          } catch {
            return { ...a, loadingBalances: false, balances: [] };
          }
        })
      );

      setAccounts(withBalances);
      if (withBalances.length > 0) setSelected(withBalances[0]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load trades for selected account
  const loadTrades = useCallback(async (account) => {
    if (!account) return;
    setLoadingTrades(true);
    try {
      const res = await listTrades(account.name);
      setTrades(res.trades || []);
    } catch {
      setTrades([]);
    } finally {
      setLoadingTrades(false);
    }
  }, []);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);
  useEffect(() => { if (selected) loadTrades(selected); }, [selected, loadTrades]);

  const totalUsd = accounts.reduce((sum, a) => {
    if (!a.balances) return sum;
    // approximate — only counts tokens with known USD value
    return sum;
  }, 0);

  const tabs = ["overview", "wallets", "trades"];

  return (
    <div style={{ minHeight: "100vh", background: "#080B10", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select option { background: #1a1a2e; color: #fff; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade { animation: fadeIn 0.25s ease forwards; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(8,11,16,0.96)", position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #0052FF, #00D4AA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 900,
          }}>⬡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>CDP Dashboard</div>
            <div style={{ fontSize: 10, color: "#444", fontFamily: "'Space Mono', monospace" }}>Project e6ae87c9</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: loading ? "rgba(255,184,0,0.08)" : error ? "rgba(255,68,68,0.08)" : "rgba(0,212,170,0.08)",
            border: `1px solid ${loading ? "rgba(255,184,0,0.25)" : error ? "rgba(255,68,68,0.25)" : "rgba(0,212,170,0.25)"}`,
            borderRadius: 20, padding: "4px 12px",
          }}>
            {loading
              ? <><Spinner /><span style={{ fontSize: 12, color: "#FFB800", marginLeft: 4 }}>Loading</span></>
              : error
              ? <span style={{ fontSize: 12, color: "#FF6464" }}>⚠ API Error</span>
              : <><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4AA", boxShadow: "0 0 6px #00D4AA" }} /><span style={{ fontSize: 12, color: "#00D4AA" }}>{accounts.length} wallets</span></>
            }
          </div>
          <button onClick={loadAccounts} disabled={loading} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, color: "#888", padding: "5px 12px", fontSize: 12, cursor: "pointer",
          }}>↻ Refresh</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "12px 16px", fontSize: 13, fontWeight: 600,
            color: tab === t ? "#fff" : "#555",
            borderBottom: `2px solid ${tab === t ? "#00D4AA" : "transparent"}`,
            textTransform: "capitalize", letterSpacing: "0.02em", transition: "all 0.15s",
          }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: "22px 24px", maxWidth: 1100, margin: "0 auto" }}>
        {error && <div style={{ marginBottom: 20 }}><ErrorBanner msg={error} onRetry={loadAccounts} /></div>}

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="fade">
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Wallets", value: loading ? "—" : accounts.length, color: "#00D4AA" },
                { label: "Networks", value: loading ? "—" : [...new Set(accounts.map(a => a.network))].length, color: "#0052FF" },
                { label: "Recent Trades", value: loadingTrades ? "—" : trades.length, color: "#FFB800" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "18px 20px",
                }}>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Wallet list */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Server Wallets
                </h2>
                <button
                  onClick={() => { setTab("trades"); setShowTrade(true); }}
                  style={{
                    background: "linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,82,255,0.15))",
                    border: "1px solid rgba(0,212,170,0.35)", borderRadius: 8,
                    color: "#00D4AA", padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 700,
                  }}>
                  + New Trade
                </button>
              </div>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner /></div>
              ) : accounts.length === 0 ? (
                <div style={{ textAlign: "center", color: "#444", padding: 40, fontSize: 14 }}>
                  No accounts found — check your CDP API key
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {accounts.map(a => (
                    <WalletCard key={a.name} account={a} selected={selected} onSelect={setSelected} />
                  ))}
                </div>
              )}
            </div>

            {/* Selected wallet detail */}
            {selected && !selected.loadingBalances && selected.balances?.length > 0 && (
              <div>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                  Token Balances — {selected.displayName || selected.name}
                </h2>
                <div style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, overflow: "hidden",
                }}>
                  {selected.balances.map((b, i) => (
                    <div key={b.contractAddress || i} style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                      padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                      fontSize: 13, alignItems: "center",
                    }}>
                      <span style={{ fontWeight: 600, color: "#ddd" }}>{b.symbol}</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", color: "#aaa" }}>{b.formatted}</span>
                      <span style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono', monospace" }}>
                        {shortAddr(b.contractAddress)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── WALLETS ── */}
        {tab === "wallets" && (
          <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {accounts.map(a => (
              <div key={a.name} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "20px 22px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{a.displayName || a.name}</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#555" }}>{a.address}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <NetworkBadge network={a.network} />
                    <button onClick={() => { setSelected(a); setShowTrade(true); }} style={{
                      background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.25)",
                      borderRadius: 8, color: "#00D4AA", padding: "5px 12px",
                      fontSize: 12, cursor: "pointer", fontWeight: 600,
                    }}>Trade</button>
                  </div>
                </div>
                {a.loadingBalances ? (
                  <Spinner />
                ) : (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {a.balances?.map(b => (
                      <div key={b.contractAddress} style={{
                        background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 14px",
                      }}>
                        <div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>{b.symbol}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{b.formatted}</div>
                      </div>
                    ))}
                    {(!a.balances || a.balances.length === 0) && (
                      <span style={{ fontSize: 12, color: "#444" }}>No token balances</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TRADES ── */}
        {tab === "trades" && (
          <div className="fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {accounts.map(a => (
                  <button key={a.name} onClick={() => setSelected(a)} style={{
                    background: selected?.name === a.name ? "rgba(0,212,170,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selected?.name === a.name ? "rgba(0,212,170,0.3)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 8, color: selected?.name === a.name ? "#00D4AA" : "#888",
                    padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600,
                  }}>
                    {shortAddr(a.address)}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowTrade(true)} style={{
                background: "linear-gradient(135deg, #00D4AA, #0052FF)",
                border: "none", borderRadius: 10, color: "#fff",
                padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>+ New Trade</button>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, overflow: "hidden",
            }}>
              <div style={{
                display: "grid", gridTemplateColumns: "60px 1fr 1fr 80px 100px",
                padding: "9px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em",
              }}>
                {["Type", "From → To", "Tx Hash", "Status", "Date"].map(h => <span key={h}>{h}</span>)}
              </div>
              {loadingTrades ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 32 }}><Spinner /></div>
              ) : trades.length === 0 ? (
                <div style={{ textAlign: "center", color: "#444", padding: 32, fontSize: 13 }}>
                  No trades yet for this wallet
                </div>
              ) : (
                trades.map(t => (
                  <div key={t.id} style={{
                    display: "grid", gridTemplateColumns: "60px 1fr 1fr 80px 100px",
                    padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                    fontSize: 12, alignItems: "center",
                  }}>
                    <span style={{
                      background: t.fromAmount > t.toAmount ? "rgba(255,68,68,0.1)" : "rgba(0,212,170,0.1)",
                      color: t.fromAmount > t.toAmount ? "#FF6B6B" : "#00D4AA",
                      borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 800,
                      fontFamily: "'Space Mono', monospace", textAlign: "center",
                    }}>
                      TRADE
                    </span>
                    <span style={{ color: "#aaa", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
                      {shortAddr(t.fromToken)} → {shortAddr(t.toToken)}
                    </span>
                    <span style={{ color: "#555", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
                      {t.transactionHash ? shortAddr(t.transactionHash) : "—"}
                    </span>
                    <span style={{
                      color: t.status === "completed" ? "#00D4AA" : t.status === "failed" ? "#FF6464" : "#FFB800",
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    }}>
                      {t.status}
                    </span>
                    <span style={{ color: "#444", fontSize: 11 }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showTrade && selected && (
        <TradeModal
          account={selected}
          onClose={() => setShowTrade(false)}
          onSuccess={() => { loadTrades(selected); loadAccounts(); }}
        />
      )}
    </div>
  );
}
