import "../styles/globals.css";
import { positions, Provider } from "react-alert";
import CustomAlertTemplate from "../scripts/alertTemplate";
import { AppProps } from "next/app";
import React, { FC, useMemo } from "react";
import "@fontsource/manrope";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import NewIndex from "../scripts/NewIndex";
import { RecoilRoot } from "recoil";
import { useRouter } from "next/router";
import { LicenseInfo } from "@mui/x-license-pro";
import { Analytics } from '@vercel/analytics/react';

LicenseInfo.setLicenseKey(
  "bb1c6224b364b28bda972038fb6730dfTz01MzQ2OSxFPTE2OTg4OTkxMDI0MTAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
);


// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

const options = {
  timeout: 0,
  position: positions.BOTTOM_CENTER,
};

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <>
      <RecoilRoot>
        <Provider template={CustomAlertTemplate} {...options}>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>

                  <NewIndex Component={Component} pageProps={pageProps} />

                <Analytics />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </Provider>
      </RecoilRoot>
    </>
  );
};

export default App;
