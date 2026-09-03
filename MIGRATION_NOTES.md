# Migration to Wagmi v3 & Modern Stack

## Branch: `rebuild/modern-wagmi-v3`

This branch contains a complete modernization of the CDP Wallet DApp with all dependencies upgraded to latest stable versions.

### 🔄 Breaking Changes

#### Wagmi v2 → v3
- **`useSend()` → `useTransfer()`** - Hook renamed
- **`wallet.send()` → `wallet.transfer()`** - Action renamed
- **Parameter order changed** in transfer actions

**Before (v2):**
```javascript
const send = Hooks.wallet.useSend()
await Actions.wallet.send(config, {
  to: '0x...',
  token: '0x...',
  value: '1.5',
})
```

**After (v3):**
```javascript
const transfer = Hooks.wallet.useTransfer()
await Actions.wallet.transfer(config, {
  amount: '1.5',
  to: '0x...',
  token: '0x...',
})
```

#### Vite v6 → v8
- Removed Babel from @vitejs/plugin-react (oxc-based now)
- Improved build performance
- Requires Node.js 18+

### 📦 Updated Dependencies

```json
"wagmi": "^3.6.15",
"vite": "^8.0.16",
"@vitejs/plugin-react": "^6.0.2"
```

### ✅ Security Patches Included
- axios 1.17.0 (auth, proxy, header fixes)
- lodash 4.18.1 (prototype pollution)
- h3 1.15.9 (path traversal, SSE injection)
- hono 4.12.23 (compression, context exports)
- picomatch 2.3.2 (constructor exception)
- defu 6.1.6 (prototype pollution)
- follow-redirects 1.16.0 (sensitiveHeaders)

### 🚀 Quick Start

```bash
git checkout rebuild/modern-wagmi-v3
npm install
npm run dev
```

### 📝 What Still Needs to be Done

1. **Component Updates**: Search for `useSend` and `wallet.send()` in components and update to v3 API
2. **Test Wallets Tab**: Verify wallet connection and balance display
3. **Test Send Tab**: Verify transfer functionality with new API
4. **Test Activity Tab**: Check transaction history queries
5. **Test EOA Gen Tab**: Verify key generation
6. **Test CDP Dashboard**: Check Coinbase API interactions

### 🔗 Reference Links
- [Wagmi v3 Migration Guide](https://wagmi.sh/react/guides/migrate-from-v2-to-v3)
- [Vite v8 Release Notes](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md)
- [@vitejs/plugin-react v6](https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react%406.0.0)

### 🎯 Status

- ✅ Dependencies updated
- ✅ Configuration files migrated
- ⏳ Components need migration review
- ⏳ Testing required
- ⏳ Ready for PR and deployment
