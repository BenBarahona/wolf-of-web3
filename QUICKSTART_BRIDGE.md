# Quick Start: Bridge Integration

This guide will help you quickly test the Circle Bridge Kit integration.

## Prerequisites

1. **Three Wallets with Testnet USDC**
   - Create Circle wallet via the app (`/wallet-setup`)
   - Get testnet USDC on Arc, Celo, and World chains

2. **Testnet Faucets**

   ```bash
   # Arc Testnet
   # Visit: https://faucet.arc.network

   # Celo Alfajores
   # Visit: https://faucet.celo.org

   # World Chain
   # Contact World Chain support for testnet tokens
   ```

3. **Environment Variables**
   Make sure you have set:
   ```bash
   NEXT_PUBLIC_LOW_RISK_VAULT_ADDRESS=<arc-vault-address>
   ```

## Quick Test Flow

### 1. Access the Bridge

Navigate to the bridge page:

```
http://localhost:3000/bridge
```

Or click the "Bridge" icon in the bottom navigation.

### 2. Select Chains

**Example 1: Low to High Risk**

- From: Arc L2 Testnet (Low Risk Lending)
- To: World Chain (High Risk Meme Index)
- Amount: 10 USDC

**Example 2: High to Medium Risk**

- From: World Chain (High Risk)
- To: Celo Alfajores (Medium Risk Staking)
- Amount: 5 USDC

### 3. Initiate Transfer

1. Enter amount (e.g., "10")
2. Optionally set recipient (or leave empty to send to yourself)
3. Click "Bridge USDC"
4. Enter your Circle wallet PIN when prompted
5. Wait for confirmation

### 4. Monitor Status

The UI will automatically update with:

- ✅ Transaction hash (source chain)
- ✅ Attestation hash (Circle)
- ✅ Status updates (pending → attested → completed)
- ⏱️ Estimated time: 15-25 minutes

### 5. Verify on Destination

Once completed:

1. Check your wallet balance on destination chain
2. You should see the bridged USDC
3. Now you can deposit into the destination vault

## Testing All Routes

Test all 6 possible routes:

```
Arc → Celo    (Low → Medium)
Arc → World   (Low → High)
Celo → Arc    (Medium → Low)
Celo → World  (Medium → High)
World → Arc   (High → Low)
World → Celo  (High → Medium)
```

## Common Issues

### Issue: "Wallet not connected"

**Solution**: Connect your Circle wallet first

### Issue: "Insufficient balance"

**Solution**: Get testnet USDC from faucets

### Issue: "Transfer taking too long"

**Solution**: CCTP transfers take 15-25 minutes. Check:

- Transaction on source chain explorer
- Circle attestation API for status

### Issue: "Transaction failed"

**Solution**: Check:

- Sufficient gas on source chain
- Valid recipient address
- Network connectivity

## View Bridge Transactions

### On Block Explorers

**Arc Explorer**

```
https://explorer.testnet.arc.network/tx/<transaction-hash>
```

**Celo Explorer**

```
https://alfajores.celoscan.io/tx/<transaction-hash>
```

**World Explorer**

```
https://worldscan.org/tx/<transaction-hash>
```

### Circle Attestation API

Check attestation status:

```bash
curl https://iris-api.circle.com/v1/attestations/<attestation-hash>
```

## Integration with Vaults

### After Bridge Completes

1. **Check Balance**
   - Balance should update on destination chain
   - Verify in wallet interface

2. **Deposit to Vault**
   - Navigate to dashboard
   - Select the destination chain's vault
   - Deposit your bridged USDC

3. **Track Performance**
   - Monitor your holdings across all chains
   - View consolidated portfolio

## Code Examples

### Use Bridge Hook

```typescript
import { useBridgeTransfer } from '@/lib/bridge';

function MyBridgeComponent() {
  const { transfer, status, isLoading } = useBridgeTransfer();

  const handleBridge = async () => {
    await transfer({
      sourceChainId: 5042002,      // Arc
      destinationChainId: 44787,    // Celo
      amount: '100',
      recipientAddress: '0x...',    // Optional
    });
  };

  return (
    <button onClick={handleBridge} disabled={isLoading}>
      {isLoading ? 'Bridging...' : 'Bridge USDC'}
    </button>
  );
}
```

### Check All Vaults

```typescript
import { getAllVaults } from '@/lib/contracts/multiChainVaults';

function VaultsList() {
  const vaults = getAllVaults();

  return (
    <div>
      {vaults.map((vault) => (
        <div key={vault.chainId}>
          <h3>{vault.vaultName}</h3>
          <p>Chain: {vault.chainName}</p>
          <p>Risk: {vault.riskLevel}</p>
        </div>
      ))}
    </div>
  );
}
```

### Get Vault by Risk

```typescript
import { getVaultsByRiskLevel } from "@/lib/contracts/multiChainVaults";

// Get all high-risk vaults
const highRiskVaults = getVaultsByRiskLevel("high");
```

## Next Steps

1. **Test Bridge Functionality**
   - Bridge small amounts first
   - Test all routes
   - Verify transactions

2. **Integrate with Dashboard**
   - Show bridge button on vault cards
   - Display multi-chain holdings
   - Add quick bridge shortcuts

3. **Add Advanced Features**
   - Bridge + Deposit in one flow
   - Portfolio rebalancing across chains
   - Automated risk management

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify transaction on block explorer
3. Check Circle attestation API
4. Review `BRIDGE_INTEGRATION.md` for details

## Monitoring

### Transaction Tracking

All bridge transactions store:

- `transactionHash`: Source chain transaction
- `attestationHash`: Circle attestation ID
- `status`: Current state
- `message`: Status description

### Logs

Check console logs for:

```
[Bridge] Initiating transfer...
[Bridge] Transaction submitted: 0x...
[Bridge] Attestation: 0x...
[Bridge] Status: completed
```

## Production Checklist

Before going to production:

- [ ] Test all bridge routes thoroughly
- [ ] Verify error handling
- [ ] Add transaction history
- [ ] Implement proper logging
- [ ] Add analytics tracking
- [ ] Test with real USDC (on mainnets)
- [ ] Monitor for failed transactions
- [ ] Set up alerts for stuck transfers
- [ ] Document support procedures
- [ ] Train support team on bridge flow

---

**Happy Bridging! 🌉**
