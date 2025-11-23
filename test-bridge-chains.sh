#!/bin/bash

# Test Bridge Kit Supported Chains
# This will call the actual Bridge Kit SDK to verify Arc support

echo "=========================================="
echo "Testing Circle Bridge Kit Supported Chains"
echo "=========================================="
echo ""

echo "Fetching supported chains from Bridge Kit SDK..."
echo ""

# Call the API endpoint that queries the Bridge Kit directly
response=$(curl -s http://localhost:3001/api/bridge/info)

echo "Full Response:"
echo "$response" | jq '.'
echo ""

echo "=========================================="
echo "ARC SUPPORT CHECK:"
echo "=========================================="
hasArcSupport=$(echo "$response" | jq -r '.chains.hasArcSupport')
echo "Has Arc Support: $hasArcSupport"
echo ""

echo "=========================================="
echo "CELO SUPPORT CHECK:"
echo "=========================================="
hasCeloSupport=$(echo "$response" | jq -r '.chains.hasCeloSupport')
echo "Has Celo Support: $hasCeloSupport"
echo ""

echo "=========================================="
echo "TOTAL CHAINS:"
echo "=========================================="
totalChains=$(echo "$response" | jq -r '.chains.totalChains')
testnetCount=$(echo "$response" | jq -r '.chains.testnetCount')
mainnetCount=$(echo "$response" | jq -r '.chains.mainnetCount')
echo "Total Chains: $totalChains"
echo "Testnet Chains: $testnetCount"
echo "Mainnet Chains: $mainnetCount"
echo ""

echo "=========================================="
echo "ALL SUPPORTED CHAIN NAMES:"
echo "=========================================="
echo "$response" | jq -r '.chains.allChainNames[]'
echo ""

echo "=========================================="
echo "TESTNET CHAINS (detailed):"
echo "=========================================="
echo "$response" | jq '.chains.testnetChains'
echo ""

if [ "$hasArcSupport" = "false" ]; then
    echo "⛔ CONFIRMATION: Arc Testnet is NOT supported by Circle Bridge Kit"
else
    echo "✅ Arc Testnet IS supported!"
fi

if [ "$hasCeloSupport" = "false" ]; then
    echo "⛔ CONFIRMATION: Celo is NOT supported by Circle Bridge Kit"
else
    echo "✅ Celo IS supported!"
fi

