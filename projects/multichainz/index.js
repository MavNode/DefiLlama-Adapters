const abi = {
  "getTokensForBorrowingArray": "function getTokensForBorrowingArray() view returns ((address tokenAddress, uint256 LTV, uint256 rate, string name, uint256 liquidationThreshold)[])",
  "getTokensForLendingArray": "function getTokensForLendingArray() view returns ((address tokenAddress, uint256 LTV, uint256 rate, string name, uint256 liquidationThreshold)[])",
  "getTotalTokenBorrowed": "function getTotalTokenBorrowed(address tokenAddress) view returns (uint256)",
}

const config = {
  plume: { pool: '0x8bd47bC14f38840820d1DC7eD5Eb57b85d2c7808', },
  plume_mainnet: { pool: '0x3AF7D19aAeCf142C91FF1A8575A316807a0f611A', },
}

Object.keys(config).forEach(chain => {
  const { pool } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (chain === 'plume') {
        // Deprecated chain, set tvl to 0
        return {};
      }
      const tokens = await getTokens(api)
      return api.sumTokens({ owner: pool, tokens })
    },
    borrowed: async (api) => {
      if (chain === 'plume') {
        // Deprecated chain, set borrowed to 0
        return {};
      }
      const tokens = await getTokens(api)
      const bals = await api.multiCall({ abi: abi.getTotalTokenBorrowed, calls: tokens, target: pool })
      api.add(tokens, bals)
    }
  }

  async function getTokens(api) {
    const tokenBorrowed = await api.call({ abi: abi.getTokensForBorrowingArray, target: pool })
    const tokenLending = await api.call({ abi: abi.getTokensForBorrowingArray, target: pool })
    return [...new Set(tokenLending.concat(tokenBorrowed).map(log => log.tokenAddress))]
  }
})
