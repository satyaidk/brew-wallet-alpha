import { ethers } from 'ethers';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { Pool, computePoolAddress, FeeAmount } from '@uniswap/v3-sdk';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import { getJsonRpcProvider } from '../logic/web3';
import { getTokenDecimals } from '../logic/utils';

// Uniswap contracts addresses
const POOL_FACTORY_CONTRACT_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984'; // Uniswap V3 Factory
const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'; // Uniswap V3 Quoter

// Helper to get the amount of tokenB for a swap from tokenA
export async function getQuoteForSwap(
  chainId: number,
  tokenAAddress: string,
  tokenBAddress: string,
  amountIn: string,
  fee: FeeAmount = FeeAmount.MEDIUM
): Promise<string> {
  // Compute pool address

  console.log(tokenAAddress, tokenBAddress)

  const provider = await getJsonRpcProvider(
    chainId.toString()
  );
const tokenADecimals = Number(await getTokenDecimals(tokenAAddress, provider))
const tokenBDecimals = Number(await getTokenDecimals(tokenBAddress, provider))

console.log(tokenADecimals, tokenBDecimals)





const tokenA = new Token(chainId, tokenAAddress, tokenADecimals);  // Adjust decimals as needed (example: USDC has 6)
const tokenB = new Token(chainId, tokenBAddress, tokenBDecimals); // Adjust decimals as needed (example: WETH has 18)

  const poolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA,
    tokenB,
    fee,
  });

  // Reference the Pool contract
  const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI.abi, provider);

  // Fetch token and pool details
  const [token0, token1, liquidity, slot0] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  // Create a contract reference to the Quoter
  const quoterContract = new ethers.Contract(QUOTER_CONTRACT_ADDRESS, Quoter.abi, provider);

  // Get the quote (amount out) using quoteExactInputSingle
  const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
    tokenA.address,
    tokenB.address,
    fee,
    ethers.parseUnits(amountIn, tokenA.decimals).toString(),
    0
  );

  console.log(quotedAmountOut)

  // Return the quoted amount out in human-readable format
  return ethers.formatUnits(quotedAmountOut, tokenB.decimals);
}
