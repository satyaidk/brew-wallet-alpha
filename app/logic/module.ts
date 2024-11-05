import { Contract, dataSlice, formatUnits, getAddress, getBytes, id, Interface, parseUnits } from "ethers";
import { getJsonRpcProvider } from "./web3";
import TokenVault from "./TokenVault.json";
import {  Address, Hex, SendTransactionParameters, createPublicClient, encodeAbiParameters, pad, http, toHex, concat, toBytes, SignableMessage, Account, LocalAccount, encodePacked, toFunctionSelector } from "viem";
import {
    getClient,
    getModule,
    getAccount,
    installModule,
    isModuleInstalled,
    ModuleType
  } from "@rhinestone/module-sdk";
import { NetworkUtil } from "./networks";
import AutoDCAExecutor from "./AutoDCAExecutor.json";
import SessionValidator from "./SessionValidator.json";

import { SafeSmartAccountClient, getChain, getSmartAccountClient } from "./permissionless";
import { buildTransferToken, getRedeemBalance, getTokenDecimals, getVaultBalance, getVaultRedeemBalance, publicClient } from "./utils";
import { getDetails } from "./jobsAPI";
import { ENTRYPOINT_ADDRESS_V07, getPackedUserOperation, UserOperation, getUserOperationHash, getAccountNonce } from "permissionless";


export const webAuthnModule = "0xD990393C670dCcE8b4d8F858FB98c9912dBFAa06"
export const autoDCAExecutor = "0xD7945bbAB1A41a1C3736ED5b2411beA809a2ee2b"
export const sessionValidator = "0x8D4Bd3f21CfE07FeDe4320F1DA44F5d5d9b9952C"
export const spendLimitPolicy = "0x6a2246FbC8C61AE6F6f55f99C44A58933Fcf712d"

import { getChainId, signMessage as signMessageViem } from "viem/actions"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mode } from "viem/chains";


export interface Transaction {
  to: Hex;
  value: bigint;
  data: Hex;
}

export const getWebAuthnModule = async (validator: any) => {

  
  return { address: validator.address,
     context: await validator.getEnableData()}

}

export const getSessionData = async (chainId: string, sessionId: string): Promise<any> => {


  const provider = await getJsonRpcProvider(chainId)
  const  { address} = await getDetails()


  const autoDCA = new Contract(
      autoDCAExecutor,
      AutoDCAExecutor.abi,
      provider
  )

  const sesionData = await autoDCA.getJobData(address);
  return sesionData;
}


export const getAllJobs = async (chainId: string, safeAccount: string): Promise<any> => {


  const provider = await getJsonRpcProvider(chainId)

  const autoDCA = new Contract(
      autoDCAExecutor,
      AutoDCAExecutor.abi,
      provider
  )

  const jobData = await autoDCA.getJobData(safeAccount);
  return jobData;
}

async function  toWebAuthnAccount(chainId: number, walletProvider: any) {

  const client =  publicClient(chainId)

    const signMessage = ({ message }: { message: SignableMessage }): Promise<Hex> => {

      return  signMessageViem(client, { account: walletProvider, message:  message }) 
      

    }

    const signUserOperation = async (userOperation: UserOperation<"v0.7">) => {

      // let typedDataHash = getBytes(await entryPoint.getUserOpHash(getPackedUserOperation(userOperation)))
    
        // TODO: Include to track gas credit user operations
        // console.log(toHex('BREWITMONEY', { size: 16 }))
        // userOperation.callData = concat([
        //   userOperation.callData as `0x{string}`,
        //   toHex('BREWITMONEY', { size: 16 })
        // ]).toString() as `0x${string}`
    
    
        return await signMessage({ message:  {  raw: getUserOperationHash({ userOperation, entryPoint: ENTRYPOINT_ADDRESS_V07, chainId: chainId})  }}) 
       
        // return await signMessageViem({ message:  { raw: getUserOperationHash({ userOperation, entryPoint: ENTRYPOINT_ADDRESS_V07, chainId: chainId}) }})
      }

      const getDummySignature =  () => {

        return walletProvider.getDummySignature();
      }

  return {
    signMessage,
    signUserOperation,
    getDummySignature
  }

  }





export const sendTransaction = async (chainId: string, calls: Transaction[], walletProvider: any, safeAccount: Hex,
   type: 'passkey' | 'sessionkey' = 'passkey'): Promise<any> => {


    const key = BigInt(pad( webAuthnModule as Hex, {
        dir: "right",
        size: 24,
      }) || 0
    )


    const signingAccount =  type == "passkey" ? await toWebAuthnAccount(parseInt(chainId), walletProvider) : null;
    if (!signingAccount) {
      throw new Error('Signing account is undefined');
    }

    const smartAccount = await getSmartAccountClient({
      chainId,
      nonceKey: key,
      address: safeAccount,
      signUserOperation: signingAccount.signUserOperation,
      getDummySignature: signingAccount.getDummySignature,
      validators: type === "passkey" ? [await getWebAuthnModule(walletProvider)] : []
    });

    return await smartAccount.sendTransactions({ transactions: calls, account: smartAccount.account! });
}


export const buildVaultRedeem = async (chainId: string,  safeAccount: string, vault: Hex): Promise<Transaction> => {

    
  const provider = await getJsonRpcProvider(chainId);

  const vaultContract = new Contract(
      vault,
      TokenVault,
      provider
  )

  const vaultBalance = await getVaultRedeemBalance(vault, safeAccount, provider)

  return {
      to: vault,
      value: BigInt(0),
      data: (await vaultContract.redeem.populateTransaction(vaultBalance, safeAccount, safeAccount)).data as Hex
  }
}


export const buildAddSessionKey = async (chainId: string, safeAccount: Address): Promise<Transaction[]> => {

  const  { address } = await getDetails()
  const execCallData = new Interface(AutoDCAExecutor.abi).encodeFunctionData('executeJob', [0])
  const currentTime = Math.floor(Date.now()/1000)
  const sessionKeyData = { target: autoDCAExecutor as Hex, funcSelector: execCallData.slice(0, 10) as Hex, validAfter: 0, validUntil: currentTime + 86400, active: true }


  const provider = await getJsonRpcProvider(chainId);

  const sessionKeyValidator = new Contract(
       sessionValidator,
       SessionValidator.abi,
      provider
  )

  const calls: Transaction[] = []
  if(!await isInstalled(parseInt(chainId), safeAccount, sessionValidator, "validator")){

    calls.push(await buildInstallModule(parseInt(chainId), safeAccount, sessionValidator, "validator", "0x" ))

  }

  calls.push({
      to: sessionValidator,
      value: BigInt(0),
      data: (await sessionKeyValidator.enableSessionKey.populateTransaction(address, sessionKeyData)).data as Hex
  })
  return calls;
}

export const buildDCAJob = async (chainId: string,  safeAccount: Address, amount: string, validAfter: number, validUntil: number, refreshInterval: number, fromToken: string, targetToken: string, vault: string): Promise<Transaction[]> => {

    
  const provider = await getJsonRpcProvider(chainId);

  console.log(await getTokenDecimals(fromToken, provider))

  const parsedAmount = parseUnits(amount, await  getTokenDecimals(fromToken, provider))

  // NOTE: ValidAfter is 0 because of forked time issue
  const sessionData = { vault: vault, token: fromToken, targetToken: targetToken,  account: safeAccount, validAfter: 0, validUntil: validUntil, limitAmount: parsedAmount, refreshInterval: refreshInterval }

  const autoDCA = new Contract(
      autoDCAExecutor,
      AutoDCAExecutor.abi,
      provider
  )

  const calls: Transaction[] = []
  if(!await isInstalled(parseInt(chainId), safeAccount, autoDCAExecutor, "executor")){

    console.log("Installing new autoDCAExecutor")
    
    calls.push(await buildInstallModule(parseInt(chainId), safeAccount, autoDCAExecutor, "executor", "0x" ))

  }

  calls.push({
      to: autoDCAExecutor,
      value: BigInt(0),
      data: (await autoDCA.createJob.populateTransaction(sessionData)).data as Hex
  })

  return calls;
}



export const buildScheduleData = async (chainId: string,  jobId: number): Promise<Transaction> => {

    

  const execCallData = new Interface(AutoDCAExecutor.abi).encodeFunctionData('executeJob', [jobId])



  return {
      to: autoDCAExecutor,
      value: BigInt(0),
      data: execCallData as Hex
  }
}




export const buildInstallModule = async (chainId: number, safeAccount: Address, address: Address, type: ModuleType, initData: Hex): Promise<Transaction> => {


    const client = getClient({ rpcUrl: NetworkUtil.getNetworkById(chainId)?.url!});

    // Create the account object
    const account = getAccount({
            address: safeAccount,
            type: "safe",
        });


    const accountModule = getModule({
        module: address,
        initData: initData,
        type:  type,
      });

    const executions = await installModule({
        client,
        account,
        module: accountModule,
      });
  

      return {to: executions[0].target, value: BigInt(executions[0].value.toString()) , data: executions[0].callData}

}



export const isInstalled = async (chainId: number, safeAddress: Address, address: Address, type: ModuleType): Promise<boolean> => {



    const client = getClient({ rpcUrl: NetworkUtil.getNetworkById(chainId)?.url!});


    // Create the account object
    const account = getAccount({
            address: safeAddress,
            type: "safe",
        });


    const accountModule = getModule({
        module: address,
        initData: '0x',
        type:  type ,
      });

     
    try {  
    return await isModuleInstalled({
        client,
        account,
        module: accountModule,
      });
    }
    catch {
        return false;
    }

}
