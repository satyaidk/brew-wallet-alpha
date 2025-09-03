"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useWalletInfo as useDefaultWalletInfo } from "@web3modal/wagmi/react";
import {
  useAccount as useDefaultAccount,
  useDisconnect as useDefaultDisconnect,
  useEnsName,
  useEnsAvatar,
} from "wagmi";
import { usePathname, useRouter } from "next/navigation";
import { loadPasskey, removePasskey } from "../utils/storage";
import { connectValidator } from "../logic/passkey";
import { getSmartAccountClient } from "../logic/permissionless";
import { normalize } from "viem/ens";
import useAccountStore from "../store/account/account.store";
import { getWebAuthnModule } from "../logic/module";
interface LoginContextProps {
  status: "loading"| "ready" | "notready",
  walletInfo: any;
  accountInfo: any;
  setWalletInfo: (info: any) => void;
  setAccountInfo: (info: any) => void;
  ensname: any;
  ensavatar: any;
  validator: any;
}
// Create the context
export const LoginContext = createContext<LoginContextProps>({
  status:  "loading",
  walletInfo: undefined,
  accountInfo: undefined,
  setWalletInfo: () => {},
  setAccountInfo: () => {},
  ensname: undefined,
  ensavatar: undefined,
  validator: undefined,
});

// Create the provider component
export const LoginProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const router = useRouter();

  const { chainId } = useAccountStore();
  const wallet = useDefaultWalletInfo();
  const account = useDefaultAccount();
  const [walletInfo, setWalletInfo] = useState<any>(
    wallet.walletInfo && !wallet.walletInfo.icon?.includes('data:') 
      ? wallet.walletInfo 
      : { name: "wallet", icon: "/icons/wallet.svg" }
  );
  const [walletStatus, setWalletStatus]= useState<"loading" | "ready" | "notready"> ("loading");
  const [accountInfo, setAccountInfo] = useState<any>(account);
  const [ensname, setEnsname] = useState<any>(undefined);
  const [ensavatar, setEnsavatar] = useState<any>(undefined);
  const [ validator, setValidator] = useState<any>(undefined);

  const { data: _ensname } = useEnsName({ address: accountInfo?.address });
  const { data: _ensavatar } = useEnsAvatar({ name: normalize(_ensname!) });

  useEffect(() => {
    setEnsname(_ensname);
    setEnsavatar(_ensavatar);
  }, [_ensavatar, _ensname]);

  useEffect(() => {
    // Update walletInfo when wallet.walletInfo changes, but avoid base64 data
    if (wallet.walletInfo && !wallet.walletInfo.icon?.includes('data:')) {
      setWalletInfo(wallet.walletInfo);
    }
  }, [wallet.walletInfo]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const passkey = loadPasskey();
        if (passkey && isMounted) {
          const _validator = await connectValidator(chainId.toString(), passkey);
          if (isMounted) {
            setValidator(_validator);
            setWalletStatus("ready");
          }
        }
      } catch (error) {
        console.error("Error connecting validator:", error);
        if (isMounted) {
          setWalletStatus("notready");
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [chainId]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const passkey = loadPasskey();
        if (passkey && !accountInfo?.address && isMounted) {
          const _validator = await connectValidator(chainId.toString(), passkey);
          const accountClient = await getSmartAccountClient({
            chainId: chainId.toString(),
            validators: [ await getWebAuthnModule(_validator) ],
          });
          
          if (isMounted) {
            setAccountInfo(accountClient.account);
            setWalletInfo({ name: "passkey", icon: "/icons/passkey-icon.svg" });
            setWalletStatus("ready");
          }
        } else if (!passkey && isMounted) {
          setWalletStatus("notready");
          // Handle wallet connection
          if (wallet.walletInfo && !wallet.walletInfo.icon?.includes('data:')) {
            setWalletInfo(wallet.walletInfo);
          } else {
            setWalletInfo({ name: "wallet", icon: "/icons/wallet.svg" });
          }
          if (account?.address) {
            setAccountInfo(account);
          }
        }
      } catch (error) {
        console.error("Error in login provider:", error);
        if (isMounted) {
          setWalletStatus("notready");
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [wallet?.walletInfo, account?.address, chainId]);

  useEffect(() => {
    if (!walletInfo && !loadPasskey()) {
      router.push("/");
    }
    if (walletInfo && pathname === "/") {
      router.push("/app");
    }
  }, [pathname, router, walletInfo]);

  return (
    <LoginContext.Provider
      value={{
        status: walletStatus,
        walletInfo,
        accountInfo,
        setWalletInfo,
        setAccountInfo,
        ensname,
        ensavatar,
        validator,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

// Custom hook to use the login context
export const useLoginProvider = () => {
  return useContext(LoginContext);
};

export const useWalletInfo = () => {
  return useContext(LoginContext);
};

export const useAccount = () => {
  return useContext(LoginContext).accountInfo;
};

export const useDisconnect = () => {
  const { disconnect: defaultDisconnect } = useDefaultDisconnect();
  const { setWalletInfo, setAccountInfo } = useContext(LoginContext);

  const disconnect = () => {
    defaultDisconnect();
    removePasskey();
    setWalletInfo(undefined);
    setAccountInfo({});
  };

  return { disconnect };
};